/**
 * PADDOCK20 Authentication API
 * F1-precision communication with authentication endpoints
 */
import { apiRequest } from '@/lib/queryClient';
import { 
  ApiResponse, 
  User, 
  LoginCredentials, 
  RegisterData 
} from './types';
import { getAuthToken } from './storage';

/**
 * Check authentication status
 */
export async function checkAuthStatus(): Promise<ApiResponse<User>> {
  try {
    const response = await apiRequest('GET', '/api/auth/me');
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Authentication check failed',
      };
    }
  } catch (error: any) {
    console.error('Auth status check error:', error);
    return {
      success: false,
      message: error.message || 'Network error during authentication check',
    };
  }
}

/**
 * Login with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse<User>> {
  try {
    const response = await apiRequest('POST', '/api/auth/login', credentials);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Login failed',
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Network error during login',
    };
  }
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<ApiResponse<User>> {
  try {
    const response = await apiRequest('POST', '/api/auth/register', data);
    
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Registration failed',
      };
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.message || 'Network error during registration',
    };
  }
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<ApiResponse<void>> {
  try {
    const response = await apiRequest('POST', '/api/auth/logout');
    
    if (response.ok) {
      return {
        success: true,
        message: 'Logout successful',
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Logout failed',
      };
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error.message || 'Network error during logout',
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await apiRequest('PATCH', '/api/auth/user', userData);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Profile update failed',
      };
    }
  } catch (error: any) {
    console.error('Profile update error:', error);
    return {
      success: false,
      message: error.message || 'Network error during profile update',
    };
  }
}