import { users, professionals, appointments, notifications, loginAttempts, verificationCodes, conversations, messages, serviceRequests, serviceOffers, serviceProgress, transactions, serviceReviews, } from "./schema.js";
import { db } from "./db.js";
import { eq, and, or, gte, ilike, sql, desc, ne } from "drizzle-orm";
// Database Storage Implementation
export class DatabaseStorage {
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
            const [user] = await db.select().from(users).where(eq(users.id, id));
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
            const allUsers = await db.select().from(users);
            return allUsers;
        }
        catch (error) {
            console.error('❌ Storage.getAllUsers - Erro:', error);
            throw error;
        }
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
    async getUserByAppleId(appleId) {
        const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
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
            'username', 'password', 'googleId', 'appleId', 'name', 'email', 'phone', 'phoneVerified', 'address', 'profileImage',
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
        // Converter URLs relativas para absolutas
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
        }).from(professionals)
            .where(and(eq(professionals.category, category), eq(professionals.available, true)));
        // Converter URLs relativas para absolutas
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
        }).from(professionals)
            .where(and(eq(professionals.available, true), or(ilike(professionals.name, `%${query}%`), ilike(professionals.specialization, `%${query}%`), ilike(professionals.description, `%${query}%`))));
        // Converter URLs relativas para absolutas
        return professionalsData.map((professional) => ({
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        }));
    }
    async getProfessional(id) {
        const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
        if (!professional)
            return undefined;
        // Converter URL relativa para absoluta
        return {
            ...professional,
            imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
        };
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
    async updateProfessionalAvailability(userId, available) {
        await db
            .update(professionals)
            .set({ available })
            .where(eq(professionals.userId, userId));
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
            .select({
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
        })
            .from(serviceRequests)
            .innerJoin(users, eq(serviceRequests.clientId, users.id))
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
    async getServiceRequestWithClient(id) {
        const [result] = await db
            .select({
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
        })
            .from(serviceRequests)
            .innerJoin(users, eq(serviceRequests.clientId, users.id))
            .where(eq(serviceRequests.id, id));
        return result || undefined;
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
    // Service Offers
    async getServiceOffersByRequest(requestId) {
        return await db
            .select({
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
        })
            .from(serviceOffers)
            .innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id))
            .where(eq(serviceOffers.serviceRequestId, requestId))
            .orderBy(desc(serviceOffers.createdAt));
    }
    async getProposalsByProfessional(professionalId) {
        const results = await db
            .select({
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
        })
            .from(serviceOffers)
            .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
            .innerJoin(users, eq(serviceRequests.clientId, users.id))
            .where(eq(serviceOffers.professionalId, professionalId))
            .orderBy(desc(serviceOffers.createdAt));
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
    async getServiceOffers(serviceRequestId) {
        return await db
            .select()
            .from(serviceOffers)
            .where(eq(serviceOffers.serviceRequestId, serviceRequestId))
            .orderBy(desc(serviceOffers.createdAt));
    }
    async createServiceOffer(serviceOffer) {
        const [offer] = await db
            .insert(serviceOffers)
            .values(serviceOffer)
            .returning();
        return offer;
    }
    async updateServiceOffer(id, updates) {
        const [offer] = await db
            .update(serviceOffers)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(serviceOffers.id, id))
            .returning();
        return offer;
    }
    async deleteServiceOffer(id) {
        await db
            .delete(serviceOffers)
            .where(eq(serviceOffers.id, id));
    }
    // ==================== SERVICE REQUESTS FOR CLIENT ====================
    async getServiceRequestsForClient(userId) {
        try {
            console.log('🔍 Buscando pedidos para cliente ID:', userId);
            if (!userId || isNaN(userId)) {
                throw new Error('ID do usuário inválido');
            }
            const results = await db
                .select({
                id: serviceRequests.id,
                title: serviceRequests.serviceType,
                description: serviceRequests.description,
                category: serviceRequests.serviceType,
                budget: serviceRequests.budget,
                location: serviceRequests.address,
                urgency: serviceRequests.urgency,
                status: serviceRequests.status,
                createdAt: serviceRequests.createdAt,
                responses: serviceRequests.responses,
            })
                .from(serviceRequests)
                .where(eq(serviceRequests.clientId, userId))
                .orderBy(desc(serviceRequests.createdAt));
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
            const results = await db
                .select({
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
                professionalRating: professionals.rating,
                professionalTotalReviews: professionals.totalReviews,
                professionalProfileImage: professionals.imageUrl,
                // Adicionar informações sobre avaliação se o serviço estiver concluído
                hasReview: serviceReviews.id,
                reviewRating: serviceReviews.rating,
                reviewComment: serviceReviews.comment,
                reviewCreatedAt: serviceReviews.createdAt
            })
                .from(serviceOffers)
                .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
                .innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id))
                .leftJoin(serviceReviews, and(eq(serviceReviews.serviceRequestId, serviceRequests.id), eq(serviceReviews.clientId, userId)))
                .where(eq(serviceRequests.clientId, userId))
                .orderBy(desc(serviceOffers.createdAt));
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
            const [offer] = await db
                .select({
                id: serviceOffers.id,
                serviceRequestId: serviceOffers.serviceRequestId,
                professionalId: serviceOffers.professionalId,
                status: serviceOffers.status,
                clientId: serviceRequests.clientId
            })
                .from(serviceOffers)
                .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
                .where(eq(serviceOffers.id, offerId));
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
            await db
                .update(serviceOffers)
                .set({ status: 'accepted', updatedAt: new Date() })
                .where(eq(serviceOffers.id, offerId));
            // Atualizar pedido de serviço para atribuir o profissional
            await db
                .update(serviceRequests)
                .set({
                assignedProfessionalId: offer.professionalId,
                status: 'assigned',
                updatedAt: new Date()
            })
                .where(eq(serviceRequests.id, offer.serviceRequestId));
            // Definir preço final como o proposto
            await db
                .update(serviceOffers)
                .set({
                finalPrice: offer.proposedPrice,
                updatedAt: new Date()
            })
                .where(eq(serviceOffers.id, offerId));
            // Criar registro de progresso do serviço
            await db.insert(serviceProgress).values({
                serviceRequestId: offer.serviceRequestId,
                professionalId: offer.professionalId,
                status: 'accepted'
            });
            // Rejeitar outras propostas para este pedido
            await db
                .update(serviceOffers)
                .set({ status: 'rejected', updatedAt: new Date() })
                .where(and(eq(serviceOffers.serviceRequestId, offer.serviceRequestId), ne(serviceOffers.id, offerId)));
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
            const [request] = await db
                .select({
                id: serviceRequests.id,
                status: serviceRequests.status,
                assignedProfessionalId: serviceRequests.assignedProfessionalId
            })
                .from(serviceRequests)
                .where(eq(serviceRequests.id, serviceRequestId));
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
            await db
                .update(serviceRequests)
                .set({
                status: 'in_progress',
                serviceStartedAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(serviceRequests.id, serviceRequestId));
            // Atualizar progresso
            await db
                .update(serviceProgress)
                .set({
                status: 'started',
                startedAt: new Date(),
                updatedAt: new Date()
            })
                .where(and(eq(serviceProgress.serviceRequestId, serviceRequestId), eq(serviceProgress.professionalId, professionalId)));
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
            const [professional] = await db
                .select({ id: professionals.id })
                .from(professionals)
                .where(eq(professionals.userId, professionalId));
            console.log('🔍 Profissional encontrado:', professional);
            if (!professional) {
                console.log('❌ Profissional não encontrado para userId:', professionalId);
                return { success: false, error: 'Profissional não encontrado' };
            }
            const actualProfessionalId = professional.id;
            console.log('🔍 ID real do profissional:', actualProfessionalId);
            // Verificar se o serviço está em andamento
            const [request] = await db
                .select({
                id: serviceRequests.id,
                status: serviceRequests.status,
                assignedProfessionalId: serviceRequests.assignedProfessionalId
            })
                .from(serviceRequests)
                .where(eq(serviceRequests.id, serviceRequestId));
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
                const [acceptedOffer] = await db
                    .select({ id: serviceOffers.id })
                    .from(serviceOffers)
                    .where(and(eq(serviceOffers.serviceRequestId, serviceRequestId), eq(serviceOffers.professionalId, actualProfessionalId), eq(serviceOffers.status, 'accepted')));
                if (!acceptedOffer) {
                    console.log('❌ Proposta aceita não encontrada para serviço em status open:', serviceRequestId);
                    return { success: false, error: 'Serviço deve ter uma proposta aceita para ser concluído' };
                }
                console.log('✅ Proposta aceita encontrada para serviço em status open:', acceptedOffer.id);
            }
            // Atualizar status da solicitação para aguardando confirmação
            await db
                .update(serviceRequests)
                .set({
                status: 'awaiting_confirmation',
                serviceCompletedAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(serviceRequests.id, serviceRequestId));
            console.log('✅ Status da solicitação atualizado para awaiting_confirmation');
            console.log('✅ Serviço marcado como concluído pelo profissional');
            // Atualizar progresso
            await db
                .update(serviceProgress)
                .set({
                status: 'awaiting_confirmation',
                completedAt: new Date(),
                notes: notes || null,
                updatedAt: new Date()
            })
                .where(and(eq(serviceProgress.serviceRequestId, serviceRequestId), eq(serviceProgress.professionalId, actualProfessionalId)));
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
            const [request] = await db
                .select({
                id: serviceRequests.id,
                status: serviceRequests.status,
                clientId: serviceRequests.clientId,
                assignedProfessionalId: serviceRequests.assignedProfessionalId
            })
                .from(serviceRequests)
                .where(eq(serviceRequests.id, serviceRequestId));
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
            const [acceptedOffer] = await db
                .select({
                id: serviceOffers.id,
                proposedPrice: serviceOffers.proposedPrice,
                finalPrice: serviceOffers.finalPrice
            })
                .from(serviceOffers)
                .where(and(eq(serviceOffers.serviceRequestId, serviceRequestId), eq(serviceOffers.professionalId, request.assignedProfessionalId), eq(serviceOffers.status, 'accepted')));
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
            await db
                .update(serviceRequests)
                .set({
                status: 'completed',
                clientConfirmedAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(serviceRequests.id, serviceRequestId));
            console.log('✅ Status da solicitação atualizado para completed');
            // Atualizar progresso para payment_released
            await db
                .update(serviceProgress)
                .set({
                status: 'payment_released',
                confirmedAt: new Date(),
                paymentReleasedAt: new Date(),
                updatedAt: new Date()
            })
                .where(eq(serviceProgress.serviceRequestId, serviceRequestId));
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
            await db
                .delete(serviceOffers)
                .where(and(eq(serviceOffers.serviceRequestId, serviceRequestId), ne(serviceOffers.status, 'accepted')));
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
            const [progress] = await db
                .select()
                .from(serviceProgress)
                .where(eq(serviceProgress.serviceRequestId, serviceRequestId));
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
            const [offer] = await db
                .select({
                id: serviceOffers.id,
                status: serviceOffers.status,
                serviceRequestId: serviceOffers.serviceRequestId,
                professionalId: serviceOffers.professionalId,
                clientId: serviceRequests.clientId
            })
                .from(serviceOffers)
                .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
                .where(eq(serviceOffers.id, offerId));
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
            const [newTransaction] = await db
                .insert(transactions)
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
            const professionalTransactions = await db
                .select()
                .from(transactions)
                .where(eq(transactions.professionalId, professionalId))
                .orderBy(desc(transactions.createdAt));
            return professionalTransactions;
        }
        catch (error) {
            console.error('❌ Erro ao buscar transações do profissional:', error);
            return [];
        }
    }
    async getTransactionsByClient(clientId) {
        try {
            const clientTransactions = await db
                .select()
                .from(transactions)
                .where(eq(transactions.clientId, clientId))
                .orderBy(desc(transactions.createdAt));
            return clientTransactions;
        }
        catch (error) {
            console.error('❌ Erro ao buscar transações do cliente:', error);
            return [];
        }
    }
    async updateTransactionStatus(id, status) {
        try {
            const [updatedTransaction] = await db
                .update(transactions)
                .set({
                status,
                updatedAt: new Date(),
                ...(status === 'completed' && { completedAt: new Date() })
            })
                .where(eq(transactions.id, id))
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
            const [transaction] = await db
                .select()
                .from(transactions)
                .where(eq(transactions.id, id));
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
            const [newReview] = await db
                .insert(serviceReviews)
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
            const reviews = await db
                .select()
                .from(serviceReviews)
                .where(eq(serviceReviews.professionalId, professionalId))
                .orderBy(desc(serviceReviews.createdAt));
            return reviews;
        }
        catch (error) {
            console.error('❌ Erro ao buscar avaliações do profissional:', error);
            throw error;
        }
    }
    async getServiceReviewsByClient(clientId) {
        try {
            const reviews = await db
                .select()
                .from(serviceReviews)
                .where(eq(serviceReviews.clientId, clientId))
                .orderBy(desc(serviceReviews.createdAt));
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
            const results = await db
                .select({
                serviceRequestId: serviceRequests.id,
                serviceTitle: serviceRequests.serviceType,
                clientName: users.name,
                clientEmail: users.email,
                amount: sql `COALESCE(${serviceOffers.finalPrice}, ${serviceOffers.proposedPrice})`,
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
            })
                .from(serviceRequests)
                .innerJoin(serviceOffers, and(eq(serviceOffers.serviceRequestId, serviceRequests.id), eq(serviceOffers.professionalId, professionalId), eq(serviceOffers.status, 'accepted')))
                .innerJoin(users, eq(serviceRequests.clientId, users.id))
                .leftJoin(serviceReviews, eq(serviceReviews.serviceRequestId, serviceRequests.id))
                .leftJoin(transactions, and(eq(transactions.serviceRequestId, serviceRequests.id), eq(transactions.professionalId, professionalId), eq(transactions.type, 'service_payment')))
                .where(and(eq(serviceRequests.assignedProfessionalId, professionalId), eq(serviceRequests.status, 'completed')))
                .orderBy(desc(serviceRequests.clientConfirmedAt));
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
            const [review] = await db
                .select()
                .from(serviceReviews)
                .where(eq(serviceReviews.serviceRequestId, serviceRequestId));
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
                await db
                    .update(professionals)
                    .set({
                    rating: '5.0',
                    totalReviews: 0,
                    updatedAt: new Date()
                })
                    .where(eq(professionals.id, professionalId));
                return;
            }
            // Calcular nova média
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            // Atualizar profissional com nova avaliação média
            await db
                .update(professionals)
                .set({
                rating: averageRating.toFixed(1),
                totalReviews: reviews.length,
                updatedAt: new Date()
            })
                .where(eq(professionals.id, professionalId));
            console.log(`✅ Avaliação do profissional ${professionalId} atualizada: ${averageRating.toFixed(1)} (${reviews.length} avaliações)`);
        }
        catch (error) {
            console.error('❌ Erro ao atualizar avaliação do profissional:', error);
            throw error;
        }
    }
}
export const storage = new DatabaseStorage();
