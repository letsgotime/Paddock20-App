import { Router, Request, Response } from 'express';
import supabase from '../../client/src/services/supabaseClient';
import { storage } from '../storage';

// Create router
const router = Router();

// Middleware to verify Supabase JWT
const verifyToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  
  try {
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user to request
    req.user = data.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Route for getting a user profile - either retrieves existing or creates new
router.get('/api/user-profile', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user from verified token
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // First try to get user from our storage
    const existingUser = await storage.getUserById(user.id);
    
    if (existingUser) {
      console.log('Supabase user found, returning profile data');
      return res.json(existingUser);
    }
    
    // If user doesn't exist, create basic profile
    console.log('Creating new user profile for Supabase user');
    const newUser = {
      id: parseInt(user.id, 10),
      username: user.email?.split('@')[0] || 'user',
      email: user.email || '',
      firstName: user.user_metadata?.first_name || null,
      lastName: user.user_metadata?.last_name || null,
      fullName: user.user_metadata?.full_name || null,
      profileImage: user.user_metadata?.avatar_url || null,
      role: 'user',
      isActive: true,
      isEmailVerified: user.email_confirmed_at ? true : false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Create user in our storage
    const createdUser = await storage.createUser(newUser);
    return res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error processing user profile:', error);
    return res.status(500).json({ error: 'Failed to process user profile' });
  }
});

// Route for updating a user profile
router.patch('/api/user-profile', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user from verified token
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Update user in our storage
    const updatedUser = await storage.updateUser(user.id, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;