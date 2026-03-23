import { createRoot } from "react-dom/client";
import { Router } from "wouter"; // Import wouter's Router
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Auth0Provider } from '@auth0/auth0-react';

// Auto-redirect to demo mode on Replit.app domains
if (window.location.hostname.includes('replit.app') && 
    !window.location.pathname.includes('/demo-mode') && 
    !window.location.pathname.includes('/auth/callback')) {
  
  console.log('Detected Replit.app domain - redirecting to demo mode');
  
  // Set all required demo mode flags
  localStorage.setItem('PADDOCK20_DEMO_MODE', 'true');
  localStorage.setItem('paddock20_demo_auth_bypass', 'true');
  localStorage.setItem('paddock20_beta_status', 'enrolled');
  localStorage.setItem('paddock20_beta_onboarding_complete_guest', 'true');
  
  // Create demo user profile
  const demoUser = {
    id: 9999,
    username: 'demoadmin',
    email: 'demo@paddock20.example',
    firstName: 'Demo',
    lastName: 'User',
    fullName: 'Demo User',
    profileImage: 'https://ui-avatars.com/api/?name=Demo+User&background=1982FC&color=fff',
    role: 'admin',
  };
  
  localStorage.setItem('userProfile', JSON.stringify(demoUser));
  
  // Redirect to demo mode entry point
  window.location.href = '/demo-mode';
}

// Get Auth0 configuration from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN as string || "dev-6cy64kyz8f0nju5n.us.auth0.com";
// Force the use of the new client ID
const clientId = "4Zl1dcwCPeKiQVePWytPZqzqWk1BPQYH";

// Dynamically set the redirect URI based on current window location
// The app needs to be configured in Auth0 for BOTH the development AND deployed URLs
// Add all possible deployment domains to the Auth0 Dashboard's Allowed Callback URLs
// Format: https://yourdomain.com/auth/callback
const redirectUri = `${window.location.origin}/auth/callback`;

// Auth0 must be configured with ALL these domains in the Dashboard:
// 1. https://your-replit-dev-url.replit.dev/auth/callback
// 2. https://your-deployment-url.replit.app/auth/callback
// 3. Any custom domain you might use
console.log("Auth0 Redirect URI:", redirectUri);
console.log("Auth0 Config:", { domain, clientId });

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: redirectUri,
      scope: "openid profile email",
    }}
  >
    <Router>
      <App />
    </Router>
  </Auth0Provider>
);
