import { Router, Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { ManagementClient } from 'auth0';

// Define Auth0 request interface to fix type issues
interface Auth0Request extends Request {
  auth?: {
    payload: {
      sub: string;
      [key: string]: any;
    };
  };
}

// Create router
const router = Router();

// Initialize Auth0 Management API client
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
});

// Middleware to verify JWT token from Auth0
// Only initialize if we have required values
const initializeAuth = () => {
  if (!process.env.AUTH0_AUDIENCE || !process.env.AUTH0_DOMAIN) {
    console.warn('Auth0 credentials not fully configured - routes will be unavailable');
    // Return a middleware that just passes through for now
    return (req: Request, res: Response, next: NextFunction) => next();
  }
  
  return auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  });
};

const checkJwt = initializeAuth();

// Log configuration for debug purposes
console.log('Auth0 Config:', {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  clientId: process.env.AUTH0_CLIENT_ID ? 'Set' : 'Not Set',
  clientSecret: process.env.AUTH0_CLIENT_SECRET ? 'Set' : 'Not Set'
});

// Middleware to check if user has admin role
const checkAdmin = async (req: Auth0Request, res: Response, next: NextFunction) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    
    if (!auth0Id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get user roles from Auth0
    const roles = await management.getUserRoles({ id: auth0Id });
    
    // Check if user has admin role
    const isAdmin = roles.some((role: any) => role.name === 'Admin');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin role required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Route for user to request beta tester status
router.post('/api/auth/request-beta-status', checkJwt, async (req: Auth0Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    
    if (!auth0Id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log(`Updating beta tester status for user ${auth0Id} to 'pending'`);
    
    // Update user metadata
    await management.updateUserMetadata({ id: auth0Id }, {
      betaTesterStatus: 'pending'
    });
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error requesting beta status:', error);
    res.status(500).json({ 
      error: 'Failed to request beta tester status',
      message: error.message 
    });
  }
});

// Admin route to get all pending beta testers
router.get('/api/admin/pending-beta-testers', checkJwt, checkAdmin, async (req: Auth0Request, res: Response) => {
  try {
    console.log('Fetching pending beta testers');
    
    // Query Auth0 for users with pending beta tester status
    const users = await management.getUsers({
      q: 'user_metadata.betaTesterStatus:"pending"',
      include_totals: true
    });
    
    res.json({ users: users.users || [] });
  } catch (error: any) {
    console.error('Error getting pending beta testers:', error);
    res.status(500).json({ 
      error: 'Failed to get pending beta testers',
      message: error.message 
    });
  }
});

// Admin route to approve a beta tester
router.post('/api/admin/approve-beta-tester/:userId', checkJwt, checkAdmin, async (req: Auth0Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    console.log(`Approving beta tester with ID: ${userId}`);
    
    // Update user metadata to approved status
    await management.updateUserMetadata({ id: userId }, {
      betaTesterStatus: 'approved'
    });
    
    // Get user information for email
    const user = await management.getUser({ id: userId });
    console.log(`User approved: ${user.email}`);
    
    // Send approval email - using Auth0's email provider
    // This requires setting up a custom email template in Auth0
    try {
      await management.sendEmailVerification({ user_id: userId });
    } catch (emailError: any) {
      console.warn('Could not send approval email:', emailError.message);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error approving beta tester:', error);
    res.status(500).json({ 
      error: 'Failed to approve beta tester',
      message: error.message
    });
  }
});

// Quick test endpoint
router.get('/api/auth/config-test', (req: Request, res: Response) => {
  res.json({
    message: 'Auth0 routes configured',
    hasDomain: !!process.env.AUTH0_DOMAIN,
    hasAudience: !!process.env.AUTH0_AUDIENCE,
    hasClientId: !!process.env.AUTH0_CLIENT_ID,
    hasClientSecret: !!process.env.AUTH0_CLIENT_SECRET
  });
});

export default router;