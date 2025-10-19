// =======================
// 🎬 Database Connection (Neon + Local Ready)
// =======================

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Automatically decide which style to use
let poolConfig = {};

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}


export const pool = new Pool(poolConfig);

// --- Optional: quick connection test on startup ---
pool
  .connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });
