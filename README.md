# WasteWise

WasteWise is a comprehensive mobile application built to promote sustainable waste management and recycling practices. The app helps users track their recycling habits, learn about proper waste separation, find nearby recycling centers, and get AI-powered assistance for identifying recyclable items.

## Features

### For Users
- Waste Logging: Track your daily recycling activities and monitor your environmental impact
- Recycling Centers Map: Find nearby recycling facilities with an interactive map
- Learning Hub: Access educational content about sustainable waste management
- EcoZen AI Chat: Get instant answers to your recycling and sustainability questions
- Waste Object Detection: Use your camera to identify recyclable items and get disposal guidance
- User Profile: Track your sustainability progress and achievements

### For Admins
- User Management: Manage user accounts and access levels
- Content Management: Create and update educational quizzes and articles
- Recycling Center Administration: Add, update, and verify recycling centers
- Inquiry System: Respond to user questions and provide assistance

## Tech Stack

### Frontend
- React Native
- Expo
- React Navigation
- Platform-specific components for optimized experiences

### Backend
- Node.js
- Express
- Drizzle ORM
- JWT Authentication

### Database
- PostgreSQL

### AI Integration
- Google Gemini API for natural language processing and image analysis
- Google Maps API for location services

### Deployment
- Vercel for backend hosting
- Expo for mobile app deployment

## Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- PostgreSQL

### Installation

1. Clone the repository
   git clone https://github.com/RavvyS/wastewise_V2.git
   cd wastewise_V2

2. Install dependencies for both backend and frontend
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../mobile
   npm install

3. Set up environment variables
   - Create a .env file in the backend directory with the following variables:
     DATABASE_URL=your_postgres_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5001
     GEMINI_API_KEY=your_gemini_api_key
     GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   - Create a .env file in the mobile directory with:
     EXPO_PUBLIC_API_URL=http://localhost:5001
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

4. Initialize the database
   cd backend
   npx drizzle-kit push:pg

5. Seed initial data
   node seed.js

### Running the Application

1. Start the backend server
   cd backend
   npm start

2. Start the mobile app
   cd mobile
   npm start

3. Use the Expo Go app on your mobile device or an emulator to view the application

## API Documentation

### Authentication Endpoints
- POST /api/auth/signup: Register a new user
- POST /api/auth/login: Authenticate user and get JWT token
- POST /api/auth/admin-signup: Create admin users (admin only)

### User Endpoints
- GET /api/auth/users: Get all users (admin only)
- PUT /api/auth/users/:id/role: Update user role (admin only)
- PUT /api/auth/users/:id/status: Activate/deactivate user (admin only)

### Waste Categories & Items
- GET /api/categories: Get all waste categories
- GET /api/categories/with-items: Get categories with their items
- GET /api/items: Get all waste items

### Recycling Centers
- GET /api/centers: Get all recycling centers
- POST /api/centers: Add a new recycling center
- PUT /api/centers/:id: Update recycling center details

### Learning Hub
- GET /api/learning-hub/quizzes: Get all quizzes
- GET /api/learning-hub/articles: Get all articles
- GET /api/quizzes/:id/full: Get quiz with questions

### AI Features
- POST /api/chat: Send a message to the AI chatbot
- POST /api/gemini/chat: Get response from Gemini AI chatbot
- POST /api/gemini/detect: Process image for waste object detection

## Environment Setup Guides
- API Key Setup Guide (GEMINI_API_SETUP.md)
- Vercel Deployment Guide (VERCEL_GEMINI_SETUP.md)

## Contributing

We welcome contributions to improve WasteWise! Please follow these steps:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sustainable development and recycling education resources
- Google AI for providing the Gemini API
- All contributors who have helped in development

Made with ❤️ by Team WasteWise
<p align="center">
  <img width="704" height="1472" alt="WasteWise App Screens" src="https://github.com/user-attachments/assets/e94d3d9c-a3e1-4df1-963c-794b34f98454" />
</p>
