#!/usr/bin/env node

/**
 * Firebase Integration Verification Script for SLATE
 * 
 * This script verifies that the Firebase integration is properly configured
 * and ready for production use.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔥 SLATE Firebase Integration Verification');
console.log('=' .repeat(50));

// Check if .env.local exists
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  // Read and validate env vars
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName + '=') || 
        envContent.includes(varName + '=your-') ||
        envContent.includes(varName + '=demo-')) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.log('❌ Missing or placeholder environment variables:', missingVars);
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('📝 Please copy .env.example to .env.local and configure your Firebase credentials');
}

// Check Firebase files
const firebaseFiles = [
  'src/lib/firebase.ts',
  'src/lib/firebaseService.ts',
  'src/lib/syncService.ts',
  'src/lib/authService.ts',
  'firebase.json',
  'firestore.rules',
  'firestore.indexes.json'
];

console.log('📁 Checking Firebase integration files...');
firebaseFiles.forEach(file => {
  if (fs.existsSync(path.join(projectRoot, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check package.json dependencies
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.dependencies && packageJson.dependencies.firebase) {
    console.log(`✅ Firebase SDK installed (v${packageJson.dependencies.firebase})`);
  } else {
    console.log('❌ Firebase SDK not found in dependencies');
  }
}

console.log('');
console.log('🚀 Next Steps:');
console.log('1. Start development server: npm run dev');
console.log('2. Open http://localhost:5173 in your browser');
console.log('3. Test Firebase connection in browser console:');
console.log('   import { firebaseTest } from "./src/lib/firebaseTest.ts"');
console.log('   firebaseTest.runFullTest()');
console.log('');
console.log('🔧 Production Deployment:');
console.log('1. Deploy Firestore rules: npm run firebase:deploy:rules');
console.log('2. Deploy Firestore indexes: npm run firebase:deploy:indexes');
console.log('3. Build and deploy your app: npm run build');
console.log('');
console.log('📚 See FIREBASE_INTEGRATION.md for detailed documentation');
