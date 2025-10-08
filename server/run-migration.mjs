import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔄 Executando migration de notificações...');

try {
  const sql = neon(DATABASE_URL);
  
  // Executar comandos SQL um por um
  console.log('⏳ Adicionando coluna type...');
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'info'`;
  console.log('✅ Coluna type adicionada');
  
  console.log('⏳ Adicionando coluna title...');
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''`;
  console.log('✅ Coluna title adicionada');
  
  console.log('⏳ Adicionando coluna action_url...');
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`;
  console.log('✅ Coluna action_url adicionada');
  
  console.log('⏳ Atualizando notificações existentes...');
  await sql`UPDATE notifications SET title = 'Notificação' WHERE title IS NULL OR title = ''`;
  console.log('✅ Notificações existentes atualizadas');
  
  console.log('✅ Migration executada com sucesso!');
  console.log('✅ Colunas adicionadas à tabela notifications:');
  console.log('   - type (TEXT, default: info)');
  console.log('   - title (TEXT)');
  console.log('   - action_url (TEXT, nullable)');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao executar migration:', error);
  process.exit(1);
}

