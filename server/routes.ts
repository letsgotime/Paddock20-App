import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertTireSchema, 
  insertMaintenanceRecordSchema, 
  insertMaintenanceFlagSchema, 
  insertGlossTrackingSchema,
  insertGlossLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/forecast', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch forecast data' });
    }
  });
  
  // OneCall API route - combines current, minutely, hourly, daily forecast in one call
  app.get('/api/onecall', async (req, res) => {
    try {
      const { lat, lon, units, exclude } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
      let url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      // Add exclude parameter if provided
      if (exclude) {
        url += `&exclude=${exclude}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OneCall API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch OneCall weather data' });
    }
  });

  app.get('/api/location', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return res.status(404).json({ message: `No location found for: ${q}` });
      }
      
      const result = data[0];
      res.json({
        id: Date.now().toString(),
        name: result.name,
        lat: result.lat,
        lon: result.lon
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to search location' });
    }
  });

  // Vehicle Management API Routes
  
  // Vehicle Routes
  app.get('/api/vehicles', async (req, res) => {
    try {
      const userId = Number(req.query.userId) || 1; // Default to user 1 for demo
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicles' });
    }
  });
  
  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicle' });
    }
  });
  
  app.post('/api/vehicles', async (req, res) => {
    try {
      const validationResult = insertVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid vehicle data', errors: validationResult.error.errors });
      }
      
      const vehicle = await storage.createVehicle(validationResult.data);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create vehicle' });
    }
  });
  
  app.patch('/api/vehicles/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid vehicle data', errors: validationResult.error.errors });
      }
      
      const vehicle = await storage.updateVehicle(id, validationResult.data);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update vehicle' });
    }
  });
  
  // Tire Routes
  app.get('/api/vehicles/:vehicleId/tires', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const tire = await storage.getTireByVehicleId(vehicleId);
      
      if (!tire) {
        return res.status(404).json({ message: 'Tire not found for this vehicle' });
      }
      
      res.json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch tire' });
    }
  });
  
  app.post('/api/tires', async (req, res) => {
    try {
      const validationResult = insertTireSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid tire data', errors: validationResult.error.errors });
      }
      
      const tire = await storage.createTire(validationResult.data);
      res.status(201).json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create tire' });
    }
  });
  
  app.patch('/api/tires/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertTireSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid tire data', errors: validationResult.error.errors });
      }
      
      const tire = await storage.updateTire(id, validationResult.data);
      
      if (!tire) {
        return res.status(404).json({ message: 'Tire not found' });
      }
      
      res.json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update tire' });
    }
  });
  
  // Maintenance Record Routes
  app.get('/api/vehicles/:vehicleId/maintenance', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const record = await storage.getMaintenanceRecordByVehicleId(vehicleId);
      
      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found for this vehicle' });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance record' });
    }
  });
  
  app.post('/api/maintenance', async (req, res) => {
    try {
      const validationResult = insertMaintenanceRecordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance record data', errors: validationResult.error.errors });
      }
      
      const record = await storage.createMaintenanceRecord(validationResult.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create maintenance record' });
    }
  });
  
  app.patch('/api/maintenance/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertMaintenanceRecordSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance record data', errors: validationResult.error.errors });
      }
      
      const record = await storage.updateMaintenanceRecord(id, validationResult.data);
      
      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update maintenance record' });
    }
  });
  
  // Maintenance Flag Routes
  app.get('/api/vehicles/:vehicleId/flags', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const flags = await storage.getMaintenanceFlagByVehicleId(vehicleId);
      
      if (!flags) {
        return res.status(404).json({ message: 'Maintenance flags not found for this vehicle' });
      }
      
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance flags' });
    }
  });
  
  app.post('/api/flags', async (req, res) => {
    try {
      const validationResult = insertMaintenanceFlagSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance flag data', errors: validationResult.error.errors });
      }
      
      const flags = await storage.createMaintenanceFlag(validationResult.data);
      res.status(201).json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create maintenance flags' });
    }
  });
  
  app.patch('/api/flags/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertMaintenanceFlagSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance flag data', errors: validationResult.error.errors });
      }
      
      const flags = await storage.updateMaintenanceFlag(id, validationResult.data);
      
      if (!flags) {
        return res.status(404).json({ message: 'Maintenance flags not found' });
      }
      
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update maintenance flags' });
    }
  });
  
  // Gloss Tracking Routes
  app.get('/api/vehicles/:vehicleId/gloss', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const tracking = await storage.getGlossTrackingByVehicleId(vehicleId);
      
      if (!tracking) {
        return res.status(404).json({ message: 'Gloss tracking not found for this vehicle' });
      }
      
      // Get the associated logs
      const logs = await storage.getGlossLogs(tracking.id);
      
      res.json({
        ...tracking,
        glossGrowthLog: logs
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss tracking' });
    }
  });
  
  app.post('/api/gloss', async (req, res) => {
    try {
      const validationResult = insertGlossTrackingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss tracking data', errors: validationResult.error.errors });
      }
      
      const tracking = await storage.createGlossTracking(validationResult.data);
      res.status(201).json(tracking);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create gloss tracking' });
    }
  });
  
  app.patch('/api/gloss/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertGlossTrackingSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss tracking data', errors: validationResult.error.errors });
      }
      
      const tracking = await storage.updateGlossTracking(id, validationResult.data);
      
      if (!tracking) {
        return res.status(404).json({ message: 'Gloss tracking not found' });
      }
      
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update gloss tracking' });
    }
  });
  
  // Gloss Log Routes
  app.get('/api/gloss/:glossTrackingId/logs', async (req, res) => {
    try {
      const glossTrackingId = Number(req.params.glossTrackingId);
      const logs = await storage.getGlossLogs(glossTrackingId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss logs' });
    }
  });
  
  app.post('/api/logs', async (req, res) => {
    try {
      const validationResult = insertGlossLogSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss log data', errors: validationResult.error.errors });
      }
      
      const log = await storage.createGlossLog(validationResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create gloss log' });
    }
  });

  // Add route to get weather API key
  app.get('/api/weather-key', (req, res) => {
    res.json({ apiKey: process.env.OPENWEATHER_API_KEY });
  });
  
  // Initialize database for demo purposes
  // This would normally happen through user registration/onboarding
  app.post('/api/init-demo-data', async (req, res) => {
    try {
      // Create a demo user if not exists
      let demoUser = await storage.getUserByUsername('demoadmin');
      if (!demoUser) {
        demoUser = await storage.createUser({ username: 'demoadmin', password: 'password123' });
      }
      
      // Create Ferrari vehicle
      const ferrari = await storage.createVehicle({
        userId: demoUser.id,
        make: "Ferrari",
        model: "458 Italia",
        year: "2015"
      });
      
      // Create tire data
      await storage.createTire({
        vehicleId: ferrari.id,
        brand: "Michelin Pilot Sport 4S",
        model: "275/35ZR20",
        mileageLifeTarget: 20000,
        currentMileage: 4500,
        purchaseDate: new Date("2024-04-15"),
        lastTreadDepthCheck: new Date("2024-04-25")
      });
      
      // Create maintenance records
      await storage.createMaintenanceRecord({
        vehicleId: ferrari.id,
        lastOilChange: new Date("2024-02-20"),
        lastAirFilterChange: new Date("2023-10-01"),
        lastCabinFilterChange: new Date("2023-10-01"),
        lastCoolantFlush: new Date("2023-08-15"),
        lastBrakeFluidChange: new Date("2023-12-10"),
        lastTransmissionService: new Date("2022-07-10"),
        lastQuarterlyReset: new Date("2024-03-01"),
        lastMonthlyMaintenance: new Date("2024-04-01"),
        lastWeeklyQuickCheck: new Date("2024-04-20"),
        lastPreDriveCheck: new Date("2024-04-25")
      });
      
      // Create maintenance flags
      await storage.createMaintenanceFlag({
        vehicleId: ferrari.id,
        missedWeekly: false,
        missedMonthly: false,
        missedQuarterly: false,
        missedSeasonal: false
      });
      
      // Create gloss tracking
      const glossTracking = await storage.createGlossTracking({
        vehicleId: ferrari.id,
        lastGlossBoost: new Date("2024-04-12"),
        lastFullDecon: new Date("2024-03-01"),
        lastSealantRefresh: new Date("2024-03-10"),
        lastPaintCorrection: new Date("2023-11-15"),
        lastCeramicTopCoat: new Date("2022-09-01")
      });
      
      // Create gloss logs
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        date: new Date("2024-03-01"),
        action: "Full Decon + Frothe Boost Applied",
        notes: "Post-winter reset before canyon season."
      });
      
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        date: new Date("2024-04-12"),
        action: "Gloss Reload Applied After Spring Drive",
        notes: "Maintaining water beading before seasonal pollen rise."
      });
      
      res.status(201).json({ message: 'Demo data initialized successfully' });
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to initialize demo data' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
