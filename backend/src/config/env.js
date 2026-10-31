const path = require('path');
const dotenv = require('dotenv');

// The workspace-level file is intentionally supported for locally managed secrets.
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
dotenv.config();

const required = (name) => {
  if (!process.env[name]) throw new Error(`${name} is required`);
  return process.env[name];
};

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'kisan_setu_default_jwt_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000,http://localhost:5173').split(',').map((value) => value.trim()),
  openAiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || 'deepseek-chat',
  openAiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  ogd: {
    apiKey: process.env.OGD_API_KEY || '',
    resourceId: process.env.OGD_RESOURCE_ID || '',
    baseUrl: process.env.OGD_API_BASE_URL || 'https://api.data.gov.in/resource',
    timeoutMs: Number(process.env.OGD_TIMEOUT_MS || 10000)
  },
  require
};
