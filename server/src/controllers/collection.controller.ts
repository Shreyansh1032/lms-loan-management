import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import Loan from '../models/Loan';
import Payment from '../models/Payment';

// GET /api/collection/loans
// Disbursed loans (active) + closed loans for history
export const getDisbursedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    // Default: show disbursed. Pass ?status=closed or ?status=all for more.
    let filter: object;
    if (status === 'all') {
      filter = { status: { $in: ['disbursed', 'closed'] } };
    } else if (status === 'closed') {
      filter = { status: 'closed' };
    } else {
      filter = { status: 'disbursed' };
    }

    const loans = await Loan.find(filter)
      .populate('userId', 'name email')
      .populate('applicationId', 'fullName pan')
      .populate('disbursedBy', 'name email')
      .sort({ disbursedAt: -1 });

    res.status(200).json({ success: true, total: loans.length, loans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// GET /api/collection/loans/:id
// Loan detail + full payment history
export const getLoanWithPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('applicationId', 'fullName pan monthlySalary')
      .populate('disbursedBy', 'name email');

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    const payments = await Payment.find({ loanId: loan._id })
      .populate('recordedBy', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      loan,
      payments,
      summary: {
        totalRepayment: loan.totalRepayment,
        totalPaid: loan.totalPaid,
        outstandingBalance: loan.outstandingBalance,
        paymentCount: payments.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/collection/loans/:id/payment
// Record a borrower payment; auto-close loan when fully repaid
export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { utrNumber, amount, date } = req.body;
    const loanId = req.params.id;

    // --- Input validation ---
    if (!utrNumber || amount === undefined || !date) {
      res.status(400).json({ success: false, message: 'utrNumber, amount, and date are required.' });
      return;
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      res.status(400).json({ success: false, message: 'Payment amount must be a positive number.' });
      return;
    }

    // --- Load loan ---
    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan not found.' });
      return;
    }

    if (loan.status !== 'disbursed') {
      res.status(400).json({
        success: false,
        message: `Cannot record payment for a loan with status '${loan.status}'. Only disbursed loans accept payments.`,
      });
      return;
    }

    // --- UTR uniqueness check (belt-and-suspenders; DB index handles the rest) ---
    const existingPayment = await Payment.findOne({ utrNumber: utrNumber.trim().toUpperCase() });
    if (existingPayment) {
      res.status(409).json({
        success: false,
        message: `UTR number '${utrNumber}' is already recorded. Duplicate payment rejected.`,
      });
      return;
    }

    // --- Amount validation: must not exceed outstanding ---
    if (paymentAmount > loan.outstandingBalance + 0.01) {
      // small epsilon for floating-point tolerance
      res.status(400).json({
        success: false,
        message: `Payment ₹${paymentAmount} exceeds outstanding balance ₹${loan.outstandingBalance.toFixed(2)}.`,
      });
      return;
    }

    // --- Record payment ---
    const payment = await Payment.create({
      loanId: new mongoose.Types.ObjectId(loanId as string),
      utrNumber: utrNumber.trim().toUpperCase(),
      amount: paymentAmount,
      date: new Date(date),
      recordedBy: new mongoose.Types.ObjectId(req.user!.id),
    });

    // --- Update loan balance ---
    loan.totalPaid = Math.round((loan.totalPaid + paymentAmount) * 100) / 100;
    loan.outstandingBalance = Math.round((loan.totalRepayment - loan.totalPaid) * 100) / 100;

    // --- Auto-close when fully paid ---
    const TOLERANCE = 0.01; // handle floating point edge
    if (loan.outstandingBalance <= TOLERANCE) {
      loan.status = 'closed';
      loan.outstandingBalance = 0;
    }

    await loan.save();

    const isClosed = loan.status === 'closed';

    res.status(201).json({
      success: true,
      message: isClosed
        ? '🎉 Payment recorded. Loan fully repaid and automatically closed!'
        : 'Payment recorded successfully.',
      payment: {
        id: payment._id,
        utrNumber: payment.utrNumber,
        amount: payment.amount,
        date: payment.date,
      },
      loanSummary: {
        id: loan._id,
        status: loan.status,
        totalRepayment: loan.totalRepayment,
        totalPaid: loan.totalPaid,
        outstandingBalance: loan.outstandingBalance,
      },
    });
  } catch (error: any) {
    // Catch duplicate key error from MongoDB index
    if (error.code === 11000) {
      res.status(409).json({ success: false, message: 'UTR number already exists.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
