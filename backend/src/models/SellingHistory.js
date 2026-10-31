const mongoose = require('mongoose');
const sellingHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  request: { type: mongoose.Schema.Types.Mixed, required: true },
  marketDataSnapshot: { type: [mongoose.Schema.Types.Mixed], default: [] },
  grossValue: Number,
  estimatedCosts: Number,
  netValue: Number,
  assistantResponse: String
}, { timestamps: true });
module.exports = mongoose.model('SellingHistory', sellingHistorySchema);
