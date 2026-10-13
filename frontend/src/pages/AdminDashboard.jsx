import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchIssues, fetchStats, adminLogin } from '../api';
import StatsBar from '../components/StatsBar';
import IssueMap from '../components/IssueMap';
import IssueTable from '../components/IssueTable';
import { IssueDetailsPanel } from '../components/IssueDetailsModal';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('civiclens_admin_token') || '');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Highest Priority');

  const searchInputRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await adminLogin(password);
      localStorage.setItem('civiclens_admin_token', res.token);
      setToken(res.token);
    } catch (err) {
      setLoginError('Invalid municipal admin credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('civiclens_admin_token');
    setToken('');
    setIssues([]);
    setStats(null);
    setSelectedIssueId(null);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [issueData, statsData] = await Promise.all([
        fetchIssues(),
        fetchStats(),
      ]);
      setIssues(issueData || []);
      setStats(statsData || null);
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

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
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
        Reported: 'open',
        Assigned: 'assigned',
        'In Progress': 'in_progress',
        Resolved: 'resolved',
      };
      const mapped = statusMap[statusFilter] || statusFilter.toLowerCase();
      filtered = filtered.filter((i) => i.status === mapped);
    }

    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter((i) => i.type === categoryFilter);
    }

    if (severityFilter === 'Critical (4 & 5)') {
      filtered = filtered.filter((i) => i.severity >= 4);
    }

    if (deptFilter !== 'All Departments') {
      if (deptFilter === 'Unassigned') {
        filtered = filtered.filter((i) => !i.department || i.department === 'General');
      } else {
        filtered = filtered.filter((i) => i.department === deptFilter);
      }
    }

    // Sorting
    filtered = [...filtered];
    filtered.sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'Highest Priority') return (b.priority_score || 0) - (a.priority_score || 0);
      if (sortBy === 'Lowest Priority') return (a.priority_score || 0) - (b.priority_score || 0);
      if (sortBy === 'Highest Severity') return (b.severity || 0) - (a.severity || 0);
      if (sortBy === 'Lowest Severity') return (a.severity || 0) - (b.severity || 0);
      return 0;
    });

    return filtered;
  }, [issues, searchTerm, statusFilter, categoryFilter, severityFilter, deptFilter, sortBy]);

  // Selected Issue Memo
  const selectedIssue = useMemo(() => {
    if (selectedIssueId != null) {
      const found = issues.find((i) => i.id === selectedIssueId);
      if (found) return found;
    }
    // Default to the first issue if available
    return filteredIssues.length > 0 ? filteredIssues[0] : null;
  }, [issues, selectedIssueId, filteredIssues]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setCategoryFilter('All Categories');
    setDeptFilter('All Departments');
    setSeverityFilter('All');
    setSortBy('Highest Priority');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    statusFilter !== 'All Statuses' ||
    categoryFilter !== 'All Categories' ||
    deptFilter !== 'All Departments' ||
    severityFilter !== 'All' ||
    sortBy !== 'Highest Priority';

  // Export CSV function
  const handleExportCSV = () => {
    if (!filteredIssues || filteredIssues.length === 0) return;
    const headers = ['ID', 'Type', 'Severity', 'Department', 'Status', 'Priority Score', 'Latitude', 'Longitude', 'Created At'];
    const rows = filteredIssues.map(i => [
      i.id,
      i.type,
      i.severity,
      `"${i.department || 'General'}"`,
      i.status,
      i.priority_score,
      i.lat,
      i.lng,
      `"${i.created_at}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicLens_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans text-on-surface">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-sm w-full p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-xs">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <h1 className="text-xl font-extrabold text-on-surface tracking-tight">
              CivicLens Municipal OS
            </h1>
            <p className="text-xs text-secondary max-w-xs">
              Restricted municipal access. Sign in to inspect real-time triage feeds and dispatch road crews.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-secondary mb-1">
                Admin Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter municipal authorization key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-error font-medium bg-error-container p-2.5 rounded-lg border border-error/20">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="btn-primary w-full py-2.5 font-bold shadow-xs"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Operations'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-outline-variant/20">
            <Link
              to="/"
              className="text-xs text-secondary hover:text-primary font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Public Incident Reporter</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex font-sans text-on-surface">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 z-40 lg:hidden backdrop-blur-2xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar (aside) */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Platform Name */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs">
                <span className="material-symbols-outlined text-lg">corporate_fare</span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-on-surface leading-tight">
                  CivicLens
                </span>
                <span className="text-2xs font-mono font-semibold text-secondary uppercase tracking-wider">
                  Municipal OS
                </span>
              </div>
            </div>

            <button
              type="button"
              className="lg:hidden text-secondary p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* System Live telemetry pill */}
          <div className="p-4">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-xs font-bold text-primary uppercase">
                  System Live
                </span>
              </div>
              <p className="font-mono text-2xs text-secondary leading-tight">
                AI Model Active • Leaflet Map Engine • SQLite Live
              </p>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1 text-xs font-semibold">
              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-on-primary shadow-xs font-bold cursor-default">
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Overview & Triage</span>
              </span>

              <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-lg">rule_folder</span>
                <span>All Issues ({issues.length})</span>
              </span>

              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">add_a_photo</span>
                <span>Citizen Portal (Submit)</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer instance info */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-base">location_city</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">Metro Municipal Hub</p>
              <p className="font-mono text-2xs text-secondary truncate">Instance: #MUNI-9042</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full max-w-lg">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-secondary hover:bg-surface-container"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Quick search input */}
            <div className="relative w-full flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-secondary text-base pointer-events-none">
                search
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search ticket #, street, classification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-12 rounded-lg bg-surface border border-outline-variant/40 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans"
              />
              <div className="absolute right-2.5 hidden sm:flex items-center pointer-events-none">
                <kbd className="font-mono text-2xs px-1.5 py-0.5 rounded bg-surface-container text-secondary border border-outline-variant/30">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/60 border border-outline-variant/30 text-xs font-semibold text-on-secondary-fixed">
              <span className="material-symbols-outlined text-sm">near_me</span>
              <span>District 4 North Sector</span>
            </div>

            <div className="h-6 w-px bg-outline-variant/30 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                EV
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-on-surface leading-tight">
                  Elena Vance
                </span>
                <span className="text-2xs text-secondary">Chief Coordinator</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary text-xs px-2.5 py-1.5 font-semibold text-secondary hover:text-error"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1720px] w-full mx-auto">
          {/* Top Action Ribbon */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-2xs uppercase tracking-wider text-secondary font-bold">
                  Overview
                </span>
                <span className="text-secondary opacity-40 font-mono">/</span>
                <span className="font-mono text-2xs uppercase tracking-wider text-primary font-bold">
                  Live Incident Monitor
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-2xs font-semibold">
                  DISTRICT #4 SYNC
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
                Metropolitan Infrastructure Operations
              </h1>
              <p className="text-xs sm:text-sm text-secondary">
                Real-time telemetry, automated civic sensor classification, and prioritized crew dispatch.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={loadData}
                className="btn-secondary text-xs px-3 py-2 font-semibold"
                title="Refresh feed"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Sync Now</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-secondary text-xs px-3 py-2 font-semibold text-primary border-primary/30"
              >
                <span className="material-symbols-outlined text-sm">file_download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Row */}
          {stats ? (
            <StatsBar stats={stats} />
          ) : (
            <div className="h-28 bg-surface-container-lowest rounded-xl border border-outline-variant/30 animate-pulse w-full" />
          )}

          {/* Workspace Split Layout: Map & Table on Left (lg:col-span-8), Selected Detail Drawer on Right (lg:col-span-4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Center-Left Column: Map & Filterable Table */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Interactive Cartographic Canvas */}
              <div className="h-[420px] w-full">
                <IssueMap
                  issues={filteredIssues}
                  onIssueClick={(issue) => setSelectedIssueId(issue.id)}
                  selectedIssueId={selectedIssue?.id}
                />
              </div>

              {/* Priority-Ranked Issue Table Section */}
              <div className="flex flex-col gap-3">
                {/* High-Level Filters Strip */}
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs border border-outline-variant/40 rounded-lg px-2.5 py-1.5 bg-surface-container-lowest text-on-surface font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option>All Statuses</option>
                      <option>Reported</option>
                      <option>Assigned</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>

                    {/* Department Filter */}
                    <select
                      value={deptFilter}
                      onChange={(e) => setDeptFilter(e.target.value)}
                      className="text-xs border border-outline-variant/40 rounded-lg px-2.5 py-1.5 bg-surface-container-lowest text-on-surface font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option>All Departments</option>
                      <option>Roads & Public Works</option>
                      <option>Electricity Board</option>
                      <option>Water & Drainage</option>
                      <option>Sanitation</option>
                      <option>Unassigned</option>
                    </select>

                    {/* Quick Severity 4&5 toggle chip */}
                    <button
                      type="button"
                      onClick={() =>
                        setSeverityFilter((prev) =>
                          prev === 'Critical (4 & 5)' ? 'All' : 'Critical (4 & 5)'
                        )
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                        severityFilter === 'Critical (4 & 5)'
                          ? 'bg-error-container text-error border border-error/30 font-bold'
                          : 'bg-surface-container text-secondary hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">warning</span>
                      <span>Severity 4 & 5</span>
                    </button>

                    {/* Sort Order */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-xs border border-outline-variant/40 rounded-lg px-2.5 py-1.5 bg-surface-container-lowest text-on-surface font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option>Highest Priority</option>
                      <option>Lowest Priority</option>
                      <option>Highest Severity</option>
                      <option>Lowest Severity</option>
                      <option>Newest</option>
                      <option>Oldest</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-secondary hover:text-error transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">clear_all</span>
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                {/* Table Component */}
                <IssueTable
                  issues={filteredIssues}
                  onRefresh={loadData}
                  onIssueClick={(issue) => setSelectedIssueId(issue.id)}
                  selectedIssueId={selectedIssue?.id}
                />
              </div>
            </div>

            {/* Right Column: Selected Issue Inspection Panel */}
            <div className="lg:col-span-4 flex flex-col gap-4 sticky top-20">
              <IssueDetailsPanel
                issue={selectedIssue}
                onClose={() => setSelectedIssueId(null)}
                onRefresh={loadData}
                isDrawer={true}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
