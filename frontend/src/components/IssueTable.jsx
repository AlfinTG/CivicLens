import { SeverityBadge } from './StatusBadge';
import { updateIssueStatus } from '../api';

function IssueTable({ issues, onRefresh }) {
  async function handleStatusChange(id, newStatus) {
    try {
      await updateIssueStatus(id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  const sorted = [...issues].sort((a, b) => b.priority_score - a.priority_score);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-2.5 font-medium">Issue</th>
            <th className="px-4 py-2.5 font-medium">Sev</th>
            <th className="px-4 py-2.5 font-medium">Priority</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((issue) => (
            <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50/60">
              <td className="px-4 py-2.5">
                <span className="font-medium text-gray-900 capitalize">
                  {issue.type.replace(/_/g, ' ')}
                </span>
                <span className="block text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                  {issue.department}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <SeverityBadge severity={issue.severity} />
              </td>
              <td className="px-4 py-2.5 text-gray-600 tabular-nums">{issue.priority_score}</td>
              <td className="px-4 py-2.5">
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                No issues found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IssueTable;
