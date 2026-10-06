const STATUS_STYLES = {
  open: 'bg-gray-100 text-gray-800 border-gray-300',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const SEVERITY_STYLES = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-green-100 text-green-800 border-green-300',
  3: 'bg-amber-100 text-amber-800 border-amber-300',
  4: 'bg-red-100 text-red-800 border-red-300',
  5: 'bg-red-100 text-red-800 border-red-300',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style}`}>
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded border ${style}`}>
      {severity}
    </span>
  );
}

export default StatusBadge;
