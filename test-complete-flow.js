const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

const BASE_URL = 'http://172.28.31.179:5001';

const testFullFlow = async () => {
  console.log("🧪 Testing complete authentication flow...");
  
  try {
    // Test login
    console.log("1️⃣ Testing login...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });
    
    const loginData = await loginResponse.json();
    console.log("📥 Login response:", {
      status: loginResponse.status,
      ok: loginResponse.ok,
      data: loginData
    });
    
    if (loginResponse.ok && loginData.token) {
      console.log("✅ Login successful!");
      console.log("🔑 Token received:", loginData.token.substring(0, 20) + "...");
      console.log("👤 User data:", loginData.user);
      
      // Test authenticated request
      console.log("\n2️⃣ Testing authenticated request...");
      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const meData = await meResponse.json();
      console.log("📥 Profile response:", {
        status: meResponse.status,
        ok: meResponse.ok,
        data: meData
      });
      
      if (meResponse.ok) {
        console.log("✅ Authenticated request successful!");
        console.log("🎯 Complete flow working correctly!");
        return true;
      } else {
        console.log("❌ Authenticated request failed");
        return false;
      }
    } else {
      console.log("❌ Login failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    return false;
  }
};

// Run the test
testFullFlow().then(success => {
  if (success) {
    console.log("\n🎉 All tests passed! Authentication flow is working correctly.");
  } else {
    console.log("\n💥 Tests failed! There's an issue with the authentication flow.");
  }
}).catch(error => {
  console.error("\n💥 Test execution failed:", error);
});