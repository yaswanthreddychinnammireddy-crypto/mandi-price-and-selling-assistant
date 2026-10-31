const mongoose = require('mongoose');
const marketDataSourceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  baseUrl: String,
  resourceId: String,
  enabled: { type: Boolean, default: true },
  lastSuccessAt: Date,
  lastFailureAt: Date,
  lastError: String
}, { timestamps: true });
module.exports = mongoose.model('MarketDataSource', marketDataSourceSchema);
