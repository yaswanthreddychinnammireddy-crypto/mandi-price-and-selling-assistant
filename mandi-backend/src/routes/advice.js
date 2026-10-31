import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { adviseSell } from '../services/advisor.js';

const router = Router();

// GET /api/advice/sell?commodity=Chilli&state=Telangana&market=Warangal&quantity_qtl=20&expected_price=15000
router.get('/sell', validate(z.object({
  commodity: z.string(),
  state: z.string(),
  market: z.string().optional(),
  quantity_qtl: z.coerce.number().positive().optional(),
  expected_price: z.coerce.number().positive().optional(),
}), 'query'), (req, res) => {
  res.json({
    disclaimer: 'Rule-based guidance from recent mandi prices. Not a price forecast or financial advice.',
    ...adviseSell(req.query),
  });
});

export default router;
