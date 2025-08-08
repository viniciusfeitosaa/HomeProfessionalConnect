import { users, professionals, appointments, notifications, loginAttempts, verificationCodes, conversations, messages, serviceRequests, serviceOffers, } from "./schema.js";
import { db } from "./db.js";
import { eq, and, or, gte, ilike, sql, desc, ne } from "drizzle-orm";
// Database Storage Implementation
export class DatabaseStorage {
    // Método para converter URLs relativas em absolutas
    getFullImageUrl(relativeUrl) {
        if (relativeUrl.startsWith('http')) {
            return relativeUrl; // Já é uma URL absoluta
        }
        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://lifebee-backend.onrender.com'
            : 'http://localhost:5000';
        return `${baseUrl}${relativeUrl}`;
    }
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
    // ==================== SERVICE OFFERS FOR CLIENT ====================
    async getServiceOffersForClient(userId) {
        console.log('🔍 Buscando propostas para cliente ID:', userId);
        const results = await db
            .select({
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
            professionalProfileImage: professionals.imageUrl,
        })
            .from(serviceOffers)
            .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
            .innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id))
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
                status: 'in_progress',
                updatedAt: new Date()
            })
                .where(eq(serviceRequests.id, offer.serviceRequestId));
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
    async rejectServiceOffer(offerId, userId) {
        try {
            console.log('❌ Rejeitando proposta:', offerId, 'pelo cliente:', userId);
            // Verificar se a proposta existe e pertence ao cliente
            const [offer] = await db
                .select({
                id: serviceOffers.id,
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
            // Atualizar proposta para rejeitada
            await db
                .update(serviceOffers)
                .set({ status: 'rejected', updatedAt: new Date() })
                .where(eq(serviceOffers.id, offerId));
            return { success: true };
        }
        catch (error) {
            console.error('❌ Erro ao rejeitar proposta:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
}
export const storage = new DatabaseStorage();
