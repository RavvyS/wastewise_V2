// services/EcoZenAI.ts

import Constants from "expo-constants";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  "http://10.0.2.2:5001"; 

console.log("🔧 API_URL configured as:", API_URL);

if (API_URL === "http://10.0.2.2:5001") {
  console.warn(
    "⚠️ WARNING: Using default API URL. " +
      "Set 'EXPO_PUBLIC_API_URL' in your .env file to your backend server address."
  );
}

interface ChatResponse {
  response: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

export async function chatWithEcoZen(userInput: string): Promise<string> {
  console.log("🚀 chatWithEcoZen called with:", userInput);
  
  try {
    const url = `${API_URL}/api/chat`;
    console.log("📡 Full URL:", url);
    console.log("📦 Request payload:", JSON.stringify({ message: userInput }));
    
    // Increase timeout to 30 seconds for AI response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("📨 Response status:", response.status);
    console.log("📨 Response headers:", JSON.stringify(Object.fromEntries(response.headers)));

    if (!response.ok) {
      let errorData: ErrorResponse = {};
      try {
        errorData = await response.json();
      } catch (e) {
        console.error("❌ Failed to parse error response:", e);
      }
      console.error("❌ Backend error data:", errorData);
      
      throw new Error(
        errorData.error || 
        errorData.message || 
        errorData.details ||
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as ChatResponse;
    console.log("✅ Success! Received data:", data);
    
    if (!data.response) {
      throw new Error("Server returned empty response");
    }
    
    return data.response;

  } catch (error: any) {
    console.error("❌ FULL ERROR OBJECT:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      return "⏱️ The AI is taking too long to respond. This might mean:\n\n1. Your Gemini API key is invalid or missing\n2. The backend server is slow\n3. Network connection is unstable\n\nPlease check your backend logs.";
    }

    // Handle network errors
    if (error instanceof TypeError) {
      if (error.message.includes("Network request failed")) {
        return `❌ Cannot reach server at ${API_URL}\n\nPlease check:\n1. Backend is running (you should see '✅ Server running on port 8001')\n2. Your phone and computer are on the same WiFi\n3. Use your computer's actual IP address`;
      }
      if (error.message.includes("Failed to fetch")) {
        return "Network error. Check your internet connection and backend server.";
      }
    }

    return `Connection error: ${error.message}`;
  }
}

// Test connection function
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🧪 Testing connection to:", API_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_URL}/api/learning-hub/quizzes`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log("🧪 Test response status:", response.status);
    
    if (response.ok) {
      return { 
        success: true, 
        message: `✅ Connected to server at ${API_URL}` 
      };
    } else {
      return { 
        success: false, 
        message: `❌ Server responded with status ${response.status}` 
      };
    }
  } catch (error: any) {
    console.error("🧪 Connection test failed:", error);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        message: `⏱️ Connection timeout. Server at ${API_URL} is not responding.` 
      };
    }
    
    return { 
      success: false, 
      message: `❌ Cannot reach ${API_URL}\n\nError: ${error.message}` 
    };
  }
}