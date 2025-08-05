import { AuthComponent } from '@/components/AuthComponent';
import { useApp } from '@/hooks/useApp';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { User } from '@/types';

export function AuthPage() {
  const { state, dispatch, initializeDemoDataForUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.user) {
      navigate('/dashboard');
    }
  }, [state.user, navigate]);

  useEffect(() => {
    // Check for existing user session on page load
    const savedUser = localStorage.getItem('slateUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
        
        // Initialize demo data for restored user
        initializeDemoDataForUser(user.id);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('slateUser');
      }
    }
  }, [dispatch, initializeDemoDataForUser]);

  const handleLogin = (user: User) => {
    localStorage.setItem('slateUser', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
    
    // Initialize demo data for all users
    initializeDemoDataForUser(user.id);
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <AuthComponent onLogin={handleLogin} />
    </div>
  );
}
