import { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/services/supabaseClient';

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
  login: (username: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check authentication status on first render using Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // Get the current Supabase session
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Failed to get session: ${sessionError.message}`);
        }
        
        // If we have a valid Supabase session
        if (supabaseSession) {
          // First check if we have a valid user in Supabase
          const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !supabaseUser) {
            throw new Error(`Failed to get user: ${userError?.message || 'No user found'}`);
          }
          
          console.log('Supabase authentication successful', supabaseUser.email);
          
          // Try to get the extended user profile from our API
          try {
            const response = await fetch('/api/user-profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${supabaseSession.access_token}`
              }
            });
            
            // If we have the extended profile
            if (response.ok) {
              const profileData = await response.json();
              setUser(profileData);
              setSession({ user: profileData });
              console.log('Successfully authenticated user with extended profile:', profileData.username);
            } else {
              // Fallback to basic Supabase user data if profile not available
              console.log('Extended profile not found, using basic Supabase data');
              const basicUser: User = {
                id: parseInt(supabaseUser.id, 10),
                username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
                email: supabaseUser.email || '',
                firstName: supabaseUser.user_metadata?.firstName || null,
                lastName: supabaseUser.user_metadata?.lastName || null,
                fullName: supabaseUser.user_metadata?.fullName || null,
                profileImage: supabaseUser.user_metadata?.profileImage || null,
                role: supabaseUser.user_metadata?.role || 'user',
              };
              
              setUser(basicUser);
              setSession({ user: basicUser });
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Fallback to basic Supabase user data
            const basicUser: User = {
              id: parseInt(supabaseUser.id, 10),
              username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
              email: supabaseUser.email || '',
              firstName: supabaseUser.user_metadata?.firstName || null,
              lastName: supabaseUser.user_metadata?.lastName || null,
              fullName: supabaseUser.user_metadata?.fullName || null,
              profileImage: supabaseUser.user_metadata?.profileImage || null,
              role: supabaseUser.user_metadata?.role || 'user',
            };
            
            setUser(basicUser);
            setSession({ user: basicUser });
          }
        } else {
          // No Supabase session found
          console.log('No authenticated session found');
          setUser(null);
          setSession(null);
          
          // Don't create fallback users - authentication must be secure
          if (window.location.pathname !== '/auth' && 
              !window.location.pathname.includes('/email-verified') && 
              !window.location.pathname.includes('/reset-password')) {
            console.log('No authenticated session - should redirect to auth');
          }
        }
      } catch (err) {
        console.error('Error in auth system:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        setUser(null);
        setSession(null);
        
        // Redirect to auth page on critical error if not already there
        if (window.location.pathname !== '/auth' && 
            !window.location.pathname.includes('/email-verified') && 
            !window.location.pathname.includes('/reset-password')) {
          console.log('Auth error - redirecting to auth page');
          window.location.href = '/auth';
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial auth check
    checkAuthStatus();
    
    // Subscribe to auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Re-check auth status when signed in or token refreshed
          checkAuthStatus();
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Clear user data when signed out
          setUser(null);
          setSession(null);
          
          // Redirect to auth page if signed out and not already there
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function using Supabase
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Supabase login with email (using username@domain if email not provided)
      const email = username.includes('@') ? username : `${username}@paddock20.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        throw new Error(error.message || 'Login failed');
      }
      
      if (!data.user || !data.session) {
        throw new Error('No user data returned');
      }
      
      // Get the user profile from our database to merge with Supabase auth data
      const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session.access_token}`
        },
      });
      
      if (!response.ok) {
        // If profile doesn't exist, we'll use basic Supabase data
        console.warn('Could not fetch complete user profile, using basic data');
        
        // Map Supabase user to our User interface
        const basicUser: User = {
          id: parseInt(data.user.id, 10),
          username: data.user.user_metadata?.username || username,
          email: data.user.email || email,
          firstName: data.user.user_metadata?.firstName || null,
          lastName: data.user.user_metadata?.lastName || null,
          fullName: data.user.user_metadata?.fullName || null,
          profileImage: data.user.user_metadata?.profileImage || null,
          role: data.user.user_metadata?.role || 'user',
        };
        
        setUser(basicUser);
        setSession({ user: basicUser });
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${basicUser.username}!`,
          variant: 'default',
        });
        
        return basicUser;
      }

      // If we have a full profile
      const profileData = await response.json();
      
      setUser(profileData);
      setSession({ user: profileData });
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${profileData.username}!`,
        variant: 'default',
      });
      
      return profileData;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function using Supabase
  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            fullName: userData.firstName && userData.lastName 
              ? `${userData.firstName} ${userData.lastName}`
              : null,
            betaProgram: userData.betaProgram || 'user',
            hasAgreedToNDA: userData.hasAgreedToNDA || false,
            feedbackCommitment: userData.feedbackCommitment || false,
          }
        }
      });
      
      if (authError) {
        throw new Error(authError.message || 'Registration failed');
      }
      
      if (!authData.user) {
        throw new Error('No user data returned from registration');
      }
      
      // Now create the extended user profile in our API
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session?.access_token || ''}`,
        },
        body: JSON.stringify({
          ...userData,
          id: authData.user.id,
          // Additional fields required by our system
          role: 'user',
          isActive: true,
          isEmailVerified: false,
          onboardingCompleted: false
        }),
      });
      
      let profileData: User;
      
      if (!response.ok) {
        console.warn('Could not create extended profile, using basic auth data');
        // Map Supabase user to our User interface
        profileData = {
          id: parseInt(authData.user.id, 10),
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          fullName: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`
            : null,
          profileImage: null,
          role: 'user',
        };
      } else {
        profileData = await response.json();
      }
      
      setUser(profileData);
      setSession({ user: profileData });
      
      // Determine message based on beta program type
      const betaMessage = userData.betaProgram === 'tester' 
        ? 'Your beta tester application has been submitted! Please check your email for verification.'
        : 'Your account has been created successfully!';
      
      toast({
        title: 'Registration Successful',
        description: betaMessage,
        variant: 'default',
      });
      
      return profileData;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Logout function with Supabase integration
  const logout = async () => {
    try {
      setLoading(true);
      
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
      
      // Clear sensitive user data
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('savedVehicles');
      
      // Clear any other app state that might depend on the user
      sessionStorage.removeItem('weatherAppReturnPoint');
      sessionStorage.removeItem('lastLocation');
      sessionStorage.removeItem('lastSearch');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Supabase signOut returned an error, but continuing client-side logout:', error.message);
      }
      
      // Call our backend logout API to clear any server-side session state
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn('Server-side logout returned non-200 status, but continuing client-side logout');
        }
      } catch (apiError) {
        console.warn('Server-side logout API error, but continuing client-side logout:', apiError);
      }
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
      
      // Better handling of redirect with wouter
      if (window.location.pathname !== redirectPath) {
        // Explicitly redirect to auth page with replace to prevent back button issues
        window.history.replaceState(null, '', redirectPath);
        // Dispatch an event to make wouter notice the URL change
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      
      toast({
        title: 'Logout Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Still try to redirect to auth page even on error
      if (window.location.pathname !== '/auth') {
        window.history.replaceState(null, '', '/auth');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}