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
  getProfessionalById(id: number): Promise<Professional | undefined>;
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
    professionalRating: number | null;
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
  createServiceOffer(serviceOffer: InsertServiceOffer): Promise<ServiceOffer>;
  updateServiceOffer(id: number, updates: Partial<ServiceOffer>): Promise<ServiceOffer>;
  deleteServiceOffer(id: number): Promise<void>;
  
  // Service Progress Management
  startService(serviceRequestId: number, professionalId: number): Promise<{ success: boolean; error?: string }>;
  completeService(serviceRequestId: number, professionalId: number, notes?: string): Promise<{ success: boolean; error?: string }>;
  confirmServiceCompletion(serviceRequestId: number, clientId: number): Promise<{ success: boolean; error?: string }>;
  getServiceProgress(serviceRequestId: number): Promise<ServiceProgress | null>;
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
  async getProfessionalById(userId: number): Promise<Professional | undefined> {
    const result = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, userId))
      .limit(1);
    return result[0];
  }

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
    await db
      .delete(serviceRequests)
      .where(eq(serviceRequests.id, id));
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
    professionalRating: number | null;
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

    return results.map((result: any) => ({
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
        serviceTitle: result.serviceTitle
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
        return { success: false, error: 'Solicitação não encontrada' };
      }

      if (request.assignedProfessionalId !== professionalId) {
        return { success: false, error: 'Serviço não foi atribuído a este profissional' };
      }

      if (request.status !== 'in_progress') {
        return { success: false, error: 'Serviço não está em andamento' };
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
          eq(serviceProgress.professionalId, professionalId)
        ));

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao concluir serviço:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  async confirmServiceCompletion(serviceRequestId: number, clientId: number): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('✅ Cliente confirmando conclusão do serviço:', serviceRequestId);
      
      // Verificar se o serviço pertence ao cliente e está aguardando confirmação
      const [request] = await db
        .select({
          id: serviceRequests.id,
          status: serviceRequests.status,
          clientId: serviceRequests.clientId
        })
        .from(serviceRequests)
        .where(eq(serviceRequests.id, serviceRequestId));

      if (!request) {
        return { success: false, error: 'Solicitação não encontrada' };
      }

      if (request.clientId !== clientId) {
        return { success: false, error: 'Serviço não pertence a este cliente' };
      }

      if (request.status !== 'awaiting_confirmation') {
        return { success: false, error: 'Serviço não está aguardando confirmação' };
      }

      // Atualizar status da solicitação para concluído
      await db
        .update(serviceRequests)
        .set({ 
          status: 'completed',
          clientConfirmedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(serviceRequests.id, serviceRequestId));

      // Atualizar progresso
      await db
        .update(serviceProgress)
        .set({ 
          status: 'confirmed',
          confirmedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(serviceProgress.serviceRequestId, serviceRequestId));

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
}

export const storage = new DatabaseStorage();