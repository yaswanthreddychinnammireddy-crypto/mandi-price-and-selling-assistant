const { z } = require('zod');
const mongoose = require('mongoose');
const { searchPrices } = require('../services/mandiService');
const { estimateValues } = require('../utils/priceCalculator');
const { generateSellingAdvice } = require('../services/aiService');
const SellingHistory = require('../models/SellingHistory');

const requestSchema = z.object({
  crop: z.string().min(1).max(100),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1).max(40).default('quintal'),
  state: z.string().min(1).max(100),
  district: z.string().max(100).optional(),
  language: z.enum(['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi']).default('English'),
  transportCost: z.coerce.number().min(0).optional(),
  otherCosts: z.coerce.number().min(0).optional()
});

async function assistant(req, res, next) {
  try {
    const input = requestSchema.parse(req.body);
    const result = await searchPrices({ crop: input.crop, state: input.state, district: input.district });
    const valuation = estimateValues({ quantity: input.quantity, marketPrices: result.prices, transportCost: input.transportCost, otherCosts: input.otherCosts });
    const advice = result.prices.length
      ? await generateSellingAdvice({ request: input, prices: result.prices, valuation })
      : { available: false, message: 'No verified price data is available, so selling advice cannot estimate a sale value.' };

    if (req.user && mongoose.connection.readyState === 1) {
      try {
        await SellingHistory.create({ user: req.user.id || req.user._id, request: input, marketDataSnapshot: result.prices, ...valuation, assistantResponse: advice.message });
      } catch (e) {}
    }

    res.json({
      success: true,
      message: 'Selling analysis completed using available verified data.',
      data: { marketPrices: result.prices, valuation, advice },
      meta: { freshness: result.freshness, warning: result.warning, msp: 'MSP is not included unless supplied by a verified official source.' }
    });
  } catch (error) { next(error); }
}

module.exports = { assistant };
