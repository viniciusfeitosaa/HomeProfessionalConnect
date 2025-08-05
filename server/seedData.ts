import { db } from "./db.js";
import { professionals, users, serviceRequests } from "./schema.js";
import { clearDatabase } from "./clearDatabase.js";

export async function seedDatabase() {
  console.log("=== SEED DATABASE DEBUG ===");
  console.log("Starting seedDatabase function...");
  
  try {
    // Limpar TODOS os dados existentes para garantir um banco limpo
    console.log("🧹 Limpando todos os dados existentes...");
    await clearDatabase();
    
    console.log('✅ Banco de dados limpo. Apenas usuários reais podem se registrar.');
    console.log('📝 Não serão criados dados de exemplo.');
    
  } catch (error) {
    console.error("Error clearing database:", error);
  }
}