import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { extractAuth0Token } from '../middleware/flexibleAuth';

const router = Router();

// Cache for authenticated user tokens to reduce database lookups
const userCache = new Map<string, { user: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

// Initialize cache cleanup - run every 15 minutes
setInterval(() => {
  try {
    const now = Date.now();
    let expiredCount = 0;
    
    // Clean up expired cache entries
    userCache.forEach((value, key) => {
      if (now - value.timestamp > CACHE_TTL) {
        userCache.delete(key);
        expiredCount++;
      }
    });
    
    // Log cache stats if any items were cleaned up
    if (expiredCount > 0) {
      console.log(`[Cache] Cleaned up ${expiredCount} expired entries. Current cache size: ${userCache.size}`);
    }
  } catch (err) {
    console.error('[Cache] Error during cache cleanup:', err);
  }
}, CACHE_CLEANUP_INTERVAL);

// Request execution timer middleware
function requestTimer(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 100) { // Only log slower requests
      console.log(`[PERF] ${req.method} ${req.originalUrl} completed in ${duration}ms`);
    }
  });
  next();
}

// Apply performance middleware to all routes
router.use(requestTimer);

/**
 * User profile endpoint that supports both session auth and Auth0 token auth
 * This helps create a seamless authentication experience during onboarding
 */
router.get('/api/user-profile', async (req: Request, res: Response) => {
  try {
    // Set cache headers to optimize for performance
    res.setHeader('Cache-Control', 'private, max-age=10'); // Short TTL to ensure freshness
    
    // Check if user is authenticated via session
    if (req.session && req.user) {
      // Convert user to a safe object (remove sensitive data)
      const { password, resetToken, twoFactorSecret, ...safeUser } = req.user as any;
      
      // Get a unique identifier for this user
      const userId = safeUser.id || safeUser.auth0Id;
      
      // Add minimal logging to avoid log pollution
      if (!userCache.has(userId)) {
        console.log('User authenticated via session, returning profile');
      }
      
      return res.json(safeUser);
    }
    
    // Try Auth0 token auth if not authenticated via session
    const token = extractAuth0Token(req);
    
    if (token) {
      // Check cache first for this token
      const cacheKey = `auth0:${token.slice(0, 20)}`; // Use first part of token as key
      const now = Date.now();
      const cachedData = userCache.get(cacheKey);
      
      // Return cached user data if available and not expired
      if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        return res.json(cachedData.user);
      }
      
      console.log('Auth0 token received, user not in cache, processing');
      
      // In a production implementation, we would validate the Auth0 token
      // and fetch the corresponding user from our database
      
      // Create a user profile (simplified for demonstration)
      const userProfile = {
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
      };
      
      // Cache the user data
      userCache.set(cacheKey, {
        user: userProfile,
        timestamp: now
      });
      
      return res.json(userProfile);
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
 * Optimized for performance with caching and minimal processing
 */
router.get('/api/validate-token', async (req: Request, res: Response) => {
  try {
    // Set cache headers - token validation can be cached for a bit longer
    res.setHeader('Cache-Control', 'private, max-age=30');
    
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
      // Check cache first for this token validation
      const cacheKey = `validate:${token.slice(0, 20)}`;
      const now = Date.now();
      const cachedValidation = userCache.get(cacheKey);
      
      // Return cached validation if available and not expired
      if (cachedValidation && (now - cachedValidation.timestamp < CACHE_TTL)) {
        return res.json(cachedValidation.user);
      }
      
      // In a production implementation, we would validate the Auth0 token properly
      // For demonstration, we just check if it's non-empty
      const validationResult = {
        valid: true,
        authType: 'auth0',
        // Add minimal user info
        user: {
          id: 1, // Would come from database in real implementation
          username: 'user',
          auth0Id: token.substring(0, 10) // Just for representation
        }
      };
      
      // Cache the validation result
      userCache.set(cacheKey, {
        user: validationResult,
        timestamp: now
      });
      
      return res.json(validationResult);
    }
    
    // No valid authentication found - this can be cached too
    const invalidResult = {
      valid: false,
      authType: 'none'
    };
    
    return res.json(invalidResult);
  } catch (error) {
    // For security, don't expose details of validation errors
    console.error('Error validating token:', error);
    
    // Return a generic error
    res.status(500).json({
      valid: false,
      error: 'Unable to validate credentials'
    });
  }
});

/**
 * Admin/Debug endpoint to check cache status and perform maintenance
 * This endpoint is protected and should only be accessible to admins
 */
router.get('/api/auth/cache-status', async (req: Request, res: Response) => {
  try {
    // Only allow access if the user is authenticated and has admin rights
    if (!req.session || !req.user || (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Get cache statistics
    const stats = {
      cacheSize: userCache.size,
      ttlMinutes: CACHE_TTL / (60 * 1000),
      cleanupIntervalMinutes: CACHE_CLEANUP_INTERVAL / (60 * 1000),
      serverTime: new Date().toISOString()
    };
    
    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error accessing cache status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * Admin endpoint to manually clear the cache
 * This endpoint is protected and should only be accessible to admins
 */
router.post('/api/auth/clear-cache', async (req: Request, res: Response) => {
  try {
    // Only allow access if the user is authenticated and has admin rights
    if (!req.session || !req.user || (req.user as any).role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }
    
    // Get the current cache size before clearing
    const previousSize = userCache.size;
    
    // Clear the entire cache
    userCache.clear();
    
    console.log(`[Cache] Manually cleared ${previousSize} cache entries`);
    
    return res.json({
      success: true,
      message: `Cache cleared successfully. ${previousSize} entries removed.`,
      stats: {
        previousSize,
        currentSize: userCache.size,
        clearedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;