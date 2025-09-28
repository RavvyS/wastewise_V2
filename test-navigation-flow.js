#!/usr/bin/env node

// Quick test to verify authentication and navigation flow
const API_BASE = 'http://172.28.20.136:5001';

async function testSignupFlow() {
  console.log('🧪 Testing signup flow...\n');
  
  try {
    const testUser = {
      name: 'Test User Navigation',
      email: `test.nav.${Date.now()}@example.com`,
      password: 'password123'
    };
    
    console.log('📤 Sending signup request...');
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Signup successful!');
    console.log('📋 Response data:', {
      hasUser: !!data.user,
      hasToken: !!data.token,
      userName: data.user?.name,
      userRole: data.user?.role,
      message: data.message
    });
    
    if (data.token) {
      console.log('🔑 Token received (length):', data.token.length);
    }
    
    // Test if we can access a protected endpoint with the token
    console.log('\n🔒 Testing protected endpoint...');
    const profileResponse = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Protected endpoint accessible');
      console.log('👤 User profile:', profileData);
    } else {
      console.log('❌ Protected endpoint failed:', profileResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSignupFlow();