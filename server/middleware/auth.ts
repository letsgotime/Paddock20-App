import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication for protected routes
 * Checks if the user is authenticated and redirects to login if not
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
}

/**
 * Middleware to check if there's an active 2FA session in progress
 * Used during the 2FA verification process
 */
export function require2FASession(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.temp2FA) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'No two-factor authentication session in progress'
  });
}

/**
 * Add types declaration for Express session properties
 */
declare module 'express-session' {
  interface SessionData {
    temp2FA?: {
      userId: number;
      username: string;
      remember: boolean;
    };
  }
}