interface Step {
  number: number;
  label: string;
}

const STEPS: Step[] = [
  { number: 1, label: 'Personal Details' },
  { number: 2, label: 'Upload Slip' },
  { number: 3, label: 'Loan Config' },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all
                ${current === step.number ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' :
                  current > step.number ? 'bg-green-500 border-green-500 text-white' :
                  'bg-white border-gray-300 text-gray-400'}`}
            >
              {current > step.number ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : step.number}
            </div>
            <span className={`mt-2 text-xs font-medium ${current >= step.number ? 'text-blue-700' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 mb-5 transition-all ${current > step.number ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
