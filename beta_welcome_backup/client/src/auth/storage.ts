/**
 * PADDOCK20 Authentication Storage Utilities
 * F1-grade persistence layer for driver session management
 */
import { User } from './types';

const USER_STORAGE_KEY = 'paddock20_driver';
const TOKEN_STORAGE_KEY = 'paddock20_access_token';
const REMEMBER_ME_KEY = 'paddock20_remember_me';
const AUTH_EXPIRY_KEY = 'paddock20_auth_expiry';
const SESSION_PERSISTENCE_KEY = 'paddock20_session_persistence';
const REFRESH_TOKEN_KEY = 'paddock20_refresh_token';

// Default session expiry in milliseconds (30 days)
const DEFAULT_SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

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
 * Set "Remember Me" preference
 */
export function setRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, String(remember));
  } catch (error) {
    console.error('Error saving remember me preference:', error);
  }
}

/**
 * Get "Remember Me" preference
 */
export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch (error) {
    console.error('Error getting remember me preference:', error);
    return false;
  }
}

/**
 * Save authentication token with expiry
 */
export function saveAuthToken(token: string, expiryInMs: number = DEFAULT_SESSION_EXPIRY): void {
  if (!token) return;
  try {
    // Store the token
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    
    // Set the expiry time
    const expiry = Date.now() + expiryInMs;
    localStorage.setItem(AUTH_EXPIRY_KEY, String(expiry));
    
    console.log('Paddock security credential saved with expiry');
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

/**
 * Get authentication token (with expiry check)
 */
export function getAuthToken(): string | null {
  try {
    // Check if token is expired
    const expiryStr = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        // Token expired, clear it
        clearAuthToken();
        return null;
      }
    }
    
    // Return the token if not expired
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
}

/**
 * Save refresh token
 */
export function saveRefreshToken(token: string): void {
  if (!token) return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving refresh token:', error);
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
}

/**
 * Set session persistence
 */
export function setSessionPersistence(persistent: boolean): void {
  try {
    localStorage.setItem(SESSION_PERSISTENCE_KEY, String(persistent));
    console.log(`Session persistence set to: ${persistent ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting session persistence:', error);
  }
}

/**
 * Check if session is persistent
 */
export function isSessionPersistent(): boolean {
  try {
    return localStorage.getItem(SESSION_PERSISTENCE_KEY) === 'true';
  } catch (error) {
    console.error('Error checking session persistence:', error);
    return false;
  }
}

/**
 * Check if we need to auto-login the user
 */
export function shouldAutoLogin(): boolean {
  // Auto-login if session is persistent and we have valid credentials
  return isSessionPersistent() && !!getAuthToken() && !!getUserFromStorage();
}

/**
 * Save username check status to prevent duplicate usernames
 */
export function saveUsernameCheckStatus(username: string, isAvailable: boolean): void {
  try {
    const key = `paddock20_username_check_${username.toLowerCase()}`;
    localStorage.setItem(key, String(isAvailable));
  } catch (error) {
    console.error('Error saving username check status:', error);
  }
}

/**
 * Check if a username is available (based on cached results)
 * Returns null if no cached result is available
 */
export function isUsernameAvailable(username: string): boolean | null {
  try {
    const key = `paddock20_username_check_${username.toLowerCase()}`;
    const value = localStorage.getItem(key);
    if (value === null) return null;
    return value === 'true';
  } catch (error) {
    console.error('Error checking username availability:', error);
    return null;
  }
}

/**
 * Clear all authentication data
 */
export function clearAllAuthData(): void {
  clearUserFromStorage();
  clearAuthToken();
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(SESSION_PERSISTENCE_KEY);
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