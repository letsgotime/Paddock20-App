/**
 * PADDOCK20 Authentication System
 * Export all auth-related components, hooks, and utilities
 */

// Core auth provider
export { AuthProvider, AuthContext } from './AuthProvider';

// Hooks
export { useAuth, useIsAdmin, useHasCompletedOnboarding } from './useAuth';

// Types
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  AuthContextType
} from './types';

// Storage utilities
export {
  saveUserToStorage,
  getUserFromStorage,
  clearUserFromStorage,
  clearAllAuthData,
  hasCompletedOnboarding,
  markOnboardingComplete
} from './storage';

// API methods
export {
  checkAuthStatus,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile
} from './api';