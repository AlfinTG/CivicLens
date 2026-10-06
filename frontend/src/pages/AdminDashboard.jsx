import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats, adminLogin } from '../api';
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
      
      // Update selected issue if it was refreshed
      if (selectedIssue) {
        const updated = issueData.find(i => i.id === selectedIssue.id);
        if (updated) setSelectedIssue(updated);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to load dashboard data', err);
    }
  }, [token, selectedIssue]);

  useEffect(() => {
    if (token) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [token, loadData]);

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
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full flex-1">
        
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
              <IssueMap issues={issues} onIssueClick={setSelectedIssue} />
            </div>
          </div>
          
          <div className="lg:col-span-2 flex flex-col space-y-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Priority Queue</h3>
              <p className="text-xs text-gray-500 mt-0.5">Highest-priority issues requiring attention.</p>
            </div>
            <div className="card shadow-sm overflow-hidden flex-1 flex flex-col bg-white">
              <IssueTable issues={issues} onRefresh={loadData} onIssueClick={setSelectedIssue} />
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
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <StatusBadge status={selectedIssue.status} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm text-gray-700 font-medium">{selectedIssue.department}</p>
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
