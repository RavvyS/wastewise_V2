import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from 'drizzle-orm'; // <-- CORRECTED IMPORT
/* ========== UTILITY FUNCTIONS FOR SQLITE (NO TS ANNOTATIONS) ========== */
// SQLite AUTOINCREMENT PRIMARY KEY: uses integer and autoIncrement
const sqliteSerial = (name) => integer(name, { mode: 'number' }).primaryKey({ autoIncrement: true });

// SQLite CURRENT_TIMESTAMP for defaults: stores time as text
const sqliteTimestamp = (name) => text(name).default(sql`CURRENT_TIMESTAMP`); 

// SQLite Boolean (stored as integer 0 or 1)
const sqliteBoolean = (name) => integer(name, { mode: 'boolean' }).default(false); 


/* ========== USERS ========== */
export const usersTable = sqliteTable("users", {
  id: sqliteSerial("id"),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").default("user"), // user, manager, admin
  isActive: sqliteBoolean("is_active"),
  createdAt: sqliteTimestamp("created_at"),
});

/* ========== WASTE CATEGORIES & ITEMS ========== */
export const wasteCategoriesTable = sqliteTable("waste_categories", {
  id: sqliteSerial("id"),
  name: text("name").notNull(),
  description: text("description"),
});

export const wasteItemsTable = sqliteTable("waste_items", {
  id: sqliteSerial("id"),
  categoryId: integer("category_id").notNull().references(() => wasteCategoriesTable.id),
  name: text("name").notNull(),
  disposalInstructions: text("disposal_instructions"),
}, (table) => ({
  categoryIdIdx: index("waste_items_category_id_idx").on(table.categoryId),
}));

/* ========== LEARNING HUB (QUIZZES & ARTICLES) ========== */
export const quizzesTable = sqliteTable("quizzes", {
  id: sqliteSerial("id"),
  title: text("title").notNull(),
  createdAt: sqliteTimestamp("created_at"),
});

export const quizQuestionsTable = sqliteTable("quiz_questions", {
  id: sqliteSerial("id"),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  question: text("question").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  options: text("options"), // JSON string: ["a","b","c"]
});

export const articlesTable = sqliteTable("articles", {
  id: sqliteSerial("id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => usersTable.id),
  createdAt: sqliteTimestamp("created_at"),
});

/* ========== RECYCLING CENTERS & INQUIRIES ========== */
export const recyclingCentersTable = sqliteTable("recycling_centers", {
  id: sqliteSerial("id"),
  name: text("name").notNull(),
  address: text("address").notNull(),
  timings: text("timings"),
  acceptedItems: text("accepted_items"), // JSON string
  isApproved: sqliteBoolean("is_approved"),
});

export const inquiriesTable = sqliteTable("inquiries", {
  id: sqliteSerial("id"),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  createdAt: sqliteTimestamp("created_at"),
});

/* ========== USER WASTE LOGS ========== */
export const wasteLogsTable = sqliteTable("waste_logs", {
  id: sqliteSerial("id"),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  itemId: integer("item_id").references(() => wasteItemsTable.id),
  description: text("description"), // e.g. "Recycled 2 bottles"
  quantity: integer("quantity"),
  createdAt: sqliteTimestamp("created_at"),
}, (table) => ({
  userIdIdx: index("waste_logs_user_id_idx").on(table.userId),
  createdAtIdx: index("waste_logs_created_at_idx").on(table.createdAt),
}));