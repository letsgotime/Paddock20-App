import axios from 'axios';
import { URL } from 'url';
import { storage } from '../storage';

// Smartcar API endpoints
const SMARTCAR_API_BASE = 'https://api.smartcar.com/v2.0';
const SMARTCAR_AUTH_URL = 'https://connect.smartcar.com/oauth/authorize';
const SMARTCAR_TOKEN_URL = 'https://auth.smartcar.com/oauth/token';

interface SmartcarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  testMode?: boolean;
}

interface SmartcarToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number; // Calculated expiration timestamp
}

interface SmartcarVehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
}

class SmartcarService {
  private config: SmartcarConfig;
  private baseHeaders: Record<string, string>;

  constructor() {
    if (!process.env.SMARTCAR_CLIENT_ID || !process.env.SMARTCAR_CLIENT_SECRET) {
      throw new Error('Smartcar client ID and secret must be provided in environment variables');
    }

    // Get the current domain for the redirect URI
    const domain = process.env.REPLIT_DOMAINS ? 
      process.env.REPLIT_DOMAINS.split(',')[0] : 
      'localhost:5000';

    const protocol = domain.includes('localhost') ? 'http' : 'https';
    
    this.config = {
      clientId: process.env.SMARTCAR_CLIENT_ID,
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
      redirectUri: `${protocol}://${domain}/smartcar/callback`,
      scope: [
        'required:read_vehicle_info',
        'required:read_odometer',
        'required:read_fuel',
        'required:read_battery',
        'required:read_location',
        'required:read_tires',
        'read_engine_oil',
        'control_security',
        'control_climate'
      ],
      testMode: true, // Set to false for production
    };

    // Set up the basic authorization header for token requests
    const authString = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');
    
    this.baseHeaders = {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    console.log('Smartcar service initialized with redirect URI:', this.config.redirectUri);
  }

  /**
   * Generate the authorization URL for Smartcar Connect
   */
  getAuthUrl(): string {
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      approval_prompt: 'auto'
    });

    if (this.config.testMode) {
      queryParams.append('mode', 'test');
    }

    return `${SMARTCAR_AUTH_URL}?${queryParams.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<SmartcarToken> {
    try {
      const response = await axios.post(
        SMARTCAR_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri
        }).toString(),
        { headers: this.baseHeaders }
      );

      const tokenData = response.data;
      const now = Math.floor(Date.now() / 1000);
      
      // Add expires_at for easier expiration checking
      tokenData.expires_at = now + tokenData.expires_in;
      
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<SmartcarToken> {
    try {
      const response = await axios.post(
        SMARTCAR_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }).toString(),
        { headers: this.baseHeaders }
      );

      const tokenData = response.data;
      const now = Math.floor(Date.now() / 1000);
      
      // Add expires_at for easier expiration checking
      tokenData.expires_at = now + tokenData.expires_in;
      
      return tokenData;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Get the user's vehicles
   */
  async getVehicles(accessToken: string): Promise<string[]> {
    try {
      const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data.vehicles;
    } catch (error) {
      console.error('Error getting vehicles:', error);
      throw new Error('Failed to get vehicle list');
    }
  }

  /**
   * Get vehicle information
   */
  async getVehicleInfo(vehicleId: string, accessToken: string): Promise<SmartcarVehicleInfo> {
    try {
      const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting vehicle info:', error);
      throw new Error('Failed to get vehicle information');
    }
  }

  /**
   * Get vehicle odometer reading
   */
  async getOdometer(vehicleId: string, accessToken: string): Promise<number> {
    try {
      const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles/${vehicleId}/odometer`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data.distance;
    } catch (error) {
      console.error('Error getting odometer:', error);
      throw new Error('Failed to get odometer reading');
    }
  }

  /**
   * Get vehicle fuel or battery level
   */
  async getFuelLevel(vehicleId: string, accessToken: string): Promise<number> {
    try {
      const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles/${vehicleId}/fuel`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data.percentRemaining;
    } catch (error) {
      // If vehicle is electric, try battery endpoint instead
      try {
        const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles/${vehicleId}/battery`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        return response.data.percentRemaining;
      } catch (innerError) {
        console.error('Error getting fuel/battery level:', error, innerError);
        throw new Error('Failed to get fuel or battery level');
      }
    }
  }

  /**
   * Get vehicle location
   */
  async getLocation(vehicleId: string, accessToken: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await axios.get(`${SMARTCAR_API_BASE}/vehicles/${vehicleId}/location`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting location:', error);
      throw new Error('Failed to get vehicle location');
    }
  }

  /**
   * Lock vehicle
   */
  async lockVehicle(vehicleId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.post(
        `${SMARTCAR_API_BASE}/vehicles/${vehicleId}/security`,
        { action: 'LOCK' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error locking vehicle:', error);
      throw new Error('Failed to lock vehicle');
    }
  }

  /**
   * Unlock vehicle
   */
  async unlockVehicle(vehicleId: string, accessToken: string): Promise<boolean> {
    try {
      await axios.post(
        `${SMARTCAR_API_BASE}/vehicles/${vehicleId}/security`,
        { action: 'UNLOCK' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error unlocking vehicle:', error);
      throw new Error('Failed to unlock vehicle');
    }
  }
}

export const smartcarService = new SmartcarService();