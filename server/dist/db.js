// Conexão com o banco Neon/PostgreSQL usando variável DATABASE_URL definida no ambiente
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from './shared/schema.js';
neonConfig.webSocketConstructor = ws;
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?");
}
export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
