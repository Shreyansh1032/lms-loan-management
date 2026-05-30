/**
 * Business Rule Engine (BRE)
 * All eligibility checks for a loan application.
 * Lives on the SERVER - client-side checks are UI hints only, never trust.
 */

export interface BREInput {
  dob: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

export interface BREResult {
  passed: boolean;
  rejectionReasons: string[];
}

// Valid PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const getAgeInYears = (dob: Date): number => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const runBRE = (input: BREInput): BREResult => {
  const rejectionReasons: string[] = [];

  // Rule 1: Age must be between 23 and 50
  const age = getAgeInYears(input.dob);
  if (age < 23 || age > 50) {
    rejectionReasons.push(
      `Age must be between 23 and 50 years. Your age: ${age}`
    );
  }

  // Rule 2: Monthly salary >= ₹25,000
  if (input.monthlySalary < 25000) {
    rejectionReasons.push(
      `Monthly salary must be at least ₹25,000. Provided: ₹${input.monthlySalary.toLocaleString('en-IN')}`
    );
  }

  // Rule 3: PAN must match valid format
  if (!PAN_REGEX.test(input.pan.trim().toUpperCase())) {
    rejectionReasons.push(
      `PAN format is invalid. Expected format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)`
    );
  }

  // Rule 4: Applicant must not be Unemployed
  if (input.employmentMode === 'Unemployed') {
    rejectionReasons.push(
      `Unemployed applicants are not eligible for a loan.`
    );
  }

  return {
    passed: rejectionReasons.length === 0,
    rejectionReasons,
  };
};