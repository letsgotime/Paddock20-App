import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertDriveEntrySchema } from "../shared/schema";

export function registerRoutes(app: Express): Server {
  // Get all drive entries
  app.get("/api/drive-entries", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const entries = await storage.getDriveEntriesByUserId(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching drive entries:", error);
      res.status(500).json({ error: "Failed to fetch drive entries" });
    }
  });
  
  // Get a single drive entry
  app.get("/api/drive-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Valid ID is required" });
      }
      
      const entry = await storage.getDriveEntry(id);
      
      if (!entry) {
        return res.status(404).json({ error: "Drive entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching drive entry:", error);
      res.status(500).json({ error: "Failed to fetch drive entry" });
    }
  });
  
  // Create a new drive entry
  app.post("/api/drive-entries", async (req, res) => {
    try {
      const validation = insertDriveEntrySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid drive entry data", 
          details: validation.error.format() 
        });
      }
      
      const newEntry = await storage.createDriveEntry(validation.data);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating drive entry:", error);
      res.status(500).json({ error: "Failed to create drive entry" });
    }
  });
  
  // Update a drive entry
  app.put("/api/drive-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Valid ID is required" });
      }
      
      // Create a partial validation schema for updates
      const partialSchema = insertDriveEntrySchema.partial();
      const validation = partialSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid drive entry data", 
          details: validation.error.format() 
        });
      }
      
      const updatedEntry = await storage.updateDriveEntry(id, validation.data);
      
      if (!updatedEntry) {
        return res.status(404).json({ error: "Drive entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating drive entry:", error);
      res.status(500).json({ error: "Failed to update drive entry" });
    }
  });
  
  // Delete a drive entry
  app.delete("/api/drive-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Valid ID is required" });
      }
      
      await storage.deleteDriveEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting drive entry:", error);
      res.status(500).json({ error: "Failed to delete drive entry" });
    }
  });
  
  // Get user vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid userId is required" });
      }
      
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}