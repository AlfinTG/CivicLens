import { SeverityBadge } from './StatusBadge';

function IssueTable({ issues, sortBy = 'priority', onSelectIssue }) {
  const sorted = [...issues].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return b.priority_score - a.priority_score;
  });

  return (
    <div className="overflow-x-auto pb-2">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/50">
            <th className="px-3 sm:px-4 py-3 font-medium">Issue</th>
            <th className="hidden md:table-cell px-4 py-3 font-medium">Department</th>
            <th className="hidden sm:table-cell px-4 py-3 font-medium text-center">Sev</th>
            <th className="hidden sm:table-cell px-4 py-3 font-medium text-center">Priority</th>
            <th className="px-3 sm:px-4 py-3 font-medium text-center">Status</th>
            <th className="hidden sm:table-cell px-3 sm:px-4 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((issue) => (
            <tr
              key={issue.id}
              onClick={() => onSelectIssue && onSelectIssue(issue.id)}
              className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer active:bg-blue-100/50"
            >
              <td className="px-3 sm:px-4 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-gray-900 capitalize">
                    {issue.type.replace(/_/g, ' ')}
                  </span>
                  <span className="sm:hidden">
                    <SeverityBadge severity={issue.severity} />
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 block truncate max-w-[140px] sm:max-w-[180px]">
                  {new Date(issue.created_at).toLocaleDateString()}{' '}
                  {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="md:hidden text-[11px] text-gray-500 block truncate max-w-[140px] mt-0.5">
                  {issue.department}
                </span>
              </td>
              <td className="hidden md:table-cell px-4 py-3">
                <span className="text-xs text-gray-600 block truncate max-w-[150px]">
                  {issue.department}
                </span>
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-center">
                <SeverityBadge severity={issue.severity} />
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-center">
                <span
                  className={[
                    'inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium tabular-nums',
                    issue.priority_score > 60
                      ? 'bg-red-100 text-red-700'
                      : issue.priority_score > 30
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700',
                  ].join(' ')}
                >
                  {issue.priority_score.toFixed(0)}
                </span>
              </td>
              <td className="px-3 sm:px-4 py-3 text-center">
                <span
                  className={[
                    'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize',
                    issue.status === 'resolved'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : issue.status === 'in_progress'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200',
                  ].join(' ')}
                >
                  {issue.status.replace('_', ' ')}
                </span>
              </td>
              <td className="hidden sm:table-cell px-3 sm:px-4 py-3 text-right">
                <span className="text-[11px] sm:text-xs font-medium text-blue-600 whitespace-nowrap">
                  Open &rarr;
                </span>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <p className="text-gray-500 font-medium">No reported issues yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Issues will appear here when citizens submit them.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default IssueTable;
