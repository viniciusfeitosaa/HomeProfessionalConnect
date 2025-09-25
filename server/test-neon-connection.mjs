import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

// Nova string de conexão fornecida pelo usuário
const DATABASE_URL = 'postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔍 Testando conexão com o banco Neon...');
console.log('📡 String de conexão:', DATABASE_URL);

try {
  // Testa a conexão
  const sql = neon(DATABASE_URL);
  
  console.log('✅ Conexão estabelecida com sucesso!');
  
  // Lista as tabelas
  console.log('\n📋 Listando tabelas disponíveis...');
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  console.log('Tabelas encontradas:', tables.map(t => t.table_name));
  
  // Verifica a tabela payment_references
  console.log('\n💰 Verificando tabela payment_references...');
  const paymentRefs = await sql`SELECT * FROM payment_references LIMIT 5`;
  console.log('Estrutura da tabela payment_references:');
  console.log('Colunas:', Object.keys(paymentRefs[0] || {}));
  console.log('Registros encontrados:', paymentRefs.length);
  
  if (paymentRefs.length > 0) {
    console.log('Primeiro registro:', paymentRefs[0]);
  }
  
  console.log('\n🎉 Teste de conexão concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao conectar com o banco:', error);
  process.exit(1);
}


