import { useApp } from '@/hooks/useApp';
import { Link } from 'react-router-dom';
import { ProjectManagement } from '@/components/ProjectManagement';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

export function ProjectManagementPage() {
  const { state } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animation for page load
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  const handleLogout = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        localStorage.removeItem('slateUser');
        window.location.reload();
      }
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard" className="text-slate-600 hover:text-slate-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-slate-900">Project Management</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <span className="text-sm text-slate-500">
                {state.user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Management</h2>
          <p className="text-slate-600">Create and manage projects, checklists, and shot items</p>
        </div>

        {state.currentProject ? (
          <ProjectManagement 
            project={state.currentProject}
            users={[]} // No users in state, will be handled in component
            checklists={state.checklists}
            shotItems={state.shotItems}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Project Selected</h3>
            <p className="text-slate-600 mb-4">Select a project to manage its content</p>
          </div>
        )}
      </main>
    </div>
  );
}
