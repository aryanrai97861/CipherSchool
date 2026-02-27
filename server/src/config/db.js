const mongoose = require('mongoose');
const { Pool } = require('pg');

// PostgreSQL connection pool (Neon.tech)
const pgPool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// MongoDB connection
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Verify PostgreSQL connection
const verifyPg = async () => {
  try {
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL (Neon) connected');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  }
};

module.exports = { pgPool, connectMongo, verifyPg };
