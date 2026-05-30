import mongoose, { Document, Schema } from 'mongoose';

export type LoanStatus = 'applied' | 'sanctioned' | 'disbursed' | 'closed' | 'rejected';

export interface ILoan extends Document {
  applicationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  principal: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  status: LoanStatus;
  rejectionReason?: string;
  sanctionedBy?: mongoose.Types.ObjectId;
  sanctionedAt?: Date;
  disbursedBy?: mongoose.Types.ObjectId;
  disbursedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    principal: { type: Number, required: true, min: 50000, max: 500000 },
    tenureInDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, default: 12 }, // fixed 12% p.a.
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['applied', 'sanctioned', 'disbursed', 'closed', 'rejected'],
      default: 'applied',
    },
    rejectionReason: { type: String, default: null },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sanctionedAt: { type: Date, default: null },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    disbursedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>('Loan', LoanSchema);
