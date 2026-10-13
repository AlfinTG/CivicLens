import { useState } from 'react';
import { SeverityBadge, StatusBadge, getCategoryIcon } from './StatusBadge';
import { updateIssue } from '../api';

const DEPARTMENTS = [
  'Roads & Public Works',
  'Electricity Board',
  'Water & Drainage',
  'Sanitation',
  'General',
];

function formatTimeAgo(dateString) {
  if (!dateString) return 'Recent';
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function IssueTable({
  issues = [],
  onRefresh,
  onIssueClick,
  selectedIssueId,
  itemsPerPage = 8,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const totalItems = issues.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIssues = issues.slice(startIndex, startIndex + itemsPerPage);

  async function handleStatusChange(e, issueId) {
    e.stopPropagation();
    const newStatus = e.target.value;
    setUpdatingId(issueId);
    try {
      await updateIssue(issueId, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDepartmentChange(e, issueId) {
    e.stopPropagation();
    const newDept = e.target.value;
    setUpdatingId(issueId);
    try {
      await updateIssue(issueId, { department: newDept });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update department', err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xs">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/30 text-xs font-bold font-mono text-secondary uppercase tracking-wider">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-3">Classification</th>
              <th className="py-3 px-3 text-center">Severity</th>
              <th className="py-3 px-4">Location & Coordinates</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-4">Time & Merge</th>
              <th className="py-3 px-3 text-right">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-on-surface">
            {paginatedIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              const isUpdating = updatingId === issue.id;

              return (
                <tr
                  key={issue.id}
                  onClick={() => onIssueClick && onIssueClick(issue)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-primary/10 hover:bg-primary/15'
                      : 'hover:bg-surface-container-low'
                  } ${issue.status === 'resolved' ? 'opacity-70 bg-surface-container-low/40' : ''}`}
                >
                  {/* Ticket Hash */}
                  <td className="py-3 px-4 font-mono text-xs font-bold text-primary group-hover:underline">
                    #CVL-{issue.id}
                  </td>

                  {/* Classification */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface shrink-0">
                        <span className="material-symbols-outlined text-base">
                          {getCategoryIcon(issue.type)}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-on-surface capitalize">
                        {issue.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-3 text-center">
                    <SeverityBadge severity={issue.severity} />
                  </td>

                  {/* Location & Details */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-xs text-on-surface truncate">
                        {issue.note ? issue.note : issue.description}
                      </span>
                      <span className="font-mono text-2xs text-secondary truncate">
                        {issue.lat != null && issue.lng != null
                          ? `${issue.lat.toFixed(4)}°, ${issue.lng.toFixed(4)}°`
                          : 'Coordinates unavailable'}
                      </span>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3">
                    <select
                      value={issue.department || 'General'}
                      disabled={isUpdating}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleDepartmentChange(e, issue.id)}
                      className="text-xs border border-outline-variant/40 rounded-lg px-2.5 py-1 bg-surface-container-lowest text-on-surface font-medium focus:ring-1 focus:ring-primary focus:outline-none shadow-2xs cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === 'General' ? 'Unassigned' : dept}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Timestamp & Duplicates */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-on-surface">
                        {formatTimeAgo(issue.created_at)}
                      </span>
                      {issue.duplicate_count > 0 ? (
                        <span className="font-mono text-2xs text-primary font-bold">
                          {issue.duplicate_count} merged
                        </span>
                      ) : (
                        <span className="font-mono text-2xs text-secondary">
                          Single report
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority Score */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">
                      {issue.priority_score?.toFixed(1) || '0.0'}
                    </span>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-3">
                    <select
                      value={issue.status}
                      disabled={isUpdating}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(e, issue.id)}
                      className="text-xs border border-outline-variant/40 rounded-lg px-2 py-1 bg-surface-container-lowest text-on-surface font-semibold focus:ring-1 focus:ring-primary focus:outline-none shadow-2xs cursor-pointer"
                    >
                      <option value="open">Reported</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Action inspect */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      aria-label="Inspect issue"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onIssueClick) onIssueClick(issue);
                      }}
                      className="p-1 rounded-md text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                      title="Inspect details"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedIssues.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-secondary/60">
                      rule_folder
                    </span>
                    <p className="font-semibold text-xs text-on-surface">No issues in current view</p>
                    <p className="text-2xs text-secondary">Try adjusting filters or searching for another term</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary footer */}
      <div className="p-3.5 bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-mono text-secondary">
          Showing <strong className="text-on-surface">{totalItems > 0 ? startIndex + 1 : 0}</strong> to{' '}
          <strong className="text-on-surface">
            {Math.min(startIndex + itemsPerPage, totalItems)}
          </strong>{' '}
          of <strong className="text-on-surface">{totalItems}</strong> entries
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueTable;
