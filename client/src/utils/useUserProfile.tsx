import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

/**
 * UserProfile interface based on Auth0 profile data
 */
export interface UserProfile {
  id: string;          // Auth0 user.sub
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
  preferredVehicleId?: string | null;
  metaData?: Record<string, any>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to extract standardized user profile data from Auth0 user
 * @returns Standardized UserProfile object
 */
export function useUserProfile(): UserProfile {
  const { user, isLoading, error } = useAuth0();
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    email: null,
    name: null,
    firstName: null,
    lastName: null,
    picture: null,
    preferredVehicleId: null,
    metaData: {},
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!isLoading && user) {
      // Extract first and last name from name if available
      let firstName = null;
      let lastName = null;
      
      if (user.name) {
        const nameParts = user.name.split(' ');
        firstName = nameParts[0] || null;
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;
      }
      
      // Extract metadata
      const metadata = {
        ...(user.user_metadata || {}),
        ...(user['https://paddock20.app/user_metadata'] || {})
      };
      
      // Update profile
      setProfile({
        id: user.sub || "",
        email: user.email || null,
        name: user.name || null,
        firstName: user.given_name || firstName,
        lastName: user.family_name || lastName,
        picture: user.picture || null,
        preferredVehicleId: metadata.preferredVehicleId || null,
        metaData: metadata,
        isLoading: false,
        error: null
      });
    } else if (!isLoading && error) {
      setProfile(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }));
    }
  }, [user, isLoading, error]);

  return profile;
}

/**
 * HOC to wrap components that require authentication
 * @param Component Component to wrap
 * @returns Wrapped component with auth check
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithAuthGuard(props: P) {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
      // Show loading state
      return (
        <div className="flex items-center justify-center h-24">
          <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Show authentication required message
      return (
        <div className="p-6 bg-black/30 rounded-lg border border-gray-800">
          <h3 className="text-xl text-blue-400 font-orbitron mb-2">AUTHENTICATION REQUIRED</h3>
          <p className="text-gray-300 mb-4">You need to log in to access this content.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Log In
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Helper function to format Auth0 user display name
 * @param user Auth0 user or UserProfile
 * @returns Best available display name
 */
export function formatDisplayName(user: UserProfile | any): string {
  if (!user) return 'User';
  
  // Try different options in order of preference
  return user.name || 
         (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 
         user.firstName || 
         user.email?.split('@')[0] || 
         'User');
}