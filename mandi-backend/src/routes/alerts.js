import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC').all(req.userId));
});

router.post('/', validate(z.object({
  commodity: z.string().min(2), state: z.string().min(2), market: z.string().optional(),
  direction: z.enum(['above', 'below']), target_price: z.number().positive(),
})), (req, res) => {
  const b = req.body;
  const info = db.prepare('INSERT INTO alerts (user_id, commodity, state, market, direction, target_price) VALUES (?,?,?,?,?,?)')
    .run(req.userId, b.commodity, b.state, b.market ?? null, b.direction, b.target_price);
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  info.changes ? res.status(204).end() : res.status(404).json({ error: 'Alert not found' });
});

export default router;
