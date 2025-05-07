/**
 * PADDOCK20 Auth Provider
 * F1-grade authentication system for the modern driver
 */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useRoute } from 'wouter';
import { 
  AuthContextType, 
  User, 
  LoginCredentials, 
  RegisterData,
  ApiResponse,
  AuthRole
} from './types';
import { 
  saveUserToStorage, 
  clearAllAuthData, 
  getUserFromStorage,
  hasCompletedOnboarding,
  markOnboardingComplete
} from './storage';
import { 
  checkAuthStatus, 
  loginUser, 
  registerUser, 
  logoutUser,
  updateUserProfile 
} from './api';

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Router state
  const [location, navigate] = useLocation();
  const [onBetaAgreementPage] = useRoute('/beta-agreement');
  const [onOnboardingPage] = useRoute('/onboarding');
  const [onAuthPage] = useRoute('/auth');
  const [onJoinTheGridPage] = useRoute('/join-the-grid');

  // F1-themed log function
  const paddockLog = (message: string, data?: any) => {
    console.log(`🏎️ PADDOCK20 Auth: ${message}`, data || '');
  };

  // Clear any auth errors
  const clearError = () => setError(null);

  /**
   * Check if the user has completed onboarding and set it in user state
   */
  const refreshOnboardingStatus = (userId: string | number) => {
    if (user) {
      const onboardingCompleted = hasCompletedOnboarding(userId);
      if (onboardingCompleted !== user.onboardingCompleted) {
        setUser(prev => prev ? { ...prev, onboardingCompleted } : null);
      }
      return onboardingCompleted;
    }
    return false;
  };

  /**
   * Check authentication status
   */
  const checkAuth = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Try to get cached user first for faster UI rendering
      const cachedUser = getUserFromStorage();
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
        
        // Refresh onboarding status
        if (cachedUser.id) {
          refreshOnboardingStatus(cachedUser.id);
        }
        
        paddockLog('Cached driver credentials found, welcome back to the grid');
      }

      // Verify with server
      const response = await checkAuthStatus();
      
      if (response.success && response.data) {
        paddockLog('Driver authenticated with pit wall');
        
        // Ensure the user has a proper role assigned
        const userWithDefaults = {
          ...response.data,
          role: response.data.role || AuthRole.DRIVER,
          subscriptionTier: response.data.subscriptionTier || 'free'
        };
        
        // Update with latest user data from server
        setUser(userWithDefaults);
        setIsAuthenticated(true);
        saveUserToStorage(userWithDefaults);
        
        // Refresh onboarding status
        if (userWithDefaults.id) {
          refreshOnboardingStatus(userWithDefaults.id);
        }
      } else {
        // Clear local auth state if server reports not authenticated
        setUser(null);
        setIsAuthenticated(false);
        clearAllAuthData();
        paddockLog('Driver not authenticated with pit wall');
      }
    } catch (err: any) {
      console.error('Authentication check error:', err);
      setError(err.message || 'Failed to verify authentication status');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login the user
   */
  const login = async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    clearError();
    setLoading(true);

    try {
      const response = await loginUser(credentials);
      
      if (response.success && response.data) {
        // Ensure the user has a proper role assigned
        const userWithDefaults = {
          ...response.data,
          role: response.data.role || AuthRole.DRIVER,
          subscriptionTier: response.data.subscriptionTier || 'free'
        };
        
        setUser(userWithDefaults);
        setIsAuthenticated(true);
        saveUserToStorage(userWithDefaults);
        
        paddockLog('Driver successfully checked in at the paddock', userWithDefaults.username);
        paddockLog('Driver role', userWithDefaults.role);
        
        // Check and refresh onboarding status
        if (userWithDefaults.id) {
          refreshOnboardingStatus(userWithDefaults.id);
        }
        
        return {
          ...response,
          data: userWithDefaults
        };
      } else {
        setError(response.message || 'Login failed');
        return response;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during login';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (data: RegisterData): Promise<ApiResponse<User>> => {
    clearError();
    setLoading(true);

    try {
      // Set default role for new users to beta tester during beta period
      const enrichedData = { 
        ...data, 
        role: AuthRole.BETA_TESTER, 
        subscriptionTier: 'free',
        onboardingCompleted: false
      };
      
      const response = await registerUser(enrichedData);
      
      if (response.success && response.data) {
        // Ensure the returned user has proper role and defaults
        const userWithDefaults = {
          ...response.data,
          role: response.data.role || AuthRole.BETA_TESTER,
          subscriptionTier: response.data.subscriptionTier || 'free',
          onboardingCompleted: response.data.onboardingCompleted || false
        };
        
        setUser(userWithDefaults);
        setIsAuthenticated(true);
        saveUserToStorage(userWithDefaults);
        
        paddockLog('New driver joined the grid', userWithDefaults.username);
        paddockLog('Driver assigned role', userWithDefaults.role);
        
        return {
          ...response,
          data: userWithDefaults
        };
      } else {
        setError(response.message || 'Registration failed');
        return response;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the user
   */
  const logout = async (): Promise<ApiResponse<void>> => {
    clearError();
    setLoading(true);

    try {
      const response = await logoutUser();
      
      // Always clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
      clearAllAuthData();
      
      paddockLog('Driver signed out, pit lane closed');
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during logout';
      setError(errorMessage);
      
      // Still clear local state on error
      setUser(null);
      setIsAuthenticated(false);
      clearAllAuthData();
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user data
   */
  const updateUser = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    clearError();
    setLoading(true);

    try {
      const response = await updateUserProfile(userData);
      
      if (response.success && response.data) {
        // Update local user state with new data
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        
        paddockLog('Driver profile telemetry updated');
        
        return response;
      } else {
        setError(response.message || 'Profile update failed');
        return response;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred updating profile';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update onboarding status for a user
   */
  const completeOnboarding = async (): Promise<void> => {
    if (!user || !user.id) return;
    
    // Mark onboarding as complete in local storage
    markOnboardingComplete(user.id);
    
    // Update user state
    setUser(prev => prev ? { ...prev, onboardingCompleted: true } : null);
    
    // Update user profile on server
    await updateUser({ onboardingCompleted: true });
    
    paddockLog('Driver completed onboarding process');
  };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle auth flow redirection
  useEffect(() => {
    if (loading) return;

    // Skip redirection logic on auth-related pages
    if (onAuthPage || onJoinTheGridPage || onBetaAgreementPage || onOnboardingPage) {
      return;
    }

    // If authenticated but needs to go through onboarding flow
    if (isAuthenticated && user && !user.onboardingCompleted) {
      // Don't redirect if already on onboarding or beta agreement page
      if (!onBetaAgreementPage && !onOnboardingPage) {
        navigate('/beta-agreement');
      }
    }
  }, [isAuthenticated, user, loading, location]);

  // Provide auth context to children
  const authContextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus: checkAuth,
    clearError
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};