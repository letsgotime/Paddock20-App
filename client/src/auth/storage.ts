/**
 * PADDOCK20 Authentication Storage Utilities
 * F1-grade persistence layer for driver session management
 */
import { User } from './types';

const USER_STORAGE_KEY = 'paddock20_driver';
const TOKEN_STORAGE_KEY = 'paddock20_access_token';

/**
 * Save user profile to local storage
 */
export function saveUserToStorage(user: User): void {
  if (!user) return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    // Log successful save with racing terminology
    console.log('Driver profile saved to pit storage');
  } catch (error) {
    console.error('Error saving driver profile to storage:', error);
  }
}

/**
 * Get user profile from local storage
 */
export function getUserFromStorage(): User | null {
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error retrieving driver profile from storage:', error);
    return null;
  }
}

/**
 * Clear user profile from local storage
 */
export function clearUserFromStorage(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log('Driver profile cleared from pit storage');
  } catch (error) {
    console.error('Error clearing driver profile from storage:', error);
  }
}

/**
 * Save authentication token
 */
export function saveAuthToken(token: string): void {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Clear all authentication data
 */
export function clearAllAuthData(): void {
  clearUserFromStorage();
  clearAuthToken();
  console.log('Driver session terminated, all credentials cleared');
}

/**
 * Check if the user has completed onboarding
 */
export function hasCompletedOnboarding(userId: string | number): boolean {
  try {
    const key = `paddock20_beta_onboarding_complete_${userId}`;
    return localStorage.getItem(key) === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as complete for a user
 */
export function markOnboardingComplete(userId: string | number): void {
  try {
    const key = `paddock20_beta_onboarding_complete_${userId}`;
    localStorage.setItem(key, 'true');
  } catch (error) {
    console.error('Error marking onboarding as complete:', error);
  }
}