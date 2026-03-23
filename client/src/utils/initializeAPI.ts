/**
 * API Initialization Module
 * 
 * This module ensures that the API Data Warehouse and providers
 * are initialized early in the application lifecycle.
 */

import { initializeApiService } from '@/services/api/APIService';

// Initialize the API Service immediately when this module is imported
console.log('Initializing API Data Warehouse and providers...');
initializeApiService();

// Export a dummy function to ensure TypeScript doesn't optimize this module away
export function ensureAPIInitialized(): void {
  // API is already initialized when this module is imported
  console.log('API Service verified as initialized');
}