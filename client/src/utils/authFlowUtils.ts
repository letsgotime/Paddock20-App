/**
 * Auth Flow Utilities
 * 
 * This file provides utility functions to ensure proper navigation and state 
 * management throughout the authentication flow in PADDOCK20.
 */

// Use the User type from useNativeAuth
import { User } from '../hooks/useNativeAuth';

/**
 * Save user profile to localStorage for component persistence
 * Used during login, registration, and profile updates
 */
export const saveUserProfileToLocalStorage = (userData: any): void => {
  try {
    localStorage.setItem('userProfile', JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: userData.createdAt
    }));
  } catch (err) {
    console.error('Failed to save user profile to localStorage:', err);
  }
};

/**
 * Get user profile from localStorage
 * Used by components that need user data but don't have direct access to auth context
 */
export const getUserProfileFromLocalStorage = (): any | null => {
  try {
    const userProfileStr = localStorage.getItem('userProfile');
    if (userProfileStr) {
      return JSON.parse(userProfileStr);
    }
  } catch (err) {
    console.error('Failed to parse user profile from localStorage:', err);
  }
  return null;
};

/**
 * Clear user profile from localStorage
 * Used during logout to ensure consistent state
 */
export const clearUserProfileFromLocalStorage = (): void => {
  try {
    localStorage.removeItem('userProfile');
  } catch (err) {
    console.error('Failed to clear user profile from localStorage:', err);
  }
};

/**
 * Helper to determine if user has completed beta agreement
 */
export const hasBetaAgreement = (userId: string): boolean => {
  try {
    return localStorage.getItem(`betaAgreement_accepted_${userId}`) === 'true';
  } catch (err) {
    console.error('Failed to check beta agreement status:', err);
    return false;
  }
};

/**
 * Helper to determine if user has completed onboarding
 */
export const hasCompletedOnboarding = (userId: string): boolean => {
  try {
    return localStorage.getItem(`paddock20_beta_onboarding_complete_${userId}`) === 'true';
  } catch (err) {
    console.error('Failed to check onboarding status:', err);
    return false;
  }
};

/**
 * Get next path in authentication flow based on user's current progress
 */
export const getNextAuthFlowPath = (userId?: string): string => {
  if (!userId) {
    // If no user ID, return to auth page
    return '/auth';
  }
  
  // Check if they've accepted beta agreement
  if (!hasBetaAgreement(userId)) {
    return '/beta-agreement';
  }
  
  // Check if they've completed onboarding
  if (!hasCompletedOnboarding(userId)) {
    return '/'; // Onboarding happens on homepage based on App.tsx logic
  }
  
  // All steps completed, user is fully onboarded
  return '/';
};

/**
 * Marks a user as having completed all onboarding steps
 * Useful for admin or testing purposes
 */
export const completeAllOnboardingSteps = (userId: string): void => {
  try {
    localStorage.setItem(`betaAgreement_accepted_${userId}`, 'true');
    localStorage.setItem(`paddock20_beta_onboarding_complete_${userId}`, 'true');
  } catch (err) {
    console.error('Failed to mark onboarding complete:', err);
  }
};

/**
 * Reset all onboarding progress
 * Useful for testing or when a user wants to go through onboarding again
 */
export const resetOnboardingProgress = (userId: string): void => {
  try {
    localStorage.removeItem(`betaAgreement_accepted_${userId}`);
    localStorage.removeItem(`paddock20_beta_onboarding_complete_${userId}`);
  } catch (err) {
    console.error('Failed to reset onboarding progress:', err);
  }
};