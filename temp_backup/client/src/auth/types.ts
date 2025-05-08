/**
 * PADDOCK20 Authentication System Types
 * F1-inspired authentication system for the modern driver
 */

/**
 * User roles within the PADDOCK20 ecosystem
 */
export enum AuthRole {
  DRIVER = 'driver',           // Basic user role
  TEAM_MANAGER = 'team_manager', // Premium user with team management capabilities
  RACE_ENGINEER = 'race_engineer', // Technical admin/support
  TEAM_PRINCIPAL = 'team_principal', // Full admin with all privileges
  BETA_TESTER = 'beta_tester'   // Beta program participant
}

/**
 * Permission capabilities for different parts of the application
 */
export enum AuthPermission {
  // Administrative permissions
  MANAGE_USERS = 'manage_users',
  VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
  MANAGE_CONTENT = 'manage_content',
  
  // User-related permissions
  MANAGE_OWN_PROFILE = 'manage_own_profile',
  ACCESS_BETA_FEATURES = 'access_beta_features',
  
  // Feature-specific permissions
  ACCESS_WEATHER_PADDOCK = 'access_weather_paddock',
  ACCESS_GARAGE_VAULT = 'access_garage_vault',
  ACCESS_DRIVE_JOURNAL = 'access_drive_journal',
  ACCESS_PODIUM_PURSUIT = 'access_podium_pursuit', // Premium feature
  
  // Subscription-related permissions
  ACCESS_PREMIUM_FEATURES = 'access_premium_features'
}

/**
 * Map of role to permissions for quick access control decisions
 */
export const ROLE_PERMISSIONS: Record<AuthRole, AuthPermission[]> = {
  [AuthRole.DRIVER]: [
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.ACCESS_WEATHER_PADDOCK,
    AuthPermission.ACCESS_GARAGE_VAULT,
    AuthPermission.ACCESS_DRIVE_JOURNAL
  ],
  [AuthRole.TEAM_MANAGER]: [
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.ACCESS_WEATHER_PADDOCK,
    AuthPermission.ACCESS_GARAGE_VAULT,
    AuthPermission.ACCESS_DRIVE_JOURNAL,
    AuthPermission.ACCESS_PODIUM_PURSUIT,
    AuthPermission.ACCESS_PREMIUM_FEATURES
  ],
  [AuthRole.RACE_ENGINEER]: [
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.VIEW_ADMIN_DASHBOARD,
    AuthPermission.MANAGE_CONTENT,
    AuthPermission.ACCESS_WEATHER_PADDOCK,
    AuthPermission.ACCESS_GARAGE_VAULT,
    AuthPermission.ACCESS_DRIVE_JOURNAL,
    AuthPermission.ACCESS_PODIUM_PURSUIT,
    AuthPermission.ACCESS_PREMIUM_FEATURES
  ],
  [AuthRole.TEAM_PRINCIPAL]: [
    AuthPermission.MANAGE_USERS,
    AuthPermission.VIEW_ADMIN_DASHBOARD,
    AuthPermission.MANAGE_CONTENT,
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.ACCESS_WEATHER_PADDOCK,
    AuthPermission.ACCESS_GARAGE_VAULT,
    AuthPermission.ACCESS_DRIVE_JOURNAL,
    AuthPermission.ACCESS_PODIUM_PURSUIT,
    AuthPermission.ACCESS_PREMIUM_FEATURES
  ],
  [AuthRole.BETA_TESTER]: [
    AuthPermission.MANAGE_OWN_PROFILE,
    AuthPermission.ACCESS_WEATHER_PADDOCK,
    AuthPermission.ACCESS_GARAGE_VAULT,
    AuthPermission.ACCESS_DRIVE_JOURNAL,
    AuthPermission.ACCESS_BETA_FEATURES
  ]
};

/**
 * Core user type representing an authenticated driver
 */
export interface User {
  id: string | number;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role: AuthRole;
  createdAt?: Date | string;
  profileImageUrl?: string | null;
  onboardingCompleted?: boolean;
  // Subscription and premium features data
  subscriptionTier?: 'free' | 'premium' | 'team';
  subscriptionExpiresAt?: Date | string | null;
  // Driver specific measurements
  helmetSize?: string | null;
  shoeSize?: string | null;
  // Vehicle connection status
  hasConnectedVehicle?: boolean;
  connectedVehicleType?: 'smartcar' | 'obd' | 'manual' | null;
  // Auth0 persistence data
  auth0Identifier?: string;
  auth0Metadata?: any;
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