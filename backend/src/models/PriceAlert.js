const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  crop: { type: String, required: true, trim: true },
  mandi: { type: String, trim: true },
  state: { type: String, trim: true },
  targetPrice: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, default: 'INR/quintal' },
  active: { type: Boolean, default: true },
  lastMatchedAt: Date
}, { timestamps: true });

priceAlertSchema.index({ user: 1, crop: 1, mandi: 1, targetPrice: 1 });
module.exports = mongoose.model('PriceAlert', priceAlertSchema);
