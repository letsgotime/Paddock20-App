import express, { Request, Response } from 'express';
import { storage } from '../storage';

const router = express.Router();

/**
 * API endpoint to retrieve or create a user profile based on Auth0 credentials
 * This endpoint expects an Auth0 token in the Authorization header
 */
router.get('/api/user-profile', async (req: Request, res: Response) => {
  try {
    // Check if the user is authenticated through our session
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Return the user profile data from our system
    return res.status(200).json(req.user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;