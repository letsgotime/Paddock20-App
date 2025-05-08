import fs from "fs";
import path from "path";
import express from "express";
import { json } from "express";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import obdRoutes from "./routes/obdRoutes";

// Register the OBD routes with the main Express app
async function setupOBDRoutes(app: express.Express) {
  // Add the OBD routes to the Express app
  app.use('/api/obd', obdRoutes);
  
  console.log("OBD routes registered successfully");
}

async function main() {
  // Create an Express app
  const app = express();
  
  // Use JSON middleware
  app.use(json());
  
  // Set up Vite for development or serve the built client for production
  await setupVite(app);
  
  // Set up OBD routes
  await setupOBDRoutes(app);
  
  // Register all other routes
  const httpServer = await registerRoutes(app);

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