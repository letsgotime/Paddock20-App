import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials since environment variables aren't working properly in Vite
// These should normally come from environment variables but we're hardcoding them for now
const supabaseUrl = 'https://zpakosjpizkxiwsuzvrb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYWtvc2pwaXpreGl3c3V6dnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1Nzc0MjcsImV4cCI6MjA2MjE1MzQyN30.2Z-o9NRlZqvGLVwQMC1cRd_Ai0Qkb8KdENeKZeLUK7s';

// Debug: Log Supabase configuration status
console.log('Supabase configuration:', {
  usingHardcodedValues: true,
  urlFirstChars: supabaseUrl.substring(0, 15) + '...',
  keyFirstChars: supabaseAnonKey.substring(0, 15) + '...'
});

// We're using hardcoded credentials, so we're not in demo mode
const isDemoMode = false;

// Log demo mode status
if (isDemoMode) {
  console.log('Using mocked Supabase client for demo mode');
} else {
  console.log('Using real Supabase client with hardcoded credentials');
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
      supabaseUrl,
      supabaseAnonKey
    );

export default supabase;