# Setting up Gemini API in Vercel

This document provides instructions for adding the Google Gemini API key to your Vercel deployment.

## Automatic Setup

We've created a script to automatically add the Gemini API key to your Vercel project:

```bash
# Run the script
./add-gemini-to-vercel.sh
```

This will:
1. Check if Vercel CLI is installed (and install it if needed)
2. Add the Gemini API key to all Vercel environments (Production, Preview, Development)

## Manual Setup

If you prefer to add the API key manually:

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add a new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA`
5. Select all environments (Production, Preview, Development)
6. Click **Save**
7. Redeploy your application

## Verifying the Setup

After setting up the API key, you can verify it's working by:

1. Deploying your application with `vercel --prod`
2. Opening your application and navigating to any AI-powered features
3. Testing the chatbot or object detection functionality

## API Usage

The Gemini API key is used for:
- AI chatbot functionality
- Waste object detection and identification
- Smart recycling recommendations

## Troubleshooting

If you encounter issues with the API key:

1. Check that the environment variable is correctly set in your Vercel project settings
2. Ensure your application is redeployed after adding the environment variable
3. Check for any API quota limitations or errors in your application logs