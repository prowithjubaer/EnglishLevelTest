'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, MessageCircle, Download, ExternalLink, Flame } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) return <p>Failed to load dashboard</p>;

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'bg-blue-500' },
    { label: "Today's Tests", value: stats.todayLeads, icon: FileText, color: 'bg-green-500' },
    { label: 'Hot Leads', value: stats.hotLeads, icon: Flame, color: 'bg-orange-500' },
    { label: 'Completed Tests', value: stats.completedAttempts, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'WhatsApp Clicks', value: stats.whatsappClicks, icon: MessageCircle, color: 'bg-green-600' },
    { label: 'Course Clicks', value: stats.courseClicks, icon: ExternalLink, color: 'bg-red-500' },
    { label: 'PDF Downloads', value: stats.pdfDownloads, icon: Download, color: 'bg-indigo-500' },
    { label: 'Avg Score', value: stats.averageScore, icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-navy">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Level Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Level Distribution</h3>
          {stats.levelDistribution && stats.levelDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.levelDistribution.map((item: any) => (
                <div key={item.level} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.level || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-red rounded-full"
                        style={{ width: `${(item.count / stats.completedAttempts) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-brand-navy mb-4">Goal Distribution</h3>
          {stats.goalDistribution && stats.goalDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.goalDistribution.map((item: any) => (
                <div key={item.goal} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.goal}</span>
                  <span className="text-sm font-semibold bg-gray-100 px-2 py-0.5 rounded">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-brand-navy mb-4">Conversion Funnel</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Started: {stats.totalAttempts}</span>
          <span className="text-gray-400">→</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">Completed: {stats.completedAttempts}</span>
          <span className="text-gray-400">→</span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">PDF: {stats.pdfDownloads}</span>
          <span className="text-gray-400">→</span>
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">Course Click: {stats.courseClicks}</span>
          <span className="text-gray-400">→</span>
          <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full">WhatsApp: {stats.whatsappClicks}</span>
        </div>
      </div>
    </div>
  );
}
