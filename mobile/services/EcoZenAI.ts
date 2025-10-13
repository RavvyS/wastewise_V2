import Constants from "expo-constants";
import OpenAI from "openai";

// Define a fallback key to prevent the app from crashing during initialization
// if the real key is missing from the environment variables.
// NOTE: API calls will still fail until you fix your environment variables.
const FALLBACK_DUMMY_KEY = "sk-DUMMY-KEY-NOT-CONFIGURED";

// Check all standard locations for the API key
const apiKey = 
    process.env.EXPO_PUBLIC_OPENAI_API_KEY || 
    Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || 
    Constants.expoConfig?.extra?.OPENAI_API_KEY ||
    FALLBACK_DUMMY_KEY; // Use the dummy key as a last resort to allow initialization


if (apiKey === FALLBACK_DUMMY_KEY) {
    console.warn(
        "WARNING: Using dummy API key. Ensure 'EXPO_PUBLIC_OPENAI_API_KEY' " + 
        "is set in your .env file and the server is restarted. AI functions will fail."
    );
}

// Initialize OpenAI. Since apiKey is now guaranteed to be a string, 
// the initialization crash is bypassed.
const openai = new OpenAI({
  apiKey: apiKey,
});

export async function chatWithEcoZen(userInput: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are EcoZen AI, a friendly and knowledgeable assistant who helps users learn about sustainability, recycling, and eco-friendly living.",
        },
        { role: "user", content: userInput },
      ],
    });

    const aiResponse =
      completion.choices[0].message?.content?.trim() ??
      "Sorry, I couldn’t understand that.";

    return aiResponse;
  } catch (error) {
    // This catch block will now handle the 401 Unauthorized error (from the dummy key)
    // or any other connection error.
    console.error("Error talking to OpenAI:", error);
    return "I’m having trouble connecting to the AI service right now. Please check your API key.";
  }
}
