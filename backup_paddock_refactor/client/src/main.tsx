import { createRoot } from "react-dom/client";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Router } from 'wouter';
import App from "./App";
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';

// Check if Supabase environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration status for debugging (without revealing keys)
console.log("Supabase config status:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

// Use Router as the outermost component to provide routing context to the entire app
// Also wrap the entire app with SupabaseAuthProvider to make auth context available globally
createRoot(document.getElementById("root")!).render(
  <Router>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </Router>
);
