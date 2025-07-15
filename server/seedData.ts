import { db } from "./db.js";
import { professionals, users } from "../shared/schema.js";

export async function seedDatabase() {
  console.log("=== SEED DATABASE DEBUG ===");
  console.log("Starting seedDatabase function...");
  
  try {
    // Check if data already exists
    console.log("Checking if data already exists...");
    const existingUsers = await db.select().from(users).limit(1);
    console.log("Existing users count:", existingUsers.length);
    
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Database is empty. No seed data to insert.');
  } catch (error) {
    console.error("Error checking database:", error);
  }
}