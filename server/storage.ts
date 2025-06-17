import {
  users,
  professionals,
  appointments,
  notifications,
  type User,
  type Professional,
  type Appointment,
  type Notification,
  type InsertUser,
  type InsertProfessional,
  type InsertAppointment,
  type InsertNotification,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Professionals
  getAllProfessionals(): Promise<Professional[]>;
  getProfessionalsByCategory(category: string): Promise<Professional[]>;
  searchProfessionals(query: string): Promise<Professional[]>;
  getProfessional(id: number): Promise<Professional | undefined>;
  
  // Appointments
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  
  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private professionals: Map<number, Professional>;
  private appointments: Map<number, Appointment>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentProfessionalId: number;
  private currentAppointmentId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.professionals = new Map();
    this.appointments = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentProfessionalId = 1;
    this.currentAppointmentId = 1;
    this.currentNotificationId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Create default users
    const clientUser: User = {
      id: 1,
      username: "gustavo",
      password: "password",
      name: "Gustavo",
      email: "gustavo@email.com",
      phone: "(11) 99999-9999",
      address: "São Paulo, SP",
      profileImage: null,
      userType: "client",
      createdAt: new Date()
    };
    this.users.set(1, clientUser);

    const providerUser: User = {
      id: 2,
      username: "ana_fisio",
      password: "password",
      name: "Ana Carolina Silva",
      email: "ana@email.com",
      phone: "(11) 98888-8888",
      address: "São Paulo, SP",
      profileImage: null,
      userType: "provider",
      createdAt: new Date()
    };
    this.users.set(2, providerUser);
    this.currentUserId = 3;

    // Seed healthcare professionals with new categories
    const professionalsData: Professional[] = [
      {
        id: 1,
        userId: 2,
        name: "Ana Carolina Silva",
        specialization: "Fisioterapia Respiratória e Neurológica",
        category: "fisioterapeuta",
        subCategory: "terapias_especializadas",
        description: "Especialista em reabilitação respiratória e neurológica com mais de 8 anos de experiência. Atendo pacientes pós-COVID, AVC e lesões medulares.",
        experience: "8 anos",
        certifications: "CREFITO-3, Especialização em Fisioterapia Respiratória USP",
        availableHours: JSON.stringify({
          monday: ["08:00", "18:00"],
          tuesday: ["08:00", "18:00"],
          wednesday: ["08:00", "18:00"],
          thursday: ["08:00", "18:00"],
          friday: ["08:00", "16:00"],
          saturday: ["08:00", "12:00"]
        }),
        hourlyRate: "120.00",
        rating: "4.9",
        totalReviews: 127,
        location: "Vila Madalena, São Paulo",
        distance: "2.3",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        createdAt: new Date()
      },
      {
        id: 2,
        userId: 3,
        name: "Maria Santos",
        specialization: "Técnica em Enfermagem Domiciliar",
        category: "tecnico_enfermagem",
        subCategory: "curativos_medicacao",
        description: "Técnica em enfermagem especializada em cuidados domiciliares, curativos complexos e administração de medicação. Experiência com pacientes idosos e acamados.",
        experience: "6 anos",
        certifications: "COREN-SP, Curso de Curativos Complexos",
        availableHours: JSON.stringify({
          monday: ["06:00", "18:00"],
          tuesday: ["06:00", "18:00"],
          wednesday: ["06:00", "18:00"],
          thursday: ["06:00", "18:00"],
          friday: ["06:00", "18:00"],
          saturday: ["08:00", "14:00"]
        }),
        hourlyRate: "80.00",
        rating: "4.8",
        totalReviews: 89,
        location: "Pinheiros, São Paulo",
        distance: "3.1",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1594824953857-3bc2358cc3a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        createdAt: new Date()
      },
      {
        id: 3,
        userId: 4,
        name: "João Carlos",
        specialization: "Acompanhante Hospitalar Especializado",
        category: "acompanhante_hospitalar",
        subCategory: "acompanhamento_hospitalar",
        description: "Acompanhante hospitalar com formação em técnico em enfermagem. Especializado em UTI, pós-operatório e cuidados com idosos hospitalizados.",
        experience: "5 anos",
        certifications: "Técnico em Enfermagem, Curso de Acompanhante Hospitalar",
        availableHours: JSON.stringify({
          monday: ["00:00", "23:59"],
          tuesday: ["00:00", "23:59"],
          wednesday: ["00:00", "23:59"],
          thursday: ["00:00", "23:59"],
          friday: ["00:00", "23:59"],
          saturday: ["00:00", "23:59"],
          sunday: ["00:00", "23:59"]
        }),
        hourlyRate: "70.00",
        rating: "4.7",
        totalReviews: 156,
        location: "Vila Olímpia, São Paulo",
        distance: "4.2",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        createdAt: new Date()
      },
      {
        id: 4,
        userId: 5,
        name: "Clara Mendes",
        specialization: "Cuidadora Domiciliar e Companhia",
        category: "acompanhante_hospitalar",
        subCategory: "companhia_apoio_emocional",
        description: "Cuidadora especializada em apoio emocional e companhia para idosos. Oferece cuidados diários, preparação de refeições e suporte para atividades cotidianas.",
        experience: "4 anos",
        certifications: "Curso de Cuidador de Idosos, Primeiros Socorros",
        availableHours: JSON.stringify({
          monday: ["07:00", "19:00"],
          tuesday: ["07:00", "19:00"],
          wednesday: ["07:00", "19:00"],
          thursday: ["07:00", "19:00"],
          friday: ["07:00", "19:00"]
        }),
        hourlyRate: "60.00",
        rating: "4.9",
        totalReviews: 94,
        location: "Jardins, São Paulo",
        distance: "1.8",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1609902726285-00668009ffa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        createdAt: new Date()
      },
      {
        id: 5,
        userId: 6,
        name: "Roberto Silva",
        specialization: "Apoio Domiciliar Integral",
        category: "tecnico_enfermagem",
        subCategory: "preparacao_refeicoes",
        description: "Profissional especializado em cuidados domiciliares integrais, incluindo preparação de refeições especiais, acompanhamento em consultas e compras.",
        experience: "7 anos",
        certifications: "Técnico em Nutrição, Curso de Manipulação de Alimentos",
        availableHours: JSON.stringify({
          monday: ["08:00", "17:00"],
          tuesday: ["08:00", "17:00"],
          wednesday: ["08:00", "17:00"],
          thursday: ["08:00", "17:00"],
          friday: ["08:00", "17:00"]
        }),
        hourlyRate: "75.00",
        rating: "4.6",
        totalReviews: 73,
        location: "Moema, São Paulo",
        distance: "5.1",
        available: false,
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80",
        createdAt: new Date()
      }
    ];

    professionalsData.forEach((prof) => {
      this.professionals.set(prof.id, prof);
    });
    this.currentProfessionalId = professionalsData.length + 1;

    // Seed sample appointments with new structure
    const appointmentsData: Appointment[] = [
      {
        id: 1,
        clientId: 1,
        professionalId: 1,
        professionalName: "Ana Carolina Silva",
        serviceType: "Fisioterapia Respiratória",
        scheduledFor: new Date("2025-06-18T09:00:00"),
        duration: 2,
        totalCost: "240.00",
        status: "confirmed",
        notes: "Sessão de fisioterapia respiratória domiciliar para reabilitação pós-COVID",
        address: "Rua das Flores, 123 - São Paulo, SP",
        createdAt: new Date()
      },
      {
        id: 2,
        clientId: 1,
        professionalId: 3,
        professionalName: "João Carlos",
        serviceType: "Acompanhamento Hospitalar",
        scheduledFor: new Date("2025-06-19T08:00:00"),
        duration: 8,
        totalCost: "560.00",
        status: "pending",
        notes: "Acompanhamento durante cirurgia no Hospital das Clínicas",
        address: "Hospital das Clínicas - São Paulo, SP",
        createdAt: new Date()
      },
      {
        id: 3,
        clientId: 1,
        professionalId: 2,
        professionalName: "Maria Santos",
        serviceType: "Curativos e Medicação",
        scheduledFor: new Date("2025-06-17T14:00:00"),
        duration: 1,
        totalCost: "80.00",
        status: "completed",
        notes: "Curativo pós-operatório e administração de medicação - Concluído",
        address: "Rua das Flores, 123 - São Paulo, SP",
        createdAt: new Date()
      }
    ];

    appointmentsData.forEach((apt) => {
      this.appointments.set(apt.id, apt);
    });
    this.currentAppointmentId = appointmentsData.length + 1;

    // Seed notifications
    const notification1: Notification = {
      id: 1,
      userId: 1,
      message: "Seu agendamento de fisioterapia foi confirmado para amanhã às 09:00",
      read: false,
      createdAt: new Date()
    };
    const notification2: Notification = {
      id: 2,
      userId: 1,
      message: "Nova mensagem de Ana Carolina Silva sobre sua sessão",
      read: false,
      createdAt: new Date()
    };
    this.notifications.set(1, notification1);
    this.notifications.set(2, notification2);
    this.currentNotificationId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      address: insertUser.address || null,
      profileImage: insertUser.profileImage || null,
      userType: insertUser.userType || "client",
      createdAt: insertUser.createdAt || new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }

  async getProfessionalsByCategory(category: string): Promise<Professional[]> {
    return Array.from(this.professionals.values()).filter(
      (professional) => professional.category === category
    );
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.professionals.values()).filter(
      (professional) => 
        professional.name.toLowerCase().includes(lowerQuery) || 
        professional.specialization?.toLowerCase().includes(lowerQuery) ||
        professional.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.clientId === userId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      address: insertAppointment.address || null,
      createdAt: insertAppointment.createdAt || new Date(),
      totalCost: insertAppointment.totalCost || null,
      status: insertAppointment.status || "pending",
      notes: insertAppointment.notes || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId && !notification.read
    ).length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      read: insertNotification.read || false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
}

export const storage = new MemStorage();