// Replace the /api/chat endpoint in your main server file (around line 620)
// Gemini API integration for the backend
import { ENV } from "../config/env.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = ENV.GEMINI_API_KEY;
const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY);

// REMOVE or comment out the duplicate /api/chat route
// Keep only ONE chat endpoint

app.post("/api/chat", async (req, res) => {
  try {
    console.log("📩 Received chat request");
    const { message } = req.body;

    if (!message) {
      console.error("❌ No message provided");
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("💬 User message:", message);

    // Check API key
    if (!process.env.GEMINI_API_KEY && !ENV.GEMINI_API_KEY) {
      console.error("❌ Gemini API key not configured");
      return res.status(500).json({ 
        error: "Gemini API key not configured on server" 
      });
    }

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are EcoZen AI, a friendly and knowledgeable assistant who helps users learn about sustainability, recycling, and eco-friendly living. Keep your responses concise and helpful."
    });

    // Generate content
    const result = await model.generateContent(message);
    const response = result.response;
    const aiResponse = response.text();

    console.log("✅ Gemini response:", aiResponse.substring(0, 100) + "...");

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("❌ Gemini chat error:", error);
    
    // More detailed error logging
    if (error.message) {
      console.error("Error message:", error.message);
    }
    if (error.response) {
      console.error("Error response:", error.response);
    }
    
    res.status(500).json({ 
      error: "Failed to get AI response",
      message: error.message || "Unknown error",
      details: error.toString()
    });
  }
});

// EcoZen AI Chat - Specialized in waste separation education
export const chatWithEcoZen = async (message, conversationHistory = []) => {
  try {
    console.log("🤖 EcoZen: Processing message:", message);

    // Create specialized prompt for waste separation education
    const systemPrompt = `You are EcoZen, a friendly and knowledgeable AI assistant specialized in waste separation and recycling education. Your mission is to help people learn how to properly separate, recycle, and dispose of different types of waste.

Key responsibilities:
- Provide clear, actionable advice on waste separation
- Explain recycling processes and environmental benefits
- Guide users on proper disposal methods for different materials
- Share tips for reducing waste and living sustainably
- Use emojis and friendly language to make learning engaging

Always be:
- Educational but not preachy
- Specific and practical in your advice
- Encouraging about small environmental actions
- Clear about local recycling rules when relevant

Current user message: "${message}"`;

    // Build conversation context
    const conversationText = conversationHistory
      .slice(-5) // Only use last 5 messages for context
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const fullPrompt = conversationText
      ? `${systemPrompt}\n\nConversation history:\n${conversationText}\n\nPlease respond to the current message.`
      : systemPrompt;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(GEMINI_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log("✅ EcoZen: Response generated");
      return aiResponse;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("❌ EcoZen chat error:", error);
    return "I'm having trouble connecting right now. Please try again later! 🤖";
  }
};

// Object Detection - Recycle symbol recognition
export const detectRecycleSymbol = async (imageBase64) => {
  try {
    console.log("📷 Analyzing image for recycle symbols...");

    const prompt = `Analyze this image and detect any recycling symbols or codes. Look for:

1. Recycling triangular symbols with numbers (1-7)
2. Material identification codes (PET, HDPE, PVC, LDPE, PP, PS, OTHER)
3. Other recycling-related symbols or text

Please provide:
- Detected symbol or code
- Material type if identifiable
- Specific recycling/disposal instructions
- Confidence level (0-1)

If no recycling symbols are found, clearly state that and suggest taking a clearer photo focusing on any symbols on the item.

Format your response as JSON with these fields:
{
  "detectedSymbol": "description of what was found",
  "recyclingCode": "number or code if applicable",
  "materialType": "type of material",
  "disposalInstructions": "specific instructions for recycling/disposal",
  "confidence": 0.85
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(GEMINI_VISION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log("✅ Vision analysis complete");

      // Try to parse JSON response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log("⚠️ Could not parse JSON, using text response");
      }

      // If JSON parsing fails, return a structured response
      return {
        detectedSymbol: "Analysis completed",
        recyclingCode: "Unknown",
        materialType: "See instructions",
        disposalInstructions: aiResponse,
        confidence: 0.7,
      };
    } else {
      throw new Error("Invalid response format from Gemini Vision API");
    }
  } catch (error) {
    console.error("❌ Vision detection error:", error);
    return {
      error: `Detection failed: ${error.message}. Please try again with a clearer image.`,
    };
  }
};
