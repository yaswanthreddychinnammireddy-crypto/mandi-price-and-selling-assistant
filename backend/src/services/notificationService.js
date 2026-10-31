const PriceAlert = require('../models/PriceAlert');

async function checkAlerts(prices) {
  const matches = [];
  for (const price of prices) {
    const alerts = await PriceAlert.find({ active: true, crop: new RegExp(`^${String(price.crop).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), unit: price.unit });
    for (const alert of alerts) {
      if (alert.mandi && alert.mandi.toLowerCase() !== price.mandi.toLowerCase()) continue;
      if (price.modalPrice >= alert.targetPrice) { alert.lastMatchedAt = new Date(); await alert.save(); matches.push({ alertId: alert.id, mandi: price.mandi, modalPrice: price.modalPrice }); }
    }
  }
  return matches; // Delivery is deliberately not attempted without a configured notification provider.
}
module.exports = { checkAlerts };
