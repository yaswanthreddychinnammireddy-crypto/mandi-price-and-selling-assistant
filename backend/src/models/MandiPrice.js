const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  state: { type: String, required: true, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  mandi: { type: String, required: true, trim: true, index: true },
  crop: { type: String, required: true, trim: true, index: true },
  variety: { type: String, trim: true, default: 'Unknown' },
  minPrice: { type: Number, min: 0 },
  maxPrice: { type: Number, min: 0 },
  modalPrice: { type: Number, required: true, min: 0 },
  priceDate: { type: Date, required: true, index: true },
  unit: { type: String, required: true, default: 'INR/quintal' },
  dataSource: { type: String, required: true },
  sourceUrl: { type: String },
  retrievedAt: { type: Date, default: Date.now }
}, { timestamps: true });

mandiPriceSchema.index({ state: 1, district: 1, mandi: 1, crop: 1, variety: 1, priceDate: 1, dataSource: 1 }, { unique: true });
module.exports = mongoose.model('MandiPrice', mandiPriceSchema);
