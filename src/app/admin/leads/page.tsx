'use client';

import { useEffect, useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [page, search]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', search });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'WhatsApp', 'Email', 'Goal', 'Level', 'Score', 'Date'];
    const rows = leads.map(l => [
      l.name,
      l.whatsapp,
      l.email || '',
      l.goal,
      l.attempts?.[0]?.level || 'N/A',
      l.attempts?.[0]?.weightedScore || 'N/A',
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-export.csv';
    a.click();
  };

  const isHotLead = (lead: any) => {
    return lead.actions?.some((a: any) => 
      ['whatsapp_clicked', 'course_link_clicked'].includes(a.actionType)
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-brand-navy">Leads ({total})</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Goal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No leads yet</td></tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isHotLead(lead) && <span className="text-orange-500 text-xs">🔥</span>}
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.whatsapp}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.goal}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        lead.attempts?.[0]?.level === 'Beginner' ? 'bg-red-100 text-red-700' :
                        lead.attempts?.[0]?.level === 'Basic' ? 'bg-orange-100 text-orange-700' :
                        lead.attempts?.[0]?.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        lead.attempts?.[0]?.level === 'Upper Intermediate' ? 'bg-green-100 text-green-700' :
                        lead.attempts?.[0]?.level === 'Advanced' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {lead.attempts?.[0]?.level || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{lead.attempts?.[0]?.weightedScore || '-'}</td>
                    <td className="px-4 py-3">
                      {lead.attempts?.[0]?.status === 'completed' ? (
                        <span className="text-green-600 text-xs">✓ Completed</span>
                      ) : lead.attempts?.length > 0 ? (
                        <span className="text-yellow-600 text-xs">In Progress</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No Test</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
