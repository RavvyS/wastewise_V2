// services/EcoZenAI.ts (or wherever your fetch service is located)

import Constants from "expo-constants";

// Get the backend API URL from environment variables or fallback to Android emulator address
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5001"; 

if (!process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    "⚠️ WARNING: EXPO_PUBLIC_API_URL not set in .env file. " +
      "Using fallback: http://10.0.2.2:5001"
  );
}

interface ChatResponse {
  response: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

export async function chatWithEcoZen(userInput: string): Promise<string> {
  try {
    // POST request to the Node.js backend /api/chat endpoint
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    // Handle non-2xx responses (this is where the 500 error from your backend gets caught)
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ErrorResponse;
      // This error now includes the backend's error message (e.g., if the Gemini API fails)
      throw new Error(errorData.error || errorData.message || `Backend returned status ${response.status}`);
    }

    // Parse successful response
    const result = await response.json();
    // Handle both formats: { response: "..." } and { data: { response: "..." } }
    const data = result.data || result;
    return data.response || "Sorry, I couldn't understand that.";

  } catch (error: any) {
    console.error("❌ Error talking to backend:", error);

    // Network or fetch failure (e.g., firewall or wrong IP)
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      return "Cannot connect to the server. Please check your internet connection and make sure your backend is running.";
    }

    // Return friendly error for all other issues (including backend/Gemini failure)
    return `I'm having trouble connecting to the AI service right now. Details: ${error.message}`;
  }
}