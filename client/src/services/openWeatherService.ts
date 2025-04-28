/**
 * OpenWeather API Service for Paddock20 portal
 * Provides weather data tailored for automotive applications
 */

// OpenWeather API key from environment variables
const API_KEY = "2379a18ee0e478c88aa7d4aa1df44410";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Cache for API responses with expiration times
interface CacheEntry {
  data: any;
  expires: number; // Timestamp when this entry expires
}

const apiCache: Record<string, CacheEntry> = {};

/**
 * Get data from cache if valid, otherwise fetch from API
 */
async function getCachedOrFetch(url: string) {
  const now = Date.now();
  const cacheEntry = apiCache[url];
  
  // If we have a valid cache entry, return it
  if (cacheEntry && now < cacheEntry.expires) {
    console.log('Using cached data for:', url);
    return cacheEntry.data;
  }
  
  // Otherwise fetch fresh data
  console.log('Fetching fresh data for:', url);
  
  // Add randomization to refresh times to prevent all users from hitting API at same time
  const jitter = Math.floor(Math.random() * 5 * 60 * 1000); // Random up to 5 minutes
  const cacheTime = 30 * 60 * 1000 + jitter; // 30 minutes + jitter
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  apiCache[url] = {
    data,
    expires: now + cacheTime
  };
  
  return data;
}

/**
 * Get current weather conditions
 */
export async function fetchCurrentWeather(lat: number, lon: number) {
  try {
    console.log('Fetching current weather for coordinates:', lat, lon);
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    return await getCachedOrFetch(url);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Get 5-day forecast with 3-hour steps
 */
export async function fetchForecast(lat: number, lon: number) {
  try {
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    return await getCachedOrFetch(url);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get One Call API data (comprehensive weather data in one call)
 * Available on paid plans like your Startup plan ($40)
 */
export async function fetchOneCall(lat: number, lon: number) {
  try {
    console.log('Fetching One Call API data for coordinates:', lat, lon);
    const url = `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial&exclude=minutely`;
    return await getCachedOrFetch(url);
  } catch (error) {
    console.error('Error fetching One Call data:', error);
    throw error;
  }
}

/**
 * Get daily forecast data (from One Call API)
 */
export async function fetchDailyForecast(lat: number, lon: number) {
  try {
    const oneCallData = await fetchOneCall(lat, lon);
    
    // Format daily data to match our expected format
    const dailyData = oneCallData.daily.map((day: any) => ({
      dt: day.dt,
      sunrise: day.sunrise,
      sunset: day.sunset,
      temp: day.temp,
      weather: day.weather,
      pop: day.pop,  // Probability of precipitation
      humidity: day.humidity,
      wind_speed: day.wind_speed,
      uvi: day.uvi
    }));
    
    // Format return data similar to AccuWeather daily forecast
    return {
      DailyForecasts: dailyData,
      Sun: {
        Rise: new Date(oneCallData.current.sunrise * 1000).toISOString(),
        Set: new Date(oneCallData.current.sunset * 1000).toISOString()
      }
    };
  } catch (error) {
    console.error('Error creating daily forecast:', error);
    throw error;
  }
}

/**
 * Interface for automotive weather data compatible with both APIs
 */
export interface AutomotiveWeatherData {
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
 * Calculate automotive weather data based on current weather and forecast
 */
export async function getAutomotiveWeatherData(lat: number, lon: number): Promise<AutomotiveWeatherData> {
  try {
    // Get the necessary data
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon)
    ]);
    
    // Process the data to derive automotive-specific insights
    
    // Extract base weather data
    const airTemp = current.main.temp;
    const isDaytime = new Date().getHours() > 6 && new Date().getHours() < 20;
    const cloudCover = current.clouds?.all || 0;
    const hasRain = current.weather.some((w: any) => 
      w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Thunderstorm');
    const hasSnow = current.weather.some((w: any) => w.main === 'Snow');
    const humidity = current.main.humidity;
    const visibility = current.visibility / 1000 * 0.621371; // convert to miles
    const windSpeed = current.wind.speed;
    const windGust = current.wind.gust || windSpeed;
    
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
    let surfaceCondition = "Dry";
    if (hasRain) surfaceCondition = "Wet";
    if (hasSnow) surfaceCondition = "Snow";
    if (humidity > 90) surfaceCondition = "Damp";
    
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
    
    if (hasSnow) {
      tractionCondition = "Poor";
      riskScore += 4;
      drivingRiskLevel = "High";
    }
    
    // Car wash assessment
    // Check probability of rain in next 24 hours
    const next24hForecasts = forecast.list.filter((f: any) => {
      const forecastTime = new Date(f.dt * 1000);
      const now = new Date();
      const hoursDiff = (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 0 && hoursDiff <= 24;
    });
    
    const rainProbNext24h = next24hForecasts.length > 0 
      ? Math.max(...next24hForecasts.map((f: any) => f.pop * 100))
      : 0;
    
    const isWashRecommended = !hasRain && rainProbNext24h < 30 && humidity < 80;
    
    // Estimate UV index from weather conditions and time
    let uvLevel = "Low";
    if (isDaytime && cloudCover < 50) {
      uvLevel = "Moderate";
      if (cloudCover < 30) uvLevel = "High";
    }
    
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
        description: `${drivingRiskLevel} risk for driving. ${
          hasRain ? 'Rain affects traction. ' : ''
        }${hasSnow ? 'Snow creates hazardous conditions. ' : ''
        }${visibility < 5 ? 'Reduced visibility. ' : ''}`
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
 * Fetch all OpenWeather data needed for the automotive dashboard
 */
export async function fetchAllWeatherData(latitude: number, longitude: number) {
  try {
    console.log('Fetching all OpenWeather data for coordinates:', latitude, longitude);
    
    // Fetch all data in parallel
    const [current, daily, automotive] = await Promise.all([
      fetchCurrentWeather(latitude, longitude),
      fetchDailyForecast(latitude, longitude),
      getAutomotiveWeatherData(latitude, longitude)
    ]);
    
    return {
      currentConditions: {
        WeatherText: current.weather[0]?.description,
        WeatherIcon: current.weather[0]?.icon,
        HasPrecipitation: current.weather.some((w: any) => w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Snow'),
        PrecipitationType: current.weather.some((w: any) => w.main === 'Snow') ? 'Snow' : 
                          current.weather.some((w: any) => w.main === 'Rain' || w.main === 'Drizzle') ? 'Rain' : null,
        IsDayTime: new Date().getHours() > 6 && new Date().getHours() < 20,
        Temperature: {
          Imperial: {
            Value: current.main.temp,
            Unit: 'F'
          }
        },
        RelativeHumidity: current.main.humidity,
        Wind: {
          Speed: {
            Imperial: {
              Value: current.wind.speed,
              Unit: 'mph'
            }
          },
          Direction: {
            Degrees: current.wind.deg,
            Localized: getWindDirection(current.wind.deg)
          }
        },
        CloudCover: current.clouds?.all || 0,
        UVIndex: getUVIndex(current.weather[0]?.id, current.clouds?.all),
        UVIndexText: getUVIndexText(getUVIndex(current.weather[0]?.id, current.clouds?.all)),
        Visibility: {
          Imperial: {
            Value: current.visibility / 1000 * 0.621371,
            Unit: 'mi'
          }
        },
        Pressure: {
          Imperial: {
            Value: current.main.pressure / 33.863886666667,
            Unit: 'inHg'
          }
        },
        WeatherText: current.weather[0]?.description || 'Unknown',
        TemperatureApparent: {
          Imperial: {
            Value: current.main.feels_like,
            Unit: 'F'
          }
        }
      },
      dailyForecast: daily,
      automotiveData: automotive
    };
  } catch (error) {
    console.error('Error fetching all OpenWeather data:', error);
    throw error;
  }
}

// Helper functions

/**
 * Get cardinal direction from degrees
 */
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  return directions[Math.round(degrees / 22.5)];
}

/**
 * Estimate UV index from weather conditions
 */
function getUVIndex(weatherId: number, cloudCover: number): number {
  const hour = new Date().getHours();
  const isDaytime = hour >= 8 && hour <= 16;
  
  if (!isDaytime) return 0;
  
  // Base UV index estimation
  let baseUV = 5;
  
  // Reduce for cloud cover
  const cloudFactor = 1 - (cloudCover / 100) * 0.75;
  baseUV = baseUV * cloudFactor;
  
  // Reduce for certain weather conditions
  if (weatherId >= 200 && weatherId < 700) { // Thunderstorm, Drizzle, Rain, Snow
    baseUV = baseUV * 0.3;
  } else if (weatherId >= 700 && weatherId < 800) { // Atmosphere (fog, dust, etc)
    baseUV = baseUV * 0.5;
  }
  
  return Math.round(baseUV);
}

/**
 * Get UV index text from value
 */
function getUVIndexText(uvIndex: number): string {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}