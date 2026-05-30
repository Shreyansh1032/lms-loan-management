'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function CollectionPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [payments, setPayments] = useState<Record<string, any[]>>({});
  const [payForm, setPayForm] = useState<Record<string, { utrNumber: string; amount: string; date: string }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});

  const fetchLoans = () => {
    setLoading(true);
    API.get('/collection/loans').then(r => setLoans(r.data.loans)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const toggleExpand = async (loanId: string) => {
    if (expanded === loanId) { setExpanded(null); return; }
    setExpanded(loanId);
    if (!payments[loanId]) {
      const r = await API.get(`/collection/loans/${loanId}`);
      setPayments(p => ({ ...p, [loanId]: r.data.payments }));
    }
    if (!payForm[loanId]) {
      setPayForm(f => ({ ...f, [loanId]: { utrNumber: '', amount: '', date: new Date().toISOString().split('T')[0] } }));
    }
  };

  const handleRecord = async (loanId: string) => {
    const form = payForm[loanId];
    if (!form?.utrNumber || !form?.amount || !form?.date) {
      setErrors(e => ({ ...e, [loanId]: 'All fields are required.' })); return;
    }
    try {
      setSubmitting(loanId);
      setErrors(e => ({ ...e, [loanId]: '' }));
      const res = await API.post(`/collection/loans/${loanId}/payment`, {
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        date: form.date,
      });
      setSuccess(s => ({ ...s, [loanId]: res.data.message }));
      setPayForm(f => ({ ...f, [loanId]: { utrNumber: '', amount: '', date: new Date().toISOString().split('T')[0] } }));
      setPayments(p => ({ ...p, [loanId]: undefined as any })); // force refetch
      fetchLoans();
      setTimeout(() => setSuccess(s => ({ ...s, [loanId]: '' })), 4000);
    } catch (err: any) {
      setErrors(e => ({ ...e, [loanId]: err.response?.data?.message || 'Failed to record payment.' }));
    } finally { setSubmitting(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collection — Record Payments</h1>
        <p className="text-gray-500 mt-1">{loans.length} active loan(s)</p>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">No active loans.</div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: any) => (
            <div key={loan._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                onClick={() => toggleExpand(loan._id)}>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{loan.applicationId?.fullName || loan.userId?.name}</h3>
                    <p className="text-sm text-gray-500">{loan.userId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-semibold">{fmt(loan.totalRepayment)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Paid</p>
                    <p className="font-semibold text-green-600">{fmt(loan.totalPaid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Outstanding</p>
                    <p className="font-semibold text-orange-600">{fmt(loan.outstandingBalance)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {loan.status === 'closed' ? '✓ Closed' : 'Active'}
                  </span>
                  <span className="text-gray-400">{expanded === loan._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded panel */}
              {expanded === loan._id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  {/* Payment form */}
                  {loan.status === 'disbursed' && (
                    <div className="mb-5 p-4 bg-white rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 text-sm">Record New Payment</h4>
                      {errors[loan._id] && <p className="mb-3 text-red-600 text-xs">{errors[loan._id]}</p>}
                      {success[loan._id] && <p className="mb-3 text-green-600 text-xs font-medium">{success[loan._id]}</p>}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">UTR Number</label>
                          <input value={payForm[loan._id]?.utrNumber || ''}
                            onChange={(e) => setPayForm(f => ({ ...f, [loan._id]: { ...f[loan._id], utrNumber: e.target.value } }))}
                            placeholder="UTR123456789"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                          <input type="number" value={payForm[loan._id]?.amount || ''}
                            onChange={(e) => setPayForm(f => ({ ...f, [loan._id]: { ...f[loan._id], amount: e.target.value } }))}
                            placeholder="50000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date</label>
                          <input type="date" value={payForm[loan._id]?.date || ''}
                            onChange={(e) => setPayForm(f => ({ ...f, [loan._id]: { ...f[loan._id], date: e.target.value } }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                      </div>
                      <button onClick={() => handleRecord(loan._id)} disabled={submitting === loan._id}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition disabled:opacity-60">
                        {submitting === loan._id ? 'Recording...' : '+ Record Payment'}
                      </button>
                    </div>
                  )}

                  {/* Payment history */}
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-3">Payment History</h4>
                    {payments[loan._id]?.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase">
                            <th className="text-left pb-2">UTR</th>
                            <th className="text-left pb-2">Amount</th>
                            <th className="text-left pb-2">Date</th>
                            <th className="text-left pb-2">Recorded By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payments[loan._id].map((p: any) => (
                            <tr key={p._id}>
                              <td className="py-2 font-mono text-xs text-gray-700">{p.utrNumber}</td>
                              <td className="py-2 font-medium text-green-700">{fmt(p.amount)}</td>
                              <td className="py-2 text-gray-500">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                              <td className="py-2 text-gray-500">{p.recordedBy?.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-400 text-sm">No payments recorded yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
