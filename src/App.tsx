import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { AppRouter } from '@/components/AppRouter';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { UserOnboarding, type OnboardingData } from '@/components/UserOnboarding';
import { useAuth } from '@/hooks/useAuth';
import { offlineDataManager } from '@/utils/offlineDataManager';
import './App.css';

function AppContent() {
  const { needsOnboarding, onboardingEmail, onboardingName, completeOnboarding } = useAuth();

  useEffect(() => {
    // Initialize offline data management
    const initializeOfflineSupport = async () => {
      try {
        await offlineDataManager.initialize();
        console.log('Offline data management initialized');
      } catch (error) {
        console.error('Failed to initialize offline support:', error);
      }
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, refresh the page
                  window.location.reload();
                }
              });
            }
          });
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    initializeOfflineSupport();
    registerServiceWorker();
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      console.log('[App] Completing onboarding with data:', data);
      await completeOnboarding({
        role: data.role,
        name: data.name,
        phoneNumber: data.phoneNumber
      });
      console.log('[App] Onboarding completed successfully');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  console.log('🟡 [App] ====== RENDERING APP ======');
  console.log('🟡 [App] needsOnboarding:', needsOnboarding, 'email:', onboardingEmail);

  if (needsOnboarding) {
    console.log('🟡 [App] Rendering onboarding UI');
    return (
      <UserOnboarding
        initialEmail={onboardingEmail || undefined}
        initialName={onboardingName || undefined}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  console.log('🟡 [App] Rendering main app router');
  return (
    <>
      <AppRouter />
      <OfflineIndicator />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

