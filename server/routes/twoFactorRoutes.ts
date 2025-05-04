import { Router } from 'express';
import { twoFactorService } from '../twoFactor';
import { requireAuth, require2FASession } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for setup initiation
const setupInitSchema = z.object({
  userId: z.number()
});

// Schema for enabling 2FA
const enableTwoFactorSchema = z.object({
  userId: z.number(),
  secret: z.string(),
  token: z.string()
});

// Schema for disabling 2FA
const disableTwoFactorSchema = z.object({
  userId: z.number()
});

// Schema for verification during login
const verifyLoginSchema = z.object({
  token: z.string(),
  useBackupCode: z.boolean().optional().default(false)
});

/**
 * Generate 2FA secret and QR code for setup
 * POST /api/2fa/setup
 */
router.post('/api/2fa/setup', requireAuth, async (req, res) => {
  try {
    const { userId } = setupInitSchema.parse(req.body);
    
    // Check if user ID matches authenticated user
    if (userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only setup 2FA for your own account'
      });
    }
    
    const appName = 'Paddock20 F1';
    const result = await twoFactorService.generateSecret(userId, appName);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error generating 2FA setup:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to setup two-factor authentication'
    });
  }
});

/**
 * Enable 2FA for a user
 * POST /api/2fa/enable
 */
router.post('/api/2fa/enable', requireAuth, async (req, res) => {
  try {
    const { userId, secret, token } = enableTwoFactorSchema.parse(req.body);
    
    // Check if user ID matches authenticated user
    if (userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only enable 2FA for your own account'
      });
    }
    
    const backupCodes = await twoFactorService.enableTwoFactor({
      userId,
      secret,
      token
    });
    
    res.status(200).json({
      success: true,
      backupCodes
    });
  } catch (error: any) {
    console.error('Error enabling 2FA:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enable two-factor authentication'
    });
  }
});

/**
 * Disable 2FA for a user
 * POST /api/2fa/disable
 */
router.post('/api/2fa/disable', requireAuth, async (req, res) => {
  try {
    const { userId } = disableTwoFactorSchema.parse(req.body);
    
    // Check if user ID matches authenticated user
    if (userId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only disable 2FA for your own account'
      });
    }
    
    await twoFactorService.disableTwoFactor(userId);
    
    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to disable two-factor authentication'
    });
  }
});

/**
 * Verify 2FA token during login
 * POST /api/2fa/verify
 */
router.post('/api/2fa/verify', require2FASession, async (req, res) => {
  try {
    const { token, useBackupCode } = verifyLoginSchema.parse(req.body);
    
    // Get user ID from the temp2FA session data
    const { userId, username, remember } = req.session.temp2FA!;
    
    // Verify the provided token or backup code
    const verified = await twoFactorService.verifyLogin(
      userId,
      token,
      useBackupCode
    );
    
    if (!verified) {
      // Log failed verification
      await storage.createAuthLog({
        userId,
        action: 'login_2fa_verify',
        status: 'failed',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        details: { useBackupCode }
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
    }
    
    // Get the user from the database
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Complete login process by creating a full session
    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error('Session creation error after 2FA:', loginErr);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to create session after 2FA verification" 
        });
      }
      
      // Update last login time
      await storage.updateUserLastLogin(userId);
      
      // Create session record
      const sessionId = req.sessionID;
      const cookieMaxAge = remember
        ? 1000 * 60 * 60 * 24 * 30 // 30 days for "remember me"
        : 1000 * 60 * 60 * 24;     // 1 day default
        
      await storage.createSession({
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + cookieMaxAge),
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null
      });
      
      // Log successful login with 2FA
      await storage.createAuthLog({
        userId,
        action: 'login_2fa_complete',
        status: 'success',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        details: { useBackupCode }
      });
      
      // Clear the temporary 2FA session data
      delete req.session.temp2FA;
      
      // Return sanitized user data
      const { password, resetToken, verificationToken, twoFactorSecret, ...safeUserData } = user;
      
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        user: safeUserData
      });
    });
  } catch (error: any) {
    console.error('Error verifying 2FA:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify two-factor authentication'
    });
  }
});

export default router;