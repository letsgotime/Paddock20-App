import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import supabase from '../services/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// User profile interface to match our needs
interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  profileImage: string | null;
  role: 'user' | 'admin' | 'premium' | null;
  betaProgram?: 'user' | 'tester';
  hasAgreedToNDA?: boolean;
  feedbackCommitment?: boolean;
  // Add other properties as needed
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any | null, profile: UserProfile | null }>;
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

export const SupabaseAuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use AuthContext
export function useAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize Supabase auth state
  useEffect(() => {
    // Set loading to true when initializing
    setLoading(true);
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth event:', event);
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user);
          
          if (event === 'SIGNED_IN') {
            // If there's a login notification to show
            if (!localStorage.getItem('loginShown')) {
              toast({
                title: 'Login Successful',
                description: `Welcome back!`,
                variant: 'default',
              });
              localStorage.setItem('loginShown', 'true');
            }
          }
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
          localStorage.removeItem('userProfile');
          localStorage.removeItem('loginShown');
        }
        
        setLoading(false);
      }
    );

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Fetch user profile from API or create one if it doesn't exist
  const fetchUserProfile = async (user: User) => {
    if (!user) return;
    
    try {
      // Try to get existing profile from API
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // Map to our profile structure
        const userProfile: UserProfile = {
          id: existingProfile.id,
          username: existingProfile.username || user.email?.split('@')[0] || 'user',
          email: user.email || '',
          firstName: existingProfile.first_name || null,
          lastName: existingProfile.last_name || null,
          fullName: existingProfile.full_name || `${existingProfile.first_name || ''} ${existingProfile.last_name || ''}`.trim() || null,
          profileImage: existingProfile.avatar_url || null,
          role: existingProfile.role || 'user',
        };
        
        setProfile(userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('Successfully retrieved user profile:', userProfile.username);
      } else {
        // No profile found, create a basic one
        const newProfile = {
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user',
          email: user.email,
          role: 'user',
          updated_at: new Date().toISOString(),
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        if (createdProfile) {
          // Map to our profile structure
          const userProfile: UserProfile = {
            id: createdProfile.id,
            username: createdProfile.username || user.email?.split('@')[0] || 'user',
            email: user.email || '',
            firstName: createdProfile.first_name || null,
            lastName: createdProfile.last_name || null,
            fullName: createdProfile.full_name || null,
            profileImage: createdProfile.avatar_url || null,
            role: createdProfile.role || 'user',
          };
          
          setProfile(userProfile);
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
          console.log('Successfully created user profile:', userProfile.username);
        }
      }
    } catch (err) {
      console.error('Error fetching/creating user profile:', err);
      
      // Create a minimal profile based on Supabase data
      const userProfile: UserProfile = {
        id: parseInt(user.id, 10),
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        firstName: null,
        lastName: null,
        fullName: null,
        profileImage: null,
        role: 'user',
      };
      
      setProfile(userProfile);
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { error: err };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData?.username || email.split('@')[0],
            first_name: userData?.firstName || null,
            last_name: userData?.lastName || null,
            beta_program: 'user', // Default to 'user' role
          },
        },
      });
      
      if (error) {
        return { error };
      }
      
      // Profile creation will happen via the onAuthStateChange hook
      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: err };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear user data first to prevent any auth-dependent components from breaking
      setUser(null);
      setProfile(null);
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
      
      // Log out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Logout error:', err);
      toast({
        title: 'Logout Error',
        description: 'There was a problem logging out.',
        variant: 'destructive',
      });
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (!error) {
        toast({
          title: 'Password Reset Email Sent',
          description: 'Check your email for the password reset link.',
          variant: 'default',
        });
      }
      
      return { error };
    } catch (err) {
      console.error('Reset password error:', err);
      return { error: err };
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('Not authenticated'), profile: null };
    }
    
    try {
      // Format the profile data for Supabase
      const profileData = {
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || undefined,
        avatar_url: data.profileImage,
        role: data.role,
        updated_at: new Date().toISOString(),
      };
      
      // Update profile in Supabase
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (updatedProfile) {
        // Map to our profile structure
        const userProfile: UserProfile = {
          id: updatedProfile.id,
          username: updatedProfile.username || user.email?.split('@')[0] || 'user',
          email: user.email || '',
          firstName: updatedProfile.first_name || null,
          lastName: updatedProfile.last_name || null,
          fullName: updatedProfile.full_name || `${updatedProfile.first_name || ''} ${updatedProfile.last_name || ''}`.trim() || null,
          profileImage: updatedProfile.avatar_url || null,
          role: updatedProfile.role || 'user',
        };
        
        setProfile(userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
          variant: 'default',
        });
        
        return { error: null, profile: userProfile };
      }
      
      return { error: new Error('Failed to update profile'), profile: null };
    } catch (err) {
      console.error('Update profile error:', err);
      toast({
        title: 'Profile Update Error',
        description: 'There was a problem updating your profile.',
        variant: 'destructive',
      });
      return { error: err, profile: null };
    }
  };

  return (
    <SupabaseAuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      error, 
      isAuthenticated: !!user,
      login, 
      signUp, 
      logout,
      resetPassword,
      updateProfile
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}