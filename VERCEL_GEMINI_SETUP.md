# Adding Gemini API Key to Vercel

This guide provides step-by-step instructions for adding the Google Gemini API key to your Vercel project.

## API Key Information

- **API Key**: `AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA`
- **Environment Variable Name**: `GEMINI_API_KEY`

## Adding the API Key to Vercel Dashboard

### Step 1: Access the Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Log in to your account

### Step 2: Navigate to Project Settings
1. Find and click on your project (`backend-two-zeta-41`)
2. Click on the "Settings" tab in the top navigation

### Step 3: Add Environment Variable
1. In the left sidebar, click on "Environment Variables"
2. Click on "Add New" button
3. Fill in the following:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA`
   - **Environments**: Check all environments (Production, Preview, Development)
4. Click "Save" to add the variable

### Step 4: Redeploy Your Application
1. Go back to the "Deployments" tab
2. Click on the "Redeploy" button for your latest deployment
3. This will create a new deployment with your new environment variable

## Verifying the API Key is Working

1. Once the deployment is complete, open your application
2. Navigate to any AI-powered feature (chatbot, object detection)
3. Test the functionality to ensure the API key is working correctly

## Troubleshooting

If you encounter issues:

1. **API Key Not Available**: Check that you've spelled the environment variable name correctly (`GEMINI_API_KEY`)
2. **API Not Working**: Check Vercel logs for any API-related errors
3. **Quota Exceeded**: Verify that you haven't exceeded the free tier limits for the Gemini API

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Testing Gemini API Connection](https://ai.google.dev/tutorials/rest_quickstart)