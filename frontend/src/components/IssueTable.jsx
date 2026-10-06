import { SeverityBadge } from './StatusBadge';
import { updateIssueStatus } from '../api';

function IssueTable({ issues, onRefresh, onIssueClick }) {
  async function handleStatusChange(id, newStatus) {
    try {
      await updateIssueStatus(id, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  const sorted = [...issues].sort((a, b) => {
    // Resolved issues go to the bottom
    if (a.status === 'resolved' && b.status !== 'resolved') return 1;
    if (b.status === 'resolved' && a.status !== 'resolved') return -1;
    // Otherwise sort by priority descending
    return b.priority_score - a.priority_score;
  });

  return (
    <div className="overflow-y-auto h-full w-full">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="sticky top-0 bg-gray-50 z-10 shadow-[0_1px_0_0_#e5e7eb]">
          <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-5 py-3">Issue / Dept</th>
            <th className="px-4 py-3">Sev</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((issue) => (
            <tr 
              key={issue.id} 
              className={`group cursor-pointer transition-colors hover:bg-blue-50/50 ${issue.status === 'resolved' ? 'opacity-60 bg-gray-50/50' : ''}`}
              onClick={() => onIssueClick && onIssueClick(issue)}
            >
              <td className="px-5 py-3">
                <span className="block font-semibold text-gray-900 capitalize group-hover:text-blue-700 transition-colors">
                  {issue.type.replace(/_/g, ' ')}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">
                  {issue.department}
                </span>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={issue.severity} />
              </td>
              <td className="px-4 py-3 text-gray-700 tabular-nums font-medium">
                {issue.priority_score.toFixed(1)}
              </td>
              <td className="px-4 py-3">
                <select
                  value={issue.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 font-medium
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             shadow-sm cursor-pointer"
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
              <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm bg-gray-50/50">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No issues in the queue
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IssueTable;
