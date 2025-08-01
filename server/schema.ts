import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to user table for providers
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
  availableHours: text("available_hours"), // JSON string for schedule
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  totalReviews: integer("total_reviews").default(0),
  location: text("location"),
  distance: decimal("distance", { precision: 3, scale: 1 }),
  available: boolean("available").notNull().default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(), // Client who booked
  professionalId: integer("professional_id").notNull(),
  professionalName: text("professional_name").notNull(),
  serviceType: text("service_type").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  duration: integer("duration").notNull(), // Duration in hours
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }),
  status: text("status", { enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"] }).default("pending"),
  notes: text("notes"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  successful: boolean("successful").notNull().default(false),
  blocked: boolean("blocked").notNull().default(false),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: text("email"),
  phone: text("phone"),
  code: text("code").notNull(),
  type: text("type", { enum: ["email", "phone", "password_reset"] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  professionalId: integer("professional_id").notNull(),
  deletedByClient: boolean("deleted_by_client").default(false),
  deletedByProfessional: boolean("deleted_by_professional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "file"] }).default("text"),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(), // Cliente que solicitou
  serviceType: text("service_type").notNull(), // Tipo de serviço (ex: fisioterapia, enfermagem)
  category: text("category", { 
    enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"] 
  }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(), // Hora no formato HH:MM
  urgency: text("urgency", { enum: ["low", "medium", "high"] }).default("medium"),
  budget: decimal("budget", { precision: 8, scale: 2 }), // Orçamento opcional
  status: text("status", { enum: ["open", "in_progress", "assigned", "completed", "cancelled"] }).default("open"),
  assignedProfessionalId: integer("assigned_professional_id"), // Profissional designado
  responses: integer("responses").default(0), // Número de profissionais que responderam
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para propostas de serviços
export const serviceOffers = pgTable("service_offers", {
  id: serial("id").primaryKey(),
  serviceRequestId: integer("service_request_id").notNull(), // ID da solicitação de serviço
  professionalId: integer("professional_id").notNull(), // ID do profissional que fez a proposta
  proposedPrice: decimal("proposed_price", { precision: 8, scale: 2 }).notNull(), // Preço proposto
  estimatedTime: text("estimated_time").notNull(), // Tempo estimado (ex: "1 hora", "2 horas")
  message: text("message").notNull(), // Mensagem da proposta
  status: text("status", { enum: ["pending", "accepted", "rejected", "withdrawn"] }).default("pending"), // Status da proposta
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tipos TypeScript inferidos das tabelas
export type User = typeof users.$inferSelect;
export type Professional = typeof professionals.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type ServiceOffer = typeof serviceOffers.$inferSelect;

// Tipos para inserção (sem campos auto-gerados)
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertProfessional = Omit<Professional, 'id'>;
export type InsertAppointment = Omit<Appointment, 'id'>;
export type InsertNotification = Omit<Notification, 'id' | 'createdAt'>;
export type InsertLoginAttempt = Omit<LoginAttempt, 'id' | 'attemptedAt'>;
export type InsertVerificationCode = Omit<VerificationCode, 'id' | 'createdAt'>;
export type InsertConversation = Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertMessage = Omit<Message, 'id' | 'timestamp'>;
export type InsertServiceRequest = Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertServiceOffer = Omit<ServiceOffer, 'id' | 'createdAt' | 'updatedAt'>;
