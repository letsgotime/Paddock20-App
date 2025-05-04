import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if user is authenticated
 * F1-grade security check that verifies session validity
 */
export function checkAuthentication(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: 'Paddock Access Denied',
      message: 'You must be logged in to access this resource',
      code: 'PADDOCK_ACCESS_DENIED'
    });
  }
  
  // Continue with the authenticated request
  next();
}

/**
 * Middleware to check if account is locked
 * Additional security layer for suspicious activity detection
 */
export async function checkAccountLock(req: Request, res: Response, next: NextFunction) {
  const userId = req.body.userId || req.user?.id;
  
  if (!userId) {
    return next();
  }
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    return next();
  }
  
  // Check if account is locked
  if (user.accountLocked) {
    // Check if lock period has expired
    if (user.lockedUntil && new Date() > user.lockedUntil) {
      // Unlock the account if lock period has expired
      await storage.unlockAccount(user.id);
      return next();
    }
    
    // Calculate remaining minutes
    const remainingMinutes = user.lockedUntil 
      ? Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000)) 
      : 30;
    
    return res.status(403).json({
      error: 'Account Locked',
      message: `Account temporarily locked for security. Please try again in ${remainingMinutes} minute(s).`,
      lockRemainingMinutes: remainingMinutes,
      code: 'ACCOUNT_LOCKED'
    });
  }
  
  next();
}

/**
 * Rate limiting middleware to prevent brute force attacks
 * Monitors and restricts excessive authentication attempts
 */
export async function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.body.userId;
  
  if (!userId) {
    return next();
  }
  
  const user = await storage.getUser(userId);
  
  if (!user) {
    return next();
  }
  
  // Check failed login attempts
  const recentFailedAttempts = await storage.getRecentFailedLoginAttempts(userId);
  
  // Lock account after 5 failed attempts in 30 minutes
  if (recentFailedAttempts >= 5) {
    // Lock account for 30 minutes
    await storage.lockAccount(userId, 30);
    
    return res.status(403).json({
      error: 'Too Many Attempts',
      message: 'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
      lockRemainingMinutes: 30,
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
  
  next();
}