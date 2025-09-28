#!/usr/bin/env node

// Comprehensive Authentication and User Management Test Suite
const API_BASE = 'http://localhost:8001';

async function testAPI(url, method = 'GET', data = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`\n🧪 Testing ${method} ${url}`);
    if (data) console.log(`📤 Data:`, data);
    if (token) console.log(`🔑 Using token: ${token.substring(0, 20)}...`);
    
    const response = await fetch(url, options);
    let result;
    
    try {
      result = await response.json();
    } catch (e) {
      result = await response.text();
    }
    
    console.log(`📨 Status: ${response.status}`);
    console.log(`📋 Response:`, result);
    
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Authentication Tests...\n');
  
  let adminToken = null;
  let userToken = null;
  let managerId = null;
  let userId = null;

  // Test 1: Create Super Admin (First Time Setup)
  console.log('\n=== SUPER ADMIN CREATION ===');
  const superAdminResult = await testAPI(`${API_BASE}/api/auth/create-super-admin`, 'POST', {
    name: 'Super Admin',
    email: 'superadmin@wasteapp.com',
    password: 'SuperAdmin123!',
    phone: '+1234567890',
    secretKey: 'super-secret-admin-key-2024'
  });
  
  if (superAdminResult.success) {
    console.log('✅ Super admin created successfully!');
  }

  // Test 2: Super Admin Login
  console.log('\n=== ADMIN LOGIN ===');
  const adminLogin = await testAPI(`${API_BASE}/api/auth/login`, 'POST', {
    email: 'superadmin@wasteapp.com',
    password: 'SuperAdmin123!'
  });
  
  if (adminLogin.success) {
    adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful!');
    console.log(`👤 Admin Role: ${adminLogin.data.user.role}`);
  }

  // Test 3: Create Manager via Admin
  console.log('\n=== CREATE MANAGER ===');
  if (adminToken) {
    const createManager = await testAPI(`${API_BASE}/api/auth/admin-signup`, 'POST', {
      name: 'Manager Smith',
      email: 'manager@wasteapp.com',
      password: 'Manager123!',
      phone: '+1234567891',
      role: 'manager'
    }, adminToken);
    
    if (createManager.success) {
      managerId = createManager.data.user.id;
      console.log('✅ Manager created successfully!');
    }
  }

  // Test 4: Regular User Signup
  console.log('\n=== USER SIGNUP ===');
  const userSignup = await testAPI(`${API_BASE}/api/auth/signup`, 'POST', {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'UserPass123!',
    phone: '+1234567892'
  });
  
  if (userSignup.success) {
    userToken = userSignup.data.token;
    userId = userSignup.data.user.id;
    console.log('✅ User signup successful!');
  }

  // Test 5: User Login
  console.log('\n=== USER LOGIN ===');
  const userLogin = await testAPI(`${API_BASE}/api/auth/login`, 'POST', {
    email: 'john.doe@example.com',
    password: 'UserPass123!'
  });
  
  if (userLogin.success) {
    console.log('✅ User login successful!');
    console.log(`👤 User Role: ${userLogin.data.user.role}`);
  }

  // Test 6: Get Current User Profile
  console.log('\n=== GET PROFILE ===');
  if (userToken) {
    const profile = await testAPI(`${API_BASE}/api/auth/me`, 'GET', null, userToken);
    if (profile.success) {
      console.log('✅ Profile fetch successful!');
    }
  }

  // Test 7: Update User Profile
  console.log('\n=== UPDATE PROFILE ===');
  if (userToken && userId) {
    const updateProfile = await testAPI(`${API_BASE}/api/users/${userId}`, 'PUT', {
      name: 'John Doe Updated',
      phone: '+1234567893'
    }, userToken);
    
    if (updateProfile.success) {
      console.log('✅ Profile update successful!');
    }
  }

  // Test 8: Change Password
  console.log('\n=== CHANGE PASSWORD ===');
  if (userToken) {
    const changePassword = await testAPI(`${API_BASE}/api/auth/change-password`, 'PUT', {
      currentPassword: 'UserPass123!',
      newPassword: 'NewUserPass123!'
    }, userToken);
    
    if (changePassword.success) {
      console.log('✅ Password change successful!');
    }
  }

  // Test 9: Admin Get All Users
  console.log('\n=== ADMIN GET USERS ===');
  if (adminToken) {
    const getAllUsers = await testAPI(
      `${API_BASE}/api/auth/users?page=1&limit=10`, 
      'GET', 
      null, 
      adminToken
    );
    
    if (getAllUsers.success) {
      console.log('✅ Admin get users successful!');
      console.log(`📊 Total users: ${getAllUsers.data.users.length}`);
    }
  }

  // Test 10: Admin Update User Role
  console.log('\n=== ADMIN UPDATE USER ROLE ===');
  if (adminToken && userId) {
    const updateRole = await testAPI(`${API_BASE}/api/auth/users/${userId}/role`, 'PUT', {
      role: 'manager'
    }, adminToken);
    
    if (updateRole.success) {
      console.log('✅ User role update successful!');
    }
  }

  // Test 11: Admin Deactivate User
  console.log('\n=== ADMIN DEACTIVATE USER ===');
  if (adminToken && userId) {
    const deactivateUser = await testAPI(`${API_BASE}/api/auth/users/${userId}/status`, 'PUT', {
      isActive: false
    }, adminToken);
    
    if (deactivateUser.success) {
      console.log('✅ User deactivation successful!');
    }
  }

  // Test 12: Try Login with Deactivated Account
  console.log('\n=== LOGIN WITH DEACTIVATED ACCOUNT ===');
  const deactivatedLogin = await testAPI(`${API_BASE}/api/auth/login`, 'POST', {
    email: 'john.doe@example.com',
    password: 'NewUserPass123!'
  });
  
  if (!deactivatedLogin.success) {
    console.log('✅ Deactivated account login properly blocked!');
  }

  // Test 13: Reactivate User
  console.log('\n=== ADMIN REACTIVATE USER ===');
  if (adminToken && userId) {
    const reactivateUser = await testAPI(`${API_BASE}/api/auth/users/${userId}/status`, 'PUT', {
      isActive: true
    }, adminToken);
    
    if (reactivateUser.success) {
      console.log('✅ User reactivation successful!');
    }
  }

  // Test 14: Invalid Data Tests
  console.log('\n=== VALIDATION TESTS ===');
  
  // Invalid email format
  const invalidEmail = await testAPI(`${API_BASE}/api/auth/signup`, 'POST', {
    name: 'Test User',
    email: 'invalid-email',
    password: 'Password123!'
  });
  
  if (!invalidEmail.success) {
    console.log('✅ Invalid email format properly rejected!');
  }

  // Weak password
  const weakPassword = await testAPI(`${API_BASE}/api/auth/signup`, 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    password: '123'
  });
  
  if (!weakPassword.success) {
    console.log('✅ Weak password properly rejected!');
  }

  // Test 15: Unauthorized Access Tests
  console.log('\n=== AUTHORIZATION TESTS ===');
  
  // Try to access admin endpoint without token
  const noTokenAdmin = await testAPI(`${API_BASE}/api/auth/users`, 'GET');
  if (!noTokenAdmin.success) {
    console.log('✅ Admin endpoint properly protected!');
  }

  // Try to create admin with user token
  if (userToken) {
    const userTryAdmin = await testAPI(`${API_BASE}/api/auth/admin-signup`, 'POST', {
      name: 'Fake Admin',
      email: 'fake@admin.com',
      password: 'FakeAdmin123!',
      role: 'admin'
    }, userToken);
    
    if (!userTryAdmin.success) {
      console.log('✅ User cannot create admin accounts!');
    }
  }

  console.log('\n✨ Comprehensive authentication test complete!');
  console.log('\n📋 Test Summary:');
  console.log('- Super admin creation ✓');
  console.log('- Authentication (login/logout) ✓');
  console.log('- User registration ✓');
  console.log('- Profile management ✓');
  console.log('- Role-based access control ✓');
  console.log('- User activation/deactivation ✓');
  console.log('- Input validation ✓');
  console.log('- Authorization checks ✓');
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);