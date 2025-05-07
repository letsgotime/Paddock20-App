import { createClient } from '@supabase/supabase-js';

// Supabase credentials - hardcoded for now until environment variables are fixed
// NOTE: Typically we would use environment variables, but for troubleshooting we're temporarily hardcoding
const SUPABASE_URL = 'https://zpakosjpizkxiwsuzvrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYWtvc2pwaXpreGl3c3V6dnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1Nzc0MjcsImV4cCI6MjA2MjE1MzQyN30.2Z-o9NRlZqvGLVwQMC1cRd_Ai0Qkb8KdENeKZeLUK7s';

// Safely check environment variables
const env = import.meta.env || {};

// Debug: Log environment variable status without exposing full values
console.log('Supabase configuration:', {
  usingHardcodedValues: true,
  urlFirstChars: SUPABASE_URL.substring(0, 15) + '...',
  keyFirstChars: SUPABASE_ANON_KEY.substring(0, 15) + '...'
});

// We're no longer in demo mode since we're using hardcoded credentials
const isDemoMode = false;

// Log demo mode status
if (isDemoMode) {
  console.log('Using mocked Supabase client for demo mode');
}

// Custom mock client for development/demo
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: (callback: (event: string, session: any) => void) => {
        // Simulate a signed-in user for demo purposes
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'demo-user-1',
              email: 'demo@example.com',
              user_metadata: {
                full_name: 'Demo User',
                avatar_url: null
              }
            }
          });
        }, 1000);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: async () => ({ data: { user: { id: 'demo-user-1' } }, error: null }),
      signUp: async () => ({ data: { user: { id: 'demo-user-1' } }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null })
    },
    from: () => ({ select: () => ({ data: [], error: null }) })
  };
};

// Create a supabase client - either real or mocked
const supabase = isDemoMode 
  ? createMockClient() as any
  : createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

export default supabase;