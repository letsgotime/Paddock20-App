import { Router, Request, Response } from 'express';
import supabase from '../../client/src/services/supabaseClient';
import { storage } from '../storage';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend Request to include user property
declare global {
  namespace Express {
    interface Request {
      supabaseUser?: SupabaseUser;
    }
  }
}

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
    req.supabaseUser = data.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Route for getting a user profile - either retrieves existing or creates new
router.get('/api/user-profile', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get Supabase user from verified token
    const supabaseUser = req.supabaseUser;
    
    if (!supabaseUser) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // First try to get user from our storage using string ID
    const existingUser = await storage.getUser(Number(supabaseUser.id));
    
    if (existingUser) {
      console.log('Supabase user found, returning profile data');
      return res.json(existingUser);
    }
    
    // If user doesn't exist, create basic profile
    console.log('Creating new user profile for Supabase user');
    
    // Get user metadata from Supabase
    const metadata = supabaseUser.user_metadata || {};
    
    // Create password hash (random as we're using Supabase auth)
    const randomPassword = Math.random().toString(36).slice(-12);
    
    const newUser = {
      username: supabaseUser.email?.split('@')[0] || 'user',
      email: supabaseUser.email || '',
      password: randomPassword, // Required by our schema but not used with Supabase auth
      firstName: metadata.first_name || null,
      lastName: metadata.last_name || null,
      fullName: metadata.full_name || null,
      profileImage: metadata.avatar_url || null,
      role: 'user',
      isActive: true,
      isEmailVerified: supabaseUser.email_confirmed_at ? true : false
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
    const supabaseUser = req.supabaseUser;
    
    if (!supabaseUser) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get existing user to verify they exist
    const existingUser = await storage.getUser(Number(supabaseUser.id));
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user data without changing password or sensitive fields
    const { password, ...allowedUpdates } = req.body;
    
    // Update user in our storage
    const updatedUser = await storage.updateUser(Number(supabaseUser.id), allowedUpdates);
    
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