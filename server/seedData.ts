import { db } from "./db.js";
import { professionals, users, serviceRequests } from "./schema.js";

export async function seedDatabase() {
  console.log("=== SEED DATABASE DEBUG ===");
  console.log("Starting seedDatabase function...");
  
  try {
    // Verificar se já existem dados
    console.log("Checking if data already exists...");
    const existingUsers = await db.select().from(users).limit(1);
    console.log("Existing users count:", existingUsers.length);
    
    if (existingUsers.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Database is empty. No test data will be created.');
    console.log('Users can register normally through the application.');
    
  } catch (error) {
    console.error("Error checking database:", error);
  }
}