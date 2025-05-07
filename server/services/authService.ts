/**
 * Auth Service
 * 
 * Provides authentication and user management services
 * that connect to the AuthWarehouse data layer.
 */

import { Request, Response, NextFunction } from 'express';
import { AuthWarehouse, PasswordUtils, UserManager } from '../data/authWarehouse';
import { InsertUser, User } from '@shared/schema';

export class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUser = await UserManager.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const existingUsername = await UserManager.getUserByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username is already taken');
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(userData.password);
      
      // Create user
      const user = await UserManager.createUser({
        ...userData,
        password: hashedPassword,
      });

      if (!user) {
        throw new Error('Failed to create user');
      }

      // Create auth log
      await AuthWarehouse.AuthLogManager.createLog({
        userId: user.id,
        action: 'register',
        status: 'success',
      });

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  /**
   * Authenticate a user
   */
  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      // Get user by email
      const user = await UserManager.getUserByEmail(email);
      if (!user) {
        return null;
      }

      // Compare passwords
      const isPasswordValid = await PasswordUtils.comparePasswords(password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        await AuthWarehouse.AuthLogManager.createLog({
          userId: user.id,
          action: 'login',
          status: 'failed',
          details: { reason: 'invalid_password' },
        });
        return null;
      }

      // Update last login
      await UserManager.updateLastLogin(user.id);

      // Log successful login
      await AuthWarehouse.AuthLogManager.createLog({
        userId: user.id,
        action: 'login',
        status: 'success',
      });

      return user;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: number): Promise<User | null> {
    try {
      const user = await UserManager.getUserById(userId);
      return user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserManager.updateUserProfile(userId, profileData);
      return updatedUser || null;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Get user
      const user = await UserManager.getUserById(userId);
      if (!user) {
        return false;
      }

      // Verify current password
      const isPasswordValid = await PasswordUtils.comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return false;
      }

      // Update password
      await UserManager.updateUserPassword(userId, newPassword);

      // Log password change
      await AuthWarehouse.AuthLogManager.createLog({
        userId,
        action: 'password_change',
        status: 'success',
      });

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(email: string): Promise<string | null> {
    try {
      // Get user by email
      const user = await UserManager.getUserByEmail(email);
      if (!user) {
        return null;
      }

      // Generate reset token
      const token = await UserManager.setPasswordResetToken(user.id);
      
      if (!token) {
        return null;
      }

      // Log password reset request
      await AuthWarehouse.AuthLogManager.createLog({
        userId: user.id,
        action: 'password_reset_request',
        status: 'success',
      });

      return token;
    } catch (error) {
      console.error('Password reset initiation error:', error);
      return null;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Get user by reset token
      const user = await UserManager.getUserByResetToken(token);
      if (!user) {
        return false;
      }

      // Update password
      await UserManager.updateUserPassword(user.id, newPassword);
      
      // Clear reset token
      await UserManager.clearResetToken(user.id);

      // Log password reset
      await AuthWarehouse.AuthLogManager.createLog({
        userId: user.id,
        action: 'password_reset',
        status: 'success',
      });

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  }

  /**
   * Get user's recent auth logs
   */
  async getUserAuthLogs(userId: number, limit = 10): Promise<any[]> {
    try {
      return await AuthWarehouse.AuthLogManager.getLogsForUser(userId, limit);
    } catch (error) {
      console.error('Get auth logs error:', error);
      return [];
    }
  }
}

// Export instance of AuthService
export const authService = new AuthService();