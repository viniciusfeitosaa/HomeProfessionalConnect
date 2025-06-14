import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      // For demo purposes, always return user ID 1
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all professionals
  app.get("/api/professionals", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let professionals;
      if (search && typeof search === 'string') {
        professionals = await storage.searchProfessionals(search);
      } else if (category && typeof category === 'string') {
        professionals = await storage.getProfessionalsByCategory(category);
      } else {
        professionals = await storage.getAllProfessionals();
      }
      
      res.json(professionals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get professional by ID
  app.get("/api/professionals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const professional = await storage.getProfessional(id);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const appointments = await storage.getAppointmentsByUser(1);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const notifications = await storage.getNotificationsByUser(1);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unread notification count
  app.get("/api/notifications/count", async (req, res) => {
    try {
      // For demo purposes, always use user ID 1
      const count = await storage.getUnreadNotificationCount(1);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
