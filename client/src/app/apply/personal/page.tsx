'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import API from '@/lib/api';
import StepIndicator from '@/components/StepIndicator';

interface PersonalForm {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
}

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [breError, setBreError] = useState<string[]>([]);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<PersonalForm>();

  const onSubmit = async (data: PersonalForm) => {
    try {
      setLoading(true);
      setBreError([]);
      setServerError('');
      await API.post('/borrower/personal-details', {
        ...data,
        monthlySalary: Number(data.monthlySalary),
      });
      router.push('/apply/upload');
    } catch (err: any) {
      if (err.response?.status === 422) {
        setBreError(err.response.data.rejectionReasons || []);
      } else {
        setServerError(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator current={1} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Personal Details</h2>
        <p className="text-gray-500 text-sm mb-6">We'll run an eligibility check after you submit.</p>

        {/* BRE Rejection */}
        {breError.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-red-700">Eligibility Check Failed</span>
            </div>
            <ul className="space-y-1">
              {breError.map((reason, i) => (
                <li key={i} className="text-red-600 text-sm flex items-start gap-2">
                  <span className="mt-0.5">•</span><span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('fullName', { required: 'Required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="As per PAN card" />
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input {...register('pan', { required: 'Required', pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format (e.g. ABCDE1234F)' } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition uppercase"
                placeholder="ABCDE1234F" maxLength={10} />
              {errors.pan && <p className="mt-1 text-xs text-red-600">{errors.pan.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" {...register('dob', { required: 'Required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
              <input type="number" {...register('monthlySalary', { required: 'Required', min: { value: 1, message: 'Must be positive' } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="50000" />
              {errors.monthlySalary && <p className="mt-1 text-xs text-red-600">{errors.monthlySalary.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Mode</label>
              <select {...register('employmentMode', { required: 'Required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="">Select...</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
              </select>
              {errors.employmentMode && <p className="mt-1 text-xs text-red-600">{errors.employmentMode.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60">
              {loading ? 'Checking eligibility...' : 'Check Eligibility & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}