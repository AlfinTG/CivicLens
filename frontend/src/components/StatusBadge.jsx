const STATUS_CONFIG = {
  open: {
    label: 'Reported',
    badgeClass: 'bg-surface-container-high text-secondary border-outline-variant/40',
    dotClass: 'bg-secondary',
    pulse: false,
  },
  assigned: {
    label: 'Assigned',
    badgeClass: 'bg-secondary-container text-on-secondary-fixed border-secondary-container',
    dotClass: 'bg-secondary',
    pulse: false,
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-secondary-container/80 text-on-secondary-fixed border-primary/30',
    dotClass: 'bg-primary',
    pulse: true,
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    dotClass: 'bg-primary',
    pulse: false,
  },
};

const SEVERITY_CONFIG = {
  1: { label: 'Low', textClass: 'text-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
  2: { label: 'Monitored', textClass: 'text-primary', badgeClass: 'bg-primary/10 text-primary border-primary/20' },
  3: { label: 'Moderate', textClass: 'text-amber-700', badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  4: { label: 'High', textClass: 'text-orange-700', badgeClass: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
  5: { label: 'Critical', textClass: 'text-error', badgeClass: 'bg-error-container text-error border-error/30' },
};

export function StatusBadge({ status, showDot = true }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-surface-container-high text-secondary border-outline-variant/40',
    dotClass: 'bg-secondary',
    pulse: false,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}>
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${config.dotClass} ${config.pulse ? 'animate-ping' : ''}`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export function SeverityBadge({ severity, showLabel = false }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG[3];

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
      {showLabel && <span>{config.label}</span>}
      <span>{severity} / 5</span>
    </span>
  );
}

export function SeverityMeter({ severity, size = 'md' }) {
  const num = Math.max(1, Math.min(5, Number(severity) || 3));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  
  return (
    <div className={`grid grid-cols-5 gap-1 ${height} w-full`} title={`Severity: ${num} of 5`}>
      {[1, 2, 3, 4, 5].map((lvl) => {
        let fill = 'bg-surface-container-highest';
        if (lvl <= num) {
          if (lvl <= 2) fill = 'bg-primary';
          else if (lvl === 3) fill = 'bg-amber-500';
          else if (lvl === 4) fill = 'bg-orange-500';
          else fill = 'bg-error animate-pulse';
        }
        return <div key={lvl} className={`rounded-full ${fill} transition-all`} />;
      })}
    </div>
  );
}

export function getCategoryIcon(type) {
  switch (type) {
    case 'pothole':
      return 'traffic';
    case 'damaged_road':
      return 'alt_route';
    case 'broken_streetlight':
      return 'lightbulb';
    case 'drain_overflow':
      return 'water_drop';
    case 'garbage':
      return 'delete';
    case 'no_issue':
      return 'check_circle';
    default:
      return 'warning';
  }
}

export default StatusBadge;
