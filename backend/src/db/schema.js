import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

/* ========== USERS ========== */
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").default("user"), // user, manager, admin
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ========== WASTE CATEGORIES & ITEMS ========== */
export const wasteCategoriesTable = pgTable("waste_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const wasteItemsTable = pgTable("waste_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => wasteCategoriesTable.id),
  name: text("name").notNull(),
  disposalInstructions: text("disposal_instructions"),
});

/* ========== LEARNING HUB (QUIZZES & ARTICLES) ========== */
export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options"), // JSON string: ["a","b","c"]
});

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ========== RECYCLING CENTERS & INQUIRIES ========== */
export const recyclingCentersTable = pgTable("recycling_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  website: text("website"),
  hours: text("hours"),
  services: text("services"),
  rating: integer("rating").default(0),
  latitude: text("latitude"), 
  longitude: text("longitude"), 
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  question: text("question").notNull(),
  category: text("category"),
  status: text("status").default("draft").notNull(), // draft, sent, answered
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
});

/* ========== USER WASTE LOGS ========== */
export const wasteLogsTable = pgTable("waste_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  itemId: integer("item_id").references(() => wasteItemsTable.id),
  description: text("description"), // e.g. "Recycled 2 bottles"
  quantity: integer("quantity"),
  createdAt: timestamp("created_at").defaultNow(),
});
