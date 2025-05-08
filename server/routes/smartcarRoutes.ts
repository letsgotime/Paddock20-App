import express, { Request, Response } from 'express';
import { smartcarService } from '../services/smartcarService';
import { storage } from '../storage';

const router = express.Router();

// Get Smartcar authentication URL
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const authUrl = smartcarService.getAuthUrl();
    res.json({ 
      success: true, 
      authUrl 
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate authentication URL' 
    });
  }
});

// Exchange authorization code for access token
router.post('/exchange', async (req: Request, res: Response) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      message: 'Authorization code is required' 
    });
  }
  
  try {
    // Exchange the code for access token
    const tokenData = await smartcarService.exchangeCode(code);
    
    // Get the user's vehicles
    const vehicleIds = await smartcarService.getVehicles(tokenData.access_token);
    
    if (vehicleIds.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No vehicles found for this account' 
      });
    }
    
    // For now just use the first vehicle
    const vehicleId = vehicleIds[0];
    
    // Get vehicle info
    const vehicleInfo = await smartcarService.getVehicleInfo(
      vehicleId, 
      tokenData.access_token
    );
    
    // Store the connection in our database
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    // Check if we have a storage method for smartcar connections
    // if (storage.storeSmartcarConnection) {
    //   await storage.storeSmartcarConnection({
    //     userId,
    //     vehicleId,
    //     access_token: tokenData.access_token,
    //     refresh_token: tokenData.refresh_token,
    //     expires_at: tokenData.expires_at,
    //     vehicle_info: vehicleInfo
    //   });
    // }
    
    // For now, just return success with vehicle ID
    res.json({
      success: true,
      vehicleId,
      vehicle: {
        id: vehicleId,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year
      }
    });
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to exchange authorization code' 
    });
  }
});

// Get vehicle data
router.get('/vehicles/:vehicleId', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  try {
    // In a real implementation, we would:
    // 1. Get the stored token from the database
    // 2. Check if the token is expired and refresh if needed
    // 3. Then make the API call
    
    // For this demo, we'll just mock the response
    res.json({
      success: true,
      vehicle: {
        id: vehicleId,
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        odometer: 12350,
        fuelLevel: 80,
        location: {
          latitude: 37.7749,
          longitude: -122.4194
        }
      }
    });
  } catch (error) {
    console.error('Error getting vehicle data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get vehicle data' 
    });
  }
});

// Vehicle action (lock/unlock)
router.post('/vehicles/:vehicleId/action', async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { action } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated' 
    });
  }
  
  if (!action || !['lock', 'unlock'].includes(action)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid action' 
    });
  }
  
  try {
    // In a real implementation, we would:
    // 1. Get the stored token from the database
    // 2. Check if the token is expired and refresh if needed
    // 3. Then make the API call
    
    // For this demo, we'll just mock the response
    res.json({
      success: true,
      action,
      message: `Vehicle ${action === 'lock' ? 'locked' : 'unlocked'} successfully`
    });
  } catch (error) {
    console.error(`Error ${action}ing vehicle:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to ${action} vehicle` 
    });
  }
});

export default router;