/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 07, 2025
 * 
 * Authentication Flow Utilities
 * 
 * This module handles user flow tracking and navigation between authentication steps:
 * - Registration > Beta Agreement > Onboarding > The Paddock (first-time)
 * - Login > The Paddock (returning user)
 * - Logout > Enhanced Logout Page > Auth page (consistent flow)
 * 
 * Key features:
 * - Store and retrieve user profile in localStorage during registration flow
 * - Track beta agreement and onboarding completion status
 * - Determine appropriate next path based on user progress
 */

// Constants for localStorage keys
const USER_PROFILE_STORAGE_KEY = 'paddock20_user_profile';
const BETA_AGREEMENT_KEY_PREFIX = 'paddock20_beta_agreement_';
const ONBOARDING_COMPLETE_KEY_PREFIX = 'paddock20_onboarding_complete_';

// User profile type
export type UserProfile = {
  id: string | number;
  email?: string;
  username?: string;
  [key: string]: any;
};

/**
 * Save user profile to localStorage for use across authentication flow components
 */
export function saveUserProfileToLocalStorage(userData: UserProfile): void {
  if (!userData || !userData.id) {
    console.error('Invalid user data provided to saveUserProfileToLocalStorage');
    return;
  }
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userData));
}

/**
 * Get user profile from localStorage
 */
export function getUserProfileFromLocalStorage(): UserProfile | null {
  const storedData = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
  if (!storedData) return null;
  
  try {
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error parsing user profile from localStorage:', error);
    return null;
  }
}

/**
 * Clear user profile from localStorage (during logout)
 */
export function clearUserProfileFromLocalStorage(): void {
  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
}

/**
 * Mark beta agreement as completed for a user
 */
export function markBetaAgreementComplete(userId: string): void {
  localStorage.setItem(`${BETA_AGREEMENT_KEY_PREFIX}${userId}`, 'true');
}

/**
 * Check if user has completed beta agreement
 */
export function hasBetaAgreement(userId: string): boolean {
  return localStorage.getItem(`${BETA_AGREEMENT_KEY_PREFIX}${userId}`) === 'true';
}

/**
 * Mark onboarding as completed for a user
 */
export function markOnboardingComplete(userId: string): void {
  localStorage.setItem(`${ONBOARDING_COMPLETE_KEY_PREFIX}${userId}`, 'true');
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(userId: string): boolean {
  return localStorage.getItem(`${ONBOARDING_COMPLETE_KEY_PREFIX}${userId}`) === 'true';
}

/**
 * Clear all flow markers for a user (on logout)
 */
export function clearUserFlowData(userId: string): void {
  // Don't clear beta agreement or onboarding status as those stay between sessions
  clearUserProfileFromLocalStorage();
}

/**
 * Get the appropriate next path for authenticated users based on their progress
 * Registration flow: Registration > Beta Agreement > Onboarding > The Paddock
 * Login flow: Login > The Paddock (if beta & onboarding done)
 */
export function getNextAuthFlowPath(userId: string): string {
  // Check if user has completed the beta agreement
  if (!hasBetaAgreement(userId)) {
    return '/beta-agreement';
  }
  
  // Check if user has completed onboarding
  if (!hasCompletedOnboarding(userId)) {
    return '/onboarding';
  }
  
  // If all steps are completed, return to The Paddock
  return '/the-paddock';
}

/**
 * Helper function to determine if a path is an auth-related path
 */
export function isAuthPath(path: string): boolean {
  const authPaths = ['/auth', '/beta-agreement', '/onboarding', '/logout', '/enhanced-logout'];
  return authPaths.includes(path);
}