import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management
import { Auth0ProviderWithRedirectCallback } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Auth0ProviderWithRedirectCallback>
      <App />
    </Auth0ProviderWithRedirectCallback>
  </BrowserRouter>
);
