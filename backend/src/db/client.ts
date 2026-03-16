import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set — check your .env file");
}

const isSupabase =
  dbUrl.includes("supabase.co") || dbUrl.includes("supabase.com");

console.log(`[db] connecting to ${isSupabase ? "Supabase" : "local"} postgres`);
console.log(`[db] url: ${dbUrl.replace(/:([^:@]+)@/, ":***@")}`); // mask password

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

pool.on("connect", () => console.log("[db] pool connection established"));
pool.on("error", (err) => console.error("[db] pool error:", err.message));

export const db = drizzle(pool, { schema });
