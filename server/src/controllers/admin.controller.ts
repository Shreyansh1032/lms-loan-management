import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Loan from '../models/Loan';
import Application from '../models/Application';
import Payment from '../models/Payment';

// GET /api/admin/loans?status=applied
// Admin can see ALL loans with optional status filter
export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const statusRaw = req.query.status;
    const status = Array.isArray(statusRaw) ? String(statusRaw[0]) : (statusRaw ? String(statusRaw) : undefined);
    const filter: any = status && status !== 'all' ? { status } : {};

    const loans = await Loan.find(filter)
      .populate('userId', 'name email')
      .populate('applicationId', 'fullName pan employmentMode')
      .populate('sanctionedBy', 'name')
      .populate('disbursedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: loans.length, loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/admin/users
// All users (executive + borrowers)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ role: 1, createdAt: -1 });
    res.status(200).json({ success: true, total: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/admin/stats
// Dashboard summary stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalBorrowers,
      totalApplications,
      appliedLoans,
      sanctionedLoans,
      disbursedLoans,
      closedLoans,
      rejectedLoans,
      totalPaymentsResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'borrower' }),
      Application.countDocuments(),
      Loan.countDocuments({ status: 'applied' }),
      Loan.countDocuments({ status: 'sanctioned' }),
      Loan.countDocuments({ status: 'disbursed' }),
      Loan.countDocuments({ status: 'closed' }),
      Loan.countDocuments({ status: 'rejected' }),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const totalPaymentsCollected = totalPaymentsResult[0]?.total ?? 0;

    res.status(200).json({
      success: true,
      stats: {
        totalBorrowers,
        totalApplications,
        loans: {
          applied: appliedLoans,
          sanctioned: sanctionedLoans,
          disbursed: disbursedLoans,
          closed: closedLoans,
          rejected: rejectedLoans,
          total: appliedLoans + sanctionedLoans + disbursedLoans + closedLoans + rejectedLoans,
        },
        totalPaymentsCollected,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};