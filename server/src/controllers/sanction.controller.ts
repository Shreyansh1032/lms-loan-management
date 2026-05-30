import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Loan from '../models/Loan';

// GET /api/sanction/loans
// All loans with status 'applied'
export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'applied' })
      .populate('userId', 'name email')
      .populate('applicationId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: loans.length, loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/sanction/loans/:id
// Full details of a single loan for review
export const getLoanDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('userId', 'name email createdAt')
      .populate('applicationId');

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    res.status(200).json({ success: true, loan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// PUT /api/sanction/loans/:id/approve
// Status transition: applied → sanctioned
export const approveLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'applied') {
      res.status(400).json({
        success: false,
        message: `Invalid transition. Loan must be in 'applied' state to sanction. Current status: '${loan.status}'.`,
      });
      return;
    }

    loan.status = 'sanctioned';
    loan.sanctionedBy = new mongoose.Types.ObjectId(req.user!.id);
    loan.sanctionedAt = new Date();
    await loan.save();

    res.status(200).json({
      success: true,
      message: 'Loan sanctioned successfully.',
      loan: {
        id: loan._id,
        status: loan.status,
        sanctionedAt: loan.sanctionedAt,
        sanctionedBy: loan.sanctionedBy,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// PUT /api/sanction/loans/:id/reject
// Status transition: applied → rejected
export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === '') {
      res.status(400).json({ success: false, message: 'A rejection reason is required.' });
      return;
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'applied') {
      res.status(400).json({
        success: false,
        message: `Invalid transition. Loan must be in 'applied' state to reject. Current status: '${loan.status}'.`,
      });
      return;
    }

    loan.status = 'rejected';
    loan.rejectionReason = rejectionReason.trim();
    await loan.save();

    res.status(200).json({
      success: true,
      message: 'Loan rejected.',
      loan: {
        id: loan._id,
        status: loan.status,
        rejectionReason: loan.rejectionReason,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
