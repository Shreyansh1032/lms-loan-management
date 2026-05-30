'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { Loan, Application } from '@/types';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_CONFIG = {
  applied:    { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Under Review', icon: '⏳' },
  sanctioned: { color: 'bg-blue-100 text-blue-800 border-blue-200',    label: 'Sanctioned', icon: '✅' },
  disbursed:  { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Disbursed', icon: '💰' },
  closed:     { color: 'bg-green-100 text-green-800 border-green-200',   label: 'Closed', icon: '🎉' },
  rejected:   { color: 'bg-red-100 text-red-800 border-red-200',        label: 'Rejected', icon: '❌' },
};

export default function StatusPage() {
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/borrower/status').then((res) => {
      setLoan(res.data.loan);
      setApplication(res.data.application);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  // No application at all
  if (!application) return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">👋</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
      <p className="text-gray-500 mb-6">Start your loan application to get funds quickly.</p>
      <Link href="/apply/personal"
        className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
        Start Application →
      </Link>
    </div>
  );

  const statusCfg = loan ? STATUS_CONFIG[loan.status] : null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Loan Status</h2>

      {/* Loan card */}
      {loan && statusCfg ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusCfg.color}`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
            <span className="text-xs text-gray-400">
              Applied: {new Date(loan.createdAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          {loan.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <strong>Rejection Reason:</strong> {loan.rejectionReason}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              ['Principal', fmt(loan.principal)],
              ['Tenure', `${loan.tenureInDays} days`],
              ['Interest Rate', `${loan.interestRate}% p.a.`],
              ['Simple Interest', fmt(loan.simpleInterest)],
              ['Total Repayment', fmt(loan.totalRepayment)],
              ['Total Paid', fmt(loan.totalPaid)],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Outstanding balance */}
          {loan.status === 'disbursed' && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm text-orange-700 font-medium">Outstanding Balance</p>
              <p className="text-2xl font-bold text-orange-800">{fmt(loan.outstandingBalance)}</p>
            </div>
          )}
        </div>
      ) : (
        /* BRE passed but no loan yet */
        application.breStatus === 'passed' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
            <p className="text-green-600 font-semibold mb-3">✅ Eligibility check passed!</p>
            {!application.salarySlipUploaded ? (
              <Link href="/apply/upload"
                className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                Upload Salary Slip →
              </Link>
            ) : (
              <Link href="/apply/loan"
                className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                Configure Loan →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="font-semibold text-red-700 mb-2">❌ Eligibility Check Failed</p>
              <ul className="space-y-1">
                {application.breRejectionReasons.map((r, i) => (
                  <li key={i} className="text-red-600 text-sm">• {r}</li>
                ))}
              </ul>
            </div>
            <Link href="/apply/personal"
              className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Update Details & Retry →
            </Link>
          </div>
        )
      )}
    </div>
  );
}