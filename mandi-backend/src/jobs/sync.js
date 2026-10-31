import { fileURLToPath } from 'node:url';
import { db } from '../db.js';
import { config } from '../config.js';
import { fetchStatePrices } from '../services/agmarknet.js';

const upsert = db.prepare(`
  INSERT INTO prices (state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price)
  VALUES (@state, @district, @market, @commodity, @variety, @grade, @arrival_date, @min_price, @max_price, @modal_price)
  ON CONFLICT (state, district, market, commodity, variety, grade, arrival_date)
  DO UPDATE SET min_price = excluded.min_price, max_price = excluded.max_price, modal_price = excluded.modal_price
`);
const saveMany = db.transaction((rows) => { for (const r of rows) upsert.run(r); });

export function checkAlerts() {
  const alerts = db.prepare('SELECT * FROM alerts WHERE active = 1').all();
  const mark = db.prepare(`UPDATE alerts SET active = 0, triggered_price = ?, triggered_at = datetime('now') WHERE id = ?`);
  let fired = 0;
  for (const a of alerts) {
    const params = [a.commodity, a.state];
    let marketClause = '';
    if (a.market) { marketClause = 'AND market = ? COLLATE NOCASE'; params.push(a.market); }
    const row = db.prepare(`
      SELECT ROUND(AVG(modal_price)) AS price FROM prices
      WHERE commodity = ? COLLATE NOCASE AND state = ? COLLATE NOCASE ${marketClause}
        AND arrival_date = (SELECT MAX(arrival_date) FROM prices WHERE commodity = ? COLLATE NOCASE AND state = ? COLLATE NOCASE ${marketClause})
    `).get(...params, ...params);
    if (!row?.price) continue;
    const hit = a.direction === 'above' ? row.price >= a.target_price : row.price <= a.target_price;
    if (hit) {
      mark.run(row.price, a.id);
      fired++;
      // TODO: send SMS / WhatsApp / push notification to the user here
    }
  }
  return fired;
}

export async function syncPrices() {
  let total = 0;
  for (const state of config.syncStates) {
    try {
      const rows = await fetchStatePrices(state);
      saveMany(rows);
      total += rows.length;
      console.log(`[sync] ${state}: ${rows.length} records`);
    } catch (err) {
      console.error(`[sync] ${state} failed:`, err.message);
    }
  }
  const fired = checkAlerts();
  console.log(`[sync] done. ${total} records upserted, ${fired} alerts triggered`);
  return { total, fired };
}

// `npm run sync` runs it once manually
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncPrices().then(() => process.exit(0));
}
