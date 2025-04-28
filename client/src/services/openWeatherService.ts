/**
 * OpenWeather One Call API 3.0 Service for Paddock20 Portal
 * Provides comprehensive weather data tailored for automotive applications
 * Uses the paid Startup plan subscription ($40)
 */

// OpenWeather API key from environment variables
const API_KEY = "2379a18ee0e478c88aa7d4aa1df44410";
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5"; // Current weather still uses 2.5
const ONE_CALL_URL = "https://api.openweathermap.org/data/3.0"; // One Call API uses 3.0
const GEO_URL = "https://api.openweathermap.org/geo/1.0"; // Geocoding API for location search

/**
 * Location search result from OpenWeather Geocoding API
 */
export interface LocationSearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  localNames?: Record<string, string>;
  formattedName?: string; // This will be added after fetching
}

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
    const url = `${CURRENT_WEATHER_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
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
    const url = `${CURRENT_WEATHER_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
    return await getCachedOrFetch(url);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get One Call API 3.0 data (comprehensive weather data in one call)
 * Available on paid plans like your Startup plan ($40)
 */
export async function fetchOneCall(lat: number, lon: number) {
  try {
    console.log('Fetching One Call API 3.0 data for coordinates:', lat, lon);
    const url = `${ONE_CALL_URL}/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;
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
 * Interface for F1-level automotive weather data with enhanced performance metrics
 */
export interface AutomotiveWeatherData {
  timestamp: number;
  surfaceConditions: {
    asphalt: {
      temperature: number;
      condition: string;
      gripLevel?: string; // "Low", "Medium", "High", "Optimal"
      dryingRate?: number; // minutes until surface dries after precipitation
    };
    concrete: {
      temperature: number;
      condition: string;
      gripLevel?: string;
    };
    gravel: {
      temperature: number;
      condition: string;
      dustFactor?: number; // visibility impact when driving on gravel
    };
    // Additional track surface types
    trackSpecific?: {
      curbs: {
        gripDifferential: number; // percentage difference in grip from main surface
        moistureRetention: number; // 1-10 scale of how much moisture they retain
      };
      runoffAreas: {
        condition: string;
        temperature: number;
      };
      pitLane: {
        temperature: number;
        condition: string;
      };
    };
  };
  drivingRisk: {
    overall: string;
    visibility: string;
    traction: string;
    score: number;
    index?: number;
    description?: string;
    crosswindRisk?: string; // "Low", "Moderate", "High", "Extreme"
    aquaplaningRisk?: string; // "Low", "Moderate", "High", "Extreme" 
    // F1-specific risks
    trackLimits?: {
      adherence: string; // "Difficult", "Moderate", "Easy"
      runoffSafety: string; // "Hazardous", "Compromised", "Safe"
    };
  };
  washConditions: {
    recommended: boolean;
    uv: string;
    pollen: string;
    drying: string;
    rainProbabilityNext24h?: number;
    spotFreeWashing?: boolean; // Is it suitable for spot-free drying
    protectionLongevity?: string; // How weather affects protection products
  };
  detailingConditions: {
    recommended: boolean;
    humidity: string;
    temperature?: string;
    wind?: string;
    lighting?: string;
    polishingConditions?: string; // "Ideal", "Good", "Fair", "Poor"
    coatingCuringFactor?: number; // Multiplier for recommended curing time
  };
  // Enhanced F1-level performance metrics
  performance: {
    tireWarmupTime: {
      sport: number;     // minutes to optimal temperature for sport tires
      summer: number;    // minutes to optimal temperature for summer tires
      allSeason: number; // minutes to optimal temperature for all-season tires
      winter: number;    // minutes to optimal temperature for winter tires
      // F1-specific tire compounds
      soft?: number;
      medium?: number;
      hard?: number;
      intermediate?: number;
      wet?: number;
    };
    tirePerformance: {
      optimalCompound: string; // Recommended compound for conditions
      degradationRate: number; // 1-10 scale (1 = minimal, 10 = severe)
      grainingSusceptibility: number; // 1-10 risk scale
      temperatureWindow: {
        min: number; // Minimum optimal operating temperature
        max: number; // Maximum optimal operating temperature
        current: number; // Estimated temperature in current conditions
      };
      pressureBuildupRate?: number; // PSI increase per lap
    };
    recommendedTirePressure: {
      front: {
        min: number;
        max: number;
        optimal: number;
        unit: string;
      };
      rear: {
        min: number;
        max: number;
        optimal: number;
        unit: string;
      };
    };
    torqueEffect: {
      description: string;
      percentageAdjustment: number;
      // Added fields
      cornerExitRecommendation?: string; // "Progressive", "Aggressive", "Cautious"
      tractionControlSuggestion?: number; // 0-5 scale, 0 = off, 5 = maximum
    };
    aerodynamics: {
      dragCoefficient: number; // Estimated based on wind and conditions
      downforceEfficiency: number; // Percentage effectiveness
      // Added fields
      wingSettings?: {
        front: string; // "Minimum", "Low", "Medium", "High", "Maximum"
        rear: string; // "Minimum", "Low", "Medium", "High", "Maximum"
      };
      airDensityImpact?: string; // Effect on aerodynamic performance
      crosswindSensitivity?: number; // 1-10 scale of vulnerability to crosswinds
    };
    enginePerformance: {
      airDensityFactor: number; // Multiplication factor
      coolingEfficiency: string;
      estimatedPowerChange: string;
      // Added fields
      airIntakeTemperature?: number; // Estimated temperature
      turboEfficiency?: number; // Percentage based on conditions
      optimalShiftPoints?: { // RPM adjustments for conditions
        increase: number; // Percentage to increase shift point
        decrease: number; // Percentage to decrease shift point
      };
    };
    brakingPerformance: {
      coolingEfficiency: string; // "Excellent", "Good", "Fair", "Poor"
      estimatedOptimalTemperature: number; // in °F or °C
      paddleDegradation?: number; // 1-10 scale representing additional wear in these conditions
      brakingPointAdjustment?: number; // feet or meters to adjust typical braking points
    };
    trackSpecificGuidance: {
      raceLine: {
        traditional: string; // "Optimal", "Viable", "Compromised"
        alternativeLine?: string; // Description of alternative racing line for conditions
        wetLine?: string; // Description of wet weather line
      };
      cornerSpeedAdjustments?: Array<{
        cornerType: string; // "Slow", "Medium", "Fast"
        speedAdjustment: number; // Percentage adjustment from dry conditions
      }>;
      grip: {
        apexGrip: number; // 1-10 scale
        exitGrip: number; // 1-10 scale
        overallBalance: string; // "Understeer", "Neutral", "Oversteer"
      };
    };
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
    
    // Calculate F1-level performance metrics
    
    // Air density calculation (using simplified formula)
    const pressurePa = current.main.pressure * 100; // Convert hPa to Pa
    const tempKelvin = (airTemp - 32) * 5/9 + 273.15; // Convert °F to Kelvin
    const airDensity = pressurePa / (287.05 * tempKelvin) * (1 - (humidity * 0.378)); // kg/m³
    
    // Air density factor (1.0 is standard day at sea level)
    const standardDensity = 1.225; // kg/m³ at 15°C, sea level
    const airDensityFactor = (airDensity / standardDensity).toFixed(3);
    
    // Engine power effect (very simplified model)
    const powerChange = ((airDensity / standardDensity - 1) * 100).toFixed(1);
    const powerChangeStr = parseFloat(powerChange) > 0 
      ? `+${powerChange}% power potential` 
      : `${powerChange}% power reduction`;
    
    // Tire warm-up time calculations (minutes to reach optimal temperature)
    // Factors: ambient temp, surface temp, wind, humidity
    const baseWarmupFactor = airTemp < 50 ? 3.0 : airTemp < 65 ? 2.0 : 1.0;
    
    // Adjust for surface temperature
    const surfaceFactor = asphaltTemp < 70 ? 1.5 : asphaltTemp > 100 ? 0.7 : 1.0;
    
    // Adjust for wind (wind cools tires)
    const windFactor = windSpeed > 15 ? 1.3 : windSpeed > 8 ? 1.1 : 1.0;
    
    // Adjust for precipitation
    const wetFactor = hasRain || hasSnow ? 1.8 : humidity > 90 ? 1.3 : 1.0;
    
    // Calculate warm-up times for different tire types
    const sportWarmup = Math.round(baseWarmupFactor * surfaceFactor * windFactor * wetFactor * 1.0); // Sport tires (baseline)
    const summerWarmup = Math.round(baseWarmupFactor * surfaceFactor * windFactor * wetFactor * 1.2); // Summer tires
    const allSeasonWarmup = Math.round(baseWarmupFactor * surfaceFactor * windFactor * wetFactor * 1.5); // All-season tires
    const winterWarmup = Math.round(baseWarmupFactor * surfaceFactor * windFactor * wetFactor * 2.0); // Winter tires
    
    // Recommended tire pressure adjustments
    // For performance driving, we typically increase pressures with higher temps
    // Base pressures (typical sport car example in PSI)
    const baseFrontPSI = 32;
    const baseRearPSI = 30;
    
    // Temperature adjustment factor (% per 10°F from 70°F baseline)
    const tempAdjustmentPct = ((airTemp - 70) / 10) * 1.5; // 1.5% per 10°F diff
    
    // Calculate adjusted pressures
    const frontOptimal = Math.round((baseFrontPSI * (1 + tempAdjustmentPct / 100)) * 10) / 10;
    const rearOptimal = Math.round((baseRearPSI * (1 + tempAdjustmentPct / 100)) * 10) / 10;
    
    // Margin for front/rear (recommended range)
    const pressureMargin = 2.0;
    
    // Torque effect calculation based on road condition
    let torqueDescription = "Normal torque application recommended";
    let torqueAdjustment = 0;
    
    if (hasSnow) {
      torqueDescription = "Reduce torque significantly for snow conditions";
      torqueAdjustment = -40; // 40% reduction
    } else if (hasRain || surfaceCondition === "Wet") {
      torqueDescription = "Reduce torque for wet conditions";
      torqueAdjustment = -25; // 25% reduction
    } else if (surfaceCondition === "Damp") {
      torqueDescription = "Moderate torque reduction recommended";
      torqueAdjustment = -15; // 15% reduction
    } else if (asphaltTemp > 120) {
      torqueDescription = "Higher torque application possible on hot, grippy surface";
      torqueAdjustment = 5; // 5% increase
    }
    
    // Drag coefficient approximation based on conditions
    // Base value for typical sports car (0.30-0.35)
    const baseDrag = 0.32;
    // Adjusted for weather conditions
    const dragCoefficient = baseDrag * 
      (1 + (windSpeed / 50)) * // Wind effect
      (hasRain ? 1.05 : 1) *   // Rain effect
      (hasSnow ? 1.12 : 1);    // Snow effect
    
    // Downforce efficiency (percentage)
    // Reduced in wet conditions due to water on aero surfaces
    const downforceEfficiency = hasRain ? 85 : hasSnow ? 70 : 100;
    
    // Cooling efficiency
    let coolingEfficiency = "Optimal";
    if (airTemp > 90) {
      coolingEfficiency = "Reduced - monitor temps";
    } else if (airTemp < 40) {
      coolingEfficiency = "High - consider blocking airflow";
    }
    
    // Construct the automotive data object with F1-level performance metrics
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
      },
      // F1-level performance metrics
      performance: {
        tireWarmupTime: {
          sport: sportWarmup,
          summer: summerWarmup,
          allSeason: allSeasonWarmup,
          winter: winterWarmup,
          // F1-specific tire compounds
          soft: Math.round(sportWarmup * 0.8),      // Soft heats up faster
          medium: sportWarmup,                      // Similar to sport road tires
          hard: Math.round(sportWarmup * 1.2),      // Harder compound takes longer
          intermediate: Math.round(sportWarmup * 1.5), // Intermediate takes longer
          wet: Math.round(sportWarmup * 2.0)        // Wet tires take longest
        },
        tirePerformance: {
          optimalCompound: hasRain ? "Wet" : hasSnow ? "Wet" : 
                           asphaltTemp > 110 ? "Hard" : 
                           asphaltTemp > 85 ? "Medium" : "Soft",
          degradationRate: hasRain ? 3 : asphaltTemp > 110 ? 8 : 5,  // 1-10 scale
          grainingSusceptibility: humidity > 80 ? 7 : asphaltTemp < 60 ? 8 : 4,  // 1-10 risk scale
          temperatureWindow: {
            min: asphaltTemp - 20,
            max: asphaltTemp + 30,
            current: asphaltTemp
          },
          pressureBuildupRate: asphaltTemp > 100 ? 0.5 : 0.3  // PSI increase per lap
        },
        recommendedTirePressure: {
          front: {
            min: frontOptimal - pressureMargin,
            max: frontOptimal + pressureMargin,
            optimal: frontOptimal,
            unit: "PSI"
          },
          rear: {
            min: rearOptimal - pressureMargin,
            max: rearOptimal + pressureMargin,
            optimal: rearOptimal,
            unit: "PSI"
          }
        },
        torqueEffect: {
          description: torqueDescription,
          percentageAdjustment: torqueAdjustment,
          cornerExitRecommendation: hasRain ? "Progressive" : 
                                   hasSnow ? "Cautious" : 
                                   asphaltTemp > 100 ? "Aggressive" : "Progressive",
          tractionControlSuggestion: hasRain ? 3 : hasSnow ? 5 : humidity > 90 ? 2 : 1
        },
        aerodynamics: {
          dragCoefficient: parseFloat(dragCoefficient.toFixed(3)),
          downforceEfficiency: downforceEfficiency,
          wingSettings: {
            front: hasRain ? "High" : windSpeed > 20 ? "Medium" : "Maximum",
            rear: hasRain ? "Maximum" : windSpeed > 20 ? "Medium" : "Maximum"
          },
          airDensityImpact: airDensity > standardDensity ? "Higher drag, more downforce" : "Lower drag, less downforce",
          crosswindSensitivity: windSpeed > 15 ? 8 : 4
        },
        enginePerformance: {
          airDensityFactor: parseFloat(airDensityFactor),
          coolingEfficiency: coolingEfficiency,
          estimatedPowerChange: powerChangeStr,
          airIntakeTemperature: Math.round(airTemp * 0.8 + 10),
          turboEfficiency: airTemp < 50 ? 97 : airTemp > 90 ? 91 : 95,
          optimalShiftPoints: {
            increase: airDensity > standardDensity ? 3 : 0,
            decrease: airDensity < standardDensity ? 2 : 0
          }
        },
        brakingPerformance: {
          coolingEfficiency: airTemp < 50 ? "Excellent" : airTemp > 90 ? "Poor" : "Good",
          estimatedOptimalTemperature: 450, // °F for carbon ceramic brakes
          paddleDegradation: hasRain ? 6 : hasSnow ? 8 : 3,
          brakingPointAdjustment: hasRain ? 15 : hasSnow ? 40 : 0 // feet earlier
        },
        trackSpecificGuidance: {
          raceLine: {
            traditional: hasRain || hasSnow ? "Compromised" : "Optimal",
            alternativeLine: hasRain ? "Use wider turn-in to avoid standing water" : null,
            wetLine: hasRain ? "Avoid painted lines and kerbs" : null
          },
          cornerSpeedAdjustments: [
            { cornerType: "Slow", speedAdjustment: hasRain ? -10 : hasSnow ? -25 : 0 },
            { cornerType: "Medium", speedAdjustment: hasRain ? -15 : hasSnow ? -30 : 0 },
            { cornerType: "Fast", speedAdjustment: hasRain ? -20 : hasSnow ? -35 : 0 }
          ],
          grip: {
            apexGrip: hasRain ? 5 : hasSnow ? 3 : asphaltTemp > 100 ? 9 : 7,
            exitGrip: hasRain ? 4 : hasSnow ? 2 : asphaltTemp > 100 ? 8 : 7,
            overallBalance: hasRain ? "Oversteer" : airTemp < 50 ? "Understeer" : "Neutral"
          }
        }
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
        WeatherText: current.weather[0]?.description || 'Unknown',
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
 * Search for locations by name
 * Allows the user to search for any location worldwide
 */
export async function searchLocationsByName(query: string): Promise<LocationSearchResult[]> {
  try {
    console.log('Searching for locations with query:', query);
    const url = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
    const results = await getCachedOrFetch(url);
    
    // Format the results with a user-friendly display name
    return results.map((location: any) => ({
      ...location,
      formattedName: location.state 
        ? `${location.name}, ${location.state}, ${location.country}` 
        : `${location.name}, ${location.country}`
    }));
  } catch (error) {
    console.error('Error searching for locations:', error);
    throw error;
  }
}

/**
 * Get location information for reverse geocoding (coordinates to place name)
 */
export async function getLocationNameByCoordinates(lat: number, lon: number): Promise<LocationSearchResult | null> {
  try {
    const url = `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const results = await getCachedOrFetch(url);
    
    if (results && results.length > 0) {
      const location = results[0];
      return {
        ...location,
        formattedName: location.state 
          ? `${location.name}, ${location.state}, ${location.country}` 
          : `${location.name}, ${location.country}`
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
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