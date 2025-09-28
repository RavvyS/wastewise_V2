#!/usr/bin/env node

// Test authentication endpoints
const API_BASE = 'http://localhost:5001';

async function testAPI(url, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`\n🧪 Testing ${method} ${url}`);
    console.log(`📤 Data:`, data || 'None');
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`📨 Status: ${response.status}`);
    console.log(`📋 Response:`, result);
    
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test 1: User Signup
  const userSignup = await testAPI(`${API_BASE}/api/auth/signup`, 'POST', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });
  
  let userToken = null;
  if (userSignup.success) {
    userToken = userSignup.data.token;
    console.log('✅ User signup successful!');
  }
  
  // Test 2: User Login
  const userLogin = await testAPI(`${API_BASE}/api/auth/login`, 'POST', {
    email: 'john@example.com',
    password: 'password123'
  });
  
  if (userLogin.success) {
    console.log('✅ User login successful!');
    console.log(`👤 User Role: ${userLogin.data.user.role}`);
  }
  
  // Test 3: Get current user profile
  if (userToken) {
    const profile = await testAPI(`${API_BASE}/api/auth/me`, 'GET', null, userToken);
    if (profile.success) {
      console.log('✅ Profile fetch successful!');
    }
  }
  
  // Test 4: Admin Signup (first create an admin manually)
  const adminSignup = await testAPI(`${API_BASE}/api/auth/signup`, 'POST', {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'  // This won't work with regular signup, but let's test
  });
  
  // Test 5: Categories endpoint (should work for all users)
  const categories = await testAPI(`${API_BASE}/api/categories/with-items`);
  if (categories.success) {
    console.log('✅ Categories endpoint working!');
    console.log(`📊 Found ${categories.data.length} categories`);
  }
  
  console.log('\n✨ Authentication test complete!');
}

// Run the tests
runTests().catch(console.error);