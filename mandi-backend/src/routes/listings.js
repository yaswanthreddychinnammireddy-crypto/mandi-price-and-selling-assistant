import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getSeries } from '../services/advisor.js';

const router = Router();

const createSchema = z.object({
  commodity: z.string().min(2),
  variety: z.string().optional(),
  quantity_qtl: z.number().positive(),
  expected_price: z.number().positive(),
  state: z.string().min(2),
  district: z.string().optional(),
  market: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Public: buyers browse open listings
router.get('/', validate(z.object({
  commodity: z.string().optional(), state: z.string().optional(), district: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  page: z.coerce.number().int().min(1).default(1),
}), 'query'), (req, res) => {
  const { commodity, state, district, limit, page } = req.query;
  const where = ["l.status = 'open'"]; const params = [];
  if (commodity) { where.push('l.commodity = ? COLLATE NOCASE'); params.push(commodity); }
  if (state) { where.push('l.state = ? COLLATE NOCASE'); params.push(state); }
  if (district) { where.push('l.district = ? COLLATE NOCASE'); params.push(district); }
  const rows = db.prepare(`
    SELECT l.*, u.name AS seller_name, u.phone AS seller_phone
    FROM listings l JOIN users u ON u.id = l.user_id
    WHERE ${where.join(' AND ')} ORDER BY l.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, (page - 1) * limit);
  res.json({ page, limit, data: rows });
});

router.get('/mine', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM listings WHERE user_id = ? ORDER BY created_at DESC').all(req.userId));
});

router.post('/', requireAuth, validate(createSchema), (req, res) => {
  const b = req.body;
  const info = db.prepare(`
    INSERT INTO listings (user_id, commodity, variety, quantity_qtl, expected_price, state, district, market, notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(req.userId, b.commodity, b.variety ?? null, b.quantity_qtl, b.expected_price, b.state, b.district ?? null, b.market ?? null, b.notes ?? null);

  // Sanity-check the asking price against the latest mandi price
  const latest = getSeries({ commodity: b.commodity, state: b.state, market: b.market, days: 7 }).at(-1);
  let priceCheck = null;
  if (latest) {
    const gapPct = ((b.expected_price - latest.modal) / latest.modal) * 100;
    priceCheck = {
      latestModalPrice: latest.modal, asOf: latest.date, gapPct: Number(gapPct.toFixed(1)),
      warning: gapPct > 20 ? 'Your price is far above the current mandi rate; buyers may skip this listing.' : null,
    };
  }
  res.status(201).json({ id: Number(info.lastInsertRowid), priceCheck });
});

router.patch('/:id', requireAuth, validate(createSchema.partial().extend({
  status: z.enum(['open', 'sold', 'cancelled']).optional(),
})), (req, res) => {
  const own = db.prepare('SELECT * FROM listings WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!own) return res.status(404).json({ error: 'Listing not found' });
  const fields = Object.keys(req.body);
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  // field names come from the zod schema (unknown keys are stripped), never raw user input
  db.prepare(`UPDATE listings SET ${fields.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`)
    .run(...fields.map((f) => req.body[f]), req.params.id);
  res.json(db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id));
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM listings WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  info.changes ? res.status(204).end() : res.status(404).json({ error: 'Listing not found' });
});

export default router;
