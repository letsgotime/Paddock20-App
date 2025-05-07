/**
 * PADDOCK20 Authentication System Types
 * F1-inspired authentication system for the modern driver
 */

/**
 * Core user type representing an authenticated driver
 */
export interface User {
  id: string | number;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: 'user' | 'admin' | 'beta-tester';
  createdAt?: Date | string;
  profileImageUrl?: string | null;
  onboardingCompleted?: boolean;
  // Additional user profile data can be extended here
  [key: string]: any;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

/**
 * API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Auth context value type
 */
export interface AuthContextType extends AuthState {
  // Core authentication methods
  login: (credentials: LoginCredentials) => Promise<ApiResponse<User>>;
  register: (data: RegisterData) => Promise<ApiResponse<User>>;
  logout: () => Promise<ApiResponse<void>>;

  // Utility methods
  updateUser: (userData: Partial<User>) => Promise<ApiResponse<User>>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}