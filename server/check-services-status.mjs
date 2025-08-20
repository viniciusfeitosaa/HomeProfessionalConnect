import { Client } from 'pg';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'lifebee',
  user: 'postgres',
  password: 'postgres'
});

async function checkServicesStatus() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar todos os service_requests
    console.log('\n🔍 SERVICE_REQUESTS:');
    const serviceRequests = await client.query(`
      SELECT id, status, "assignedProfessionalId", "clientConfirmedAt", "serviceCompletedAt"
      FROM service_requests 
      ORDER BY id DESC
    `);
    console.log('Service Requests:', serviceRequests.rows);

    // Verificar todas as service_offers
    console.log('\n🔍 SERVICE_OFFERS:');
    const serviceOffers = await client.query(`
      SELECT id, "serviceRequestId", "professionalId", status, "proposedPrice", "finalPrice"
      FROM service_offers 
      ORDER BY "serviceRequestId" DESC
    `);
    console.log('Service Offers:', serviceOffers.rows);

    // Verificar service_progress
    console.log('\n🔍 SERVICE_PROGRESS:');
    const serviceProgress = await client.query(`
      SELECT "serviceRequestId", "professionalId", status, "completedAt", "confirmedAt"
      FROM service_progress 
      ORDER BY "serviceRequestId" DESC
    `);
    console.log('Service Progress:', serviceProgress.rows);

    // Verificar transactions
    console.log('\n🔍 TRANSACTIONS:');
    const transactions = await client.query(`
      SELECT id, "serviceRequestId", "professionalId", amount, status, type
      FROM transactions 
      ORDER BY "serviceRequestId" DESC
    `);
    console.log('Transactions:', transactions.rows);

    // Verificar service_reviews
    console.log('\n🔍 SERVICE_REVIEWS:');
    const serviceReviews = await client.query(`
      SELECT "serviceRequestId", "professionalId", rating, comment
      FROM service_reviews 
      ORDER BY "serviceRequestId" DESC
    `);
    console.log('Service Reviews:', serviceReviews.rows);

    // Verificar profissionais
    console.log('\n🔍 PROFESSIONALS:');
    const professionals = await client.query(`
      SELECT id, "userId", name, rating, "totalReviews"
      FROM professionals 
      ORDER BY id DESC
    `);
    console.log('Professionals:', professionals.rows);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.end();
  }
}

checkServicesStatus();
