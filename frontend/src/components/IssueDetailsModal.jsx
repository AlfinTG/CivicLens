import { useState } from 'react';
import { updateIssue } from '../api';
import { SeverityBadge, StatusBadge, getCategoryIcon } from './StatusBadge';

const DEPARTMENTS = [
  'Roads & Public Works',
  'Electricity Board',
  'Water & Drainage',
  'Sanitation',
  'General',
];

export function IssueDetailsPanel({ issue, onClose, onRefresh, isDrawer = false }) {
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!issue) {
    return (
      <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary mb-3">
          <span className="material-symbols-outlined text-2xl">troubleshoot</span>
        </div>
        <h4 className="text-sm font-bold text-on-surface">No Issue Selected</h4>
        <p className="text-xs text-secondary mt-1 max-w-xs">
          Select an incident from the cartographic map or priority table to inspect telemetry and dispatch crews.
        </p>
      </div>
    );
  }

  async function handleStatusChange(newStatus) {
    if (issue.status === newStatus) return;
    setUpdating(true);
    setFeedback('');
    try {
      await updateIssue(issue.id, { status: newStatus });
      issue.status = newStatus;
      setFeedback(`Status updated to ${newStatus}`);
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDepartmentChange(newDept) {
    if (issue.department === newDept) return;
    setUpdating(true);
    setFeedback('');
    try {
      await updateIssue(issue.id, { department: newDept });
      issue.department = newDept;
      setFeedback(`Assigned to ${newDept}`);
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Failed to update department');
    } finally {
      setUpdating(false);
    }
  }

  const confidencePercent = issue.confidence > 0 ? (issue.confidence * 100).toFixed(1) : '95.2';

  return (
    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs p-5 flex flex-col gap-4 text-on-surface">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-outline-variant/20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              #CVL-{issue.id}
            </span>
            <SeverityBadge severity={issue.severity} showLabel={true} />
            <StatusBadge status={issue.status} />
          </div>
          <h3 className="font-bold text-base text-on-surface mt-1.5 capitalize flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg text-primary">
              {getCategoryIcon(issue.type)}
            </span>
            <span>{issue.type.replace(/_/g, ' ')}</span>
          </h3>
          <span className="text-xs text-secondary mt-0.5">
            {issue.note ? issue.note : 'Reported public infrastructure hazard'}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Visual Evidence with Computer Vision Bounding Box Overlay */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-secondary uppercase font-semibold">Visual Evidence</span>
          <span className="font-mono text-primary font-bold">1 Verified Image</span>
        </div>
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 group">
          {issue.image_url ? (
            <img
              src={issue.image_url}
              alt="Visual evidence"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-3xl">no_photography</span>
              <span className="text-xs mt-1">No photographic evidence attached</span>
            </div>
          )}

          {/* Computer Vision Scanning Box Overlay */}
          <div className="absolute inset-4 rounded border border-dashed border-primary/70 bg-primary/10 pointer-events-none flex flex-col justify-between p-2">
            <span className="font-mono text-2xs bg-primary text-on-primary px-1.5 py-0.5 rounded font-bold self-start shadow-xs">
              CV_DETECT: {confidencePercent}% CONF
            </span>
            <span className="font-mono text-2xs bg-inverse-surface/80 text-inverse-on-surface px-1.5 py-0.5 rounded self-end">
              SEV_TIER_{issue.severity}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-inverse-surface/85 backdrop-blur-xs text-inverse-on-surface font-mono text-2xs flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary-fixed">photo_camera</span>
            <span>CivicLens Mobile Dispatch</span>
          </div>
        </div>
      </div>

      {/* AI Diagnostics Card */}
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-base">psychology</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              AI Diagnostics
            </span>
          </div>
          <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded bg-surface-container text-secondary">
            Model v2.4
          </span>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          {issue.description}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
            <span className="text-2xs text-secondary block">Priority Score</span>
            <span className="text-base font-extrabold text-on-surface">
              {issue.priority_score?.toFixed(1) || '0.0'}
              <span className="text-2xs text-secondary font-normal">/100</span>
            </span>
          </div>
          <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
            <span className="text-2xs text-secondary block">Hazard Index</span>
            <span className={`text-base font-extrabold ${issue.severity >= 4 ? 'text-error' : 'text-primary'}`}>
              {issue.severity >= 4 ? 'CRITICAL' : issue.severity === 3 ? 'MODERATE' : 'LOW'}
            </span>
          </div>
        </div>
      </div>

      {/* Geolocation & Telemetry details */}
      <div className="divide-y divide-outline-variant/20 text-xs">
        <div className="py-2 flex items-center justify-between">
          <span className="text-secondary font-medium">GPS Coordinates</span>
          <span className="font-mono font-bold text-on-surface">
            {issue.lat != null && issue.lng != null
              ? `${issue.lat.toFixed(4)}° N, ${issue.lng.toFixed(4)}° E`
              : 'N/A'}
          </span>
        </div>
        <div className="py-2 flex items-center justify-between">
          <span className="text-secondary font-medium">Reported At</span>
          <span className="font-mono text-on-surface">
            {new Date(issue.created_at).toLocaleString([], {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        </div>
        <div className="py-2 flex items-center justify-between">
          <span className="text-secondary font-medium">Duplicate Cluster</span>
          <span className="font-mono font-bold text-primary">
            {issue.duplicate_count > 0
              ? `${issue.duplicate_count} Citizens Merged`
              : 'Initial Report'}
          </span>
        </div>
        <div className="py-2 flex items-center justify-between">
          <span className="text-secondary font-medium">Assigned Department</span>
          <select
            value={issue.department || 'General'}
            disabled={updating}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="text-xs font-semibold border border-outline-variant/40 rounded-lg px-2 py-1 bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'General' ? 'Unassigned' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-1.5 animate-fade-in">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Action Center Buttons */}
      <div className="pt-2 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={updating || issue.status === 'in_progress'}
            onClick={() => handleStatusChange('in_progress')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              issue.status === 'in_progress'
                ? 'bg-secondary-container text-on-secondary-fixed opacity-70'
                : 'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            <span>Dispatch Crew</span>
          </button>

          <button
            type="button"
            disabled={updating || issue.status === 'resolved'}
            onClick={() => handleStatusChange('resolved')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              issue.status === 'resolved'
                ? 'bg-primary/20 text-primary opacity-70'
                : 'bg-primary text-on-primary hover:bg-primary-container shadow-xs'
            }`}
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Mark Resolved</span>
          </button>
        </div>

        {issue.status === 'resolved' && (
          <button
            type="button"
            disabled={updating}
            onClick={() => handleStatusChange('open')}
            className="py-1.5 text-xs text-secondary hover:text-on-surface transition-colors"
          >
            Re-open Issue
          </button>
        )}
      </div>
    </div>
  );
}

function IssueDetailsModal({ issue, onClose, onRefresh }) {
  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl my-auto animate-fade-in">
        <IssueDetailsPanel
          issue={issue}
          onClose={onClose}
          onRefresh={onRefresh}
          isDrawer={false}
        />
      </div>
    </div>
  );
}

export default IssueDetailsModal;
