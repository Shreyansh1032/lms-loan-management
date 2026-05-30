'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function DisbursementPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLoans = () => {
    setLoading(true);
    API.get('/disbursement/loans').then(r => setLoans(r.data.loans)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleDisburse = async (id: string) => {
    try {
      setActionId(id);
      setError('');
      await API.put(`/disbursement/loans/${id}/disburse`);
      setSuccess('Loan disbursed successfully!');
      fetchLoans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disburse.');
    } finally { setActionId(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disbursement — Release Funds</h1>
        <p className="text-gray-500 mt-1">{loans.length} sanctioned loan(s) awaiting disbursement</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">{success}</div>}

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">No loans awaiting disbursement.</div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: any) => (
            <div key={loan._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{loan.applicationId?.fullName || loan.userId?.name}</h3>
                  <p className="text-sm text-gray-500">{loan.userId?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sanctioned: {loan.sanctionedAt ? new Date(loan.sanctionedAt).toLocaleDateString('en-IN') : '—'}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Sanctioned</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  ['Loan Amount', fmt(loan.principal)],
                  ['Tenure', `${loan.tenureInDays} days`],
                  ['Total Repayment', fmt(loan.totalRepayment)],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{l}</p>
                    <p className="font-semibold text-gray-900">{v}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleDisburse(loan._id)}
                disabled={actionId === loan._id}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-60">
                {actionId === loan._id ? 'Processing...' : '💸 Mark as Disbursed'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}