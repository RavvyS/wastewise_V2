import Constants from "expo-constants";

// Get the backend API URL from environment variables or fallback to your LAN IP
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  "http://192.168.8.189:8001"; // Default fallback

if (API_URL === "http://192.168.8.189:8001") {
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
}

export async function chatWithEcoZen(userInput: string): Promise<string> {
  try {
    // POST request to backend
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput }),
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ErrorResponse;
      throw new Error(errorData.error || errorData.message || `Backend returned status ${response.status}`);
    }

    // Parse successful response
    const data = (await response.json()) as ChatResponse;
    return data.response || "Sorry, I couldn't understand that.";

  } catch (error: any) {
    console.error("❌ Error talking to backend:", error);

    // Network or fetch failure
    if (error instanceof TypeError && error.message.includes("Network request failed")) {
      return "Cannot connect to the server. Please check your internet connection and make sure your backend is running.";
    }

    // Return friendly error for all other issues
    return "I'm having trouble connecting to the AI service right now. Please try again later.";
  }
}
