import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET,
  dataGovKey: process.env.DATA_GOV_API_KEY,
  dbPath: process.env.DB_PATH || './data/mandi.db',
  syncStates: (process.env.SYNC_STATES || 'Telangana,Andhra Pradesh')
    .split(',').map((s) => s.trim()).filter(Boolean),
  syncCron: process.env.SYNC_CRON || '0 */6 * * *',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

if (!config.jwtSecret) throw new Error('JWT_SECRET is required in .env');
