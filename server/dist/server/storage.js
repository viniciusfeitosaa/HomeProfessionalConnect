import { users, professionals, appointments, notifications, loginAttempts, verificationCodes, conversations, messages, serviceRequests, } from "./schema.js";
import { db } from "./db.js";
import { eq, and, or, gte, ilike, sql, desc, ne } from "drizzle-orm";
// Database Storage Implementation
export class DatabaseStorage {
    // Users
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }
    async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || undefined;
    }
    async getUserByGoogleId(googleId) {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db
            .insert(users)
            .values(insertUser)
            .returning();
        return user;
    }
    async updateUser(id, updates) {
        const allowed = [
            'username', 'password', 'googleId', 'name', 'email', 'phone', 'phoneVerified', 'address', 'profileImage',
            'userType', 'isVerified', 'isBlocked', 'lastLoginAt', 'loginAttempts', 'resetToken', 'resetTokenExpiry', 'updatedAt'
        ];
        const safeUpdates = {};
        for (const key of allowed) {
            if (key in updates)
                safeUpdates[key] = updates[key];
        }
        safeUpdates.updatedAt = new Date();
        const [user] = await db
            .update(users)
            .set(safeUpdates)
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async updateUserLoginAttempts(id, attempts) {
        await db
            .update(users)
            .set({ [users.loginAttempts.name]: attempts, [users.updatedAt.name]: new Date() })
            .where(eq(users.id, id));
    }
    async blockUser(id) {
        await db
            .update(users)
            .set({ [users.isBlocked.name]: true, [users.updatedAt.name]: new Date() })
            .where(eq(users.id, id));
    }
    async verifyUser(id) {
        await db
            .update(users)
            .set({ [users.isVerified.name]: true, [users.updatedAt.name]: new Date() })
            .where(eq(users.id, id));
    }
    // Professionals
    async getAllProfessionals() {
        // Retorna explicitamente o campo userId
        return await db.select({
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
    }
    async getProfessionalsByCategory(category) {
        return await db.select({
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
        }).from(professionals)
            .where(and(eq(professionals.category, category), eq(professionals.available, true)));
    }
    async searchProfessionals(query) {
        return await db.select({
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
        }).from(professionals)
            .where(and(eq(professionals.available, true), or(ilike(professionals.name, `%${query}%`), ilike(professionals.specialization, `%${query}%`), ilike(professionals.description, `%${query}%`))));
    }
    async getProfessional(id) {
        const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
        return professional || undefined;
    }
    async getProfessionalByUserId(userId) {
        const [professional] = await db.select().from(professionals).where(eq(professionals.userId, userId));
        return professional || undefined;
    }
    async createProfessional(insertProfessional) {
        const [professional] = await db
            .insert(professionals)
            .values(insertProfessional)
            .returning();
        return professional;
    }
    async updateProfessional(id, updates) {
        const [professional] = await db
            .update(professionals)
            .set(updates)
            .where(eq(professionals.id, id))
            .returning();
        return professional;
    }
    // Appointments
    async getAppointmentsByUser(userId) {
        return await db.select().from(appointments).where(eq(appointments.clientId, userId));
    }
    async getAppointmentsByProfessional(professionalId) {
        return await db.select().from(appointments).where(eq(appointments.professionalId, professionalId));
    }
    async createAppointment(insertAppointment) {
        const [appointment] = await db
            .insert(appointments)
            .values(insertAppointment)
            .returning();
        return appointment;
    }
    async updateAppointment(id, updates) {
        const [appointment] = await db
            .update(appointments)
            .set(updates)
            .where(eq(appointments.id, id))
            .returning();
        return appointment;
    }
    // Notifications
    async getNotificationsByUser(userId) {
        return await db.select().from(notifications).where(eq(notifications.userId, userId));
    }
    async getUnreadNotificationCount(userId) {
        const [result] = await db
            .select({ count: sql `cast(count(*) as int)` })
            .from(notifications)
            .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
        return result?.count || 0;
    }
    async createNotification(insertNotification) {
        const [notification] = await db
            .insert(notifications)
            .values(insertNotification)
            .returning();
        return notification;
    }
    async markNotificationRead(id) {
        await db
            .update(notifications)
            .set({ [notifications.read.name]: true })
            .where(eq(notifications.id, id));
    }
    // Security & Anti-fraud
    async createLoginAttempt(insertLoginAttempt) {
        const [loginAttempt] = await db
            .insert(loginAttempts)
            .values(insertLoginAttempt)
            .returning();
        return loginAttempt;
    }
    async getRecentLoginAttempts(ipAddress, minutes) {
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
        return await db.select().from(loginAttempts)
            .where(and(eq(loginAttempts.ipAddress, ipAddress), gte(loginAttempts.attemptedAt, timeAgo)));
    }
    async createVerificationCode(insertVerificationCode) {
        const [verificationCode] = await db
            .insert(verificationCodes)
            .values(insertVerificationCode)
            .returning();
        return verificationCode;
    }
    async getVerificationCode(code, type) {
        const [verificationCode] = await db.select().from(verificationCodes)
            .where(and(eq(verificationCodes.code, code), eq(verificationCodes.type, type), eq(verificationCodes.used, false), gte(verificationCodes.expiresAt, new Date())));
        return verificationCode || undefined;
    }
    async markCodeAsUsed(id) {
        await db
            .update(verificationCodes)
            .set({ [verificationCodes.used.name]: true })
            .where(eq(verificationCodes.id, id));
    }
    // Conversations & Messages
    async getProfessionalById(userId) {
        const result = await db
            .select()
            .from(professionals)
            .where(eq(professionals.userId, userId))
            .limit(1);
        return result[0];
    }
    async getConversation(clientId, professionalId) {
        const result = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.clientId, clientId), eq(conversations.professionalId, professionalId)))
            .limit(1);
        return result[0];
    }
    // Verificar se uma conversa foi deletada pelo usuário
    async isConversationDeletedByUser(conversationId, userId) {
        const conversation = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);
        if (!conversation[0]) {
            return false;
        }
        const conv = conversation[0];
        if (conv.clientId === userId) {
            return conv.deletedByClient === true;
        }
        else if (conv.professionalId === userId) {
            return conv.deletedByProfessional === true;
        }
        return false;
    }
    // Restaurar conversa (marcar como não deletada pelo usuário)
    async restoreConversation(conversationId, userId) {
        const conversation = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);
        if (!conversation[0]) {
            throw new Error('Conversa não encontrada');
        }
        const conv = conversation[0];
        const updates = {};
        if (conv.clientId === userId) {
            updates.deletedByClient = false;
        }
        else if (conv.professionalId === userId) {
            updates.deletedByProfessional = false;
        }
        else {
            throw new Error('Usuário não é participante da conversa');
        }
        await db
            .update(conversations)
            .set(updates)
            .where(eq(conversations.id, conversationId));
    }
    async getConversationsByUser(userId) {
        console.log(`🔍 getConversationsByUser(${userId}) - Iniciando busca...`);
        // Buscar todas as conversas do usuário (sem filtro de deletadas)
        const allUserConversations = await db
            .select()
            .from(conversations)
            .where(or(eq(conversations.clientId, userId), eq(conversations.professionalId, userId)));
        console.log(`📋 Todas as conversas do usuário ${userId}:`, allUserConversations.map((c) => ({
            id: c.id,
            clientId: c.clientId,
            professionalId: c.professionalId,
            deletedByClient: c.deletedByClient,
            deletedByProfessional: c.deletedByProfessional
        })));
        // Verificar se o usuário é cliente ou profissional
        const asClient = allUserConversations.filter((c) => c.clientId === userId);
        const asProfessional = allUserConversations.filter((c) => c.professionalId === userId);
        console.log(`📊 Usuário ${userId} - Como cliente: ${asClient.length}, Como profissional: ${asProfessional.length}`);
        // Agora aplicar o filtro de conversas não deletadas
        const result = await db
            .select()
            .from(conversations)
            .where(and(or(eq(conversations.clientId, userId), eq(conversations.professionalId, userId)), 
        // Não mostrar conversas deletadas pelo usuário
        or(and(eq(conversations.clientId, userId), eq(conversations.deletedByClient, false)), and(eq(conversations.professionalId, userId), eq(conversations.deletedByProfessional, false)))));
        console.log(`✅ Conversas filtradas para usuário ${userId}:`, result.map((c) => ({
            id: c.id,
            clientId: c.clientId,
            professionalId: c.professionalId,
            deletedByClient: c.deletedByClient,
            deletedByProfessional: c.deletedByProfessional
        })));
        return result;
    }
    async createConversation(conversation) {
        const result = await db
            .insert(conversations)
            .values(conversation)
            .returning();
        return result[0];
    }
    async createMessage(message) {
        const result = await db
            .insert(messages)
            .values(message)
            .returning();
        return result[0];
    }
    async getMessagesByConversation(conversationId) {
        return await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.timestamp);
    }
    async getLastMessageByConversation(conversationId) {
        const result = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.timestamp))
            .limit(1);
        return result[0];
    }
    async getUnreadMessageCount(conversationId, userId) {
        const [result] = await db
            .select({ count: sql `cast(count(*) as int)` })
            .from(messages)
            .where(and(eq(messages.conversationId, conversationId), ne(messages.senderId, userId), eq(messages.isRead, false)));
        return result?.count || 0;
    }
    async markMessagesAsRead(conversationId, userId) {
        await db
            .update(messages)
            .set({ isRead: true })
            .where(and(eq(messages.conversationId, conversationId), ne(messages.senderId, userId), eq(messages.isRead, false)));
    }
    // Excluir todas as mensagens de uma conversa
    async deleteMessagesByConversation(conversationId) {
        await db.delete(messages).where(eq(messages.conversationId, conversationId));
    }
    // Marcar conversa como deletada pelo usuário (exclusão individual)
    async deleteConversation(conversationId, userId) {
        // Verificar se o usuário é cliente ou profissional da conversa
        const conversation = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);
        if (!conversation[0]) {
            throw new Error('Conversa não encontrada');
        }
        const conv = conversation[0];
        const updates = {};
        if (conv.clientId === userId) {
            updates.deletedByClient = true;
        }
        else if (conv.professionalId === userId) {
            updates.deletedByProfessional = true;
        }
        else {
            throw new Error('Usuário não é participante da conversa');
        }
        await db
            .update(conversations)
            .set(updates)
            .where(eq(conversations.id, conversationId));
    }
    // Service Requests
    async getServiceRequestsByClient(clientId) {
        return await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.clientId, clientId))
            .orderBy(desc(serviceRequests.createdAt));
    }
    async getServiceRequestsByCategory(category) {
        return await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.category, category))
            .orderBy(desc(serviceRequests.createdAt));
    }
    async getServiceRequest(id) {
        const [serviceRequest] = await db
            .select()
            .from(serviceRequests)
            .where(eq(serviceRequests.id, id));
        return serviceRequest || undefined;
    }
    async createServiceRequest(insertServiceRequest) {
        const [serviceRequest] = await db
            .insert(serviceRequests)
            .values(insertServiceRequest)
            .returning();
        return serviceRequest;
    }
    async updateServiceRequest(id, updates) {
        const [serviceRequest] = await db
            .update(serviceRequests)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(serviceRequests.id, id))
            .returning();
        return serviceRequest;
    }
    async deleteServiceRequest(id) {
        await db
            .delete(serviceRequests)
            .where(eq(serviceRequests.id, id));
    }
    async assignProfessionalToRequest(requestId, professionalId) {
        await db
            .update(serviceRequests)
            .set({
            assignedProfessionalId: professionalId,
            status: "assigned",
            updatedAt: new Date()
        })
            .where(eq(serviceRequests.id, requestId));
    }
}
export const storage = new DatabaseStorage();
