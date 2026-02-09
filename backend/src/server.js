import app from './app.js';
import 'dotenv/config';
import { query } from './config/db.js'

const PORT = process.env.PORT || 5000;

const testDb = async () => {
  const res = await query("SELECT NOW()");
  console.log("✅ Supabase connected:", res.rows[0]);
};

testDb();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NIKOFLIX backend running on ${PORT}`);
});