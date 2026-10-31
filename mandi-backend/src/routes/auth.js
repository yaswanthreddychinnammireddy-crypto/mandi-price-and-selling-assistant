import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const phone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

router.post('/register', validate(z.object({
  name: z.string().min(2).max(80),
  phone,
  password: z.string().min(6).max(100),
  state: z.string().optional(),
  district: z.string().optional(),
})), (req, res) => {
  const { name, phone, password, state, district } = req.body;
  if (db.prepare('SELECT 1 FROM users WHERE phone = ?').get(phone)) {
    return res.status(409).json({ error: 'Phone already registered' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (name, phone, password_hash, state, district) VALUES (?,?,?,?,?)')
    .run(name, phone, hash, state ?? null, district ?? null);
  const user = { id: Number(info.lastInsertRowid), name, phone, state, district };
  res.status(201).json({ user, token: signToken(user) });
});

router.post('/login', validate(z.object({ phone, password: z.string() })), (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE phone = ?').get(req.body.phone);
  if (!u || !bcrypt.compareSync(req.body.password, u.password_hash)) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }
  res.json({
    user: { id: u.id, name: u.name, phone: u.phone, state: u.state, district: u.district },
    token: signToken(u),
  });
});

router.get('/me', requireAuth, (req, res) => {
  const u = db.prepare('SELECT id, name, phone, state, district, created_at FROM users WHERE id = ?').get(req.userId);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json(u);
});

export default router;
