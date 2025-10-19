// =======================
// 🎬 Database Connection (Neon + Local Ready)
// =======================

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

// Connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // required for Neon on Render
  },
});

export default pool;

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
