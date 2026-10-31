import cron from 'node-cron';
import { app } from './app.js';
import { config } from './config.js';
import { syncPrices } from './jobs/sync.js';
import './db.js';

app.listen(config.port, () => console.log(`Mandi API running on :${config.port}`));

if (config.dataGovKey) {
  cron.schedule(config.syncCron, () => syncPrices().catch(console.error));
  syncPrices().catch(console.error); // warm the DB on startup
} else {
  console.warn('DATA_GOV_API_KEY missing: price sync disabled');
}
