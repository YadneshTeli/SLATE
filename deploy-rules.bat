@echo off
REM SLATE Firebase Setup Script for Windows
REM This script deploys the database security rules to Firebase

echo 🔥 SLATE Firebase Setup
echo =======================

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if user is logged in
echo 🔐 Checking Firebase authentication...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please run:
    echo    firebase login
    exit /b 1
)

echo ✅ Firebase CLI ready

REM Deploy database rules
echo 📋 Deploying database security rules...
firebase deploy --only database:rules
if %errorlevel% equ 0 (
    echo ✅ Database rules deployed successfully!
    echo.
    echo 🚀 Setup complete! Your app should now work properly.
    echo.
    echo Next steps:
    echo 1. Make sure you've created .env.local with your Firebase credentials
    echo 2. Test authentication in your app
    echo 3. If you still get permission errors, check the Firebase Console
) else (
    echo ❌ Failed to deploy database rules
    echo Please check:
    echo 1. Your .firebaserc file has the correct project ID
    echo 2. You have proper permissions for the Firebase project
    echo 3. The Firebase project exists and is active
    exit /b 1
)
