import axios from 'axios';

// Define types for IPinfo response based on their Lite API
export interface IPInfoResponse {
  ip: string;
  asn?: string;
  as_name?: string;
  as_domain?: string;
  country_code?: string;
  country?: string;
  continent_code?: string;
  continent?: string;
  // Additional fields that may be available in other plans
  city?: string;
  region?: string;
  loc?: string; // Latitude,Longitude format
  postal?: string;
  timezone?: string;
  // Computed fields for convenience
  latitude?: number;
  longitude?: number;
}

/**
 * IPinfo service for retrieving geolocation data based on IP
 * Uses the IPinfo API token from environment variables or the provided token
 */
export class IPInfoService {
  private baseUrl: string = 'https://api.ipinfo.io/lite';
  private token: string;
  private cache: Map<string, { data: IPInfoResponse, timestamp: number }> = new Map();
  private cacheTTL: number = 1000 * 60 * 30; // 30 minutes cache TTL
  
  constructor(token?: string) {
    // Use provided token or the one in environment variables
    this.token = token || import.meta.env.VITE_IPINFO_TOKEN || 'c18dd771149902';
  }
  
  /**
   * Get location information based on IP address
   * If no IP is provided, gets information based on the client's IP
   */
  async getLocationByIP(ip?: string): Promise<IPInfoResponse> {
    const endpoint = ip ? `${this.baseUrl}/${ip}` : `${this.baseUrl}/me`;
    const cacheKey = ip || 'self';
    
    // Check cache first
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTTL) {
      console.log('Using cached IPinfo data for', cacheKey);
      return cachedData.data;
    }
    
    try {
      const response = await axios.get(endpoint, {
        params: {
          token: this.token
        }
      });
      
      // Process the response data
      const data = response.data as IPInfoResponse;
      
      // Extract latitude and longitude from loc field if available
      if (data.loc) {
        const [lat, lon] = data.loc.split(',').map(parseFloat);
        data.latitude = lat;
        data.longitude = lon;
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching location data from IPinfo:', error);
      throw new Error('Failed to retrieve location data from IPinfo');
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Get the timezone for a location
   */
  async getTimezone(ip?: string): Promise<string | null> {
    try {
      const data = await this.getLocationByIP(ip);
      return data.timezone || null;
    } catch (error) {
      console.error('Error getting timezone from IPinfo:', error);
      return null;
    }
  }
  
  /**
   * Get the coordinates for a location
   * Returns null if coordinates are not available
   */
  async getCoordinates(ip?: string): Promise<{ lat: number, lon: number } | null> {
    try {
      const data = await this.getLocationByIP(ip);
      
      if (data.latitude && data.longitude) {
        return {
          lat: data.latitude,
          lon: data.longitude
        };
      } else if (data.loc) {
        const [lat, lon] = data.loc.split(',').map(parseFloat);
        return { lat, lon };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates from IPinfo:', error);
      return null;
    }
  }
  
  /**
   * Get location details including country, continent, and ASN information
   */
  async getLocationDetails(ip?: string): Promise<{
    country?: string;
    countryCode?: string;
    continent?: string;
    continentCode?: string;
    asn?: string;
    asName?: string;
    asDomain?: string;
    // Additional fields that may be available in higher plans
    city?: string;
    region?: string;
  } | null> {
    try {
      const data = await this.getLocationByIP(ip);
      
      return {
        country: data.country,
        countryCode: data.country_code,
        continent: data.continent,
        continentCode: data.continent_code,
        asn: data.asn,
        asName: data.as_name,
        asDomain: data.as_domain,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      console.error('Error getting location details from IPinfo:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const ipInfoService = new IPInfoService();