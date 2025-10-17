// server.js
import 'dotenv/config';
import { ENV } from "./config/env.js";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import {
  usersTable,
  wasteCategoriesTable,
  wasteItemsTable,
  quizzesTable,
  quizQuestionsTable,
  articlesTable,
  recyclingCentersTable,
  inquiriesTable,
  wasteLogsTable,
} from "./db/schema.js";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = ENV.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Middleware =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, ENV.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, ENV.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.user = user;
    next();
  });
};

// ===================================================================
// 🧠 LEARNING HUB ROUTES
// ===================================================================

// --- Quizzes ---
app.post("/api/quizzes", authenticateAdmin, async (req, res) => {
  try {
    const quiz = await db.insert(quizzesTable).values(req.body).returning();
    res.json(quiz[0]);
  } catch (err) {
    console.error('BACKEND ERROR on POST /api/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable);
    res.json(quizzes);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/quizzes/:id/full", async (req, res) => {
  try {
    const quizId = Number(req.params.id);
    const quiz = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quizId));
    if (quiz.length === 0) return res.status(404).json({ error: "Quiz not found" });
    res.json({ ...quiz[0], questions });
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/quizzes/:id/full:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/quizzes/:id", authenticateAdmin, async (req, res) => {
  try {
    const updated = await db.update(quizzesTable).set(req.body).where(eq(quizzesTable.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (err) {
    console.error('BACKEND ERROR on PUT /api/quizzes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/quizzes/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.delete(quizzesTable).where(eq(quizzesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    console.error('BACKEND ERROR on DELETE /api/quizzes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Articles ---
app.post("/api/articles", authenticateAdmin, async (req, res) => {
  try {
    const art = await db.insert(articlesTable).values(req.body).returning();
    res.json(art[0]);
  } catch (err) {
    console.error('BACKEND ERROR on POST /api/articles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/articles", async (req, res) => {
  try {
    const arts = await db.select().from(articlesTable);
    res.json(arts);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/articles:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/articles/:id", authenticateAdmin, async (req, res) => {
  try {
    const updated = await db.update(articlesTable).set(req.body).where(eq(articlesTable.id, Number(req.params.id))).returning();
    res.json(updated[0]);
  } catch (err) {
    console.error('BACKEND ERROR on PUT /api/articles/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/articles/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.delete(articlesTable).where(eq(articlesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    console.error('BACKEND ERROR on DELETE /api/articles/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Public Learning Hub ---
app.get("/api/learning-hub/quizzes", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable);
    res.json(quizzes);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/learning-hub/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/learning-hub/articles", async (req, res) => {
  try {
    const articles = await db.select().from(articlesTable);
    res.json(articles);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/learning-hub/articles:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===================================================================
// 💬 ECOZEN AI CHAT
// ===================================================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    // Initialize Gemini AI
    const geminiKey = process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are EcoZen AI, a friendly assistant helping users with sustainability, recycling, and eco-living."
    });

    const result = await model.generateContent(message);
    const aiResponse = result.response.text();

    res.json({ response: aiResponse });
  } catch (err) {
    console.error("❌ /api/chat error:", err);
    res.status(500).json({ error: "Failed to get AI response", details: err.message });
  }
});

// ===================================================================
// 🔐 Auth, Waste, Logs, and Inquiries routes remain below
// ===================================================================
// (Add your existing auth, waste, logs, inquiries routes here as before)

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
