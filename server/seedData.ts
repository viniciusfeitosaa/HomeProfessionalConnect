import { db } from "./db.js";
import { professionals, users, serviceRequests } from "./schema.js";

export async function seedDatabase() {
  console.log("=== SEED DATABASE DEBUG ===");
  console.log("Starting seedDatabase function...");
  
  try {
    // Limpar dados existentes para garantir dados limpos
    console.log("Limpando dados existentes...");
    await db.delete(serviceRequests);
    await db.delete(professionals);
    await db.delete(users);
    console.log("Dados limpos com sucesso");
    
    // Check if data already exists
    console.log("Checking if data already exists...");
    const existingUsers = await db.select().from(users).limit(1);
    console.log("Existing users count:", existingUsers.length);
    
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Database is empty. Creating test data...');
    
    // Criar usuários de teste
    const testUsers = await db.insert(users).values([
      {
        username: "cliente1",
        name: "João Silva",
        email: "joao@teste.com",
        password: "$2b$10$test", // senha: 123456
        userType: "client",
        isVerified: true
      },
      {
        username: "profissional1",
        name: "Ana Carolina",
        email: "ana@teste.com",
        password: "$2b$10$test", // senha: 123456
        userType: "provider",
        isVerified: true
      }
    ]).returning();
    
    console.log('Test users created:', testUsers.length);
    
    // Criar solicitações de serviço de teste com endereços reais
    const testServiceRequests = await db.insert(serviceRequests).values([
      {
        clientId: testUsers[0].id,
        serviceType: "Fisioterapia domiciliar",
        category: "fisioterapeuta",
        description: "Preciso de fisioterapia para recuperação de lesão no joelho após cirurgia",
        address: "Rua das Flores, 150, Vila Madalena, São Paulo, SP",
        scheduledDate: new Date("2024-12-25"),
        scheduledTime: "14:00",
        budget: 150.00,
        status: "open"
      },
      {
        clientId: testUsers[0].id,
        serviceType: "Acompanhamento hospitalar",
        category: "acompanhante_hospitalar",
        description: "Acompanhamento para cirurgia no Hospital Albert Einstein",
        address: "Av. Albert Einstein, 627, Morumbi, São Paulo, SP",
        scheduledDate: new Date("2024-12-26"),
        scheduledTime: "08:00",
        budget: 200.00,
        status: "open"
      },
      {
        clientId: testUsers[0].id,
        serviceType: "Curativos e medicação",
        category: "tecnico_enfermagem",
        description: "Aplicação de curativos e medicação para paciente idoso",
        address: "Rua Harmonia, 456, Vila Madalena, São Paulo, SP",
        scheduledDate: new Date("2024-12-27"),
        scheduledTime: "10:00",
        budget: 120.00,
        status: "open"
      },
      {
        clientId: testUsers[0].id,
        serviceType: "Fisioterapia respiratória",
        category: "fisioterapeuta",
        description: "Fisioterapia respiratória para paciente com COVID-19",
        address: "Rua dos Pinheiros, 789, Pinheiros, São Paulo, SP",
        scheduledDate: new Date("2024-12-28"),
        scheduledTime: "16:00",
        budget: 180.00,
        status: "open"
      },
      {
        clientId: testUsers[0].id,
        serviceType: "Acompanhamento pós-operatório",
        category: "acompanhante_hospitalar",
        description: "Acompanhamento pós-operatório no Hospital Sírio-Libanês",
        address: "Rua Dona Adma Jafet, 91, Bela Vista, São Paulo, SP",
        scheduledDate: new Date("2024-12-29"),
        scheduledTime: "09:00",
        budget: 250.00,
        status: "open"
      },
      {
        clientId: testUsers[0].id,
        serviceType: "Aplicação de injeção",
        category: "tecnico_enfermagem",
        description: "Aplicação de injeção intramuscular para paciente diabético",
        address: "Av. Paulista, 1000, Bela Vista, São Paulo, SP",
        scheduledDate: new Date("2024-12-30"),
        scheduledTime: "11:00",
        budget: 100.00,
        status: "open"
      }
    ]).returning();
    
    console.log('Test service requests created:', testServiceRequests.length);
    
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}