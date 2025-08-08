// Carrega as variáveis de ambiente
import 'dotenv/config';
import path from 'path';
import { config } from 'dotenv';
// Carrega o arquivo .env da raiz do projeto
config({ path: path.resolve(process.cwd(), '../.env') });
// Define as variáveis manualmente se não estiverem carregadas
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
}
if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "462850e97a4147e11d70bd6bb8675b39855643173f0d0aa8904be81060f506a7";
}
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "lifebee_jwt_secret_2025_vinicius_alves_secure_token_key_64_chars_long";
}
console.log("Current directory:", process.cwd());
console.log("Env file path:", path.resolve(process.cwd(), '../.env'));
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('DATABASE')));
console.log("DATABASE_URL value:", process.env.DATABASE_URL);
// Conexão com o banco Neon/PostgreSQL usando variável DATABASE_URL definida no ambiente
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema.js";
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
console.log("=== DATABASE CONNECTION DEBUG ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NETLIFY_DATABASE_URL exists:", !!process.env.NETLIFY_DATABASE_URL);
console.log("Using connection string:", connectionString ? "YES" : "NO");
if (!connectionString) {
    console.error("❌ DATABASE CONNECTION ERROR: No connection string found!");
    throw new Error("DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?");
}
let pool;
let db;
try {
    pool = new Pool({ connectionString });
    db = drizzle(pool, { schema });
    console.log("✅ Database connection established successfully");
}
catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
}
export { pool, db };
