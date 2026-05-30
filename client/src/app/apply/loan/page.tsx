'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import StepIndicator from '@/components/StepIndicator';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LoanConfigPage() {
  const router = useRouter();
  const [principal, setPrincipal] = useState(100000);
  const [tenure, setTenure] = useState(90);
  const [si, setSi] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live SI calculation
  useEffect(() => {
    const interest = (principal * 12 * tenure) / (365 * 100);
    setSi(Math.round(interest * 100) / 100);
    setTotal(Math.round((principal + interest) * 100) / 100);
  }, [principal, tenure]);

  const handleApply = async () => {
    try {
      setLoading(true);
      setError('');
      await API.post('/borrower/apply', { principal, tenureInDays: tenure });
      router.push('/apply/status');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <StepIndicator current={3} />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Configure Your Loan</h2>
        <p className="text-gray-500 text-sm mb-8">Interest rate is fixed at 12% p.a. (Simple Interest)</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        {/* Principal Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="font-semibold text-gray-700">Loan Amount</label>
            <span className="text-2xl font-bold text-blue-600">{fmt(principal)}</span>
          </div>
          <input type="range" min={50000} max={500000} step={5000} value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>₹50,000</span><span>₹5,00,000</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="font-semibold text-gray-700">Tenure</label>
            <span className="text-2xl font-bold text-blue-600">{tenure} days</span>
          </div>
          <input type="range" min={30} max={365} step={5} value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>30 days</span><span>365 days</span>
          </div>
        </div>

        {/* Live Calculation Panel */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Repayment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Principal</span>
              <span className="font-semibold text-gray-900">{fmt(principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest Rate</span>
              <span className="font-semibold text-gray-900">12% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tenure</span>
              <span className="font-semibold text-gray-900">{tenure} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Simple Interest</span>
              <span className="font-semibold text-orange-600">{fmt(si)}</span>
            </div>
            <div className="border-t border-blue-200 pt-3 flex justify-between">
              <span className="font-bold text-gray-800">Total Repayment</span>
              <span className="font-bold text-xl text-blue-700">{fmt(total)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">SI = (P × R × T) / (365 × 100)</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
            ← Back
          </button>
          <button onClick={handleApply} disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-60">
            {loading ? 'Submitting...' : '🚀 Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
}