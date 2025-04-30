import { createClient } from '@supabase/supabase-js';

console.log("Using mocked Supabase client for demo mode");

const isMock = import.meta.env.VITE_USE_MOCK_SUPABASE === 'true';

const realSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Mock Supabase client
const mockSupabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: 'demo-user' } }, error: null }),
  },
};

const supabase = isMock ? mockSupabase : realSupabase;

export default supabase;