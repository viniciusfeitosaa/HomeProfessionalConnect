import {
  users,
  professionals,
  appointments,
  notifications,
  loginAttempts,
  verificationCodes,
  conversations,
  messages,
  serviceRequests,
  serviceOffers,
  serviceProgress,
  transactions,
  serviceReviews,
  paymentReferences,
  type User,
  type Professional,
  type Appointment,
  type Notification,
  type LoginAttempt,
  type VerificationCode,
  type Conversation,
  type Message,
  type ServiceRequest,
  type ServiceOffer,
  type ServiceProgress,
  type Transaction,
  type ServiceReview,
  type PaymentReference,
  type InsertUser,
  type InsertProfessional,
  type InsertAppointment,
  type InsertNotification,
  type InsertLoginAttempt,
  type InsertVerificationCode,
  type InsertConversation,
  type InsertMessage,
  type InsertServiceRequest,
  type InsertServiceOffer,
  type InsertServiceProgress,
  type InsertTransaction,
  type InsertServiceReview,
  type InsertPaymentReference,
  type ServiceRequestStatus,
} from "./schema.js";
import { db } from "./db.js";
import { eq, and, or, gte, ilike, sql, desc, ne } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  updateUserLoginAttempts(id: number, attempts: number): Promise<void>;
  blockUser(id: number): Promise<void>;
  verifyUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Professionals
  getAllProfessionals(): Promise<Professional[]>;
  getProfessionalsByCategory(category: string): Promise<Professional[]>;
  searchProfessionals(query: string): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  getProfessionalByUserId(userId: number): Promise<Professional | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, updates: Partial<Professional>): Promise<Professional>;
  updateProfessionalAvailability(userId: number, available: boolean): Promise<void>;
  
  // Appointments
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByProfessional(professionalId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment>;
  
  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  
  // Security & Anti-fraud
  createLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt>;
  getRecentLoginAttempts(ipAddress: string, minutes: number): Promise<LoginAttempt[]>;
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(code: string, type: string): Promise<VerificationCode | undefined>;
  markCodeAsUsed(id: number): Promise<void>;
  
  // Conversations & Messages
  getConversation(clientId: number, professionalId: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  getLastMessageByConversation(conversationId: number): Promise<Message | undefined>;
  getUnreadMessageCount(conversationId: number, userId: number): Promise<number>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;
  deleteConversation(conversationId: number, userId: number): Promise<void>;
  isConversationDeletedByUser(conversationId: number, userId: number): Promise<boolean>;
  restoreConversation(conversationId: number, userId: number): Promise<void>;
  
  // Service Requests
  getServiceRequestsByClient(clientId: number): Promise<ServiceRequest[]>;
  getServiceRequestsByCategory(category: string): Promise<(ServiceRequest & {
    clientName: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    clientProfileImage: string | null;
    clientCreatedAt: Date | null;
  })[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestWithClient(id: number): Promise<(ServiceRequest & {
    clientName: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    clientProfileImage: string | null;
    clientCreatedAt: Date | null;
  }) | undefined>;
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest>;
  deleteServiceRequest(id: number): Promise<void>;
  assignProfessionalToRequest(requestId: number, professionalId: number): Promise<void>;
  
  // Service Offers
  getServiceOffersByRequest(requestId: number): Promise<(ServiceOffer & {
    professionalName: string | null;
    professionalRating: string | null;
    professionalTotalReviews: number | null;
    professionalProfileImage: string | null;
  })[]>;
  getProposalsByServiceRequest(requestId: number): Promise<(ServiceOffer & {
    professionalName: string | null;
    professionalRating: string | null;
    professionalTotalReviews: number | null;
    professionalProfileImage: string | null;
  })[]>;
  getProposalsByProfessional(professionalId: number): Promise<(ServiceOffer & {
    serviceRequest: ServiceRequest & {
      clientName: string | null;
      clientEmail: string | null;
      clientPhone: string | null;
      clientProfileImage: string | null;
      clientCreatedAt: Date | null;
    };
  })[]>;
  getServiceOffers(serviceRequestId: number): Promise<ServiceOffer[]>;
  createServiceOffer(serviceOffer: InsertServiceOffer): Promise<ServiceOffer>;
  updateServiceOffer(id: number, updates: Partial<ServiceOffer>): Promise<ServiceOffer>;
  deleteServiceOffer(id: number): Promise<void>;
  
  // Service Progress Management
  startService(serviceRequestId: number, professionalId: number): Promise<{ success: boolean; error?: string }>;
  completeService(serviceRequestId: number, professionalId: number, notes?: string): Promise<{ success: boolean; error?: string }>;
  confirmServiceCompletion(serviceRequestId: number, clientId: number): Promise<{ success: boolean; error?: string }>;
  getServiceProgress(serviceRequestId: number): Promise<ServiceProgress | null>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByProfessional(professionalId: number): Promise<Transaction[]>;
  getTransactionsByClient(clientId: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | null>;
  
  // Service Reviews
  createServiceReview(review: InsertServiceReview): Promise<ServiceReview>;
  getServiceReviewsByProfessional(professionalId: number): Promise<ServiceReview[]>;
  getServiceReviewsByClient(clientId: number): Promise<ServiceReview[]>;
  getServiceReviewByService(serviceRequestId: number): Promise<ServiceReview | null>;
  updateProfessionalRating(professionalId: number): Promise<void>;
  
  // Professional Dashboard
  getProfessionalCompletedServices(professionalId: number): Promise<any[]>;
  getServiceOffersForClient(userId: number): Promise<any[]>;
  getServiceOfferById(offerId: number): Promise<ServiceOffer | null>;
  getServiceRequestById(requestId: number): Promise<ServiceRequest | null>;
  getProfessionalById(professionalId: number): Promise<Professional | null>;
  getProfessionalByUserId(userId: number): Promise<Professional | null>;
  updateServiceRequestStatus(requestId: number, status: ServiceRequestStatus): Promise<void>;
  
  // Payment references methods
  createPaymentReference(paymentRef: InsertPaymentReference): Promise<PaymentReference>;
  getPaymentReferenceByPreferenceId(preferenceId: string): Promise<PaymentReference | null>;
  updatePaymentReferenceStatus(preferenceId: string, status: string, statusDetail?: string, paymentId?: string, approvedAt?: Date): Promise<void>;
  
  // Service Offer Status Update
  updateServiceOfferStatus(offerId: number, status: ServiceOffer['status']): Promise<void>;
  
  // Provider Payment Methods
  getProviderPayments(professionalId: number, filter: string): Promise<any[]>;
  getProviderPaymentStats(professionalId: number): Promise<any>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Método para converter URLs relativas em absolutas
  private getFullImageUrl(relativeUrl: string | null): string | null {
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
  async getUser(id: number): Promise<User | undefined> {
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
    } catch (error) {
      console.error('❌ Storage.getUser - Erro:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error('❌ Storage.getAllUsers - Erro:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const allowed = [
      'username', 'password', 'googleId', 'appleId', 'name', 'email', 'phone', 'phoneVerified', 'address', 'profileImage',
      'userType', 'isVerified', 'isBlocked', 'lastLoginAt', 'loginAttempts', 'resetToken', 'resetTokenExpiry', 'updatedAt'
    ];
    const safeUpdates: any = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = (updates as any)[key];
    }
    safeUpdates.updatedAt = new Date();
    const [user] = await db
      .update(users)
      .set(safeUpdates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLoginAttempts(id: number, attempts: number): Promise<void> {
    await db
      .update(users)
      .set({ [users.loginAttempts.name]: attempts, [users.updatedAt.name]: new Date() })
      .where(eq(users.id, id));
  }

  async blockUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ [users.isBlocked.name]: true, [users.updatedAt.name]: new Date() })
      .where(eq(users.id, id));
  }

  async verifyUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ [users.isVerified.name]: true, [users.updatedAt.name]: new Date() })
      .where(eq(users.id, id));
  }

  // Professionals
  async getAllProfessionals(): Promise<Professional[]> {
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
    return professionalsData.map((professional: any) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }

  async getProfessionalsByCategory(category: string): Promise<Professional[]> {
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
      .where(and(eq(professionals.category, category as any), eq(professionals.available, true)));

    // Converter URLs relativas para absolutas
    return professionalsData.map((professional: any) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
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
      .where(
        and(
          eq(professionals.available, true),
          or(
            ilike(professionals.name, `%${query}%`),
            ilike(professionals.specialization, `%${query}%`),
            ilike(professionals.description, `%${query}%`)
          )
        )
      );

    // Converter URLs relativas para absolutas
    return professionalsData.map((professional: any) => ({
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    }));
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
    if (!professional) return undefined;
    
    // Converter URL relativa para absoluta
    return {
      ...professional,
      imageUrl: professional.imageUrl ? this.getFullImageUrl(professional.imageUrl) : null
    };
  }

  async getProfessionalByUserId(userId: number): Promise<Professional | undefined> {
    const [professional] = await db.select().from(professionals).where(eq(professionals.userId, userId));
    return professional || undefined;
  }

  async createProfessional(insertProfessional: InsertProfessional): Promise<Professional> {
    const [professional] = await db
      .insert(professionals)
      .values(insertProfessional)
      .returning();
    return professional;
  }

  async updateProfessional(id: number, updates: Partial<Professional>): Promise<Professional> {
    const [professional] = await db
      .update(professionals)
      .set(updates)
      .where(eq(professionals.id, id))
      .returning();
    return professional;
  }

  async updateProfessionalAvailability(userId: number, available: boolean): Promise<void> {
    await db
      .update(professionals)
      .set({ available })
      .where(eq(professionals.userId, userId));
  }

  // Appointments
  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.clientId, userId));
  }

  async getAppointmentsByProfessional(professionalId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.professionalId, professionalId));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Notifications
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count || 0;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ [notifications.read.name]: true })
      .where(eq(notifications.id, id));
  }

  // Security & Anti-fraud
  async createLoginAttempt(insertLoginAttempt: InsertLoginAttempt): Promise<LoginAttempt> {
    const [loginAttempt] = await db
      .insert(loginAttempts)
      .values(insertLoginAttempt)
      .returning();
    return loginAttempt;
  }

  async getRecentLoginAttempts(ipAddress: string, minutes: number): Promise<LoginAttempt[]> {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
    return await db.select().from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ipAddress, ipAddress),
          gte(loginAttempts.attemptedAt, timeAgo)
        )
      );
  }

  async createVerificationCode(insertVerificationCode: InsertVerificationCode): Promise<VerificationCode> {
    const [verificationCode] = await db
      .insert(verificationCodes)
      .values(insertVerificationCode)
      .returning();
    return verificationCode;
  }

  async getVerificationCode(code: string, type: string): Promise<VerificationCode | undefined> {
    const [verificationCode] = await db.select().from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, type as any),
          eq(verificationCodes.used, false),
          gte(verificationCodes.expiresAt, new Date())
        )
      );
    return verificationCode || undefined;
  }

  async markCodeAsUsed(id: number): Promise<void> {
    await db
      .update(verificationCodes)
      .set({ [verificationCodes.used.name]: true })
      .where(eq(verificationCodes.id, id));
  }

  // Conversations & Messages

  async getConversation(clientId: number, professionalId: number): Promise<Conversation | undefined> {
    const result = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.clientId, clientId),
          eq(conversations.professionalId, professionalId)
        )
      )
      .limit(1);
    return result[0];
  }

  // Verificar se uma conversa foi deletada pelo usuário
  async isConversationDeletedByUser(conversationId: number, userId: number): Promise<boolean> {
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
    } else if (conv.professionalId === userId) {
      return conv.deletedByProfessional === true;
    }
    
    return false;
  }

  // Restaurar conversa (marcar como não deletada pelo usuário)
  async restoreConversation(conversationId: number, userId: number): Promise<void> {
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    
    if (!conversation[0]) {
      throw new Error('Conversa não encontrada');
    }

    const conv = conversation[0];
    const updates: any = {};

    if (conv.clientId === userId) {
      updates.deletedByClient = false;
    } else if (conv.professionalId === userId) {
      updates.deletedByProfessional = false;
    } else {
      throw new Error('Usuário não é participante da conversa');
    }

    await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, conversationId));
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    console.log(`🔍 getConversationsByUser(${userId}) - Iniciando busca...`);
    
    // Buscar todas as conversas do usuário (sem filtro de deletadas)
    const allUserConversations = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.clientId, userId),
          eq(conversations.professionalId, userId)
        )
      );
    
    console.log(`📋 Todas as conversas do usuário ${userId}:`, allUserConversations.map((c: any) => ({ 
      id: c.id, 
      clientId: c.clientId, 
      professionalId: c.professionalId,
      deletedByClient: c.deletedByClient,
      deletedByProfessional: c.deletedByProfessional
    })));
    
    // Verificar se o usuário é cliente ou profissional
    const asClient = allUserConversations.filter((c: any) => c.clientId === userId);
    const asProfessional = allUserConversations.filter((c: any) => c.professionalId === userId);
    
    console.log(`📊 Usuário ${userId} - Como cliente: ${asClient.length}, Como profissional: ${asProfessional.length}`);
    
    // Agora aplicar o filtro de conversas não deletadas
    const result = await db
      .select()
      .from(conversations)
      .where(
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
    
    console.log(`✅ Conversas filtradas para usuário ${userId}:`, result.map((c: any) => ({ 
      id: c.id, 
      clientId: c.clientId, 
      professionalId: c.professionalId,
      deletedByClient: c.deletedByClient,
      deletedByProfessional: c.deletedByProfessional
    })));
    
    return result;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return result[0];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db
      .insert(messages)
      .values(message)
      .returning();
    return result[0];
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async getLastMessageByConversation(conversationId: number): Promise<Message | undefined> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.timestamp))
      .limit(1);
    return result[0];
  }

  async getUnreadMessageCount(conversationId: number, userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId),
          eq(messages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId),
          eq(messages.isRead, false)
        )
      );
  }

  // Excluir todas as mensagens de uma conversa
  async deleteMessagesByConversation(conversationId: number): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, conversationId));
  }
  // Marcar conversa como deletada pelo usuário (exclusão individual)
  async deleteConversation(conversationId: number, userId: number): Promise<void> {
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
    const updates: any = {};

    if (conv.clientId === userId) {
      updates.deletedByClient = true;
    } else if (conv.professionalId === userId) {
      updates.deletedByProfessional = true;
    } else {
      throw new Error('Usuário não é participante da conversa');
    }

    await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, conversationId));
  }

  // Service Requests
  async getServiceRequestsByClient(clientId: number): Promise<ServiceRequest[]> {
    return await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.clientId, clientId))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequestsByCategory(category: string): Promise<(ServiceRequest & {
    clientName: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    clientProfileImage: string | null;
    clientCreatedAt: Date | null;
  })[]> {
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
        serviceStartedAt: serviceRequests.serviceStartedAt,
        serviceCompletedAt: serviceRequests.serviceCompletedAt,
        clientConfirmedAt: serviceRequests.clientConfirmedAt,
        
        // Client information
        clientName: users.name,
        clientEmail: users.email,
        clientPhone: users.phone,
        clientProfileImage: users.profileImage,
        clientCreatedAt: users.createdAt
      })
      .from(serviceRequests)
      .innerJoin(users, eq(serviceRequests.clientId, users.id))
      .where(eq(serviceRequests.category, category as any))
      .orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    const [serviceRequest] = await db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id));
    return serviceRequest || undefined;
  }

  async getServiceRequestWithClient(id: number): Promise<(ServiceRequest & {
    clientName: string | null;
    clientEmail: string | null;
    clientPhone: string | null;
    clientProfileImage: string | null;
    clientCreatedAt: Date | null;
  }) | undefined> {
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
        serviceStartedAt: serviceRequests.serviceStartedAt,
        serviceCompletedAt: serviceRequests.serviceCompletedAt,
        clientConfirmedAt: serviceRequests.clientConfirmedAt,
        
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

  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .insert(serviceRequests)
      .values(insertServiceRequest)
      .returning();
    return serviceRequest;
  }

  async updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest> {
    const [serviceRequest] = await db
      .update(serviceRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();
    return serviceRequest;
  }

  async deleteServiceRequest(id: number): Promise<void> {
    console.log('🗑️ Excluindo service request ID:', id);
    
    // Primeiro, excluir todas as propostas relacionadas a este service request
    await this.deleteServiceOffersByRequest(id);
    
    // Depois, excluir o service request
    await db
      .delete(serviceRequests)
      .where(eq(serviceRequests.id, id));
    
    console.log('✅ Service request excluído com sucesso');
  }

  async assignProfessionalToRequest(requestId: number, professionalId: number): Promise<void> {
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
  async getServiceOffersByRequest(requestId: number): Promise<(ServiceOffer & {
    professionalName: string | null;
    professionalRating: string | null;
    professionalTotalReviews: number | null;
    professionalProfileImage: string | null;
  })[]> {
    return await db
      .select({
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
      })
      .from(serviceOffers)
      .innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id))
      .where(eq(serviceOffers.serviceRequestId, requestId))
      .orderBy(desc(serviceOffers.createdAt));
  }

  async getProposalsByServiceRequest(requestId: number): Promise<(ServiceOffer & {
    professionalName: string | null;
    professionalRating: string | null;
    professionalTotalReviews: number | null;
    professionalProfileImage: string | null;
  })[]> {
    return await db
      .select({
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
      })
      .from(serviceOffers)
      .innerJoin(professionals, eq(serviceOffers.professionalId, professionals.id))
      .where(eq(serviceOffers.serviceRequestId, requestId))
      .orderBy(desc(serviceOffers.createdAt));
  }

  async getProposalsByProfessional(professionalId: number): Promise<(ServiceOffer & {
    serviceRequest: ServiceRequest & {
      clientName: string | null;
      clientEmail: string | null;
      clientPhone: string | null;
      clientProfileImage: string | null;
      clientCreatedAt: Date | null;
    };
  })[]> {
    const results = await db
      .select({
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
      })
      .from(serviceOffers)
      .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
      .innerJoin(users, eq(serviceRequests.clientId, users.id))
      .where(eq(serviceOffers.professionalId, professionalId))
      .orderBy(desc(serviceOffers.createdAt));

    return results.map((result: any) => ({
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

  async getServiceOffers(serviceRequestId: number): Promise<ServiceOffer[]> {
    return await db
      .select()
      .from(serviceOffers)
      .where(eq(serviceOffers.serviceRequestId, serviceRequestId))
      .orderBy(desc(serviceOffers.createdAt));
  }

  async createServiceOffer(serviceOffer: InsertServiceOffer): Promise<ServiceOffer> {
    const [offer] = await db
      .insert(serviceOffers)
      .values(serviceOffer)
      .returning();
    return offer;
  }

  async updateServiceOffer(id: number, updates: Partial<ServiceOffer>): Promise<ServiceOffer> {
    const [offer] = await db
      .update(serviceOffers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceOffers.id, id))
      .returning();
    return offer;
  }

  async deleteServiceOffer(id: number): Promise<void> {
    await db
      .delete(serviceOffers)
      .where(eq(serviceOffers.id, id));
  }

  async deleteServiceOffersByRequest(serviceRequestId: number): Promise<void> {
    console.log('🗑️ Excluindo todas as propostas do service request ID:', serviceRequestId);
    await db
      .delete(serviceOffers)
      .where(eq(serviceOffers.serviceRequestId, serviceRequestId));
    console.log('✅ Todas as propostas excluídas com sucesso');
  }

  // ==================== SERVICE REQUESTS FOR CLIENT ====================

  async getServiceRequestsForClient(userId: number): Promise<any[]> {
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

      return results.map((result: any) => ({
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
      console.error('❌ Erro em getServiceRequestsForClient:', error);
      throw error; // Re-throw para ser tratado na rota
    }
  }

  // ==================== SERVICE OFFERS FOR CLIENT ====================

  async getServiceOffersForClient(userId: number): Promise<any[]> {
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
        .leftJoin(serviceReviews, and(
          eq(serviceReviews.serviceRequestId, serviceRequests.id),
          eq(serviceReviews.clientId, userId)
        ))
        .where(eq(serviceRequests.clientId, userId))
        .orderBy(desc(serviceOffers.createdAt));

      console.log('✅ Propostas encontradas:', results.length);

      return results.map((result: any) => ({
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
    } catch (error) {
      console.error('❌ Erro em getServiceOffersForClient:', error);
      throw error; // Re-throw para ser tratado na rota
    }
  }

  async acceptServiceOffer(offerId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('✅ Aceitando proposta:', offerId, 'pelo cliente:', userId);
      
      // Verificar se a proposta existe e pertence ao cliente
      const [offer] = await db
        .select({
          id: serviceOffers.id,
          serviceRequestId: serviceOffers.serviceRequestId,
          professionalId: serviceOffers.professionalId,
          proposedPrice: serviceOffers.proposedPrice,
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
        .where(and(
          eq(serviceOffers.serviceRequestId, offer.serviceRequestId),
          ne(serviceOffers.id, offerId)
        ));

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao aceitar proposta:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Métodos para gerenciar o progresso do serviço
  async startService(serviceRequestId: number, professionalId: number): Promise<{ success: boolean; error?: string }> {
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
        .where(and(
          eq(serviceProgress.serviceRequestId, serviceRequestId),
          eq(serviceProgress.professionalId, professionalId)
        ));

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao iniciar serviço:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async completeService(serviceRequestId: number, professionalId: number, notes?: string): Promise<{ success: boolean; error?: string }> {
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
          .where(and(
            eq(serviceOffers.serviceRequestId, serviceRequestId),
            eq(serviceOffers.professionalId, actualProfessionalId),
            eq(serviceOffers.status, 'accepted')
          ));

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
        .where(and(
          eq(serviceProgress.serviceRequestId, serviceRequestId),
          eq(serviceProgress.professionalId, actualProfessionalId)
        ));
      console.log('✅ Progresso atualizado para awaiting_confirmation');

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao concluir serviço:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async confirmServiceCompletion(serviceRequestId: number, clientId: number): Promise<{ success: boolean; error?: string }> {
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
        .where(and(
          eq(serviceOffers.serviceRequestId, serviceRequestId),
          eq(serviceOffers.professionalId, request.assignedProfessionalId),
          eq(serviceOffers.status, 'accepted')
        ));
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
        .where(and(
          eq(serviceOffers.serviceRequestId, serviceRequestId),
          ne(serviceOffers.status, 'accepted')
        ));

      console.log('✅ Propostas não aceitas excluídas com sucesso');
      console.log('✅ Serviço concluído com sucesso! ID:', serviceRequestId);

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao confirmar conclusão do serviço:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async getServiceProgress(serviceRequestId: number): Promise<ServiceProgress | null> {
    try {
      const [progress] = await db
        .select()
        .from(serviceProgress)
        .where(eq(serviceProgress.serviceRequestId, serviceRequestId));

      return progress || null;
    } catch (error) {
      console.error('❌ Erro ao buscar progresso do serviço:', error);
      return null;
    }
  }

  async rejectServiceOffer(offerId: number, userId: number): Promise<{ success: boolean; error?: string }> {
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
        const current = Number((request as any).responses) || 0;
        const next = current > 0 ? current - 1 : 0;
        await this.updateServiceRequest(offer.serviceRequestId, { responses: next as any });
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
    } catch (error) {
      console.error('❌ Erro ao rejeitar e excluir proposta:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      console.log('✅ Criando transação:', transaction);
      const [newTransaction] = await db
        .insert(transactions)
        .values(transaction)
        .returning();
      return newTransaction;
    } catch (error) {
      console.error('❌ Erro ao criar transação:', error);
      throw error;
    }
  }

  async getTransactionsByProfessional(professionalId: number): Promise<Transaction[]> {
    try {
      const professionalTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.professionalId, professionalId))
        .orderBy(desc(transactions.createdAt));
      return professionalTransactions;
    } catch (error) {
      console.error('❌ Erro ao buscar transações do profissional:', error);
      return [];
    }
  }

  async getTransactionsByClient(clientId: number): Promise<Transaction[]> {
    try {
      const clientTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.clientId, clientId))
        .orderBy(desc(transactions.createdAt));
      return clientTransactions;
    } catch (error) {
      console.error('❌ Erro ao buscar transações do cliente:', error);
      return [];
    }
  }

  async updateTransactionStatus(id: number, status: "pending" | "completed" | "failed" | "refunded"): Promise<Transaction> {
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
    } catch (error) {
      console.error('❌ Erro ao atualizar status da transação:', error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id));
      return transaction || null;
    } catch (error) {
      console.error('❌ Erro ao buscar transação por ID:', error);
      return null;
    }
  }

  // Service Reviews
  async createServiceReview(review: InsertServiceReview): Promise<ServiceReview> {
    try {
      console.log('✅ Criando avaliação de serviço:', review);
      const [newReview] = await db
        .insert(serviceReviews)
        .values(review)
        .returning();
      
      // Atualizar a avaliação média do profissional
      await this.updateProfessionalRating(review.professionalId);
      
      return newReview;
    } catch (error) {
      console.error('❌ Erro ao criar avaliação de serviço:', error);
      throw error;
    }
  }

  async getServiceReviewsByProfessional(professionalId: number): Promise<ServiceReview[]> {
    try {
      const reviews = await db
        .select()
        .from(serviceReviews)
        .where(eq(serviceReviews.professionalId, professionalId))
        .orderBy(desc(serviceReviews.createdAt));
      
      return reviews;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do profissional:', error);
      throw error;
    }
  }

  async getServiceReviewsByClient(clientId: number): Promise<ServiceReview[]> {
    try {
      const reviews = await db
        .select()
        .from(serviceReviews)
        .where(eq(serviceReviews.clientId, clientId))
        .orderBy(desc(serviceReviews.createdAt));
      
      return reviews;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliações do cliente:', error);
      throw error;
    }
  }

  async getProfessionalCompletedServices(professionalId: number): Promise<any[]> {
    try {
      console.log('🔍 Buscando serviços concluídos do profissional:', professionalId);
      
      const results = await db
        .select({
          serviceRequestId: serviceRequests.id,
          serviceTitle: serviceRequests.serviceType,
          clientName: users.name,
          clientEmail: users.email,
          amount: sql`COALESCE(${serviceOffers.finalPrice}, ${serviceOffers.proposedPrice})`,
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
        .innerJoin(serviceOffers, and(
          eq(serviceOffers.serviceRequestId, serviceRequests.id),
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, 'accepted')
        ))
        .innerJoin(users, eq(serviceRequests.clientId, users.id))
        .leftJoin(serviceReviews, eq(serviceReviews.serviceRequestId, serviceRequests.id))
        .leftJoin(transactions, and(
          eq(transactions.serviceRequestId, serviceRequests.id),
          eq(transactions.professionalId, professionalId),
          eq(transactions.type, 'service_payment')
        ))
        .where(and(
          eq(serviceRequests.assignedProfessionalId, professionalId),
          eq(serviceRequests.status, 'completed')
        ))
        .orderBy(desc(serviceRequests.clientConfirmedAt));

      console.log('✅ Serviços concluídos encontrados:', results.length);
      console.log('🔍 Dados dos serviços:', results.map((r: any) => ({ id: r.serviceRequestId, status: r.status, amount: r.amount })));
      
      const mappedResults = results.map((result: any) => ({
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
    } catch (error) {
      console.error('❌ Erro ao buscar serviços concluídos do profissional:', error);
      throw error;
    }
  }

  async getServiceReviewByService(serviceRequestId: number): Promise<ServiceReview | null> {
    try {
      const [review] = await db
        .select()
        .from(serviceReviews)
        .where(eq(serviceReviews.serviceRequestId, serviceRequestId));
      return review || null;
    } catch (error) {
      console.error('❌ Erro ao buscar avaliação do serviço:', error);
      return null;
    }
  }

  async updateProfessionalRating(professionalId: number): Promise<void> {
    try {
      // Buscar todas as avaliações do profissional
      const reviews = await this.getServiceReviewsByProfessional(professionalId);
      
      if (reviews.length === 0) {
        // Se não há avaliações, definir como 5.0 (padrão)
        await db
          .update(professionals)
          .set({ 
            rating: '5.0',
            totalReviews: 0
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
          totalReviews: reviews.length
        })
        .where(eq(professionals.id, professionalId));
      
      console.log(`✅ Avaliação do profissional ${professionalId} atualizada: ${averageRating.toFixed(1)} (${reviews.length} avaliações)`);
    } catch (error) {
      console.error('❌ Erro ao atualizar avaliação do profissional:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS FOR PAYMENTS ====================

  async getServiceOfferById(offerId: number): Promise<ServiceOffer | null> {
    try {
      const [result] = await db
        .select()
        .from(serviceOffers)
        .where(eq(serviceOffers.id, offerId));
      
      return result || null;
    } catch (error) {
      console.error('❌ Erro ao buscar oferta de serviço:', error);
      throw error;
    }
  }

  async getServiceRequestById(requestId: number): Promise<ServiceRequest | null> {
    try {
      const [result] = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.id, requestId));
      
      return result || null;
    } catch (error) {
      console.error('❌ Erro ao buscar solicitação de serviço:', error);
      throw error;
    }
  }

  async getProfessionalById(professionalId: number): Promise<Professional | null> {
    try {
      const [result] = await db
        .select()
        .from(professionals)
        .where(eq(professionals.id, professionalId));
      
      return result || null;
    } catch (error) {
      console.error('❌ Erro ao buscar profissional:', error);
      throw error;
    }
  }

  async getProfessionalByUserId(userId: number): Promise<Professional | null> {
    try {
      const [result] = await db
        .select()
        .from(professionals)
        .where(eq(professionals.userId, userId));
      
      return result || null;
    } catch (error) {
      console.error('❌ Erro ao buscar profissional por user_id:', error);
      throw error;
    }
  }

  // ==================== PAYMENT REFERENCES METHODS ====================

  async createPaymentReference(paymentRef: InsertPaymentReference): Promise<PaymentReference> {
    try {
      console.log('💳 Criando referência de pagamento:', paymentRef);
      
      const [result] = await db
        .insert(paymentReferences)
        .values(paymentRef)
        .returning();
      
      console.log('✅ Referência de pagamento criada:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar referência de pagamento:', error);
      throw error;
    }
  }

  async getPaymentReferenceByPreferenceId(preferenceId: string): Promise<PaymentReference | null> {
    try {
      console.log('🔍 Buscando referência de pagamento por preference ID:', preferenceId);
      
      const [result] = await db
        .select()
        .from(paymentReferences)
        .where(eq(paymentReferences.preferenceId, preferenceId));
      
      return result || null;
    } catch (error) {
      console.error('❌ Erro ao buscar referência de pagamento:', error);
      throw error;
    }
  }

  async updatePaymentReferenceStatus(
    preferenceId: string, 
    status: string, 
    statusDetail?: string, 
    paymentId?: string, 
    approvedAt?: Date
  ): Promise<void> {
    try {
      console.log('📝 Atualizando status da referência de pagamento:', { 
        preferenceId, 
        status, 
        statusDetail, 
        paymentId, 
        approvedAt 
      });
      
      const updateData: any = {
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

      await db
        .update(paymentReferences)
        .set(updateData)
        .where(eq(paymentReferences.preferenceId, preferenceId));
      
      console.log('✅ Status da referência de pagamento atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da referência de pagamento:', error);
      throw error;
    }
  }

  // Service Offer Status Update
  async updateServiceOfferStatus(offerId: number, status: "pending" | "accepted" | "rejected" | "withdrawn" | "paid" | "completed"): Promise<void> {
    try {
      console.log('📝 Atualizando status da proposta:', { offerId, status });
      await db
        .update(serviceOffers)
        .set({ status, updatedAt: new Date() })
        .where(eq(serviceOffers.id, offerId));
      console.log('✅ Status da proposta atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da proposta:', error);
      throw error;
    }
  }

  async updateServiceRequestStatus(requestId: number, status: ServiceRequestStatus): Promise<void> {
    try {
      console.log('📝 Atualizando status da solicitação:', { requestId, status });
      await db
        .update(serviceRequests)
        .set({ status, updatedAt: new Date() })
        .where(eq(serviceRequests.id, requestId));
      console.log('✅ Status da solicitação atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar status da solicitação:', error);
      throw error;
    }
  }

  // ==================== PROVIDER PAYMENT METHODS ====================

  async getProviderPayments(professionalId: number, filter: string): Promise<any[]> {
    try {
      console.log('🔍 Buscando pagamentos do profissional:', { professionalId, filter });
      
      let whereCondition = eq(paymentReferences.professionalId, professionalId);
      
      if (filter !== 'all') {
        whereCondition = and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, filter)
        );
      }

      const result = await db
        .select({
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
        })
        .from(paymentReferences)
        .leftJoin(serviceRequests, eq(paymentReferences.serviceRequestId, serviceRequests.id))
        .leftJoin(users, eq(paymentReferences.clientId, users.id))
        .where(whereCondition)
        .orderBy(desc(paymentReferences.createdAt));

      console.log('✅ Pagamentos do profissional encontrados:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos do profissional:', error);
      throw error;
    }
  }

  async getProviderPaymentStats(professionalId: number): Promise<any> {
    try {
      console.log('📊 Calculando estatísticas de pagamento do profissional:', professionalId);
      
      // Total de ganhos (apenas pagamentos aprovados)
      const [totalEarningsResult] = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(${paymentReferences.amount} * 0.95), 0)` 
        })
        .from(paymentReferences)
        .where(and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, 'approved')
        ));

      // Pagamentos pendentes
      const [pendingResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(paymentReferences)
        .where(and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, 'pending')
        ));

      // Pagamentos aprovados
      const [approvedResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(paymentReferences)
        .where(and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, 'approved')
        ));

      // Ganhos do mês atual
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const [monthlyResult] = await db
        .select({ 
          total: sql<number>`COALESCE(SUM(${paymentReferences.amount} * 0.95), 0)` 
        })
        .from(paymentReferences)
        .where(and(
          eq(paymentReferences.professionalId, professionalId),
          eq(paymentReferences.status, 'approved'),
          gte(paymentReferences.approvedAt, currentMonth)
        ));

      const stats = {
        totalEarnings: Number(totalEarningsResult?.total || 0),
        pendingPayments: Number(pendingResult?.count || 0),
        completedPayments: Number(approvedResult?.count || 0),
        monthlyEarnings: Number(monthlyResult?.total || 0)
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas de pagamento:', error);
      throw error;
    }
  }

  // ==================== PROVIDER APPOINTMENTS ====================

  async getServiceRequestsByProfessional(professionalId: number): Promise<ServiceRequest[]> {
    try {
      console.log('📅 Buscando service requests para profissional ID:', professionalId);
      
      const results = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.assignedProfessionalId, professionalId))
        .orderBy(desc(serviceRequests.createdAt));

      console.log('✅ Service requests encontrados:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Erro em getServiceRequestsByProfessional:', error);
      throw error;
    }
  }

  // ==================== COMPLETED SERVICES BY PROFESSIONAL ====================

  async getCompletedServicesByProfessional(professionalId: number): Promise<ServiceRequest[]> {
    try {
      console.log('📊 Buscando serviços concluídos para profissional ID:', professionalId);
      
      const results = await db
        .select()
        .from(serviceRequests)
        .where(
          and(
            eq(serviceRequests.assignedProfessionalId, professionalId),
            eq(serviceRequests.status, 'completed')
          )
        )
        .orderBy(desc(serviceRequests.updatedAt));

      console.log('✅ Serviços concluídos encontrados:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Erro em getCompletedServicesByProfessional:', error);
      throw error;
    }
  }

  // ==================== PROVIDER PAYMENTS ====================

  async getPaymentsByProfessional(professionalId: number, filter: string = 'all'): Promise<any[]> {
    try {
      console.log('💳 Buscando pagamentos para profissional ID:', professionalId, 'com filtro:', filter);
      
      // Buscar service offers do profissional que foram pagas
      let whereCondition = eq(serviceOffers.professionalId, professionalId);
      
      if (filter === 'approved') {
        whereCondition = and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, 'completed')
        );
      } else if (filter === 'pending') {
        whereCondition = and(
          eq(serviceOffers.professionalId, professionalId),
          eq(serviceOffers.status, 'accepted')
        );
      }

      const results = await db
        .select({
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
        })
        .from(serviceOffers)
        .leftJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
        .leftJoin(users, eq(serviceRequests.clientId, users.id))
        .where(whereCondition)
        .orderBy(desc(serviceOffers.updatedAt));

      console.log('✅ Pagamentos encontrados:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Erro em getPaymentsByProfessional:', error);
      throw error;
    }
  }

  async getPaymentStatsByProfessional(professionalId: number): Promise<any> {
    try {
      console.log('📊 Calculando estatísticas de pagamento para profissional ID:', professionalId);
      
      // Total de propostas
      const totalOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(eq(serviceOffers.professionalId, professionalId));

      // Propostas aprovadas/concluídas
      const completedOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      // Propostas pendentes
      const pendingOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'accepted')
          )
        );

      // Valor total ganho (propostas concluídas)
      const totalEarnings = await db
        .select({ total: sql<number>`sum(${serviceOffers.finalPrice})` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      const stats = {
        totalOffers: Number(totalOffers[0]?.count || 0),
        completedOffers: Number(completedOffers[0]?.count || 0),
        pendingOffers: Number(pendingOffers[0]?.count || 0),
        totalEarnings: Number(totalEarnings[0]?.total || 0)
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro em getPaymentStatsByProfessional:', error);
      throw error;
    }
  }

  // ==================== PROVIDER PROFILE ====================

  async getProviderProfile(professionalId: number): Promise<any> {
    try {
      console.log('👤 Buscando perfil completo do profissional ID:', professionalId);
      
      // Buscar dados básicos do usuário
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, professionalId))
        .limit(1);

      if (userData.length === 0) {
        throw new Error('Profissional não encontrado');
      }

      const user = userData[0];

      // Buscar dados do profissional (inclui campo 'available')
      const professionalData = await db
        .select()
        .from(professionals)
        .where(eq(professionals.userId, professionalId))
        .limit(1);

      const professional = professionalData.length > 0 ? professionalData[0] : null;

      // Buscar estatísticas do profissional
      const totalOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(eq(serviceOffers.professionalId, professionalId));

      const completedOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      const totalEarnings = await db
        .select({ total: sql<number>`sum(${serviceOffers.finalPrice})` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      // Buscar avaliações
      const reviews = await db
        .select({
          rating: serviceReviews.rating,
          comment: serviceReviews.comment,
          createdAt: serviceReviews.createdAt,
          clientName: users.name
        })
        .from(serviceReviews)
        .leftJoin(users, eq(serviceReviews.clientId, users.id))
        .where(eq(serviceReviews.professionalId, professionalId))
        .orderBy(desc(serviceReviews.createdAt))
        .limit(10);

      // Calcular rating médio
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      const profileData = {
        ...user,
        ...professional, // Inclui dados do profissional (com campo 'available')
        stats: {
          totalOffers: Number(totalOffers[0]?.count || 0),
          completedOffers: Number(completedOffers[0]?.count || 0),
          totalEarnings: Number(totalEarnings[0]?.total || 0),
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length
        },
        recentReviews: reviews
      };

      console.log('✅ Perfil do profissional montado com sucesso');
      console.log('✅ Campo available:', professional?.available);
      return profileData;
    } catch (error) {
      console.error('❌ Erro em getProviderProfile:', error);
      throw error;
    }
  }

  // ==================== PROVIDER DASHBOARD OVERVIEW ====================

  async getProviderDashboardData(professionalId: number): Promise<any> {
    try {
      console.log('📊 Buscando dados completos do dashboard para profissional ID:', professionalId);
      
      // Buscar dados básicos do usuário
      const userData = await db
        .select()
        .from(users)
        .where(eq(users.id, professionalId))
        .limit(1);

      if (userData.length === 0) {
        throw new Error('Profissional não encontrado');
      }

      const user = userData[0];

      // Buscar estatísticas de propostas
      const totalOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(eq(serviceOffers.professionalId, professionalId));

      const acceptedOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'accepted')
          )
        );

      const completedOffers = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      // Buscar total de ganhos
      const totalEarnings = await db
        .select({ total: sql<number>`sum(${serviceOffers.finalPrice})` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed')
          )
        );

      // Buscar ganhos do mês atual
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthlyEarnings = await db
        .select({ total: sql<number>`sum(${serviceOffers.finalPrice})` })
        .from(serviceOffers)
        .where(
          and(
            eq(serviceOffers.professionalId, professionalId),
            eq(serviceOffers.status, 'completed'),
            sql`EXTRACT(MONTH FROM ${serviceOffers.updatedAt}) = ${currentMonth}`,
            sql`EXTRACT(YEAR FROM ${serviceOffers.updatedAt}) = ${currentYear}`
          )
        );

      // Buscar serviços disponíveis (service requests abertos)
      const availableServices = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceRequests)
        .where(eq(serviceRequests.status, 'open'));

      // Buscar avaliações e rating médio
      const reviews = await db
        .select({
          rating: serviceReviews.rating,
          comment: serviceReviews.comment,
          createdAt: serviceReviews.createdAt,
          clientName: users.name
        })
        .from(serviceReviews)
        .leftJoin(users, eq(serviceReviews.clientId, users.id))
        .where(eq(serviceReviews.professionalId, professionalId))
        .orderBy(desc(serviceReviews.createdAt))
        .limit(5);

      // Calcular rating médio
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Buscar propostas recentes
      const recentOffers = await db
        .select({
          id: serviceOffers.id,
          proposedPrice: serviceOffers.proposedPrice,
          finalPrice: serviceOffers.finalPrice,
          status: serviceOffers.status,
          createdAt: serviceOffers.createdAt,
          serviceTitle: serviceRequests.serviceType,
          clientName: users.name
        })
        .from(serviceOffers)
        .leftJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
        .leftJoin(users, eq(serviceRequests.clientId, users.id))
        .where(eq(serviceOffers.professionalId, professionalId))
        .orderBy(desc(serviceOffers.createdAt))
        .limit(5);

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

      console.log('✅ Dados do dashboard montados com sucesso');
      return dashboardData;
    } catch (error) {
      console.error('❌ Erro em getProviderDashboardData:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATION FUNCTIONS ====================

  async getUnreadNotificationCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        ));
      
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('❌ Erro em getUnreadNotificationCount:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      return userNotifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        read: notification.read,
        actionUrl: notification.actionUrl
      }));
    } catch (error) {
      console.error('❌ Erro em getUserNotifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        ));
    } catch (error) {
      console.error('❌ Erro em markNotificationAsRead:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error('❌ Erro em markAllNotificationsAsRead:', error);
      throw error;
    }
  }

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId: number;
    actionUrl?: string;
  }): Promise<any> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          actionUrl: data.actionUrl,
          read: false,
          createdAt: new Date()
        })
        .returning();

      return {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        read: notification.read,
        actionUrl: notification.actionUrl
      };
    } catch (error) {
      console.error('❌ Erro em createNotification:', error);
      throw error;
    }
  }

  // Helper function to create notifications for service events
  async createServiceNotification(
    type: 'service_requested' | 'service_accepted' | 'service_completed' | 'payment_received' | 'new_offer' | 'offer_accepted',
    serviceRequestId: number,
    clientId: number,
    professionalId?: number
  ): Promise<void> {
    try {
      const serviceRequest = await this.getServiceRequestById(serviceRequestId);
      const client = await this.getUserById(clientId);
      const professional = professionalId ? await this.getProfessionalById(professionalId) : null;

      let notificationData: {
        type: string;
        title: string;
        message: string;
        userId: number;
        actionUrl?: string;
      };

      switch (type) {
        case 'service_requested':
          notificationData = {
            type: 'info',
            title: 'Nova Solicitação de Serviço',
            message: `Nova solicitação de ${serviceRequest?.serviceType} foi criada`,
            userId: professionalId || 0,
            actionUrl: '/provider-dashboard'
          };
          break;

        case 'service_accepted':
          notificationData = {
            type: 'success',
            title: 'Serviço Aceito',
            message: `Sua solicitação de ${serviceRequest?.serviceType} foi aceita por um profissional`,
            userId: clientId,
            actionUrl: '/my-requests'
          };
          break;

        case 'service_completed':
          notificationData = {
            type: 'success',
            title: 'Serviço Concluído',
            message: `O serviço de ${serviceRequest?.serviceType} foi concluído com sucesso`,
            userId: clientId,
            actionUrl: '/my-requests'
          };
          break;

        case 'payment_received':
          notificationData = {
            type: 'success',
            title: 'Pagamento Recebido',
            message: `Pagamento de R$ ${serviceRequest?.budget} foi processado com sucesso`,
            userId: professionalId || 0,
            actionUrl: '/provider-dashboard'
          };
          break;

        case 'new_offer':
          notificationData = {
            type: 'info',
            title: 'Nova Proposta Recebida',
            message: `Você recebeu uma nova proposta para ${serviceRequest?.serviceType}`,
            userId: clientId,
            actionUrl: '/service-offer'
          };
          break;

        case 'offer_accepted':
          notificationData = {
            type: 'success',
            title: 'Proposta Aceita',
            message: `Sua proposta para ${serviceRequest?.serviceType} foi aceita`,
            userId: professionalId || 0,
            actionUrl: '/provider-dashboard'
          };
          break;

        default:
          return;
      }

      await this.createNotification(notificationData);
    } catch (error) {
      console.error('❌ Erro em createServiceNotification:', error);
      // Não relançar erro para não quebrar o fluxo principal
    }
  }
}

export const storage = new DatabaseStorage();