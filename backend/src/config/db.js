import pkg from 'pg'; // imported pg package (PostgreSQL client side for Node.js)
const { Pool } = pkg; // Destructuring to extract just the Pool class
import 'dotenv/config';

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export const query = (text, params) =>
  pool.query(text, params);
