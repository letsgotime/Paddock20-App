/**
 * Smartcar API Integration Routes
 * 
 * These routes handle Smartcar OAuth flow and vehicle data retrieval.
 * Documentation: https://smartcar.com/docs/api
 */

import express, { Request, Response } from 'express';
import Smartcar from 'smartcar';
import { storage } from '../storage';

const router = express.Router();

// Initialize Smartcar client
const client = new Smartcar.AuthClient({
  clientId: process.env.SMARTCAR_CLIENT_ID || '',
  clientSecret: process.env.SMARTCAR_CLIENT_SECRET || '',
  redirectUri: 'https://gotimegarage.replit.app/smartcar/callback',
  testMode: true, // Set to false for production
});

// Store Smartcar access tokens by userId
const userSmartcarTokens = new Map<number, {
  accessToken: string;
  refreshToken: string;
  expiration: Date;
  vehicles: string[];
}>();

/**
 * Starts the Smartcar authorization flow
 * GET /api/smartcar/authorize
 */
router.get('/authorize', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User must be logged in' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  // Generate Smartcar authorization URL with specific scopes
  const authUrl = client.getAuthUrl([
    'required:read_vehicle_info',
    'required:read_odometer',
    'required:read_location',
    'read_engine_oil',
    'read_battery',
    'read_charge',
    'read_fuel',
    'read_tires',
    'read_vin',
  ]);

  // Store the user ID in the session to retrieve after callback
  if (req.session) {
    req.session.smartcarUserId = userId;
  }

  res.json({ authUrl });
});

/**
 * Handles the Smartcar OAuth callback
 * GET /api/smartcar/exchange
 */
router.get('/exchange', async (req: Request, res: Response) => {
  if (!req.session?.smartcarUserId) {
    return res.status(400).json({ error: 'Missing user session data' });
  }

  const userId = req.session.smartcarUserId;
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange authorization code for access token
    const { accessToken, refreshToken, expiration, vehicles } = await client.exchangeCode(code);

    // Store tokens for this user
    userSmartcarTokens.set(userId, {
      accessToken,
      refreshToken,
      expiration, 
      vehicles
    });

    // Redirect to client-side page that will handle the callback success
    res.status(200).json({ 
      success: true,
      message: 'Smartcar authorization successful',
      vehicles: vehicles 
    });
  } catch (error: any) {
    console.error('Smartcar token exchange error:', error);
    res.status(500).json({ 
      error: 'Failed to complete Smartcar authorization',
      message: error.message
    });
  }
});

/**
 * Retrieves basic vehicle information
 * GET /api/smartcar/vehicles/:vehicleId
 */
router.get('/vehicles/:vehicleId', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User must be logged in' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  const { vehicleId } = req.params;
  const userTokens = userSmartcarTokens.get(userId);

  if (!userTokens) {
    return res.status(401).json({ error: 'Smartcar not authorized. Please connect your vehicle first.' });
  }

  try {
    // Check if token is expired and refresh if needed
    if (new Date() >= userTokens.expiration) {
      const { accessToken, refreshToken, expiration } = await client.exchangeRefreshToken(userTokens.refreshToken);
      
      userSmartcarTokens.set(userId, {
        ...userTokens,
        accessToken,
        refreshToken,
        expiration
      });
    }

    // Create vehicle instance
    const vehicle = new Smartcar.Vehicle(vehicleId, userTokens.accessToken);
    
    // Get vehicle info
    const info = await vehicle.info();
    const odometer = await vehicle.odometer();
    
    let fuelOrBattery = {};
    if (info.fuel) {
      try {
        const fuel = await vehicle.fuel();
        fuelOrBattery = { fuel };
      } catch (e) {
        console.error('Error fetching fuel:', e);
      }
    } else if (info.battery) {
      try {
        const battery = await vehicle.battery();
        fuelOrBattery = { battery };
      } catch (e) {
        console.error('Error fetching battery:', e);
      }
    }

    // Try to get location if permission granted
    let location = null;
    try {
      location = await vehicle.location();
    } catch (e) {
      console.error('Error fetching location:', e);
    }

    // Try to get VIN if permission granted
    let vin = null;
    try {
      const vinResponse = await vehicle.vin();
      vin = vinResponse.vin;
    } catch (e) {
      console.error('Error fetching VIN:', e);
    }

    // Try to get tire pressure if permission granted
    let tires = null;
    try {
      tires = await vehicle.tires();
    } catch (e) {
      console.error('Error fetching tire pressure:', e);
    }

    // Combine all data
    const vehicleData = {
      ...info,
      odometer,
      ...fuelOrBattery,
      location,
      vin,
      tires,
    };

    res.json(vehicleData);
  } catch (error: any) {
    console.error('Smartcar API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle data',
      message: error.message 
    });
  }
});

/**
 * Lists all connected vehicles
 * GET /api/smartcar/vehicles
 */
router.get('/vehicles', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User must be logged in' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  const userTokens = userSmartcarTokens.get(userId);

  if (!userTokens) {
    return res.status(401).json({ error: 'Smartcar not authorized. Please connect your vehicle first.' });
  }

  try {
    // Check if token is expired and refresh if needed
    if (new Date() >= userTokens.expiration) {
      const { accessToken, refreshToken, expiration } = await client.exchangeRefreshToken(userTokens.refreshToken);
      
      userSmartcarTokens.set(userId, {
        ...userTokens,
        accessToken,
        refreshToken,
        expiration
      });
    }

    // Get all vehicles basic info
    const vehiclesData = [];
    for (const vehicleId of userTokens.vehicles) {
      try {
        const vehicle = new Smartcar.Vehicle(vehicleId, userTokens.accessToken);
        const info = await vehicle.info();
        vehiclesData.push({
          id: vehicleId,
          ...info
        });
      } catch (error) {
        console.error(`Error fetching vehicle ${vehicleId}:`, error);
      }
    }

    res.json({ vehicles: vehiclesData });
  } catch (error: any) {
    console.error('Smartcar API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicles list',
      message: error.message 
    });
  }
});

/**
 * Disconnects a vehicle from Smartcar
 * POST /api/smartcar/disconnect
 */
router.post('/disconnect', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User must be logged in' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  // Remove the user's Smartcar tokens
  userSmartcarTokens.delete(userId);

  res.json({ success: true, message: 'Successfully disconnected from Smartcar' });
});

/**
 * Import vehicle from Smartcar to user's garage
 * POST /api/smartcar/import/:vehicleId
 */
router.post('/import/:vehicleId', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User must be logged in' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User ID not found' });
  }

  const { vehicleId } = req.params;
  const userTokens = userSmartcarTokens.get(userId);

  if (!userTokens) {
    return res.status(401).json({ error: 'Smartcar not authorized. Please connect your vehicle first.' });
  }

  try {
    // Check if token is expired and refresh if needed
    if (new Date() >= userTokens.expiration) {
      const { accessToken, refreshToken, expiration } = await client.exchangeRefreshToken(userTokens.refreshToken);
      
      userSmartcarTokens.set(userId, {
        ...userTokens,
        accessToken,
        refreshToken,
        expiration
      });
    }

    // Create vehicle instance
    const vehicle = new Smartcar.Vehicle(vehicleId, userTokens.accessToken);
    
    // Get vehicle info
    const info = await vehicle.info();
    const odometer = await vehicle.odometer();
    
    // Try to get VIN if permission granted
    let vin = null;
    try {
      const vinResponse = await vehicle.vin();
      vin = vinResponse.vin;
    } catch (e) {
      console.error('Error fetching VIN:', e);
    }

    // Create vehicle record in database
    const newVehicle = await storage.createVehicle({
      userId: userId,
      make: info.make || '',
      model: info.model || '',
      year: parseInt(info.year || new Date().getFullYear().toString(), 10),
      trim: info.trim,
      color: null,
      vin: vin || null,
      vinLast6: vin ? vin.slice(-6) : null,
      licensePlate: null,
      nickname: null,
      primaryDriver: null,
      mileage: odometer ? Math.round(odometer.distance) : null,
      mileageUnit: 'miles',
      smartcarId: vehicleId,
      image: null,
      notes: `Imported from Smartcar on ${new Date().toLocaleString()}`
    });

    res.status(201).json({ 
      success: true,
      message: 'Vehicle successfully imported',
      vehicle: newVehicle
    });
  } catch (error: any) {
    console.error('Error importing vehicle from Smartcar:', error);
    res.status(500).json({ 
      error: 'Failed to import vehicle',
      message: error.message 
    });
  }
});

export default router;