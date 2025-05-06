import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';

// Check if Supabase environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration status for debugging (without revealing keys)
console.log("Supabase config status:", {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </BrowserRouter>
);
