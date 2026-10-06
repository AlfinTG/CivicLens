import { SeverityBadge } from './StatusBadge';
import { updateIssue } from '../api';

const DEPARTMENTS = [
  "Roads & Public Works",
  "Electricity Board",
  "Water & Drainage",
  "Sanitation",
  "General"
];

function getSuggestedDepartment(type) {
  if (['pothole', 'damaged_road'].includes(type)) return 'Roads & Public Works';
  if (type === 'garbage') return 'Sanitation';
  if (type === 'broken_streetlight') return 'Electricity Board';
  if (type === 'drain_overflow') return 'Water & Drainage';
  return 'General';
}

function IssueTable({ issues, onRefresh, onIssueClick }) {
  async function handleUpdate(id, updates) {
    try {
      await updateIssue(id, updates);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update issue', err);
    }
  }

  return (
    <div className="overflow-y-auto h-full w-full">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="sticky top-0 bg-gray-50 z-10 shadow-[0_1px_0_0_#e5e7eb]">
          <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <th className="px-5 py-3">Issue</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Sev</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {issues.map((issue) => {
            const suggested = getSuggestedDepartment(issue.type);
            const isUnassigned = !issue.department || issue.department === "General";
            return (
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
                  ID: #{issue.id}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={issue.department || "General"}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleUpdate(issue.id, { department: e.target.value })}
                  className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer ${
                    isUnassigned ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {isUnassigned && <option value="General" disabled hidden>Unassigned</option>}
                  {DEPARTMENTS.map(dep => {
                    if (dep === "General") {
                      return <option key={dep} value={dep}>Unassigned</option>;
                    }
                    const isSuggested = suggested === dep;
                    return (
                      <option key={dep} value={dep}>
                        {dep} {isSuggested ? ' (Suggested)' : ''}
                      </option>
                    );
                  })}
                </select>
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
                  onChange={(e) => handleUpdate(issue.id, { status: e.target.value })}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 font-medium
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             shadow-sm cursor-pointer"
                >
                  <option value="open">Reported</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          )})}
          {issues.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm bg-gray-50/50">
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
