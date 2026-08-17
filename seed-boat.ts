import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { boats } from "./src/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL as string);
const db = drizzle(sql);

async function seed() {
  await db.insert(boats).values({ name: "Riviera 1", capacity: 12, isActive: true }).onConflictDoNothing();
  console.log("Boat seeded.");
  process.exit(0);
}

seed();
