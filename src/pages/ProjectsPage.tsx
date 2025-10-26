import { useNavigate } from 'react-router-dom';

export function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Projects</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-sm sm:text-base text-slate-600 hover:text-slate-900 touch-manipulation min-h-[36px] px-2 sm:px-0"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">Projects List</h3>
          <p className="text-sm sm:text-base text-slate-600">This page will show all projects and allow creation/editing</p>
        </div>
      </div>
    </div>
  );
}
