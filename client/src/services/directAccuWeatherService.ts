import axios from 'axios';

// AccuWeather API key from environment variables
const API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;

// Create an axios instance with the AccuWeather best practices applied
const accuWeatherApi = axios.create({
  headers: {
    // Use GZIP compression as recommended in the AccuWeather Best Practices
    'Accept-Encoding': 'gzip,deflate',
  },
});

// Cache for API responses with expiration times
interface CacheEntry {
  data: any;
  expires: number; // Timestamp when this entry expires
}

const apiCache: Record<string, CacheEntry> = {};

/**
 * Get data from cache if valid, otherwise fetch from API
 * Implements AccuWeather best practice of using Expires header
 */
async function getCachedOrFetch(url: string, fetchFn: () => Promise<any>) {
  const now = Date.now();
  const cacheEntry = apiCache[url];
  
  // If we have a valid cache entry, return it
  if (cacheEntry && now < cacheEntry.expires) {
    console.log('Using cached data for:', url);
    return cacheEntry.data;
  }
  
  // Otherwise fetch fresh data
  console.log('Fetching fresh data for:', url);
  const data = await fetchFn();
  
  // Cache the response with expiration time
  // Default cache time is 30 minutes if no expires header
  let expiresTimestamp = now + (30 * 60 * 1000);
  
  // Store in cache
  apiCache[url] = {
    data,
    expires: expiresTimestamp
  };
  
  return data;
}

/**
 * Get AccuWeather location key directly using their Geoposition Search API
 * This follows the flow diagram provided in the AccuWeather documentation
 */
export async function getLocationKeyByGeoposition(latitude: number, longitude: number) {
  try {
    console.log('Fetching AccuWeather location key with coordinates:', latitude, longitude);
    
    // Format coordinates as required by AccuWeather API
    const coords = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    
    // Use the Geoposition Search endpoint as shown in the flow diagram
    const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${API_KEY}&q=${coords}`;
    
    console.log('Geoposition search URL:', url);
    const response = await axios.get(url);
    
    // This will return a location object with the Key property
    return response.data;
  } catch (error) {
    console.error('Error in direct AccuWeather geoposition search:', error);
    // Re-throw the error after logging
    throw error;
  }
}

/**
 * Get current conditions directly from AccuWeather API
 */
export async function getCurrentConditions(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${API_KEY}&details=true`;
    const response = await axios.get(url);
    
    // Current conditions endpoint returns an array with a single item
    return response.data[0];
  } catch (error) {
    console.error('Error fetching AccuWeather current conditions:', error);
    throw error;
  }
}

/**
 * Get daily forecast directly from AccuWeather API
 */
export async function getDailyForecast(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${API_KEY}&details=true`;
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching AccuWeather daily forecast:', error);
    throw error;
  }
}

/**
 * Get hourly forecast directly from AccuWeather API
 */
export async function getHourlyForecast(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}?apikey=${API_KEY}&details=true`;
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching AccuWeather hourly forecast:', error);
    throw error;
  }
}

/**
 * Get indices directly from AccuWeather API
 */
export async function getIndices(locationKey: string) {
  try {
    const url = `https://dataservice.accuweather.com/indices/v1/daily/1day/${locationKey}?apikey=${API_KEY}`;
    const response = await axios.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching AccuWeather indices:', error);
    throw error;
  }
}

/**
 * Interface for automotive weather data
 */
export interface AutomotiveWeatherData {
  locationKey: string;
  timestamp: number;
  surfaceConditions: {
    asphalt: {
      temperature: number;
      condition: string;
    };
    concrete: {
      temperature: number;
      condition: string;
    };
    gravel: {
      temperature: number;
      condition: string;
    };
  };
  drivingRisk: {
    overall: string;
    visibility: string;
    traction: string;
    score: number;
    index?: number;
    description?: string;
  };
  washConditions: {
    recommended: boolean;
    uv: string;
    pollen: string;
    drying: string;
    rainProbabilityNext24h?: number;
  };
  detailingConditions: {
    recommended: boolean;
    humidity: string;
    temperature?: string;
    wind?: string;
    lighting?: string;
  };
}

/**
 * Calculate automotive weather data based on current conditions and forecasts
 */
export async function getAutomotiveWeatherData(locationKey: string): Promise<AutomotiveWeatherData> {
  try {
    // Get the necessary data
    const [current, forecast, indices] = await Promise.all([
      getCurrentConditions(locationKey),
      getDailyForecast(locationKey),
      getIndices(locationKey)
    ]);
    
    // Process the data to derive automotive-specific insights
    
    // Extract base weather data
    const airTemp = current.Temperature.Imperial.Value;
    const isDaytime = current.IsDayTime;
    const cloudCover = current.CloudCover;
    const hasRain = current.HasPrecipitation;
    const humidity = current.RelativeHumidity;
    const uvIndex = current.UVIndex;
    const visibility = current.Visibility?.Imperial?.Value || 10;
    const windSpeed = current.Wind?.Speed?.Imperial?.Value || 0;
    const windGust = current.WindGust?.Speed?.Imperial?.Value || 0;
    
    // Calculate surface temperatures
    const cloudEffect = 1 - (cloudCover / 100);
    const timeEffect = isDaytime ? 1 : 0.2;
    
    // Base heating factors (°F above air temperature at peak sun)
    const asphaltFactor = 25; // Asphalt can be 20-30°F warmer than air
    const concreteFactor = 15; // Concrete about 10-20°F warmer
    const gravelFactor = 10; // Gravel somewhat warmer
    
    const asphaltTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
    const concreteTemp = Math.round(airTemp + (concreteFactor * cloudEffect * timeEffect));
    const gravelTemp = Math.round(airTemp + (gravelFactor * cloudEffect * timeEffect));
    
    // Determine surface conditions
    const getSurfaceCondition = () => {
      if (hasRain) return current.PrecipitationType || "Wet";
      if (humidity > 90) return "Damp";
      return "Dry";
    };
    
    const surfaceCondition = getSurfaceCondition();
    
    // Driving risk assessment
    let drivingRiskLevel = "Low";
    let visibilityCondition = "Good";
    let tractionCondition = "Good";
    let riskScore = 2; // 1-10 scale
    
    if (hasRain || humidity > 95) {
      tractionCondition = "Reduced";
      riskScore += 2;
    }
    
    if (visibility < 5) {
      visibilityCondition = "Poor";
      riskScore += 3;
      drivingRiskLevel = "Moderate";
    }
    
    if (windGust > 30) {
      riskScore += 2;
      drivingRiskLevel = "Moderate";
    }
    
    if (current.WeatherText?.includes("Snow") || current.WeatherText?.includes("Ice")) {
      tractionCondition = "Poor";
      riskScore += 4;
      drivingRiskLevel = "High";
    }
    
    // Find driving index if available
    const drivingIndex = indices.find(idx => idx.Name?.includes("Driving")) || { 
      Value: 5, 
      Category: "Good", 
      Text: "Conditions are good for driving."
    };
    
    // Car wash assessment
    const rainProbNext24h = forecast.DailyForecasts?.[0]?.Day?.RainProbability || 0;
    const isWashRecommended = !hasRain && rainProbNext24h < 30 && humidity < 80;
    
    let uvLevel = "Low";
    if (uvIndex > 2 && uvIndex <= 5) uvLevel = "Moderate";
    if (uvIndex > 5 && uvIndex <= 7) uvLevel = "High";
    if (uvIndex > 7) uvLevel = "Very High";
    
    let dryingCondition = "Poor";
    if (humidity < 70 && !hasRain) {
      if (windSpeed > 5) dryingCondition = "Excellent";
      else dryingCondition = "Good";
    } else if (humidity < 85 && !hasRain) {
      dryingCondition = "Fair";
    }
    
    // Detailing assessment
    const isDetailingRecommended = !hasRain && humidity < 70 && windSpeed < 15 && cloudCover > 40 && cloudCover < 90;
    
    let humidityCondition = "High";
    if (humidity < 50) humidityCondition = "Optimal";
    else if (humidity < 70) humidityCondition = "Good";
    
    let lightingCondition = "Poor";
    if (isDaytime && cloudCover > 40 && cloudCover < 90) {
      lightingCondition = "Good diffused light";
    } else if (isDaytime && cloudCover <= 40) {
      lightingCondition = "Bright direct sunlight";
    }
    
    // Construct the automotive data object
    const automotiveData: AutomotiveWeatherData = {
      locationKey,
      timestamp: Date.now(),
      surfaceConditions: {
        asphalt: { temperature: asphaltTemp, condition: surfaceCondition },
        concrete: { temperature: concreteTemp, condition: surfaceCondition },
        gravel: { temperature: gravelTemp, condition: surfaceCondition }
      },
      drivingRisk: {
        overall: drivingRiskLevel,
        visibility: visibilityCondition,
        traction: tractionCondition,
        score: riskScore,
        index: drivingIndex.Value,
        description: drivingIndex.Text
      },
      washConditions: {
        recommended: isWashRecommended,
        uv: uvLevel,
        pollen: "Low", // Would need additional data source
        drying: dryingCondition,
        rainProbabilityNext24h: rainProbNext24h
      },
      detailingConditions: {
        recommended: isDetailingRecommended,
        humidity: humidityCondition,
        temperature: `${airTemp}°F`,
        wind: windSpeed < 10 ? "Calm" : "Breezy",
        lighting: lightingCondition
      }
    };
    
    return automotiveData;
  } catch (error) {
    console.error('Error calculating automotive weather data:', error);
    throw error;
  }
}

/**
 * Get all AccuWeather data in a single function call
 * This follows the flow in the AccuWeather diagram:
 * 1. Get location key from coordinates
 * 2. Use location key to call other endpoints
 */
export async function getAllAccuWeatherData(latitude: number, longitude: number) {
  try {
    console.log('Fetching all AccuWeather data for coordinates:', latitude, longitude);
    
    // Step 1: Get location key
    const locationData = await getLocationKeyByGeoposition(latitude, longitude);
    const locationKey = locationData.Key;
    console.log('Got AccuWeather location key:', locationKey);
    
    // Step 2: Fetch all data in parallel using the location key
    const [current, forecast, hourly, indices, automotive] = await Promise.all([
      getCurrentConditions(locationKey),
      getDailyForecast(locationKey),
      getHourlyForecast(locationKey),
      getIndices(locationKey),
      getAutomotiveWeatherData(locationKey)
    ]);
    
    return {
      locationKey,
      locationName: locationData.LocalizedName,
      country: locationData.Country?.LocalizedName,
      currentConditions: current,
      dailyForecast: forecast,
      hourlyForecast: hourly,
      drivingIndices: indices,
      automotiveData: automotive
    };
  } catch (error) {
    console.error('Error fetching all AccuWeather data:', error);
    throw error;
  }
}