import mongoose, { Document, Schema } from 'mongoose';

export type EmploymentMode = 'Salaried' | 'Self-Employed' | 'Unemployed';
export type BREStatus = 'passed' | 'failed';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl?: string;
  breStatus: BREStatus;
  breRejectionReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one application per borrower
    },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: {
      type: String,
      enum: ['Salaried', 'Self-Employed', 'Unemployed'],
      required: true,
    },
    salarySlipUrl: { type: String, default: null },
    breStatus: {
      type: String,
      enum: ['passed', 'failed'],
      default: 'failed',
    },
    breRejectionReasons: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
