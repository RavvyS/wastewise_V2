#!/usr/bin/env node

// Setup script for the Waste Management App Authentication System
const fs = require('fs');
const path = require('path');

const envTemplate = `# Waste Management App Environment Configuration

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/wasteapp

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Super Admin Secret for Initial Setup
SUPER_ADMIN_SECRET=super-secret-admin-key-2024

# Server Configuration
PORT=8001

# Development Settings
NODE_ENV=development
`;

const packageJsonUpdates = {
  scripts: {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "node ../test-auth-improved.js",
    "seed": "node seed.js",
    "migrate": "drizzle-kit generate && drizzle-kit migrate"
  }
};

function createEnvFile() {
  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Created .env file at backend/.env');
    console.log('⚠️  Please update the DATABASE_URL and JWT_SECRET values');
  } else {
    console.log('ℹ️  .env file already exists');
  }
}

function updatePackageJson() {
  const packagePath = path.join(__dirname, 'backend', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Merge scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      ...packageJsonUpdates.scripts
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
  }
}

function checkDependencies() {
  const packagePath = path.join(__dirname, 'backend', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = [
      'express',
      'cors',
      'bcrypt',
      'jsonwebtoken',
      'dotenv',
      'drizzle-orm',
      '@neondatabase/serverless'
    ];
    
    const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
    
    if (missingDeps.length > 0) {
      console.log('⚠️  Missing required dependencies:');
      missingDeps.forEach(dep => console.log(`   - ${dep}`));
      console.log('\nInstall them with:');
      console.log(`npm install ${missingDeps.join(' ')}`);
    } else {
      console.log('✅ All required dependencies are installed');
    }
  }
}

function displaySetupInstructions() {
  console.log('\n🚀 Waste Management App Setup Instructions\n');
  
  console.log('1. Database Setup:');
  console.log('   - Create a PostgreSQL database');
  console.log('   - Update DATABASE_URL in backend/.env');
  console.log('   - Run: cd backend && npm run migrate');
  
  console.log('\n2. Environment Configuration:');
  console.log('   - Update JWT_SECRET in backend/.env');
  console.log('   - Set SUPER_ADMIN_SECRET for initial admin creation');
  
  console.log('\n3. Install Dependencies:');
  console.log('   - cd backend && npm install');
  
  console.log('\n4. Start the Server:');
  console.log('   - cd backend && npm run dev');
  
  console.log('\n5. Create First Admin:');
  console.log('   - Use the super admin creation endpoint');
  console.log('   - Or visit: http://localhost:8001/api/auth/create-super-admin');
  
  console.log('\n6. Test the System:');
  console.log('   - Run: npm test (from backend directory)');
  console.log('   - Or manually test endpoints with the provided test file');
  
  console.log('\n📚 Documentation:');
  console.log('   - See AUTH_DOCUMENTATION.md for detailed API docs');
  console.log('   - Check test-auth-improved.js for usage examples');
}

function main() {
  console.log('🔧 Setting up Waste Management App Authentication System...\n');
  
  try {
    createEnvFile();
    updatePackageJson();
    checkDependencies();
    displaySetupInstructions();
    
    console.log('\n✨ Setup complete! Follow the instructions above to get started.');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

main();