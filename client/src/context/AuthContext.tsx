import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

// User interface matches our database model
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: 'user' | 'admin' | 'premium' | null;
  // Add other properties as needed
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  register: () => void; 
  logout: () => void;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  betaProgram?: 'user' | 'tester'; // Beta program type
  hasAgreedToNDA?: boolean;       // NDA agreement flag
  feedbackCommitment?: boolean;    // For beta testers only
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use AuthContext
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth0 wrapper provider to be used in main.tsx or App.tsx
export function Auth0ProviderWithRedirectCallback({ children }: { children: ReactNode }) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;
  
  // Make sure we're using the correct redirect URI
  const redirectUri = window.location.origin;
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
      }}
    >
      {children}
    </Auth0Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use Auth0 hooks
  const { 
    isAuthenticated, 
    isLoading: auth0Loading,
    user: auth0User,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout
  } = useAuth0();

  // Synchronize Auth0 state with our context
  useEffect(() => {
    const syncAuth0User = async () => {
      if (auth0Loading) {
        return;
      }
      
      setLoading(true);

      try {
        if (isAuthenticated && auth0User) {
          console.log('Auth0 authentication successful', auth0User.email);
          
          try {
            // Try to get or create user profile in our database
            const token = await getAccessTokenSilently();
            
            const response = await fetch('/api/user-profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            // If we have an existing profile
            if (response.ok) {
              const profileData = await response.json();
              setUser(profileData);
              setSession({ user: profileData });
              console.log('Successfully retrieved user profile:', profileData.username);
              
              // Persist the user for vehicle context and other app features
              localStorage.setItem('userProfile', JSON.stringify(profileData));
            } else {
              // If no profile, create a basic user from Auth0 data
              console.log('No user profile found, creating from Auth0 data');
              
              // Use Auth0 user data to create a profile in our format
              const basicUser: User = {
                id: parseInt(auth0User.sub?.split('|')[1] || '0', 10),
                username: auth0User.nickname || auth0User.email?.split('@')[0] || 'user',
                email: auth0User.email || '',
                firstName: auth0User.given_name || null,
                lastName: auth0User.family_name || null,
                fullName: auth0User.name || null,
                profileImage: auth0User.picture || null,
                role: 'user',
              };
              
              // Create the profile in our API
              const createResponse = await fetch('/api/user-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  ...basicUser,
                  // Additional fields needed for our system
                  isActive: true,
                  isEmailVerified: auth0User.email_verified || false,
                  betaProgram: 'user'
                }),
              });
              
              // Use the created profile or fall back to basic user
              if (createResponse.ok) {
                const createdProfile = await createResponse.json();
                setUser(createdProfile);
                setSession({ user: createdProfile });
                console.log('Successfully created user profile:', createdProfile.username);
                
                // Persist the user
                localStorage.setItem('userProfile', JSON.stringify(createdProfile));
              } else {
                setUser(basicUser);
                setSession({ user: basicUser });
                
                // Persist the user
                localStorage.setItem('userProfile', JSON.stringify(basicUser));
              }
            }
            
            // If there's a login notification to show
            if (!localStorage.getItem('loginShown')) {
              toast({
                title: 'Login Successful',
                description: `Welcome back, ${auth0User.nickname || auth0User.name || auth0User.email?.split('@')[0] || 'user'}!`,
                variant: 'default',
              });
              localStorage.setItem('loginShown', 'true');
            }
          } catch (profileError) {
            console.error('Error synchronizing with user profile:', profileError);
            toast({
              title: 'Profile Error',
              description: 'There was a problem loading your profile. Some features may be limited.',
              variant: 'destructive',
            });
          }
        } else if (!isAuthenticated && !auth0Loading) {
          console.log('No authenticated session found');
          setUser(null);
          setSession(null);
          localStorage.removeItem('userProfile');
          localStorage.removeItem('loginShown');
          
          // Redirect to auth page if not already there
          if (window.location.pathname !== '/auth' && 
              !window.location.pathname.includes('/email-verified') && 
              !window.location.pathname.includes('/reset-password')) {
            console.log('No authenticated session - redirecting to auth');
            // Don't auto-redirect as it can cause loops
            // window.location.href = '/auth';
          }
        }
      } catch (err) {
        console.error('Error in auth system:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        setUser(null);
        setSession(null);
        localStorage.removeItem('userProfile');
      } finally {
        setLoading(false);
      }
    };

    // Run the sync whenever Auth0 state changes
    syncAuth0User();
  }, [isAuthenticated, auth0Loading, auth0User, getAccessTokenSilently, toast]);

  // Login function using Auth0
  const login = () => {
    loginWithRedirect();
  };

  // Register function redirects to Auth0 signup
  const register = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  };

  // Enhanced Logout function with Auth0
  const logout = () => {
    // Store the redirect path before clearing everything
    const redirectPath = '/auth';
    
    // Clear user data first to prevent any auth-dependent components from breaking
    setUser(null);
    setSession(null);
    
    // Force a hard reset of local storage for auth-related items
    localStorage.removeItem('auth-session');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('returnToPath');
    localStorage.removeItem('currentVehicle');
    localStorage.removeItem('loginShown');
    
    // Clear sensitive user data
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('savedVehicles');
    
    // Clear any other app state
    sessionStorage.removeItem('weatherAppReturnPoint');
    sessionStorage.removeItem('lastLocation');
    sessionStorage.removeItem('lastSearch');
    
    // Log out from Auth0
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin + redirectPath
      }
    });
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      variant: 'default',
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}