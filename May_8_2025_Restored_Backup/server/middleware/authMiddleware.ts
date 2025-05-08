/**
 * Authentication Middleware
 * 
 * Provides middleware functions for protecting routes
 * and managing user sessions.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthWarehouse, UserManager } from '../data/authWarehouse';
import { User } from '@shared/schema';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // If not authenticated, return 401
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }
  
  next();
}

/**
 * Middleware to check if user has admin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  // Then check if admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden - Admin access required' 
    });
  }

  next();
}

/**
 * Middleware to load user data into request
 */
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    try {
      const user = await UserManager.getUserById(req.session.userId);
      if (user) {
        // Attach safe user (no password) to request
        req.user = UserManager.getSafeUser(user) as User;
      }
    } catch (error) {
      console.error('Error loading user in middleware:', error);
    }
  }
  
  next();
}

/**
 * Middleware to log all requests
 */
export function logRequest(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (userId) {
    // Only log authenticated requests
    const { method, originalUrl } = req;
    AuthWarehouse.AuthLogManager.createLog({
      userId,
      action: 'request',
      status: 'success',
      details: { method, path: originalUrl }
    }).catch(error => {
      console.error('Error logging request:', error);
    });
  }
  
  next();
}

/**
 * Middleware to check for inactive users and force logout if needed
 */
export function checkInactivity(maxInactiveMinutes = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.lastActive) {
      const lastActive = new Date(req.session.lastActive);
      const now = new Date();
      const diffMs = now.getTime() - lastActive.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      
      if (diffMinutes > maxInactiveMinutes) {
        // Session expired due to inactivity
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying inactive session:', err);
          }
          
          return res.status(401).json({
            success: false,
            message: 'Session expired due to inactivity',
          });
        });
        return;
      }
    }
    
    // Update last active timestamp
    if (req.session) {
      req.session.lastActive = new Date();
    }
    
    next();
  };
}

/**
 * Export auth middleware bundle
 */
export const authMiddleware = {
  isAuthenticated,
  isAdmin,
  loadUser,
  logRequest,
  checkInactivity,
};