import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import priceRoutes from './routes/prices.js';
import adviceRoutes from './routes/advice.js';
import listingRoutes from './routes/listings.js';
import alertRoutes from './routes/alerts.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 30 }), authRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/alerts', alertRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
