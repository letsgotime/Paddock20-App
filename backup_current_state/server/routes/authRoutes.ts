import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import 'express-session';

// Extend express-session types to include user property
declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters')
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validation.error.errors 
      });
    }
    
    const { email, password, username } = validation.data;
    const user = await authService.register(email, password, username);
    
    // Set user in session
    req.session.user = user;
    
    // Important: Save the session before responding
    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Session error during registration'
        });
      }
      
      return res.status(201).json({ 
        success: true, 
        user 
      });
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(400).json({ 
      success: false, 
      message: err.message || 'Registration failed'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validation.error.errors 
      });
    }
    
    const { email, password } = validation.data;
    const user = await authService.login(email, password);
    
    // Set user in session
    req.session.user = user;
    
    // Important: Save the session before responding
    return req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({
          success: false,
          message: 'Session error during login'
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        user 
      });
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(401).json({ 
      success: false, 
      message: err.message || 'Login failed' 
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  authService.logout(req)
    .then(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    })
    .catch(() => {
      res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    });
});

// Get current user route
router.get('/me', (req, res) => {
  const user = authService.getSessionUser(req);
  
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated'
    });
  }
  
  return res.status(200).json({ 
    success: true, 
    user 
  });
});

export default router;