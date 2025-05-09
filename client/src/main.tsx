import { createRoot } from "react-dom/client";
import { Router } from 'wouter';
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Auth0Provider } from '@auth0/auth0-react';

// Get Auth0 configuration from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN as string || "dev-6cy64kyz8f0nju5n.us.auth0.com";
// Force the use of the new client ID
const clientId = "4Zl1dcwCPeKiQVePWytPZqzqWk1BPQYH";

// Dynamically set the redirect URI based on current window location
// IMPORTANT: Going back to standard redirect pattern - most reliable approach
const redirectUri = `${window.location.origin}/auth/callback`;

// CRITICAL: Make sure this EXACT redirect URI is added to the Allowed Callback URLs
// in the Auth0 Dashboard for your Web Application (NOT the Management API)
console.log("Auth0 Redirect URI:", redirectUri);
console.log("Auth0 Config:", { domain, clientId });

createRoot(document.getElementById("root")!).render(
  <Router>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
      }}
    >
      <App />
    </Auth0Provider>
  </Router>
);
