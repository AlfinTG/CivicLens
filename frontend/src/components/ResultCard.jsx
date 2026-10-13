import { StatusBadge, SeverityMeter, getCategoryIcon } from './StatusBadge';

function getSeverityDescription(level) {
  switch (level) {
    case 5:
      return 'Immediate hazard to vehicles and pedestrians. Structural sub-base failure.';
    case 4:
      return 'Severe degradation causing traffic disruption. Rapid remediation required.';
    case 3:
      return 'Moderate infrastructure defect. Scheduled for standard municipal queue.';
    case 2:
      return 'Minor surface issue detected. Logged for routine municipal maintenance.';
    default:
      return 'Cosmetic or early-stage anomaly. Monitored in district sensor dataset.';
  }
}

function getEstimatedSLA(severity) {
  if (severity >= 5) return { time: '12–24h', tier: 'Emergency Response' };
  if (severity === 4) return { time: '24–48h', tier: 'Priority Rapid Crew' };
  if (severity === 3) return { time: '3–5 days', tier: 'Standard Dispatch' };
  return { time: '5–7 days', tier: 'Routine Maintenance' };
}

function ResultCard({ issue, onReset }) {
  if (!issue) return null;

  if (issue.type === 'no_issue') {
    return (
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">verified_user</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-mono font-semibold mb-2">
          <span>AI VISION VERIFICATION</span>
        </div>
        <h3 className="text-xl font-bold text-on-surface tracking-tight mb-1">
          No Civic Issue Detected
        </h3>
        <p className="text-sm text-secondary max-w-sm mb-6 leading-relaxed">
          Our municipal vision model did not identify any actionable public infrastructure hazard in this image.
        </p>
        <div className="p-3.5 rounded-xl bg-surface-container-low text-left w-full max-w-md text-xs text-secondary mb-6 border border-outline-variant/20">
          <p className="font-semibold text-on-surface mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-secondary">tips_and_updates</span>
            Citizen Tips:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Ensure the issue is centered and well-lit.</li>
            <li>Capture roadways, streetlights, drains, or waste bins clearly.</li>
          </ul>
        </div>
        {onReset && (
          <button type="button" onClick={onReset} className="btn-secondary w-full max-w-md py-2.5">
            Take Another Photo
          </button>
        )}
      </div>
    );
  }

  const sla = getEstimatedSLA(issue.severity);
  const confidencePercent = issue.confidence > 0 ? (issue.confidence * 100).toFixed(1) : '94.8';

  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm p-6 flex flex-col gap-5 relative overflow-hidden">
      {/* Header telemetry badge */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-secondary">
            Step 04 / Real-Time Telemetry
          </span>
          <h3 className="text-lg font-bold text-on-surface">AI Diagnostic Inspection</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Verified Intake</span>
        </div>
      </div>

      {/* Status banner */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
        <span className="text-xs font-medium text-secondary">Dispatch Status</span>
        <div className="flex items-center gap-2">
          {issue.status ? (
            <StatusBadge status={issue.status} />
          ) : (
            <span className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-xs">
              Dispatched • Ready for Crew
            </span>
          )}
        </div>
      </div>

      {/* Identified Hazard Type */}
      <div>
        <span className="font-mono text-xs text-secondary uppercase tracking-wider">
          Identified Hazard Type
        </span>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {getCategoryIcon(issue.type)}
            </span>
          </div>
          <div>
            <h4 className="text-base font-bold text-on-surface capitalize">
              {issue.type.replace(/_/g, ' ')}
            </h4>
            <p className="text-xs text-secondary leading-relaxed mt-0.5">
              {issue.description}
            </p>
          </div>
        </div>
      </div>

      {/* Discrete 5-Segment Severity Meter */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-on-surface">Severity Rating Assessment</span>
          <span className="font-mono text-xs font-bold text-error">
            Level {issue.severity} / 5
          </span>
        </div>
        <SeverityMeter severity={issue.severity} size="md" />
        <p className="text-xs text-secondary mt-2.5 leading-relaxed">
          {getSeverityDescription(issue.severity)}
        </p>
      </div>

      {/* Telemetry grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <span className="font-mono text-xs text-secondary block">Model Confidence</span>
          <span className="text-xl font-extrabold text-primary font-mono block mt-0.5">
            {confidencePercent}%
          </span>
          <span className="text-2xs text-secondary block mt-0.5">Municipal Vision Model</span>
        </div>
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <span className="font-mono text-xs text-secondary block">Estimated SLA</span>
          <span className="text-xl font-extrabold text-on-surface font-mono block mt-0.5">
            {sla.time}
          </span>
          <span className="text-2xs text-secondary block mt-0.5">{sla.tier}</span>
        </div>
      </div>

      {/* Responsible Department */}
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-xl mt-0.5">
          corporate_fare
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-on-surface">Responsible Municipal Department</p>
          <p className="text-sm font-semibold text-secondary truncate mt-0.5">
            {issue.department && issue.department !== 'General'
              ? issue.department
              : 'Roads & Public Works (General Triage)'}
          </p>
        </div>
      </div>

      {/* Case Hash & Note details */}
      <div className="flex items-center justify-between py-2 text-xs font-mono text-secondary border-t border-outline-variant/20">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-primary">verified</span>
          Ticket: <strong className="text-primary">#CVL-{issue.id}</strong>
        </span>
        {issue.duplicate_count > 0 && (
          <span className="text-primary font-semibold">
            {issue.duplicate_count} nearby merged
          </span>
        )}
      </div>

      {/* Reset button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary w-full py-2.5 font-semibold text-sm mt-1"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          <span>Submit Another Report</span>
        </button>
      )}
    </div>
  );
}

export default ResultCard;
