import { StatusBadge } from './StatusBadge';

function getSeverityDetails(level) {
  if (level <= 2) return { label: 'LOW', color: 'text-green-700 bg-green-50 border-green-200' };
  if (level === 3) return { label: 'MEDIUM', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { label: 'HIGH', color: 'text-red-700 bg-red-50 border-red-200' };
}

function ResultCard({ issue }) {
  if (issue.type === 'no_issue') {
    return (
      <div className="card px-6 py-8 bg-white border border-gray-200 flex flex-col items-center justify-center text-center shadow-sm">
        <svg className="w-10 h-10 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">No issue detected</h3>
        <p className="text-sm text-gray-500 mt-1">We could not identify any civic issue in this image.</p>
      </div>
    );
  }

  const severity = getSeverityDetails(issue.severity);

  return (
    <div className="card overflow-hidden shadow-sm">
      <div className="bg-gray-50/80 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 tracking-tight">Inspection Result</h3>
        {issue.status && <StatusBadge status={issue.status} />}
      </div>
      
      <div className="p-0">
        <dl className="divide-y divide-gray-100">
          <div className="px-5 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Issue</dt>
            <dd className="col-span-2 text-sm font-medium text-gray-900 capitalize flex items-center">
              {issue.type.replace(/_/g, ' ')}
            </dd>
          </div>
          
          <div className="px-5 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Severity</dt>
            <dd className="col-span-2 text-sm text-gray-900">
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded border ${severity.color}`}>
                {severity.label} &bull; {issue.severity} / 5
              </span>
            </dd>
          </div>
          
          <div className="px-5 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">Department</dt>
            <dd className="col-span-2 text-sm text-gray-900 font-medium">
              {(!issue.department || issue.department === "General") ? (
                <span className="text-amber-600 italic">Unassigned</span>
              ) : (
                issue.department
              )}
            </dd>
          </div>
          
          <div className="px-5 py-4 grid grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
            <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</dt>
            <dd className="col-span-2 text-sm text-gray-700 leading-relaxed">
              {issue.description}
            </dd>
          </div>

          {issue.confidence > 0 && (
            <div className="px-5 py-3 grid grid-cols-3 gap-4 bg-gray-50">
              <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center">AI Confidence</dt>
              <dd className="col-span-2 text-xs text-gray-500 font-medium flex items-center">
                {(issue.confidence * 100).toFixed(1)}%
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default ResultCard;
