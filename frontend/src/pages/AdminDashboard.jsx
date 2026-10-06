import { useState, useEffect, useCallback } from 'react';
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
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Dashboard</h1>
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
  );
}

export default AdminDashboard;
