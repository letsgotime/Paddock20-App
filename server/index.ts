import fs from "fs";
import path from "path";
import express from "express";
import { json } from "express";
import { createServer } from "http";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import obdRoutes from "./routes/obdRoutes";
import smartcarRoutes from "./routes/smartcarRoutes";

// Register specialized routes with the main Express app
async function setupSpecializedRoutes(app: express.Express) {
  // Add the OBD routes to the Express app
  app.use('/api/obd', obdRoutes);
  console.log("OBD routes registered successfully");
  
  // Add Smartcar routes
  app.use('/api/smartcar', smartcarRoutes);
  console.log("Smartcar routes registered successfully");
}

async function main() {
  // Create an Express app
  const app = express();
  
  // Use JSON middleware
  app.use(json());
  
  // Create an HTTP server
  const httpServer = createServer(app);
  
  // Set up Vite for development or serve the built client for production
  await setupVite(app, httpServer);
  
  // Set up specialized routes
  await setupSpecializedRoutes(app);
  
  // Register additional routes
  await registerRoutes(app);

  // Set the port
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  
  // Start listening
  httpServer.listen(port, "0.0.0.0", () => {
    const addr = httpServer.address();
    if (addr && typeof addr !== "string") {
      console.log(`${new Date().toLocaleTimeString()} [express] serving on port ${addr.port}`);
    }
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});