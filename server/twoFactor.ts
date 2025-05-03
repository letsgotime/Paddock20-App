import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { User } from '@shared/schema';

interface VerifyOptions {
  userId: number;
  token: string;
  secret: string;
}

export class TwoFactorService {
  /**
   * Generate a new TOTP secret for a user
   */
  async generateSecret(userId: number, appName = 'Paddock20'): Promise<{ secret: string; otpAuthUrl: string }> {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${appName}:${user.email || user.username}`
    });
    
    // Store the secret temporarily (it will be fully saved after verification)
    await storage.updateTwoFactorSecret(userId, secret.base32);
    
    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url || ''
    };
  }

  /**
   * Verify a token against the user's secret
   */
  async verifyToken(options: VerifyOptions): Promise<boolean> {
    const { userId, token, secret } = options;
    
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step before/after for clock drift (30 seconds each)
    });
    
    return verified;
  }

  /**
   * Enable 2FA for a user after validating the first token
   */
  async enableTwoFactor(options: VerifyOptions): Promise<string[]> {
    const { userId, token, secret } = options;
    
    const verified = await this.verifyToken(options);
    
    if (!verified) {
      throw new Error('Invalid verification code');
    }
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Save 2FA data
    await storage.enableTwoFactor(userId, secret, backupCodes);
    
    return backupCodes;
  }

  /**
   * Verify a token for a user during login
   */
  async verifyLogin(userId: number, token: string, useBackupCode = false): Promise<boolean> {
    const user = await storage.getUser(userId);
    
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('Two-factor authentication is not enabled for this user');
    }
    
    if (useBackupCode) {
      return this.verifyBackupCode(userId, token);
    }
    
    return this.verifyToken({
      userId,
      token,
      secret: user.twoFactorSecret
    });
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    
    if (!user || !user.twoFactorBackupCodes) {
      return false;
    }
    
    const backupCodes = Array.isArray(user.twoFactorBackupCodes) 
      ? user.twoFactorBackupCodes 
      : JSON.parse(user.twoFactorBackupCodes as unknown as string);
    
    const codeIndex = backupCodes.indexOf(code);
    
    if (codeIndex === -1) {
      return false;
    }
    
    // Remove the used backup code
    const updatedCodes = [...backupCodes];
    updatedCodes.splice(codeIndex, 1);
    
    // Update the backup codes
    await storage.updateTwoFactorBackupCodes(userId, updatedCodes);
    
    return true;
  }

  /**
   * Disable 2FA for a user
   */
  async disableTwoFactor(userId: number): Promise<void> {
    await storage.disableTwoFactor(userId);
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count = 8, length = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a backup code in the format XXXX-XXXX-XX with the specified total length
      const segments = [];
      let remaining = length;
      
      while (remaining > 0) {
        const segLength = Math.min(4, remaining);
        segments.push(this.generateRandomString(segLength));
        remaining -= segLength;
      }
      
      codes.push(segments.join('-'));
    }
    
    return codes;
  }

  /**
   * Generate a random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

export const twoFactorService = new TwoFactorService();