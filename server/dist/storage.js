import { users, professionals, appointments, notifications, loginAttempts, verificationCodes, } from './shared/schema.js';
import { db } from "./db.js";
import { eq, and, or, gte, ilike, sql } from "drizzle-orm";
export class MemStorage {
    constructor() {
        this.users = new Map();
        this.professionals = new Map();
        this.appointments = new Map();
        this.notifications = new Map();
        this.loginAttempts = new Map();
        this.verificationCodes = new Map();
        this.currentUserId = 1;
        this.currentProfessionalId = 1;
        this.currentAppointmentId = 1;
        this.currentNotificationId = 1;
        this.currentLoginAttemptId = 1;
        this.currentVerificationCodeId = 1;
        this.seedData();
    }
    seedData() {
        // Create default users
        const clientUser = {
            id: 1,
            username: "gustavo",
            password: "password",
            googleId: null,
            name: "Gustavo",
            email: "gustavo@email.com",
            phone: "(11) 99999-9999",
            phoneVerified: false,
            address: "São Paulo, SP",
            profileImage: null,
            userType: "client",
            isVerified: true,
            isBlocked: false,
            lastLoginAt: null,
            loginAttempts: 0,
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(1, clientUser);
        const providerUser = {
            id: 2,
            username: "ana_fisio",
            password: "password",
            googleId: null,
            name: "Ana Carolina Silva",
            email: "ana@email.com",
            phone: "(11) 98888-8888",
            phoneVerified: true,
            address: "São Paulo, SP",
            profileImage: null,
            userType: "provider",
            isVerified: true,
            isBlocked: false,
            lastLoginAt: null,
            loginAttempts: 0,
            resetToken: null,
            resetTokenExpiry: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(2, providerUser);
        this.currentUserId = 3;
        // Seed healthcare professionals with new categories
        const professionalsData = [
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
        const appointmentsData = [
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
        const notification1 = {
            id: 1,
            userId: 1,
            message: "Seu agendamento de fisioterapia foi confirmado para amanhã às 09:00",
            read: false,
            createdAt: new Date()
        };
        const notification2 = {
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
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        const users = Array.from(this.users.values());
        return users.find(user => user.username === username);
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email);
    }
    async getUserByGoogleId(googleId) {
        return Array.from(this.users.values()).find(user => user.googleId === googleId);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
            id,
            username: insertUser.username,
            password: insertUser.password || null,
            googleId: insertUser.googleId || null,
            name: insertUser.name,
            email: insertUser.email,
            phone: insertUser.phone || null,
            phoneVerified: insertUser.phoneVerified || false,
            address: insertUser.address || null,
            profileImage: insertUser.profileImage || null,
            userType: insertUser.userType || "client",
            isVerified: insertUser.isVerified || false,
            isBlocked: insertUser.isBlocked || false,
            lastLoginAt: insertUser.lastLoginAt || null,
            loginAttempts: insertUser.loginAttempts || 0,
            resetToken: insertUser.resetToken || null,
            resetTokenExpiry: insertUser.resetTokenExpiry || null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.users.set(id, user);
        return user;
    }
    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user)
            throw new Error("User not found");
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
        const updatedUser = { ...user, ...safeUpdates };
        this.users.set(id, updatedUser);
        return updatedUser;
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
    async createProfessional(professional) {
        const id = this.currentProfessionalId++;
        const newProfessional = {
            id,
            userId: professional.userId,
            name: professional.name,
            specialization: professional.specialization,
            category: professional.category,
            subCategory: professional.subCategory,
            description: professional.description,
            experience: professional.experience || null,
            certifications: professional.certifications || null,
            availableHours: professional.availableHours || null,
            hourlyRate: professional.hourlyRate || null,
            rating: professional.rating || "5.0",
            totalReviews: professional.totalReviews || 0,
            location: professional.location || null,
            distance: professional.distance || null,
            available: professional.available !== undefined ? professional.available : true,
            imageUrl: professional.imageUrl || null,
            createdAt: new Date()
        };
        this.professionals.set(id, newProfessional);
        return newProfessional;
    }
    async updateProfessional(id, updates) {
        const professional = this.professionals.get(id);
        if (!professional)
            throw new Error("Professional not found");
        const updatedProfessional = { ...professional, ...updates };
        this.professionals.set(id, updatedProfessional);
        return updatedProfessional;
    }
    async getAppointmentsByProfessional(professionalId) {
        return Array.from(this.appointments.values()).filter(appointment => appointment.professionalId === professionalId);
    }
    async updateAppointment(id, updates) {
        const appointment = this.appointments.get(id);
        if (!appointment)
            throw new Error("Appointment not found");
        const updatedAppointment = { ...appointment, ...updates };
        this.appointments.set(id, updatedAppointment);
        return updatedAppointment;
    }
    async markNotificationRead(id) {
        await db
            .update(notifications)
            .set({ [notifications.read.name]: true })
            .where(eq(notifications.id, id));
    }
    async createLoginAttempt(attempt) {
        const id = this.currentLoginAttemptId++;
        const loginAttempt = {
            id,
            email: attempt.email || null,
            ipAddress: attempt.ipAddress,
            userAgent: attempt.userAgent || null,
            successful: attempt.successful || false,
            blocked: attempt.blocked || false,
            attemptedAt: new Date()
        };
        this.loginAttempts.set(id, loginAttempt);
        return loginAttempt;
    }
    async getRecentLoginAttempts(ipAddress, minutes) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return Array.from(this.loginAttempts.values()).filter(attempt => attempt.ipAddress === ipAddress && attempt.attemptedAt >= cutoff);
    }
    async createVerificationCode(code) {
        const id = this.currentVerificationCodeId++;
        const verificationCode = {
            id,
            userId: code.userId || null,
            email: code.email || null,
            phone: code.phone || null,
            code: code.code,
            type: code.type,
            expiresAt: code.expiresAt,
            used: code.used || false,
            createdAt: new Date()
        };
        this.verificationCodes.set(id, verificationCode);
        return verificationCode;
    }
    async getVerificationCode(code, type) {
        return Array.from(this.verificationCodes.values()).find(vc => vc.code === code && vc.type === type && !vc.used && vc.expiresAt > new Date());
    }
    async markCodeAsUsed(id) {
        await db
            .update(verificationCodes)
            .set({ [verificationCodes.used.name]: true })
            .where(eq(verificationCodes.id, id));
    }
    async getAllProfessionals() {
        return Array.from(this.professionals.values());
    }
    async getProfessionalsByCategory(category) {
        return Array.from(this.professionals.values()).filter((professional) => professional.category === category);
    }
    async searchProfessionals(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.professionals.values()).filter((professional) => professional.name.toLowerCase().includes(lowerQuery) ||
            professional.specialization?.toLowerCase().includes(lowerQuery) ||
            professional.description?.toLowerCase().includes(lowerQuery));
    }
    async getProfessional(id) {
        return this.professionals.get(id);
    }
    async getAppointmentsByUser(userId) {
        return Array.from(this.appointments.values()).filter((appointment) => appointment.clientId === userId);
    }
    async createAppointment(insertAppointment) {
        const id = this.currentAppointmentId++;
        const appointment = {
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
    async getNotificationsByUser(userId) {
        return Array.from(this.notifications.values()).filter((notification) => notification.userId === userId);
    }
    async getUnreadNotificationCount(userId) {
        return Array.from(this.notifications.values()).filter((notification) => notification.userId === userId && !notification.read).length;
    }
    async createNotification(insertNotification) {
        const id = this.currentNotificationId++;
        const notification = {
            ...insertNotification,
            id,
            read: insertNotification.read || false,
            createdAt: new Date()
        };
        this.notifications.set(id, notification);
        return notification;
    }
}
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
        return await db.select().from(professionals).where(eq(professionals.available, true));
    }
    async getProfessionalsByCategory(category) {
        return await db.select().from(professionals)
            .where(and(eq(professionals.category, category), eq(professionals.available, true)));
    }
    async searchProfessionals(query) {
        return await db.select().from(professionals)
            .where(and(eq(professionals.available, true), or(ilike(professionals.name, `%${query}%`), ilike(professionals.specialization, `%${query}%`), ilike(professionals.description, `%${query}%`))));
    }
    async getProfessional(id) {
        const [professional] = await db.select().from(professionals).where(eq(professionals.id, id));
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
}
export const storage = new DatabaseStorage();
