var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db
});
import "dotenv/config";
import path from "path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
var sql, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    config({ path: path.resolve(process.cwd(), "../.env") });
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://neondb_owner:npg_OMmGjW6wS8Ao@ep-little-king-ad4q6wb5-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
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
    sql = neon(process.env.DATABASE_URL || "postgresql://neondb_owner:npg_L9mgJX6UuftC@ep-lingering-pine-a54hc3dj-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
    db = drizzle(sql);
  }
});

// server/index.ts
import "dotenv/config";
import path2 from "path";
import { config as config2 } from "dotenv";
import { fileURLToPath } from "url";
import express2 from "express";
import { sql as sql3 } from "drizzle-orm";

// server/routes-simple.ts
import express from "express";

// server/schema.ts
import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
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
  status: text("status", { enum: ["open", "in_progress", "assigned", "completed", "cancelled", "awaiting_confirmation"] }).default("open"),
  assignedProfessionalId: integer("assigned_professional_id"),
  // Profissional designado
  responses: integer("responses").default(0),
  // Número de profissionais que responderam
  serviceStartedAt: timestamp("service_started_at"),
  // Quando o profissional iniciou o serviço
  serviceCompletedAt: timestamp("service_completed_at"),
  // Quando o profissional marcou como concluído
  clientConfirmedAt: timestamp("client_confirmed_at"),
  // Quando o cliente confirmou a conclusão
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
  finalPrice: decimal("final_price", { precision: 8, scale: 2 }),
  // Preço final acordado
  estimatedTime: text("estimated_time").notNull(),
  // Tempo estimado (ex: "1 hora", "2 horas")
  message: text("message").notNull(),
  // Mensagem da proposta
  status: text("status", { enum: ["pending", "accepted", "rejected", "withdrawn", "paid", "completed"] }).default("pending"),
  // Status da proposta
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(),
  serviceOfferId: integer("service_offer_id").notNull(),
  clientId: integer("client_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // Valor da transação
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"]
  }).notNull().default("pending"),
  type: text("type", {
    enum: ["service_payment", "refund", "bonus"]
  }).notNull().default("service_payment"),
  description: text("description"),
  // Descrição da transação
  paymentMethod: text("payment_method", {
    enum: ["pix", "credit_card", "debit_card", "bank_transfer"]
  }).default("pix"),
  transactionId: text("transaction_id"),
  // ID externo da transação (gateway de pagamento)
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var serviceReviews = pgTable("service_reviews", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(),
  serviceOfferId: integer("service_offer_id").notNull(),
  clientId: integer("client_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  rating: integer("rating").notNull(),
  // 1-5 estrelas
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentReferences = pgTable("payment_references", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(),
  serviceOfferId: integer("service_offer_id").notNull(),
  clientId: integer("client_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  preferenceId: text("preference_id").notNull().unique(),
  status: text("status", { enum: ["pending", "approved", "rejected", "cancelled"] }).notNull().default("pending"),
  statusDetail: text("status_detail"),
  // Detalhes do status do pagamento
  externalReference: text("external_reference").notNull(),
  paymentId: text("payment_id"),
  // ID do pagamento no Mercado Pago quando aprovado
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var serviceProgress = pgTable("service_progress", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  status: text("status", {
    enum: ["accepted", "started", "in_progress", "completed", "awaiting_confirmation", "confirmed", "payment_released"]
  }).notNull().default("accepted"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  confirmedAt: timestamp("confirmed_at"),
  paymentReleasedAt: timestamp("payment_released_at"),
  notes: text("notes"),
  // Observações do profissional
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// server/storage.ts
init_db();
import { eq, and, or, gte, ilike, sql as sql2, desc, ne, isNull } from "drizzle-orm";
var DatabaseStorage = class {
  // Método para converter URLs relativas em absolutas
  getFullImageUrl(relativeUrl) {
    if (!relativeUrl) {
      return null;
    }
    if (relativeUrl.startsWith("http")) {
      return relativeUrl;
    }
    const baseUrl = process.env.NODE_ENV === "production" ? "https://lifebee-backend.onrender.com" : "http://localhost:8080";
    return `${baseUrl}${relativeUrl}`;
  }
  // Users
  async getUser(id) {
    try {
      console.log("\u{1F50D} Storage.getUser - Buscando usu\xE1rio com ID:", id);
      console.log("\u{1F50D} Storage.getUser - Tipo do ID:", typeof id);
      if (!id || isNaN(id)) {
        console.log("\u274C Storage.getUser - ID inv\xE1lido:", id);
        return void 0;
      }
      const [user] = await db.select().from(users).where(eq(users.id, id));
      console.log("\u2705 Storage.getUser - Usu\xE1rio encontrado:", user ? "Sim" : "N\xE3o");
      if (user) {
        console.log("\u2705 Storage.getUser - Dados do usu\xE1rio:", { id: user.id, name: user.name, email: user.email });
      }
      return user || void 0;
    } catch (error) {
      console.error("\u274C Storage.getUser - Erro:", error);
      throw error;
    }
  }
  async getAllUsers() {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error("\u274C Storage.getAllUsers - Erro:", error);
      throw error;
    }
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
  // Stripe Connect Functions
  async updateProfessionalStripeAccount(professionalId, data) {
    const [professional] = await db.update(professionals).set(data).where(eq(professionals.id, professionalId)).returning();
    return professional;
  }
  async getProfessionalByStripeAccountId(stripeAccountId) {
    const [professional] = await db.select().from(professionals).where(eq(professionals.stripeAccountId, stripeAccountId));
    return professional || null;
  }
  async getProfessionalsWithoutStripeConnect() {
    return await db.select().from(professionals).where(
      or(
        isNull(professionals.stripeAccountId),
        eq(professionals.stripeOnboardingCompleted, false)
      )
    );
  }
  async canProfessionalReceivePayments(professionalId) {
    const [professional] = await db.select({ stripeChargesEnabled: professionals.stripeChargesEnabled }).from(professionals).where(eq(professionals.id, professionalId));
    return professional?.stripeChargesEnabled === true;
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
    const [result] = await db.select({ count: sql2`cast(count(*) as int)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count || 0;
  }
  async createNotification(data) {
    try {
      console.log("\u{1F50D} createNotification - Dados recebidos:", data);
      const valuesToInsert = {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        actionUrl: data.actionUrl || null,
        read: data.read ?? false
      };
      console.log("\u{1F4DD} createNotification - Valores para inserir:", valuesToInsert);
      console.log("\u{1F4CB} Schema de notifications:", Object.keys(notifications));
      const [notification] = await db.insert(notifications).values(valuesToInsert).returning();
      console.log("\u2705 createNotification - Notifica\xE7\xE3o criada:", notification.id);
      return notification;
    } catch (error) {
      console.error("\u274C createNotification - Erro:", error);
      throw error;
    }
  }
  async getUserNotifications(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
  }
  async markNotificationAsRead(notificationId, userId) {
    await db.update(notifications).set({ read: true }).where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
  }
  async markAllNotificationsAsRead(userId) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
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
    const [result] = await db.select({ count: sql2`cast(count(*) as int)` }).from(messages).where(
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
      serviceStartedAt: serviceRequests.serviceStartedAt,
      serviceCompletedAt: serviceRequests.serviceCompletedAt,
      clientConfirmedAt: serviceRequests.clientConfirmedAt,
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
      serviceStartedAt: serviceRequests.serviceStartedAt,
      serviceCompletedAt: serviceRequests.serviceCompletedAt,
      clientConfirmedAt: serviceRequests.clientConfirmedAt,
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
    console.log("\u{1F5D1}\uFE0F Excluindo service request ID:", id);
    await this.deleteServiceOffersByRequest(id);
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
    console.log("\u2705 Service request exclu\xEDdo com sucesso");
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
      finalPrice: serviceOffers.finalPrice,
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
  async getProposalsByServiceRequest(requestId) {
    return await db.select({
      // Service Offer fields
      id: serviceOffers.id,
      serviceRequestId: serviceOffers.serviceRequestId,
      professionalId: serviceOffers.professionalId,
      proposedPrice: serviceOffers.proposedPrice,
      finalPrice: serviceOffers.finalPrice,
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
      finalPrice: serviceOffers.finalPrice,
      estimatedTime: serviceOffers.estimatedTime,
      message: serviceOffers.message,
      status: serviceOffers.status,
      createdAt: serviceOffers.createdAt,
      updatedAt: serviceOffers.updatedAt,
      // Service Request fields
      requestId: serviceRequests.id,
      clientId: serviceRequests.clientId,
      serviceType: serviceRequests.serviceType,
      category: serviceRequests.category,
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
      serviceStartedAt: serviceRequests.serviceStartedAt,
      serviceCompletedAt: serviceRequests.serviceCompletedAt,
      clientConfirmedAt: serviceRequests.clientConfirmedAt,
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
      finalPrice: result.finalPrice,
      estimatedTime: result.estimatedTime,
      message: result.message,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      serviceRequest: {
        id: result.requestId,
        clientId: result.clientId,
        category: result.category,
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
        serviceStartedAt: result.serviceStartedAt,
        serviceCompletedAt: result.serviceCompletedAt,
        clientConfirmedAt: result.clientConfirmedAt,
        clientName: result.clientName,
        clientEmail: result.clientEmail,
        clientPhone: result.clientPhone,
        clientProfileImage: result.clientProfileImage,
        clientCreatedAt: result.clientCreatedAt
      }
    }));
  }
  async getServiceOffers(serviceRequestId) {
    return await db.select().from(serviceOffers).where(eq(serviceOffers.serviceRequestId, serviceRequestId)).orderBy(desc(serviceOffers.createdAt));
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
  async deleteServiceOffersByRequest(serviceRequestId) {
    console.log("\u{1F5D1}\uFE0F Excluindo todas as propostas do service request ID:", serviceRequestId);
    await db.delete(serviceOffers).where(eq(serviceOffers.serviceRequestId, serviceRequestId));
    console.log("\u2705 Todas as propostas exclu\xEDdas com sucesso");
  }
  // ==================== SERVICE REQUESTS FOR CLIENT ====================
  async getServiceRequestsForClient(userId) {
    try {
      console.log("\u{1F50D} Buscando pedidos para cliente ID:", userId);
      if (!userId || isNaN(userId)) {
        throw new Error("ID do usu\xE1rio inv\xE1lido");
      }
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
    } catch (error) {
      console.error("\u274C Erro em getServiceRequestsForClient:", error);
      throw error;
    }
  }
  // ==================== SERVICE OFFERS FOR CLIENT ====================
  async getServiceOffersForClient(userId) {
    try {
      console.log("\u{1F50D} Buscando propostas para cliente ID:", userId);
      if (!userId || isNaN(userId)) {
        throw new Error("ID do usu\xE1rio inv\xE1lido");
      }
      const results = await db.select({
        id: serviceOffers.id,
        serviceRequestId: serviceOffers.serviceRequestId,
        professionalId: serviceOffers.professionalId,
        proposedPrice: serviceOffers.proposedPrice,
        finalPrice: serviceOffers.finalPrice,
        estimatedTime: serviceOffers.estimatedTime,
        message: serviceOffers.message,
        status: serviceOffers.status,
        createdAt: serviceOffers.createdAt,
        serviceTitle: serviceRequests.serviceType,
        serviceStatus: serviceRequests.status,
        professionalName: professionals.name,
        professionalUserId: professionals.userId,
        professionalRating: professionals.rating,
        professionalTotalReviews: professionals.totalReviews,
        professionalProfileImage: professionals.imageUrl,
        // Adicionar informações sobre avaliação se o serviço estiver concluído
        hasReview: serviceReviews.id,
        reviewRating: serviceReviews.rating,
        reviewComment: serviceReviews.comment,
        reviewCreatedAt: serviceReviews.createdAt
      }).from(serviceOffers).innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id)).leftJoin(serviceReviews, and(
        eq(serviceReviews.serviceRequestId, serviceRequests.id),
        eq(serviceReviews.clientId, userId)
      )).where(eq(serviceRequests.clientId, userId)).orderBy(desc(serviceOffers.createdAt));
      console.log("\u2705 Propostas encontradas:", results.length);
      return results.map((result) => ({
        id: result.id,
        serviceRequestId: result.serviceRequestId,
        professionalId: result.professionalId,
        professionalUserId: result.professionalUserId,
        professionalName: result.professionalName,
        professionalRating: result.professionalRating || 5,
        professionalTotalReviews: result.professionalTotalReviews || 0,
        professionalProfileImage: result.professionalProfileImage ? this.getFullImageUrl(result.professionalProfileImage) : null,
        proposedPrice: result.proposedPrice,
        finalPrice: result.finalPrice,
        estimatedTime: result.estimatedTime,
        message: result.message,
        status: result.status,
        createdAt: result.createdAt,
        serviceTitle: result.serviceTitle,
        serviceStatus: result.serviceStatus,
        // Incluir informações sobre avaliação
        hasReview: !!result.hasReview,
        reviewRating: result.reviewRating,
        reviewComment: result.reviewComment,
        reviewCreatedAt: result.reviewCreatedAt
      }));
    } catch (error) {
      console.error("\u274C Erro em getServiceOffersForClient:", error);
      throw error;
    }
  }
  async acceptServiceOffer(offerId, userId) {
    try {
      console.log("\u2705 Aceitando proposta:", offerId, "pelo cliente:", userId);
      const [offer] = await db.select({
        id: serviceOffers.id,
        serviceRequestId: serviceOffers.serviceRequestId,
        professionalId: serviceOffers.professionalId,
        proposedPrice: serviceOffers.proposedPrice,
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
        status: "assigned",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceRequests.id, offer.serviceRequestId));
      await db.update(serviceOffers).set({
        finalPrice: offer.proposedPrice,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceOffers.id, offerId));
      await db.insert(serviceProgress).values({
        serviceRequestId: offer.serviceRequestId,
        professionalId: offer.professionalId,
        status: "accepted"
      });
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
  // Métodos para gerenciar o progresso do serviço
  async startService(serviceRequestId, professionalId) {
    try {
      console.log("\u{1F680} Iniciando servi\xE7o:", serviceRequestId, "pelo profissional:", professionalId);
      const [request] = await db.select({
        id: serviceRequests.id,
        status: serviceRequests.status,
        assignedProfessionalId: serviceRequests.assignedProfessionalId
      }).from(serviceRequests).where(eq(serviceRequests.id, serviceRequestId));
      if (!request) {
        return { success: false, error: "Solicita\xE7\xE3o n\xE3o encontrada" };
      }
      if (request.assignedProfessionalId !== professionalId) {
        return { success: false, error: "Servi\xE7o n\xE3o foi atribu\xEDdo a este profissional" };
      }
      if (request.status !== "assigned") {
        return { success: false, error: "Servi\xE7o n\xE3o est\xE1 em estado de iniciar" };
      }
      await db.update(serviceRequests).set({
        status: "in_progress",
        serviceStartedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceRequests.id, serviceRequestId));
      await db.update(serviceProgress).set({
        status: "started",
        startedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(serviceProgress.serviceRequestId, serviceRequestId),
        eq(serviceProgress.professionalId, professionalId)
      ));
      return { success: true };
    } catch (error) {
      console.error("\u274C Erro ao iniciar servi\xE7o:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
  async completeService(serviceRequestId, professionalId, notes) {
    try {
      console.log("\u2705 Concluindo servi\xE7o:", serviceRequestId, "pelo profissional:", professionalId);
      const [professional] = await db.select({ id: professionals.id }).from(professionals).where(eq(professionals.userId, professionalId));
      console.log("\u{1F50D} Profissional encontrado:", professional);
      if (!professional) {
        console.log("\u274C Profissional n\xE3o encontrado para userId:", professionalId);
        return { success: false, error: "Profissional n\xE3o encontrado" };
      }
      const actualProfessionalId = professional.id;
      console.log("\u{1F50D} ID real do profissional:", actualProfessionalId);
      const [request] = await db.select({
        id: serviceRequests.id,
        status: serviceRequests.status,
        assignedProfessionalId: serviceRequests.assignedProfessionalId
      }).from(serviceRequests).where(eq(serviceRequests.id, serviceRequestId));
      if (!request) {
        console.log("\u274C Solicita\xE7\xE3o n\xE3o encontrada:", serviceRequestId);
        return { success: false, error: "Solicita\xE7\xE3o n\xE3o encontrada" };
      }
      console.log("\u{1F50D} Dados da solicita\xE7\xE3o:", request);
      if (request.assignedProfessionalId !== actualProfessionalId) {
        console.log("\u274C Servi\xE7o n\xE3o atribu\xEDdo a este profissional. Atribu\xEDdo a:", request.assignedProfessionalId, "Profissional atual:", actualProfessionalId);
        return { success: false, error: "Servi\xE7o n\xE3o foi atribu\xEDdo a este profissional" };
      }
      if (request.status !== "in_progress" && request.status !== "open") {
        console.log("\u274C Status incorreto do servi\xE7o:", request.status, "Esperado: in_progress ou open");
        return { success: false, error: "Servi\xE7o deve estar em andamento ou aberto com proposta aceita para ser conclu\xEDdo" };
      }
      if (request.status === "open") {
        console.log("\u{1F50D} Servi\xE7o em status open, verificando proposta aceita...");
        const [acceptedOffer] = await db.select({ id: serviceOffers.id }).from(serviceOffers).where(and(
          eq(serviceOffers.serviceRequestId, serviceRequestId),
          eq(serviceOffers.professionalId, actualProfessionalId),
          eq(serviceOffers.status, "accepted")
        ));
        if (!acceptedOffer) {
          console.log("\u274C Proposta aceita n\xE3o encontrada para servi\xE7o em status open:", serviceRequestId);
          return { success: false, error: "Servi\xE7o deve ter uma proposta aceita para ser conclu\xEDdo" };
        }
        console.log("\u2705 Proposta aceita encontrada para servi\xE7o em status open:", acceptedOffer.id);
      }
      await db.update(serviceRequests).set({
        status: "awaiting_confirmation",
        serviceCompletedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceRequests.id, serviceRequestId));
      console.log("\u2705 Status da solicita\xE7\xE3o atualizado para awaiting_confirmation");
      console.log("\u2705 Servi\xE7o marcado como conclu\xEDdo pelo profissional");
      await db.update(serviceProgress).set({
        status: "awaiting_confirmation",
        completedAt: /* @__PURE__ */ new Date(),
        notes: notes || null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(serviceProgress.serviceRequestId, serviceRequestId),
        eq(serviceProgress.professionalId, actualProfessionalId)
      ));
      console.log("\u2705 Progresso atualizado para awaiting_confirmation");
      return { success: true };
    } catch (error) {
      console.error("\u274C Erro ao concluir servi\xE7o:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
  async confirmServiceCompletion(serviceRequestId, clientId) {
    try {
      console.log("\u2705 Cliente confirmando conclus\xE3o do servi\xE7o:", serviceRequestId);
      const [request] = await db.select({
        id: serviceRequests.id,
        status: serviceRequests.status,
        clientId: serviceRequests.clientId,
        assignedProfessionalId: serviceRequests.assignedProfessionalId
      }).from(serviceRequests).where(eq(serviceRequests.id, serviceRequestId));
      console.log("\u{1F50D} Dados da solicita\xE7\xE3o encontrada:", request);
      if (!request) {
        console.log("\u274C Solicita\xE7\xE3o n\xE3o encontrada:", serviceRequestId);
        return { success: false, error: "Solicita\xE7\xE3o n\xE3o encontrada" };
      }
      if (request.clientId !== clientId) {
        console.log("\u274C Cliente incorreto:", request.clientId, "Esperado:", clientId);
        return { success: false, error: "Servi\xE7o n\xE3o pertence a este cliente" };
      }
      if (request.status !== "awaiting_confirmation") {
        console.log("\u274C Status incorreto do servi\xE7o:", request.status, "Esperado: awaiting_confirmation");
        return { success: false, error: "Servi\xE7o n\xE3o est\xE1 aguardando confirma\xE7\xE3o" };
      }
      if (!request.assignedProfessionalId) {
        console.log("\u274C Nenhum profissional designado para servi\xE7o:", serviceRequestId);
        return { success: false, error: "Nenhum profissional foi designado para este servi\xE7o" };
      }
      const [acceptedOffer] = await db.select({
        id: serviceOffers.id,
        proposedPrice: serviceOffers.proposedPrice,
        finalPrice: serviceOffers.finalPrice
      }).from(serviceOffers).where(and(
        eq(serviceOffers.serviceRequestId, serviceRequestId),
        eq(serviceOffers.professionalId, request.assignedProfessionalId),
        eq(serviceOffers.status, "accepted")
      ));
      console.log("\u{1F50D} Proposta aceita encontrada:", acceptedOffer);
      if (!acceptedOffer) {
        console.log("\u274C Proposta aceita n\xE3o encontrada para servi\xE7o:", serviceRequestId);
        return { success: false, error: "Proposta aceita n\xE3o encontrada" };
      }
      const finalAmount = acceptedOffer.finalPrice || acceptedOffer.proposedPrice;
      console.log("\u{1F4B0} Valor final para transa\xE7\xE3o:", finalAmount, "Tipo:", typeof finalAmount);
      const transaction = await this.createTransaction({
        serviceRequestId,
        serviceOfferId: acceptedOffer.id,
        clientId,
        professionalId: request.assignedProfessionalId,
        amount: Number(finalAmount),
        status: "completed",
        type: "service_payment",
        description: `Pagamento pelo servi\xE7o #${serviceRequestId}`,
        paymentMethod: "pix",
        completedAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Transa\xE7\xE3o criada com sucesso:", transaction.id, "Valor:", transaction.amount);
      await db.update(serviceRequests).set({
        status: "completed",
        clientConfirmedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceRequests.id, serviceRequestId));
      console.log("\u2705 Status da solicita\xE7\xE3o atualizado para completed");
      await db.update(serviceProgress).set({
        status: "payment_released",
        confirmedAt: /* @__PURE__ */ new Date(),
        paymentReleasedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(serviceProgress.serviceRequestId, serviceRequestId));
      console.log("\u2705 Progresso atualizado para payment_released");
      const professional = await this.getProfessional(request.assignedProfessionalId);
      if (professional) {
        await this.createNotification({
          userId: professional.userId,
          message: `Pagamento de R$ ${finalAmount} foi liberado pelo servi\xE7o #${serviceRequestId}.`,
          read: false
        });
      }
      console.log("\u{1F5D1}\uFE0F Excluindo propostas n\xE3o aceitas...");
      await db.delete(serviceOffers).where(and(
        eq(serviceOffers.serviceRequestId, serviceRequestId),
        ne(serviceOffers.status, "accepted")
      ));
      console.log("\u2705 Propostas n\xE3o aceitas exclu\xEDdas com sucesso");
      console.log("\u2705 Servi\xE7o conclu\xEDdo com sucesso! ID:", serviceRequestId);
      return { success: true };
    } catch (error) {
      console.error("\u274C Erro ao confirmar conclus\xE3o do servi\xE7o:", error);
      return { success: false, error: "Erro interno do servidor" };
    }
  }
  async getServiceProgress(serviceRequestId) {
    try {
      const [progress] = await db.select().from(serviceProgress).where(eq(serviceProgress.serviceRequestId, serviceRequestId));
      return progress || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar progresso do servi\xE7o:", error);
      return null;
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
  // Transactions
  async createTransaction(transaction) {
    try {
      console.log("\u2705 Criando transa\xE7\xE3o:", transaction);
      const [newTransaction] = await db.insert(transactions).values(transaction).returning();
      return newTransaction;
    } catch (error) {
      console.error("\u274C Erro ao criar transa\xE7\xE3o:", error);
      throw error;
    }
  }
  async getTransactionsByProfessional(professionalId) {
    try {
      const professionalTransactions = await db.select().from(transactions).where(eq(transactions.professionalId, professionalId)).orderBy(desc(transactions.createdAt));
      return professionalTransactions;
    } catch (error) {
      console.error("\u274C Erro ao buscar transa\xE7\xF5es do profissional:", error);
      return [];
    }
  }
  async getTransactionsByClient(clientId) {
    try {
      const clientTransactions = await db.select().from(transactions).where(eq(transactions.clientId, clientId)).orderBy(desc(transactions.createdAt));
      return clientTransactions;
    } catch (error) {
      console.error("\u274C Erro ao buscar transa\xE7\xF5es do cliente:", error);
      return [];
    }
  }
  async updateTransactionStatus(id, status) {
    try {
      const [updatedTransaction] = await db.update(transactions).set({
        status,
        updatedAt: /* @__PURE__ */ new Date(),
        ...status === "completed" && { completedAt: /* @__PURE__ */ new Date() }
      }).where(eq(transactions.id, id)).returning();
      return updatedTransaction;
    } catch (error) {
      console.error("\u274C Erro ao atualizar status da transa\xE7\xE3o:", error);
      throw error;
    }
  }
  async getTransactionById(id) {
    try {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      return transaction || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar transa\xE7\xE3o por ID:", error);
      return null;
    }
  }
  // Service Reviews
  async createServiceReview(review) {
    try {
      console.log("\u2705 Criando avalia\xE7\xE3o de servi\xE7o:", review);
      const [newReview] = await db.insert(serviceReviews).values(review).returning();
      await this.updateProfessionalRating(review.professionalId);
      return newReview;
    } catch (error) {
      console.error("\u274C Erro ao criar avalia\xE7\xE3o de servi\xE7o:", error);
      throw error;
    }
  }
  async getServiceReviewsByProfessional(professionalId) {
    try {
      const reviews = await db.select().from(serviceReviews).where(eq(serviceReviews.professionalId, professionalId)).orderBy(desc(serviceReviews.createdAt));
      return reviews;
    } catch (error) {
      console.error("\u274C Erro ao buscar avalia\xE7\xF5es do profissional:", error);
      throw error;
    }
  }
  async getServiceReviewsByClient(clientId) {
    try {
      const reviews = await db.select().from(serviceReviews).where(eq(serviceReviews.clientId, clientId)).orderBy(desc(serviceReviews.createdAt));
      return reviews;
    } catch (error) {
      console.error("\u274C Erro ao buscar avalia\xE7\xF5es do cliente:", error);
      throw error;
    }
  }
  async getProfessionalCompletedServices(professionalId) {
    try {
      console.log("\u{1F50D} Buscando servi\xE7os conclu\xEDdos do profissional:", professionalId);
      const results = await db.select({
        serviceRequestId: serviceRequests.id,
        serviceTitle: serviceRequests.serviceType,
        clientName: users.name,
        clientEmail: users.email,
        amount: sql2`COALESCE(${serviceOffers.finalPrice}, ${serviceOffers.proposedPrice})`,
        status: serviceRequests.status,
        completedAt: serviceRequests.clientConfirmedAt,
        // Informações da avaliação
        reviewRating: serviceReviews.rating,
        reviewComment: serviceReviews.comment,
        reviewCreatedAt: serviceReviews.createdAt,
        // Informações da transação
        transactionId: transactions.id,
        transactionStatus: transactions.status,
        transactionCompletedAt: transactions.completedAt
      }).from(serviceRequests).innerJoin(serviceOffers, and(
        eq(serviceOffers.serviceRequestId, serviceRequests.id),
        eq(serviceOffers.professionalId, professionalId),
        eq(serviceOffers.status, "accepted")
      )).innerJoin(users, eq(serviceRequests.clientId, users.id)).leftJoin(serviceReviews, eq(serviceReviews.serviceRequestId, serviceRequests.id)).leftJoin(transactions, and(
        eq(transactions.serviceRequestId, serviceRequests.id),
        eq(transactions.professionalId, professionalId),
        eq(transactions.type, "service_payment")
      )).where(and(
        eq(serviceRequests.assignedProfessionalId, professionalId),
        eq(serviceRequests.status, "completed")
      )).orderBy(desc(serviceRequests.clientConfirmedAt));
      console.log("\u2705 Servi\xE7os conclu\xEDdos encontrados:", results.length);
      console.log("\u{1F50D} Dados dos servi\xE7os:", results.map((r) => ({ id: r.serviceRequestId, status: r.status, amount: r.amount })));
      const mappedResults = results.map((result) => ({
        serviceRequestId: result.serviceRequestId,
        serviceTitle: result.serviceTitle,
        clientName: result.clientName,
        clientEmail: result.clientEmail,
        amount: Number(result.amount),
        status: result.status,
        completedAt: result.completedAt,
        hasReview: !!result.reviewRating,
        reviewRating: result.reviewRating,
        reviewComment: result.reviewComment,
        reviewCreatedAt: result.reviewCreatedAt,
        transactionId: result.transactionId,
        transactionStatus: result.transactionStatus,
        transactionCompletedAt: result.transactionCompletedAt
      }));
      console.log("\u2705 Resultados mapeados:", mappedResults.length);
      return mappedResults;
    } catch (error) {
      console.error("\u274C Erro ao buscar servi\xE7os conclu\xEDdos do profissional:", error);
      throw error;
    }
  }
  async getServiceReviewByService(serviceRequestId) {
    try {
      const [review] = await db.select().from(serviceReviews).where(eq(serviceReviews.serviceRequestId, serviceRequestId));
      return review || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar avalia\xE7\xE3o do servi\xE7o:", error);
      return null;
    }
  }
  async updateProfessionalRating(professionalId) {
    try {
      const reviews = await this.getServiceReviewsByProfessional(professionalId);
      if (reviews.length === 0) {
        await db.update(professionals).set({
          rating: "5.0",
          totalReviews: 0
        }).where(eq(professionals.id, professionalId));
        return;
      }
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      await db.update(professionals).set({
        rating: averageRating.toFixed(1),
        totalReviews: reviews.length
      }).where(eq(professionals.id, professionalId));
      console.log(`\u2705 Avalia\xE7\xE3o do profissional ${professionalId} atualizada: ${averageRating.toFixed(1)} (${reviews.length} avalia\xE7\xF5es)`);
    } catch (error) {
      console.error("\u274C Erro ao atualizar avalia\xE7\xE3o do profissional:", error);
      throw error;
    }
  }
  // ==================== HELPER METHODS FOR PAYMENTS ====================
  async getServiceOfferById(offerId) {
    try {
      const [result] = await db.select().from(serviceOffers).where(eq(serviceOffers.id, offerId));
      return result || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar oferta de servi\xE7o:", error);
      throw error;
    }
  }
  async getServiceRequestById(requestId) {
    try {
      const [result] = await db.select().from(serviceRequests).where(eq(serviceRequests.id, requestId));
      return result || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar solicita\xE7\xE3o de servi\xE7o:", error);
      throw error;
    }
  }
  async getProfessionalById(professionalId) {
    try {
      const [result] = await db.select().from(professionals).where(eq(professionals.id, professionalId));
      return result || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar profissional:", error);
      throw error;
    }
  }
  // ==================== PAYMENT REFERENCES METHODS ====================
  async createPaymentReference(paymentRef) {
    try {
      console.log("\u{1F4B3} Criando refer\xEAncia de pagamento:", paymentRef);
      const [result] = await db.insert(paymentReferences).values(paymentRef).returning();
      console.log("\u2705 Refer\xEAncia de pagamento criada:", result.id);
      return result;
    } catch (error) {
      console.error("\u274C Erro ao criar refer\xEAncia de pagamento:", error);
      throw error;
    }
  }
  async getPaymentReferenceByPreferenceId(preferenceId) {
    try {
      console.log("\u{1F50D} Buscando refer\xEAncia de pagamento por preference ID:", preferenceId);
      const [result] = await db.select().from(paymentReferences).where(eq(paymentReferences.preferenceId, preferenceId));
      return result || null;
    } catch (error) {
      console.error("\u274C Erro ao buscar refer\xEAncia de pagamento:", error);
      throw error;
    }
  }
  async updatePaymentReferenceStatus(preferenceId, status, statusDetail, paymentId, approvedAt) {
    try {
      console.log("\u{1F4DD} Atualizando status da refer\xEAncia de pagamento:", {
        preferenceId,
        status,
        statusDetail,
        paymentId,
        approvedAt
      });
      const updateData = {
        status,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (statusDetail) {
        updateData.statusDetail = statusDetail;
      }
      if (paymentId) {
        updateData.paymentId = paymentId;
      }
      if (approvedAt) {
        updateData.approvedAt = approvedAt;
      }
      await db.update(paymentReferences).set(updateData).where(eq(paymentReferences.preferenceId, preferenceId));
      console.log("\u2705 Status da refer\xEAncia de pagamento atualizado");
    } catch (error) {
      console.error("\u274C Erro ao atualizar status da refer\xEAncia de pagamento:", error);
      throw error;
    }
  }
  // Service Offer Status Update
  async updateServiceOfferStatus(offerId, status) {
    try {
      console.log("\u{1F4DD} Atualizando status da proposta:", { offerId, status });
      await db.update(serviceOffers).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(serviceOffers.id, offerId));
      console.log("\u2705 Status da proposta atualizado");
    } catch (error) {
      console.error("\u274C Erro ao atualizar status da proposta:", error);
      throw error;
    }
  }
  async updateServiceRequestStatus(requestId, status) {
    try {
      console.log("\u{1F4DD} Atualizando status da solicita\xE7\xE3o:", { requestId, status });
      await db.update(serviceRequests).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(serviceRequests.id, requestId));
      console.log("\u2705 Status da solicita\xE7\xE3o atualizado");
    } catch (error) {
      console.error("\u274C Erro ao atualizar status da solicita\xE7\xE3o:", error);
      throw error;
    }
  }
  // ==================== PROVIDER PAYMENT METHODS ====================
  async getProviderPayments(professionalId, filter) {
    try {
      console.log("\u{1F50D} Buscando pagamentos do profissional:", { professionalId, filter });
      let whereCondition = eq(paymentReferences.professionalId, professionalId);
      if (filter !== "all") {
        whereCondition = and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, filter)
        );
      }
      const result = await db.select({
        id: paymentReferences.id,
        serviceRequestId: paymentReferences.serviceRequestId,
        serviceOfferId: paymentReferences.serviceOfferId,
        clientId: paymentReferences.clientId,
        amount: paymentReferences.amount,
        status: paymentReferences.status,
        statusDetail: paymentReferences.statusDetail,
        externalReference: paymentReferences.externalReference,
        paymentId: paymentReferences.paymentId,
        approvedAt: paymentReferences.approvedAt,
        createdAt: paymentReferences.createdAt,
        updatedAt: paymentReferences.updatedAt,
        serviceRequest: {
          title: serviceRequests.title,
          description: serviceRequests.description,
          category: serviceRequests.category
        },
        client: {
          name: users.name,
          email: users.email
        }
      }).from(paymentReferences).leftJoin(serviceRequests, eq(paymentReferences.serviceRequestId, serviceRequests.id)).leftJoin(users, eq(paymentReferences.clientId, users.id)).where(whereCondition).orderBy(desc(paymentReferences.createdAt));
      console.log("\u2705 Pagamentos do profissional encontrados:", result.length);
      return result;
    } catch (error) {
      console.error("\u274C Erro ao buscar pagamentos do profissional:", error);
      throw error;
    }
  }
  async getProviderPaymentStats(professionalId) {
    try {
      console.log("\u{1F4CA} Calculando estat\xEDsticas de pagamento do profissional:", professionalId);
      const [totalEarningsResult] = await db.select({
        total: sql2`COALESCE(SUM(${paymentReferences.amount} * 0.95), 0)`
      }).from(paymentReferences).where(and(
        eq(paymentReferences.professionalId, professionalId),
        eq(paymentReferences.status, "approved")
      ));
      const [pendingResult] = await db.select({ count: sql2`COUNT(*)` }).from(paymentReferences).where(and(
        eq(paymentReferences.professionalId, professionalId),
        eq(paymentReferences.status, "pending")
      ));
      const [approvedResult] = await db.select({ count: sql2`COUNT(*)` }).from(paymentReferences).where(and(
        eq(paymentReferences.professionalId, professionalId),
        eq(paymentReferences.status, "approved")
      ));
      const currentMonth = /* @__PURE__ */ new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const [monthlyResult] = await db.select({
        total: sql2`COALESCE(SUM(${paymentReferences.amount} * 0.95), 0)`
      }).from(paymentReferences).where(and(
        eq(paymentReferences.professionalId, professionalId),
        eq(paymentReferences.status, "approved"),
        gte(paymentReferences.approvedAt, currentMonth)
      ));
      const stats = {
        totalEarnings: Number(totalEarningsResult?.total || 0),
        pendingPayments: Number(pendingResult?.count || 0),
        completedPayments: Number(approvedResult?.count || 0),
        monthlyEarnings: Number(monthlyResult?.total || 0)
      };
      console.log("\u2705 Estat\xEDsticas calculadas:", stats);
      return stats;
    } catch (error) {
      console.error("\u274C Erro ao calcular estat\xEDsticas de pagamento:", error);
      throw error;
    }
  }
  // ==================== PROVIDER APPOINTMENTS ====================
  async getServiceRequestsByProfessional(professionalId) {
    try {
      console.log("\u{1F4C5} Buscando service requests para profissional ID:", professionalId);
      const results = await db.select().from(serviceRequests).where(eq(serviceRequests.assignedProfessionalId, professionalId)).orderBy(desc(serviceRequests.createdAt));
      console.log("\u2705 Service requests encontrados:", results.length);
      return results;
    } catch (error) {
      console.error("\u274C Erro em getServiceRequestsByProfessional:", error);
      throw error;
    }
  }
  // ==================== COMPLETED SERVICES BY PROFESSIONAL ====================
  async getCompletedServicesByProfessional(professionalId) {
    try {
      console.log("\u{1F4CA} Buscando servi\xE7os conclu\xEDdos para profissional ID:", professionalId);
      const results = await db.select().from(serviceRequests).where(
        and(
          eq(serviceRequests.assignedProfessionalId, professionalId),
          eq(serviceRequests.status, "completed")
        )
      ).orderBy(desc(serviceRequests.updatedAt));
      console.log("\u2705 Servi\xE7os conclu\xEDdos encontrados:", results.length);
      return results;
    } catch (error) {
      console.error("\u274C Erro em getCompletedServicesByProfessional:", error);
      throw error;
    }
  }
  // ==================== PROVIDER PAYMENTS ====================
  async getPaymentsByProfessional(professionalId, filter = "all") {
    try {
      console.log("\u{1F4B3} Buscando pagamentos para profissional ID:", professionalId, "com filtro:", filter);
      let whereCondition = eq(serviceOffers.professionalId, professionalId);
      if (filter === "approved") {
        whereCondition = and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        );
      } else if (filter === "pending") {
        whereCondition = and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "accepted")
        );
      }
      const results = await db.select({
        id: serviceOffers.id,
        serviceRequestId: serviceOffers.serviceRequestId,
        professionalId: serviceOffers.professionalId,
        proposedPrice: serviceOffers.proposedPrice,
        finalPrice: serviceOffers.finalPrice,
        status: serviceOffers.status,
        createdAt: serviceOffers.createdAt,
        updatedAt: serviceOffers.updatedAt,
        serviceTitle: serviceRequests.serviceType,
        clientName: users.name,
        clientEmail: users.email
      }).from(serviceOffers).leftJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).leftJoin(users, eq(serviceRequests.clientId, users.id)).where(whereCondition).orderBy(desc(serviceOffers.updatedAt));
      console.log("\u2705 Pagamentos encontrados:", results.length);
      return results;
    } catch (error) {
      console.error("\u274C Erro em getPaymentsByProfessional:", error);
      throw error;
    }
  }
  async getPaymentStatsByProfessional(professionalId) {
    try {
      console.log("\u{1F4CA} Calculando estat\xEDsticas de pagamento para profissional ID:", professionalId);
      const totalOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(eq(serviceOffers.professionalId, professionalId));
      const completedOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const pendingOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "accepted")
        )
      );
      const totalEarnings = await db.select({ total: sql2`sum(${serviceOffers.finalPrice})` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const stats = {
        totalOffers: Number(totalOffers[0]?.count || 0),
        completedOffers: Number(completedOffers[0]?.count || 0),
        pendingOffers: Number(pendingOffers[0]?.count || 0),
        totalEarnings: Number(totalEarnings[0]?.total || 0)
      };
      console.log("\u2705 Estat\xEDsticas calculadas:", stats);
      return stats;
    } catch (error) {
      console.error("\u274C Erro em getPaymentStatsByProfessional:", error);
      throw error;
    }
  }
  // ==================== PROVIDER PROFILE ====================
  async getProviderProfile(professionalId) {
    try {
      console.log("\u{1F464} Buscando perfil completo do profissional ID:", professionalId);
      const userData = await db.select().from(users).where(eq(users.id, professionalId)).limit(1);
      if (userData.length === 0) {
        throw new Error("Profissional n\xE3o encontrado");
      }
      const user = userData[0];
      const professionalData = await db.select().from(professionals).where(eq(professionals.userId, professionalId)).limit(1);
      const professional = professionalData.length > 0 ? professionalData[0] : null;
      const totalOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(eq(serviceOffers.professionalId, professionalId));
      const completedOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const totalEarnings = await db.select({ total: sql2`sum(${serviceOffers.finalPrice})` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const reviews = await db.select({
        rating: serviceReviews.rating,
        comment: serviceReviews.comment,
        createdAt: serviceReviews.createdAt,
        clientName: users.name
      }).from(serviceReviews).leftJoin(users, eq(serviceReviews.clientId, users.id)).where(eq(serviceReviews.professionalId, professionalId)).orderBy(desc(serviceReviews.createdAt)).limit(10);
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
      const profileData = {
        ...user,
        ...professional,
        // Inclui dados do profissional (com campo 'available')
        stats: {
          totalOffers: Number(totalOffers[0]?.count || 0),
          completedOffers: Number(completedOffers[0]?.count || 0),
          totalEarnings: Number(totalEarnings[0]?.total || 0),
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length
        },
        recentReviews: reviews
      };
      console.log("\u2705 Perfil do profissional montado com sucesso");
      console.log("\u2705 Campo available:", professional?.available);
      return profileData;
    } catch (error) {
      console.error("\u274C Erro em getProviderProfile:", error);
      throw error;
    }
  }
  // ==================== PROVIDER DASHBOARD OVERVIEW ====================
  async getProviderDashboardData(professionalId) {
    try {
      console.log("\u{1F4CA} Buscando dados completos do dashboard para profissional ID:", professionalId);
      const userData = await db.select().from(users).where(eq(users.id, professionalId)).limit(1);
      if (userData.length === 0) {
        throw new Error("Profissional n\xE3o encontrado");
      }
      const user = userData[0];
      const totalOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(eq(serviceOffers.professionalId, professionalId));
      const acceptedOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "accepted")
        )
      );
      const completedOffers = await db.select({ count: sql2`count(*)` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const totalEarnings = await db.select({ total: sql2`sum(${serviceOffers.finalPrice})` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed")
        )
      );
      const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const monthlyEarnings = await db.select({ total: sql2`sum(${serviceOffers.finalPrice})` }).from(serviceOffers).where(
        and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, "completed"),
          sql2`EXTRACT(MONTH FROM ${serviceOffers.updatedAt}) = ${currentMonth}`,
          sql2`EXTRACT(YEAR FROM ${serviceOffers.updatedAt}) = ${currentYear}`
        )
      );
      const availableServices = await db.select({ count: sql2`count(*)` }).from(serviceRequests).where(eq(serviceRequests.status, "open"));
      const reviews = await db.select({
        rating: serviceReviews.rating,
        comment: serviceReviews.comment,
        createdAt: serviceReviews.createdAt,
        clientName: users.name
      }).from(serviceReviews).leftJoin(users, eq(serviceReviews.clientId, users.id)).where(eq(serviceReviews.professionalId, professionalId)).orderBy(desc(serviceReviews.createdAt)).limit(5);
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
      const recentOffers = await db.select({
        id: serviceOffers.id,
        proposedPrice: serviceOffers.proposedPrice,
        finalPrice: serviceOffers.finalPrice,
        status: serviceOffers.status,
        createdAt: serviceOffers.createdAt,
        serviceTitle: serviceRequests.serviceType,
        clientName: users.name
      }).from(serviceOffers).leftJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id)).leftJoin(users, eq(serviceRequests.clientId, users.id)).where(eq(serviceOffers.professionalId, professionalId)).orderBy(desc(serviceOffers.createdAt)).limit(5);
      const dashboardData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          userType: user.userType
        },
        stats: {
          totalOffers: Number(totalOffers[0]?.count || 0),
          acceptedOffers: Number(acceptedOffers[0]?.count || 0),
          completedOffers: Number(completedOffers[0]?.count || 0),
          totalEarnings: Number(totalEarnings[0]?.total || 0),
          monthlyEarnings: Number(monthlyEarnings[0]?.total || 0),
          availableServices: Number(availableServices[0]?.count || 0),
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length
        },
        recentActivity: {
          recentOffers,
          recentReviews: reviews
        }
      };
      console.log("\u2705 Dados do dashboard montados com sucesso");
      return dashboardData;
    } catch (error) {
      console.error("\u274C Erro em getProviderDashboardData:", error);
      throw error;
    }
  }
  // Helper function to create notifications for service events
  async createServiceNotification(type, serviceRequestId, clientId, professionalId) {
    try {
      const serviceRequest = await this.getServiceRequestById(serviceRequestId);
      const client = await this.getUserById(clientId);
      const professional = professionalId ? await this.getProfessionalById(professionalId) : null;
      let notificationData;
      switch (type) {
        case "service_requested":
          notificationData = {
            type: "info",
            title: "Nova Solicita\xE7\xE3o de Servi\xE7o",
            message: `Nova solicita\xE7\xE3o de ${serviceRequest?.serviceType} foi criada`,
            userId: professionalId || 0,
            actionUrl: "/provider-dashboard"
          };
          break;
        case "service_accepted":
          notificationData = {
            type: "success",
            title: "Servi\xE7o Aceito",
            message: `Sua solicita\xE7\xE3o de ${serviceRequest?.serviceType} foi aceita por um profissional`,
            userId: clientId,
            actionUrl: "/my-requests"
          };
          break;
        case "service_completed":
          notificationData = {
            type: "success",
            title: "Servi\xE7o Conclu\xEDdo",
            message: `O servi\xE7o de ${serviceRequest?.serviceType} foi conclu\xEDdo com sucesso`,
            userId: clientId,
            actionUrl: "/my-requests"
          };
          break;
        case "payment_received":
          notificationData = {
            type: "success",
            title: "Pagamento Recebido",
            message: `Pagamento de R$ ${serviceRequest?.budget} foi processado com sucesso`,
            userId: professionalId || 0,
            actionUrl: "/provider-dashboard"
          };
          break;
        case "new_offer":
          notificationData = {
            type: "info",
            title: "Nova Proposta Recebida",
            message: `Voc\xEA recebeu uma nova proposta para ${serviceRequest?.serviceType}`,
            userId: clientId,
            actionUrl: "/service-offer"
          };
          break;
        case "offer_accepted":
          notificationData = {
            type: "success",
            title: "Proposta Aceita",
            message: `Sua proposta para ${serviceRequest?.serviceType} foi aceita`,
            userId: professionalId || 0,
            actionUrl: "/provider-dashboard"
          };
          break;
        default:
          return;
      }
      await this.createNotification(notificationData);
    } catch (error) {
      console.error("\u274C Erro em createServiceNotification:", error);
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
    console.log("\u{1F510} VerifyToken - Verificando token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("\u2705 VerifyToken - Token v\xE1lido:", decoded);
    return decoded;
  } catch (error) {
    console.error("\u274C VerifyToken - Erro ao verificar token:", error);
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
  console.log("\u{1F510} ===== IN\xCDCIO DO MIDDLEWARE DE AUTENTICA\xC7\xC3O =====");
  console.log("\u{1F510} AuthenticateToken - Auth header:", authHeader ? "Presente" : "Ausente");
  console.log("\u{1F510} AuthenticateToken - Token:", token ? "Presente" : "Ausente");
  console.log("\u{1F510} AuthenticateToken - Token length:", token ? token.length : 0);
  console.log("\u{1F510} AuthenticateToken - URL da requisi\xE7\xE3o:", req.url);
  console.log("\u{1F510} AuthenticateToken - M\xE9todo:", req.method);
  if (!token) {
    console.log("\u274C AuthenticateToken - Token ausente");
    console.log("\u{1F510} ===== FIM DO MIDDLEWARE - TOKEN AUSENTE =====");
    return res.status(401).json({ message: "Token de acesso necess\xE1rio" });
  }
  try {
    console.log("\u{1F510} AuthenticateToken - Verificando token...");
    const decoded = verifyToken(token);
    console.log("\u{1F510} AuthenticateToken - Token decodificado:", decoded);
    console.log("\u{1F510} AuthenticateToken - Tipo do decoded:", typeof decoded);
    console.log("\u{1F510} AuthenticateToken - Keys do decoded:", decoded ? Object.keys(decoded) : "null");
    if (!decoded) {
      console.log("\u274C AuthenticateToken - Token inv\xE1lido (n\xE3o decodificado)");
      console.log("\u{1F510} ===== FIM DO MIDDLEWARE - TOKEN INV\xC1LIDO =====");
      return res.status(403).json({ message: "Token inv\xE1lido" });
    }
    const userId = decoded.userId || decoded.id;
    console.log("\u{1F510} AuthenticateToken - UserId extra\xEDdo:", userId);
    console.log("\u{1F510} AuthenticateToken - Tipo do userId:", typeof userId);
    console.log("\u{1F510} AuthenticateToken - userId \xE9 NaN?", isNaN(userId));
    if (!userId) {
      console.log("\u274C AuthenticateToken - UserId n\xE3o encontrado no token");
      console.log("\u{1F510} AuthenticateToken - decoded.userId:", decoded.userId);
      console.log("\u{1F510} AuthenticateToken - decoded.id:", decoded.id);
      console.log("\u{1F510} ===== FIM DO MIDDLEWARE - USERID N\xC3O ENCONTRADO =====");
      return res.status(400).json({ message: "ID da solicita\xE7\xE3o inv\xE1lido" });
    }
    console.log("\u{1F510} AuthenticateToken - Buscando usu\xE1rio no banco...");
    const user = await storage.getUser(userId);
    console.log("\u{1F510} AuthenticateToken - Usu\xE1rio encontrado:", user ? "Sim" : "N\xE3o");
    console.log("\u{1F510} AuthenticateToken - Dados do usu\xE1rio:", user ? { id: user.id, name: user.name, email: user.email, userType: user.userType } : "null");
    if (!user || user.isBlocked) {
      console.log("\u274C AuthenticateToken - Usu\xE1rio n\xE3o encontrado ou bloqueado");
      console.log("\u{1F510} ===== FIM DO MIDDLEWARE - USU\xC1RIO N\xC3O ENCONTRADO =====");
      return res.status(403).json({ message: "Usu\xE1rio n\xE3o encontrado ou bloqueado" });
    }
    console.log("\u2705 AuthenticateToken - Usu\xE1rio autenticado com sucesso:", user.id, user.name);
    req.user = user;
    console.log("\u{1F510} ===== FIM DO MIDDLEWARE - AUTENTICA\xC7\xC3O BEM-SUCEDIDA =====");
    next();
  } catch (error) {
    console.error("\u274C AuthenticateToken - Erro:", error);
    console.log("\u{1F510} ===== FIM DO MIDDLEWARE - ERRO =====");
    return res.status(403).json({ message: "Token inv\xE1lido" });
  }
};

// server/routes-simple.ts
import Stripe from "stripe";
console.log(`\u{1F527} Inicializando Stripe...`);
console.log(`\u{1F511} STRIPE_SECRET_KEY presente: ${process.env.STRIPE_SECRET_KEY ? "Sim" : "N\xE3o"}`);
console.log(`\u{1F511} STRIPE_SECRET_KEY in\xEDcio: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
var stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_placeholder") {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil"
  });
  console.log(`\u2705 Stripe inicializado com sucesso`);
} else {
  console.log(`\u26A0\uFE0F Stripe desabilitado - configure STRIPE_SECRET_KEY para habilitar pagamentos`);
}
function setupRoutes(app2, redisClient) {
  app2.get("/api/payment/config", (req, res) => {
    try {
      const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLIC_KEY;
      if (!publishableKey) {
        console.error("\u274C STRIPE_PUBLISHABLE_KEY n\xE3o configurada");
        return res.status(500).json({
          error: "Chave p\xFAblica do Stripe n\xE3o configurada. Defina STRIPE_PUBLISHABLE_KEY nas vari\xE1veis de ambiente."
        });
      }
      res.json({
        publishableKey
      });
    } catch (error) {
      console.error("\u274C Erro ao obter configura\xE7\xE3o do Stripe:", error);
      res.status(500).json({ error: "Erro interno ao obter configura\xE7\xE3o do Stripe" });
    }
  });
  app2.get("/api/payment/test-stripe", async (req, res) => {
    try {
      console.log(`\u{1F9EA} Testando Stripe...`);
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado",
          message: "Configure STRIPE_SECRET_KEY para habilitar pagamentos"
        });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500,
        // R$ 5,00 em centavos
        currency: "brl",
        payment_method_types: ["card", "boleto"],
        metadata: {
          test: "true"
        }
      });
      console.log(`\u2705 Payment Intent criado: ${paymentIntent.id}`);
      res.json({
        success: true,
        message: "Stripe funcionando corretamente",
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    } catch (error) {
      console.error(`\u274C Erro no teste do Stripe:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error
      });
    }
  });
  app2.get("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      console.log("\u{1F50D} GET /api/messages - Usu\xE1rio autenticado:", user.id, user.userType);
      const conversations2 = await storage.getConversationsByUser(user.id);
      console.log("\u{1F4CB} Conversas encontradas:", conversations2.length);
      const enrichedConversations = await Promise.all(conversations2.map(async (conv) => {
        const lastMessage = await storage.getLastMessageByConversation(conv.id);
        const unreadCount = await storage.getUnreadMessageCount(conv.id, user.id);
        if (user.userType === "provider") {
          const client = await storage.getUser(conv.clientId);
          return {
            id: conv.id,
            clientId: conv.clientId,
            clientName: client?.name || "Cliente",
            clientAvatar: client?.profileImage || "",
            professionalId: conv.professionalId,
            professionalName: user.name || "Profissional",
            professionalAvatar: user.profileImage || "",
            specialization: "",
            lastMessage: lastMessage?.content || "Nenhuma mensagem",
            lastMessageTime: lastMessage?.timestamp || conv.createdAt,
            unreadCount,
            isOnline: Math.random() > 0.5,
            rating: 5,
            location: client && client.city ? client.city : "",
            messages: await storage.getMessagesByConversation(conv.id)
          };
        }
        const professional = await storage.getProfessionalByUserId(conv.professionalId);
        return {
          id: conv.id,
          clientId: conv.clientId,
          professionalId: conv.professionalId,
          professionalName: professional?.name || "Profissional",
          professionalAvatar: professional?.imageUrl ? storage["getFullImageUrl"]?.(professional.imageUrl) ?? professional.imageUrl : "",
          specialization: professional?.specialization || "",
          lastMessage: lastMessage?.content || "Nenhuma mensagem",
          lastMessageTime: lastMessage?.timestamp || conv.createdAt,
          unreadCount,
          isOnline: Math.random() > 0.5,
          rating: Number(professional?.rating) || 5,
          location: professional?.location || "",
          messages: await storage.getMessagesByConversation(conv.id)
        };
      }));
      res.json(enrichedConversations);
    } catch (error) {
      console.error("\u274C Erro ao buscar conversas:", error);
      res.status(500).json({ message: "Erro interno ao buscar conversas" });
    }
  });
  app2.get("/api/messages/:conversationId", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user;
      const conversation = await storage.getMessagesByConversation(parseInt(conversationId));
      if (!conversation) {
        return res.status(404).json({ message: "Conversa n\xE3o encontrada" });
      }
      try {
        await storage.markMessagesAsRead?.(parseInt(conversationId), user.id);
      } catch (err) {
        console.warn("\u26A0\uFE0F N\xE3o foi poss\xEDvel marcar mensagens como lidas:", err);
      }
      res.json(conversation);
    } catch (error) {
      console.error("\u274C Erro ao buscar mensagens da conversa:", error);
      res.status(500).json({ message: "Erro interno ao buscar mensagens" });
    }
  });
  app2.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { recipientId, content, type, conversationId } = req.body;
      if (!recipientId || !content || !conversationId) {
        return res.status(400).json({ message: "Destinat\xE1rio, conversa e conte\xFAdo s\xE3o obrigat\xF3rios" });
      }
      const conversations2 = await storage.getConversationsByUser(user.id);
      const isParticipant = conversations2.some((conv) => conv.id === conversationId);
      if (!isParticipant) {
        const isDeletedByUser = await storage.isConversationDeletedByUser?.(conversationId, user.id);
        if (isDeletedByUser) {
          await storage.restoreConversation?.(conversationId, user.id);
        } else {
          return res.status(403).json({ message: "Acesso negado \xE0 conversa" });
        }
      }
      const isDeletedByRecipient = await storage.isConversationDeletedByUser?.(conversationId, recipientId);
      if (isDeletedByRecipient) {
        await storage.restoreConversation?.(conversationId, recipientId);
      }
      const message = await storage.createMessage({
        conversationId,
        senderId: user.id,
        recipientId,
        content,
        type: type || "text",
        isRead: false
      });
      res.status(201).json(message);
    } catch (error) {
      console.error("\u274C Erro ao enviar mensagem:", error);
      res.status(500).json({ message: "Erro interno ao enviar mensagem" });
    }
  });
  app2.post("/api/messages/start-conversation", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { professionalId, message } = req.body;
      console.log("\u{1F50D} Iniciando conversa:", {
        userId: user.id,
        professionalId,
        message: message?.substring(0, 50)
      });
      const professional = await storage.getProfessionalByUserId(professionalId);
      console.log("\u{1F464} Profissional encontrado:", professional ? {
        id: professional.id,
        userId: professional.userId,
        name: professional.name
      } : "null");
      if (!professional) {
        console.warn("\u26A0\uFE0F Profissional n\xE3o encontrado para userId:", professionalId);
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const existingConversation = await storage.getConversation(user.id, professionalId);
      let conversationId;
      if (existingConversation) {
        const isDeletedByUser = await storage.isConversationDeletedByUser?.(existingConversation.id, user.id);
        if (isDeletedByUser) {
          await storage.restoreConversation?.(existingConversation.id, user.id);
        }
        const isDeletedByProfessional = await storage.isConversationDeletedByUser?.(existingConversation.id, professionalId);
        if (isDeletedByProfessional) {
          await storage.restoreConversation?.(existingConversation.id, professionalId);
        }
        conversationId = existingConversation.id;
      } else {
        const conversation = await storage.createConversation({
          clientId: user.id,
          professionalId
        });
        conversationId = conversation.id;
      }
      const newMessage = await storage.createMessage({
        conversationId,
        senderId: user.id,
        recipientId: professionalId,
        content: message || "Ol\xE1! Gostaria de conversar sobre seus servi\xE7os.",
        type: "text",
        isRead: false
      });
      res.status(201).json({ conversationId, message: newMessage });
    } catch (error) {
      console.error("\u274C Erro ao iniciar conversa:", error);
      res.status(500).json({ message: "Erro interno ao iniciar conversa" });
    }
  });
  app2.delete("/api/messages/conversation/:conversationId", authenticateToken, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const user = req.user;
      await storage.deleteConversation?.(parseInt(conversationId), user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("\u274C Erro ao excluir conversa:", error);
      res.status(500).json({ message: "Erro interno ao excluir conversa" });
    }
  });
  app2.get("/api/payment/test-db", async (req, res) => {
    try {
      console.log(`\u{1F9EA} Testando banco de dados...`);
      const offers = await storage.getServiceOffersForClient(21);
      console.log(`\u{1F4CB} Total de propostas encontradas: ${offers.length}`);
      if (offers.length > 0) {
        const firstOffer = offers[0];
        console.log(`\u{1F4CB} Primeira proposta:`, {
          id: firstOffer.id,
          proposedPrice: firstOffer.proposedPrice,
          finalPrice: firstOffer.finalPrice,
          status: firstOffer.status
        });
      }
      res.json({
        success: true,
        message: "Banco de dados funcionando",
        totalOffers: offers.length,
        firstOffer: offers.length > 0 ? offers[0] : null
      });
    } catch (error) {
      console.error(`\u274C Erro no teste do banco:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error
      });
    }
  });
  app2.post("/api/stripe/connect/create-account", authenticateToken, async (req, res) => {
    try {
      console.log("\u{1F537} Criando conta Stripe Connect...");
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ error: "Apenas profissionais podem conectar Stripe" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      if (professional.stripeAccountId && professional.stripeOnboardingCompleted) {
        return res.status(400).json({
          error: "Voc\xEA j\xE1 tem uma conta Stripe conectada",
          accountId: professional.stripeAccountId
        });
      }
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado",
          message: "Configure STRIPE_SECRET_KEY para habilitar Stripe Connect"
        });
      }
      console.log("\u{1F4DD} Criando conta Express para:", user.email);
      const account = await stripe.accounts.create({
        type: "express",
        country: "BR",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: "individual",
        metadata: {
          professionalId: professional.id.toString(),
          userId: user.id.toString(),
          platform: "lifebee"
        }
      });
      console.log("\u2705 Conta criada:", account.id);
      await storage.updateProfessionalStripeAccount(professional.id, {
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
        stripeOnboardingCompleted: false
      });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=success`,
        type: "account_onboarding"
      });
      console.log("\u2705 Link de onboarding criado");
      res.json({
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url
      });
    } catch (error) {
      console.error("\u274C Erro ao criar conta Connect:", error);
      res.status(500).json({
        error: "Erro ao criar conta Stripe Connect",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });
  app2.get("/api/stripe/connect/account-status", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ error: "Apenas profissionais" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      if (!professional.stripeAccountId) {
        return res.json({
          connected: false,
          needsOnboarding: true
        });
      }
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado"
        });
      }
      const account = await stripe.accounts.retrieve(professional.stripeAccountId);
      console.log("\u{1F4CA} Status da conta:", {
        id: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      });
      await storage.updateProfessionalStripeAccount(professional.id, {
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingCompleted: account.details_submitted,
        stripeAccountStatus: account.charges_enabled ? "active" : "pending"
      });
      res.json({
        connected: true,
        accountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        needsOnboarding: !account.details_submitted
      });
    } catch (error) {
      console.error("\u274C Erro ao verificar status:", error);
      res.status(500).json({ error: "Erro ao verificar status da conta" });
    }
  });
  app2.post("/api/stripe/connect/refresh-onboarding", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ error: "Apenas profissionais" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({ error: "Conta Stripe n\xE3o encontrada" });
      }
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado"
        });
      }
      const accountLink = await stripe.accountLinks.create({
        account: professional.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings?stripe_setup=success`,
        type: "account_onboarding"
      });
      res.json({
        success: true,
        onboardingUrl: accountLink.url
      });
    } catch (error) {
      console.error("\u274C Erro ao criar link:", error);
      res.status(500).json({ error: "Erro ao criar link de onboarding" });
    }
  });
  app2.post("/api/stripe/connect/dashboard-link", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ error: "Apenas profissionais" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional || !professional.stripeAccountId) {
        return res.status(404).json({ error: "Conta Stripe n\xE3o encontrada" });
      }
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado"
        });
      }
      const loginLink = await stripe.accounts.createLoginLink(professional.stripeAccountId);
      res.json({
        success: true,
        dashboardUrl: loginLink.url
      });
    } catch (error) {
      console.error("\u274C Erro ao criar dashboard link:", error);
      res.status(500).json({ error: "Erro ao criar link do dashboard" });
    }
  });
  app2.post("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (!stripe) {
      return res.status(503).json({
        error: "Stripe n\xE3o configurado",
        message: "Configure STRIPE_SECRET_KEY para habilitar webhooks"
      });
    }
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("\u274C Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("\u{1F514} Webhook recebido:", event.type);
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("\u2705 Pagamento aprovado:", paymentIntent.id);
        try {
          const serviceOfferId = paymentIntent.metadata.serviceOfferId;
          const professionalId = paymentIntent.metadata.professionalId;
          const clientId = paymentIntent.metadata.clientId;
          if (serviceOfferId) {
            const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
            if (!serviceOffer) {
              console.log("\u274C Proposta n\xE3o encontrada:", serviceOfferId);
              return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
            }
            const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
            if (!serviceRequest) {
              console.log("\u274C Servi\xE7o n\xE3o encontrado:", serviceOffer.serviceRequestId);
              return res.status(404).json({ error: "Servi\xE7o n\xE3o encontrado" });
            }
            await storage.updateServiceOfferStatus(parseInt(serviceOfferId), "completed");
            console.log("\u2705 Proposta marcada como conclu\xEDda");
            if (serviceRequest.status !== "completed") {
              await storage.updateServiceRequestStatus(serviceRequest.id, "completed");
              console.log("\u2705 Servi\xE7o marcado como conclu\xEDdo automaticamente");
            }
            await storage.createNotification({
              userId: parseInt(professionalId),
              type: "payment_received",
              title: "Pagamento Recebido! \u{1F4B0}",
              message: `Seu pagamento de R$ ${(paymentIntent.amount / 100).toFixed(2)} foi aprovado. O servi\xE7o est\xE1 conclu\xEDdo!`
            });
            await storage.createNotification({
              userId: parseInt(clientId),
              type: "payment_success",
              title: "Servi\xE7o Conclu\xEDdo! \u2705",
              message: "Seu pagamento foi processado com sucesso. O servi\xE7o est\xE1 conclu\xEDdo e o profissional foi notificado."
            });
            console.log("\u2705 Status atualizado e notifica\xE7\xF5es enviadas");
          }
        } catch (error) {
          console.error("\u274C Erro ao processar pagamento aprovado:", error);
        }
        break;
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("\u274C Pagamento falhou:", failedPayment.id);
        try {
          const serviceOfferId = failedPayment.metadata.serviceOfferId;
          const clientId = failedPayment.metadata.clientId;
          if (serviceOfferId && clientId) {
            await storage.createNotification({
              userId: parseInt(clientId),
              type: "payment_failed",
              title: "Pagamento Falhou \u274C",
              message: "N\xE3o foi poss\xEDvel processar seu pagamento. Tente novamente."
            });
          }
        } catch (error) {
          console.error("\u274C Erro ao processar pagamento falhado:", error);
        }
        break;
      default:
        console.log(`\u{1F514} Evento n\xE3o tratado: ${event.type}`);
    }
    res.json({ received: true });
  });
  app2.post("/api/payment/update-status", authenticateToken, async (req, res) => {
    try {
      console.log("\u{1F504} Atualizando status do pagamento...");
      console.log("\u{1F4DD} Request body:", JSON.stringify(req.body, null, 2));
      console.log("\u{1F464} User from token:", req.user);
      const { serviceOfferId, paymentIntentId, amount } = req.body;
      if (!serviceOfferId) {
        return res.status(400).json({ error: "serviceOfferId \xE9 obrigat\xF3rio" });
      }
      console.log(`\u{1F50D} Buscando proposta ID: ${serviceOfferId}`);
      const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
      console.log(`\u{1F4CB} Proposta encontrada:`, serviceOffer ? "Sim" : "N\xE3o");
      if (!serviceOffer) {
        console.log("\u274C Proposta n\xE3o encontrada");
        return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
      }
      console.log(`\u{1F50D} Buscando service request ID: ${serviceOffer.serviceRequestId}`);
      const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
      console.log(`\u{1F4CB} Service request encontrado:`, serviceRequest ? "Sim" : "N\xE3o");
      console.log(`\u{1F50D} Buscando professional ID: ${serviceOffer.professionalId}`);
      const professional = await storage.getProfessionalById(serviceOffer.professionalId);
      console.log(`\u{1F4CB} Professional encontrado:`, professional ? "Sim" : "N\xE3o");
      if (!serviceRequest || !professional) {
        console.log("\u274C Dados relacionados n\xE3o encontrados");
        return res.status(404).json({ error: "Dados relacionados n\xE3o encontrados" });
      }
      await storage.updateServiceOfferStatus(parseInt(serviceOfferId), "completed");
      console.log("\u2705 Status atualizado para conclu\xEDda");
      if (serviceRequest.status !== "completed") {
        await storage.updateServiceRequestStatus(serviceRequest.id, "completed");
        console.log("\u2705 Solicita\xE7\xE3o de servi\xE7o marcada como conclu\xEDda");
      }
      console.log(`\u{1F514} Criando notifica\xE7\xE3o para profissional ID: ${serviceOffer.professionalId}`);
      await storage.createNotification({
        userId: serviceOffer.professionalId,
        type: "payment_received",
        title: "Pagamento Recebido! \u{1F4B0}",
        message: `Seu pagamento de R$ ${(amount / 100).toFixed(2)} foi aprovado. O servi\xE7o est\xE1 conclu\xEDdo!`
      });
      console.log("\u2705 Notifica\xE7\xE3o enviada para o profissional");
      console.log(`\u{1F514} Criando notifica\xE7\xE3o para cliente ID: ${serviceRequest.clientId}`);
      await storage.createNotification({
        userId: serviceRequest.clientId,
        type: "payment_success",
        title: "Servi\xE7o Conclu\xEDdo! \u2705",
        message: "Seu pagamento foi processado com sucesso. O servi\xE7o est\xE1 conclu\xEDdo e o profissional foi notificado."
      });
      console.log("\u2705 Notifica\xE7\xE3o enviada para o cliente");
      console.log("\u2705 Processo conclu\xEDdo com sucesso");
      res.json({
        success: true,
        message: "Status atualizado e notifica\xE7\xF5es enviadas",
        serviceOfferId: parseInt(serviceOfferId),
        status: "completed"
      });
    } catch (error) {
      console.error("\u274C Erro ao atualizar status do pagamento:", error);
      console.error("\u274C Stack trace:", error.stack);
      console.error("\u274C Error name:", error.name);
      console.error("\u274C Error message:", error.message);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : void 0
      });
    }
  });
  app2.get("/api/payment/status/:serviceOfferId", authenticateToken, async (req, res) => {
    try {
      const { serviceOfferId } = req.params;
      const serviceOffer = await storage.getServiceOfferById(parseInt(serviceOfferId));
      if (!serviceOffer) {
        return res.status(404).json({ error: "Proposta n\xE3o encontrada" });
      }
      res.json({
        serviceOfferId: serviceOffer.id,
        status: serviceOffer.status,
        isPaid: serviceOffer.status === "completed"
      });
    } catch (error) {
      console.error("\u274C Erro ao verificar status do pagamento:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  app2.post("/api/payment/create-intent", authenticateToken, async (req, res) => {
    try {
      console.log("\u{1F50D} Iniciando cria\xE7\xE3o de Payment Intent");
      console.log("\u{1F4DD} Request body:", JSON.stringify(req.body, null, 2));
      console.log("\u{1F464} User from token:", req.user);
      const { serviceOfferId } = req.body;
      if (!serviceOfferId) {
        return res.status(400).json({ error: "serviceOfferId \xE9 obrigat\xF3rio" });
      }
      console.log(`\u{1F50D} Buscando proposta ID: ${serviceOfferId}`);
      const serviceOffer = await storage.getServiceOfferById(serviceOfferId);
      console.log(`\u{1F4CB} Proposta encontrada:`, serviceOffer ? "Sim" : "N\xE3o");
      if (serviceOffer) {
        console.log(`\u{1F4CB} Dados da proposta:`, {
          id: serviceOffer.id,
          proposedPrice: serviceOffer.proposedPrice,
          finalPrice: serviceOffer.finalPrice,
          status: serviceOffer.status
        });
      }
      if (!serviceOffer) {
        return res.status(404).json({ error: "Oferta de servi\xE7o n\xE3o encontrada" });
      }
      const serviceRequest = await storage.getServiceRequestById(serviceOffer.serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: "Solicita\xE7\xE3o de servi\xE7o n\xE3o encontrada" });
      }
      const professional = await storage.getProfessionalById(serviceOffer.professionalId);
      if (!professional) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      const skipStripeValidation = process.env.SKIP_STRIPE_VALIDATION === "true";
      if (!skipStripeValidation) {
        if (!professional.stripeAccountId) {
          console.log("\u26A0\uFE0F Profissional n\xE3o tem conta Stripe Connect");
          return res.status(400).json({
            error: "Profissional precisa conectar sua conta Stripe primeiro",
            errorCode: "STRIPE_NOT_CONNECTED",
            needsStripeSetup: true
          });
        }
        if (!professional.stripeChargesEnabled) {
          console.log("\u26A0\uFE0F Profissional n\xE3o pode receber pagamentos ainda");
          return res.status(400).json({
            error: "Profissional ainda n\xE3o completou configura\xE7\xE3o do Stripe",
            errorCode: "STRIPE_NOT_ENABLED",
            needsStripeSetup: true
          });
        }
      } else {
        console.log("\u{1F527} MODO DEV: Valida\xE7\xE3o de Stripe Connect desabilitada");
      }
      const rawPrice = serviceOffer.finalPrice || serviceOffer.proposedPrice;
      if (!rawPrice || isNaN(parseFloat(rawPrice))) {
        return res.status(400).json({ error: "Pre\xE7o inv\xE1lido na oferta de servi\xE7o" });
      }
      const amount = parseFloat(rawPrice);
      const minimumAmount = 5;
      const finalAmount = Math.max(amount, minimumAmount);
      const lifebeeCommissionPercent = 0.05;
      const lifebeeCommission = Math.round(finalAmount * 100 * lifebeeCommissionPercent);
      const professionalAmount = Math.round(finalAmount * 100) - lifebeeCommission;
      console.log(`\u{1F4B0} Valor original: R$ ${amount.toFixed(2)}`);
      console.log(`\u{1F4B0} Valor final (m\xEDnimo R$ 5,00): R$ ${finalAmount.toFixed(2)}`);
      console.log(`\u{1F4B0} LifeBee (5%): R$ ${(lifebeeCommission / 100).toFixed(2)}`);
      console.log(`\u{1F4B0} Profissional (95%): R$ ${(professionalAmount / 100).toFixed(2)}`);
      console.log(`\u{1F511} Stripe Secret Key presente: ${process.env.STRIPE_SECRET_KEY ? "Sim" : "N\xE3o"}`);
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe n\xE3o configurado",
          message: "Configure STRIPE_SECRET_KEY para habilitar pagamentos"
        });
      }
      const useStripeConnect = !skipStripeValidation && professional.stripeAccountId;
      if (useStripeConnect) {
        console.log(`\u{1F680} Criando Payment Intent com Connect...`);
        console.log(`   Conta destino: ${professional.stripeAccountId}`);
      } else {
        console.log(`\u{1F527} Criando Payment Intent SEM Connect (modo dev)...`);
        console.log(`   \u26A0\uFE0F TODO o valor vai para a conta principal`);
      }
      const paymentIntentParams = {
        amount: Math.round(finalAmount * 100),
        currency: "brl",
        payment_method_types: ["card"],
        metadata: {
          serviceOfferId: serviceOffer.id.toString(),
          serviceRequestId: serviceOffer.serviceRequestId.toString(),
          clientId: serviceRequest.clientId.toString(),
          professionalId: serviceOffer.professionalId.toString(),
          lifebeeCommission: (lifebeeCommission / 100).toFixed(2),
          professionalAmount: (professionalAmount / 100).toFixed(2)
        }
      };
      if (useStripeConnect) {
        paymentIntentParams.application_fee_amount = lifebeeCommission;
        paymentIntentParams.transfer_data = {
          destination: professional.stripeAccountId
        };
      }
      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      const paymentReference = await storage.createPaymentReference({
        serviceRequestId: serviceOffer.serviceRequestId,
        serviceOfferId: serviceOffer.id,
        clientId: serviceRequest.clientId,
        professionalId: serviceOffer.professionalId,
        amount: amount.toFixed(2),
        preferenceId: paymentIntent.id,
        // Using Payment Intent ID as preferenceId
        status: "pending",
        externalReference: paymentIntent.id
      });
      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentReferenceId: paymentReference.id
      });
    } catch (error) {
      console.error("\u274C Erro ao criar Payment Intent:", error);
      res.status(500).json({
        error: "Erro ao criar Payment Intent",
        details: error.message
      });
    }
  });
  app2.get("/api/payment/test-config", (req, res) => {
    res.json({
      success: true,
      config: {
        hasKey: !!process.env.STRIPE_SECRET_KEY,
        keyLength: process.env.STRIPE_SECRET_KEY?.length || 0,
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
        backendUrl: process.env.BACKEND_URL || "http://localhost:8080"
      },
      message: "Configura\xE7\xE3o verificada com sucesso"
    });
  });
  app2.post("/api/service/:id/complete", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const serviceRequestId = parseInt(req.params.id);
      console.log("\u{1F537} Profissional marcando servi\xE7o como conclu\xEDdo:", {
        userId: user.id,
        userType: user.userType,
        serviceRequestId
      });
      if (user.userType !== "provider") {
        return res.status(403).json({ error: "Apenas profissionais podem marcar servi\xE7os como conclu\xEDdos" });
      }
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: "Servi\xE7o n\xE3o encontrado" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      const offers = await storage.getServiceOffersByRequest(serviceRequestId);
      const acceptedOffer = offers.find(
        (offer) => offer.professionalId === professional.id && offer.status === "accepted"
      );
      if (!acceptedOffer) {
        return res.status(403).json({
          error: "Voc\xEA n\xE3o tem permiss\xE3o para marcar este servi\xE7o como conclu\xEDdo"
        });
      }
      await storage.updateServiceRequestStatus(serviceRequestId, "awaiting_confirmation");
      console.log("\u2705 Servi\xE7o marcado como aguardando confirma\xE7\xE3o do cliente");
      await storage.createNotification({
        userId: serviceRequest.clientId,
        type: "service_completed",
        title: "Servi\xE7o Conclu\xEDdo! \u{1F389}",
        message: `O profissional ${professional.name} marcou o servi\xE7o "${serviceRequest.title}" como conclu\xEDdo. Por favor, confirme a conclus\xE3o.`
      });
      res.json({
        success: true,
        message: "Servi\xE7o marcado como conclu\xEDdo. Aguardando confirma\xE7\xE3o do cliente."
      });
    } catch (error) {
      console.error("\u274C Erro ao marcar servi\xE7o como conclu\xEDdo:", error);
      res.status(500).json({ error: "Erro ao marcar servi\xE7o como conclu\xEDdo" });
    }
  });
  app2.post("/api/service/:id/confirm", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const serviceRequestId = parseInt(req.params.id);
      console.log("\u{1F537} Cliente confirmando conclus\xE3o do servi\xE7o:", {
        userId: user.id,
        userType: user.userType,
        serviceRequestId
      });
      if (user.userType !== "client") {
        return res.status(403).json({ error: "Apenas clientes podem confirmar conclus\xE3o de servi\xE7os" });
      }
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      if (!serviceRequest) {
        return res.status(404).json({ error: "Servi\xE7o n\xE3o encontrado" });
      }
      if (serviceRequest.clientId !== user.id) {
        return res.status(403).json({ error: "Voc\xEA n\xE3o tem permiss\xE3o para confirmar este servi\xE7o" });
      }
      if (serviceRequest.status !== "awaiting_confirmation") {
        return res.status(400).json({
          error: "Este servi\xE7o n\xE3o est\xE1 aguardando confirma\xE7\xE3o",
          currentStatus: serviceRequest.status
        });
      }
      const offers = await storage.getServiceOffersByRequest(serviceRequestId);
      const acceptedOffer = offers.find((offer) => offer.status === "accepted");
      if (!acceptedOffer) {
        return res.status(404).json({ error: "Proposta aceita n\xE3o encontrada" });
      }
      const professional = await storage.getProfessionalById(acceptedOffer.professionalId);
      if (!professional) {
        return res.status(404).json({ error: "Profissional n\xE3o encontrado" });
      }
      await storage.updateServiceRequestStatus(serviceRequestId, "completed");
      await storage.updateServiceOfferStatus(acceptedOffer.id, "completed");
      console.log("\u2705 Servi\xE7o confirmado como conclu\xEDdo pelo cliente");
      await storage.createNotification({
        userId: professional.userId,
        type: "service_confirmed",
        title: "Servi\xE7o Confirmado! \u2705",
        message: `O cliente confirmou a conclus\xE3o do servi\xE7o "${serviceRequest.title}". O pagamento ser\xE1 liberado.`
      });
      const existingReview = await storage.getServiceReviewByServiceRequest(serviceRequestId);
      res.json({
        success: true,
        message: "Servi\xE7o confirmado como conclu\xEDdo.",
        requiresReview: !existingReview
        // Indica se precisa avaliar
      });
    } catch (error) {
      console.error("\u274C Erro ao confirmar conclus\xE3o do servi\xE7o:", error);
      res.status(500).json({ error: "Erro ao confirmar conclus\xE3o do servi\xE7o" });
    }
  });
  app2.get("/api/service-requests/client", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const serviceRequests2 = await storage.getServiceRequestsByClient(user.id);
      res.json(serviceRequests2);
    } catch (error) {
      console.error("\u274C Erro ao buscar solicita\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-offers/client", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const serviceOffers2 = await storage.getServiceOffersForClient(user.id);
      res.json(serviceOffers2);
    } catch (error) {
      console.error("\u274C Erro ao buscar propostas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/user", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const fullUser = await storage.getUser(user.id);
      if (!fullUser) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json(fullUser);
    } catch (error) {
      console.error("\u274C Erro ao buscar usu\xE1rio:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/professionals", async (req, res) => {
    try {
      const professionals2 = await storage.getAllProfessionals();
      res.json(professionals2);
    } catch (error) {
      console.error("\u274C Erro ao buscar profissionais:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/professionals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const professional = await storage.getProfessional(parseInt(id));
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      res.json(professional);
    } catch (error) {
      console.error("\u274C Erro ao buscar profissional:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/professionals/:id/proposals", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const professionalUserId = parseInt(req.params.id);
      if (isNaN(professionalUserId)) {
        return res.status(400).json({ message: "ID do profissional inv\xE1lido" });
      }
      if (user.userType !== "provider" || user.id !== professionalUserId) {
        return res.status(403).json({ message: "Acesso negado \xE0s propostas" });
      }
      const professional = await storage.getProfessionalByUserId(professionalUserId);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      console.log("\u{1F4CB} Buscando propostas para professional.id:", professional.id);
      const proposals = await storage.getProposalsByProfessional(professional.id);
      console.log("\u2705 Propostas encontradas:", proposals.length);
      res.json(proposals);
    } catch (error) {
      console.error("\u274C Erro ao buscar propostas do profissional:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-requests", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const requestData = { ...req.body };
      if (requestData.scheduledDate && typeof requestData.scheduledDate === "string") {
        if (requestData.scheduledTime) {
          requestData.scheduledDate = /* @__PURE__ */ new Date(`${requestData.scheduledDate}T${requestData.scheduledTime}`);
        } else {
          requestData.scheduledDate = new Date(requestData.scheduledDate);
        }
      }
      const serviceRequest = await storage.createServiceRequest({
        ...requestData,
        clientId: user.id
      });
      try {
        console.log("\u{1F4E2} Tentando criar notifica\xE7\xE3o:", {
          type: "success",
          title: "Solicita\xE7\xE3o Criada",
          userId: user.id
        });
        await storage.createNotification({
          type: "success",
          title: "Solicita\xE7\xE3o Criada",
          message: `Sua solicita\xE7\xE3o de ${requestData.serviceType} foi criada com sucesso`,
          userId: user.id,
          actionUrl: "/my-requests"
        });
        console.log("\u2705 Notifica\xE7\xE3o criada com sucesso");
      } catch (notificationError) {
        console.error("\u26A0\uFE0F Erro ao criar notifica\xE7\xE3o (n\xE3o cr\xEDtico):", notificationError.message);
        console.error("Stack:", notificationError.stack);
      }
      res.json({ success: true, message: "Solicita\xE7\xE3o criada com sucesso", data: serviceRequest });
    } catch (error) {
      console.error("\u274C Erro ao criar solicita\xE7\xE3o:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/professional", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "professional") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const proposals = await storage.getProposalsByProfessional(professional.id);
      res.json(proposals);
    } catch (error) {
      console.error("\u274C Erro ao buscar solicita\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-offers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "professional") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const serviceOffer = await storage.createServiceOffer({
        ...req.body,
        professionalId: professional.id
      });
      const serviceRequest = await storage.getServiceRequestById(req.body.serviceRequestId);
      if (serviceRequest) {
        await storage.createNotification({
          type: "info",
          title: "Nova Proposta Recebida",
          message: `Voc\xEA recebeu uma nova proposta para ${serviceRequest.serviceType}`,
          userId: serviceRequest.clientId,
          actionUrl: "/service-offer"
        });
      }
      res.json({ success: true, message: "Proposta criada com sucesso", data: serviceOffer });
    } catch (error) {
      console.error("\u274C Erro ao criar proposta:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-offers/professional", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "professional") {
        return res.status(403).json({ message: "Acesso negado" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const proposals = await storage.getProposalsByProfessional(professional.id);
      res.json(proposals);
    } catch (error) {
      console.error("\u274C Erro ao buscar propostas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-offers/:id/accept", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await storage.acceptServiceOffer(parseInt(id), user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Erro ao aceitar proposta" });
      }
      const offer = await storage.getServiceOfferById(parseInt(id));
      if (offer) {
        try {
          await storage.createNotification({
            type: "success",
            title: "Proposta Aceita",
            message: `Sua proposta foi aceita pelo cliente`,
            userId: offer.professionalId,
            actionUrl: "/provider-dashboard"
          });
          await storage.createNotification({
            type: "success",
            title: "Proposta Aceita",
            message: `Voc\xEA aceitou a proposta do profissional`,
            userId: user.id,
            actionUrl: "/my-requests"
          });
        } catch (notifError) {
          console.error("\u26A0\uFE0F Erro ao criar notifica\xE7\xF5es (n\xE3o cr\xEDtico):", notifError);
        }
      }
      res.json({ success: true, message: "Proposta aceita com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao aceitar proposta:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/service-offers/:id/reject", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await storage.rejectServiceOffer(parseInt(id), user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.error || "Erro ao rejeitar proposta" });
      }
      const offer = await storage.getServiceOfferById(parseInt(id));
      if (offer) {
        try {
          await storage.createNotification({
            type: "info",
            title: "Proposta Rejeitada",
            message: `Sua proposta foi rejeitada pelo cliente`,
            userId: offer.professionalId,
            actionUrl: "/provider-dashboard"
          });
        } catch (notifError) {
          console.error("\u26A0\uFE0F Erro ao criar notifica\xE7\xF5es (n\xE3o cr\xEDtico):", notifError);
        }
      }
      res.json({ success: true, message: "Proposta rejeitada com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao rejeitar proposta:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const notifications2 = await storage.getNotificationsByUser(user.id);
      res.json(notifications2);
    } catch (error) {
      console.error("\u274C Erro ao buscar notifica\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationRead(parseInt(id));
      res.json({ success: true, message: "Notifica\xE7\xE3o marcada como lida" });
    } catch (error) {
      console.error("\u274C Erro ao marcar notifica\xE7\xE3o:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/profile", async (req, res) => {
    try {
      res.json({ success: true, message: "Perfil atualizado com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao atualizar perfil:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { name, email, phone, address } = req.body;
      console.log("\u{1F504} Atualizando perfil do usu\xE1rio:", user.id);
      console.log("\u{1F4DD} Dados recebidos:", { name, email, phone, address });
      await storage.updateUser(user.id, {
        name,
        email,
        phone,
        address
      });
      console.log("\u2705 Perfil atualizado com sucesso");
      const updatedUser = await storage.getUser(user.id);
      res.json({
        success: true,
        message: "Perfil atualizado com sucesso",
        user: updatedUser
      });
    } catch (error) {
      console.error("\u274C Erro ao atualizar perfil:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/profile/upload", async (req, res) => {
    try {
      res.json({ success: true, message: "Imagem enviada com sucesso" });
    } catch (error) {
      console.error("\u274C Erro ao enviar imagem:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/user/upload-image", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      console.log("\u{1F4F8} Upload de imagem para usu\xE1rio:", user.id);
      res.json({
        success: true,
        message: "Imagem enviada com sucesso",
        profileImage: "/uploads/default-avatar.png"
        // Placeholder
      });
    } catch (error) {
      console.error("\u274C Erro ao enviar imagem:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Nome de usu\xE1rio e senha s\xE3o obrigat\xF3rios" });
      }
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      if (user.isBlocked) {
        return res.status(401).json({ message: "Conta bloqueada" });
      }
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
      }
      const token = generateToken(user);
      res.json({
        message: "Login realizado com sucesso",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
          phone: user.phone,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error("\u274C Erro no login:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, name, phone, userType } = req.body;
      if (!username || !email || !password || !name) {
        return res.status(400).json({ message: "Todos os campos s\xE3o obrigat\xF3rios" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usu\xE1rio j\xE1 existe" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email j\xE1 existe" });
      }
      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        name,
        phone: phone || null,
        userType: userType || "client"
      });
      const token = generateToken(user);
      res.json({
        message: "Conta criada com sucesso",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          isVerified: user.isVerified,
          phoneVerified: user.phoneVerified,
          phone: user.phone,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error("\u274C Erro no registro:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const requestId = parseInt(id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const serviceRequest = await storage.getServiceRequestById(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o de servi\xE7o n\xE3o encontrada" });
      }
      const client = await storage.getUser(serviceRequest.clientId);
      const serviceDataWithClient = {
        ...serviceRequest,
        clientName: client?.name || "Cliente",
        clientProfileImage: client?.profileImage || "",
        clientPhone: client?.phone || "",
        clientEmail: client?.email || ""
      };
      res.json(serviceDataWithClient);
    } catch (error) {
      console.error("\u274C Erro ao buscar solicita\xE7\xE3o de servi\xE7o:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/:id/offers", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const offers = await storage.getServiceOffers(parseInt(id));
      res.json(offers);
    } catch (error) {
      console.error("\u274C Erro ao buscar propostas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/service-requests/:id/offers", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const serviceRequestId = parseInt(id);
      console.log("\u{1F464} Usu\xE1rio tentando criar proposta:", {
        id: user.id,
        name: user.name,
        userType: user.userType,
        isProvider: user.userType === "provider"
      });
      if (user.userType !== "provider") {
        console.log("\u274C Acesso negado - userType:", user.userType);
        return res.status(403).json({ message: "Acesso negado - apenas prestadores podem criar propostas" });
      }
      if (isNaN(serviceRequestId)) {
        return res.status(400).json({ message: "ID da solicita\xE7\xE3o inv\xE1lido" });
      }
      const professional = await storage.getProfessionalByUserId(user.id);
      if (!professional) {
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      const serviceRequest = await storage.getServiceRequestById(serviceRequestId);
      console.log("\u{1F4CB} Solicita\xE7\xE3o encontrada:", {
        id: serviceRequest?.id,
        serviceType: serviceRequest?.serviceType,
        clientId: serviceRequest?.clientId
      });
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o de servi\xE7o n\xE3o encontrada" });
      }
      const serviceOffer = await storage.createServiceOffer({
        serviceRequestId,
        professionalId: professional.id,
        proposedPrice: req.body.proposedPrice,
        estimatedTime: req.body.estimatedTime,
        message: req.body.message,
        status: "pending"
      });
      console.log("\u2705 Proposta criada com sucesso:", serviceOffer.id);
      try {
        await storage.createNotification({
          type: "info",
          title: "Nova Proposta Recebida",
          message: `Voc\xEA recebeu uma nova proposta para ${serviceRequest.serviceType}`,
          userId: serviceRequest.clientId,
          actionUrl: "/service-offer"
        });
        console.log("\u2705 Notifica\xE7\xE3o criada para o cliente ID:", serviceRequest.clientId);
      } catch (notificationError) {
        console.error("\u26A0\uFE0F Erro ao criar notifica\xE7\xE3o (proposta j\xE1 foi criada):", notificationError);
      }
      res.json({ success: true, message: "Proposta criada com sucesso", data: serviceOffer });
    } catch (error) {
      console.error("\u274C Erro ao criar proposta:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.delete("/api/service-requests/:id", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      console.log("\u{1F5D1}\uFE0F Tentativa de exclus\xE3o de service request ID:", requestId, "por usu\xE1rio:", user.id);
      const serviceRequest = await storage.getServiceRequestById(requestId);
      if (!serviceRequest) {
        return res.status(404).json({ message: "Solicita\xE7\xE3o n\xE3o encontrada" });
      }
      if (user.userType !== "client" || serviceRequest.clientId !== user.id) {
        return res.status(403).json({ message: "Apenas o cliente que criou a solicita\xE7\xE3o pode exclu\xED-la" });
      }
      if (!["open", "pending", "assigned"].includes(serviceRequest.status)) {
        return res.status(400).json({
          message: "Apenas solicita\xE7\xF5es abertas, pendentes ou atribu\xEDdas podem ser exclu\xEDdas",
          currentStatus: serviceRequest.status
        });
      }
      await storage.deleteServiceRequest(requestId);
      console.log("\u2705 Service request exclu\xEDdo com sucesso, ID:", requestId);
      res.json({
        success: true,
        message: "Solicita\xE7\xE3o e todas as propostas relacionadas foram exclu\xEDdas com sucesso",
        deletedRequestId: requestId
      });
    } catch (error) {
      console.error("\u274C Erro ao excluir solicita\xE7\xE3o:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/appointments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "client") {
        return res.status(403).json({ message: "Acesso negado. Apenas clientes podem acessar esta rota." });
      }
      console.log("\u{1F4C5} Buscando agendamentos para cliente ID:", user.id);
      const serviceRequests2 = await storage.getServiceRequestsByClient(user.id);
      const appointments2 = serviceRequests2.filter((sr) => sr.status === "assigned" || sr.status === "accepted" || sr.status === "in_progress" || sr.status === "awaiting_confirmation" || sr.status === "completed").map((sr) => ({
        id: sr.id,
        clientId: sr.clientId,
        professionalId: sr.assignedProfessionalId,
        serviceType: sr.serviceType,
        description: sr.description,
        scheduledFor: sr.scheduledDate,
        scheduledTime: sr.scheduledTime,
        status: sr.status,
        address: sr.address,
        createdAt: sr.createdAt,
        updatedAt: sr.updatedAt
      }));
      console.log("\u2705 Agendamentos encontrados:", appointments2.length);
      res.json(appointments2);
    } catch (error) {
      console.error("\u274C Erro ao buscar agendamentos do cliente:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/appointments/provider", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("\u{1F4C5} Buscando agendamentos para profissional ID:", user.id);
      const appointments2 = await storage.getServiceRequestsByProfessional(user.id);
      console.log("\u2705 Agendamentos encontrados:", appointments2.length);
      res.json(appointments2);
    } catch (error) {
      console.error("\u274C Erro ao buscar agendamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/service-requests/category/:category", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const category = req.params.category;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("\u{1F50D} Buscando solicita\xE7\xF5es para categoria:", category, "por profissional ID:", user.id);
      const serviceRequests2 = await storage.getServiceRequestsByCategory(category);
      const availableRequests = serviceRequests2.filter(
        (request) => request.status === "open" || request.status === "pending" || request.status === "assigned" && request.assignedProfessionalId === user.id
      );
      console.log("\u2705 Solicita\xE7\xF5es encontradas:", availableRequests.length);
      res.json(availableRequests);
    } catch (error) {
      console.error("\u274C Erro ao buscar solicita\xE7\xF5es por categoria:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.put("/api/provider/availability", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { available } = req.body;
      console.log("\u{1F527} Atualizando disponibilidade do profissional:", { userId: user.id, available });
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem atualizar sua disponibilidade." });
      }
      await storage.updateProfessionalAvailability(user.id, available);
      console.log("\u2705 Disponibilidade atualizada com sucesso");
      res.json({ message: "Disponibilidade atualizada com sucesso", available });
    } catch (error) {
      console.error("\u274C Erro ao atualizar disponibilidade:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/professional/:id/completed-services", authenticateToken, async (req, res) => {
    try {
      console.log("\u{1F680} Endpoint /api/professional/:id/completed-services chamado");
      const user = req.user;
      const professionalId = parseInt(req.params.id);
      console.log("\u{1F464} Usu\xE1rio autenticado:", { id: user?.id, userType: user?.userType, name: user?.name });
      console.log("\u{1F4CB} Professional ID solicitado:", professionalId);
      if (user.userType !== "provider" || user.id !== professionalId) {
        console.log("\u274C Acesso negado - verifica\xE7\xE3o de permiss\xE3o falhou");
        return res.status(403).json({ message: "Acesso negado. Voc\xEA s\xF3 pode acessar seus pr\xF3prios dados." });
      }
      console.log("\u2705 Permiss\xE3o aprovada, buscando dados...");
      console.log("\u{1F4CA} Buscando servi\xE7os conclu\xEDdos para profissional ID:", professionalId);
      console.log("\u{1F50D} Buscando professional_id para user_id:", professionalId);
      const professional = await storage.getProfessionalByUserId(professionalId);
      if (!professional) {
        console.log("\u274C Profissional n\xE3o encontrado para user_id:", professionalId);
        return res.status(404).json({ message: "Profissional n\xE3o encontrado" });
      }
      console.log("\u2705 Profissional encontrado:", { id: professional.id, userId: professional.userId, name: professional.name });
      console.log("\u{1F50D} Buscando servi\xE7os conclu\xEDdos para professional_id:", professional.id);
      const completedServices = await storage.getProfessionalCompletedServices(professional.id);
      console.log("\u2705 Servi\xE7os conclu\xEDdos encontrados:", completedServices.length);
      console.log("\u{1F4CB} Primeiro servi\xE7o:", completedServices[0] || "Nenhum servi\xE7o");
      res.json({ data: completedServices });
    } catch (error) {
      console.error("\u274C Erro ao buscar servi\xE7os conclu\xEDdos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/provider/payments", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const filter = req.query.filter || "all";
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("\u{1F4B3} Buscando pagamentos para profissional ID:", user.id, "com filtro:", filter);
      const payments = await storage.getPaymentsByProfessional(user.id, filter);
      const stats = await storage.getPaymentStatsByProfessional(user.id);
      console.log("\u2705 Pagamentos encontrados:", payments.length);
      console.log("\u2705 Estat\xEDsticas:", stats);
      res.json({
        payments,
        stats
      });
    } catch (error) {
      console.error("\u274C Erro ao buscar pagamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/provider/profile", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("\u{1F464} Buscando perfil do profissional ID:", user.id);
      const profileData = await storage.getProviderProfile(user.id);
      console.log("\u2705 Perfil encontrado:", !!profileData);
      res.json(profileData);
    } catch (error) {
      console.error("\u274C Erro ao buscar perfil do profissional:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/provider/dashboard", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (user.userType !== "provider") {
        return res.status(403).json({ message: "Acesso negado. Apenas profissionais podem acessar esta rota." });
      }
      console.log("\u{1F4CA} Buscando dados do dashboard para profissional ID:", user.id);
      const dashboardData = await storage.getProviderDashboardData(user.id);
      console.log("\u2705 Dados do dashboard encontrados:", !!dashboardData);
      res.json(dashboardData);
    } catch (error) {
      console.error("\u274C Erro ao buscar dados do dashboard:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/notifications/count", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error("\u274C Erro ao buscar contador de notifica\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const notifications2 = await storage.getUserNotifications(user.id);
      res.json(notifications2);
    } catch (error) {
      console.error("\u274C Erro ao buscar notifica\xE7\xF5es:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id), user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("\u274C Erro ao marcar notifica\xE7\xE3o como lida:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/notifications/mark-all-read", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      await storage.markAllNotificationsAsRead(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("\u274C Erro ao marcar todas as notifica\xE7\xF5es como lidas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
  app2.post("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { type, title, message, userId, actionUrl } = req.body;
      const notification = await storage.createNotification({
        type,
        title,
        message,
        userId: userId || user.id,
        actionUrl
      });
      res.json({ success: true, notification });
    } catch (error) {
      console.error("\u274C Erro ao criar notifica\xE7\xE3o:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
}

// server/index.ts
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import Redis from "redis";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
config2({ path: path2.join(__dirname, ".env") });
var app = express2();
console.log("=== Backend inicializado ===");
app.use((req, res, next) => {
  if (req.path.startsWith("/uploads")) return next();
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === "development") {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    const allowedOrigins = [
      "https://lifebee.netlify.app",
      "https://lifebee.com.br",
      "http://localhost:5173",
      "http://localhost:5174"
    ];
    res.setHeader("Vary", "Origin");
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "https://lifebee.netlify.app");
    }
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  console.log("\u{1F310} Debug Global - Requisi\xE7\xE3o:", req.method, req.path);
  next();
});
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api") && req.path !== "/api/health") {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await db2.execute(sql3`SELECT 1`);
      next();
    } catch (error) {
      console.error("\u274C Erro de conex\xE3o com banco:", error);
      res.status(503).json({
        error: "Servi\xE7o temporariamente indispon\xEDvel",
        message: "Erro de conex\xE3o com banco de dados"
      });
    }
  } else {
    next();
  }
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
  const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
  });
  try {
    await redisClient.connect();
    console.log("\u2705 Redis conectado");
  } catch (error) {
    console.log("\u26A0\uFE0F Redis n\xE3o dispon\xEDvel, usando fallback");
  }
  setupRoutes(app, redisClient);
  const server = createServer(app);
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
    console.error("\u274C Erro global capturado:");
    console.error("Status:", status);
    console.error("Message:", message);
    console.error("Stack:", err.stack);
    console.error("Error object:", err);
    const errorResponse = {
      message: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : message
    };
    if (process.env.NODE_ENV === "development") {
      errorResponse.details = {
        stack: err.stack,
        name: err.name,
        code: err.code
      };
    }
    res.status(status).json(errorResponse);
  });
  const port = process.env.PORT || 3001;
  server.listen({
    port: Number(port),
    host: "0.0.0.0"
  }, () => {
    console.log(`Server running on port ${port}`);
  });
})();
