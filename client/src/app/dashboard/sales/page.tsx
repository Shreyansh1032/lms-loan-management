'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { Lead } from '@/types';

const STAGE_BADGE: Record<string, string> = {
  registered:          'bg-gray-100 text-gray-700',
  bre_failed:          'bg-red-100 text-red-700',
  awaiting_document:   'bg-yellow-100 text-yellow-700',
  awaiting_application:'bg-orange-100 text-orange-700',
  applied:             'bg-blue-100 text-blue-700',
  sanctioned:          'bg-indigo-100 text-indigo-700',
  disbursed:           'bg-purple-100 text-purple-700',
  closed:              'bg-green-100 text-green-700',
  rejected:            'bg-red-100 text-red-700',
};

const STAGE_LABEL: Record<string, string> = {
  registered: 'Registered',
  bre_failed: 'BRE Failed',
  awaiting_document: 'Awaiting Doc',
  awaiting_application: 'Awaiting Apply',
  applied: 'Applied',
  sanctioned: 'Sanctioned',
  disbursed: 'Disbursed',
  closed: 'Closed',
  rejected: 'Rejected',
};

export default function SalesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/sales/leads')
      .then(r => setLeads(r.data.leads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales — Lead Tracking</h1>
        <p className="text-gray-500 mt-1">{leads.length} borrowers in the funnel</p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">No leads yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Name', 'Email', 'Stage', 'Employment', 'Salary', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead, idx) => (
                <tr key={(lead.user as any)._id || String(idx)} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {lead.application?.fullName || lead.user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{lead.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STAGE_BADGE[lead.stage] || 'bg-gray-100 text-gray-700'}`}>
                      {STAGE_LABEL[lead.stage] || lead.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.application?.employmentMode || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.application ? `₹${lead.application.monthlySalary.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(lead.user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}