const axios = require('axios');
const env = require('../config/env');

const value = (record, keys) => {
  const normalized = Object.fromEntries(Object.entries(record).map(([key, item]) => [key.toLowerCase().replace(/[ _-]/g, ''), item]));
  for (const key of keys) if (normalized[key] !== undefined && normalized[key] !== '') return normalized[key];
  return undefined;
};
const number = (input) => {
  const parsed = Number(String(input ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : undefined;
};
const asDate = (input) => {
  const parsed = new Date(input);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
};

function normalizeOgdRecord(record) {
  const priceDate = asDate(value(record, ['arrivaldate', 'pricedate', 'date']));
  const modalPrice = number(value(record, ['modalprice', 'modal_price']));
  const state = value(record, ['state', 'state_name']);
  const mandi = value(record, ['market', 'mandi', 'marketname']);
  const crop = value(record, ['commodity', 'crop', 'commodityname']);
  if (!priceDate || modalPrice === undefined || !state || !mandi || !crop) return null;
  return {
    state: String(state), district: String(value(record, ['district', 'districtname']) || ''), mandi: String(mandi), crop: String(crop),
    variety: String(value(record, ['variety']) || 'Unknown'), minPrice: number(value(record, ['minprice', 'min_price'])),
    maxPrice: number(value(record, ['maxprice', 'max_price'])), modalPrice, priceDate, unit: 'INR/quintal', dataSource: 'data.gov.in (OGD)',
    sourceUrl: `${env.ogd.baseUrl}/${env.ogd.resourceId}`
  };
}

async function fetchOfficialPrices() {
  if (!env.ogd.resourceId || !env.ogd.apiKey) {
    return { available: false, reason: 'Official OGD data is not configured. Set OGD_RESOURCE_ID and OGD_API_KEY.', prices: [] };
  }
  const url = `${env.ogd.baseUrl.replace(/\/$/, '')}/${encodeURIComponent(env.ogd.resourceId)}`;
  try {
    const response = await axios.get(url, { params: { 'api-key': env.ogd.apiKey, format: 'json', limit: 1000 }, timeout: env.ogd.timeoutMs });
    const records = response.data?.records;
    if (!Array.isArray(records)) return { available: false, reason: 'OGD returned no usable records.', prices: [] };
    return { available: true, prices: records.map(normalizeOgdRecord).filter(Boolean), sourceUrl: url };
  } catch (error) {
    return { available: false, reason: `Official OGD request failed: ${error.response?.status || error.code || 'unknown error'}.`, prices: [] };
  }
}
module.exports = { fetchOfficialPrices };
