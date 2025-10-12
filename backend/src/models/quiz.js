import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const quizzes = sqliteTable('quizzes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
});
