const mongoose = require('mongoose');
const { env } = require('../config/env');

async function connectDb() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri);
    console.log(`[DB] Connected to MongoDB: ${mongoose.connection.name}`);
    return;
  } catch (primaryError) {
    if (!env.mongoUriFallback) {
      throw primaryError;
    }

    console.warn('[DB] Primary MongoDB URI failed. Trying fallback URI...');
    await mongoose.connect(env.mongoUriFallback);
    console.log(`[DB] Connected to fallback MongoDB: ${mongoose.connection.name}`);
  }
}

module.exports = { connectDb };
