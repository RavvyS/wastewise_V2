import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  
  // === NEW FIELDS FOR CATEGORY AND LEVEL ===
  category: text('category').notNull().default('General'),
  level: text('level').notNull().default('Beginner'),
  // =========================================
});