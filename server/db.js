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
  // --- Single string connection (Render / Neon recommended) ---
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // --- Fallback: Multi-line local .env variables ---
  poolConfig = {
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
    ssl: { rejectUnauthorized: false },
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
