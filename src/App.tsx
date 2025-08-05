import { useEffect } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { AppRouter } from '@/components/AppRouter';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { offlineDataManager } from '@/utils/offlineDataManager';
import './App.css';

function App() {
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

  return (
    <AppProvider>
      <AppRouter />
      <OfflineIndicator />
    </AppProvider>
  );
}

export default App;
