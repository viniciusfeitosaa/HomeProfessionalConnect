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
  type InsertNotification
} from "@shared/schema";

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
    // Create default user
    const user: User = {
      id: 1,
      username: "gustavo",
      password: "password",
      name: "Gustavo"
    };
    this.users.set(1, user);
    this.currentUserId = 2;

    // Seed health professionals
    const professionalsData: Omit<Professional, 'id'>[] = [
      {
        name: "Dr. Ana Silva",
        service: "Cardiologia",
        category: "médico",
        rating: "4.8",
        distance: "2.5",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1594824953857-3bc2358cc3a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      },
      {
        name: "Enfª Maria Santos",
        service: "Enfermagem Domiciliar",
        category: "enfermagem",
        rating: "4.9",
        distance: "1.8",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      },
      {
        name: "Ft. João Oliveira",
        service: "Fisioterapia",
        category: "fisioterapia",
        rating: "4.7",
        distance: "3.2",
        available: false,
        imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      },
      {
        name: "Psic. Paula Costa",
        service: "Psicologia",
        category: "psicologia",
        rating: "4.6",
        distance: "4.1",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      },
      {
        name: "Nutricionista Pedro Alves",
        service: "Nutrição",
        category: "nutrição",
        rating: "4.5",
        distance: "2.9",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      },
      {
        name: "Cuidadora Lucia Ferreira",
        service: "Cuidadora de Idosos",
        category: "cuidados",
        rating: "4.8",
        distance: "1.5",
        available: true,
        imageUrl: "https://images.unsplash.com/photo-1609902726285-00668009ffa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
      }
    ];

    professionalsData.forEach((prof, index) => {
      const professional: Professional = { ...prof, id: index + 1 };
      this.professionals.set(index + 1, professional);
    });
    this.currentProfessionalId = professionalsData.length + 1;

    // Seed appointments
    const appointmentsData = [
      {
        id: 1,
        userId: 1,
        professionalId: 2,
        professionalName: "Marcos",
        scheduledFor: new Date("2025-06-15T19:30:00"),
        description: "Sua visita com Marcos está marcada para amanhã às 19:30"
      },
      {
        id: 2,
        userId: 1,
        professionalId: 1,
        professionalName: "Pedro Afonso",
        scheduledFor: new Date("2025-06-16T14:00:00"),
        description: "Reparo no encanamento da cozinha"
      },
      {
        id: 3,
        userId: 1,
        professionalId: 2,
        professionalName: "Lucas Abreu",
        scheduledFor: new Date("2025-06-12T10:30:00"),
        description: "Instalação de tomadas extras - Concluído"
      },
      {
        id: 4,
        userId: 1,
        professionalId: 3,
        professionalName: "Carlos Silva",
        scheduledFor: new Date("2025-06-10T16:00:00"),
        description: "Manutenção preventiva do ar-condicionado - Concluído"
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
      message: "Seu agendamento foi confirmado",
      read: false,
      createdAt: new Date()
    };
    const notification2: Notification = {
      id: 2,
      userId: 1,
      message: "Nova mensagem do profissional",
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
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values()).sort((a, b) => 
      parseFloat(a.distance) - parseFloat(b.distance)
    );
  }

  async getProfessionalsByCategory(category: string): Promise<Professional[]> {
    return Array.from(this.professionals.values())
      .filter(prof => prof.category === category)
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  async searchProfessionals(query: string): Promise<Professional[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.professionals.values())
      .filter(prof => 
        prof.name.toLowerCase().includes(lowerQuery) ||
        prof.service.toLowerCase().includes(lowerQuery) ||
        prof.category.toLowerCase().includes(lowerQuery)
      )
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  async getProfessional(id: number): Promise<Professional | undefined> {
    return this.professionals.get(id);
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.read)
      .length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      read: insertNotification.read ?? false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
}

export const storage = new MemStorage();
