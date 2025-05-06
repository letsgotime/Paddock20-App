import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Auth0Provider } from '@auth0/auth0-react';

// Get Auth0 configuration from environment variables
const domain = import.meta.env.VITE_AUTH0_DOMAIN as string;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string;

// Dynamically set the redirect URI based on current window location
// Use hash-based callback URL to avoid SPA routing issues
const redirectUri = `${window.location.origin}/#/auth/callback`;

// Log the redirect URI for debugging
console.log("Auth0 Redirect URI:", redirectUri);
console.log("Auth0 Config:", { domain, clientId });

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
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
  </BrowserRouter>
);
