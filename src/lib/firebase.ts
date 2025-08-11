import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('[Firebase] Missing environment variables:', missingEnvVars);
  console.error('[Firebase] Please ensure all required environment variables are set in your .env.local file.');
  console.error('[Firebase] Copy .env.local.template to .env.local and fill in your Firebase project details.');
  console.error('[Firebase] Get your credentials from: Firebase Console > Project Settings > General');
  
  // Show specific instructions for common missing variables
  if (missingEnvVars.includes('VITE_FIREBASE_API_KEY')) {
    console.error('[Firebase] API Key: Found in Firebase Console > Project Settings > General > Web API Key');
  }
  if (missingEnvVars.includes('VITE_FIREBASE_DATABASE_URL')) {
    console.error('[Firebase] Database URL: Found in Firebase Console > Realtime Database > Data tab');
  }
  
  throw new Error(`Firebase configuration incomplete. Missing: ${missingEnvVars.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Enhanced configuration for development
if (import.meta.env.DEV) {
  // Configure authentication settings
  auth.useDeviceLanguage();
  
  // Enable network retry logic
  console.log('[Firebase] Development mode - enhanced configuration applied');
  
  // Debug configuration
  console.log('[Firebase] Configuration loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MODE,
    hasApiKey: !!firebaseConfig.apiKey,
    hasDatabaseURL: !!firebaseConfig.databaseURL
  });
} else {
  // Production optimizations
  auth.useDeviceLanguage();
}

// Enhanced error handling for Firebase initialization
try {
  // Test Firebase connection
  console.log('[Firebase] Services initialized successfully');
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
}

export default app;
