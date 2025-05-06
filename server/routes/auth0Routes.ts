import { Router, Request, Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { ManagementClient } from 'auth0';

// Create router
const router = Router();

// Cache for beta tester data to minimize API calls
const betaTestersCache = {
  pendingTesters: [],
  lastFetched: 0,
  cacheDuration: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Cache for admin users to avoid repeated role checks
const adminCache = new Map<string, boolean>();

// Authentication check middleware - will be properly initialized based on env vars
let checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Start as a simple pass-through middleware
  next();
};

// Will hold the Auth0 management client once initialized
let managementClient: ManagementClient | null = null;

// Initialize Auth0 JWT verification middleware if possible
if (process.env.AUTH0_DOMAIN && process.env.AUTH0_AUDIENCE) {
  try {
    checkJwt = auth({
      audience: process.env.AUTH0_AUDIENCE,
      issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`
    });
    console.log('Auth0 JWT verification initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Auth0 JWT verification:', error);
  }
}

// Function to get the management client (lazy initialization)
async function getManagementClient(): Promise<ManagementClient> {
  if (managementClient) {
    return managementClient;
  }

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
    throw new Error('Auth0 credentials not fully configured');
  }

  try {
    console.log('Initializing Auth0 Management API client');
    managementClient = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
    });
    
    return managementClient;
  } catch (error) {
    console.error('Error initializing Auth0 Management API client:', error);
    throw new Error('Failed to initialize Auth0 Management client');
  }
}

// Middleware to check if user has admin role (with caching)
async function checkAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Get user ID from auth token
    const auth = req.auth as any;
    if (!auth || !auth.payload || !auth.payload.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = auth.payload.sub;
    
    // Check cache first
    if (adminCache.has(userId)) {
      const isAdmin = adminCache.get(userId);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }
      return next();
    }
    
    // Need to check with Auth0
    const management = await getManagementClient();
    const userRoles = await management.getUserRoles({ id: userId });
    
    // Check if user has admin role
    const isAdmin = userRoles.some((role: any) => role.name === 'Admin');
    
    // Cache the result
    adminCache.set(userId, isAdmin);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Route for user to request beta tester status
router.post('/api/auth/request-beta-status', checkJwt, async (req: Request, res: Response) => {
  try {
    const auth = req.auth as any;
    if (!auth || !auth.payload || !auth.payload.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = auth.payload.sub;
    console.log(`Updating beta tester status for user ${userId} to 'pending'`);
    
    // Get management client
    const management = await getManagementClient();
    
    // Update user metadata
    await management.updateUserMetadata({ id: userId }, {
      betaTesterStatus: 'pending'
    });
    
    // Invalidate cache since we've made a change
    betaTestersCache.lastFetched = 0;
    
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error requesting beta status:', error);
    return res.status(500).json({ 
      error: 'Failed to request beta tester status',
      message: error.message 
    });
  }
});

// Admin route to get all pending beta testers (with caching)
router.get('/api/admin/pending-beta-testers', checkJwt, checkAdmin, async (req: Request, res: Response) => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (betaTestersCache.lastFetched > 0 && 
        now - betaTestersCache.lastFetched < betaTestersCache.cacheDuration) {
      console.log('Returning cached beta testers list');
      return res.json({ users: betaTestersCache.pendingTesters });
    }
    
    console.log('Fetching pending beta testers from Auth0');
    
    // Get management client
    const management = await getManagementClient();
    
    // Query Auth0 for users with pending beta tester status
    const usersResponse = await management.getUsers({
      q: 'user_metadata.betaTesterStatus:"pending"',
      include_totals: true
    });
    
    // Update cache
    betaTestersCache.pendingTesters = usersResponse.users || [];
    betaTestersCache.lastFetched = now;
    
    return res.json({ users: betaTestersCache.pendingTesters });
  } catch (error: any) {
    console.error('Error getting pending beta testers:', error);
    return res.status(500).json({ 
      error: 'Failed to get pending beta testers',
      message: error.message 
    });
  }
});

// Admin route to approve a beta tester
router.post('/api/admin/approve-beta-tester/:userId', checkJwt, checkAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log(`Approving beta tester with ID: ${userId}`);
    
    // Get management client
    const management = await getManagementClient();
    
    // Update user metadata to approved status
    await management.updateUserMetadata({ id: userId }, {
      betaTesterStatus: 'approved'
    });
    
    // Get user information for email (only necessary fields)
    const user = await management.getUser({ id: userId, fields: 'email' });
    console.log(`User approved: ${user.email}`);
    
    // Invalidate cache since we've made a change
    betaTestersCache.lastFetched = 0;
    
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error approving beta tester:', error);
    return res.status(500).json({ 
      error: 'Failed to approve beta tester',
      message: error.message
    });
  }
});

// Configuration test endpoint
router.get('/api/auth/config-test', (req: Request, res: Response) => {
  // Log all environment variables for debugging
  console.log('Debugging Auth0 Environment Variables:');
  console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
  console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
  console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID);
  console.log('AUTH0_CLIENT_SECRET:', process.env.AUTH0_CLIENT_SECRET ? 'Set (not showing value)' : 'Not Set');
  
  // Attempt to initialize the management client as a test
  getManagementClient()
    .then(() => {
      res.json({
        message: 'Auth0 configuration valid',
        status: 'success',
        hasDomain: !!process.env.AUTH0_DOMAIN,
        hasAudience: !!process.env.AUTH0_AUDIENCE,
        hasClientId: !!process.env.AUTH0_CLIENT_ID,
        hasClientSecret: !!process.env.AUTH0_CLIENT_SECRET,
        managementClientInitialized: !!managementClient
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'Auth0 configuration test failed',
        status: 'error',
        error: error.message,
        hasDomain: !!process.env.AUTH0_DOMAIN,
        hasAudience: !!process.env.AUTH0_AUDIENCE,
        hasClientId: !!process.env.AUTH0_CLIENT_ID,
        hasClientSecret: !!process.env.AUTH0_CLIENT_SECRET
      });
    });
});

export default router;