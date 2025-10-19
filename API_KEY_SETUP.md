# API Key Setup Instructions

## Google Maps API Key

The Google Maps API key has been added to the local development environment. To add it to your Vercel deployment, follow these steps:

1. Log in to your Vercel account and open your backend project dashboard
2. Click on "Settings" in the top navigation
3. Go to the "Environment Variables" tab
4. Add the following environment variables:

```
GOOGLE_MAPS_API_KEY=AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA
GEMINI_API_KEY=AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA
```

5. Click "Save" to apply the changes
6. Redeploy your project to apply the new environment variables

## Local Development Setup

The API keys have been added to:

- Backend: `backend/src/config/env.js` with fallback values
- Frontend: `mobile/.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

## Usage

Import the Google Maps API key in your frontend components:

```typescript
import { GOOGLE_MAPS_API_KEY } from '../utils/maps';
```

Use it in any component that requires Google Maps integration, such as:

```typescript
<MapView
  provider={PROVIDER_GOOGLE}
  apiKey={GOOGLE_MAPS_API_KEY}
  // ...other props
/>
```

## Security Notes

- The API key is restricted to specific domains and IP addresses
- It should be kept secure and not committed to public repositories
- It should be managed through environment variables where possible
- For production, consider using a more secure key management system