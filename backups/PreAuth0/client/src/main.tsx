import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./index.css";
import "./bts.css";
import "./utils/storageManager"; // Initialize enhanced storage management

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
