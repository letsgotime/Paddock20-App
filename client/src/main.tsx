import { createRoot } from "react-dom/client";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Router } from 'wouter';
import App from "./App";
// Removing SupabaseAuthProvider reference - it causes conflicts with our auth providers in App.tsx

// Check if Supabase environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration status for debugging (without revealing keys)
console.log("Supabase config status:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

// Use Router as the outermost component to provide routing context to the entire app
// We've moved all auth providers inside App.tsx for better organization
createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
