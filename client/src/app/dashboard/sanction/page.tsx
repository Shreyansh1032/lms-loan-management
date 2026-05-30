'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Loan } from '@/types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const fetchLoans = () => {
    setLoading(true);
    API.get('/sanction/loans').then(r => setLoans(r.data.loans)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      await API.put(`/sanction/loans/${id}/approve`);
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve.');
    } finally { setActionId(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionId(rejectModal.id);
      await API.put(`/sanction/loans/${rejectModal.id}/reject`, { rejectionReason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
      fetchLoans();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject.');
    } finally { setActionId(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sanction — Review Loans</h1>
        <p className="text-gray-500 mt-1">{loans.length} loan(s) pending review</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">No loans pending review.</div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: any) => (
            <div key={loan._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {loan.applicationId?.fullName || loan.userId?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{loan.userId?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">PAN: {loan.applicationId?.pan}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Applied</span>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  ['Principal', fmt(loan.principal)],
                  ['Tenure', `${loan.tenureInDays} days`],
                  ['Interest', fmt(loan.simpleInterest)],
                  ['Total', fmt(loan.totalRepayment)],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">{l}</p>
                    <p className="font-semibold text-gray-900 text-sm">{v}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(loan._id)}
                  disabled={actionId === loan._id}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60">
                  {actionId === loan._id ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => { setRejectModal({ id: loan._id }); setRejectReason(''); }}
                  disabled={actionId === loan._id}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition disabled:opacity-60">
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Loan</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || !!actionId}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
