/**
 * API Key Manager Service
 * 
 * Provides functionality to store, retrieve, validate, and manage API keys
 * used within the application.
 */

// Store keys in localStorage with a prefix to avoid collisions
const API_KEY_PREFIX = 'paddock20_api_key_';

// Available services that can use API keys
export type ApiKeyService = 'openweather' | 'unsplash' | 'accuweather';

// Service configuration
interface ServiceConfig {
  name: string;
  description: string;
  validationEndpoint: string;
}

// Service registry - configuration for each supported service
const serviceRegistry: Record<ApiKeyService, ServiceConfig> = {
  openweather: {
    name: 'OpenWeather',
    description: 'Weather data provider for current conditions, forecasts, and automotive metrics',
    validationEndpoint: '/api/validate-key/openweather',
  },
  accuweather: {
    name: 'AccuWeather',
    description: 'Alternative weather data provider with enhanced forecasting and alerts',
    validationEndpoint: '/api/validate-key/accuweather',
  },
  unsplash: {
    name: 'Unsplash',
    description: 'High-quality image provider for background imagery and gallery content',
    validationEndpoint: '/api/validate-key/unsplash',
  },
};

/**
 * Save an API key to localStorage for a specific service
 */
export const saveApiKey = (service: ApiKeyService, apiKey: string): void => {
  try {
    localStorage.setItem(`${API_KEY_PREFIX}${service}`, apiKey);
  } catch (error) {
    console.error(`Failed to save API key for ${service}:`, error);
    throw new Error('Failed to save API key. Please check your browser settings.');
  }
};

/**
 * Retrieve an API key for a specific service
 */
export const getApiKey = (service: ApiKeyService): string | null => {
  try {
    return localStorage.getItem(`${API_KEY_PREFIX}${service}`);
  } catch (error) {
    console.error(`Failed to retrieve API key for ${service}:`, error);
    return null;
  }
};

/**
 * Delete an API key for a specific service
 */
export const deleteApiKey = (service: ApiKeyService): void => {
  try {
    localStorage.removeItem(`${API_KEY_PREFIX}${service}`);
  } catch (error) {
    console.error(`Failed to delete API key for ${service}:`, error);
  }
};

/**
 * Validate an API key for a specific service
 * Returns a promise that resolves to a boolean indicating if the key is valid
 */
export const validateApiKey = async (service: ApiKeyService, apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  
  const { validationEndpoint } = serviceRegistry[service];
  
  try {
    const response = await fetch(validationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to validate API key');
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error(`API key validation failed for ${service}:`, error);
    throw error;
  }
};

/**
 * Submit a new API key for validation and storage
 */
export const submitApiKey = async (service: ApiKeyService, apiKey: string): Promise<void> => {
  // Validate the API key
  const isValid = await validateApiKey(service, apiKey);
  
  if (!isValid) {
    throw new Error(`The provided API key for ${serviceRegistry[service].name} is invalid`);
  }
  
  // Save the valid API key
  saveApiKey(service, apiKey);
  
  // Notify the server to use this key
  try {
    await fetch('/api/use-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ service, apiKey }),
    });
  } catch (error) {
    console.error(`Failed to notify server about new API key for ${service}:`, error);
    // We still keep the key locally even if server notification fails
  }
};

/**
 * Get service information
 */
export const getServiceInfo = (service: ApiKeyService): ServiceConfig => {
  return serviceRegistry[service];
};

/**
 * Check if a service has a user-provided API key
 */
export const hasUserApiKey = (service: ApiKeyService): boolean => {
  return getApiKey(service) !== null;
};

export default {
  saveApiKey,
  getApiKey,
  deleteApiKey,
  validateApiKey,
  submitApiKey,
  getServiceInfo,
  hasUserApiKey,
};