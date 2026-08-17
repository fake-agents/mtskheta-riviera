import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { costCategories } from '../src/db/schema.js';

const queryClient = postgres(process.env.DATABASE_URL!, { prepare: false, ssl: 'require' });
const db = drizzle(queryClient);

const DEFAULT_CATEGORIES = [
  { name: 'Fuel', color: '#f97316' },
  { name: 'Maintenance', color: '#eab308' },
  { name: 'Staff Salary', color: '#3b82f6' },
  { name: 'Supplies', color: '#8b5cf6' },
  { name: 'Other', color: '#6b7280' },
];

async function seed() {
  console.log('Seeding default cost categories...');
  for (const cat of DEFAULT_CATEGORIES) {
    await db.insert(costCategories).values(cat);
    console.log(`  ✓ ${cat.name} (${cat.color})`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
