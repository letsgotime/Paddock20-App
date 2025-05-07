/**
 * UserProfile API Routes
 * Routes for managing user profile data in the warehouse
 */
import express from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  next();
};

// Get the current user's profile
router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }
    
    // Return without sensitive info
    const profile = user[0];
    const safeProfile = {
      ...profile,
      password: undefined
    };
    
    return res.json({ 
      success: true, 
      profile: safeProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile'
    });
  }
});

// Update user's profile - this endpoint will update both DB and provide data for the warehouse
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    const sessionUser = req.session.user;
    
    // Security check: ensure user is only updating their own profile
    if (sessionUser.id.toString() !== userId && sessionUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to update this profile' 
      });
    }
    
    // Extract safe data from request body
    const { 
      firstName, lastName, nickname, 
      onboardingCompleted, userPreferences,
      vehicles, drivingRecords, appSettings,
      onboardingStatus, interests, 
      shirtSize, garageTheme
    } = req.body;
    
    // Only update allowed fields
    const updateData: any = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;
    
    // Store preferences, vehicles, and other complex data as JSON
    if (userPreferences) updateData.preferences = JSON.stringify(userPreferences);
    if (vehicles) updateData.vehicles = JSON.stringify(vehicles);
    if (drivingRecords) updateData.drivingRecords = JSON.stringify(drivingRecords);
    if (appSettings) updateData.appSettings = JSON.stringify(appSettings);
    if (onboardingStatus) updateData.onboardingStatus = JSON.stringify(onboardingStatus);
    if (interests) updateData.interests = JSON.stringify(interests);
    if (shirtSize) updateData.shirtSize = shirtSize;
    if (garageTheme) updateData.garageTheme = garageTheme;
    
    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields to update'
      });
    }
    
    // Update the user profile in the database
    const updated = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }
    
    // Return the updated profile without sensitive info
    const updatedProfile = updated[0];
    const safeProfile = {
      ...updatedProfile,
      password: undefined
    };
    
    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: safeProfile
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile'
    });
  }
});

// Special endpoint for updating onboarding status
router.patch('/:id/onboarding', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id;
    const sessionUser = req.session.user;
    
    // Security check: ensure user is only updating their own profile
    if (sessionUser.id.toString() !== userId && sessionUser.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to update this profile' 
      });
    }
    
    const { step, completed, data } = req.body;
    
    if (completed === undefined && step === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Must provide either step or completed status'
      });
    }
    
    // Get current onboarding status
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }
    
    let onboardingStatus = {};
    
    // Parse existing onboarding status if it exists
    try {
      if (user[0].onboardingStatus) {
        onboardingStatus = JSON.parse(user[0].onboardingStatus);
      }
    } catch (e) {
      console.warn('Could not parse existing onboarding status, starting fresh');
    }
    
    // Update the onboarding status
    const updatedStatus = {
      ...onboardingStatus,
      ...(step !== undefined && { currentStep: step }),
      ...(completed !== undefined && { completed }),
      ...(data && { [`step${step}Data`]: data })
    };
    
    // If marking as completed, update the onboardingCompleted flag as well
    const updateData: any = {
      onboardingStatus: JSON.stringify(updatedStatus)
    };
    
    if (completed === true) {
      updateData.onboardingCompleted = true;
    }
    
    // Update the user profile
    const updated = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }
    
    return res.json({ 
      success: true, 
      message: 'Onboarding status updated',
      onboardingStatus: updatedStatus
    });
    
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while updating onboarding status'
    });
  }
});

export default router;