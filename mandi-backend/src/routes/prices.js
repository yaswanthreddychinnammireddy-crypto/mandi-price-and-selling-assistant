import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { validate } from '../middleware/validate.js';
import { getSeries, compareMarkets } from '../services/advisor.js';

const router = Router();

const listQuery = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  market: z.string().optional(),
  commodity: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  page: z.coerce.number().int().min(1).default(1),
});

// GET /api/prices?state=Telangana&commodity=Tomato&date=2026-10-29
router.get('/', validate(listQuery, 'query'), (req, res) => {
  const { state, district, market, commodity, date, limit, page } = req.query;
  const where = []; const params = [];
  for (const [col, val] of Object.entries({ state, district, market, commodity })) {
    if (val) { where.push(`${col} = ? COLLATE NOCASE`); params.push(val); }
  }
  if (date) { where.push('arrival_date = ?'); params.push(date); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM prices ${clause} ORDER BY arrival_date DESC, market LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit);
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM prices ${clause}`).get(...params);
  res.json({ page, limit, total, unit: 'Rs per quintal', data: rows });
});

router.get('/commodities', validate(z.object({ state: z.string().optional() }), 'query'), (req, res) => {
  const { state } = req.query;
  const rows = state
    ? db.prepare('SELECT DISTINCT commodity FROM prices WHERE state = ? COLLATE NOCASE ORDER BY commodity').all(state)
    : db.prepare('SELECT DISTINCT commodity FROM prices ORDER BY commodity').all();
  res.json(rows.map((r) => r.commodity));
});

router.get('/markets', validate(z.object({ state: z.string(), commodity: z.string().optional() }), 'query'), (req, res) => {
  const { state, commodity } = req.query;
  const rows = commodity
    ? db.prepare('SELECT DISTINCT district, market FROM prices WHERE state = ? COLLATE NOCASE AND commodity = ? COLLATE NOCASE ORDER BY district, market').all(state, commodity)
    : db.prepare('SELECT DISTINCT district, market FROM prices WHERE state = ? COLLATE NOCASE ORDER BY district, market').all(state);
  res.json(rows);
});

// GET /api/prices/trend?commodity=Onion&state=Telangana&market=Bowenpally&days=30
router.get('/trend', validate(z.object({
  commodity: z.string(), state: z.string(), market: z.string().optional(),
  days: z.coerce.number().int().min(3).max(180).default(30),
}), 'query'), (req, res) => {
  res.json({ unit: 'Rs per quintal', ...req.query, series: getSeries(req.query) });
});

// GET /api/prices/compare?commodity=Tomato&state=Telangana  -> best markets right now
router.get('/compare', validate(z.object({ commodity: z.string(), state: z.string() }), 'query'), (req, res) => {
  res.json({ unit: 'Rs per quintal', markets: compareMarkets(req.query) });
});

export default router;
