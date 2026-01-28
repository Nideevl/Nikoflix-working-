import pkg from 'pg'; // imported pg package (PostgreSQL client side for Node.js)
const { Pool } = pkg; // Destructuring to extract just the Pool class
import 'dotenv/config';

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

export const query = (text, params) =>
  pool.query(text, params);
