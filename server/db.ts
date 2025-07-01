// Conexão com o banco Neon/PostgreSQL usando variável DATABASE_URL definida no ambiente
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

console.log("=== DATABASE CONNECTION DEBUG ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NETLIFY_DATABASE_URL exists:", !!process.env.NETLIFY_DATABASE_URL);
console.log("Using connection string:", connectionString ? "YES" : "NO");

if (!connectionString) {
  console.error("❌ DATABASE CONNECTION ERROR: No connection string found!");
  throw new Error(
    "DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: Pool;
let db: any;

try {
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
  console.log("✅ Database connection established successfully");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  throw error;
}

export { pool, db };
