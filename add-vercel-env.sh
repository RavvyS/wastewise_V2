#!/bin/bash

# Script to add environment variables to Vercel deployment

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Please install it using: npm install -g vercel"
    exit 1
fi

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

# Check if logged in to Vercel
echo "Checking Vercel login status..."
vercel whoami || vercel login

# Add environment variables
echo "Adding Google Maps API Key to Vercel..."
vercel env add GOOGLE_MAPS_API_KEY production
echo "AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

echo "Adding Gemini API Key to Vercel..."
vercel env add GEMINI_API_KEY production
echo "AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

# Redeploy to apply changes
echo "Would you like to redeploy the project to apply changes? (y/n)"
read -r answer
if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo "Redeploying project..."
    vercel --prod
    echo "Redeployment complete!"
else
    echo "Skipping redeployment. Remember to redeploy manually to apply changes."
fi

echo "Environment variables have been added to Vercel."
echo "You can verify by checking the Environment Variables section in your Vercel project settings."