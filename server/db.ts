// Carrega as variáveis de ambiente
import 'dotenv/config';
import path from 'path';
import { config } from 'dotenv';


// Carrega o arquivo .env da raiz do projeto
config({ path: path.resolve(process.cwd(), '../.env') });

// Define as variáveis manualmente se não estiverem carregadas
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_OMmGjW6wS8Ao@ep-little-king-ad4q6wb5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
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
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

export const db = drizzle(sql);
