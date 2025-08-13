var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import session from "express-session";
import passport2 from "passport";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// server/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  conversations: () => conversations,
  loginAttempts: () => loginAttempts,
  messages: () => messages,
  notifications: () => notifications,
  professionals: () => professionals,
  serviceOffers: () => serviceOffers,
  serviceRequests: () => serviceRequests,
  users: () => users,
  verificationCodes: () => verificationCodes
});
import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  appleId: text("apple_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  phoneVerified: boolean("phone_verified").default(false),
  address: text("address"),
  profileImage: text("profile_image"),
  userType: text("user_type", { enum: ["client", "provider"] }).notNull().default("client"),
  isVerified: boolean("is_verified").default(false),
  isBlocked: boolean("is_blocked").default(false),
  lastLoginAt: timestamp("last_login_at"),
  loginAttempts: integer("login_attempts").default(0),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  // Link to user table for providers
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  category: text("category", {
    enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"]
  }).notNull(),
  subCategory: text("sub_category", {
    enum: [
      "companhia_apoio_emocional",
      "preparacao_refeicoes",
      "compras_transporte",
      "lavanderia_limpeza",
      "curativos_medicacao",
      "terapias_especializadas",
      "acompanhamento_hospitalar"
    ]
  }).notNull(),
  description: text("description").notNull(),
  experience: text("experience"),
  certifications: text("certifications"),
  availableHours: text("available_hours"),
  // JSON string for schedule
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalReviews: integer("total_reviews").default(0),
  location: text("location"),
  distance: decimal("distance", { precision: 3, scale: 1 }),
  available: boolean("available").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  // Client who booked
  professionalId: integer("professional_id").notNull(),
  professionalName: text("professional_name").notNull(),
  serviceType: text("service_type").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(),
  // Duration in hours
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }),
  status: text("status", { enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"] }).default("pending"),
  notes: text("notes"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  successful: boolean("successful").notNull().default(false),
  blocked: boolean("blocked").notNull().default(false),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull()
});
var verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: text("email"),
  phone: text("phone"),
  code: text("code").notNull(),
  type: text("type", { enum: ["email", "phone", "password_reset"] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  deletedByClient: boolean("deleted_by_client").default(false),
  deletedByProfessional: boolean("deleted_by_professional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "file"] }).default("text"),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false)
});
var serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  // Cliente que solicitou
  serviceType: text("service_type").notNull(),
  // Tipo de serviço (ex: fisioterapia, enfermagem)
  category: text("category", {
    enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"]
  }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  // Hora no formato HH:MM
  urgency: text("urgency", { enum: ["low", "medium", "high"] }).default("medium"),
  budget: decimal("budget", { precision: 8, scale: 2 }),
  // Orçamento opcional
  status: text("status", { enum: ["open", "in_progress", "assigned", "completed", "cancelled"] }).default("open"),
  assignedProfessionalId: integer("assigned_professional_id"),
  // Profissional designado
  responses: integer("responses").default(0),
  // Número de profissionais que responderam
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var serviceOffers = pgTable("service_offers", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(),
  // ID da solicitação de serviço
  professionalId: integer("professional_id").notNull(),
  // ID do profissional que fez a proposta
  proposedPrice: decimal("proposed_price", { precision: 8, scale: 2 }).notNull(),
  // Preço proposto
  estimatedTime: text("estimated_time").notNull(),
  // Tempo estimado (ex: "1 hora", "2 horas")
  message: text("message").notNull(),
  // Mensagem da proposta
  status: text("status", { enum: ["pending", "accepted", "rejected", "withdrawn"] }).default("pending"),
  // Status da proposta
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/db.ts
import "dotenv/config";
import path from "path";
import { config } from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
config({ path: path.resolve(process.cwd(), "../.env") });
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
}
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = "462850e97a4147e11d70bd6bb8675b39855643173f0d0aa8904be81060f506a7";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "lifebee_jwt_secret_2025_vinicius_alves_secure_token_key_64_chars_long";
}
console.log("Current directory:", process.cwd());
console.log("Env file path:", path.resolve(process.cwd(), "../.env"));
console.log("All env vars:", Object.keys(process.env).filter((key) => key.includes("DATABASE")));
console.log("DATABASE_URL value:", process.env.DATABASE_URL);
neonConfig.webSocketConstructor = ws;
var connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
console.log("=== DATABASE CONNECTION DEBUG ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NETLIFY_DATABASE_URL exists:", !!process.env.NETLIFY_DATABASE_URL);
console.log("Using connection string:", connectionString ? "YES" : "NO");
if (!connectionString) {
  console.error("\u274C DATABASE CONNECTION ERROR: No connection string found!");
  throw new Error(
    "DATABASE_URL or NETLIFY_DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool;
var db;
try {
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema: schema_exports });
  console.log("\u2705 Database connection established successfully");
} catch (error) {
  console.error("\u274C Database connection failed:", error);
  throw error;
}

// server/storage.ts
import { eq, and, or, gte, ilike, sql, desc, ne } from "drizzle-orm";
var DatabaseStorage = class {
  // Método para converter URLs relativas em absolutas
  getFullImageUrl(relativeUrl) {
    if (relativeUrl.startsWith("http")) {
      return relativeUrl;
    }
    const baseUrl = process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com" : "http://localhost:5000";
    return `${baseUrl}${relativeUrl}`;
  }
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByGoogleId(googleId) {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || void 0;
  }
  async getUserByAppleId(appleId) {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const allowed = [
      "username",
      "password",
      "googleId",
      "appleId",
      "name",
      "email",
      "phone",
      "phoneVerified",
      "address",
      "profileImage",
      "userType",
      "isVerified",
      "isBlocked",
      "lastLoginAt",
      "loginAttempts",
      "resetToken",
      "resetTokenExpiry",
      "updatedAt"
    ];
    const safeUpdates = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }
    safeUpdates.updatedAt = /* @__PURE__ */ new Date();
    const [user] = await db.update(users).set(safeUpdates).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserLoginAttempts(id, attempts) {
    await db.update(users).set({ [users.loginAttempts.name]: attempts, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async blockUser(id) {
    await db.update(users).set({ [users.isBlocked.name]: true, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  async verifyUser(id) {
    await db.update(users).set({ [users.isVerified.name]: true, [users.updatedAt.name]: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
  }
  // Professionals
  async getAllProfessionals() {
    const professionalsData = await db.select({
      id: professionals.id,
      userId: professionals.userId,
      name: professionals.name,
      specialization: professionals.specialization,
      category: professionals.category,
      subCategory: professionals.subCategory,
      description: professionals.description,
      experience: professionals.experience,
      certifications: professionals.certifications,
      availableHours: professionals.availableHours,
      hourlyRate: professionals.hourlyRate,
      rating: professionals.rating,
      totalReviews: professionals.totalReviews,
      location: professionals.location,
      distance: professionals.distance,
      available: professionals.available,
      imageUrl: professionals.imageUrl,
      createdAt: professionals.createdAt
    }).from(professionals).where(eq(professionals.available, true));
    return professionalsData.map((professional) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }
  async getProfessionalsByCategory(category) {
    const professionalsData = await db.select({
      id: professionals.id,
      userId: professionals.userId,
      name: professionals.name,
      specialization: professionals.specialization,
      category: professionals.category,
      subCategory: professionals.subCategory,
      description: professionals.description,
      experience: professionals.experience,
      certifications: professionals.certifications,
      availableHours: professionals.availableHours,
      hourlyRate: professionals.hourlyRate,
      rating: professionals.rating,
      totalReviews: professionals.totalReviews,
      location: professionals.location,
      distance: professionals.distance,
      available: professionals.available,
      imageUrl: professionals.imageUrl,
      createdAt: professionals.createdAt
    }).from(professionals).where(and(eq(professionals.category, category), eq(professionals.available, true)));
    return professionalsData.map((professional) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }
  async searchProfessionals(query) {
    const professionalsData = await db.select({
      id: professionals.id,
      userId: professionals.userId,
      name: professionals.name,
      specialization: professionals.specialization,
      category: professionals.category,
      subCategory: professionals.subCategory,
      description: professionals.description,
      experience: professionals.experience,
      certifications: professionals.certifications,
      availableHours: professionals.availableHours,
      hourlyRate: professionals.hourlyRate,
      rating: professionals.rating,
      totalReviews: professionals.totalReviews,
      location: professionals.location,
      distance: professionals.distance,
      available: professionals.available,
      imageUrl: professionals.imageUrl,
      createdAt: professionals.createdAt
    }).from(professionals).where(
      and(
        eq(professionals.available, true),
        or(
          ilike(professionals.name, `%${query}%`),
          ilike(professionals.specialization, `%${query}%`),
          ilike(professionals.description, `%${query}%`)
        )
      )
    );
    return professionalsData.map((professional) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }
  async getProfessional(id) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    if (!professional) return void 0;
    return {
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    };
  }
  async getProfessionalByUserId(userId) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.userId, userId));
    return professional || void 0;
  }
  async createProfessional(insertProfessional) {
    const [professional] = await db.insert(professionals).values(insertProfessional).returning();
    return professional;
  }
  async updateProfessional(id, updates) {
    const [professional] = await db.update(professionals).set(updates).where(eq(professionals.id, id)).returning();
    return professional;
  }
  async updateProfessionalAvailability(userId, available) {
    await db.update(professionals).set({ available }).where(eq(professionals.userId, userId));
  }
  // Appointments
  async getAppointmentsByUser(userId) {
    return await db.select().from(appointments).where(eq(appointments.clientId, userId));
  }
  async getAppointmentsByProfessional(professionalId) {
    return await db.select().from(appointments).where(eq(appointments.professionalId, professionalId));
  }
  async createAppointment(insertAppointment) {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }
  async updateAppointment(id, updates) {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment;
  }
  // Notifications
  async getNotificationsByUser(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }
  async getUnreadNotificationCount(userId) {
    const [result] = await db.select({ count: sql`cast(count(*) as int)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count || 0;
  }
  async createNotification(insertNotification) {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  async markNotificationRead(id) {
    await db.update(notifications).set({ [notifications.read.name]: true }).where(eq(notifications.id, id));
  }
  // Security & Anti-fraud
  async createLoginAttempt(insertLoginAttempt) {
    const [loginAttempt] = await db.insert(loginAttempts).values(insertLoginAttempt).returning();
    return loginAttempt;
  }
  async getRecentLoginAttempts(ipAddress, minutes) {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1e3);
    return await db.select().from(loginAttempts).where(
      and(
        eq(loginAttempts.ipAddress, ipAddress),
        gte(loginAttempts.attemptedAt, timeAgo)
      )
    );
  }
  async createVerificationCode(insertVerificationCode) {
    const [verificationCode] = await db.insert(verificationCodes).values(insertVerificationCode).returning();
    return verificationCode;
  }
  async getVerificationCode(code, type) {
    const [verificationCode] = await db.select().from(verificationCodes).where(
      and(
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, type),
        eq(verificationCodes.used, false),
        gte(verificationCodes.expiresAt, /* @__PURE__ */ new Date())
      )
    );
    return verificationCode || void 0;
  }
  async markCodeAsUsed(id) {
    await db.update(verificationCodes).set({ [verificationCodes.used.name]: true }).where(eq(verificationCodes.id, id));
  }
  // Conversations & Messages
  async getProfessionalById(userId) {
    const result = await db.select().from(professionals).where(eq(professionals.userId, userId)).limit(1);
    return result[0];
  }
  async getConversation(clientId, professionalId) {
    const result = await db.select().from(conversations).where(
      and(
        eq(conversations.clientId, clientId),
        eq(conversations.professionalId, professionalId)
      )
    ).limit(1);
    return result[0];
  }
  // Verificar se uma conversa foi deletada pelo usuário
  async isConversationDeletedByUser(conversationId, userId) {
    const conversation = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!conversation[0]) {
      return false;
    }
    const conv = conversation[0];
    if (conv.clientId === userId) {
      return conv.deletedByClient === true;
    } else if (conv.professionalId === userId) {
      return conv.deletedByProfessional === true;
    }
    return false;
  }
  // Restaurar conversa (marcar como não deletada pelo usuário)
  async restoreConversation(conversationId, userId) {
    const conversation = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!conversation[0]) {
      throw new Error("Conversa n\xE3o encontrada");
    }
    const conv = conversation[0];
    const updates = {};
    if (conv.clientId === userId) {
      updates.deletedByClient = false;
    } else if (conv.professionalId === userId) {
      updates.deletedByProfessional = false;
    } else {
      throw new Error("Usu\xE1rio n\xE3o \xE9 participante da conversa");
    }
    await db.update(conversations).set(updates).where(eq(conversations.id, conversationId));
  }
  async getConversationsByUser(userId) {
    console.log(`\u{1F50D} getConversationsByUser(${userId}) - Iniciando busca...`);
    const allUserConversations = await db.select().from(conversations).where(
      or(
        eq(conversations.clientId, userId),
        eq(conversations.professionalId, userId)
      )
    );
    console.log(`\u{1F4CB} Todas as conversas do usu\xE1rio ${userId}:`, allUserConversations.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      professionalId: c.professionalId,
      deletedByClient: c.deletedByClient,
      deletedByProfessional: c.deletedByProfessional
    })));
    const asClient = allUserConversations.filter((c) => c.clientId === userId);
    const asProfessional = allUserConversations.filter((c) => c.professionalId === userId);
    console.log(`\u{1F4CA} Usu\xE1rio ${userId} - Como cliente: ${asClient.length}, Como profissional: ${asProfessional.length}`);
    const result = await db.select().from(conversations).where(
      and(
        or(
          eq(conversations.clientId, userId),
          eq(conversations.professionalId, userId)
        ),
        // Não mostrar conversas deletadas pelo usuário
        or(
          and(eq(conversations.clientId, userId), eq(conversations.deletedByClient, false)),
          and(eq(conversations.professionalId, userId), eq(conversations.deletedByProfessional, false))
        )
      )
    );
    console.log(`\u2705 Conversas filtradas para usu\xE1rio ${userId}:`, result.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      professionalId: c.professionalId,
      deletedByClient: c.deletedByClient,
      deletedByProfessional: c.deletedByProfessional
    })));
    return result;
  }
  async createConversation(conversation) {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }
  async createMessage(message) {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }
  async getMessagesByConversation(conversationId) {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
  }
  async getLastMessageByConversation(conversationId) {
    const result = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(desc(messages.timestamp)).limit(1);
    return result[0];
  }
  async getUnreadMessageCount(conversationId, userId) {
    const [result] = await db.select({ count: sql`cast(count(*) as int)` }).from(messages).where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, userId),
        eq(messages.isRead, false)
      )
    );
    return result?.count || 0;
  }
  async markMessagesAsRead(conversationId, userId) {
    await db.update(messages).set({ isRead: true }).where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.senderId, userId),
        eq(messages.isRead, false)
      )
    );
  }
  // Excluir todas as mensagens de uma conversa
  async deleteMessagesByConversation(conversationId) {
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
  }
  // Marcar conversa como deletada pelo usuário (exclusão individual)
  async deleteConversation(conversationId, userId) {
    const conversation = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!conversation[0]) {
      throw new Error("Conversa n\xE3o encontrada");
    }
    const conv = conversation[0];
    const updates = {};
    if (conv.clientId === userId) {
      updates.deletedByClient = true;
    } else if (conv.professionalId === userId) {
      updates.deletedByProfessional = true;
    } else {
      throw new Error("Usu\xE1rio n\xE3o \xE9 participante da conversa");
    }
    await db.update(conversations).set(updates).where(eq(conversations.id, conversationId));
  }
  // Service Requests
  async getServiceRequestsByClient(clientId) {
    return await db.select().from(serviceRequests).where(eq(serviceRequests.clientId, clientId)).orderBy(desc(serviceRequests.createdAt));
  }
  async getServiceRequestsByCategory(category) {
    return await db.select({
      // Service Request fields
      id: serviceRequests.id,
      clientId: serviceRequests.clientId,
      category: serviceRequests.category,
      serviceType: serviceRequests.serviceType,
      description: serviceRequests.description,
      address: serviceRequests.address,
      budget: serviceRequests.budget,
      scheduledDate: serviceRequests.scheduledDate,
      scheduledTime: serviceRequests.scheduledTime,
      urgency: serviceRequests.urgency,
      status: serviceRequests.status,
      responses: serviceRequests.responses,
      assignedProfessionalId: serviceRequests.assignedProfessionalId,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      // Client information
      clientName: users.name,
      clientEmail: users.email,
      clientPhone: users.phone,
      clientProfileImage: users.profileImage,
      clientCreatedAt: users.createdAt
    }).from(serviceRequests).innerJoin(users, eq(serviceRequests.clientId, users.id)).where(eq(serviceRequests.category, category)).orderBy(desc(serviceRequests.createdAt));
  }
  async getServiceRequest(id) {
    const [serviceRequest] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return serviceRequest || void 0;
  }
  async getServiceRequestWithClient(id) {
    const [result] = await db.select({
      // Service Request fields
      id: serviceRequests.id,
      clientId: serviceRequests.clientId,
      serviceType: serviceRequests.serviceType,
      category: serviceRequests.category,
      description: serviceRequests.description,
      address: serviceRequests.address,
      scheduledDate: serviceRequests.scheduledDate,
      scheduledTime: serviceRequests.scheduledTime,
      urgency: serviceRequests.urgency,
      budget: serviceRequests.budget,
      status: serviceRequests.status,
      assignedProfessionalId: serviceRequests.assignedProfessionalId,
      responses: serviceRequests.responses,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      // Client information
      clientName: users.name,
      clientEmail: users.email,
      clientPhone: users.phone,
      clientProfileImage: users.profileImage,
      clientCreatedAt: users.createdAt
    }).from(serviceRequests).innerJoin(users, eq(serviceRequests.clientId, users.id)).where(eq(serviceRequests.id, id));
    return result || void 0;
  }
  async createServiceRequest(insertServiceRequest) {
    const [serviceRequest] = await db.insert(serviceRequests).values(insertServiceRequest).returning();
    return serviceRequest;
  }
  async updateServiceRequest(id, updates) {
    const [serviceRequest] = await db.update(serviceRequests).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(serviceRequests.id, id)).returning();
    return serviceRequest;
  }
  async deleteServiceRequest(id) {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  }
  async assignProfessionalToRequest(requestId, professionalId) {
    await db.update(serviceRequests).set({
      assignedProfessionalId: professionalId,
      status: "assigned",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(serviceRequests.id, requestId));
  }
  // Service Offers
  async getServiceOffersByRequest(requestId) {
    return await db.select({
      // Service Offer fields
      id: serviceOffers.id,
      serviceRequestId: serviceOffers.serviceRequestId,
      professionalId: serviceOffers.professionalId,
      proposedPrice: serviceOffers.proposedPrice,
      estimatedTime: serviceOffers.estimatedTime,
      message: serviceOffers.message,
      status: serviceOffers.status,
      createdAt: serviceOffers.createdAt,
      updatedAt: serviceOffers.updatedAt,
      // Professional information
      professionalName: professionals.name,
      professionalRating: professionals.rating,
      professionalTotalReviews: professionals.totalReviews,
      professionalProfileImage: professionals.imageUrl
    }).from(serviceOffers).innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id)).where(eq(serviceOffers.serviceRequestId, requestId)).orderBy(desc(serviceOffers.createdAt));
  }
  async getProposalsByProfessional(professionalId) {
    const results = await db.select({
      // Service Offer fields
      id: serviceOffers.id,
      serviceRequestId: serviceOffers.serviceRequestId,
      professionalId: serviceOffers.professionalId,
      proposedPrice: serviceOffers.proposedPrice,
      estimatedTime: serviceOffers.estimatedTime,
      message: serviceOffers.message,
      status: serviceOffers.status,
      createdAt: serviceOffers.createdAt,
      updatedAt: serviceOffers.updatedAt,
      // Service Request fields
      requestId: serviceRequests.id,
      clientId: serviceRequests.clientId,
      serviceType: serviceRequests.serviceType,
      description: serviceRequests.description,
      address: serviceRequests.address,
      budget: serviceRequests.budget,
      scheduledDate: serviceRequests.scheduledDate,
      scheduledTime: serviceRequests.scheduledTime,
      urgency: serviceRequests.urgency,
      requestStatus: serviceRequests.status,
      assignedProfessionalId: serviceRequests.assignedProfessionalId,
      responses: serviceRequests.responses,
      requestCreatedAt: serviceRequests.createdAt,
      requestUpdatedAt: serviceRequests.updatedAt,
      // Client information
      clientName: users.name,
      clientEmail: users.email,
      clientPhone: users.phone,
      clientProfileImage: users.profileImage,
      clientCreatedAt: users.createdAt
    }).from(serviceOffers).innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).innerJoin(users, eq(serviceRequests.clientId, users.id)).where(eq(serviceOffers.professionalId, professionalId)).orderBy(desc(serviceOffers.createdAt));
    return results.map((result) => ({
      id: result.id,
      serviceRequestId: result.serviceRequestId,
      professionalId: result.professionalId,
      proposedPrice: result.proposedPrice,
      estimatedTime: result.estimatedTime,
      message: result.message,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      serviceRequest: {
        id: result.serviceRequestId,
        clientId: result.clientId,
        serviceType: result.serviceType,
        description: result.description,
        address: result.address,
        budget: result.budget,
        scheduledDate: result.scheduledDate,
        scheduledTime: result.scheduledTime,
        urgency: result.urgency,
        status: result.requestStatus,
        assignedProfessionalId: result.assignedProfessionalId,
        responses: result.responses,
        createdAt: result.requestCreatedAt,
        updatedAt: result.requestUpdatedAt,
        clientName: result.clientName,
        clientEmail: result.clientEmail,
        clientPhone: result.clientPhone,
        clientProfileImage: result.clientProfileImage,
        clientCreatedAt: result.clientCreatedAt
      }
    }));
  }
  async createServiceOffer(serviceOffer) {
    const [offer] = await db.insert(serviceOffers).values(serviceOffer).returning();
    return offer;
  }
  async updateServiceOffer(id, updates) {
    const [offer] = await db.update(serviceOffers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(serviceOffers.id, id)).returning();
    return offer;
  }
  async deleteServiceOffer(id) {
    await db.delete(serviceOffers).where(eq(serviceOffers.id, id));
  }
  // ==================== SERVICE REQUESTS FOR CLIENT ====================
  async getServiceRequestsForClient(userId) {
    console.log("\u{1F50D} Buscando pedidos para cliente ID:", userId);
    const results = await db.select({
      id: serviceRequests.id,
      title: serviceRequests.serviceType,
      description: serviceRequests.description,
      category: serviceRequests.serviceType,
      budget: serviceRequests.budget,
      location: serviceRequests.address,
      urgency: serviceRequests.urgency,
      status: serviceRequests.status,
      createdAt: serviceRequests.createdAt,
      responses: serviceRequests.responses
    }).from(serviceRequests).where(eq(serviceRequests.clientId, userId)).orderBy(desc(serviceRequests.createdAt));
    console.log("\u2705 Pedidos encontrados:", results.length);
    return results.map((result) => ({
      id: result.id,
      title: result.title,
      description: result.description,
      category: result.category,
      budget: result.budget,
      location: result.location,
      urgency: result.urgency,
      status: result.status,
      createdAt: result.createdAt,
      responseCount: result.responses || 0
    }));
  }
  // ==================== SERVICE OFFERS FOR CLIENT ====================
  async getServiceOffersForClient(userId) {
    console.log("\u{1F50D} Buscando propostas para cliente ID:", userId);
    const results = await db.select({
      id: serviceOffers.id,
      serviceRequestId: serviceOffers.serviceRequestId,
      professionalId: serviceOffers.professionalId,
      price: serviceOffers.proposedPrice,
      estimatedTime: serviceOffers.estimatedTime,
      message: serviceOffers.message,
      status: serviceOffers.status,
      createdAt: serviceOffers.createdAt,
      serviceTitle: serviceRequests.serviceType,
      professionalName: professionals.name,
      professionalRating: professionals.rating,
      professionalTotalReviews: professionals.totalReviews,
      professionalProfileImage: professionals.imageUrl
    }).from(serviceOffers).innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id)).where(eq(serviceRequests.clientId, userId)).orderBy(desc(serviceOffers.createdAt));
    console.log("\u2705 Propostas encontradas:", results.length);
    return results.map((result) => ({
      id: result.id,
      serviceRequestId: result.serviceRequestId,
      professionalId: result.professionalId,
      professionalName: result.professionalName,
      professionalRating: result.professionalRating || 5,
      professionalTotalReviews: result.professionalTotalReviews || 0,
      professionalProfileImage: result.professionalProfileImage ? this.getFullImageUrl(result.professionalProfileImage) : null,
      price: result.price,
      estimatedTime: result.estimatedTime,
      message: result.message,
      status: result.status,
      createdAt: result.createdAt,
      serviceTitle: result.serviceTitle
    }));
  }
  async acceptServiceOffer(offerId, userId) {
    try {
      console.log("\u2705 Aceitando proposta:", offerId, "pelo cliente:", userId);
      const [offer] = await db.select({
        id: serviceOffers.id,
        serviceRequestId: serviceOffers.serviceRequestId,
        professionalId: serviceOffers.professionalId,
        status: serviceOffers.status,
        clientId: serviceRequests.clientId
      }).from(serviceOffers).innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).where(eq(serviceOffers.id, offerId));
      if (!offer) {
        return { success: false, error: "Proposta n\xE3o encontrada" };
      }
      if (offer.clientId !== userId) {
        return { success: false, error: "Proposta n\xE3o pertence a este cliente" };
      }
      if (offer.status !== "pending") {
        return { success: false, error: "Proposta j\xE1 foi processada" };
      }
      await db.update(serviceOffers).set({ status: "accepted", updatedAt: /* @__PURE__ */ new Date() }).where(eq(serviceOffers.id, offerId));
      await db.update(serviceRequests).set({
        assignedProfessionalId: offer.professionalId,
        status: "in_progress",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceRequests.id, offer.serviceRequestId));
      await db.update(serviceOffers).set({ status: "rejected", updatedAt: /* @__PURE__ */ new Date() }).where(and(
        eq(serviceOffers.serviceRequestId, offer.serviceRequestId),
        ne(serviceOffers.id, offerId)
      ));
      return { success: true };
    } catch (error) {
      console.error("\u274C Erro ao aceitar proposta:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
  async rejectServiceOffer(offerId, userId) {
    try {
      console.log("\u274C Rejeitando proposta:", offerId, "pelo cliente:", userId);
      const [offer] = await db.select({
        id: serviceOffers.id,
        status: serviceOffers.status,
        serviceRequestId: serviceOffers.serviceRequestId,
        professionalId: serviceOffers.professionalId,
        clientId: serviceRequests.clientId
      }).from(serviceOffers).innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).where(eq(serviceOffers.id, offerId));
      if (!offer) {
        return { success: false, error: "Proposta n\xE3o encontrada" };
      }
      if (offer.clientId !== userId) {
        return { success: false, error: "Proposta n\xE3o pertence a este cliente" };
      }
      await this.deleteServiceOffer(offerId);
      const request = await this.getServiceRequest(offer.serviceRequestId);
      if (request) {
        const current = Number(request.responses) || 0;
        const next = current > 0 ? current - 1 : 0;
        await this.updateServiceRequest(offer.serviceRequestId, { responses: next });
      }
      const professional = await this.getProfessional(offer.professionalId);
      if (professional) {
        const reqDetailed = await this.getServiceRequest(offer.serviceRequestId);
        const serviceLabel = reqDetailed?.serviceType || "um servi\xE7o";
        await this.createNotification({
          userId: professional.userId,
          message: `Sua proposta para ${serviceLabel} foi rejeitada e removida pelo cliente.`,
          read: false
        });
      }
      return { success: true };
    } catch (error) {
      console.error("\u274C Erro ao rejeitar e excluir proposta:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
console.log("\u{1F527} Configurando Google OAuth Strategy...");
console.log("\u{1F527} GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Presente" : "Ausente");
console.log("\u{1F527} GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "Ausente");
console.log("\u{1F527} NODE_ENV:", process.env.NODE_ENV);
console.log("\u{1F527} Callback URL:", process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback");
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log("\u26A0\uFE0F Google OAuth desabilitado - configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no Render");
} else {
  console.log("\u2705 Google OAuth habilitado - vari\xE1veis configuradas");
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("\u{1F510} Google OAuth profile iniciado");
      console.log("\u{1F4E7} Email:", profile.emails?.[0]?.value);
      console.log("\u{1F464} Nome:", profile.displayName);
      console.log("\u{1F194} ID:", profile.id);
      let additionalProfileData = {
        phone: null,
        address: null
      };
      try {
        console.log("\u{1F50D} Buscando dados adicionais do perfil via Google People API...");
        const peopleApiResponse = await fetch(
          `https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,addresses&access_token=${accessToken}`
        );
        if (peopleApiResponse.ok) {
          const peopleData = await peopleApiResponse.json();
          console.log("\u{1F4F1} Dados do People API:", peopleData);
          if (peopleData.phoneNumbers && peopleData.phoneNumbers.length > 0) {
            additionalProfileData.phone = peopleData.phoneNumbers[0].value;
            console.log("\u{1F4F1} Telefone encontrado:", additionalProfileData.phone);
          }
          if (peopleData.addresses && peopleData.addresses.length > 0) {
            const address = peopleData.addresses[0];
            const addressParts = [];
            if (address.streetAddress) addressParts.push(address.streetAddress);
            if (address.locality) addressParts.push(address.locality);
            if (address.administrativeArea) addressParts.push(address.administrativeArea);
            if (address.postalCode) addressParts.push(address.postalCode);
            if (address.country) addressParts.push(address.country);
            additionalProfileData.address = addressParts.join(", ");
            console.log("\u{1F3E0} Endere\xE7o encontrado:", additionalProfileData.address);
          }
        } else {
          console.log("\u26A0\uFE0F N\xE3o foi poss\xEDvel obter dados adicionais do People API:", peopleApiResponse.status);
        }
      } catch (apiError) {
        console.log("\u26A0\uFE0F Erro ao buscar dados do People API:", apiError);
      }
      let user = await storage.getUserByGoogleId(profile.id);
      if (user) {
        const updateData = { lastLoginAt: /* @__PURE__ */ new Date() };
        if (additionalProfileData.phone && !user.phone) {
          updateData.phone = additionalProfileData.phone;
          updateData.phoneVerified = true;
        }
        if (additionalProfileData.address && !user.address) {
          updateData.address = additionalProfileData.address;
        }
        if (profile.photos?.[0]?.value && !user.profileImage) {
          updateData.profileImage = profile.photos[0].value;
        }
        await storage.updateUser(user.id, updateData);
        return done(null, user);
      }
      if (profile.emails && profile.emails[0]) {
        user = await storage.getUserByEmail(profile.emails[0].value);
        if (user) {
          const updateData = {
            googleId: profile.id,
            lastLoginAt: /* @__PURE__ */ new Date(),
            isVerified: true
          };
          if (additionalProfileData.phone && !user.phone) {
            updateData.phone = additionalProfileData.phone;
            updateData.phoneVerified = true;
          }
          if (additionalProfileData.address && !user.address) {
            updateData.address = additionalProfileData.address;
          }
          if (profile.photos?.[0]?.value && !user.profileImage) {
            updateData.profileImage = profile.photos[0].value;
          }
          await storage.updateUser(user.id, updateData);
          return done(null, user);
        }
      }
      const newUser = await storage.createUser({
        username: profile.emails?.[0]?.value || `google_${profile.id}`,
        password: "",
        // OAuth users don't need password
        name: profile.displayName || "Usu\xE1rio Google",
        email: profile.emails?.[0]?.value || "",
        phone: additionalProfileData.phone,
        phoneVerified: additionalProfileData.phone ? true : false,
        googleId: profile.id,
        appleId: null,
        address: additionalProfileData.address,
        profileImage: profile.photos?.[0]?.value || null,
        userType: "client",
        isVerified: true,
        isBlocked: false,
        lastLoginAt: /* @__PURE__ */ new Date(),
        loginAttempts: 0,
        resetToken: null,
        resetTokenExpiry: null
      });
      console.log("\u2705 Novo usu\xE1rio criado com perfil completo:", {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        profileImage: newUser.profileImage ? "Presente" : "Ausente"
      });
      return done(null, newUser);
    } catch (error) {
      console.error("\u274C Erro no Google OAuth:", error);
      return done(error, void 0);
    }
  }));
}
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
var generateToken = (user) => {
  console.log("\u{1F527} Gerando token para usu\xE1rio:", {
    id: user.id,
    email: user.email,
    userType: user.userType
  });
  console.log("\u{1F527} JWT_SECRET presente:", !!process.env.JWT_SECRET);
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.userType
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  console.log("\u{1F527} Token gerado com sucesso, tamanho:", token.length);
  return token;
};
var verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
var hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};
var verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token de acesso necess\xE1rio" });
  }
  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId || decoded.id;
    const user = await storage.getUser(userId);
    if (!user || user.isBlocked) {
      return res.status(403).json({ message: "Usu\xE1rio n\xE3o encontrado ou bloqueado" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json({ message: "Token inv\xE1lido" });
  }
};
var rateLimitByIP = async (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";
  try {
    const recentAttempts = await storage.getRecentLoginAttempts(ip, 15);
    if (recentAttempts.length >= 5) {
      const failedAttempts = recentAttempts.filter((attempt) => !attempt.successful);
      if (failedAttempts.length >= 3) {
        await storage.createLoginAttempt({
          email: req.body.email || null,
          ipAddress: ip,
          userAgent,
          successful: false,
          blocked: true
        });
        return res.status(429).json({
          message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
          blocked: true
        });
      }
    }
    next();
  } catch (error) {
    console.error("Rate limit error:", error);
    next();
  }
};

// server/routes.ts
import pgSession from "connect-pg-simple";
import multer from "multer";
import path2 from "path";
import fs from "fs";
var multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path2.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path2.extname(file.originalname));
  }
});
var upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Apenas imagens s\xE3o permitidas!"));
    }
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Increased limit for development
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development" || true;
  }
});
async function registerRoutes(app2) {
  app2.get("/api/test", (req, res) => {
    res.json({
      message: "Server is running!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV,
      googleClientId: process.env.GOOGLE_CLIENT_ID ? "Presente" : "Ausente",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "Ausente",
      callbackUrl: process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback"
    });
  });
  app2.get("/api/auth/test", (req, res) => {
    res.json({
      message: "Google OAuth routes are registered",
      googleAuthUrl: "/api/auth/google",
      googleCallbackUrl: "/api/auth/google/callback",
      googleClientId: process.env.GOOGLE_CLIENT_ID ? "Presente" : "Ausente",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "Ausente",
      nodeEnv: process.env.NODE_ENV || "development",
      callbackUrl: process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback"
    });
  });
  const uploadsPath = path2.resolve(process.cwd(), "uploads");
  console.log("\u{1F4C1} Configurando middleware para arquivos est\xE1ticos em:", uploadsPath);
  console.log("\u{1F4C1} Diret\xF3rio atual (process.cwd()):", process.cwd());
  if (!fs.existsSync(uploadsPath)) {
    console.log("\u{1F4C1} Criando diret\xF3rio uploads...");
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  console.log("\u{1F4C1} Diret\xF3rio uploads existe:", fs.existsSync(uploadsPath));
  try {
    const uploadsContent = fs.readdirSync(uploadsPath);
    console.log("\u{1F4C1} Conte\xFAdo do diret\xF3rio uploads:", uploadsContent);
  } catch (error) {
    console.log("\u{1F4C1} Diret\xF3rio uploads est\xE1 vazio ou n\xE3o pode ser lido:", error);
  }
  app2.use("/uploads", express.static(uploadsPath, {
    setHeaders: (res, path3) => {
      console.log("\u{1F4C2} Servindo arquivo:", path3);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      res.setHeader("Cache-Control", "public, max-age=31536000");
    }
  }));
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Server is healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/test-auth", authenticateToken, (req, res) => {
    const user = req.user;
    res.status(200).json({
      message: "Authentication successful",
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
        email: user.email
      }
    });
  });
  app2.set("trust proxy", 1);
  app2.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        // Permitir http para desenvolvimento
        connectSrc: ["'self'", "ws:", "wss:", "https:", "http:", "https://accounts.google.com"],
        // Permitir http para desenvolvimento
        frameSrc: ["'self'", "https://accounts.google.com"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
    // Desabilitar para permitir cross-origin
  }));
  const PgSession = pgSession(session);
  app2.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
      tableName: "sessions",
      // tabela para armazenar as sessões
      createTableIfMissing: true
      // cria a tabela automaticamente se não existir
    }),
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      sameSite: "lax"
    },
    name: "lifebee.sid"
    // nome personalizado do cookie
  }));
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  app2.post("/api/auth/login", authLimiter, rateLimitByIP, async (req, res) => {
    try {
      const { email, password, userType } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha s\xE3o obrigat\xF3rios" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || user.isBlocked) {
        await storage.createLoginAttempt({
          email,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          successful: false,
          blocked: false
        });
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      if (!user.password || !await verifyPassword(password, user.password)) {
        await storage.createLoginAttempt({
          email,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("User-Agent") || "unknown",
          successful: false,
          blocked: false
        });
        const attempts = (user.loginAttempts || 0) + 1;
        await storage.updateUserLoginAttempts(user.id, attempts);
        if (attempts >= 5) {
          await storage.blockUser(user.id);
          return res.status(403).json({ message: "Conta bloqueada por muitas tentativas de login" });
        }
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      await storage.updateUser(user.id, {
        lastLoginAt: /* @__PURE__ */ new Date(),
        loginAttempts: 0
      });
      await storage.createLoginAttempt({
        email,
        ipAddress: req.ip || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
        successful: true,
        blocked: false
      });
      const token = generateToken(user);
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const { username, email, password, name, userType, phone } = req.body;
      if (!username || !email || !password || !name) {
        return res.status(400).json({ message: "Todos os campos obrigat\xF3rios devem ser preenchidos" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email j\xE1 cadastrado" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: "Nome de usu\xE1rio j\xE1 existe" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        name,
        userType: userType || "client",
        phone: phone || null,
        phoneVerified: false,
        googleId: null,
        appleId: null,
        address: null,
        profileImage: null,
        isVerified: false,
        isBlocked: false,
        lastLoginAt: null,
        loginAttempts: 0,
        resetToken: null,
        resetTokenExpiry: null
      });
      const updatedUser = await storage.updateUser(user.id, {
        phoneVerified: true,
        isVerified: true
      });
      if ((userType || "client") === "provider") {
        await storage.createProfessional({
          userId: updatedUser.id,
          name,
          specialization: "A definir",
          // Pode ser preenchido depois
          category: "fisioterapeuta",
          // Pode ser preenchido depois
          subCategory: "companhia_apoio_emocional",
          // Pode ser preenchido depois
          description: "Descri\xE7\xE3o a ser preenchida",
          experience: "",
          certifications: "",
          availableHours: "",
          hourlyRate: "0",
          rating: "5.0",
          totalReviews: 0,
          location: "",
          distance: "0",
          available: true,
          imageUrl: "",
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      await storage.createNotification({
        userId: user.id,
        message: `Bem-vindo \xE0 LifeBee, ${user.name}! Sua conta foi criada com sucesso.`,
        read: false
      });
      const token = generateToken(updatedUser);
      res.status(201).json({
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          userType: updatedUser.userType,
          isVerified: true,
          phoneVerified: true,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      console.log("\u{1F50D} GET /api/messages - Usu\xE1rio autenticado:", user.id, user.userType);
      console.log("\u{1F50D} Headers da requisi\xE7\xE3o:", req.headers.authorization ? "Token presente" : "Token ausente");
      const userConversations = await storage.getConversationsByUser(user.id);
      console.log("\u{1F4CB} Conversas retornadas para usu\xE1rio", user.id, ":", userConversations.length);
      console.log("\u{1F4CB} Detalhes das conversas:", userConversations.map((c) => ({
        id: c.id,
        clientId: c.clientId,
        professionalId: c.professionalId,
        deletedByClient: c.deletedByClient,
        deletedByProfessional: c.deletedByProfessional
      })));
      if (userConversations.length === 0) {
        console.log("\u26A0\uFE0F Nenhuma conversa encontrada para o usu\xE1rio", user.id);
      }
      if (userConversations && userConversations.length > 0) {
        const conversationsWithDetails = await Promise.all(
          userConversations.map(async (conv) => {
            let otherUser, otherName, otherAvatar;
            let specialization = "";
            let rating = 5;
            let location = "";
            if (user.userType === "provider") {
              otherUser = await storage.getUser(conv.clientId);
              otherName = otherUser?.name || "Cliente";
              otherAvatar = otherUser?.profileImage || "";
            } else {
              otherUser = await storage.getProfessional(conv.professionalId);
              otherName = otherUser?.name || "Profissional";
              otherAvatar = otherUser?.imageUrl || "";
              specialization = otherUser?.specialization || "";
              rating = Number(otherUser?.rating) || 5;
              location = otherUser?.location || "";
            }
            const lastMessage = await storage.getLastMessageByConversation(conv.id);
            return {
              id: conv.id,
              clientId: conv.clientId,
              clientName: user.userType === "provider" ? otherName : void 0,
              clientAvatar: user.userType === "provider" ? otherAvatar : void 0,
              professionalId: conv.professionalId,
              professionalName: user.userType === "client" ? otherName : void 0,
              professionalAvatar: user.userType === "client" ? otherAvatar : void 0,
              specialization,
              lastMessage: lastMessage?.content || "Nenhuma mensagem",
              lastMessageTime: lastMessage?.timestamp || conv.createdAt,
              unreadCount: await storage.getUnreadMessageCount(conv.id, user.id),
              isOnline: Math.random() > 0.5,
              // Simular status online
              rating,
              location,
              messages: await storage.getMessagesByConversation(conv.id)
            };
          })
        );
        res.json(conversationsWithDetails);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { recipientId, content, type, conversationId } = req.body;
      console.log("\u{1F4E8} POST /api/messages - Usu\xE1rio:", user.id, user.userType);
      console.log("\u{1F4E8} Dados da mensagem:", { recipientId, content, type, conversationId });
      if (!recipientId || !content || !conversationId) {
        return res.status(400).json({ message: "Destinat\xE1rio, conversa e conte\xFAdo s\xE3o obrigat\xF3rios" });
      }
      const conversations2 = await storage.getConversationsByUser(user.id);
      console.log("\u{1F4E8} Conversas do usu\xE1rio:", conversations2.map((c) => ({ id: c.id, deletedByClient: c.deletedByClient, deletedByProfessional: c.deletedByProfessional })));
      const isParticipant = conversations2.some((conv) => conv.id === conversationId);
      console.log("\u{1F4E8} Usu\xE1rio \xE9 participante?", isParticipant);
      if (!isParticipant) {
        console.log("\u{1F4E8} Usu\xE1rio n\xE3o \xE9 participante, verificando se conversa foi deletada...");
        const isDeletedByUser = await storage.isConversationDeletedByUser(conversationId, user.id);
        console.log("\u{1F4E8} Conversa foi deletada pelo usu\xE1rio?", isDeletedByUser);
        if (isDeletedByUser) {
          await storage.restoreConversation(conversationId, user.id);
          console.log(`\u2705 Conversa ${conversationId} restaurada automaticamente para usu\xE1rio ${user.id}`);
        } else {
          console.log("\u274C Acesso negado \xE0 conversa");
          return res.status(403).json({ message: "Acesso negado \xE0 conversa" });
        }
      }
      const isDeletedByRecipient = await storage.isConversationDeletedByUser(conversationId, recipientId);
      if (isDeletedByRecipient) {
        await storage.restoreConversation(conversationId, recipientId);
        console.log(`\u2705 Conversa ${conversationId} restaurada automaticamente para destinat\xE1rio ${recipientId}`);
      }
      const message = await storage.createMessage({
        conversationId,
        senderId: user.id,
        recipientId,
        content,
        type: type || "text",
        isRead: false
      });
      console.log("\u2705 Mensagem criada com sucesso:", message.id);
      res.status(201).json(message);
    } catch (error) {
      console.error("\u274C Send message error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/messages/start-conversation", authenticateToken, async (req, res) => {
    console.log("\u{1F680} POST /api/messages/start-conversation chamada");
    console.log("\u{1F4E8} Body recebido:", JSON.stringify(req.body));
    console.log("\u{1F464} Usu\xE1rio autenticado:", req.user);
    try {
      const user = req.user;
      const { professionalId, message } = req.body;
      console.log("professionalId recebido:", professionalId);
      const professional = await storage.getProfessional(professionalId);
      console.log("Resultado da busca do profissional:", professional);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const existingConversation = await storage.getConversation(user.id, professionalId);
      if (existingConversation) {
        const isDeletedByUser = await storage.isConversationDeletedByUser(existingConversation.id, user.id);
        if (isDeletedByUser) {
          await storage.restoreConversation(existingConversation.id, user.id);
          console.log(`\u2705 Conversa ${existingConversation.id} restaurada automaticamente para usu\xE1rio ${user.id} (start-conversation)`);
        }
        const isDeletedByProfessional = await storage.isConversationDeletedByUser(existingConversation.id, professionalId);
        if (isDeletedByProfessional) {
          await storage.restoreConversation(existingConversation.id, professionalId);
          console.log(`\u2705 Conversa ${existingConversation.id} restaurada automaticamente para profissional ${professionalId} (start-conversation)`);
        }
        const newMessage = await storage.createMessage({
          conversationId: existingConversation.id,
          senderId: user.id,
          recipientId: professionalId,
          content: message || "Ol\xE1! Gostaria de conversar sobre seus servi\xE7os.",
          type: "text",
          isRead: false
        });
        return res.status(200).json({
          message: "Mensagem enviada com sucesso",
          conversationId: existingConversation.id,
          messageData: newMessage
        });
      } else {
        const conversation = await storage.createConversation({
          clientId: user.id,
          professionalId,
          deletedByClient: false,
          deletedByProfessional: false
        });
        const initialMessage = await storage.createMessage({
          conversationId: conversation.id,
          senderId: user.id,
          recipientId: professionalId,
          content: message || "Ol\xE1! Gostaria de conversar sobre seus servi\xE7os.",
          type: "text",
          isRead: false
        });
        return res.status(201).json({
          message: "Conversa iniciada com sucesso",
          conversationId: conversation.id,
          messageData: initialMessage
        });
      }
    } catch (error) {
      console.error("Start conversation error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/conversations", authenticateToken, async (req, res) => {
    console.log("\u{1F680} POST /api/conversations chamada");
    console.log("\u{1F4E8} Body recebido:", JSON.stringify(req.body));
    console.log("\u{1F464} Usu\xE1rio autenticado:", req.user);
    try {
      const user = req.user;
      const { clientId, serviceRequestId, initialMessage } = req.body;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Apenas profissionais podem iniciar conversas" });
      }
      console.log("clientId recebido:", clientId);
      console.log("serviceRequestId recebido:", serviceRequestId);
      const client = await storage.getUser(clientId);
      console.log("Resultado da busca do cliente:", client);
      if (!client) {
        return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
      }
      const existingConversation = await storage.getConversation(clientId, user.id);
      if (existingConversation) {
        const isDeletedByClient = await storage.isConversationDeletedByUser(existingConversation.id, clientId);
        if (isDeletedByClient) {
          await storage.restoreConversation(existingConversation.id, clientId);
          console.log(`\u2705 Conversa ${existingConversation.id} restaurada automaticamente para cliente ${clientId}`);
        }
        const isDeletedByProfessional = await storage.isConversationDeletedByUser(existingConversation.id, user.id);
        if (isDeletedByProfessional) {
          await storage.restoreConversation(existingConversation.id, user.id);
          console.log(`\u2705 Conversa ${existingConversation.id} restaurada automaticamente para profissional ${user.id}`);
        }
        const newMessage = await storage.createMessage({
          conversationId: existingConversation.id,
          senderId: user.id,
          recipientId: clientId,
          content: initialMessage || "Ol\xE1! Gostaria de conversar sobre o servi\xE7o.",
          type: "text",
          isRead: false
        });
        return res.status(200).json({
          message: "Mensagem enviada com sucesso",
          id: existingConversation.id,
          conversationId: existingConversation.id,
          messageData: newMessage
        });
      } else {
        const conversation = await storage.createConversation({
          clientId,
          professionalId: user.id,
          deletedByClient: false,
          deletedByProfessional: false
        });
        const initialMsg = await storage.createMessage({
          conversationId: conversation.id,
          senderId: user.id,
          recipientId: clientId,
          content: initialMessage || "Ol\xE1! Gostaria de conversar sobre o servi\xE7o.",
          type: "text",
          isRead: false
        });
        return res.status(201).json({
          message: "Conversa iniciada com sucesso",
          id: conversation.id,
          conversationId: conversation.id,
          messageData: initialMsg
        });
      }
    } catch (error) {
      console.error("Professional start conversation error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { name, email, phone, address, bio } = req.body;
      const updatedUser = await storage.updateUser(user.id, {
        name,
        email,
        phone
        // address and bio would need to be added to schema
      });
      res.json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          userType: updatedUser.userType,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/password", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Senha atual e nova senha s\xE3o obrigat\xF3rias" });
      }
      const isValidPassword = await verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/user/account", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      res.json({ message: "Conta exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const appointments2 = await storage.getAppointmentsByUser(user.id);
      res.json(appointments2);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/user", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        phoneVerified: user.phoneVerified,
        phone: user.phone,
        profileImage: user.profileImage
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      req.session.destroy((err2) => {
        if (err2) {
          return res.status(500).json({ message: "Erro ao destruir sess\xE3o" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout realizado com sucesso" });
      });
    });
  });
  app2.get("/api/professionals", async (req, res) => {
    try {
      const { category, search } = req.query;
      let professionals2;
      if (search && typeof search === "string") {
        professionals2 = await storage.searchProfessionals(search);
      } else if (category && typeof category === "string") {
        professionals2 = await storage.getProfessionalsByCategory(category);
      } else {
        professionals2 = await storage.getAllProfessionals();
      }
      res.json(professionals2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const professional = await storage.getProfessional(id);
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const appointments2 = await storage.getAppointmentsByUser(user.id);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/appointments/provider", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      const appointments2 = await storage.getAppointmentsByProfessional(user.id);
      res.json(appointments2);
    } catch (error) {
      console.error("Get provider appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const notifications2 = await storage.getNotificationsByUser(user.id);
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/notifications/count", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || amount < 50) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      res.json({
        clientSecret: "demo_payment_" + Date.now(),
        success: true,
        message: "Payment processed successfully"
      });
    } catch (error) {
      console.error("Payment error:", error);
      res.status(500).json({
        message: "Error processing payment: " + (error instanceof Error ? error.message : "Erro desconhecido")
      });
    }
  });
  app2.get("/api/provider/orders", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      const orders = await storage.getAppointmentsByProfessional(user.id) || [];
      res.json(orders);
    } catch (error) {
      console.error("Get provider orders error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/provider/orders/:id/accept", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const orderId = parseInt(req.params.id);
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log(`Professional ${user.id} accepted order ${orderId}`);
      res.json({
        message: "Pedido aceito com sucesso",
        orderId,
        status: "accepted"
      });
    } catch (error) {
      console.error("Accept order error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/provider/orders/:id/reject", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const orderId = parseInt(req.params.id);
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log(`Professional ${user.id} rejected order ${orderId}`);
      res.json({
        message: "Pedido rejeitado com sucesso",
        orderId,
        status: "rejected"
      });
    } catch (error) {
      console.error("Reject order error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/provider/orders/:id/complete", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const orderId = parseInt(req.params.id);
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log(`Professional ${user.id} completed order ${orderId}`);
      res.json({
        message: "Pedido conclu\xEDdo com sucesso",
        orderId,
        status: "completed"
      });
    } catch (error) {
      console.error("Complete order error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/provider/profile", authenticateToken, async (req, res) => {
    try {
      console.log("Provider profile request received");
      const user = req.user;
      console.log("User data:", { id: user.id, userType: user.userType });
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("Fetching professional data for user ID:", user.id);
      const professional = await storage.getProfessionalByUserId(user.id);
      console.log("Professional data:", professional);
      console.log("Fetching user data for user ID:", user.id);
      const userData = await storage.getUser(user.id);
      console.log("User data:", userData);
      if (!userData) {
        return res.status(404).json({ message: "Dados do usu\xE1rio n\xE3o encontrados." });
      }
      if (!professional) {
        console.log("No professional data found, creating basic profile");
        const basicProfile = {
          id: 0,
          userId: user.id,
          name: userData.name || "",
          specialization: "",
          category: "",
          subCategory: "",
          description: "",
          experience: "",
          certifications: "",
          availableHours: "",
          hourlyRate: "",
          rating: "5.0",
          totalReviews: 0,
          location: "",
          distance: "",
          available: true,
          imageUrl: userData.profileImage || "",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          email: userData.email,
          phone: userData.phone
        };
        console.log("Sending basic profile data:", basicProfile);
        return res.json(basicProfile);
      }
      const profileData = {
        ...professional,
        email: userData.email,
        phone: userData.phone
      };
      console.log("Sending profile data:", profileData);
      res.json(profileData);
    } catch (error) {
      console.error("Get provider profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor", error: error instanceof Error ? error.message : "Erro desconhecido" });
    }
  });
  app2.put("/api/provider/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const {
        name,
        specialization,
        category,
        subCategory,
        description,
        experience,
        certifications,
        hourlyRate,
        location,
        available
      } = req.body;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Dados do profissional n\xE3o encontrados." });
      }
      const updatedProfessional = await storage.updateProfessional(professional.id, {
        name,
        specialization,
        category,
        subCategory,
        description,
        experience,
        certifications,
        hourlyRate,
        location,
        available
      });
      if (name && name !== user.name) {
        await storage.updateUser(user.id, { name });
      }
      res.json({
        message: "Perfil atualizado com sucesso",
        professional: updatedProfessional
      });
    } catch (error) {
      console.error("Update provider profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/provider/upload-image", authenticateToken, upload.single("profileImage"), async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada." });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      await storage.updateUser(user.id, { profileImage: imageUrl });
      const professional = await storage.getProfessionalByUserId(user.id);
      if (professional) {
        await storage.updateProfessional(professional.id, { imageUrl });
      }
      res.json({
        message: "Imagem de perfil atualizada com sucesso",
        imageUrl
      });
    } catch (error) {
      console.error("Upload profile image error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/user/upload-image", authenticateToken, upload.single("profileImage"), async (req, res) => {
    try {
      const user = req.user;
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada." });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      await storage.updateUser(user.id, { profileImage: imageUrl });
      if (user.userType === "provider") {
        const professional = await storage.getProfessionalByUserId(user.id);
        if (professional) {
          await storage.updateProfessional(professional.id, { imageUrl });
        }
      }
      res.json({
        message: "Imagem de perfil atualizada com sucesso",
        imageUrl
      });
    } catch (error) {
      console.error("Upload profile image error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { name, email, phone, address } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: "Nome e email s\xE3o obrigat\xF3rios." });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: "Este email j\xE1 est\xE1 em uso por outro usu\xE1rio." });
      }
      const updatedUser = await storage.updateUser(user.id, {
        name,
        email,
        phone: phone || null,
        address: address || null
      });
      res.json({
        message: "Perfil atualizado com sucesso",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          profileImage: updatedUser.profileImage,
          userType: updatedUser.userType
        }
      });
    } catch (error) {
      console.error("Update user profile error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/provider/settings", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      const settings = {
        profile: {
          name: "Ana Carolina Silva",
          email: "ana.carolina@email.com",
          phone: "(11) 99999-9999",
          specialization: "Fisioterapeuta"
        },
        availability: {
          isAvailable: true,
          workStartTime: "08:00",
          workEndTime: "18:00"
        },
        notifications: {
          newOrders: true,
          messages: true,
          payments: true,
          reminders: true,
          marketing: false
        },
        payments: {
          bankAccount: "Banco do Brasil \u2022\u2022\u2022\u2022 1234",
          pixKey: "ana.carolina@email.com"
        }
      };
      res.json(settings);
    } catch (error) {
      console.error("Get provider settings error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/provider/settings", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { profile, availability, notifications: notifications2, payments } = req.body;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log(`Updating settings for professional ${user.id}:`, {
        profile,
        availability,
        notifications: notifications2,
        payments
      });
      res.json({
        message: "Configura\xE7\xF5es atualizadas com sucesso",
        settings: { profile, availability, notifications: notifications2, payments }
      });
    } catch (error) {
      console.error("Update provider settings error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/provider/availability", authenticateToken, async (req, res) => {
    console.log("\u{1F527} Rota /api/provider/availability foi chamada");
    try {
      const user = req.user;
      const { available } = req.body;
      console.log("\u{1F464} Usu\xE1rio:", user);
      console.log("\u{1F4CA} Dados recebidos:", { available });
      if (user.userType !== "provider") {
        console.log("\u274C Usu\xE1rio n\xE3o \xE9 profissional:", user.userType);
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      if (typeof available !== "boolean") {
        console.log("\u274C Tipo inv\xE1lido para available:", typeof available);
        return res.status(400).json({ message: "O campo 'available' deve ser um valor booleano" });
      }
      console.log("\u2705 Atualizando disponibilidade do profissional ID:", user.id, "para:", available);
      await storage.updateProfessionalAvailability(user.id, available);
      console.log(`\u2705 Professional ${user.id} availability updated to: ${available}`);
      res.json({
        message: "Disponibilidade atualizada com sucesso",
        available
      });
    } catch (error) {
      console.error("\u{1F4A5} Update provider availability error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/my-requests", authenticateToken, async (req, res) => {
    console.log("\u{1F50D} Rota /api/service-requests/my-requests foi chamada");
    try {
      const user = req.user;
      console.log("\u{1F464} Usu\xE1rio:", user);
      if (user.userType !== "client") {
        console.log("\u274C Usu\xE1rio n\xE3o \xE9 cliente:", user.userType);
        return res.status(403).json({ message: "Apenas clientes podem acessar suas solicita\xE7\xF5es" });
      }
      console.log("\u2705 Buscando solicita\xE7\xF5es para cliente ID:", user.id);
      const serviceRequests2 = await storage.getServiceRequestsByClient(user.id);
      console.log("\u{1F4CB} Solicita\xE7\xF5es encontradas:", serviceRequests2.length);
      res.json(serviceRequests2);
    } catch (error) {
      console.error("\u{1F4A5} Get my service requests error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-request", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { serviceType, category, description, address, scheduledDate, scheduledTime, urgency, budget } = req.body;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Apenas clientes podem solicitar servi\xE7os" });
      }
      if (!serviceType || !category || !description || !address || !scheduledDate || !scheduledTime) {
        return res.status(400).json({ message: "Todos os campos obrigat\xF3rios devem ser preenchidos" });
      }
      const validCategories = ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Categoria inv\xE1lida" });
      }
      const serviceRequest = await storage.createServiceRequest({
        clientId: user.id,
        serviceType,
        category,
        description,
        address,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        urgency: urgency || "medium",
        budget: budget ? parseFloat(budget).toString() : null,
        status: "open",
        assignedProfessionalId: null,
        responses: 0
      });
      const professionals2 = await storage.getProfessionalsByCategory(category);
      for (const professional of professionals2) {
        await storage.createNotification({
          userId: professional.userId,
          message: `Nova solicita\xE7\xE3o de ${serviceType} dispon\xEDvel na sua \xE1rea`,
          read: false
        });
      }
      res.status(201).json({
        message: "Solicita\xE7\xE3o criada com sucesso",
        serviceRequest
      });
    } catch (error) {
      console.error("Create service request error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/client", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Apenas clientes podem acessar suas solicita\xE7\xF5es" });
      }
      const serviceRequests2 = await storage.getServiceRequestsByClient(user.id);
      res.json(serviceRequests2);
    } catch (error) {
      console.error("Get client service requests error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/test-auth", authenticateToken, async (req, res) => {
    console.log("\u{1F50D} Rota de teste de autentica\xE7\xE3o foi chamada");
    const user = req.user;
    console.log("\u{1F464} Usu\xE1rio autenticado:", user);
    res.json({
      message: "Autentica\xE7\xE3o funcionando",
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType
      }
    });
  });
  app2.get("/api/service-requests/category/:category", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { category } = req.params;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Apenas profissionais podem acessar solicita\xE7\xF5es" });
      }
      const serviceRequests2 = await storage.getServiceRequestsByCategory(category);
      res.json(serviceRequests2);
    } catch (error) {
      console.error("Get service requests by category error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-request/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      const serviceRequest = await storage.getServiceRequest(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType === "client" && serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      res.json(serviceRequest);
    } catch (error) {
      console.error("Get service request error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/service-request/:id/status", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      const serviceRequest = await storage.getServiceRequest(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType === "client" && serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const updatedRequest = await storage.updateServiceRequest(requestId, { status });
      res.json({
        message: "Status atualizado com sucesso",
        serviceRequest: updatedRequest
      });
    } catch (error) {
      console.error("Update service request status error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "ID da solicita\xE7\xE3o inv\xE1lido" });
      }
      const serviceRequest = await storage.getServiceRequestWithClient(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType === "client" && serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Acesso negado a esta solicita\xE7\xE3o" });
      }
      res.json(serviceRequest);
    } catch (error) {
      console.error("Get service request error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const targetUserId = parseInt(req.params.id);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ message: "ID do usu\xE1rio inv\xE1lido" });
      }
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { password, ...userInfo } = targetUser;
      res.json(userInfo);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/service-requests/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      const serviceRequest = await storage.getServiceRequest(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType !== "client" || serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Apenas o cliente que criou a solicita\xE7\xE3o pode exclu\xED-la" });
      }
      if (serviceRequest.status !== "open") {
        return res.status(400).json({ message: "Apenas solicita\xE7\xF5es abertas podem ser exclu\xEDdas" });
      }
      await storage.deleteServiceRequest(requestId);
      res.json({ message: "Solicita\xE7\xE3o exclu\xEDda com sucesso" });
    } catch (error) {
      console.error("Delete service request error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/messages/:conversationId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const conversationId = parseInt(req.params.conversationId, 10);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "ID da conversa inv\xE1lido" });
      }
      const conversations2 = await storage.getConversationsByUser(user.id);
      const isParticipant = conversations2.some((conv) => conv.id === conversationId);
      if (!isParticipant) {
        const isDeleted = await storage.isConversationDeletedByUser(conversationId, user.id);
        if (isDeleted) {
          await storage.restoreConversation(conversationId, user.id);
          console.log(`Conversa ${conversationId} restaurada automaticamente para usu\xE1rio ${user.id} (buscar mensagens)`);
        } else {
          return res.status(403).json({ message: "Acesso negado \xE0 conversa" });
        }
      }
      const messages2 = await storage.getMessagesByConversation(conversationId);
      res.json(messages2);
    } catch (error) {
      console.error("Erro ao buscar mensagens da conversa:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/messages/conversation/:conversationId", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const conversationId = parseInt(req.params.conversationId, 10);
      console.log("\u{1F5D1}\uFE0F DELETE /api/messages/conversation - Usu\xE1rio:", user.id, user.userType);
      console.log("\u{1F5D1}\uFE0F conversationId para exclus\xE3o:", conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "ID da conversa inv\xE1lido" });
      }
      const conversations2 = await storage.getConversationsByUser(user.id);
      console.log("\u{1F5D1}\uFE0F Conversas do usu\xE1rio antes da exclus\xE3o:", conversations2.map((c) => c.id));
      const isParticipant = conversations2.some((conv) => conv.id === conversationId);
      if (!isParticipant) {
        console.log("\u274C Usu\xE1rio n\xE3o \xE9 participante da conversa");
        return res.status(403).json({ message: "Acesso negado \xE0 conversa" });
      }
      await storage.deleteConversation(conversationId, user.id);
      console.log("\u2705 Conversa marcada como deletada");
      const conversationsAfter = await storage.getConversationsByUser(user.id);
      console.log("\u{1F5D1}\uFE0F Conversas do usu\xE1rio ap\xF3s exclus\xE3o:", conversationsAfter.map((c) => c.id));
      res.json({ message: "Conversa removida com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao excluir conversa:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/:id/offers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "ID da solicita\xE7\xE3o inv\xE1lido" });
      }
      const serviceRequest = await storage.getServiceRequest(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType === "client" && serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Acesso negado \xE0s propostas" });
      }
      const offers = await storage.getServiceOffersByRequest(requestId);
      res.json(offers);
    } catch (error) {
      console.error("Get service offers error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-requests/:id/offers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      const { proposedPrice, estimatedTime, message } = req.body;
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "ID da solicita\xE7\xE3o inv\xE1lido" });
      }
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Apenas profissionais podem fazer propostas" });
      }
      const serviceRequest = await storage.getServiceRequest(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (serviceRequest.status !== "open") {
        return res.status(400).json({ message: "Esta solicita\xE7\xE3o n\xE3o est\xE1 mais aceitando propostas" });
      }
      const existingOffers = await storage.getServiceOffersByRequest(requestId);
      const hasExistingOffer = existingOffers.some((offer2) => offer2.professionalId === user.id);
      if (hasExistingOffer) {
        return res.status(400).json({ message: "Voc\xEA j\xE1 fez uma proposta para esta solicita\xE7\xE3o" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Dados do profissional n\xE3o encontrados" });
      }
      const offer = await storage.createServiceOffer({
        serviceRequestId: requestId,
        professionalId: professional.id,
        proposedPrice: proposedPrice.toString(),
        estimatedTime,
        message,
        status: "pending"
      });
      await storage.updateServiceRequest(requestId, {
        responses: (serviceRequest.responses || 0) + 1
      });
      res.status(201).json({
        message: "Proposta enviada com sucesso",
        offer
      });
    } catch (error) {
      console.error("Create service offer error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/professionals/:id/proposals", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const professionalId = parseInt(req.params.id);
      if (isNaN(professionalId)) {
        return res.status(400).json({ message: "ID do profissional inv\xE1lido" });
      }
      if (user.userType !== "provider" || user.id !== professionalId) {
        return res.status(403).json({ message: "Acesso negado \xE0s propostas" });
      }
      const professional = await storage.getProfessionalByUserId(professionalId);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const proposals = await storage.getProposalsByProfessional(professional.id);
      res.json(proposals);
    } catch (error) {
      console.error("Get professional proposals error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/auth/test", (req, res) => {
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID ? "Presente" : "Ausente",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "Ausente",
      nodeEnv: process.env.NODE_ENV,
      callbackUrl: process.env.NODE_ENV === "production" ? "https://lifebee.netlify.app/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback"
    });
  });
  app2.get("/api/test", (req, res) => {
    console.log("\u{1F9EA} Rota de teste acessada");
    res.json({
      message: "Servidor funcionando!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      env: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/auth/google", (req, res, next) => {
    console.log("\u{1F510} ===== IN\xCDCIO DA AUTENTICA\xC7\xC3O GOOGLE =====");
    console.log("\u{1F510} M\xE9todo:", req.method);
    console.log("\u{1F510} URL:", req.url);
    console.log("\u{1F510} Headers:", req.headers);
    console.log("\u{1F510} User Agent:", req.get("User-Agent"));
    console.log("\u{1F510} Referer:", req.get("Referer"));
    console.log("\u{1F510} Origin:", req.get("Origin"));
    console.log("\u{1F510} GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Presente" : "Ausente");
    console.log("\u{1F510} GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Presente" : "Ausente");
    console.log("\u{1F510} URL de callback configurada:", process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com/api/auth/google/callback" : "http://localhost:5000/api/auth/google/callback");
    console.log("\u{1F510} ===== FIM DOS LOGS DE IN\xCDCIO =====");
    next();
  }, passport2.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/user.addresses.read", "https://www.googleapis.com/auth/user.phonenumbers.read"]
  }));
  app2.get("/api/auth/google/callback", passport2.authenticate("google", {
    failureRedirect: process.env.NODE_ENV === "production" ? "https://lifebee.netlify.app/login?error=google_auth_failed" : "http://localhost:5173/login?error=google_auth_failed",
    session: false
  }), async (req, res) => {
    try {
      console.log("\u{1F510} ===== GOOGLE OAUTH CALLBACK INICIADO =====");
      console.log("\u{1F510} Timestamp:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("\u{1F510} Query params:", req.query);
      console.log("\u{1F510} Headers:", req.headers);
      console.log("\u{1F510} User object:", req.user);
      console.log("\u{1F510} User type:", typeof req.user);
      console.log("\u{1F510} User keys:", req.user ? Object.keys(req.user) : "null");
      console.log("\u{1F510} Session:", req.session);
      console.log("\u{1F510} Cookies:", req.cookies);
      console.log("\u{1F510} NODE_ENV:", process.env.NODE_ENV);
      console.log("\u{1F510} ===== FIM DOS LOGS INICIAIS =====");
      const user = req.user;
      console.log("\u{1F464} Usu\xE1rio recebido:", user ? {
        id: user.id,
        email: user.email,
        userType: user.userType,
        name: user.name,
        googleId: user.googleId
      } : "null");
      if (!user) {
        console.log("\u274C Usu\xE1rio n\xE3o encontrado no callback");
        return res.redirect("/login?error=google_auth_failed");
      }
      const token = generateToken(user);
      console.log("\u{1F3AB} Token gerado com sucesso");
      console.log("\u{1F3AB} Token length:", token.length);
      const redirectUrl = process.env.NODE_ENV === "production" ? `https://lifebee.netlify.app/auth-callback?token=${token}&userType=${user.userType}` : `http://localhost:5173/auth-callback?token=${token}&userType=${user.userType}`;
      console.log("\u{1F504} ===== REDIRECIONAMENTO FINAL =====");
      console.log("\u{1F504} Redirecionando para:", redirectUrl);
      console.log("\u{1F504} URL length:", redirectUrl.length);
      console.log("\u{1F504} Timestamp:", (/* @__PURE__ */ new Date()).toISOString());
      console.log("\u{1F504} ===== FIM DO CALLBACK =====");
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("\u274C ===== ERRO NO GOOGLE OAUTH CALLBACK =====");
      console.error("\u274C Error:", error);
      console.error("\u274C Error stack:", error instanceof Error ? error.stack : "No stack trace");
      console.error("\u274C Timestamp:", (/* @__PURE__ */ new Date()).toISOString());
      console.error("\u274C ===== FIM DO ERRO =====");
      const errorRedirectUrl = process.env.NODE_ENV === "production" ? "https://lifebee.netlify.app/login?error=google_auth_failed" : "http://localhost:5173/login?error=google_auth_failed";
      res.redirect(errorRedirectUrl);
    }
  });
  app2.get("/api/service-requests/client", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log("\u{1F50D} Buscando pedidos para cliente:", userId);
      if (!userId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const requests = await storage.getServiceRequestsForClient(userId);
      console.log("\u2705 Pedidos encontrados:", requests.length);
      res.json(requests);
    } catch (error) {
      console.error("\u274C Erro ao buscar pedidos do cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-offers/client", authenticateToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      console.log("\u{1F50D} Buscando propostas para cliente:", userId);
      if (!userId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const offers = await storage.getServiceOffersForClient(userId);
      console.log("\u2705 Propostas encontradas:", offers.length);
      res.json(offers);
    } catch (error) {
      console.error("\u274C Erro ao buscar propostas do cliente:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/service-offers/:id/accept", authenticateToken, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const userId = req.user?.id;
      console.log("\u2705 Aceitando proposta:", offerId, "pelo cliente:", userId);
      if (!userId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const result = await storage.acceptServiceOffer(offerId, userId);
      if (result.success) {
        res.json({ message: "Proposta aceita com sucesso" });
      } else {
        res.status(400).json({ error: result.error || "Erro ao aceitar proposta" });
      }
    } catch (error) {
      console.error("\u274C Erro ao aceitar proposta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.put("/api/service-offers/:id/reject", authenticateToken, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const userId = req.user?.id;
      console.log("\u274C Rejeitando proposta:", offerId, "pelo cliente:", userId);
      if (!userId) {
        return res.status(401).json({ error: "Usu\xE1rio n\xE3o autenticado" });
      }
      const result = await storage.rejectServiceOffer(offerId, userId);
      if (result.success) {
        res.json({ message: "Proposta rejeitada com sucesso" });
      } else {
        res.status(400).json({ error: result.error || "Erro ao rejeitar proposta" });
      }
    } catch (error) {
      console.error("\u274C Erro ao rejeitar proposta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import { Server as SocketIOServer } from "socket.io";
var app = express2();
console.log("=== Backend inicializado ===");
app.use((req, res, next) => {
  if (req.path.startsWith("/uploads")) {
    return next();
  }
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://lifebee.netlify.app",
    "https://lifebee.com.br",
    "http://localhost:5173",
    "http://localhost:5174"
  ];
  console.log("\u{1F310} CORS - Origin:", origin);
  console.log("\u{1F310} CORS - Method:", req.method);
  console.log("\u{1F310} CORS - Path:", req.path);
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("\u{1F310} CORS - Origin permitido:", origin);
  } else {
    const defaultOrigin = process.env.NODE_ENV === "production" ? "https://lifebee.netlify.app" : "http://localhost:5173";
    res.setHeader("Access-Control-Allow-Origin", defaultOrigin);
    console.log("\u{1F310} CORS - Usando origin padr\xE3o:", defaultOrigin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    console.log("\u{1F310} CORS - Respondendo a OPTIONS");
    res.status(200).end();
    return;
  }
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log("\u{1F310} Debug Global - Requisi\xE7\xE3o:", req.method, req.path);
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://lifebee.netlify.app",
        "https://lifebee.com.br"
      ],
      credentials: true
    }
  });
  io.on("connection", (socket) => {
    console.log("Novo usu\xE1rio conectado:", socket.id);
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
    });
    socket.on("chatMessage", ({ roomId, message, sender }) => {
      io.to(roomId).emit("chatMessage", { message, sender });
    });
    socket.on("disconnect", () => {
      console.log("Usu\xE1rio desconectado:", socket.id);
    });
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });
  const port = process.env.PORT || 8080;
  server.listen({
    port: Number(port),
    host: "0.0.0.0"
  }, () => {
    console.log(`Server running on port ${port}`);
  });
})();
