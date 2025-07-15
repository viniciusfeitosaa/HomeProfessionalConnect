import { db } from "./db.js";
import { users } from "../shared/schema.js";
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
        console.log('Seeding database with initial data...');
        // Create sample users first
        // const sampleUsers = [
        //   {
        //     id: 1,
        //     name: "Ana Carolina Silva",
        //     email: "ana.carolina@email.com",
        //     password: "$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ",
        //     userType: "provider" as const,
        //     isVerified: true,
        //     phoneVerified: true,
        //     phone: "(11) 99999-9999",
        //     profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        //   },
        //   {
        //     id: 2,
        //     name: "Carlos Eduardo Santos",
        //     email: "carlos.santos@email.com",
        //     password: "$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ",
        //     userType: "provider" as const,
        //     isVerified: true,
        //     phoneVerified: true,
        //     phone: "(11) 98888-8888",
        //     profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        //   },
        //   {
        //     id: 3,
        //     name: "Maria Fernanda Costa",
        //     email: "maria.costa@email.com",
        //     password: "$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ",
        //     userType: "provider" as const,
        //     isVerified: true,
        //     phoneVerified: true,
        //     phone: "(11) 97777-7777",
        //     profileImage: "https://images.unsplash.com/photo-1594824475953-2b2bb7f37b95?w=300&h=300&fit=crop&crop=face",
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        //   },
        //   {
        //     id: 4,
        //     name: "Roberto Lima",
        //     email: "roberto.lima@email.com",
        //     password: "$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ",
        //     userType: "provider" as const,
        //     isVerified: true,
        //     phoneVerified: true,
        //     phone: "(11) 96666-6666",
        //     profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        //   },
        //   {
        //     id: 5,
        //     name: "Juliana Oliveira",
        //     email: "juliana.oliveira@email.com",
        //     password: "$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ",
        //     userType: "provider" as const,
        //     isVerified: true,
        //     phoneVerified: true,
        //     phone: "(11) 95555-5555",
        //     profileImage: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=300&fit=crop&crop=face",
        //     createdAt: new Date(),
        //     updatedAt: new Date()
        //   }
        // ];
        // Insert users first
        // await db.insert(users).values(sampleUsers);
        // console.log(`Successfully seeded ${sampleUsers.length} users`);
        // Create sample professionals
        // const sampleProfessionals = [
        //   {
        //     userId: 1,
        //     name: "Ana Carolina Silva",
        //     specialization: "Fisioterapeuta Especializada",
        //     category: "fisioterapeuta" as const,
        //     subCategory: "terapias_especializadas" as const,
        //     description: "Especialista em reabilitação neurológica e ortopédica com mais de 8 anos de experiência.",
        //     experience: "8 anos de experiência em fisioterapia",
        //     certifications: "CREFITO-3, Especialização em Neurologia",
        //     availableHours: JSON.stringify({
        //       monday: ["08:00", "17:00"],
        //       tuesday: ["08:00", "17:00"],
        //       wednesday: ["08:00", "17:00"],
        //       thursday: ["08:00", "17:00"],
        //       friday: ["08:00", "15:00"]
        //     }),
        //     hourlyRate: "85.00",
        //     rating: "4.9",
        //     totalReviews: 127,
        //     location: "Vila Madalena, São Paulo",
        //     distance: "2.3",
        //     available: true,
        //     imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
        //   },
        //   {
        //     userId: 2,
        //     name: "Carlos Eduardo Santos",
        //     specialization: "Técnico em Enfermagem",
        //     category: "tecnico_enfermagem" as const,
        //     subCategory: "curativos_medicacao" as const,
        //     description: "Técnico experiente em cuidados domiciliares, curativos e administração de medicamentos.",
        //     experience: "6 anos de experiência em enfermagem",
        //     certifications: "COREN-SP, Curso de Urgência e Emergência",
        //     availableHours: JSON.stringify({
        //       monday: ["06:00", "18:00"],
        //       tuesday: ["06:00", "18:00"],
        //       wednesday: ["06:00", "18:00"],
        //       thursday: ["06:00", "18:00"],
        //       friday: ["06:00", "18:00"],
        //       saturday: ["08:00", "14:00"]
        //     }),
        //     hourlyRate: "45.00",
        //     rating: "4.8",
        //     totalReviews: 89,
        //     location: "Ipiranga, São Paulo",
        //     distance: "1.8",
        //     available: true,
        //     imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face"
        //   },
        //   {
        //     userId: 3,
        //     name: "Maria Fernanda Costa",
        //     specialization: "Acompanhante Hospitalar",
        //     category: "acompanhante_hospitalar" as const,
        //     subCategory: "acompanhamento_hospitalar" as const,
        //     description: "Acompanhante especializada em cuidados com idosos e pacientes em recuperação.",
        //     experience: "5 anos de experiência",
        //     certifications: "Curso de Cuidador de Idosos, Primeiros Socorros",
        //     availableHours: JSON.stringify({
        //       monday: ["24h"],
        //       tuesday: ["24h"],
        //       wednesday: ["24h"],
        //       thursday: ["24h"],
        //       friday: ["24h"],
        //       saturday: ["24h"],
        //       sunday: ["24h"]
        //     }),
        //     hourlyRate: "38.00",
        //     rating: "4.7",
        //     totalReviews: 156,
        //     location: "Moema, São Paulo",
        //     distance: "3.1",
        //     available: true,
        //     imageUrl: "https://images.unsplash.com/photo-1594824475953-2b2bb7f37b95?w=300&h=300&fit=crop&crop=face"
        //   },
        //   {
        //     userId: 4,
        //     name: "Roberto Lima",
        //     specialization: "Fisioterapeuta Respiratório",
        //     category: "fisioterapeuta" as const,
        //     subCategory: "terapias_especializadas" as const,
        //     description: "Especialista em fisioterapia respiratória e reabilitação cardíaca.",
        //     experience: "10 anos de experiência",
        //     certifications: "CREFITO-3, Especialização em Fisioterapia Respiratória",
        //     availableHours: JSON.stringify({
        //       monday: ["07:00", "19:00"],
        //       tuesday: ["07:00", "19:00"],
        //       wednesday: ["07:00", "19:00"],
        //       thursday: ["07:00", "19:00"],
        //       friday: ["07:00", "16:00"]
        //     }),
        //     hourlyRate: "95.00",
        //     rating: "4.9",
        //     totalReviews: 98,
        //     location: "Pinheiros, São Paulo",
        //     distance: "1.5",
        //     available: true,
        //     imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face"
        //   },
        //   {
        //     userId: 5,
        //     name: "Juliana Oliveira",
        //     specialization: "Acompanhante Domiciliar",
        //     category: "acompanhante_hospitalar" as const,
        //     subCategory: "companhia_apoio_emocional" as const,
        //     description: "Cuidadora especializada em apoio emocional e atividades da vida diária.",
        //     experience: "7 anos de experiência",
        //     certifications: "Curso de Psicologia Aplicada, Cuidados com Idosos",
        //     availableHours: JSON.stringify({
        //       monday: ["08:00", "20:00"],
        //       tuesday: ["08:00", "20:00"],
        //       wednesday: ["08:00", "20:00"],
        //       thursday: ["08:00", "20:00"],
        //       friday: ["08:00", "20:00"],
        //       saturday: ["10:00", "18:00"]
        //     }),
        //     hourlyRate: "42.00",
        //     rating: "4.8",
        //     totalReviews: 203,
        //     location: "Vila Olímpia, São Paulo",
        //     distance: "2.8",
        //     available: true,
        //     imageUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=300&fit=crop&crop=face"
        //   }
        // ];
        // Insert professionals
        // await db.insert(professionals).values(sampleProfessionals);
        // console.log(`Successfully seeded ${sampleProfessionals.length} professionals`);
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
}
