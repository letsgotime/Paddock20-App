import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { extractAuth0Token } from '../middleware/flexibleAuth';

const router = Router();

/**
 * User profile endpoint that supports both session auth and Auth0 token auth
 * This helps create a seamless authentication experience during onboarding
 */
router.get('/api/user-profile', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated via session
    if (req.session && req.user) {
      console.log('User authenticated via session, returning profile');
      
      // Convert user to a safe object (remove sensitive data)
      const { password, resetToken, twoFactorSecret, ...safeUser } = req.user as any;
      return res.json(safeUser);
    }
    
    // Try Auth0 token auth if not authenticated via session
    const token = extractAuth0Token(req);
    
    if (token) {
      console.log('Auth0 token received, returning profile data');
      
      // In a real implementation, we would validate the Auth0 token
      // and fetch the corresponding user from our database
      
      // For now, we'll return a simple profile
      // This would be replaced with actual user data in production
      return res.json({
        id: 1,
        username: 'user',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        profileImage: null,
        role: 'user',
        // Include Auth0 ID in the response
        auth0Id: token.substring(0, 10), // Just for representation
        onboardingStatus: null
      });
    }
    
    // No authentication found
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Token validation endpoint
 * Checks if a provided Auth0 token is valid
 */
router.get('/api/validate-token', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated via session
    if (req.session && req.user) {
      return res.json({
        valid: true,
        authType: 'session',
        user: {
          id: (req.user as any).id,
          username: (req.user as any).username
        }
      });
    }
    
    // Try Auth0 token auth
    const token = extractAuth0Token(req);
    
    if (token) {
      // In a real implementation, we would validate the Auth0 token
      // For now, we'll consider any non-empty token as valid
      return res.json({
        valid: true,
        authType: 'auth0',
        // Add minimal user info
        user: {
          id: 1, // Would come from database in real implementation
          username: 'user',
          auth0Id: token.substring(0, 10) // Just for representation
        }
      });
    }
    
    // No valid authentication found
    return res.json({
      valid: false,
      authType: 'none'
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({
      valid: false,
      error: 'Internal server error'
    });
  }
});

export default router;