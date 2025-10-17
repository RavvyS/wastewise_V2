// Replace the /api/chat endpoint in your main server file (around line 620)

import { GoogleGenerativeAI } from '@google/generative-ai';

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