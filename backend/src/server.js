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
import geminiRouter from "./routes/gemini.js";

const app = express();
const PORT = ENV.PORT || 8001;

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  });
};

// Admin signup (create admin users)
app.post("/api/auth/admin-signup", authenticateAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    if (!role || !["user", "manager", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Valid role is required (user, manager, admin)" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with specified role
    const newUser = await db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role,
        isActive: true,
      })
      .returning();

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser[0];

    res.status(201).json({
      message: `${role} account created successfully`,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (admin only)
app.get("/api/auth/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        phone: usersTable.phone,
        role: usersTable.role,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable);

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user role (admin only)
app.put("/api/auth/users/:id/role", authenticateAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = Number(req.params.id);

    if (!role || !["user", "manager", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Valid role is required (user, manager, admin)" });
    }

    const updatedUser = await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Activate/Deactivate user (admin only)
app.put("/api/auth/users/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = Number(req.params.id);

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ error: "isActive must be a boolean value" });
    }

    const updatedUser = await db
      .update(usersTable)
      .set({ isActive })
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        isActive: usersTable.isActive,
      });

    if (updatedUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ========== USERS ========== */
app.post("/api/users", async (req, res) => {
  const user = await db.insert(usersTable).values(req.body).returning();
  res.json(user);
});

app.get("/api/users", async (req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users);
});

app.put("/api/users/:id", async (req, res) => {
  const updated = await db
    .update(usersTable)
    .set(req.body)
    .where(eq(usersTable.id, Number(req.params.id)))
    .returning();
  res.json(updated);
});

app.delete("/api/users/:id", async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

/* ========== WASTE CATEGORIES ========== */
app.post("/api/categories", async (req, res) => {
  try {
    const cat = await db
      .insert(wasteCategoriesTable)
      .values(req.body)
      .returning();
    res.json(cat[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const cats = await db.select().from(wasteCategoriesTable);
    res.json(cats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/with-items", async (req, res) => {
  try {
    const categories = await db.select().from(wasteCategoriesTable);
    const categoriesWithItems = await Promise.all(
      categories.map(async (category) => {
        const items = await db
          .select()
          .from(wasteItemsTable)
          .where(eq(wasteItemsTable.categoryId, category.id));
        return { ...category, items };
      })
    );
    res.json(categoriesWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const updated = await db
      .update(wasteCategoriesTable)
      .set(req.body)
      .where(eq(wasteCategoriesTable.id, Number(req.params.id)))
      .returning();
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await db
      .delete(wasteCategoriesTable)
      .where(eq(wasteCategoriesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ========== WASTE ITEMS ========== */
app.post("/api/items", async (req, res) => {
  const item = await db.insert(wasteItemsTable).values(req.body).returning();
  res.json(item);
});

app.get("/api/items", async (req, res) => {
  const items = await db.select().from(wasteItemsTable);
  res.json(items);
});

app.put("/api/items/:id", async (req, res) => {
  const updated = await db
    .update(wasteItemsTable)
    .set(req.body)
    .where(eq(wasteItemsTable.id, Number(req.params.id)))
    .returning();
  res.json(updated);
});

app.delete("/api/items/:id", async (req, res) => {
  await db
    .delete(wasteItemsTable)
    .where(eq(wasteItemsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

/* ========== QUIZZES ========== */
// Create quiz (admin)
app.post("/api/quizzes", authenticateAdmin, async (req, res) => {
  try {
    const quiz = await db.insert(quizzesTable).values(req.body).returning();
    res.json(quiz[0]);
  } catch (err) {
    console.error('BACKEND ERROR on POST /api/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all quizzes
app.get("/api/quizzes", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable);
    res.json(quizzes);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get quiz + questions
app.get("/api/quizzes/:id/full", async (req, res) => {
  try {
    const quizId = Number(req.params.id);
    const quiz = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, quizId));
    const questions = await db
      .select()
      .from(quizQuestionsTable)
      .where(eq(quizQuestionsTable.quizId, quizId));
    if (quiz.length === 0) return res.status(404).json({ error: "Quiz not found" });
    res.json({ ...quiz[0], questions });
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/quizzes/:id/full:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update quiz (admin)
app.put("/api/quizzes/:id", authenticateAdmin, async (req, res) => {
  try {
    const updated = await db
      .update(quizzesTable)
      .set(req.body)
      .where(eq(quizzesTable.id, Number(req.params.id)))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    console.error('BACKEND ERROR on PUT /api/quizzes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete quiz (admin)
app.delete("/api/quizzes/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.delete(quizzesTable).where(eq(quizzesTable.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (err) {
    console.error('BACKEND ERROR on DELETE /api/quizzes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ========== ARTICLES ========== */
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
  const arts = await db.select().from(articlesTable);
  res.json(arts);
});

app.put("/api/articles/:id", async (req, res) => {
  const updated = await db
    .update(articlesTable)
    .set(req.body)
    .where(eq(articlesTable.id, Number(req.params.id)))
    .returning();
  res.json(updated);
});

app.delete("/api/articles/:id", async (req, res) => {
  await db
    .delete(articlesTable)
    .where(eq(articlesTable.id, Number(req.params.id)));
  res.json({ success: true });
});


/* ========== RECYCLING CENTERS ========== */

// Create recycling center
app.post("/api/centers", async (req, res) => {
  try {
    const { name, address, phone, website, hours, services, rating, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    const center = await db
      .insert(recyclingCentersTable)
      .values({
        name,
        address,
        phone: phone || null,
        website: website || null,
        hours: hours || null,
        services: services ? JSON.stringify(services) : null,
        rating: rating || 0,
        latitude: latitude || null,
        longitude: longitude || null,
        isApproved: false,
      })
      .returning();
    
    // Parse services back to array for response
    const result = {
      ...center[0],
      services: center[0].services ? JSON.parse(center[0].services) : []
    };
    
    res.json(result);
  } catch (error) {
    console.error("Error creating recycling center:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all recycling centers
app.get("/api/centers", async (req, res) => {
  try {
    const centers = await db.select().from(recyclingCentersTable);
    
    // Parse services JSON for each center
    const centersWithParsedServices = centers.map(center => ({
      ...center,
      services: center.services ? JSON.parse(center.services) : []
    }));
    
    res.json(centersWithParsedServices);
  } catch (error) {
    console.error("Error fetching recycling centers:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update recycling center
app.put("/api/centers/:id", async (req, res) => {
  try {
    const { name, address, phone, website, hours, services, rating, latitude, longitude } = req.body;
    const centerId = Number(req.params.id);

    const updateData = {
      ...(name && { name }),
      ...(address && { address }),
      phone: phone || null,
      website: website || null,
      hours: hours || null,
      services: services ? JSON.stringify(services) : null,
      ...(rating !== undefined && { rating }),
      ...(latitude !== undefined && { latitude: latitude || null }),
      ...(longitude !== undefined && { longitude: longitude || null }),
    };

    const updated = await db
      .update(recyclingCentersTable)
      .set(updateData)
      .where(eq(recyclingCentersTable.id, centerId))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: "Recycling center not found" });
    }

    // Parse services back to array for response
    const result = {
      ...updated[0],
      services: updated[0].services ? JSON.parse(updated[0].services) : []
    };
    
    res.json(result);
  } catch (error) {
    console.error("Error updating recycling center:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete recycling center
app.delete("/api/centers/:id", async (req, res) => {
  try {
    const centerId = Number(req.params.id);
    
    const deleted = await db
      .delete(recyclingCentersTable)
      .where(eq(recyclingCentersTable.id, centerId))
      .returning();
    
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Recycling center not found" });
    }
    
    res.json({ success: true, message: "Recycling center deleted successfully" });
  } catch (error) {
    console.error("Error deleting recycling center:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ========== INQUIRIES ========== */
// Create inquiry (draft) - User only
app.post("/api/inquiries", authenticateToken, async (req, res) => {
  try {
    const { title, question, category } = req.body;
    
    if (!title || !question) {
      return res.status(400).json({ error: "Title and question are required" });
    }

    const inquiry = await db.insert(inquiriesTable).values({
      userId: req.user.id,
      title,
      question,
      category: category || null,
      status: "draft",
    }).returning();
    
    res.json(inquiry[0]);
  } catch (error) {
    console.error("Create inquiry error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all inquiries for current user (draft and sent) - User only
app.get("/api/inquiries", authenticateToken, async (req, res) => {
  try {
    // Return only user's own inquiries
    const inquiries = await db.select().from(inquiriesTable)
      .where(eq(inquiriesTable.userId, req.user.id));
    res.json(inquiries);
  } catch (error) {
    console.error("Get inquiries error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get sent inquiries (sent + answered)
// Users: see their own sent inquiries
// Admins: see ALL sent inquiries from all users
app.get("/api/inquiries/sent", authenticateToken, async (req, res) => {
  try {
    let inquiries;
    
    // If admin, return all sent/answered inquiries
    if (req.user.role === 'admin') {
      inquiries = await db.select().from(inquiriesTable);
    } else {
      // If regular user, return only their own sent/answered inquiries
      inquiries = await db.select().from(inquiriesTable)
        .where(eq(inquiriesTable.userId, req.user.id));
    }
    
    // Filter to only sent and answered status
    const sentInquiries = inquiries.filter(i => i.status === 'sent' || i.status === 'answered');
    res.json(sentInquiries);
  } catch (error) {
    console.error("Get sent inquiries error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update inquiry (only if draft) - User only
app.put("/api/inquiries/:id", authenticateToken, async (req, res) => {
  try {
    const { title, question, category } = req.body;
    const inquiryId = Number(req.params.id);

    // Check if inquiry exists and is in draft status
    const existing = await db.select().from(inquiriesTable)
      .where(eq(inquiriesTable.id, inquiryId));
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    // Check if user owns this inquiry
    if (existing[0].userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own inquiries" });
    }

    if (existing[0].status !== 'draft') {
      return res.status(400).json({ error: "Cannot edit inquiry that has been sent" });
    }

    const updated = await db
      .update(inquiriesTable)
      .set({ title, question, category })
      .where(eq(inquiriesTable.id, inquiryId))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error("Update inquiry error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send inquiry (change status from draft to sent) - User only
app.post("/api/inquiries/:id/send", authenticateToken, async (req, res) => {
  try {
    const inquiryId = Number(req.params.id);

    // Check if inquiry exists and is in draft status
    const existing = await db.select().from(inquiriesTable)
      .where(eq(inquiriesTable.id, inquiryId));
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    // Check if user owns this inquiry
    if (existing[0].userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only send your own inquiries" });
    }

    if (existing[0].status !== 'draft') {
      return res.status(400).json({ error: "Inquiry has already been sent" });
    }

    const updated = await db
      .update(inquiriesTable)
      .set({ status: 'sent', sentAt: new Date() })
      .where(eq(inquiriesTable.id, inquiryId))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error("Send inquiry error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Answer inquiry (change status from sent to answered) - Admin only
app.post("/api/inquiries/:id/answer", authenticateToken, async (req, res) => {
  try {
    const { response } = req.body;
    const inquiryId = Number(req.params.id);

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized: Only admins can answer inquiries" });
    }

    if (!response) {
      return res.status(400).json({ error: "Response is required" });
    }

    // Check if inquiry exists and is in sent status
    const existing = await db.select().from(inquiriesTable)
      .where(eq(inquiriesTable.id, inquiryId));
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    if (existing[0].status !== 'sent') {
      return res.status(400).json({ error: "Can only answer sent inquiries" });
    }

    const updated = await db
      .update(inquiriesTable)
      .set({ 
        response, 
        status: 'answered', 
        respondedAt: new Date() 
      })
      .where(eq(inquiriesTable.id, inquiryId))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    console.error("Answer inquiry error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete inquiry (only if draft) - User only
app.delete("/api/inquiries/:id", authenticateToken, async (req, res) => {
  try {
    const inquiryId = Number(req.params.id);

    // Check if inquiry exists and is in draft status
    const existing = await db.select().from(inquiriesTable)
      .where(eq(inquiriesTable.id, inquiryId));
    
    if (existing.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }

    // Check if user owns this inquiry
    if (existing[0].userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own inquiries" });
    }

    if (existing[0].status !== 'draft') {
      return res.status(400).json({ error: "Cannot delete inquiry that has been sent" });
    }

    await db
      .delete(inquiriesTable)
      .where(eq(inquiriesTable.id, inquiryId));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ========== WASTE LOGS (Placeholder routes - you may need to adjust these) ========== */
app.post("/api/logs", async (req, res) => {
  try {
    // This route seems to be incorrectly copying the GET /api/articles logic
    // You should insert a waste log here
    const log = await db.insert(wasteLogsTable).values(req.body).returning();
    res.json(log[0]);
  } catch (err) {
    console.error('BACKEND ERROR on POST /api/logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// The following PUT/DELETE articles routes were misplaced under WASTE LOGS and are now removed/fixed to avoid confusion.

/* ========== PUBLIC LEARNING HUB ========== */
// Get all quizzes for learning hub
app.get("/api/learning-hub/quizzes", async (req, res) => {
  try {
    const quizzes = await db.select().from(quizzesTable);
    res.json(quizzes);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/learning-hub/quizzes:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all articles for learning hub
app.get("/api/learning-hub/articles", async (req, res) => {
  try {
    const articles = await db.select().from(articlesTable);
    res.json(articles);
  } catch (err) {
    console.error('BACKEND ERROR on GET /api/learning-hub/articles:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ========== GEMINI CHAT ========== */
// 1. Import the new Google Gen AI SDK
import { GoogleGenAI } from '@google/genai';

// 2. Initialize the Gemini client
// It will automatically look for GEMINI_API_KEY environment variable.
// I'm using the ENV object here based on your existing structure, but typically you'd use process.env.
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ENV.GEMINI_API_KEY,
});
const chatModel = "gemini-2.5-flash"; // A fast and capable model for chat

// 3. Replace the old /api/chat route with the Gemini implementation
app.post("/api/chat", async (req, res) => {
  try {
    console.log("📩 Received chat request (via Gemini)");
    const { message } = req.body;

    if (!message) {
      console.error("❌ No message provided");
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("💬 User message:", message);

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY && !ENV.GEMINI_API_KEY) {
      console.error("❌ Gemini API key not configured");
      return res.status(500).json({ 
        error: "Gemini API key not configured on server" 
      });
    }

    // Configure the chat system instruction
    const systemInstruction = "You are EcoZen AI, a friendly and knowledgeable assistant who helps users learn about sustainability, recycling, and eco-friendly living. Keep your responses concise and helpful.";

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model: chatModel,
      contents: [{ role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const aiResponse = response.text?.trim() || "Sorry, I couldn't get a clear response from the AI.";

    console.log("✅ Gemini response:", aiResponse.substring(0, 100) + "...");

    res.json({ response: aiResponse });

  } catch (error) {
    // Check for rate limit or quota errors specifically
    if (error.status === 429) {
      console.error("❌ Gemini chat error: Rate Limit Exceeded (429)");
    }
    console.error("❌ Gemini chat error:", error.message);
    console.error("Full error:", error);
    
    res.status(500).json({ 
      error: "Failed to get AI response",
      message: error.message,
      details: error.toString()
    });
  }
});
// 4. (Optional) Removed the old, unused OpenAI import and initialization to clean up the code.
// The OpenAI client setup was here before.

/* ========== GEMINI AI ROUTES (EXISTING ROUTER) ========== */
app.use("/api/gemini", geminiRouter);

/* ========== START SERVER ========== */
// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log("✅ Server running on port", PORT);
  });
}

// Export for Vercel
export default app;