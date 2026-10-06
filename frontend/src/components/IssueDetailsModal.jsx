import { useState } from 'react';
import { updateIssueStatus } from '../api';

function IssueDetailsModal({ issue, onClose, onRefresh }) {
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!issue) return null;

  async function handleStatusChange(newStatus) {
    if (issue.status === newStatus) return;
    setUpdating(true);
    setSuccessMsg('');
    try {
      await updateIssueStatus(issue.id, newStatus);
      setSuccessMsg('Status updated successfully');
      if (onRefresh) onRefresh();
      // Temporarily update local state to reflect change immediately if modal stays open
      issue.status = newStatus;
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  const steps = [
    { id: 'open', label: 'Open' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Issue Details #{issue.id}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Photo Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Photo</h4>
            <div className="bg-gray-100 rounded-md overflow-hidden aspect-video flex items-center justify-center border border-gray-200">
              {issue.image_url ? (
                <img src={issue.image_url} alt="Issue" className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm text-gray-400">No image available</span>
              )}
            </div>
            {issue.note && (
              <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 mt-2">
                <span className="text-xs font-medium text-blue-800">Submitter Note:</span>
                <p className="text-sm text-gray-700 mt-0.5">"{issue.note}"</p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overview & Location</h4>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                <p className="text-sm text-gray-900 font-medium capitalize">{issue.type.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Reported:</span>
                    <span className="text-gray-900 font-medium">{new Date(issue.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Location:</span>
                    <span className="text-gray-900 font-medium">{issue.lat ? `${issue.lat}, ${issue.lng}` : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AI Analysis</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-0.5">Priority Score</span>
                  <span className="text-lg font-bold text-gray-900">{issue.priority_score.toFixed(1)}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100">
                  <span className="text-xs text-gray-500 block mb-0.5">Severity</span>
                  <span className="text-lg font-bold text-gray-900">{issue.severity}/5</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 col-span-2">
                  <span className="text-xs text-gray-500 block mb-0.5">Department</span>
                  <span className="text-sm font-medium text-gray-900">{issue.department}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflow</h4>
                {successMsg && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">{successMsg}</span>}
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-2 flex items-center justify-between shadow-sm">
                {steps.map((step, idx) => {
                  const isActive = issue.status === step.id;
                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        disabled={updating}
                        onClick={() => handleStatusChange(step.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {step.label}
                      </button>
                      {idx < steps.length - 1 && (
                        <div className="mx-2 text-gray-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetailsModal;
