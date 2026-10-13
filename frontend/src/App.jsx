import { Routes, Route } from 'react-router-dom';
import ReportPage from './pages/ReportPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans antialiased">
      <Routes>
        <Route path="/" element={<ReportPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
