import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats, adminLogin } from '../api';
import StatsBar from '../components/StatsBar';
import IssueMap from '../components/IssueMap';
import IssueTable from '../components/IssueTable';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('civiclens_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminLogin(password);
      localStorage.setItem('civiclens_admin_token', res.token);
      setToken(res.token);
    } catch (err) {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('civiclens_admin_token');
    setToken('');
    setIssues([]);
    setStats(null);
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
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to load dashboard data', err);
    }
  }, [token]);

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
        <div className="card max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CivicLens Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your password to access the dashboard.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                className="input-field"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" className="btn-primary w-full">Login</button>
          </form>
          <div className="text-center">
            <Link to="/" className="text-sm text-gray-500 hover:underline">← Back to public report form</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900 tracking-tight">CivicLens</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-600">Infrastructure Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-blue-600 hover:underline">Submit Report</Link>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
          </div>
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
