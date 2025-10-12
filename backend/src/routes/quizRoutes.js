import express from 'express';
import { db } from '../db.js';
import { quizzes } from '../models/quiz.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Create
router.post('/', async (req, res) => {
  const { title, question, answer } = req.body;
  await db.insert(quizzes).values({ title, question, answer });
  res.json({ success: true });
});

// Read all
router.get('/', async (_, res) => {
  const all = await db.select().from(quizzes);
  res.json(all);
});

// Update
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, question, answer } = req.body;
  await db.update(quizzes).set({ title, question, answer }).where(eq(quizzes.id, id));
  res.json({ success: true });
});

// Delete
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.delete(quizzes).where(eq(quizzes.id, id));
  res.json({ success: true });
});

export default router;
