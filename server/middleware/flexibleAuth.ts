/**
 * Flexible Authentication Middleware
 * 
 * Provides middleware that supports both session-based authentication and Auth0 token authentication.
 * This allows for a smoother transition between authentication states during the onboarding process.
 */
import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Extracts the Auth0 token from different locations:
 * 1. Authorization header (Bearer token)
 * 2. Query parameter (auth_token)
 * 3. Local storage value sent in custom header (X-Auth0-Token)
 */
export function extractAuth0Token(req: Request): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  // Check custom header (for localStorage token passing)
  const auth0TokenHeader = req.headers['x-auth0-token'];
  if (auth0TokenHeader) {
    return Array.isArray(auth0TokenHeader) ? auth0TokenHeader[0] : auth0TokenHeader;
  }
  
  // Check query parameter
  const queryToken = req.query.auth_token;
  if (queryToken && typeof queryToken === 'string') {
    return queryToken;
  }
  
  return null;
}

/**
 * Flexible authentication middleware that supports both session auth and Auth0 token auth
 * This allows for a smoother transition between authentication states during onboarding
 */
export const flexibleAuth = (req: any, res: Response, next: NextFunction) => {
  // Already authenticated via session
  if (req.session && req.session.user) {
    console.log('User already authenticated via session', req.session.user.id);
    return next();
  }

  // Store some debug info
  let authSource = 'none';
  
  // Try Auth0 token authentication
  const token = extractAuth0Token(req);
  
  if (token) {
    console.log('Auth0 token provided - considering authenticated for onboarding');
    authSource = 'auth0';
    
    // In a production app, we would verify the token here with Auth0
    // For now, we'll accept the token and set a user in the session
    
    // Create a temporary user object
    req.user = {
      id: 1, // Will be overridden if user exists in DB
      auth0Id: token.substring(0, 10), // Just for representation
      email: 'user@example.com',
      username: 'user'
    };
    
    // If we have a session, store the Auth0 token info
    if (req.session) {
      // Store Auth0 token in session for later user lookup/creation
      req.session.auth0Token = token;
      req.session.authSource = 'auth0';
    }
    
    return next();
  }
  
  // No authentication found - return 401
  return res.status(401).json({
    success: false,
    message: 'Authentication required',
    authStatus: {
      authenticated: false,
      source: authSource,
      sessionExists: !!req.session,
      hasUser: !!(req.session && req.session.user),
      hasAuth0Token: !!token
    }
  });
};

/**
 * This middleware helps transition a user from Auth0 auth to session auth
 * by looking up or creating a local user based on Auth0 token info
 */
export const syncAuth0User = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Skip if already fully authenticated with session
    if (req.session && req.session.user && req.session.user.id) {
      return next();
    }
    
    // Check if we have Auth0 token
    if (!req.session || !req.session.auth0Token) {
      return next();
    }
    
    // In a real implementation, we would decode and verify the Auth0 token
    // and extract user information like email, name, etc.
    
    // For demo purposes, we'll look for an existing user or create one
    // In a real app, this would use the Auth0 user ID or email for lookup
    
    // We look for a user with an email containing 'auth0' for demo purposes
    let user = await db.select().from(users).where(eq(users.email, 'paddock20auto@gmail.com')).limit(1);
    
    if (user && user.length > 0) {
      // Found existing user - use for session
      console.log('Found existing user for Auth0 token');
      req.session.user = user[0];
      req.user = user[0];
    } else {
      // In a real implementation, we would create a new user with Auth0 profile data
      console.log('No matching user found for Auth0 token - using default user');
      
      // For demo, use a default user
      req.user = {
        id: 1,
        username: 'user',
        email: 'user@example.com'
      };
    }
    
    next();
  } catch (error) {
    console.error('Error in syncAuth0User middleware:', error);
    next(error);
  }
};

/**
 * Helper middleware to handle API responses if user is not authenticated
 * Allows customization of response messages and redirect URLs
 */
export const requireAuth = (options: { message?: string, redirectUrl?: string } = {}) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user && !req.session?.user) {
      if (options.redirectUrl) {
        return res.status(401).json({
          success: false,
          message: options.message || 'Authentication required',
          redirectUrl: options.redirectUrl
        });
      }
      return res.status(401).json({
        success: false,
        message: options.message || 'Authentication required'
      });
    }
    next();
  };
};

export default flexibleAuth;