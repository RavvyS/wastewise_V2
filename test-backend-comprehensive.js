const BASE_URL = "http://172.28.21.159:5001";

console.log("🧪 Testing WasteWise Backend Connection...\n");

// Test 1: Basic connectivity
async function testConnectivity() {
  console.log("1️⃣ Testing basic connectivity...");
  try {
    const response = await fetch(`${BASE_URL}/api/categories`);
    const data = await response.json();
    console.log("✅ Backend is accessible");
    console.log(`📦 Found ${data.length} waste categories`);
    return true;
  } catch (error) {
    console.error("❌ Backend connectivity failed:", error.message);
    return false;
  }
}

// Test 2: Test user creation
async function testUserCreation() {
  console.log("\n2️⃣ Testing user creation...");
  try {
    const userData = {
      name: "Test Login User",
      email: "testlogin@example.com",
      password: "password123",
    };

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ User created successfully");
      console.log(`👤 User: ${data.user.name} (${data.user.email})`);
      return { success: true, user: data.user, token: data.token };
    } else {
      if (data.error === "User with this email already exists") {
        console.log("⚠️ User already exists, that's OK");
        return { success: true, userExists: true };
      } else {
        console.error("❌ User creation failed:", data.error);
        return { success: false };
      }
    }
  } catch (error) {
    console.error("❌ User creation error:", error.message);
    return { success: false };
  }
}

// Test 3: Test login
async function testLogin() {
  console.log("\n3️⃣ Testing login...");
  try {
    const credentials = {
      email: "testlogin@example.com",
      password: "password123",
    };

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log(`👤 Welcome back: ${data.user.name}`);
      console.log(`🔑 Token received: ${data.token.substring(0, 20)}...`);
      return { success: true, token: data.token, user: data.user };
    } else {
      console.error("❌ Login failed:", data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return { success: false, error: error.message };
  }
}

// Test 4: Test authenticated request
async function testAuthenticatedRequest(token) {
  console.log("\n4️⃣ Testing authenticated request...");
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Authenticated request successful!");
      console.log(`👤 Current user: ${data.name} (${data.email})`);
      return { success: true };
    } else {
      console.error("❌ Authenticated request failed:", data.error);
      return { success: false };
    }
  } catch (error) {
    console.error("❌ Authenticated request error:", error.message);
    return { success: false };
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting comprehensive backend tests...\n");

  const connectivityResult = await testConnectivity();
  if (!connectivityResult) {
    console.log(
      "\n💥 Backend is not accessible. Please start the backend server!"
    );
    return;
  }

  const userCreationResult = await testUserCreation();
  if (!userCreationResult.success) {
    console.log("\n💥 User creation failed. Check backend logs!");
    return;
  }

  const loginResult = await testLogin();
  if (!loginResult.success) {
    console.log("\n💥 Login failed. Check credentials or backend!");
    return;
  }

  const authResult = await testAuthenticatedRequest(loginResult.token);
  if (!authResult.success) {
    console.log("\n💥 Authentication verification failed!");
    return;
  }

  console.log("\n🎉 ALL TESTS PASSED! The backend is working perfectly!");
  console.log("\n📋 Summary:");
  console.log("✅ Backend connectivity: Working");
  console.log("✅ User registration: Working");
  console.log("✅ User login: Working");
  console.log("✅ JWT authentication: Working");
  console.log("\n🎯 Your mobile app should now be able to login successfully!");
}

runAllTests().catch((error) => {
  console.error("💥 Test suite failed:", error);
});
