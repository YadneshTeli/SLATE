#!/bin/bash

# SLATE Firebase Setup Script
# This script deploys the database security rules to Firebase

echo "🔥 SLATE Firebase Setup"
echo "======================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
echo "🔐 Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"

# Deploy database rules
echo "📋 Deploying database security rules..."
if firebase deploy --only database:rules; then
    echo "✅ Database rules deployed successfully!"
    echo ""
    echo "🚀 Setup complete! Your app should now work properly."
    echo ""
    echo "Next steps:"
    echo "1. Make sure you've created .env.local with your Firebase credentials"
    echo "2. Test authentication in your app"
    echo "3. If you still get permission errors, check the Firebase Console"
else
    echo "❌ Failed to deploy database rules"
    echo "Please check:"
    echo "1. Your .firebaserc file has the correct project ID"
    echo "2. You have proper permissions for the Firebase project"
    echo "3. The Firebase project exists and is active"
    exit 1
fi
