import { Router, Request, Response } from 'express';
import { twoFactorService } from '../twoFactor';
import { storage } from '../storage';

// Import authentication middleware
const checkAuthentication = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

const router = Router();

/**
 * Generate new 2FA secret and return otpauth URL
 */
router.post('/setup', checkAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const result = await twoFactorService.generateSecret(userId, 'Paddock20');
    
    res.json(result);
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to set up 2FA' });
  }
});

/**
 * Verify and enable 2FA
 */
router.post('/verify', checkAuthentication, async (req: Request, res: Response) => {
  try {
    const { userId, secret, token } = req.body;
    
    if (!userId || !secret || !token) {
      return res.status(400).json({ error: 'User ID, secret, and token are required' });
    }
    
    const backupCodes = await twoFactorService.enableTwoFactor({
      userId,
      secret,
      token
    });
    
    res.json({ success: true, backupCodes });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to verify 2FA code' });
  }
});

/**
 * Disable 2FA
 */
router.post('/disable', checkAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await twoFactorService.disableTwoFactor(userId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to disable 2FA' });
  }
});

/**
 * Verify 2FA during login
 */
router.post('/verify-login', async (req: Request, res: Response) => {
  try {
    const { userId, token, useBackupCode } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required' });
    }
    
    const verified = await twoFactorService.verifyLogin(
      userId, 
      token, 
      useBackupCode === true
    );
    
    if (verified) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to verify code' });
  }
});

/**
 * Check if user has 2FA enabled
 */
router.get('/status/:userId', checkAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      enabled: user.twoFactorEnabled === true
    });
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to check 2FA status' });
  }
});

export default router;