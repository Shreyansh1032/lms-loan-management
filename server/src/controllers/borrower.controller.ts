import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Application from '../models/Application';
import Loan from '../models/Loan';
import { runBRE } from '../utils/bre';
import { calculateLoan } from '../utils/loanCalculator';

// POST /api/borrower/personal-details
// Collects personal info, runs BRE, saves application
export const submitPersonalDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, pan, dob, monthlySalary, employmentMode } = req.body;
    const userId = req.user!.id;

    if (!fullName || !pan || !dob || monthlySalary === undefined || !employmentMode) {
      res.status(400).json({ success: false, message: 'All fields are required: fullName, pan, dob, monthlySalary, employmentMode.' });
      return;
    }

    // Block if user already has an active loan
    const existingLoan = await Loan.findOne({
      userId,
      status: { $in: ['applied', 'sanctioned', 'disbursed'] },
    });
    if (existingLoan) {
      res.status(400).json({
        success: false,
        message: `You already have an active loan (status: ${existingLoan.status}). Cannot create a new application.`,
      });
      return;
    }

    // Run BRE on the server
    const breResult = runBRE({
      dob: new Date(dob),
      monthlySalary: Number(monthlySalary),
      pan: pan.toString().trim().toUpperCase(),
      employmentMode,
    });

    // Upsert — allow re-submission if a previous BRE failed
    const application = await Application.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        userId: new mongoose.Types.ObjectId(userId),
        fullName: fullName.trim(),
        pan: pan.toString().trim().toUpperCase(),
        dob: new Date(dob),
        monthlySalary: Number(monthlySalary),
        employmentMode,
        breStatus: breResult.passed ? 'passed' : 'failed',
        breRejectionReasons: breResult.rejectionReasons,
        // Reset salary slip on re-submission so user must re-upload
        ...(breResult.passed ? {} : { salarySlipUrl: null }),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!breResult.passed) {
      res.status(422).json({
        success: false,
        message: 'Your application was rejected by our eligibility checks.',
        breStatus: 'failed',
        rejectionReasons: breResult.rejectionReasons,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Personal details saved successfully. All eligibility checks passed.',
      breStatus: 'passed',
      applicationId: application._id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/borrower/upload-slip
// Multer-handled file upload, links it to the application
export const uploadSalarySlip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const application = await Application.findOne({ userId });
    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found. Please complete personal details first.',
      });
      return;
    }

    if (application.breStatus !== 'passed') {
      res.status(400).json({
        success: false,
        message: 'Eligibility check has not passed. Cannot upload documents.',
      });
      return;
    }

    // Store relative URL served by express static
    application.salarySlipUrl = `/uploads/${req.file.filename}`;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Salary slip uploaded successfully.',
      fileUrl: application.salarySlipUrl,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/borrower/apply
// Final step: pick loan amount/tenure, create loan record
export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { principal, tenureInDays } = req.body;
    const userId = req.user!.id;

    if (principal === undefined || tenureInDays === undefined) {
      res.status(400).json({ success: false, message: 'principal and tenureInDays are required.' });
      return;
    }

    const amount = Number(principal);
    const tenure = Number(tenureInDays);

    if (isNaN(amount) || amount < 50000 || amount > 500000) {
      res.status(400).json({ success: false, message: 'Loan amount must be between ₹50,000 and ₹5,00,000.' });
      return;
    }
    if (isNaN(tenure) || tenure < 30 || tenure > 365) {
      res.status(400).json({ success: false, message: 'Tenure must be between 30 and 365 days.' });
      return;
    }

    // Verify application is complete
    const application = await Application.findOne({ userId });
    if (!application) {
      res.status(400).json({ success: false, message: 'Application not found. Complete all steps first.' });
      return;
    }
    if (application.breStatus !== 'passed') {
      res.status(400).json({ success: false, message: 'Eligibility check has not passed.' });
      return;
    }
    if (!application.salarySlipUrl) {
      res.status(400).json({ success: false, message: 'Salary slip not uploaded yet.' });
      return;
    }

    // Prevent duplicate loan
    const existingLoan = await Loan.findOne({ userId });
    if (existingLoan) {
      res.status(400).json({
        success: false,
        message: `A loan application already exists (status: ${existingLoan.status}).`,
      });
      return;
    }

    const calc = calculateLoan(amount, tenure);

    const loan = await Loan.create({
      applicationId: application._id,
      userId: new mongoose.Types.ObjectId(userId),
      principal: calc.principal,
      tenureInDays: calc.tenureInDays,
      interestRate: calc.interestRate,
      simpleInterest: calc.simpleInterest,
      totalRepayment: calc.totalRepayment,
      totalPaid: 0,
      outstandingBalance: calc.totalRepayment,
      status: 'applied',
    });

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully!',
      loan: {
        id: loan._id,
        principal: loan.principal,
        tenureInDays: loan.tenureInDays,
        interestRate: loan.interestRate,
        simpleInterest: loan.simpleInterest,
        totalRepayment: loan.totalRepayment,
        status: loan.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/borrower/status
// Borrower checks their own loan status
export const getLoanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const loan = await Loan.findOne({ userId })
      .populate('sanctionedBy', 'name email')
      .populate('disbursedBy', 'name email');

    const application = await Application.findOne({ userId });

    res.status(200).json({
      success: true,
      application: application
        ? {
            id: application._id,
            fullName: application.fullName,
            pan: application.pan,
            monthlySalary: application.monthlySalary,
            employmentMode: application.employmentMode,
            breStatus: application.breStatus,
            breRejectionReasons: application.breRejectionReasons,
            salarySlipUploaded: !!application.salarySlipUrl,
          }
        : null,
      loan: loan || null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/borrower/calculate?principal=100000&tenureInDays=90
// Live loan preview — no auth needed but we keep it behind auth for clean API design
export const calculatePreview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const principal = Number(req.query.principal);
    const tenureInDays = Number(req.query.tenureInDays);

    if (isNaN(principal) || isNaN(tenureInDays)) {
      res.status(400).json({ success: false, message: 'principal and tenureInDays query params required.' });
      return;
    }
    if (principal < 50000 || principal > 500000) {
      res.status(400).json({ success: false, message: 'Principal out of range.' });
      return;
    }
    if (tenureInDays < 30 || tenureInDays > 365) {
      res.status(400).json({ success: false, message: 'Tenure out of range.' });
      return;
    }

    const calc = calculateLoan(principal, tenureInDays);
    res.status(200).json({ success: true, ...calc });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
