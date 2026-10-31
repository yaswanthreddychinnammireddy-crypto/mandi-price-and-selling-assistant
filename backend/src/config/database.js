const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('⚠️ MONGO_URI not configured. API running with in-memory fallback.');
    return;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.warn('⚠️ MongoDB connection unavailable (' + error.message + '). API running in standalone mode.');
  }
}

module.exports = { connectDatabase };
