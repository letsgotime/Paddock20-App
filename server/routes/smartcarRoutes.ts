import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import smartcar from 'smartcar';
import { randomUUID } from 'crypto';

// Initialize the Smartcar client
const smartcarClient = new smartcar.AuthClient({
  clientId: process.env.SMARTCAR_CLIENT_ID || '',
  clientSecret: process.env.SMARTCAR_CLIENT_SECRET || '',
  redirectUri: process.env.SMARTCAR_REDIRECT_URI || 'https://gotimegarage.replit.app/smartcar/callback',
  // Use testMode only in development environment
  testMode: process.env.NODE_ENV !== 'production',
});

// Scopes we're requesting access to
const SMARTCAR_SCOPES = [
  'control_security:unlock',
  'control_security:lock',
  'read_vehicle_info',
  'read_location',
  'read_odometer',
  'read_tires',
  'read_engine_oil',
  'read_battery',
  'read_charge', 
  'read_fuel',
  'read_vin'
];

// Create router
const router = Router();

/**
 * Start the authentication flow by returning the Smartcar authorization URL
 */
router.get('/authorize', (req, res) => {
  try {
    // Get the authorization URL with the scopes we defined
    const authUrl = smartcarClient.getAuthUrl(SMARTCAR_SCOPES);
    
    // Return the URL for the frontend to redirect to
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * Handle the exchange of the authorization code for access tokens
 */
router.get('/exchange', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }
    
    // Exchange the authorization code for access tokens
    const tokenResponse = await smartcarClient.exchangeCode(code);
    
    // Store the token information in the user's session
    // (This is a simple approach - in production, store these securely in your database)
    if (!req.session.smartcarUserId) {
      // Generate a user ID if not already assigned
      req.session.smartcarUserId = Date.now(); // Simple ID generation
    }
    
    // Save the tokens with the user ID
    await storage.saveSmartcarTokens(req.session.smartcarUserId, {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiration: tokenResponse.expiration,
      refreshExpiration: tokenResponse.refreshExpiration,
      vehicleIds: tokenResponse.vehicles
    });
    
    // Return success
    res.json({ 
      success: true,
      vehicles: tokenResponse.vehicles 
    });
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

/**
 * Get a list of connected vehicles
 */
router.get('/vehicles', async (req, res) => {
  try {
    // Ensure the user is connected to Smartcar
    if (!req.session.smartcarUserId) {
      return res.status(401).json({ error: 'No connected vehicles found' });
    }
    
    // Get the stored tokens
    const tokens = await storage.getSmartcarTokens(req.session.smartcarUserId);
    
    if (!tokens) {
      return res.status(401).json({ error: 'No connected vehicles found' });
    }
    
    // Check if the access token has expired and refresh if needed
    if (tokens.expiration < new Date()) {
      if (tokens.refreshExpiration < new Date()) {
        // If refresh token has expired, the user needs to re-authenticate
        return res.status(401).json({ error: 'Authorization expired, please reconnect your vehicle' });
      }
      
      try {
        // Refresh the access token
        const refreshedTokens = await smartcarClient.exchangeRefreshToken(tokens.refreshToken);
        
        // Update the stored tokens
        await storage.saveSmartcarTokens(req.session.smartcarUserId, {
          accessToken: refreshedTokens.accessToken,
          refreshToken: refreshedTokens.refreshToken,
          expiration: refreshedTokens.expiration,
          refreshExpiration: refreshedTokens.refreshExpiration,
          vehicleIds: refreshedTokens.vehicles
        });
        
        // Update local tokens
        tokens.accessToken = refreshedTokens.accessToken;
        tokens.vehicleIds = refreshedTokens.vehicles;
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return res.status(401).json({ error: 'Failed to refresh authorization' });
      }
    }
    
    // Fetch details for each vehicle
    const vehiclePromises = tokens.vehicleIds.map(async (vehicleId) => {
      try {
        const vehicle = new smartcar.Vehicle(vehicleId, tokens.accessToken);
        const info = await vehicle.info();
        return {
          id: vehicleId,
          make: info.make,
          model: info.model,
          year: info.year,
          trim: info.trim || ''
        };
      } catch (vehicleError) {
        console.error(`Error fetching vehicle info for ${vehicleId}:`, vehicleError);
        return {
          id: vehicleId,
          make: 'Unknown',
          model: 'Unknown',
          year: 'Unknown',
          trim: ''
        };
      }
    });
    
    const vehicles = await Promise.all(vehiclePromises);
    
    res.json({ vehicles });
  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json({ error: 'Failed to retrieve vehicles' });
  }
});

/**
 * Import a vehicle from Smartcar into the user's garage
 */
router.post('/import/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    // Ensure the user is connected to Smartcar
    if (!req.session.smartcarUserId) {
      return res.status(401).json({ error: 'Not authorized to import vehicles' });
    }
    
    // Get the stored tokens
    const tokens = await storage.getSmartcarTokens(req.session.smartcarUserId);
    
    if (!tokens) {
      return res.status(401).json({ error: 'No connected vehicles found' });
    }
    
    // Check if the vehicleId is valid
    if (!tokens.vehicleIds.includes(vehicleId)) {
      return res.status(404).json({ error: 'Vehicle not found in your connected vehicles' });
    }
    
    try {
      // Create a Vehicle instance to get more information
      const vehicle = new smartcar.Vehicle(vehicleId, tokens.accessToken);
      
      // Get basic vehicle info
      const info = await vehicle.info();
      
      // Try to get VIN
      let vinInfo;
      try {
        vinInfo = await vehicle.vin();
      } catch (vinError) {
        console.warn('VIN not available for this vehicle:', vinError.message);
      }
      
      // Try to get odometer reading
      let odometerInfo;
      try {
        odometerInfo = await vehicle.odometer();
      } catch (odometerError) {
        console.warn('Odometer not available for this vehicle:', odometerError.message);
      }
      
      // Get user from session or token - in a real app, you would use your own auth system
      // This is just an example assuming you have a userId in your session already
      // If Auth0 is used, you might extract the user ID from the Auth0 token
      const userId = req.user?.id || 1; // Default to user ID 1 for demo
      
      // Create a new vehicle record in the database
      const newVehicle = await storage.createVehicle({
        make: info.make,
        model: info.model,
        year: parseInt(info.year, 10) || new Date().getFullYear(),
        userId: userId,
        vin: vinInfo?.vin || null,
        smartcar_vehicle_id: vehicleId,
        status: 'Active',
        license_plate: '',
        mileage: odometerInfo?.distance || null,
        // preferredUnit value is stored at user level, not vehicle level
        trim: info.trim || null,
        color: null,
        nickname: `${info.make} ${info.model}`,
        purchase_date: new Date(),
        notes: `Imported from Smartcar on ${new Date().toLocaleString()}`
      });
      
      res.json({ 
        success: true, 
        vehicle: newVehicle 
      });
    } catch (vehicleError) {
      console.error('Error importing vehicle:', vehicleError);
      res.status(500).json({ error: 'Failed to import vehicle' });
    }
  } catch (error) {
    console.error('Error in import process:', error);
    res.status(500).json({ error: 'An error occurred while importing the vehicle' });
  }
});

/**
 * Disconnect from Smartcar
 */
router.post('/disconnect', async (req, res) => {
  try {
    // Ensure the user is connected to Smartcar
    if (!req.session.smartcarUserId) {
      return res.status(400).json({ error: 'No connected vehicles to disconnect' });
    }
    
    // Delete the stored tokens
    await storage.deleteSmartcarTokens(req.session.smartcarUserId);
    
    // Clear the smartcar user ID from the session
    delete req.session.smartcarUserId;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting from Smartcar:', error);
    res.status(500).json({ error: 'Failed to disconnect from Smartcar' });
  }
});

/**
 * Get specific vehicle data
 */
router.get('/vehicle/:vehicleId/:dataType', async (req, res) => {
  try {
    const { vehicleId, dataType } = req.params;
    
    // Ensure the user is connected to Smartcar
    if (!req.session.smartcarUserId) {
      return res.status(401).json({ error: 'Not authorized to access vehicle data' });
    }
    
    // Get the stored tokens
    const tokens = await storage.getSmartcarTokens(req.session.smartcarUserId);
    
    if (!tokens) {
      return res.status(401).json({ error: 'No connected vehicles found' });
    }
    
    // Check if the vehicleId is valid
    if (!tokens.vehicleIds.includes(vehicleId)) {
      return res.status(404).json({ error: 'Vehicle not found in your connected vehicles' });
    }
    
    try {
      // Create a Vehicle instance
      const vehicle = new smartcar.Vehicle(vehicleId, tokens.accessToken);
      
      // Fetch the requested data type
      let data: any;
      
      switch (dataType) {
        case 'info':
          data = await vehicle.info();
          break;
        case 'location':
          data = await vehicle.location();
          break;
        case 'odometer':
          data = await vehicle.odometer();
          break;
        case 'fuel':
          data = await vehicle.fuel();
          break;
        case 'battery':
          data = await vehicle.battery();
          break;
        case 'tires':
          data = await vehicle.tires();
          break;
        case 'vin':
          data = await vehicle.vin();
          break;
        default:
          return res.status(400).json({ error: 'Invalid data type requested' });
      }
      
      res.json({ success: true, data });
    } catch (vehicleError: any) {
      console.error(`Error fetching ${dataType} for vehicle ${vehicleId}:`, vehicleError);
      
      // Handle permission errors differently
      if (vehicleError.message?.includes('permission')) {
        return res.status(403).json({ 
          error: `Your connection does not have permission to access ${dataType}`,
          missingPermission: true
        });
      }
      
      res.status(500).json({ error: `Failed to get ${dataType} information` });
    }
  } catch (error) {
    console.error('Error retrieving vehicle data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving vehicle data' });
  }
});

export default router;