import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats, adminLogin, updateIssue } from '../api';
import StatsBar from '../components/StatsBar';
import IssueMap from '../components/IssueMap';
import IssueTable from '../components/IssueTable';
import StatusBadge, { SeverityBadge } from '../components/StatusBadge';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('civiclens_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [sortBy, setSortBy] = useState('Highest Priority');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await adminLogin(password);
      localStorage.setItem('civiclens_admin_token', res.token);
      setToken(res.token);
    } catch (err) {
      setLoginError('Invalid password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('civiclens_admin_token');
    setToken('');
    setIssues([]);
    setStats(null);
    setSelectedIssue(null);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [issueData, statsData] = await Promise.all([
        fetchIssues(),
        fetchStats(),
      ]);
      setIssues(issueData);
      setStats(statsData);
      
      // Update selected issue safely without triggering loops
      setSelectedIssue(prev => {
        if (!prev) return prev;
        const updated = issueData.find(i => i.id === prev.id);
        // Only return a new reference if the data actually changed
        if (updated && JSON.stringify(updated) !== JSON.stringify(prev)) {
          return updated;
        }
        return prev;
      });
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to load dashboard data', err);
    }
  }, [token]); // removed selectedIssue from deps to stop re-triggering intervals!

  useEffect(() => {
    if (token) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [token, loadData]);

  const filteredIssues = useMemo(() => {
    let filtered = issues;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        i.type.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.department.toLowerCase().includes(term) ||
        i.status.toLowerCase().includes(term) ||
        (i.note && i.note.toLowerCase().includes(term)) ||
        i.id.toString().includes(term)
      );
    }
    
    if (statusFilter !== 'All Statuses') {
      const statusMap = {
        'Reported': 'open',
        'Assigned': 'assigned',
        'In Progress': 'in_progress',
        'Resolved': 'resolved'
      };
      const mappedStatus = statusMap[statusFilter];
      if (mappedStatus) {
        filtered = filtered.filter(i => i.status === mappedStatus);
      }
    }
    
    if (deptFilter !== 'All Departments') {
      if (deptFilter === 'Unassigned') {
         filtered = filtered.filter(i => !i.department || i.department === 'General');
      } else {
         filtered = filtered.filter(i => i.department === deptFilter);
      }
    }
    
    // Sorting
    filtered = [...filtered]; 
    filtered.sort((a, b) => {
       if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
       if (sortBy === 'Oldest') return new Date(a.created_at) - new Date(b.created_at);
       if (sortBy === 'Highest Priority') return b.priority_score - a.priority_score;
       if (sortBy === 'Lowest Priority') return a.priority_score - b.priority_score;
       if (sortBy === 'Highest Severity') return b.severity - a.severity;
       if (sortBy === 'Lowest Severity') return a.severity - b.severity;
       return 0;
    });
    
    return filtered;
  }, [issues, searchTerm, statusFilter, deptFilter, sortBy]);

  // Cleanly close details if the selected issue is filtered out
  const isSelectedFilteredOut = selectedIssue && !filteredIssues.find(i => i.id === selectedIssue.id);
  useEffect(() => {
    if (isSelectedFilteredOut) setSelectedIssue(null);
  }, [isSelectedFilteredOut]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setDeptFilter('All Departments');
    setSortBy('Highest Priority');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'All Statuses' || deptFilter !== 'All Departments' || sortBy !== 'Highest Priority';

  const handleModalStatusChange = async (newStatus) => {
    if (!selectedIssue) return;
    try {
      const updated = await updateIssue(selectedIssue.id, { status: newStatus });
      setSelectedIssue(updated);
      loadData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-[360px] w-full p-8 space-y-8 shadow-sm">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CivicLens</h1>
            <h2 className="text-sm font-medium text-blue-600 uppercase tracking-widest">Admin Dashboard</h2>
            <p className="text-sm text-gray-500 pt-2">Sign in to manage reported infrastructure issues.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                className="input-field py-2.5"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" disabled={loginLoading} className="btn-primary w-full py-2.5 shadow-sm">
              {loginLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="text-center pt-2">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to public report</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 tracking-tight">CivicLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">Infrastructure Operations</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-600">System operational</span>
            </div>
            <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sign out</button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full flex-1">
        
        {/* Overview Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Infrastructure Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Current reported issues and response status.</p>
            </div>
            <span className="text-xs font-medium text-gray-400 hidden sm:inline-block">Auto-refreshes every 10s</span>
          </div>
          {stats ? (
            <StatsBar stats={stats} />
          ) : (
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse w-full"></div>
          )}
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full md:max-w-md relative">
            <input 
              type="text" 
              placeholder="Search issues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-md pl-10 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Statuses</option>
              <option>Reported</option>
              <option>Assigned</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="text-sm border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Departments</option>
              <option>Roads & Public Works</option>
              <option>Electricity Board</option>
              <option>Water & Drainage</option>
              <option>Sanitation</option>
              <option>Unassigned</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border-gray-300 rounded-md py-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Newest</option>
              <option>Oldest</option>
              <option>Highest Priority</option>
              <option>Lowest Priority</option>
              <option>Highest Severity</option>
              <option>Lowest Severity</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-900 px-2 font-medium">Clear filters</button>
            )}
          </div>
        </div>

        {/* Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Live Map</h3>
              <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Low</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High</div>
              </div>
            </div>
            <div className="card flex-1 shadow-sm overflow-hidden relative" style={{ minHeight: '500px' }}>
              <IssueMap issues={filteredIssues} onIssueClick={setSelectedIssue} />
            </div>
          </div>
          
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Priority Queue</h3>
                <p className="text-xs text-gray-500 mt-0.5">Highest-priority issues requiring attention.</p>
              </div>
              <span className="text-xs font-medium text-gray-500 pb-0.5">
                Showing {filteredIssues.length} of {issues.length} issues
              </span>
            </div>
            <div className="card shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
              <IssueTable issues={filteredIssues} onRefresh={loadData} onIssueClick={setSelectedIssue} />
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal Overlay */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Issue Details</h3>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {selectedIssue.image_url ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center min-h-[200px]">
                  <img src={selectedIssue.image_url} alt="Reported issue" className="w-full max-h-[400px] object-contain" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <span className="text-gray-400 text-sm font-medium">No image provided</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Issue Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedIssue.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status action</p>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleModalStatusChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="open">Reported</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {(!selectedIssue.department || selectedIssue.department === "General") ? (
                      <span className="text-amber-600 italic">Unassigned</span>
                    ) : (
                      selectedIssue.department
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Severity & Priority</p>
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={selectedIssue.severity} />
                    <span className="text-sm text-gray-500 tabular-nums">Score: {selectedIssue.priority_score.toFixed(1)}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-gray-100">{selectedIssue.description}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-600">Location:</span> {selectedIssue.lat}, {selectedIssue.lng}
                  </div>
                  <div className="text-xs text-gray-500 tabular-nums">
                    Reported on {new Date(selectedIssue.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedIssue(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
