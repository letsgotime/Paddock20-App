import type { Express } from "express";
import { createServer, type Server } from "http";
import { getAutomotiveWeather } from "./routes/automotive-weather";
import { getEnhancedF1Weather } from "./routes/enhanced-f1-weather";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register the automotive weather API endpoints
  app.get("/api/automotive-weather", getAutomotiveWeather);
  app.get("/api/f1-weather", getEnhancedF1Weather);
  
  // Vehicle endpoints will be added later when vehicle data storage is implemented
  app.get("/api/vehicles", (req, res) => {
    // Return empty array for now - will be replaced with actual vehicle data
    res.json([]);
  });
  
  // Add other routes here

  const httpServer = createServer(app);
  return httpServer;
}