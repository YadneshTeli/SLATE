import { useParams, useNavigate } from 'react-router-dom';

export function ChecklistPage() {
  const { projectId, checklistId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Checklist</h1>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to Project
          </button>
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Checklist Details</h3>
          <p className="text-slate-600">Project ID: {projectId}</p>
          <p className="text-slate-600">Checklist ID: {checklistId}</p>
          <p className="text-slate-600">This page will show checklist items and allow editing</p>
        </div>
      </div>
    </div>
  );
}
