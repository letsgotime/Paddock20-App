import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

// Define a simplified session type for our application
interface SimpleSession {
  user: {
    id: string;
    email?: string;
  };
}

export function useAuth() {
  const [session, setSession] = useState<SimpleSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth with a mock default session for development
    if (supabase._isMockClient) {
      // For mock client, just use the hardcoded session
      setSession({ user: { id: '1', email: 'user@example.com' } });
      setLoading(false);
      
      // No need to set up listeners or cleanup for mock
      return;
    }
    
    // This code runs for a real Supabase client
    // Get the current session
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    // Try to set up auth listener if it exists
    try {
      let authListener: any = { subscription: { unsubscribe: () => {} } };
      
      if (supabase.auth.onAuthStateChange) {
        const listener = supabase.auth.onAuthStateChange(
          (_event: string, session: any) => {
            setSession(session);
          }
        );
        
        if (listener && listener.data) {
          authListener = listener.data;
        }
      }

      return () => {
        if (authListener && authListener.subscription && authListener.subscription.unsubscribe) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      return () => {};
    }
  }, []);

  return { session, loading };
}