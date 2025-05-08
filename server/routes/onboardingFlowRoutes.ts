/**
 * Onboarding Flow Routes
 * Centralizes the logic for handling the seamless flow from Auth0 to Beta Welcome to Onboarding to Homepage
 */
import express from 'express';
import { db } from '../db';
import { users, OnboardingStatus } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { flexibleAuth, syncAuth0User, requireAuth } from '../middleware/flexibleAuth';

const router = express.Router();

/**
 * Get current onboarding state for a user
 * This allows the frontend to determine which screen to show
 */
router.get('/api/onboarding/state', flexibleAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    console.log(`Getting onboarding state for user ${userId}`);
    
    // Try to fetch the user from the database
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    // Default state is at the beginning
    let state: OnboardingStatus = {
      // Global state tracking
      hasAcceptedBeta: false,
      hasCompletedOnboarding: false,
      currentStep: 'beta-welcome',
      nextStep: 'beta-welcome',
      
      // Specific step completion tracking
      betaWelcomeCompleted: false,
      legalAgreementsCompleted: false,
      profileSetupCompleted: false,
      vehicleAdditionCompleted: false,
      
      // Track when onboarding was started and completed
      onboardingStartedAt: null,
      onboardingCompletedAt: null,
      
      // Any additional onboarding data
      beta: {
        role: 'user',
        entryDate: new Date().toISOString()
      }
    };
    
    // Attempt to parse the onboarding status if it exists
    if (user && user.length > 0 && user[0].onboardingStatus) {
      try {
        const parsedStatus = JSON.parse(user[0].onboardingStatus);
        // Merge the stored state with our default
        state = {
          ...state,
          ...parsedStatus
        };
        console.log('Found existing onboarding state:', state);
      } catch (e) {
        console.warn('Could not parse onboarding status, using default', e);
      }
    }
    
    // Determine the next appropriate step based on the current state
    if (!state.betaWelcomeCompleted) {
      state.nextStep = 'beta-welcome';
    } else if (!state.legalAgreementsCompleted) {
      state.nextStep = 'legal-agreements';
    } else if (!state.profileSetupCompleted) {
      state.nextStep = 'profile-setup';
    } else if (!state.vehicleAdditionCompleted) {
      state.nextStep = 'vehicle-addition';
    } else if (!state.hasCompletedOnboarding) {
      state.nextStep = 'onboarding-complete';
    } else {
      state.nextStep = 'homepage';
    }
    
    // Override with the global completion flag if it's set
    if (user && user.length > 0 && user[0].onboardingCompleted) {
      state.hasCompletedOnboarding = true;
      state.nextStep = 'homepage';
    }
    
    res.json({
      success: true,
      state
    });
  } catch (error) {
    console.error('Error getting onboarding state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding state',
      error: error.message
    });
  }
});

/**
 * Update onboarding state for a user
 * This allows the frontend to progress through the onboarding flow
 */
router.post('/api/onboarding/state', flexibleAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    console.log(`Updating onboarding state for user ${userId}`);
    
    const { step, completed, data } = req.body;
    
    if (!step) {
      return res.status(400).json({
        success: false,
        message: 'Step parameter is required'
      });
    }
    
    // Get current onboarding status from database
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Parse existing onboarding status or start with a new one
    let onboardingStatus: Partial<OnboardingStatus> = {};
    try {
      if (user[0].onboardingStatus && typeof user[0].onboardingStatus === 'string') {
        onboardingStatus = JSON.parse(user[0].onboardingStatus as string);
      }
    } catch (e) {
      console.warn('Could not parse onboarding status, starting fresh');
    }
    
    // Update the status based on the step
    const now = new Date().toISOString();
    
    // If we're just starting onboarding, record the start time
    if (!onboardingStatus.onboardingStartedAt) {
      onboardingStatus.onboardingStartedAt = now;
    }
    
    // Update the specific step completion status
    let updatedStatus = {
      ...onboardingStatus,
      currentStep: step
    };
    
    // Handle different step completions
    if (completed) {
      switch (step) {
        case 'beta-welcome':
          updatedStatus.betaWelcomeCompleted = true;
          updatedStatus.nextStep = 'legal-agreements';
          // Store any beta-specific data
          if (data && data.betaRole) {
            updatedStatus.beta = {
              ...updatedStatus.beta,
              role: data.betaRole,
              entryDate: now
            };
          }
          break;
          
        case 'legal-agreements':
          updatedStatus.legalAgreementsCompleted = true;
          updatedStatus.nextStep = 'profile-setup';
          break;
          
        case 'profile-setup':
          updatedStatus.profileSetupCompleted = true;
          updatedStatus.nextStep = 'vehicle-addition';
          break;
          
        case 'vehicle-addition':
          updatedStatus.vehicleAdditionCompleted = true;
          updatedStatus.nextStep = 'onboarding-complete';
          break;
          
        case 'onboarding-complete':
          updatedStatus.hasCompletedOnboarding = true;
          updatedStatus.onboardingCompletedAt = now;
          updatedStatus.nextStep = 'homepage';
          break;
      }
    }
    
    // Determine if all onboarding is complete
    const allComplete = 
      updatedStatus.betaWelcomeCompleted &&
      updatedStatus.legalAgreementsCompleted &&
      updatedStatus.profileSetupCompleted &&
      (updatedStatus.vehicleAdditionCompleted || step === 'vehicle-addition' && data?.skipVehicle);
    
    // If all steps are complete, mark onboarding as complete
    if (allComplete && !updatedStatus.hasCompletedOnboarding) {
      updatedStatus.hasCompletedOnboarding = true;
      updatedStatus.onboardingCompletedAt = now;
      updatedStatus.nextStep = 'homepage';
    }
    
    // Store any additional step data if provided
    if (data) {
      // Create a property like step1Data for the current step
      const stepDataKey = `${step}Data`;
      updatedStatus[stepDataKey] = data;
    }
    
    // Update the database with the new status
    const updateValues: any = {
      onboardingStatus: JSON.stringify(updatedStatus)
    };
    
    // If onboarding is complete, also update the onboardingCompleted flag
    if (updatedStatus.hasCompletedOnboarding) {
      updateValues.onboardingCompleted = true;
    }
    
    // Update the user in the database
    const updated = await db.update(users)
      .set(updateValues)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update onboarding state'
      });
    }
    
    // If we have a session, update it with the onboarding status
    if (req.session && req.session.user) {
      req.session.user.onboardingStatus = updatedStatus;
      req.session.user.onboardingCompleted = updatedStatus.hasCompletedOnboarding;
    }
    
    res.json({
      success: true,
      message: 'Onboarding state updated successfully',
      state: updatedStatus
    });
  } catch (error) {
    console.error('Error updating onboarding state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update onboarding state',
      error: error.message
    });
  }
});

/**
 * Skip to the next onboarding step
 * Convenience endpoint for testing and for users who want to skip steps
 */
router.post('/api/onboarding/next', flexibleAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    console.log(`Advancing to next onboarding step for user ${userId}`);
    
    // Get current onboarding status from database
    const user = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Parse existing onboarding status or start with a new one
    let onboardingStatus: Partial<OnboardingStatus> = {
      currentStep: 'beta-welcome',
      nextStep: 'beta-welcome'
    };
    
    try {
      if (user[0].onboardingStatus && typeof user[0].onboardingStatus === 'string') {
        onboardingStatus = JSON.parse(user[0].onboardingStatus as string);
      }
    } catch (e) {
      console.warn('Could not parse onboarding status, starting fresh');
    }
    
    // Determine the next step based on the current state
    let nextStep = 'beta-welcome';
    
    switch (onboardingStatus.currentStep) {
      case 'beta-welcome':
        nextStep = 'legal-agreements';
        onboardingStatus.betaWelcomeCompleted = true;
        break;
        
      case 'legal-agreements':
        nextStep = 'profile-setup';
        onboardingStatus.legalAgreementsCompleted = true;
        break;
        
      case 'profile-setup':
        nextStep = 'vehicle-addition';
        onboardingStatus.profileSetupCompleted = true;
        break;
        
      case 'vehicle-addition':
        nextStep = 'onboarding-complete';
        onboardingStatus.vehicleAdditionCompleted = true;
        break;
        
      case 'onboarding-complete':
        nextStep = 'homepage';
        onboardingStatus.hasCompletedOnboarding = true;
        break;
        
      default:
        nextStep = 'beta-welcome';
    }
    
    // Update the status
    onboardingStatus.currentStep = nextStep;
    onboardingStatus.nextStep = nextStep;
    
    // Check if onboarding is now complete
    if (nextStep === 'homepage') {
      onboardingStatus.hasCompletedOnboarding = true;
      onboardingStatus.onboardingCompletedAt = new Date().toISOString();
    }
    
    // Update the database with the new status
    const updateValues: any = {
      onboardingStatus: JSON.stringify(onboardingStatus)
    };
    
    // If onboarding is complete, also update the onboardingCompleted flag
    if (onboardingStatus.hasCompletedOnboarding) {
      updateValues.onboardingCompleted = true;
    }
    
    // Update the user in the database
    const updated = await db.update(users)
      .set(updateValues)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to advance onboarding state'
      });
    }
    
    // If we have a session, update it with the onboarding status
    if (req.session && req.session.user) {
      req.session.user.onboardingStatus = onboardingStatus;
      req.session.user.onboardingCompleted = onboardingStatus.hasCompletedOnboarding;
    }
    
    res.json({
      success: true,
      message: 'Advanced to next onboarding step',
      state: onboardingStatus
    });
  } catch (error) {
    console.error('Error advancing onboarding state:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to advance onboarding state',
      error: error.message
    });
  }
});

/**
 * Complete the entire onboarding process in one step
 * Useful for testing or for users who need to skip onboarding
 */
router.post('/api/onboarding/complete', flexibleAuth, async (req: any, res) => {
  try {
    const userId = req.user?.id || req.session?.user?.id;
    console.log(`Completing onboarding for user ${userId}`);
    
    const now = new Date().toISOString();
    
    // Create a completed onboarding status
    const completedStatus: OnboardingStatus = {
      hasAcceptedBeta: true,
      hasCompletedOnboarding: true,
      currentStep: 'homepage',
      nextStep: 'homepage',
      
      betaWelcomeCompleted: true,
      legalAgreementsCompleted: true,
      profileSetupCompleted: true,
      vehicleAdditionCompleted: true,
      
      onboardingStartedAt: now,
      onboardingCompletedAt: now,
      
      beta: {
        role: req.body?.betaRole || 'user',
        entryDate: now
      }
    };
    
    // Update the database
    const updated = await db.update(users)
      .set({
        onboardingStatus: JSON.stringify(completedStatus),
        onboardingCompleted: true
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updated || updated.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to complete onboarding'
      });
    }
    
    // If we have a session, update it
    if (req.session && req.session.user) {
      req.session.user.onboardingStatus = completedStatus;
      req.session.user.onboardingCompleted = true;
    }
    
    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      state: completedStatus
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
});

export default router;