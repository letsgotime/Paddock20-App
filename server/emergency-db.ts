// Emergency DB file for investor demo mode
import createMemoryStore from "memorystore";
import session from "express-session";

// EMERGENCY INVESTOR DEMO MODE - Check for environment flag
export const DEMO_MODE = process.env.NODE_ENV === 'production' || process.env.DEMO_MODE === 'true';

// Create memory session store to avoid database dependency
export const getSessionStore = () => {
  const MemoryStore = createMemoryStore(session);
  return new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
};