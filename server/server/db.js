import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables
dotenv.config({ path: './.env' });

// Configure PostgreSQL connection
let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Neon on Render
    },
  };
} else {
  console.error('❌ DATABASE_URL not found in environment!');
}

export const pool = new Pool(poolConfig);
