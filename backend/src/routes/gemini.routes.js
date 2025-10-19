// Gemini API Routes for AI chat bot and object detection
import express from "express";
import fetch from "node-fetch";
import { ENV } from "../config/env.js";

const router = express.Router();

/**
 * @route   POST /api/gemini/chat
 * @desc    Process chat message with Gemini API
 * @access  Public
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // Build prompt with conversation history context
    let prompt = message;
    if (conversationHistory.length > 0) {
      prompt = `Previous conversation:\n${conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n")}\n\nUser: ${message}\nAssistant:`;
    }

    // Add context about being a waste management assistant
    const systemContext =
      "You are EcoZen, an AI assistant focused on waste management, recycling, and sustainability. " +
      "Provide helpful, accurate, and concise information about proper waste disposal, recycling tips, " +
      "environmental impacts, and sustainable living practices. Be friendly and educational.";

    const finalPrompt = `${systemContext}\n\n${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${ENV.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: finalPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    // Check if we have a valid response
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Unexpected Gemini API response:", data);
      return res.status(500).json({
        success: false,
        error: "Failed to generate response from AI",
        details: data.error || "Unknown error",
      });
    }

    // Return the response text
    return res.json({
      success: true,
      data: {
        response: data.candidates[0].content.parts[0].text,
      },
    });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error processing chat",
      details: error.message,
    });
  }
});

/**
 * @route   POST /api/gemini/detect
 * @desc    Process image for object detection with Gemini Vision
 * @access  Public
 */
router.post("/detect", async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Image data is required",
      });
    }

    // Default detection prompt if not provided
    const detectionPrompt =
      prompt ||
      "Analyze this image and identify any waste or recyclable items. For each item, specify: " +
        "1) What it is, 2) What category it belongs to (plastic, paper, metal, glass, organic, electronic, hazardous, non-recyclable), " +
        "and 3) How it should be properly disposed of or recycled. Format as a bulleted list.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${ENV.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: detectionPrompt,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    // Check if we have a valid response
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      console.error("Unexpected Gemini API response:", data);
      return res.status(500).json({
        success: false,
        error: "Failed to analyze image",
        details: data.error || "Unknown error",
      });
    }

    // Return the detection result
    return res.json({
      success: true,
      data: {
        detection: data.candidates[0].content.parts[0].text,
      },
    });
  } catch (error) {
    console.error("Gemini detection error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error processing image",
      details: error.message,
    });
  }
});

/**
 * @route   GET /api/gemini/status
 * @desc    Check if Gemini API is working
 * @access  Public
 */
router.get("/status", async (req, res) => {
  try {
    // Simple prompt to test if API is responsive
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${ENV.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello, are you working? Respond with only one word: yes or no.",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    const data = await response.json();

    // Check if we got a valid response
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.json({
        success: true,
        status: "operational",
        message: "Gemini API is working properly",
      });
    } else {
      return res.status(500).json({
        success: false,
        status: "error",
        error: "Gemini API returned an invalid response",
        details: data.error || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Gemini status check error:", error);
    return res.status(500).json({
      success: false,
      status: "error",
      error: "Failed to connect to Gemini API",
      details: error.message,
    });
  }
});

export default router;
