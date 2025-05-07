import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { storage } from './storage';
import { randomBytes } from 'crypto';

/**
 * Interface for enabling two-factor authentication
 */
interface EnableTwoFactorParams {
  userId: number;
  secret: string;
  token: string;
}

/**
 * Generate backup code with format like: XXXX-XXXX-XXXX-XXXX
 */
function generateBackupCode(): string {
  // Generate random bytes and convert to a hex string
  const bytes = randomBytes(8);
  const hexString = bytes.toString('hex');
  
  // Format as XXXX-XXXX-XXXX-XXXX
  return [
    hexString.substring(0, 4),
    hexString.substring(4, 8),
    hexString.substring(8, 12),
    hexString.substring(12, 16)
  ].join('-');
}

/**
 * Two-Factor Authentication Service
 * Provides methods for setting up, verifying, and managing 2FA
 */
class TwoFactorService {
  /**
   * Generate a new secret for 2FA setup
   * @param userId User ID
   * @param appName Application name to be shown in authenticator app
   * @returns Object containing secret and otpauth URL
   */
  async generateSecret(userId: number, appName: string): Promise<{ secret: string; otpauthUrl: string; qrCodeUrl: string }> {
    // Get user information for the label
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate a new secret
    const secretObject = speakeasy.generateSecret({
      length: 32, // Secure length
      name: `${appName} (${user.email || user.username})` // Label for authenticator app
    });
    
    // Save secret temporarily in database
    await storage.updateTwoFactorSecret(userId, secretObject.base32);
    
    // Generate QR code for easier setup
    const qrCodeUrl = await qrcode.toDataURL(secretObject.otpauth_url || '');
    
    // Log this action
    await storage.createAuthLog({
      userId,
      action: '2fa_setup_initiated',
      status: 'success',
      ipAddress: null,
      userAgent: null,
      details: {}
    });
    
    return {
      secret: secretObject.base32,
      otpauthUrl: secretObject.otpauth_url || '',
      qrCodeUrl
    };
  }
  
  /**
   * Enable 2FA for a user
   * @param params Object containing userId, secret, and verification token
   * @returns Array of backup codes
   */
  async enableTwoFactor(params: EnableTwoFactorParams): Promise<string[]> {
    const { userId, secret, token } = params;
    
    // Get user to verify they exist
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify the token is correct to ensure proper 2FA setup
    // No development bypasses - always verify using proper TOTP
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow for slight time skew (1 step = 30 seconds)
    });
    
    if (!verified) {
      throw new Error('Invalid verification code. Please try again.');
    }
    
    // Generate backup codes
    const backupCodes: string[] = [];
    const numBackupCodes = 8;
    
    for (let i = 0; i < numBackupCodes; i++) {
      backupCodes.push(generateBackupCode());
    }
    
    // Enable 2FA for the user
    await storage.enableTwoFactor(userId, secret, backupCodes);
    
    // Log successful 2FA setup
    await storage.createAuthLog({
      userId,
      action: '2fa_enabled',
      status: 'success',
      ipAddress: null,
      userAgent: null,
      details: {}
    });
    
    return backupCodes;
  }
  
  /**
   * Disable 2FA for a user
   * @param userId User ID
   */
  async disableTwoFactor(userId: number): Promise<void> {
    // Get user to verify they exist
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isTwoFactorEnabled) {
      throw new Error('Two-factor authentication is not enabled for this user');
    }
    
    // Disable 2FA for the user
    await storage.disableTwoFactor(userId);
    
    // Log 2FA disabled
    await storage.createAuthLog({
      userId,
      action: '2fa_disabled',
      status: 'success',
      ipAddress: null,
      userAgent: null,
      details: {}
    });
  }
  
  /**
   * Verify 2FA code during login
   * @param userId User ID
   * @param token Verification token or backup code
   * @param useBackupCode Whether to use backup code verification
   * @returns Boolean indicating successful verification
   */
  async verifyLogin(userId: number, token: string, useBackupCode: boolean = false): Promise<boolean> {
    // Get user with their 2FA secret
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.isTwoFactorEnabled) {
      throw new Error('Two-factor authentication is not enabled for this user');
    }
    
    // If using backup code
    if (useBackupCode && user.twoFactorBackupCodes) {
      const backupCodes = user.twoFactorBackupCodes;
      
      // Check if provided token is in the backup codes
      const index = backupCodes.indexOf(token);
      
      if (index !== -1) {
        // Remove the used backup code
        const updatedBackupCodes = [...backupCodes];
        updatedBackupCodes.splice(index, 1);
        
        // Update backup codes
        await storage.updateTwoFactorBackupCodes(userId, updatedBackupCodes);
        
        // Log backup code usage
        await storage.createAuthLog({
          userId,
          action: '2fa_backup_code_used',
          status: 'success',
          ipAddress: null,
          userAgent: null,
          details: {}
        });
        
        return true;
      }
      
      return false;
    }
    
    // Verify using TOTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret || '',
      encoding: 'base32',
      token,
      window: 1 // Allow for slight time skew
    });
    
    return verified;
  }
}

export const twoFactorService = new TwoFactorService();