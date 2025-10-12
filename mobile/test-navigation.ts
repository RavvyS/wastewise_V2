import { router } from "expo-router";

// Test navigation function
const testNavigation = () => {
  console.log("🧪 Testing navigation...");
  
  try {
    console.log("📱 Attempting to navigate to /(tabs)...");
    router.replace("/(tabs)");
    console.log("✅ Navigation command executed successfully");
  } catch (error) {
    console.error("❌ Navigation failed:", error);
  }
};

export default testNavigation;