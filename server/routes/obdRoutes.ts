import { Router, Request, Response } from 'express';
import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = Router();

// OBD Python service URL
const OBD_SERVICE_URL = 'http://localhost:5001';

// Service process variable
let obdProcess: any = null;
let isServiceRunning = false;

/**
 * Start the OBD Python service
 */
const startOBDService = () => {
  if (isServiceRunning) {
    console.log('OBD service is already running');
    return;
  }

  try {
    // Get the path to the OBD service script
    const scriptPath = path.resolve(process.cwd(), 'server/services/obd_service.py');
    console.log(`Starting OBD service from: ${scriptPath}`);

    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`OBD service script not found at ${scriptPath}`);
      return;
    }

    // Start the Python process
    obdProcess = spawn('python3', [scriptPath]);

    // Handle process output
    obdProcess.stdout.on('data', (data: Buffer) => {
      console.log(`OBD service output: ${data.toString()}`);
    });

    obdProcess.stderr.on('data', (data: Buffer) => {
      console.error(`OBD service error: ${data.toString()}`);
    });

    obdProcess.on('close', (code: number) => {
      console.log(`OBD service exited with code ${code}`);
      isServiceRunning = false;
    });

    // Mark as running
    isServiceRunning = true;
    console.log('OBD service started');

  } catch (error) {
    console.error('Failed to start OBD service:', error);
  }
};

/**
 * Stop the OBD Python service
 */
const stopOBDService = () => {
  if (obdProcess) {
    obdProcess.kill();
    obdProcess = null;
    isServiceRunning = false;
    console.log('OBD service stopped');
  }
};

/**
 * Check if OBD service is running
 */
const checkOBDService = async () => {
  if (!isServiceRunning) {
    return false;
  }

  try {
    // Try to ping the service
    await axios.get(`${OBD_SERVICE_URL}/api/obd/status`);
    return true;
  } catch (error) {
    console.error('OBD service check failed:', error);
    return false;
  }
};

// Start OBD service route
router.post('/start', async (req: Request, res: Response) => {
  try {
    // Check if service is already running
    const isRunning = await checkOBDService();
    if (isRunning) {
      return res.json({ success: true, message: 'OBD service is already running' });
    }

    // Start the service
    startOBDService();

    // Wait for the service to be ready
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        await axios.get(`${OBD_SERVICE_URL}/api/obd/status`);
        return res.json({ success: true, message: 'OBD service started successfully' });
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          stopOBDService();
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to start OBD service after multiple attempts' 
          });
        }
        // Wait 500ms before trying again
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('Error starting OBD service:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to start OBD service', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Stop OBD service route
router.post('/stop', (req: Request, res: Response) => {
  try {
    stopOBDService();
    res.json({ success: true, message: 'OBD service stopped' });
  } catch (error) {
    console.error('Error stopping OBD service:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to stop OBD service',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Status route
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isRunning = await checkOBDService();
    res.json({ 
      running: isRunning,
      message: isRunning ? 'OBD service is running' : 'OBD service is not running'
    });
  } catch (error) {
    console.error('Error checking OBD service status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check OBD service status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generic proxy for OBD service API routes
router.all('/*', async (req: Request, res: Response) => {
  try {
    // Check if service is running
    const isRunning = await checkOBDService();
    if (!isRunning) {
      return res.status(503).json({ 
        success: false, 
        message: 'OBD service is not running. Please start it first.' 
      });
    }

    // Get the path after '/api/obd'
    const path = req.originalUrl.replace(/^\/api\/obd/, '');
    
    // Make the request to the OBD service
    const response = await axios({
      method: req.method,
      url: `${OBD_SERVICE_URL}/api/obd${path}`,
      data: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Return the response from the OBD service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error proxying request to OBD service:', error);
    
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({ 
        success: false, 
        message: 'OBD service is not responding'
      });
    } else {
      // Something happened in setting up the request
      res.status(500).json({ 
        success: false, 
        message: 'Failed to proxy request to OBD service',
        error: error.message 
      });
    }
  }
});

// Cleanup on exit
process.on('exit', () => {
  stopOBDService();
});

process.on('SIGINT', () => {
  stopOBDService();
  process.exit();
});

export default router;