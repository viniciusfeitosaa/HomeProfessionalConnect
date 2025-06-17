import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  profileImage: text("profile_image"),
  userType: text("user_type", { enum: ["client", "provider"] }).notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Professional = typeof professionals.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
