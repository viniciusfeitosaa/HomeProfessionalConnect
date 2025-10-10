import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Conectar ao banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🔄 Conectando ao banco de dados...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco!');
    
    // Ler arquivo SQL
    const migrationPath = join(__dirname, '0012_add_stripe_connect_fields.sql');
    console.log('📄 Lendo migration:', migrationPath);
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Executando migration...\n');
    
    // Executar migration
    await client.query(sql);
    
    console.log('✅ Migration executada com sucesso!');
    console.log('\n📊 Verificando estrutura da tabela...\n');
    
    // Verificar colunas adicionadas
    const result = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'professionals'
      AND column_name LIKE 'stripe%'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colunas Stripe Connect adicionadas:');
    console.log('═══════════════════════════════════════════════════════════');
    result.rows.forEach(row => {
      console.log(`✓ ${row.column_name.padEnd(30)} | ${row.data_type.padEnd(20)} | Default: ${row.column_default || 'NULL'}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ Total: ${result.rows.length} colunas Stripe Connect adicionadas\n`);
    
    // Verificar índices
    const indexResult = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'professionals'
      AND indexname LIKE '%stripe%';
    `);
    
    console.log('Índices criados:');
    console.log('═══════════════════════════════════════════════════════════');
    indexResult.rows.forEach(row => {
      console.log(`✓ ${row.indexname}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n✅ Total: ${indexResult.rows.length} índices criados\n`);
    
    client.release();
    console.log('🎉 Migration completa! Banco de dados pronto para Stripe Connect!\n');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

