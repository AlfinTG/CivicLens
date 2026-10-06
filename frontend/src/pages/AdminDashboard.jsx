import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats } from '../api';
import StatsBar from '../components/StatsBar';
import IssueMap from '../components/IssueMap';
import IssueTable from '../components/IssueTable';
import IssueDetailsModal from '../components/IssueDetailsModal';

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);

  // Filtering state
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

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

  // Client-side filtering
  const filteredIssues = issues.filter(issue => {
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && issue.severity.toString() !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        issue.type.replace(/_/g, ' ').toLowerCase().includes(q) ||
        issue.department.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 tracking-tight">CivicLens</span>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-sm font-semibold text-gray-700 block leading-tight">Infrastructure Dashboard</span>
              <span className="text-[10px] text-gray-500 hidden sm:block">Monitor, prioritize and resolve reported civic infrastructure issues.</span>
            </div>
          </div>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">Submit Report</Link>
        </div>
      </div>

      <div className="page-container space-y-5 flex-1 py-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">System Overview</h2>
          <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>

        {stats && <StatsBar stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 flex flex-col gap-3 order-2 lg:order-1">
            <div className="card overflow-hidden flex flex-col h-full shadow-sm" style={{ minHeight: 420 }}>
              <div className="bg-gray-50/80 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Live Issue Map</h3>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Low</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Med</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> High</span>
                </div>
              </div>
              <div className="flex-1 relative z-0 min-h-[300px]">
                <IssueMap issues={filteredIssues} onSelectIssue={setSelectedIssueId} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3 order-1 lg:order-2">
            {/* Filters */}
            <div className="card p-3 shadow-sm bg-white">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                    aria-label="Filter by Status"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1.5 bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                    aria-label="Filter by Severity"
                  >
                    <option value="all">All Sev</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden shadow-sm flex-1 bg-white">
              <div className="bg-gray-50/80 border-b border-gray-200 px-4 py-2.5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Prioritized Inbox ({filteredIssues.length})</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="priority">Sort: Priority</option>
                  <option value="newest">Sort: Newest</option>
                </select>
              </div>
              <div className="lg:max-h-[500px] lg:overflow-y-auto">
                <IssueTable
                  issues={filteredIssues}
                  sortBy={sortBy}
                  onSelectIssue={setSelectedIssueId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
