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
    const updated = await db
      .update(articlesTable)
      .set(req.body)
      .where(eq(articlesTable.id, Number(req.params.id)))
      .returning();
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

/* ========== GEMINI AI ROUTES ========== */
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