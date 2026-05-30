/**
 * Loan Calculator
 * Formula: SI = (P × R × T) / (365 × 100)
 * where P = principal, R = rate (12%), T = tenure in days
 * Total Repayment = P + SI
 */

export interface LoanCalculation {
  principal: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
}

export const calculateLoan = (
  principal: number,
  tenureInDays: number
): LoanCalculation => {
  const interestRate = 12; // fixed at 12% p.a.
  const simpleInterest = (principal * interestRate * tenureInDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;

  return {
    principal,
    tenureInDays,
    interestRate,
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
};
