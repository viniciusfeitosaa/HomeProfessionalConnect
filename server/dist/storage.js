"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_js_1 = require("./schema.js");
const db_js_1 = require("./db.js");
const drizzle_orm_1 = require("drizzle-orm");
// Database Storage Implementation
class DatabaseStorage {
    // Método para converter URLs relativas em absolutas
    getFullImageUrl(relativeUrl) {
        if (!relativeUrl) {
            return null;
        }
        if (relativeUrl.startsWith('http')) {
            return relativeUrl; // Já é uma URL absoluta
        }
        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://lifebee-backend.onrender.com'
            : 'http://localhost:8080';
        return `${baseUrl}${relativeUrl}`;
    }
    // Users
    async getUser(id) {
        try {
            console.log('🔍 Storage.getUser - Buscando usuário com ID:', id);
            console.log('🔍 Storage.getUser - Tipo do ID:', typeof id);
            if (!id || isNaN(id)) {
                console.log('❌ Storage.getUser - ID inválido:', id);
                return undefined;
            }
            const [user] = await db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
            console.log('✅ Storage.getUser - Usuário encontrado:', user ? 'Sim' : 'Não');
            if (user) {
                console.log('✅ Storage.getUser - Dados do usuário:', { id: user.id, name: user.name, email: user.email });
            }
            return user || undefined;
        }
        catch (error) {
            console.error('❌ Storage.getUser - Erro:', error);
            throw error;
        }
    }
    async getAllUsers() {
        try {
            const allUsers = await db_js_1.db.select().from(schema_js_1.users);
            return allUsers;
        }
        catch (error) {
            console.error('❌ Storage.getAllUsers - Erro:', error);
            throw error;
        }
    }
    async getUserByUsername(username) {
        const [user] = await db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username));
        return user || undefined;
    }
    async getUserByEmail(email) {
        const [user] = await db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email));
        return user || undefined;
    }
    async getUserByGoogleId(googleId) {
        const [user] = await db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.googleId, googleId));
        return user || undefined;
    }
    async getUserByAppleId(appleId) {
        const [user] = await db_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.appleId, appleId));
        return user || undefined;
    }
    async createUser(insertUser) {
        const [user] = await db_js_1.db
            .insert(schema_js_1.users)
            .values(insertUser)
            .returning();
        return user;
    }
    async updateUser(id, updates) {
        const allowed = [
            'username', 'password', 'googleId', 'appleId', 'name', 'email', 'phone', 'phoneVerified', 'address', 'profileImage',
            'userType', 'isVerified', 'isBlocked', 'lastLoginAt', 'loginAttempts', 'resetToken', 'resetTokenExpiry', 'updatedAt'
        ];
        const safeUpdates = {};
        for (const key of allowed) {
            if (key in updates)
                safeUpdates[key] = updates[key];
        }
        safeUpdates.updatedAt = new Date();
        const [user] = await db_js_1.db
            .update(schema_js_1.users)
            .set(safeUpdates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id))
            .returning();
        return user;
    }
    async updateUserLoginAttempts(id, attempts) {
        await db_js_1.db
            .update(schema_js_1.users)
            .set({ [schema_js_1.users.loginAttempts.name]: attempts, [schema_js_1.users.updatedAt.name]: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
    }
    async blockUser(id) {
        await db_js_1.db
            .update(schema_js_1.users)
            .set({ [schema_js_1.users.isBlocked.name]: true, [schema_js_1.users.updatedAt.name]: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
    }
    async verifyUser(id) {
        await db_js_1.db
            .update(schema_js_1.users)
            .set({ [schema_js_1.users.isVerified.name]: true, [schema_js_1.users.updatedAt.name]: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
    }
    // Professionals
    async getAllProfessionals() {
        // Retorna explicitamente o campo userId
        const professionalsData = await db_js_1.db.select({
            id: schema_js_1.professionals.id,
            userId: schema_js_1.professionals.userId,
            name: schema_js_1.professionals.name,
            specialization: schema_js_1.professionals.specialization,
            category: schema_js_1.professionals.category,
            subCategory: schema_js_1.professionals.subCategory,
            description: schema_js_1.professionals.description,
            experience: schema_js_1.professionals.experience,
            certifications: schema_js_1.professionals.certifications,
            availableHours: schema_js_1.professionals.availableHours,
            hourlyRate: schema_js_1.professionals.hourlyRate,
            rating: schema_js_1.professionals.rating,
            totalReviews: schema_js_1.professionals.totalReviews,
            location: schema_js_1.professionals.location,
            distance: schema_js_1.professionals.distance,
            available: schema_js_1.professionals.available,
            imageUrl: schema_js_1.professionals.imageUrl,
            createdAt: schema_js_1.professionals.createdAt
        }).from(schema_js_1.professionals).where((0, drizzle_orm_1.eq)(schema_js_1.professionals.available, true));
        // Converter URLs relativas para absolutas
        return professionalsData.map((professional) => ({
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        }));
    }
    async getProfessionalsByCategory(category) {
        const professionalsData = await db_js_1.db.select({
            id: schema_js_1.professionals.id,
            userId: schema_js_1.professionals.userId,
            name: schema_js_1.professionals.name,
            specialization: schema_js_1.professionals.specialization,
            category: schema_js_1.professionals.category,
            subCategory: schema_js_1.professionals.subCategory,
            description: schema_js_1.professionals.description,
            experience: schema_js_1.professionals.experience,
            certifications: schema_js_1.professionals.certifications,
            availableHours: schema_js_1.professionals.availableHours,
            hourlyRate: schema_js_1.professionals.hourlyRate,
            rating: schema_js_1.professionals.rating,
            totalReviews: schema_js_1.professionals.totalReviews,
            location: schema_js_1.professionals.location,
            distance: schema_js_1.professionals.distance,
            available: schema_js_1.professionals.available,
            imageUrl: schema_js_1.professionals.imageUrl,
            createdAt: schema_js_1.professionals.createdAt
        }).from(schema_js_1.professionals)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.professionals.category, category), (0, drizzle_orm_1.eq)(schema_js_1.professionals.available, true)));
        // Converter URLs relativas para absolutas
        return professionalsData.map((professional) => ({
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        }));
    }
    async searchProfessionals(query) {
        const professionalsData = await db_js_1.db.select({
            id: schema_js_1.professionals.id,
            userId: schema_js_1.professionals.userId,
            name: schema_js_1.professionals.name,
            specialization: schema_js_1.professionals.specialization,
            category: schema_js_1.professionals.category,
            subCategory: schema_js_1.professionals.subCategory,
            description: schema_js_1.professionals.description,
            experience: schema_js_1.professionals.experience,
            certifications: schema_js_1.professionals.certifications,
            availableHours: schema_js_1.professionals.availableHours,
            hourlyRate: schema_js_1.professionals.hourlyRate,
            rating: schema_js_1.professionals.rating,
            totalReviews: schema_js_1.professionals.totalReviews,
            location: schema_js_1.professionals.location,
            distance: schema_js_1.professionals.distance,
            available: schema_js_1.professionals.available,
            imageUrl: schema_js_1.professionals.imageUrl,
            createdAt: schema_js_1.professionals.createdAt
        }).from(schema_js_1.professionals)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.professionals.available, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_js_1.professionals.name, `%${query}%`), (0, drizzle_orm_1.ilike)(schema_js_1.professionals.specialization, `%${query}%`), (0, drizzle_orm_1.ilike)(schema_js_1.professionals.description, `%${query}%`))));
        // Converter URLs relativas para absolutas
        return professionalsData.map((professional) => ({
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        }));
    }
    async getProfessional(id) {
        const [professional] = await db_js_1.db.select().from(schema_js_1.professionals).where((0, drizzle_orm_1.eq)(schema_js_1.professionals.id, id));
        if (!professional)
            return undefined;
        // Converter URL relativa para absoluta
        return {
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        };
    }
    async getProfessionalByUserId(userId) {
        const [professional] = await db_js_1.db.select().from(schema_js_1.professionals).where((0, drizzle_orm_1.eq)(schema_js_1.professionals.userId, userId));
        return professional || undefined;
    }
    async createProfessional(insertProfessional) {
        const [professional] = await db_js_1.db
            .insert(schema_js_1.professionals)
            .values(insertProfessional)
            .returning();
        return professional;
    }
    async updateProfessional(id, updates) {
        const [professional] = await db_js_1.db
            .update(schema_js_1.professionals)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.id, id))
            .returning();
        return professional;
    }
    async updateProfessionalAvailability(userId, available) {
        await db_js_1.db
            .update(schema_js_1.professionals)
            .set({ available })
            .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.userId, userId));
    }
    // Appointments
    async getAppointmentsByUser(userId) {
        return await db_js_1.db.select().from(schema_js_1.appointments).where((0, drizzle_orm_1.eq)(schema_js_1.appointments.clientId, userId));
    }
    async getAppointmentsByProfessional(professionalId) {
        return await db_js_1.db.select().from(schema_js_1.appointments).where((0, drizzle_orm_1.eq)(schema_js_1.appointments.professionalId, professionalId));
    }
    async createAppointment(insertAppointment) {
        const [appointment] = await db_js_1.db
            .insert(schema_js_1.appointments)
            .values(insertAppointment)
            .returning();
        return appointment;
    }
    async updateAppointment(id, updates) {
        const [appointment] = await db_js_1.db
            .update(schema_js_1.appointments)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.appointments.id, id))
            .returning();
        return appointment;
    }
    // Notifications
    async getNotificationsByUser(userId) {
        return await db_js_1.db.select().from(schema_js_1.notifications).where((0, drizzle_orm_1.eq)(schema_js_1.notifications.userId, userId));
    }
    async getUnreadNotificationCount(userId) {
        const [result] = await db_js_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_js_1.notifications)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.notifications.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.notifications.read, false)));
        return result?.count || 0;
    }
    async createNotification(insertNotification) {
        const [notification] = await db_js_1.db
            .insert(schema_js_1.notifications)
            .values(insertNotification)
            .returning();
        return notification;
    }
    async markNotificationRead(id) {
        await db_js_1.db
            .update(schema_js_1.notifications)
            .set({ [schema_js_1.notifications.read.name]: true })
            .where((0, drizzle_orm_1.eq)(schema_js_1.notifications.id, id));
    }
    // Security & Anti-fraud
    async createLoginAttempt(insertLoginAttempt) {
        const [loginAttempt] = await db_js_1.db
            .insert(schema_js_1.loginAttempts)
            .values(insertLoginAttempt)
            .returning();
        return loginAttempt;
    }
    async getRecentLoginAttempts(ipAddress, minutes) {
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
        return await db_js_1.db.select().from(schema_js_1.loginAttempts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.loginAttempts.ipAddress, ipAddress), (0, drizzle_orm_1.gte)(schema_js_1.loginAttempts.attemptedAt, timeAgo)));
    }
    async createVerificationCode(insertVerificationCode) {
        const [verificationCode] = await db_js_1.db
            .insert(schema_js_1.verificationCodes)
            .values(insertVerificationCode)
            .returning();
        return verificationCode;
    }
    async getVerificationCode(code, type) {
        const [verificationCode] = await db_js_1.db.select().from(schema_js_1.verificationCodes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.verificationCodes.code, code), (0, drizzle_orm_1.eq)(schema_js_1.verificationCodes.type, type), (0, drizzle_orm_1.eq)(schema_js_1.verificationCodes.used, false), (0, drizzle_orm_1.gte)(schema_js_1.verificationCodes.expiresAt, new Date())));
        return verificationCode || undefined;
    }
    async markCodeAsUsed(id) {
        await db_js_1.db
            .update(schema_js_1.verificationCodes)
            .set({ [schema_js_1.verificationCodes.used.name]: true })
            .where((0, drizzle_orm_1.eq)(schema_js_1.verificationCodes.id, id));
    }
    // Conversations & Messages
    async getConversation(clientId, professionalId) {
        const result = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.conversations.clientId, clientId), (0, drizzle_orm_1.eq)(schema_js_1.conversations.professionalId, professionalId)))
            .limit(1);
        return result[0];
    }
    // Verificar se uma conversa foi deletada pelo usuário
    async isConversationDeletedByUser(conversationId, userId) {
        const conversation = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, conversationId))
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
        const conversation = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, conversationId))
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
        await db_js_1.db
            .update(schema_js_1.conversations)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, conversationId));
    }
    async getConversationsByUser(userId) {
        console.log(`🔍 getConversationsByUser(${userId}) - Iniciando busca...`);
        // Buscar todas as conversas do usuário (sem filtro de deletadas)
        const allUserConversations = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_js_1.conversations.clientId, userId), (0, drizzle_orm_1.eq)(schema_js_1.conversations.professionalId, userId)));
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
        const result = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_js_1.conversations.clientId, userId), (0, drizzle_orm_1.eq)(schema_js_1.conversations.professionalId, userId)), 
        // Não mostrar conversas deletadas pelo usuário
        (0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.conversations.clientId, userId), (0, drizzle_orm_1.eq)(schema_js_1.conversations.deletedByClient, false)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.conversations.professionalId, userId), (0, drizzle_orm_1.eq)(schema_js_1.conversations.deletedByProfessional, false)))));
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
        const result = await db_js_1.db
            .insert(schema_js_1.conversations)
            .values(conversation)
            .returning();
        return result[0];
    }
    async createMessage(message) {
        const result = await db_js_1.db
            .insert(schema_js_1.messages)
            .values(message)
            .returning();
        return result[0];
    }
    async getMessagesByConversation(conversationId) {
        return await db_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId))
            .orderBy(schema_js_1.messages.timestamp);
    }
    async getLastMessageByConversation(conversationId) {
        const result = await db_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.messages.timestamp))
            .limit(1);
        return result[0];
    }
    async getUnreadMessageCount(conversationId, userId) {
        const [result] = await db_js_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId), (0, drizzle_orm_1.ne)(schema_js_1.messages.senderId, userId), (0, drizzle_orm_1.eq)(schema_js_1.messages.isRead, false)));
        return result?.count || 0;
    }
    async markMessagesAsRead(conversationId, userId) {
        await db_js_1.db
            .update(schema_js_1.messages)
            .set({ isRead: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId), (0, drizzle_orm_1.ne)(schema_js_1.messages.senderId, userId), (0, drizzle_orm_1.eq)(schema_js_1.messages.isRead, false)));
    }
    // Excluir todas as mensagens de uma conversa
    async deleteMessagesByConversation(conversationId) {
        await db_js_1.db.delete(schema_js_1.messages).where((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId));
    }
    // Marcar conversa como deletada pelo usuário (exclusão individual)
    async deleteConversation(conversationId, userId) {
        // Verificar se o usuário é cliente ou profissional da conversa
        const conversation = await db_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, conversationId))
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
        await db_js_1.db
            .update(schema_js_1.conversations)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, conversationId));
    }
    // Service Requests
    async getServiceRequestsByClient(clientId) {
        return await db_js_1.db
            .select()
            .from(schema_js_1.serviceRequests)
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, clientId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceRequests.createdAt));
    }
    async getServiceRequestsByCategory(category) {
        return await db_js_1.db
            .select({
            // Service Request fields
            id: schema_js_1.serviceRequests.id,
            clientId: schema_js_1.serviceRequests.clientId,
            category: schema_js_1.serviceRequests.category,
            serviceType: schema_js_1.serviceRequests.serviceType,
            description: schema_js_1.serviceRequests.description,
            address: schema_js_1.serviceRequests.address,
            budget: schema_js_1.serviceRequests.budget,
            scheduledDate: schema_js_1.serviceRequests.scheduledDate,
            scheduledTime: schema_js_1.serviceRequests.scheduledTime,
            urgency: schema_js_1.serviceRequests.urgency,
            status: schema_js_1.serviceRequests.status,
            responses: schema_js_1.serviceRequests.responses,
            assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId,
            createdAt: schema_js_1.serviceRequests.createdAt,
            updatedAt: schema_js_1.serviceRequests.updatedAt,
            serviceStartedAt: schema_js_1.serviceRequests.serviceStartedAt,
            serviceCompletedAt: schema_js_1.serviceRequests.serviceCompletedAt,
            clientConfirmedAt: schema_js_1.serviceRequests.clientConfirmedAt,
            // Client information
            clientName: schema_js_1.users.name,
            clientEmail: schema_js_1.users.email,
            clientPhone: schema_js_1.users.phone,
            clientProfileImage: schema_js_1.users.profileImage,
            clientCreatedAt: schema_js_1.users.createdAt
        })
            .from(schema_js_1.serviceRequests)
            .innerJoin(schema_js_1.users, (0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, schema_js_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.category, category))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceRequests.createdAt));
    }
    async getServiceRequest(id) {
        const [serviceRequest] = await db_js_1.db
            .select()
            .from(schema_js_1.serviceRequests)
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, id));
        return serviceRequest || undefined;
    }
    async getServiceRequestWithClient(id) {
        const [result] = await db_js_1.db
            .select({
            // Service Request fields
            id: schema_js_1.serviceRequests.id,
            clientId: schema_js_1.serviceRequests.clientId,
            serviceType: schema_js_1.serviceRequests.serviceType,
            category: schema_js_1.serviceRequests.category,
            description: schema_js_1.serviceRequests.description,
            address: schema_js_1.serviceRequests.address,
            scheduledDate: schema_js_1.serviceRequests.scheduledDate,
            scheduledTime: schema_js_1.serviceRequests.scheduledTime,
            urgency: schema_js_1.serviceRequests.urgency,
            budget: schema_js_1.serviceRequests.budget,
            status: schema_js_1.serviceRequests.status,
            assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId,
            responses: schema_js_1.serviceRequests.responses,
            createdAt: schema_js_1.serviceRequests.createdAt,
            updatedAt: schema_js_1.serviceRequests.updatedAt,
            serviceStartedAt: schema_js_1.serviceRequests.serviceStartedAt,
            serviceCompletedAt: schema_js_1.serviceRequests.serviceCompletedAt,
            clientConfirmedAt: schema_js_1.serviceRequests.clientConfirmedAt,
            // Client information
            clientName: schema_js_1.users.name,
            clientEmail: schema_js_1.users.email,
            clientPhone: schema_js_1.users.phone,
            clientProfileImage: schema_js_1.users.profileImage,
            clientCreatedAt: schema_js_1.users.createdAt
        })
            .from(schema_js_1.serviceRequests)
            .innerJoin(schema_js_1.users, (0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, schema_js_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, id));
        return result || undefined;
    }
    async createServiceRequest(insertServiceRequest) {
        const [serviceRequest] = await db_js_1.db
            .insert(schema_js_1.serviceRequests)
            .values(insertServiceRequest)
            .returning();
        return serviceRequest;
    }
    async updateServiceRequest(id, updates) {
        const [serviceRequest] = await db_js_1.db
            .update(schema_js_1.serviceRequests)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, id))
            .returning();
        return serviceRequest;
    }
    async deleteServiceRequest(id) {
        await db_js_1.db
            .delete(schema_js_1.serviceRequests)
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, id));
    }
    async assignProfessionalToRequest(requestId, professionalId) {
        await db_js_1.db
            .update(schema_js_1.serviceRequests)
            .set({
            assignedProfessionalId: professionalId,
            status: "assigned",
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, requestId));
    }
    // Service Offers
    async getServiceOffersByRequest(requestId) {
        return await db_js_1.db
            .select({
            // Service Offer fields
            id: schema_js_1.serviceOffers.id,
            serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
            professionalId: schema_js_1.serviceOffers.professionalId,
            proposedPrice: schema_js_1.serviceOffers.proposedPrice,
            finalPrice: schema_js_1.serviceOffers.finalPrice,
            estimatedTime: schema_js_1.serviceOffers.estimatedTime,
            message: schema_js_1.serviceOffers.message,
            status: schema_js_1.serviceOffers.status,
            createdAt: schema_js_1.serviceOffers.createdAt,
            updatedAt: schema_js_1.serviceOffers.updatedAt,
            // Professional information
            professionalName: schema_js_1.professionals.name,
            professionalRating: schema_js_1.professionals.rating,
            professionalTotalReviews: schema_js_1.professionals.totalReviews,
            professionalProfileImage: schema_js_1.professionals.imageUrl
        })
            .from(schema_js_1.serviceOffers)
            .innerJoin(schema_js_1.professionals, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, schema_js_1.professionals.id))
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, requestId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceOffers.createdAt));
    }
    async getProposalsByServiceRequest(requestId) {
        return await db_js_1.db
            .select({
            // Service Offer fields
            id: schema_js_1.serviceOffers.id,
            serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
            professionalId: schema_js_1.serviceOffers.professionalId,
            proposedPrice: schema_js_1.serviceOffers.proposedPrice,
            finalPrice: schema_js_1.serviceOffers.finalPrice,
            estimatedTime: schema_js_1.serviceOffers.estimatedTime,
            message: schema_js_1.serviceOffers.message,
            status: schema_js_1.serviceOffers.status,
            createdAt: schema_js_1.serviceOffers.createdAt,
            updatedAt: schema_js_1.serviceOffers.updatedAt,
            // Professional information
            professionalName: schema_js_1.professionals.name,
            professionalRating: schema_js_1.professionals.rating,
            professionalTotalReviews: schema_js_1.professionals.totalReviews,
            professionalProfileImage: schema_js_1.professionals.imageUrl
        })
            .from(schema_js_1.serviceOffers)
            .innerJoin(schema_js_1.professionals, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, schema_js_1.professionals.id))
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, requestId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceOffers.createdAt));
    }
    async getProposalsByProfessional(professionalId) {
        const results = await db_js_1.db
            .select({
            // Service Offer fields
            id: schema_js_1.serviceOffers.id,
            serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
            professionalId: schema_js_1.serviceOffers.professionalId,
            proposedPrice: schema_js_1.serviceOffers.proposedPrice,
            finalPrice: schema_js_1.serviceOffers.finalPrice,
            estimatedTime: schema_js_1.serviceOffers.estimatedTime,
            message: schema_js_1.serviceOffers.message,
            status: schema_js_1.serviceOffers.status,
            createdAt: schema_js_1.serviceOffers.createdAt,
            updatedAt: schema_js_1.serviceOffers.updatedAt,
            // Service Request fields
            requestId: schema_js_1.serviceRequests.id,
            clientId: schema_js_1.serviceRequests.clientId,
            serviceType: schema_js_1.serviceRequests.serviceType,
            category: schema_js_1.serviceRequests.category,
            description: schema_js_1.serviceRequests.description,
            address: schema_js_1.serviceRequests.address,
            budget: schema_js_1.serviceRequests.budget,
            scheduledDate: schema_js_1.serviceRequests.scheduledDate,
            scheduledTime: schema_js_1.serviceRequests.scheduledTime,
            urgency: schema_js_1.serviceRequests.urgency,
            requestStatus: schema_js_1.serviceRequests.status,
            assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId,
            responses: schema_js_1.serviceRequests.responses,
            requestCreatedAt: schema_js_1.serviceRequests.createdAt,
            requestUpdatedAt: schema_js_1.serviceRequests.updatedAt,
            serviceStartedAt: schema_js_1.serviceRequests.serviceStartedAt,
            serviceCompletedAt: schema_js_1.serviceRequests.serviceCompletedAt,
            clientConfirmedAt: schema_js_1.serviceRequests.clientConfirmedAt,
            // Client information
            clientName: schema_js_1.users.name,
            clientEmail: schema_js_1.users.email,
            clientPhone: schema_js_1.users.phone,
            clientProfileImage: schema_js_1.users.profileImage,
            clientCreatedAt: schema_js_1.users.createdAt
        })
            .from(schema_js_1.serviceOffers)
            .innerJoin(schema_js_1.serviceRequests, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, schema_js_1.serviceRequests.id))
            .innerJoin(schema_js_1.users, (0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, schema_js_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, professionalId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceOffers.createdAt));
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
        return await db_js_1.db
            .select()
            .from(schema_js_1.serviceOffers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, serviceRequestId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceOffers.createdAt));
    }
    async createServiceOffer(serviceOffer) {
        const [offer] = await db_js_1.db
            .insert(schema_js_1.serviceOffers)
            .values(serviceOffer)
            .returning();
        return offer;
    }
    async updateServiceOffer(id, updates) {
        const [offer] = await db_js_1.db
            .update(schema_js_1.serviceOffers)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, id))
            .returning();
        return offer;
    }
    async deleteServiceOffer(id) {
        await db_js_1.db
            .delete(schema_js_1.serviceOffers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, id));
    }
    // ==================== SERVICE REQUESTS FOR CLIENT ====================
    async getServiceRequestsForClient(userId) {
        try {
            console.log('🔍 Buscando pedidos para cliente ID:', userId);
            if (!userId || isNaN(userId)) {
                throw new Error('ID do usuário inválido');
            }
            const results = await db_js_1.db
                .select({
                id: schema_js_1.serviceRequests.id,
                title: schema_js_1.serviceRequests.serviceType,
                description: schema_js_1.serviceRequests.description,
                category: schema_js_1.serviceRequests.serviceType,
                budget: schema_js_1.serviceRequests.budget,
                location: schema_js_1.serviceRequests.address,
                urgency: schema_js_1.serviceRequests.urgency,
                status: schema_js_1.serviceRequests.status,
                createdAt: schema_js_1.serviceRequests.createdAt,
                responses: schema_js_1.serviceRequests.responses,
            })
                .from(schema_js_1.serviceRequests)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceRequests.createdAt));
            console.log('✅ Pedidos encontrados:', results.length);
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
        catch (error) {
            console.error('❌ Erro em getServiceRequestsForClient:', error);
            throw error; // Re-throw para ser tratado na rota
        }
    }
    // ==================== SERVICE OFFERS FOR CLIENT ====================
    async getServiceOffersForClient(userId) {
        try {
            console.log('🔍 Buscando propostas para cliente ID:', userId);
            if (!userId || isNaN(userId)) {
                throw new Error('ID do usuário inválido');
            }
            const results = await db_js_1.db
                .select({
                id: schema_js_1.serviceOffers.id,
                serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
                professionalId: schema_js_1.serviceOffers.professionalId,
                proposedPrice: schema_js_1.serviceOffers.proposedPrice,
                finalPrice: schema_js_1.serviceOffers.finalPrice,
                estimatedTime: schema_js_1.serviceOffers.estimatedTime,
                message: schema_js_1.serviceOffers.message,
                status: schema_js_1.serviceOffers.status,
                createdAt: schema_js_1.serviceOffers.createdAt,
                serviceTitle: schema_js_1.serviceRequests.serviceType,
                serviceStatus: schema_js_1.serviceRequests.status,
                professionalName: schema_js_1.professionals.name,
                professionalRating: schema_js_1.professionals.rating,
                professionalTotalReviews: schema_js_1.professionals.totalReviews,
                professionalProfileImage: schema_js_1.professionals.imageUrl,
                // Adicionar informações sobre avaliação se o serviço estiver concluído
                hasReview: schema_js_1.serviceReviews.id,
                reviewRating: schema_js_1.serviceReviews.rating,
                reviewComment: schema_js_1.serviceReviews.comment,
                reviewCreatedAt: schema_js_1.serviceReviews.createdAt
            })
                .from(schema_js_1.serviceOffers)
                .innerJoin(schema_js_1.serviceRequests, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, schema_js_1.serviceRequests.id))
                .innerJoin(schema_js_1.professionals, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, schema_js_1.professionals.id))
                .leftJoin(schema_js_1.serviceReviews, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.serviceRequestId, schema_js_1.serviceRequests.id), (0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.clientId, userId)))
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceOffers.createdAt));
            console.log('✅ Propostas encontradas:', results.length);
            return results.map((result) => ({
                id: result.id,
                serviceRequestId: result.serviceRequestId,
                professionalId: result.professionalId,
                professionalName: result.professionalName,
                professionalRating: result.professionalRating || 5.0,
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
        }
        catch (error) {
            console.error('❌ Erro em getServiceOffersForClient:', error);
            throw error; // Re-throw para ser tratado na rota
        }
    }
    async acceptServiceOffer(offerId, userId) {
        try {
            console.log('✅ Aceitando proposta:', offerId, 'pelo cliente:', userId);
            // Verificar se a proposta existe e pertence ao cliente
            const [offer] = await db_js_1.db
                .select({
                id: schema_js_1.serviceOffers.id,
                serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
                professionalId: schema_js_1.serviceOffers.professionalId,
                proposedPrice: schema_js_1.serviceOffers.proposedPrice,
                status: schema_js_1.serviceOffers.status,
                clientId: schema_js_1.serviceRequests.clientId
            })
                .from(schema_js_1.serviceOffers)
                .innerJoin(schema_js_1.serviceRequests, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, schema_js_1.serviceRequests.id))
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            if (!offer) {
                return { success: false, error: 'Proposta não encontrada' };
            }
            if (offer.clientId !== userId) {
                return { success: false, error: 'Proposta não pertence a este cliente' };
            }
            if (offer.status !== 'pending') {
                return { success: false, error: 'Proposta já foi processada' };
            }
            // Atualizar proposta para aceita
            await db_js_1.db
                .update(schema_js_1.serviceOffers)
                .set({ status: 'accepted', updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            // Atualizar pedido de serviço para atribuir o profissional
            await db_js_1.db
                .update(schema_js_1.serviceRequests)
                .set({
                assignedProfessionalId: offer.professionalId,
                status: 'assigned',
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, offer.serviceRequestId));
            // Definir preço final como o proposto
            await db_js_1.db
                .update(schema_js_1.serviceOffers)
                .set({
                finalPrice: offer.proposedPrice,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            // Criar registro de progresso do serviço
            await db_js_1.db.insert(schema_js_1.serviceProgress).values({
                serviceRequestId: offer.serviceRequestId,
                professionalId: offer.professionalId,
                status: 'accepted'
            });
            // Rejeitar outras propostas para este pedido
            await db_js_1.db
                .update(schema_js_1.serviceOffers)
                .set({ status: 'rejected', updatedAt: new Date() })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, offer.serviceRequestId), (0, drizzle_orm_1.ne)(schema_js_1.serviceOffers.id, offerId)));
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao aceitar proposta:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    // Métodos para gerenciar o progresso do serviço
    async startService(serviceRequestId, professionalId) {
        try {
            console.log('🚀 Iniciando serviço:', serviceRequestId, 'pelo profissional:', professionalId);
            // Verificar se o serviço foi atribuído a este profissional
            const [request] = await db_js_1.db
                .select({
                id: schema_js_1.serviceRequests.id,
                status: schema_js_1.serviceRequests.status,
                assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId
            })
                .from(schema_js_1.serviceRequests)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            if (!request) {
                return { success: false, error: 'Solicitação não encontrada' };
            }
            if (request.assignedProfessionalId !== professionalId) {
                return { success: false, error: 'Serviço não foi atribuído a este profissional' };
            }
            if (request.status !== 'assigned') {
                return { success: false, error: 'Serviço não está em estado de iniciar' };
            }
            // Atualizar status da solicitação
            await db_js_1.db
                .update(schema_js_1.serviceRequests)
                .set({
                status: 'in_progress',
                serviceStartedAt: new Date(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            // Atualizar progresso
            await db_js_1.db
                .update(schema_js_1.serviceProgress)
                .set({
                status: 'started',
                startedAt: new Date(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.serviceRequestId, serviceRequestId), (0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.professionalId, professionalId)));
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao iniciar serviço:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    async completeService(serviceRequestId, professionalId, notes) {
        try {
            console.log('✅ Concluindo serviço:', serviceRequestId, 'pelo profissional:', professionalId);
            // Primeiro, buscar o profissional pelo userId para obter o ID correto
            const [professional] = await db_js_1.db
                .select({ id: schema_js_1.professionals.id })
                .from(schema_js_1.professionals)
                .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.userId, professionalId));
            console.log('🔍 Profissional encontrado:', professional);
            if (!professional) {
                console.log('❌ Profissional não encontrado para userId:', professionalId);
                return { success: false, error: 'Profissional não encontrado' };
            }
            const actualProfessionalId = professional.id;
            console.log('🔍 ID real do profissional:', actualProfessionalId);
            // Verificar se o serviço está em andamento
            const [request] = await db_js_1.db
                .select({
                id: schema_js_1.serviceRequests.id,
                status: schema_js_1.serviceRequests.status,
                assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId
            })
                .from(schema_js_1.serviceRequests)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            if (!request) {
                console.log('❌ Solicitação não encontrada:', serviceRequestId);
                return { success: false, error: 'Solicitação não encontrada' };
            }
            console.log('🔍 Dados da solicitação:', request);
            if (request.assignedProfessionalId !== actualProfessionalId) {
                console.log('❌ Serviço não atribuído a este profissional. Atribuído a:', request.assignedProfessionalId, 'Profissional atual:', actualProfessionalId);
                return { success: false, error: 'Serviço não foi atribuído a este profissional' };
            }
            if (request.status !== 'in_progress' && request.status !== 'open') {
                console.log('❌ Status incorreto do serviço:', request.status, 'Esperado: in_progress ou open');
                return { success: false, error: 'Serviço deve estar em andamento ou aberto com proposta aceita para ser concluído' };
            }
            // Se o status for 'open', verificar se há uma proposta aceita
            if (request.status === 'open') {
                console.log('🔍 Serviço em status open, verificando proposta aceita...');
                const [acceptedOffer] = await db_js_1.db
                    .select({ id: schema_js_1.serviceOffers.id })
                    .from(schema_js_1.serviceOffers)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, serviceRequestId), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, actualProfessionalId), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.status, 'accepted')));
                if (!acceptedOffer) {
                    console.log('❌ Proposta aceita não encontrada para serviço em status open:', serviceRequestId);
                    return { success: false, error: 'Serviço deve ter uma proposta aceita para ser concluído' };
                }
                console.log('✅ Proposta aceita encontrada para serviço em status open:', acceptedOffer.id);
            }
            // Atualizar status da solicitação para aguardando confirmação
            await db_js_1.db
                .update(schema_js_1.serviceRequests)
                .set({
                status: 'awaiting_confirmation',
                serviceCompletedAt: new Date(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            console.log('✅ Status da solicitação atualizado para awaiting_confirmation');
            console.log('✅ Serviço marcado como concluído pelo profissional');
            // Atualizar progresso
            await db_js_1.db
                .update(schema_js_1.serviceProgress)
                .set({
                status: 'awaiting_confirmation',
                completedAt: new Date(),
                notes: notes || null,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.serviceRequestId, serviceRequestId), (0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.professionalId, actualProfessionalId)));
            console.log('✅ Progresso atualizado para awaiting_confirmation');
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao concluir serviço:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    async confirmServiceCompletion(serviceRequestId, clientId) {
        try {
            console.log('✅ Cliente confirmando conclusão do serviço:', serviceRequestId);
            // Buscar informações completas do serviço e proposta aceita
            const [request] = await db_js_1.db
                .select({
                id: schema_js_1.serviceRequests.id,
                status: schema_js_1.serviceRequests.status,
                clientId: schema_js_1.serviceRequests.clientId,
                assignedProfessionalId: schema_js_1.serviceRequests.assignedProfessionalId
            })
                .from(schema_js_1.serviceRequests)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            console.log('🔍 Dados da solicitação encontrada:', request);
            if (!request) {
                console.log('❌ Solicitação não encontrada:', serviceRequestId);
                return { success: false, error: 'Solicitação não encontrada' };
            }
            if (request.clientId !== clientId) {
                console.log('❌ Cliente incorreto:', request.clientId, 'Esperado:', clientId);
                return { success: false, error: 'Serviço não pertence a este cliente' };
            }
            if (request.status !== 'awaiting_confirmation') {
                console.log('❌ Status incorreto do serviço:', request.status, 'Esperado: awaiting_confirmation');
                return { success: false, error: 'Serviço não está aguardando confirmação' };
            }
            if (!request.assignedProfessionalId) {
                console.log('❌ Nenhum profissional designado para serviço:', serviceRequestId);
                return { success: false, error: 'Nenhum profissional foi designado para este serviço' };
            }
            // Buscar a proposta aceita para obter o valor
            const [acceptedOffer] = await db_js_1.db
                .select({
                id: schema_js_1.serviceOffers.id,
                proposedPrice: schema_js_1.serviceOffers.proposedPrice,
                finalPrice: schema_js_1.serviceOffers.finalPrice
            })
                .from(schema_js_1.serviceOffers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, serviceRequestId), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, request.assignedProfessionalId), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.status, 'accepted')));
            console.log('🔍 Proposta aceita encontrada:', acceptedOffer);
            if (!acceptedOffer) {
                console.log('❌ Proposta aceita não encontrada para serviço:', serviceRequestId);
                return { success: false, error: 'Proposta aceita não encontrada' };
            }
            // Determinar o valor final (finalPrice ou proposedPrice)
            const finalAmount = acceptedOffer.finalPrice || acceptedOffer.proposedPrice;
            console.log('💰 Valor final para transação:', finalAmount, 'Tipo:', typeof finalAmount);
            // Criar transação de pagamento
            const transaction = await this.createTransaction({
                serviceRequestId,
                serviceOfferId: acceptedOffer.id,
                clientId,
                professionalId: request.assignedProfessionalId,
                amount: Number(finalAmount),
                status: 'completed',
                type: 'service_payment',
                description: `Pagamento pelo serviço #${serviceRequestId}`,
                paymentMethod: 'pix',
                completedAt: new Date()
            });
            console.log('✅ Transação criada com sucesso:', transaction.id, 'Valor:', transaction.amount);
            // Atualizar status da solicitação para concluído
            await db_js_1.db
                .update(schema_js_1.serviceRequests)
                .set({
                status: 'completed',
                clientConfirmedAt: new Date(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, serviceRequestId));
            console.log('✅ Status da solicitação atualizado para completed');
            // Atualizar progresso para payment_released
            await db_js_1.db
                .update(schema_js_1.serviceProgress)
                .set({
                status: 'payment_released',
                confirmedAt: new Date(),
                paymentReleasedAt: new Date(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.serviceRequestId, serviceRequestId));
            console.log('✅ Progresso atualizado para payment_released');
            // Notificar o profissional sobre o pagamento liberado
            const professional = await this.getProfessional(request.assignedProfessionalId);
            if (professional) {
                await this.createNotification({
                    userId: professional.userId,
                    message: `Pagamento de R$ ${finalAmount} foi liberado pelo serviço #${serviceRequestId}.`,
                    read: false
                });
            }
            // Excluir todas as propostas não aceitas para este serviço
            console.log('🗑️ Excluindo propostas não aceitas...');
            await db_js_1.db
                .delete(schema_js_1.serviceOffers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, serviceRequestId), (0, drizzle_orm_1.ne)(schema_js_1.serviceOffers.status, 'accepted')));
            console.log('✅ Propostas não aceitas excluídas com sucesso');
            console.log('✅ Serviço concluído com sucesso! ID:', serviceRequestId);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao confirmar conclusão do serviço:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    async getServiceProgress(serviceRequestId) {
        try {
            const [progress] = await db_js_1.db
                .select()
                .from(schema_js_1.serviceProgress)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceProgress.serviceRequestId, serviceRequestId));
            return progress || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar progresso do serviço:', error);
            return null;
        }
    }
    async rejectServiceOffer(offerId, userId) {
        try {
            console.log('❌ Rejeitando proposta:', offerId, 'pelo cliente:', userId);
            // Verificar se a proposta existe e pertence ao cliente
            const [offer] = await db_js_1.db
                .select({
                id: schema_js_1.serviceOffers.id,
                status: schema_js_1.serviceOffers.status,
                serviceRequestId: schema_js_1.serviceOffers.serviceRequestId,
                professionalId: schema_js_1.serviceOffers.professionalId,
                clientId: schema_js_1.serviceRequests.clientId
            })
                .from(schema_js_1.serviceOffers)
                .innerJoin(schema_js_1.serviceRequests, (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, schema_js_1.serviceRequests.id))
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            if (!offer) {
                return { success: false, error: 'Proposta não encontrada' };
            }
            if (offer.clientId !== userId) {
                return { success: false, error: 'Proposta não pertence a este cliente' };
            }
            // Apagar a proposta definitivamente
            await this.deleteServiceOffer(offerId);
            // Atualizar contador de respostas na solicitação (decremento seguro)
            const request = await this.getServiceRequest(offer.serviceRequestId);
            if (request) {
                const current = Number(request.responses) || 0;
                const next = current > 0 ? current - 1 : 0;
                await this.updateServiceRequest(offer.serviceRequestId, { responses: next });
            }
            // Notificar o profissional sobre a exclusão
            const professional = await this.getProfessional(offer.professionalId);
            if (professional) {
                const reqDetailed = await this.getServiceRequest(offer.serviceRequestId);
                const serviceLabel = reqDetailed?.serviceType || 'um serviço';
                await this.createNotification({
                    userId: professional.userId,
                    message: `Sua proposta para ${serviceLabel} foi rejeitada e removida pelo cliente.`,
                    read: false
                });
            }
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao rejeitar e excluir proposta:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
    // Transactions
    async createTransaction(transaction) {
        try {
            console.log('✅ Criando transação:', transaction);
            const [newTransaction] = await db_js_1.db
                .insert(schema_js_1.transactions)
                .values(transaction)
                .returning();
            return newTransaction;
        }
        catch (error) {
            console.error('❌ Erro ao criar transação:', error);
            throw error;
        }
    }
    async getTransactionsByProfessional(professionalId) {
        try {
            const professionalTransactions = await db_js_1.db
                .select()
                .from(schema_js_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_js_1.transactions.professionalId, professionalId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.transactions.createdAt));
            return professionalTransactions;
        }
        catch (error) {
            console.error('❌ Erro ao buscar transações do profissional:', error);
            return [];
        }
    }
    async getTransactionsByClient(clientId) {
        try {
            const clientTransactions = await db_js_1.db
                .select()
                .from(schema_js_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_js_1.transactions.clientId, clientId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.transactions.createdAt));
            return clientTransactions;
        }
        catch (error) {
            console.error('❌ Erro ao buscar transações do cliente:', error);
            return [];
        }
    }
    async updateTransactionStatus(id, status) {
        try {
            const [updatedTransaction] = await db_js_1.db
                .update(schema_js_1.transactions)
                .set({
                status,
                updatedAt: new Date(),
                ...(status === 'completed' && { completedAt: new Date() })
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.transactions.id, id))
                .returning();
            return updatedTransaction;
        }
        catch (error) {
            console.error('❌ Erro ao atualizar status da transação:', error);
            throw error;
        }
    }
    async getTransactionById(id) {
        try {
            const [transaction] = await db_js_1.db
                .select()
                .from(schema_js_1.transactions)
                .where((0, drizzle_orm_1.eq)(schema_js_1.transactions.id, id));
            return transaction || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar transação por ID:', error);
            return null;
        }
    }
    // Service Reviews
    async createServiceReview(review) {
        try {
            console.log('✅ Criando avaliação de serviço:', review);
            const [newReview] = await db_js_1.db
                .insert(schema_js_1.serviceReviews)
                .values(review)
                .returning();
            // Atualizar a avaliação média do profissional
            await this.updateProfessionalRating(review.professionalId);
            return newReview;
        }
        catch (error) {
            console.error('❌ Erro ao criar avaliação de serviço:', error);
            throw error;
        }
    }
    async getServiceReviewsByProfessional(professionalId) {
        try {
            const reviews = await db_js_1.db
                .select()
                .from(schema_js_1.serviceReviews)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.professionalId, professionalId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceReviews.createdAt));
            return reviews;
        }
        catch (error) {
            console.error('❌ Erro ao buscar avaliações do profissional:', error);
            throw error;
        }
    }
    async getServiceReviewsByClient(clientId) {
        try {
            const reviews = await db_js_1.db
                .select()
                .from(schema_js_1.serviceReviews)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.clientId, clientId))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceReviews.createdAt));
            return reviews;
        }
        catch (error) {
            console.error('❌ Erro ao buscar avaliações do cliente:', error);
            throw error;
        }
    }
    async getProfessionalCompletedServices(professionalId) {
        try {
            console.log('🔍 Buscando serviços concluídos do profissional:', professionalId);
            const results = await db_js_1.db
                .select({
                serviceRequestId: schema_js_1.serviceRequests.id,
                serviceTitle: schema_js_1.serviceRequests.serviceType,
                clientName: schema_js_1.users.name,
                clientEmail: schema_js_1.users.email,
                amount: (0, drizzle_orm_1.sql) `COALESCE(${schema_js_1.serviceOffers.finalPrice}, ${schema_js_1.serviceOffers.proposedPrice})`,
                status: schema_js_1.serviceRequests.status,
                completedAt: schema_js_1.serviceRequests.clientConfirmedAt,
                // Informações da avaliação
                reviewRating: schema_js_1.serviceReviews.rating,
                reviewComment: schema_js_1.serviceReviews.comment,
                reviewCreatedAt: schema_js_1.serviceReviews.createdAt,
                // Informações da transação
                transactionId: schema_js_1.transactions.id,
                transactionStatus: schema_js_1.transactions.status,
                transactionCompletedAt: schema_js_1.transactions.completedAt
            })
                .from(schema_js_1.serviceRequests)
                .innerJoin(schema_js_1.serviceOffers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.serviceRequestId, schema_js_1.serviceRequests.id), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.status, 'accepted')))
                .innerJoin(schema_js_1.users, (0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.clientId, schema_js_1.users.id))
                .leftJoin(schema_js_1.serviceReviews, (0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.serviceRequestId, schema_js_1.serviceRequests.id))
                .leftJoin(schema_js_1.transactions, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.transactions.serviceRequestId, schema_js_1.serviceRequests.id), (0, drizzle_orm_1.eq)(schema_js_1.transactions.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.transactions.type, 'service_payment')))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.assignedProfessionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.status, 'completed')))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.serviceRequests.clientConfirmedAt));
            console.log('✅ Serviços concluídos encontrados:', results.length);
            console.log('🔍 Dados dos serviços:', results.map((r) => ({ id: r.serviceRequestId, status: r.status, amount: r.amount })));
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
            console.log('✅ Resultados mapeados:', mappedResults.length);
            return mappedResults;
        }
        catch (error) {
            console.error('❌ Erro ao buscar serviços concluídos do profissional:', error);
            throw error;
        }
    }
    async getServiceReviewByService(serviceRequestId) {
        try {
            const [review] = await db_js_1.db
                .select()
                .from(schema_js_1.serviceReviews)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceReviews.serviceRequestId, serviceRequestId));
            return review || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar avaliação do serviço:', error);
            return null;
        }
    }
    async updateProfessionalRating(professionalId) {
        try {
            // Buscar todas as avaliações do profissional
            const reviews = await this.getServiceReviewsByProfessional(professionalId);
            if (reviews.length === 0) {
                // Se não há avaliações, definir como 5.0 (padrão)
                await db_js_1.db
                    .update(schema_js_1.professionals)
                    .set({
                    rating: '5.0',
                    totalReviews: 0
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.id, professionalId));
                return;
            }
            // Calcular nova média
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            // Atualizar profissional com nova avaliação média
            await db_js_1.db
                .update(schema_js_1.professionals)
                .set({
                rating: averageRating.toFixed(1),
                totalReviews: reviews.length
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.id, professionalId));
            console.log(`✅ Avaliação do profissional ${professionalId} atualizada: ${averageRating.toFixed(1)} (${reviews.length} avaliações)`);
        }
        catch (error) {
            console.error('❌ Erro ao atualizar avaliação do profissional:', error);
            throw error;
        }
    }
    // ==================== HELPER METHODS FOR PAYMENTS ====================
    async getServiceOfferById(offerId) {
        try {
            const [result] = await db_js_1.db
                .select()
                .from(schema_js_1.serviceOffers)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            return result || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar oferta de serviço:', error);
            throw error;
        }
    }
    async getServiceRequestById(requestId) {
        try {
            const [result] = await db_js_1.db
                .select()
                .from(schema_js_1.serviceRequests)
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceRequests.id, requestId));
            return result || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar solicitação de serviço:', error);
            throw error;
        }
    }
    async getProfessionalById(professionalId) {
        try {
            const [result] = await db_js_1.db
                .select()
                .from(schema_js_1.professionals)
                .where((0, drizzle_orm_1.eq)(schema_js_1.professionals.id, professionalId));
            return result || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar profissional:', error);
            throw error;
        }
    }
    // ==================== PAYMENT REFERENCES METHODS ====================
    async createPaymentReference(paymentRef) {
        try {
            console.log('💳 Criando referência de pagamento:', paymentRef);
            const [result] = await db_js_1.db
                .insert(schema_js_1.paymentReferences)
                .values(paymentRef)
                .returning();
            console.log('✅ Referência de pagamento criada:', result.id);
            return result;
        }
        catch (error) {
            console.error('❌ Erro ao criar referência de pagamento:', error);
            throw error;
        }
    }
    async getPaymentReferenceByPreferenceId(preferenceId) {
        try {
            console.log('🔍 Buscando referência de pagamento por preference ID:', preferenceId);
            const [result] = await db_js_1.db
                .select()
                .from(schema_js_1.paymentReferences)
                .where((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.preferenceId, preferenceId));
            return result || null;
        }
        catch (error) {
            console.error('❌ Erro ao buscar referência de pagamento:', error);
            throw error;
        }
    }
    async updatePaymentReferenceStatus(preferenceId, status, statusDetail, paymentId, approvedAt) {
        try {
            console.log('📝 Atualizando status da referência de pagamento:', {
                preferenceId,
                status,
                statusDetail,
                paymentId,
                approvedAt
            });
            const updateData = {
                status,
                updatedAt: new Date()
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
            await db_js_1.db
                .update(schema_js_1.paymentReferences)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.preferenceId, preferenceId));
            console.log('✅ Status da referência de pagamento atualizado');
        }
        catch (error) {
            console.error('❌ Erro ao atualizar status da referência de pagamento:', error);
            throw error;
        }
    }
    // Service Offer Status Update
    async updateServiceOfferStatus(offerId, status) {
        try {
            console.log('📝 Atualizando status da proposta:', { offerId, status });
            await db_js_1.db
                .update(schema_js_1.serviceOffers)
                .set({ status, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_js_1.serviceOffers.id, offerId));
            console.log('✅ Status da proposta atualizado');
        }
        catch (error) {
            console.error('❌ Erro ao atualizar status da proposta:', error);
            throw error;
        }
    }
    // ==================== PROVIDER PAYMENT METHODS ====================
    async getProviderPayments(professionalId, filter) {
        try {
            console.log('🔍 Buscando pagamentos do profissional:', { professionalId, filter });
            let whereCondition = (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId);
            if (filter !== 'all') {
                whereCondition = (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.status, filter));
            }
            const result = await db_js_1.db
                .select({
                id: schema_js_1.paymentReferences.id,
                serviceRequestId: schema_js_1.paymentReferences.serviceRequestId,
                serviceOfferId: schema_js_1.paymentReferences.serviceOfferId,
                clientId: schema_js_1.paymentReferences.clientId,
                amount: schema_js_1.paymentReferences.amount,
                status: schema_js_1.paymentReferences.status,
                statusDetail: schema_js_1.paymentReferences.statusDetail,
                externalReference: schema_js_1.paymentReferences.externalReference,
                paymentId: schema_js_1.paymentReferences.paymentId,
                approvedAt: schema_js_1.paymentReferences.approvedAt,
                createdAt: schema_js_1.paymentReferences.createdAt,
                updatedAt: schema_js_1.paymentReferences.updatedAt,
                serviceRequest: {
                    title: schema_js_1.serviceRequests.title,
                    description: schema_js_1.serviceRequests.description,
                    category: schema_js_1.serviceRequests.category
                },
                client: {
                    name: schema_js_1.users.name,
                    email: schema_js_1.users.email
                }
            })
                .from(schema_js_1.paymentReferences)
                .leftJoin(schema_js_1.serviceRequests, (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.serviceRequestId, schema_js_1.serviceRequests.id))
                .leftJoin(schema_js_1.users, (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.clientId, schema_js_1.users.id))
                .where(whereCondition)
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.paymentReferences.createdAt));
            console.log('✅ Pagamentos do profissional encontrados:', result.length);
            return result;
        }
        catch (error) {
            console.error('❌ Erro ao buscar pagamentos do profissional:', error);
            throw error;
        }
    }
    async getProviderPaymentStats(professionalId) {
        try {
            console.log('📊 Calculando estatísticas de pagamento do profissional:', professionalId);
            // Total de ganhos (apenas pagamentos aprovados)
            const [totalEarningsResult] = await db_js_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_js_1.paymentReferences.amount} * 0.95), 0)`
            })
                .from(schema_js_1.paymentReferences)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.status, 'approved')));
            // Pagamentos pendentes
            const [pendingResult] = await db_js_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(schema_js_1.paymentReferences)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.status, 'pending')));
            // Pagamentos aprovados
            const [approvedResult] = await db_js_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(schema_js_1.paymentReferences)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.status, 'approved')));
            // Ganhos do mês atual
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);
            const [monthlyResult] = await db_js_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${schema_js_1.paymentReferences.amount} * 0.95), 0)`
            })
                .from(schema_js_1.paymentReferences)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.professionalId, professionalId), (0, drizzle_orm_1.eq)(schema_js_1.paymentReferences.status, 'approved'), (0, drizzle_orm_1.gte)(schema_js_1.paymentReferences.approvedAt, currentMonth)));
            const stats = {
                totalEarnings: Number(totalEarningsResult?.total || 0),
                pendingPayments: Number(pendingResult?.count || 0),
                completedPayments: Number(approvedResult?.count || 0),
                monthlyEarnings: Number(monthlyResult?.total || 0)
            };
            console.log('✅ Estatísticas calculadas:', stats);
            return stats;
        }
        catch (error) {
            console.error('❌ Erro ao calcular estatísticas de pagamento:', error);
            throw error;
        }
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
