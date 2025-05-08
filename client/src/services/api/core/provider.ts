import axios, { AxiosResponse } from 'axios';
import { ApiRequestConfig } from './types';

/**
 * Response structure for API providers
 */
export interface ProviderResponse<T = any> {
  success: boolean;
  data: T | null;
  error?: string;
  provider: string;
  timestamp: number;
}

/**
 * Base class for all API providers
 */
export abstract class BaseProvider {
  name: string;
  type: string;
  priority: number = 5; // Default priority (1-10 scale, 10 being highest)
  
  constructor(name: string, type: string, priority: number = 5) {
    this.name = name;
    this.type = type;
    this.priority = priority;
  }
  
  /**
   * Makes an HTTP request using Axios
   */
  async makeRequest<T = any>(config: ApiRequestConfig): Promise<{ 
    data: T | null;
    error?: string;
    status?: number;
    headers?: Record<string, string>;
  }> {
    try {
      const response: AxiosResponse<T> = await axios(config);
      
      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
      };
    } catch (error: any) {
      // Handle axios errors
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error(`[${this.name} Provider] Request failed:`, errorMessage);
      
      return {
        data: null,
        error: errorMessage,
        status: error.response?.status,
      };
    }
  }
  
  /**
   * Standard error handler for provider requests
   */
  handleError<T = any>(error: any, defaultMessage: string = 'An error occurred'): ProviderResponse<T> {
    const errorMessage = error.message || defaultMessage;
    console.error(`[${this.name} Provider] Error:`, errorMessage);
    
    return {
      success: false,
      data: null,
      error: errorMessage,
      provider: this.name,
      timestamp: Date.now(),
    };
  }
}