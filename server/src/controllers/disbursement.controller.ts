import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Loan from '../models/Loan';

// GET /api/disbursement/loans
// All loans with status 'sanctioned'
export const getSanctionedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: 'sanctioned' })
      .populate('userId', 'name email')
      .populate('applicationId')
      .populate('sanctionedBy', 'name email')
      .sort({ sanctionedAt: -1 });

    res.status(200).json({ success: true, total: loans.length, loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/disbursement/loans/:id
export const getLoanDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('applicationId')
      .populate('sanctionedBy', 'name email');

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    res.status(200).json({ success: true, loan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// PUT /api/disbursement/loans/:id/disburse
// Status transition: sanctioned → disbursed
export const disburseLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'sanctioned') {
      res.status(400).json({
        success: false,
        message: `Invalid transition. Loan must be in 'sanctioned' state to disburse. Current status: '${loan.status}'.`,
      });
      return;
    }

    loan.status = 'disbursed';
    loan.disbursedBy = new mongoose.Types.ObjectId(req.user!.id);
    loan.disbursedAt = new Date();
    await loan.save();

    res.status(200).json({
      success: true,
      message: 'Loan disbursed successfully. Funds have been released.',
      loan: {
        id: loan._id,
        status: loan.status,
        disbursedAt: loan.disbursedAt,
        disbursedBy: loan.disbursedBy,
        totalRepayment: loan.totalRepayment,
        outstandingBalance: loan.outstandingBalance,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
