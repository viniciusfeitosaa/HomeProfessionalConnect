import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Nova string de conexão fornecida pelo usuário
const DATABASE_URL = 'postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔍 Testando diferentes formatos de conexão com o banco Neon...');
console.log('📡 String de conexão original:', DATABASE_URL);

// Testa diferentes formatos da string de conexão
const connectionFormats = [
  DATABASE_URL,
  DATABASE_URL.replace('?sslmode=require&channel_binding=require', ''),
  DATABASE_URL.replace('&channel_binding=require', ''),
  DATABASE_URL.replace('?sslmode=require&channel_binding=require', '?sslmode=prefer'),
  DATABASE_URL.replace('?sslmode=require&channel_binding=require', '?sslmode=disable')
];

for (let i = 0; i < connectionFormats.length; i++) {
  const format = connectionFormats[i];
  console.log(`\n🧪 Testando formato ${i + 1}:`, format);
  
  try {
    const sql = neon(format);
    
    // Testa uma query simples
    const result = await sql`SELECT 1 as test`;
    console.log(`✅ Formato ${i + 1} funcionou! Resultado:`, result[0]);
    
    // Se funcionou, testa listar tabelas
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 3`;
    console.log(`📋 Tabelas encontradas (primeiras 3):`, tables.map(t => t.table_name));
    
  } catch (error) {
    console.log(`❌ Formato ${i + 1} falhou:`, error.message);
  }
}

console.log('\n🎯 Teste de formatos concluído!');
