const { db } = require('./dist/db.js');
const { sql } = require('drizzle-orm');

async function updateSchema() {
  try {
    console.log('🔄 Atualizando schema do banco de dados...');
    
    // Remove constraint existente se houver
    await db.execute(sql`ALTER TABLE service_offers DROP CONSTRAINT IF EXISTS service_offers_status_check;`);
    console.log('✅ Constraint removida');
    
    // Adiciona nova constraint com status 'completed' e 'paid'
    await db.execute(sql`ALTER TABLE service_offers ADD CONSTRAINT service_offers_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'paid', 'completed'));`);
    console.log('✅ Nova constraint adicionada');
    
    console.log('✅ Schema atualizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar schema:', error);
    process.exit(1);
  }
}

updateSchema();
