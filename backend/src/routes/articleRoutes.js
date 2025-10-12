import express from 'express';
import { db } from '../db.js';
import { articles } from '../models/article.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

router.post('/', async (req, res) => {
  const { title, content } = req.body;
  await db.insert(articles).values({ title, content });
  res.json({ success: true });
});

router.get('/', async (_, res) => {
  const all = await db.select().from(articles);
  res.json(all);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  await db.update(articles).set({ title, content }).where(eq(articles.id, id));
  res.json({ success: true });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await db.delete(articles).where(eq(articles.id, id));
  res.json({ success: true });
});

export default router;
