const { z } = require('zod');
const mongoose = require('mongoose');
const MandiPrice = require('../models/MandiPrice');
const inMemoryStore = require('../config/inMemoryStore');

const schema = z.object({
  crop: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  mandi: z.string().max(100).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

async function trends(req, res, next) {
  try {
    const input = schema.parse(req.query);

    if (mongoose.connection.readyState !== 1) {
      const records = inMemoryStore.prices.filter(p =>
        p.crop.toLowerCase().includes(input.crop.toLowerCase()) &&
        (!input.state || p.state.toLowerCase().includes(input.state.toLowerCase())) &&
        (!input.mandi || p.mandi.toLowerCase().includes(input.mandi.toLowerCase()))
      );

      if (records.length < 2) {
        return res.json({
          success: true,
          message: 'Insufficient verified historical records to calculate a trend.',
          data: records,
          meta: { recordCount: records.length }
        });
      }
      const first = records[0].modalPrice;
      const last = records.at(-1).modalPrice;
      return res.json({
        success: true,
        data: records,
        summary: {
          averageModalPrice: records.reduce((sum, item) => sum + item.modalPrice, 0) / records.length,
          priceChange: last - first,
          percentageChange: first ? ((last - first) / first) * 100 : null,
          movement: last > first ? 'up' : last < first ? 'down' : 'flat'
        }
      });
    }

    const query = { crop: new RegExp(`^${input.crop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    if (input.state) query.state = new RegExp(input.state, 'i');
    if (input.mandi) query.mandi = new RegExp(input.mandi, 'i');
    if (input.from || input.to) query.priceDate = { ...(input.from && { $gte: new Date(input.from) }), ...(input.to && { $lte: new Date(`${input.to}T23:59:59.999Z`) }) };
    const records = await MandiPrice.find(query).sort({ priceDate: 1 }).lean();
    if (records.length < 2) return res.json({ success: true, message: 'Insufficient verified historical records to calculate a trend.', data: [], meta: { recordCount: records.length } });
    const first = records[0].modalPrice;
    const last = records.at(-1).modalPrice;
    res.json({
      success: true,
      data: records,
      summary: {
        averageModalPrice: records.reduce((sum, item) => sum + item.modalPrice, 0) / records.length,
        priceChange: last - first,
        percentageChange: first ? ((last - first) / first) * 100 : null,
        movement: last > first ? 'up' : last < first ? 'down' : 'flat'
      }
    });
  } catch (error) { next(error); }
}

module.exports = { trends };
