require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);

async function run() {
  await sql`DROP TABLE IF EXISTS blocked_dates CASCADE;`;
  console.log('Dropped');
  process.exit(0);
}

run();
