import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats } from '../api';
import StatsBar from '../components/StatsBar';
import IssueMap from '../components/IssueMap';
import IssueTable from '../components/IssueTable';

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [issueData, statsData] = await Promise.all([
        fetchIssues(),
        fetchStats(),
      ]);
      setIssues(issueData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 tracking-tight">CivicLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">Infrastructure Dashboard</span>
          </div>
          <Link to="/" className="text-sm text-blue-600 hover:underline">Submit Report</Link>
        </div>
      </div>
      
      <div className="page-container space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Overview</h2>
          <span className="text-xs text-gray-400">Auto-refreshes every 10s</span>
        </div>

        {stats && <StatsBar stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 card overflow-hidden" style={{ minHeight: 380 }}>
            <IssueMap issues={issues} />
          </div>
          <div className="lg:col-span-2 card overflow-hidden">
            <IssueTable issues={issues} onRefresh={loadData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
