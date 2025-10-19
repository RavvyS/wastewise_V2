#!/bin/bash

# Script to add Gemini API key to Vercel environment
echo "📝 Adding Gemini API key to Vercel environment..."
API_KEY="AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

# Verify Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if project is linked to Vercel
echo "� Checking if project is linked to Vercel..."
if ! vercel project ls &> /dev/null; then
    echo "⚠️ Your project isn't linked to Vercel yet."
    echo "ℹ️  Running 'vercel link' to set up the connection..."
    vercel link
fi

# Ask user if they want to proceed with CLI or manual setup
echo "🔄 How would you like to add the Gemini API key to Vercel?"
echo "1. Continue with CLI setup (requires project link)"
echo "2. Show manual setup instructions"
read -p "Select option [1/2]: " option

if [ "$option" = "1" ]; then
    # Try to add via CLI
    echo "🔑 Setting GEMINI_API_KEY in Vercel environment..."
    if echo "$API_KEY" | vercel env add GEMINI_API_KEY production; then
        echo "✅ Added to production environment!"
    else
        echo "❌ Error adding to production environment"
    fi

    echo "🔑 Setting GEMINI_API_KEY for development environment..."
    if echo "$API_KEY" | vercel env add GEMINI_API_KEY development; then
        echo "✅ Added to development environment!"
    else
        echo "❌ Error adding to development environment"
    fi

    echo "🔑 Setting GEMINI_API_KEY for preview environment..."
    if echo "$API_KEY" | vercel env add GEMINI_API_KEY preview; then
        echo "✅ Added to preview environment!"
    else
        echo "❌ Error adding to preview environment"
    fi
    
    echo "⚠️ You need to redeploy your application for changes to take effect."
    echo "📌 Run 'vercel --prod' to deploy to production."
fi

# Always show manual instructions
echo ""
echo "📝 Manual setup instructions for Vercel:"
echo "1. Log in to the Vercel dashboard at https://vercel.com/dashboard"
echo "2. Select your project: backend-two-zeta-41"
echo "3. Navigate to Settings > Environment Variables"
echo "4. Add a new variable with:"
echo "   - NAME: GEMINI_API_KEY"
echo "   - VALUE: $API_KEY"
echo "5. Select all environments (Production, Preview, Development)"
echo "6. Click 'Save'"
echo "7. Redeploy your application for the changes to take effect"
echo ""
echo "📋 Your Gemini API Key: $API_KEY"
echo "📋 Keep this key secure and don't share it publicly"