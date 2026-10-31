const app = require('./app');
const { connectDatabase } = require('./config/database');
const env = require('./config/env');
connectDatabase().then(() => app.listen(env.port, () => console.log(`API listening on port ${env.port}`))).catch((error) => { console.error('Startup failed:', error.message); process.exit(1); });
