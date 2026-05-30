'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/admin/loans'),
    ]).then(([s, l]) => {
      setStats(s.data.stats);
      setLoans(l.data.loans);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    API.get(`/admin/loans?status=${filter}`).then(r => setLoans(r.data.loans));
  }, [filter]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  const STATUS_COLOR: Record<string, string> = {
    applied: 'bg-yellow-100 text-yellow-800',
    sanctioned: 'bg-blue-100 text-blue-800',
    disbursed: 'bg-purple-100 text-purple-800',
    closed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin — Overview</h1>
        <p className="text-gray-500 mt-1">Full system visibility</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Borrowers', value: stats.totalBorrowers, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
            { label: 'Total Applications', value: stats.totalApplications, color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
            { label: 'Active Loans', value: stats.loans.disbursed, color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
            { label: 'Collected', value: fmt(stats.totalPaymentsCollected), color: 'bg-green-50 border-green-200', text: 'text-green-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
              <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            ['Applied', stats.loans.applied, 'bg-yellow-50 text-yellow-700 border-yellow-200'],
            ['Sanctioned', stats.loans.sanctioned, 'bg-blue-50 text-blue-700 border-blue-200'],
            ['Disbursed', stats.loans.disbursed, 'bg-purple-50 text-purple-700 border-purple-200'],
            ['Closed', stats.loans.closed, 'bg-green-50 text-green-700 border-green-200'],
            ['Rejected', stats.loans.rejected, 'bg-red-50 text-red-700 border-red-200'],
          ].map(([l, v, c]) => (
            <div key={String(l)} className={`rounded-xl border p-4 text-center ${c}`}>
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-xs font-medium mt-1">{l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">All Loans</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="sanctioned">Sanctioned</option>
            <option value="disbursed">Disbursed</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Borrower', 'Amount', 'Tenure', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loans.map((loan: any) => (
              <tr key={loan._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{loan.applicationId?.fullName || loan.userId?.name}</p>
                  <p className="text-xs text-gray-400">{loan.userId?.email}</p>
                </td>
                <td className="px-4 py-3 font-medium">{fmt(loan.principal)}</td>
                <td className="px-4 py-3 text-gray-600">{loan.tenureInDays}d</td>
                <td className="px-4 py-3 font-medium">{fmt(loan.totalRepayment)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[loan.status]}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loans.length === 0 && <p className="text-center text-gray-400 py-8">No loans found.</p>}
      </div>
    </div>
  );
}
