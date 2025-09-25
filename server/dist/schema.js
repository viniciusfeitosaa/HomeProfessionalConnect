"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceProgress = exports.paymentReferences = exports.serviceReviews = exports.transactions = exports.serviceOffers = exports.serviceRequests = exports.messages = exports.conversations = exports.verificationCodes = exports.loginAttempts = exports.notifications = exports.appointments = exports.professionals = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password"),
    googleId: (0, pg_core_1.text)("google_id").unique(),
    appleId: (0, pg_core_1.text)("apple_id").unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    phone: (0, pg_core_1.text)("phone"),
    phoneVerified: (0, pg_core_1.boolean)("phone_verified").default(false),
    address: (0, pg_core_1.text)("address"),
    profileImage: (0, pg_core_1.text)("profile_image"),
    userType: (0, pg_core_1.text)("user_type", { enum: ["client", "provider"] }).notNull().default("client"),
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    isBlocked: (0, pg_core_1.boolean)("is_blocked").default(false),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    loginAttempts: (0, pg_core_1.integer)("login_attempts").default(0),
    resetToken: (0, pg_core_1.text)("reset_token"),
    resetTokenExpiry: (0, pg_core_1.timestamp)("reset_token_expiry"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.professionals = (0, pg_core_1.pgTable)("professionals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(), // Link to user table for providers
    name: (0, pg_core_1.text)("name").notNull(),
    specialization: (0, pg_core_1.text)("specialization").notNull(),
    category: (0, pg_core_1.text)("category", {
        enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"]
    }).notNull(),
    subCategory: (0, pg_core_1.text)("sub_category", {
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
    description: (0, pg_core_1.text)("description").notNull(),
    experience: (0, pg_core_1.text)("experience"),
    certifications: (0, pg_core_1.text)("certifications"),
    availableHours: (0, pg_core_1.text)("available_hours"), // JSON string for schedule
    hourlyRate: (0, pg_core_1.decimal)("hourly_rate", { precision: 8, scale: 2 }),
    rating: (0, pg_core_1.decimal)("rating", { precision: 2, scale: 1 }).default("5.0"),
    totalReviews: (0, pg_core_1.integer)("total_reviews").default(0),
    location: (0, pg_core_1.text)("location"),
    distance: (0, pg_core_1.decimal)("distance", { precision: 3, scale: 1 }),
    available: (0, pg_core_1.boolean)("available").notNull().default(true),
    imageUrl: (0, pg_core_1.text)("image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.appointments = (0, pg_core_1.pgTable)("appointments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(), // Client who booked
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    professionalName: (0, pg_core_1.text)("professional_name").notNull(),
    serviceType: (0, pg_core_1.text)("service_type").notNull(),
    scheduledFor: (0, pg_core_1.timestamp)("scheduled_for").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(), // Duration in hours
    totalCost: (0, pg_core_1.decimal)("total_cost", { precision: 8, scale: 2 }),
    status: (0, pg_core_1.text)("status", { enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"] }).default("pending"),
    notes: (0, pg_core_1.text)("notes"),
    address: (0, pg_core_1.text)("address"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    read: (0, pg_core_1.boolean)("read").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.loginAttempts = (0, pg_core_1.pgTable)("login_attempts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email"),
    ipAddress: (0, pg_core_1.text)("ip_address").notNull(),
    userAgent: (0, pg_core_1.text)("user_agent"),
    successful: (0, pg_core_1.boolean)("successful").notNull().default(false),
    blocked: (0, pg_core_1.boolean)("blocked").notNull().default(false),
    attemptedAt: (0, pg_core_1.timestamp)("attempted_at").defaultNow().notNull(),
});
exports.verificationCodes = (0, pg_core_1.pgTable)("verification_codes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id"),
    email: (0, pg_core_1.text)("email"),
    phone: (0, pg_core_1.text)("phone"),
    code: (0, pg_core_1.text)("code").notNull(),
    type: (0, pg_core_1.text)("type", { enum: ["email", "phone", "password_reset"] }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    used: (0, pg_core_1.boolean)("used").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.conversations = (0, pg_core_1.pgTable)("conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(),
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    deletedByClient: (0, pg_core_1.boolean)("deleted_by_client").default(false),
    deletedByProfessional: (0, pg_core_1.boolean)("deleted_by_professional").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    conversationId: (0, pg_core_1.integer)("conversation_id").notNull(),
    senderId: (0, pg_core_1.integer)("sender_id").notNull(),
    recipientId: (0, pg_core_1.integer)("recipient_id").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    type: (0, pg_core_1.text)("type", { enum: ["text", "image", "file"] }).default("text"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
});
exports.serviceRequests = (0, pg_core_1.pgTable)("service_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(), // Cliente que solicitou
    serviceType: (0, pg_core_1.text)("service_type").notNull(), // Tipo de serviço (ex: fisioterapia, enfermagem)
    category: (0, pg_core_1.text)("category", {
        enum: ["fisioterapeuta", "acompanhante_hospitalar", "tecnico_enfermagem"]
    }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    scheduledDate: (0, pg_core_1.timestamp)("scheduled_date").notNull(),
    scheduledTime: (0, pg_core_1.text)("scheduled_time").notNull(), // Hora no formato HH:MM
    urgency: (0, pg_core_1.text)("urgency", { enum: ["low", "medium", "high"] }).default("medium"),
    budget: (0, pg_core_1.decimal)("budget", { precision: 8, scale: 2 }), // Orçamento opcional
    status: (0, pg_core_1.text)("status", { enum: ["open", "in_progress", "assigned", "completed", "cancelled", "awaiting_confirmation"] }).default("open"),
    assignedProfessionalId: (0, pg_core_1.integer)("assigned_professional_id"), // Profissional designado
    responses: (0, pg_core_1.integer)("responses").default(0), // Número de profissionais que responderam
    serviceStartedAt: (0, pg_core_1.timestamp)("service_started_at"), // Quando o profissional iniciou o serviço
    serviceCompletedAt: (0, pg_core_1.timestamp)("service_completed_at"), // Quando o profissional marcou como concluído
    clientConfirmedAt: (0, pg_core_1.timestamp)("client_confirmed_at"), // Quando o cliente confirmou a conclusão
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Tabela para propostas de serviços
exports.serviceOffers = (0, pg_core_1.pgTable)("service_offers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serviceRequestId: (0, pg_core_1.integer)("service_request_id").notNull(), // ID da solicitação de serviço
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(), // ID do profissional que fez a proposta
    proposedPrice: (0, pg_core_1.decimal)("proposed_price", { precision: 8, scale: 2 }).notNull(), // Preço proposto
    finalPrice: (0, pg_core_1.decimal)("final_price", { precision: 8, scale: 2 }), // Preço final acordado
    estimatedTime: (0, pg_core_1.text)("estimated_time").notNull(), // Tempo estimado (ex: "1 hora", "2 horas")
    message: (0, pg_core_1.text)("message").notNull(), // Mensagem da proposta
    status: (0, pg_core_1.text)("status", { enum: ["pending", "accepted", "rejected", "withdrawn"] }).default("pending"), // Status da proposta
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Tabela para transações/pagamentos
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serviceRequestId: (0, pg_core_1.integer)("service_request_id").notNull(),
    serviceOfferId: (0, pg_core_1.integer)("service_offer_id").notNull(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(),
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(), // Valor da transação
    status: (0, pg_core_1.text)("status", {
        enum: ["pending", "completed", "failed", "refunded"]
    }).notNull().default("pending"),
    type: (0, pg_core_1.text)("type", {
        enum: ["service_payment", "refund", "bonus"]
    }).notNull().default("service_payment"),
    description: (0, pg_core_1.text)("description"), // Descrição da transação
    paymentMethod: (0, pg_core_1.text)("payment_method", {
        enum: ["pix", "credit_card", "debit_card", "bank_transfer"]
    }).default("pix"),
    transactionId: (0, pg_core_1.text)("transaction_id"), // ID externo da transação (gateway de pagamento)
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.serviceReviews = (0, pg_core_1.pgTable)("service_reviews", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serviceRequestId: (0, pg_core_1.integer)("service_request_id").notNull(),
    serviceOfferId: (0, pg_core_1.integer)("service_offer_id").notNull(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(),
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(), // 1-5 estrelas
    comment: (0, pg_core_1.text)("comment"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.paymentReferences = (0, pg_core_1.pgTable)("payment_references", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serviceRequestId: (0, pg_core_1.integer)("service_request_id").notNull(),
    serviceOfferId: (0, pg_core_1.integer)("service_offer_id").notNull(),
    clientId: (0, pg_core_1.integer)("client_id").notNull(),
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    preferenceId: (0, pg_core_1.text)("preference_id").notNull().unique(),
    status: (0, pg_core_1.text)("status", { enum: ["pending", "approved", "rejected", "cancelled"] }).notNull().default("pending"),
    statusDetail: (0, pg_core_1.text)("status_detail"), // Detalhes do status do pagamento
    externalReference: (0, pg_core_1.text)("external_reference").notNull(),
    paymentId: (0, pg_core_1.text)("payment_id"), // ID do pagamento no Mercado Pago quando aprovado
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Tabela para acompanhar o progresso do serviço
exports.serviceProgress = (0, pg_core_1.pgTable)("service_progress", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    serviceRequestId: (0, pg_core_1.integer)("service_request_id").notNull(),
    professionalId: (0, pg_core_1.integer)("professional_id").notNull(),
    status: (0, pg_core_1.text)("status", {
        enum: ["accepted", "started", "in_progress", "completed", "awaiting_confirmation", "confirmed", "payment_released"]
    }).notNull().default("accepted"),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    confirmedAt: (0, pg_core_1.timestamp)("confirmed_at"),
    paymentReleasedAt: (0, pg_core_1.timestamp)("payment_released_at"),
    notes: (0, pg_core_1.text)("notes"), // Observações do profissional
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
