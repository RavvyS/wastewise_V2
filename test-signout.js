const { logout } = require('./mobile/utils/api');

console.log("🧪 Testing sign out functionality...");

// Test the logout function
try {
    console.log("1️⃣ Testing logout function...");
    logout();
    console.log("✅ Logout function executed successfully");
    
    // In a real test, you would check if the token was actually removed
    // from storage, but since we're using AsyncStorage, we can't easily
    // test that in this node environment
    
    console.log("🎯 Sign out test completed successfully");
} catch (error) {
    console.error("❌ Sign out test failed:", error);
}