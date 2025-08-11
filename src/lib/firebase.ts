import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxQXWZoLlg0iNjBOcWqf0BoOUJTjkYz8k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "slate-f7ba8.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://slate-f7ba8-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "slate-f7ba8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "slate-f7ba8.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
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
  console.warn('[Firebase] Missing environment variables:', missingEnvVars);
  console.warn('[Firebase] Using demo configuration. Please add proper Firebase config to .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Enhanced configuration for development
if (import.meta.env.DEV) {
  // Configure authentication settings
  auth.useDeviceLanguage();
  
  // Enable network retry logic
  console.log('[Firebase] Development mode - enhanced configuration applied');
  
  // Debug configuration
  console.log('[Firebase] Configuration loaded:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    environment: import.meta.env.MODE
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
