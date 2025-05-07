/**
 * Authentication Routes
 * 
 * Provides API endpoints for authentication and user management.
 */

import express, { Request, Response } from 'express';
import { authService } from '../services/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { insertUserSchema } from '@shared/schema';
import { AuthWarehouse } from '../data/authWarehouse';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationResult.error.errors,
      });
    }

    // Register user
    const user = await authService.registerUser(validationResult.data);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to register user',
      });
    }

    // Create session
    if (req.session) {
      req.session.userId = user.id;
      req.session.lastActive = new Date();
    }

    // Return safe user (no password)
    const safeUser = AuthWarehouse.UserManager.getSafeUser(user);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Authenticate user
    const user = await authService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create session
    if (req.session) {
      req.session.userId = user.id;
      req.session.lastActive = new Date();
    }

    // Return safe user (no password)
    const safeUser = AuthWarehouse.UserManager.getSafeUser(user);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authMiddleware.isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;

    // Log the logout
    if (userId) {
      await AuthWarehouse.AuthLogManager.createLog({
        userId,
        action: 'logout',
        status: 'success',
      });
    }

    // Destroy session
    req.session?.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({
          success: false,
          message: 'Error logging out',
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   GET /api/auth/user
 * @desc    Get current user
 * @access  Private
 */
router.get('/user', authMiddleware.isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get current user
    const user = await authService.getCurrentUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return safe user (no password)
    const safeUser = AuthWarehouse.UserManager.getSafeUser(user);
    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware.isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Update profile
    const updatedUser = await authService.updateUserProfile(userId, req.body);
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update profile',
      });
    }

    // Return safe user (no password)
    const safeUser = AuthWarehouse.UserManager.getSafeUser(updatedUser);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authMiddleware.isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Change password
    const success = await authService.changePassword(userId, currentPassword, newPassword);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to change password. Current password may be incorrect.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Initiate password reset
    const token = await authService.initiatePasswordReset(email);
    
    // Even if user not found, return success to prevent user enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // In a real app, you would send this token via email
      // We're returning it here for testing purposes
      token: token,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Reset password
    const success = await authService.resetPassword(token, newPassword);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

/**
 * @route   GET /api/auth/logs
 * @desc    Get user's auth logs
 * @access  Private
 */
router.get('/logs', authMiddleware.isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    // Get logs
    const logs = await authService.getUserAuthLogs(userId);
    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Get auth logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Export router
export default router;