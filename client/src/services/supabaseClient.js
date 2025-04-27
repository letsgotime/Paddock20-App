import { createClient } from '@supabase/supabase-js';

// ✅ Your real Supabase credentials
const supabaseUrl = 'https://rtrtrwbfmrjizmhnvfhnr.supabase.co'; // Your Supabase Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dHJ3YmZtcmppem1obnZmaG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTc5NjksImV4cCI6MjA2MTI5Mzk2OX0.V_Mu2H5TBqg8wBQ_A0TKCUTvEJsLJZnDKyH4_d5EzOk'; // Your Anon Public Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;