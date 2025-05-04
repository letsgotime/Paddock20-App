import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { storage } from './storage';

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
  const groups = [];
  for (let i = 0; i < 4; i++) {
    // Generate 4 alphanumeric characters
    const group = Math.random().toString(36).substring(2, 6).toUpperCase();
    groups.push(group);
  }
  return groups.join('-');
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
    try {
      // Get user to include username in the otpauth URL
      const user = await storage.getUser(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new secret
      const secretObj = speakeasy.generateSecret({
        name: `${appName}:${user.username}`,
        length: 20
      });
      
      // Check if the secret is valid (should always be the case with speakeasy.generateSecret)
      if (!secretObj.base32) {
        throw new Error('Failed to generate valid secret');
      }
      
      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secretObj.otpauth_url || '');
      
      return {
        secret: secretObj.base32,
        otpauthUrl: secretObj.otpauth_url || '',
        qrCodeUrl
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      throw error;
    }
  }
  
  /**
   * Enable 2FA for a user
   * @param params Object containing userId, secret, and verification token
   * @returns Array of backup codes
   */
  async enableTwoFactor(params: EnableTwoFactorParams): Promise<string[]> {
    try {
      const { userId, secret, token } = params;
      
      // Verify token first
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1 // Allow 1 period before/after for clock skew
      });
      
      if (!verified) {
        throw new Error('Invalid verification code');
      }
      
      // Generate backup codes
      const backupCodes: string[] = [];
      for (let i = 0; i < 8; i++) {
        backupCodes.push(generateBackupCode());
      }
      
      // Store the secret and backup codes
      await storage.enableTwoFactor(userId, secret, backupCodes);
      
      return backupCodes;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw error;
    }
  }
  
  /**
   * Disable 2FA for a user
   * @param userId User ID
   */
  async disableTwoFactor(userId: number): Promise<void> {
    try {
      await storage.disableTwoFactor(userId);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }
  
  /**
   * Verify 2FA code during login
   * @param userId User ID
   * @param token Verification token or backup code
   * @param useBackupCode Whether to use backup code verification
   * @returns Boolean indicating successful verification
   */
  async verifyLogin(userId: number, token: string, useBackupCode: boolean = false): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('Two-factor authentication is not enabled for this user');
      }
      
      if (useBackupCode) {
        // Verify backup code
        const backupCodes = user.backupCodes || [];
        const codeIndex = backupCodes.indexOf(token);
        
        if (codeIndex === -1) {
          return false;
        }
        
        // Remove the used backup code
        const newBackupCodes = [...backupCodes];
        newBackupCodes.splice(codeIndex, 1);
        
        // Update backup codes
        await storage.updateBackupCodes(userId, newBackupCodes);
        
        return true;
      } else {
        // Verify TOTP code
        return speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token,
          window: 1 // Allow 1 period before/after for clock skew
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA login:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const twoFactorService = new TwoFactorService();