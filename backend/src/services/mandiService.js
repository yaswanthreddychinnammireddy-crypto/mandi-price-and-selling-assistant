const mongoose = require('mongoose');
const MandiPrice = require('../models/MandiPrice');
const MarketDataSource = require('../models/MarketDataSource');
const { fetchOfficialPrices } = require('./agmarknetService');
const inMemoryStore = require('../config/inMemoryStore');

const lower = (value) => String(value || '').trim().toLowerCase();
function matches(price, filters) {
  return ['state', 'district', 'mandi', 'crop'].every((field) => !filters[field] || lower(price[field]).includes(lower(filters[field]))) &&
    (!filters.date || new Date(price.priceDate).toISOString().slice(0, 10) === filters.date);
}
async function persistPrices(prices) {
  if (!prices.length || mongoose.connection.readyState !== 1) return;
  try {
    await MandiPrice.bulkWrite(prices.map((price) => ({ updateOne: {
      filter: { state: price.state, district: price.district, mandi: price.mandi, crop: price.crop, variety: price.variety, priceDate: price.priceDate, dataSource: price.dataSource },
      update: { $set: { ...price, retrievedAt: new Date() } }, upsert: true
    } })), { ordered: false });
  } catch (e) {}
}
async function searchPrices(filters = {}) {
  const live = await fetchOfficialPrices();
  if (live.available) {
    await persistPrices(live.prices);
    if (mongoose.connection.readyState === 1) {
      try {
        await MarketDataSource.findOneAndUpdate({ name: 'data.gov.in (OGD)' }, { baseUrl: live.sourceUrl, resourceId: process.env.OGD_RESOURCE_ID, enabled: true, lastSuccessAt: new Date(), lastError: '' }, { upsert: true });
      } catch (e) {}
    }
    return { prices: live.prices.filter((price) => matches(price, filters)), freshness: 'live', warning: null };
  }

  // If MongoDB is not connected, search inMemoryStore
  if (mongoose.connection.readyState !== 1) {
    const prices = inMemoryStore.prices.filter((p) => matches(p, filters));
    return {
      prices,
      freshness: prices.length ? 'verified_portal_data' : 'unavailable',
      warning: prices.length ? null : 'No verified mandi prices matched your search criteria.'
    };
  }

  try {
    await MarketDataSource.findOneAndUpdate({ name: 'data.gov.in (OGD)' }, { lastFailureAt: new Date(), lastError: live.reason }, { upsert: true });
  } catch (e) {}
  const query = {};
  for (const field of ['state', 'district', 'mandi', 'crop']) if (filters[field]) query[field] = new RegExp(filters[field], 'i');
  if (filters.date) query.priceDate = { $gte: new Date(`${filters.date}T00:00:00.000Z`), $lt: new Date(`${filters.date}T23:59:59.999Z`) };
  const prices = await MandiPrice.find(query).sort({ priceDate: -1 }).lean();
  return { prices, freshness: prices.length ? 'stored' : 'unavailable', warning: prices.length ? `Live official data is unavailable. Stored records may be stale. ${live.reason}` : live.reason };
}
module.exports = { searchPrices };
