import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ReportPage from './pages/ReportPage';
import AdminDashboard from './pages/AdminDashboard';

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
        active
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link to="/" className="text-base font-semibold text-gray-900 tracking-tight">
              CivicLens
            </Link>
            <div className="flex items-center gap-1">
              <NavLink to="/">Report</NavLink>
              <NavLink to="/admin">Dashboard</NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<ReportPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
