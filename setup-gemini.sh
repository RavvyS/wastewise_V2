#!/bin/bash

# Script to add environment variables for Gemini API key

# Set colors for better visibility
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API Key
API_KEY="AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA"

echo -e "${BLUE}Setting up Gemini API key for WasteWise app...${NC}"

# 1. Create or update .env file in the frontend (mobile) directory
echo -e "${BLUE}Setting up frontend environment...${NC}"
FRONTEND_ENV_FILE="./mobile/.env"

# Check if file exists
if [ -f "$FRONTEND_ENV_FILE" ]; then
  # Check if variable already exists in the file
  if grep -q "EXPO_PUBLIC_GEMINI_API_KEY" "$FRONTEND_ENV_FILE"; then
    # Replace existing value
    sed -i '' "s/EXPO_PUBLIC_GEMINI_API_KEY=.*/EXPO_PUBLIC_GEMINI_API_KEY=$API_KEY/" "$FRONTEND_ENV_FILE"
  else
    # Append to file
    echo "EXPO_PUBLIC_GEMINI_API_KEY=$API_KEY" >> "$FRONTEND_ENV_FILE"
  fi
else
  # Create new file
  echo "EXPO_PUBLIC_GEMINI_API_KEY=$API_KEY" > "$FRONTEND_ENV_FILE"
fi

# 2. Create or update .env file in the backend directory
echo -e "${BLUE}Setting up backend environment...${NC}"
BACKEND_ENV_FILE="./backend/.env"

# Check if file exists
if [ -f "$BACKEND_ENV_FILE" ]; then
  # Check if variable already exists in the file
  if grep -q "GEMINI_API_KEY" "$BACKEND_ENV_FILE"; then
    # Replace existing value
    sed -i '' "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$API_KEY/" "$BACKEND_ENV_FILE"
  else
    # Append to file
    echo "GEMINI_API_KEY=$API_KEY" >> "$BACKEND_ENV_FILE"
  fi
else
  # Create new file
  echo "GEMINI_API_KEY=$API_KEY" > "$BACKEND_ENV_FILE"
fi

echo -e "${GREEN}✅ Environment variables set up successfully!${NC}"

# Instructions for Vercel deployment
echo -e "\n${BLUE}Instructions for Vercel deployment:${NC}"
echo -e "1. Log in to your Vercel dashboard"
echo -e "2. Select your project"
echo -e "3. Go to Settings > Environment Variables"
echo -e "4. Add a new variable with:"
echo -e "   - NAME: ${GREEN}GEMINI_API_KEY${NC}"
echo -e "   - VALUE: ${GREEN}$API_KEY${NC}"
echo -e "5. Select all environments (Production, Preview, Development)"
echo -e "6. Click 'Save'"
echo -e "7. Redeploy your application for changes to take effect"

# Make the other scripts executable
chmod +x ./add-vercel-env.sh 2>/dev/null || true

echo -e "\n${GREEN}Done! You can now use the Gemini API for AI chatbot and object detection.${NC}"