import { createClient } from '@supabase/supabase-js';

// Check for environment variables and use demo fallbacks if not available
const isDemoMode = typeof import.meta.env === 'undefined' || 
                  !import.meta.env.VITE_SUPABASE_URL || 
                  !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use environment variables or fallback to demo values
const supabaseUrl = isDemoMode 
  ? 'https://example.supabase.co' 
  : import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = isDemoMode
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key-for-development' 
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

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
      onAuthStateChange: (callback) => {
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
  : createClient(supabaseUrl, supabaseAnonKey);

export default supabase;