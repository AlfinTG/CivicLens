const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const SEVERITY_STYLES = {
  1: 'bg-green-50 text-green-700 border-green-200',
  2: 'bg-green-50 text-green-700 border-green-200',
  3: 'bg-amber-50 text-amber-700 border-amber-200',
  4: 'bg-red-50 text-red-700 border-red-200',
  5: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${style}`}>
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded border ${style}`}>
      {severity}
    </span>
  );
}

export default StatusBadge;
