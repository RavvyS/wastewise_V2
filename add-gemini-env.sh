#!/bin/bash

# Script to add the Gemini API key to Vercel environment
echo "Adding Gemini API key to Vercel environment..."

# Verify Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Set the API key for the Vercel project
echo "Setting GEMINI_API_KEY in Vercel environment..."
vercel env add GEMINI_API_KEY production --value="AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

# Also set it for development and preview environments
echo "Setting GEMINI_API_KEY for development environment..."
vercel env add GEMINI_API_KEY development --value="AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

echo "Setting GEMINI_API_KEY for preview environment..."
vercel env add GEMINI_API_KEY preview --value="AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

echo "Environment variables have been set successfully!"
echo "You may need to redeploy your application for changes to take effect."
echo "Run 'vercel --prod' to deploy to production."

# Add instructions for manual setup
echo ""
echo "If you prefer to set up environment variables manually:"
echo "1. Go to your Vercel project dashboard"
echo "2. Navigate to Settings > Environment Variables"
echo "3. Add a new variable with name 'GEMINI_API_KEY' and value 'AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA'"
echo "4. Select all environments (Production, Preview, Development)"
echo "5. Click 'Save'"