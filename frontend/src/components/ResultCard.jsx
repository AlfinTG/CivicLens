import { StatusBadge, SeverityBadge } from './StatusBadge';

function ResultCard({ issue }) {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 capitalize">
            {issue.type.replace(/_/g, ' ')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{issue.department}</p>
        </div>
        <SeverityBadge severity={issue.severity} />
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{issue.description}</p>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <StatusBadge status={issue.status} />
        {issue.confidence > 0 && (
          <span className="text-xs text-gray-400">
            {(issue.confidence * 100).toFixed(0)}% confidence
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultCard;
