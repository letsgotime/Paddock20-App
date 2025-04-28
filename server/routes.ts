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

// OpenWeather API key - updated April 28, 2025
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";

export async function registerRoutes(app: Express): Promise<Server> {
  // Using only OpenWeather API for all weather services
  
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use the OpenWeather API key constant
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
      console.log(`Fetching OpenWeather data for: ${lat},${lon}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/forecast', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use the OpenWeather API key constant 
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather Forecast API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch forecast data' });
    }
  });
  
  // OneCall API route
  app.get('/api/onecall', async (req, res) => {
    try {
      const { lat, lon, units, exclude } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}${exclude ? `&exclude=${exclude}` : ''}&appid=${OPENWEATHER_API_KEY}`;
      
      console.log(`Fetching OneCall data for: ${lat},${lon}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OneCall API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather OneCall API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch OneCall data' });
    }
  });

  // Simplified Automotive Weather API
  app.get('/api/automotive-weather', async (req, res) => {
    try {
      const { lat, lon } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=imperial&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Error fetching automotive weather data:", error);
      res.status(500).json({ error: "Failed to fetch automotive weather data" });
    }
  });

  // Vehicle Management Routes
  app.post('/api/vehicles', async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create vehicle' });
    }
  });

  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicles' });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicle' });
    }
  });

  app.patch('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      
      const updatedVehicle = await storage.updateVehicle(id, vehicleData);
      
      if (!updatedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to update vehicle' });
    }
  });

  app.delete('/api/vehicles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to delete vehicle' });
    }
  });

  // Tire Management Routes
  app.post('/api/tires', async (req, res) => {
    try {
      const tireData = insertTireSchema.parse(req.body);
      const tire = await storage.createTire(tireData);
      res.status(201).json(tire);
    } catch (error) {
      console.error('Error creating tire:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create tire' });
    }
  });

  app.get('/api/vehicles/:vehicleId/tires', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const tires = await storage.getTiresByVehicle(vehicleId);
      res.json(tires);
    } catch (error) {
      console.error('Error fetching tires:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch tires' });
    }
  });

  // Maintenance Records Routes
  app.post('/api/maintenance-records', async (req, res) => {
    try {
      const recordData = insertMaintenanceRecordSchema.parse(req.body);
      const record = await storage.createMaintenanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create maintenance record' });
    }
  });

  app.get('/api/vehicles/:vehicleId/maintenance-records', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const records = await storage.getMaintenanceRecordsByVehicle(vehicleId);
      res.json(records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance records' });
    }
  });

  // Maintenance Flags Routes
  app.post('/api/maintenance-flags', async (req, res) => {
    try {
      const flagData = insertMaintenanceFlagSchema.parse(req.body);
      const flag = await storage.createMaintenanceFlag(flagData);
      res.status(201).json(flag);
    } catch (error) {
      console.error('Error creating maintenance flag:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create maintenance flag' });
    }
  });

  app.get('/api/vehicles/:vehicleId/maintenance-flags', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const flags = await storage.getMaintenanceFlagsByVehicle(vehicleId);
      res.json(flags);
    } catch (error) {
      console.error('Error fetching maintenance flags:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance flags' });
    }
  });

  // Gloss Tracking Routes (for paint protection/detailing)
  app.post('/api/gloss-tracking', async (req, res) => {
    try {
      const glossData = insertGlossTrackingSchema.parse(req.body);
      const glossTracking = await storage.createGlossTracking(glossData);
      res.status(201).json(glossTracking);
    } catch (error) {
      console.error('Error creating gloss tracking:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create gloss tracking' });
    }
  });

  app.get('/api/vehicles/:vehicleId/gloss-tracking', async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const glossTracking = await storage.getGlossTrackingByVehicle(vehicleId);
      res.json(glossTracking);
    } catch (error) {
      console.error('Error fetching gloss tracking:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss tracking' });
    }
  });

  // Gloss Logs Routes (for detailing sessions)
  app.post('/api/gloss-logs', async (req, res) => {
    try {
      const logData = insertGlossLogSchema.parse(req.body);
      const glossLog = await storage.createGlossLog(logData);
      res.status(201).json(glossLog);
    } catch (error) {
      console.error('Error creating gloss log:', error);
      res.status(400).json({ message: (error as Error).message || 'Failed to create gloss log' });
    }
  });

  app.get('/api/gloss-tracking/:glossTrackingId/logs', async (req, res) => {
    try {
      const glossTrackingId = parseInt(req.params.glossTrackingId);
      const logs = await storage.getGlossLogsByTracking(glossTrackingId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching gloss logs:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss logs' });
    }
  });

  // Demo data initialization
  app.post('/api/init-demo-data', async (req, res) => {
    try {
      // Create demo vehicle
      const vehicle = await storage.createVehicle({
        make: 'Ferrari',
        model: '488 GTB',
        year: 2019,
        color: 'Rosso Corsa',
        vin: 'ZFF79ALA7K0240372',
        licensePlate: 'PDCK-20',
        purchaseDate: new Date('2023-01-15'),
        mileage: 8500
      });
      
      // Create tires for the vehicle
      await storage.createTire({
        vehicleId: vehicle.id,
        brand: 'Michelin',
        model: 'Pilot Sport 4S',
        frontSize: '245/35ZR20',
        rearSize: '305/30ZR20',
        dateInstalled: new Date('2023-03-10'),
        mileageInstalled: 7200,
        currentTreadDepth: 6.5,
        notes: 'High performance summer tires'
      });
      
      // Create maintenance records
      await storage.createMaintenanceRecord({
        vehicleId: vehicle.id,
        serviceType: 'Oil Change',
        serviceDate: new Date('2023-06-15'),
        mileage: 8000,
        serviceCost: 450,
        serviceProvider: 'Ferrari of Central Florida',
        notes: 'Shell Helix Ultra 5W-40, OEM filter'
      });
      
      // Create maintenance flag for upcoming service
      await storage.createMaintenanceFlag({
        vehicleId: vehicle.id,
        flagType: 'Scheduled Maintenance',
        notes: 'Annual service due',
        dueDate: new Date('2023-12-15'),
        dueMileage: 10000,
        isDue: false,
        isUrgent: false
      });
      
      // Create gloss tracking for paint protection
      const glossTracking = await storage.createGlossTracking({
        vehicleId: vehicle.id,
        currentProduct: 'Ceramic Pro 9H',
        appliedDate: new Date('2023-02-20'),
        nextWaxDate: new Date('2024-02-20'),
        protectionLevel: 9,
        glossLevel: 9,
        beadingRating: 10,
        notes: 'Full ceramic coating with 5-year warranty'
      });
      
      // Create gloss log entry
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        logDate: new Date('2023-05-10'),
        productUsed: 'Ceramic Pro Sport',
        processType: 'Maintenance Coat',
        notes: 'Applied maintenance coat after spring detail'
      });
      
      // Create another gloss log entry
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        logDate: new Date('2023-08-15'),
        productUsed: 'Ceramic Pro Sport',
        processType: 'Maintenance Coat',
        notes: 'Applied after summer track day event'
      });
      
      res.status(201).json({ message: 'Demo data initialized successfully' });
    } catch (error) {
      console.error('Error initializing demo data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to initialize demo data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}