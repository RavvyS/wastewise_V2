import express from "express";
import { chatWithEcoZen, detectRecycleSymbol } from "../utils/gemini.js";

const router = express.Router();

// EcoZen AI Chat Endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string",
      });
    }

    console.log("💬 Chat request from user:", req.user?.id || "unknown");

    const response = await chatWithEcoZen(message, conversationHistory);

    res.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process chat message",
    });
  }
});

// Recycle Symbol Detection Endpoint
router.post("/detect", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        success: false,
        error: "Base64 image data is required",
      });
    }

    console.log("📷 Detection request from user:", req.user?.id || "unknown");

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    const detection = await detectRecycleSymbol(base64Data);

    res.json({
      success: true,
      data: {
        detection,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Detection API error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze image",
    });
  }
});

export default router;
