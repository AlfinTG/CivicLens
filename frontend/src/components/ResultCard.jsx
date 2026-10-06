import { StatusBadge } from './StatusBadge';

function getSeverityDetails(level) {
  if (level <= 2) return { label: 'Low', color: 'text-green-700 bg-green-50 border-green-200' };
  if (level === 3) return { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'High', color: 'text-red-700 bg-red-50 border-red-200' };
}

function ResultCard({ issue }) {
  if (issue.type === 'no_issue') {
    return (
      <div className="card px-4 py-6 bg-green-50/30 border-green-100 flex flex-col items-center justify-center text-center">
        <h3 className="text-base font-semibold text-green-800">No issue detected</h3>
        <p className="text-sm text-green-600 mt-1">We could not identify any civic issue in this image.</p>
      </div>
    );
  }

  const severity = getSeverityDetails(issue.severity);

  return (
    <div className="card overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">Inspection Result</h3>
        {issue.status && <StatusBadge status={issue.status} />}
      </div>
      
      <div className="p-0">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-3 grid grid-cols-3 gap-4">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</dt>
            <dd className="col-span-2 text-sm font-medium text-gray-900 capitalize">
              {issue.type.replace(/_/g, ' ')}
            </dd>
          </div>
          
          <div className="px-4 py-3 grid grid-cols-3 gap-4">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${severity.color}`}>
                {severity.label} ({issue.severity}/5)
              </span>
            </dd>
          </div>
          
          <div className="px-4 py-3 grid grid-cols-3 gap-4">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              {issue.department}
            </dd>
          </div>
          
          <div className="px-4 py-3 grid grid-cols-3 gap-4">
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
            <dd className="col-span-2 text-sm text-gray-700 leading-relaxed">
              {issue.description}
            </dd>
          </div>

          {issue.confidence > 0 && (
            <div className="px-4 py-3 grid grid-cols-3 gap-4 bg-gray-50/50">
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</dt>
              <dd className="col-span-2 text-sm text-gray-600">
                {(issue.confidence * 100).toFixed(0)}%
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default ResultCard;
