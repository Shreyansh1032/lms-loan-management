export type UserRole =
  | 'admin'
  | 'sales'
  | 'sanction'
  | 'disbursement'
  | 'collection'
  | 'borrower';

export interface User {
  _id?: string; 
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface Application {
  id: string;
  fullName: string;
  pan: string;
  monthlySalary: number;
  employmentMode: string;
  breStatus: 'passed' | 'failed';
  breRejectionReasons: string[];
  salarySlipUploaded: boolean;
}

export interface Loan {
  _id: string;
  principal: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  status: 'applied' | 'sanctioned' | 'disbursed' | 'closed' | 'rejected';
  rejectionReason?: string;
  sanctionedAt?: string;
  disbursedAt?: string;
  userId?: { name: string; email: string };
  applicationId?: Application;
  createdAt: string;
}

export interface Payment {
  _id: string;
  utrNumber: string;
  amount: number;
  date: string;
  recordedBy: { name: string; email: string };
}

export interface Lead {
  user: User & { createdAt: string };
  application: Application | null;
  loan: Loan | null;
  stage: string;
}
