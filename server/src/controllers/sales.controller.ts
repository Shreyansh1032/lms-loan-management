import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Application from '../models/Application';
import Loan from '../models/Loan';

// GET /api/sales/leads
// All borrowers with their current stage in the funnel
export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const borrowers = await User.find({ role: 'borrower' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const leads = await Promise.all(
      borrowers.map(async (borrower) => {
        const application = await Application.findOne({ userId: borrower._id }).lean();
        const loan = await Loan.findOne({ userId: borrower._id }).lean();

        // Determine what stage this lead is at
        let stage: string;
        if (!application) {
          stage = 'registered'; // signed up, no personal details yet
        } else if (application.breStatus === 'failed') {
          stage = 'bre_failed';
        } else if (!application.salarySlipUrl) {
          stage = 'awaiting_document';
        } else if (!loan) {
          stage = 'awaiting_application';
        } else {
          stage = loan.status; // applied / sanctioned / disbursed / closed / rejected
        }

        return {
          user: borrower,
          application: application
            ? {
                fullName: application.fullName,
                pan: application.pan,
                monthlySalary: application.monthlySalary,
                employmentMode: application.employmentMode,
                breStatus: application.breStatus,
                breRejectionReasons: application.breRejectionReasons,
                salarySlipUploaded: !!application.salarySlipUrl,
                createdAt: application.createdAt,
              }
            : null,
          loan: loan
            ? {
                id: loan._id,
                status: loan.status,
                principal: loan.principal,
                totalRepayment: loan.totalRepayment,
                createdAt: loan.createdAt,
              }
            : null,
          stage,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
