import 'dotenv/config';
import path from 'path';
import { config } from 'dotenv';

// Carrega o arquivo .env da raiz do projeto
config({ path: path.resolve(process.cwd(), '../.env') });

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE CONNECTION ERROR: No connection string found!");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function createPaymentReferencesTable() {
  try {
    console.log('🚀 Criando tabela payment_references...');
    
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_references (
        id SERIAL PRIMARY KEY,
        service_request_id INTEGER NOT NULL,
        service_offer_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        professional_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        preference_id TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
        external_reference TEXT NOT NULL,
        payment_id TEXT,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Criar índices para melhor performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_references_preference_id ON payment_references(preference_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_references_service_request ON payment_references(service_request_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_references_client ON payment_references(client_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_references_professional ON payment_references(professional_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_references_status ON payment_references(status);`);
    
    console.log('✅ Tabela payment_references criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela payment_references:', error);
  } finally {
    await pool.end();
  }
}

createPaymentReferencesTable();
