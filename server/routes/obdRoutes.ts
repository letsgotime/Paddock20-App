import { Router } from 'express';
import axios from 'axios';

// Create a router
const router = Router();

// OBD service URL (running on port 5001)
const OBD_SERVICE_URL = 'http://localhost:5001';

// Proxy middleware function
const proxyOBDRequest = async (req, res, next) => {
  try {
    // Build the target URL by appending the path after /api/obd
    const targetPath = req.url.replace(/^\/api\/obd/, '/api/obd');
    const targetUrl = `${OBD_SERVICE_URL}${targetPath}`;
    
    console.log(`Proxying OBD request to: ${targetUrl}`);
    
    // Proxy the request based on method
    let response;
    if (req.method === 'GET') {
      response = await axios.get(targetUrl);
    } else if (req.method === 'POST') {
      response = await axios.post(targetUrl, req.body);
    } else if (req.method === 'PUT') {
      response = await axios.put(targetUrl, req.body);
    } else if (req.method === 'DELETE') {
      response = await axios.delete(targetUrl);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Send the response back to the client
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('OBD proxy error:', error.message);
    
    // If the error has a response, send it back
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise, send a generic error
    return res.status(500).json({ 
      error: 'Failed to communicate with OBD service',
      message: error.message,
      details: 'The OBD service might not be running. Please start it using "python server/services/obd_service.py"'
    });
  }
};

// Route to check if OBD service is running
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${OBD_SERVICE_URL}/api/obd/status`);
    return res.status(200).json({
      serviceName: 'OBD Service',
      running: true,
      status: response.data
    });
  } catch (error) {
    return res.status(200).json({
      serviceName: 'OBD Service',
      running: false,
      error: error.message
    });
  }
});

// Route to start the OBD service
router.post('/start-service', (req, res) => {
  const { spawn } = require('child_process');
  
  try {
    // Spawn the Python process
    const pythonProcess = spawn('python', ['server/services/obd_service.py']);
    
    // Handle process events
    pythonProcess.stdout.on('data', (data) => {
      console.log(`OBD Service stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`OBD Service stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`OBD Service process exited with code ${code}`);
    });
    
    return res.status(200).json({
      success: true,
      message: 'OBD service started successfully'
    });
  } catch (error) {
    console.error('Failed to start OBD service:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start OBD service',
      error: error.message
    });
  }
});

// Proxy all other requests to the Python service
router.all('*', proxyOBDRequest);

export default router;