import { useNavigate } from 'react-router-dom';

export function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Projects List</h3>
          <p className="text-slate-600">This page will show all projects and allow creation/editing</p>
        </div>
      </div>
    </div>
  );
}
