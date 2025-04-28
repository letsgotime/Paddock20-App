/**
 * OpenWeather One Call API 3.0 Service for Paddock20 Portal
 * Provides comprehensive weather data tailored for automotive applications
 * Uses the paid Startup plan subscription ($40)
 */

// OpenWeather API key from environment variable - using the fallback as backup
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "efb847e5d07e14ba140f7b62b960f46d";

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
 * Interface for F1-level automotive weather data with enhanced performance metrics
 */
export interface AutomotiveWeatherData {
  timestamp: number;
  location: {
    lat: number;
    lon: number;
    timezone?: string;
  };
  current_time?: string;
  sunrise_time?: string;
  sunset_time?: string;
  surfaceConditions: {
    asphalt: {
      temperature: number;
      condition: string;
      gripLevel?: string; // "Low", "Medium", "High", "Optimal"
    };
    concrete: {
      temperature: number;
      condition: string;
      gripLevel?: string;
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
    description?: string;
    crosswindRisk?: string; // "Low", "Moderate", "High", "Extreme"
    aquaplaningRisk?: string; // "Low", "Moderate", "High", "Extreme" 
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
  };
  hourly_forecast?: Array<{
    time: string;
    temperature: number;
    conditions: string;
    precipitation_chance: number;
  }>;
  alerts?: Array<any>;
  conditions?: {
    summary: string;
    air_temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    cloud_cover: number;
    uv_index: number;
  };
  automotive_metrics?: {
    track_surface?: {
      temperature: number;
      condition: string;
      grip_level: string;
    };
    tire_temperature_estimates?: {
      soft_compound: number;
      medium_compound: number;
      hard_compound: number;
      street_performance: number;
      all_season: number;
    };
    drive_recommendations?: {
      tire_warmup: number;
      surface_assessment: string;
    };
    visibility_assessment?: string;
    sunglare_risk?: string;
  };
}

/**
 * Calculate automotive weather data based on current weather and forecast
 */
/**
 * Fetch data from our comprehensive automotive-weather endpoint
 * This provides integrated F1-style automotive weather data
 */
export async function fetchAutomotiveWeather(lat: number, lon: number, units: string = 'metric'): Promise<any> {
  const cacheKey = `automotive-weather-${lat}-${lon}-${units}`;
  
  if (apiCache[cacheKey] && apiCache[cacheKey].expires > Date.now()) {
    return apiCache[cacheKey].data;
  }
  
  try {
    const response = await fetch(`/api/automotive-weather?lat=${lat}&lon=${lon}&units=${units}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Cache the result for 15 minutes
    apiCache[cacheKey] = {
      data,
      expires: Date.now() + 15 * 60 * 1000
    };
    
    return data;
  } catch (error) {
    console.error('Error fetching automotive weather data:', error);
    throw error;
  }
}

export async function getAutomotiveWeatherData(lat: number, lon: number): Promise<AutomotiveWeatherData> {
  try {
    // Use our server API endpoints to get the data (these proxy to OpenWeather API)
    const [weatherResponse, forecastResponse] = await Promise.all([
      fetch(`/api/weather?lat=${lat}&lon=${lon}&units=metric`),
      fetch(`/api/forecast?lat=${lat}&lon=${lon}&units=metric`)
    ]);
    
    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data from server');
    }
    
    const weatherData = await weatherResponse.json();
    const forecastData = await forecastResponse.json();
    
    // Calculate some automotive-specific weather data from the basic weather data
    
    // Extract base weather data
    const airTemp = weatherData.main.temp;
    const isDaytime = new Date().getHours() > 6 && new Date().getHours() < 20;
    const cloudCover = weatherData.clouds?.all || 0;
    const hasRain = weatherData.weather.some((w: any) => 
      w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Thunderstorm');
    const hasSnow = weatherData.weather.some((w: any) => w.main === 'Snow');
    const humidity = weatherData.main.humidity;
    const visibility = weatherData.visibility / 1000 * 0.621371; // convert to miles
    const windSpeed = weatherData.wind.speed;
    const windGust = weatherData.wind.gust || windSpeed;
    const pressurePa = weatherData.main.pressure * 100; // Convert hPa to Pa
    const tempKelvin = airTemp + 273.15; // Convert °C to Kelvin
    
    // Calculate road surface temperatures
    const cloudEffect = 1 - (cloudCover / 100);
    const timeEffect = isDaytime ? 1 : 0.2;
    
    // Base heating factors (°C above air temperature at peak sun)
    const asphaltFactor = 15; // Asphalt can be 10-20°C warmer than air
    const concreteFactor = 10; // Concrete about 5-15°C warmer
    const gravelFactor = 5; // Gravel somewhat warmer
    
    const asphaltTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
    const concreteTemp = Math.round(airTemp + (concreteFactor * cloudEffect * timeEffect));
    const gravelTemp = Math.round(airTemp + (gravelFactor * cloudEffect * timeEffect));
    
    // Determine surface conditions
    let surfaceCondition = "Dry";
    if (hasRain) surfaceCondition = "Wet";
    if (hasSnow) surfaceCondition = "Snow";
    if (humidity > 90 && !hasRain && !hasSnow) surfaceCondition = "Damp";
    
    // Get precipitation probability from forecasts
    const next24hForecasts = forecastData.list.filter((f: any) => {
      const forecastTime = new Date(f.dt * 1000);
      const now = new Date();
      const hoursDiff = (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 0 && hoursDiff <= 24;
    });
    
    const rainProbNext24h = next24hForecasts.length > 0 
      ? Math.max(...next24hForecasts.map((f: any) => f.pop * 100))
      : 0;
    
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
    
    // Calculate automotive performance metrics
    
    // Tire warmup times based on conditions
    const coldModifier = airTemp < 10 ? 3 : airTemp < 20 ? 1 : 0;
    const wetModifier = hasRain ? 2 : hasSnow ? 5 : 0;
    
    const sportTireWarmup = 3 + coldModifier + wetModifier;
    const summerTireWarmup = 5 + coldModifier + wetModifier;
    const allSeasonTireWarmup = 4 + coldModifier + wetModifier;
    const winterTireWarmup = hasSnow ? 3 + coldModifier : 7 + coldModifier;
    
    // Air density calculation (using simplified formula)
    const airDensity = pressurePa / (287.05 * tempKelvin) * (1 - (humidity * 0.378)); // kg/m³
    
    // Air density factor (1.0 is standard day at sea level)
    const standardDensity = 1.225; // kg/m³ at 15°C, sea level
    const airDensityFactor = Number((airDensity / standardDensity).toFixed(3));
    
    // Calculate tire pressure recommendations
    const standardFrontPressure = 2.2; // bar
    const standardRearPressure = 2.3; // bar
    
    // Adjust pressures based on temperature (lower when hot, higher when cold)
    const tempPressureAdjustment = (airTemp < 10) ? 0.2 : (airTemp > 30) ? -0.2 : 0;
    
    // Return automotive weather data
    return {
      timestamp: Date.now(),
      location: {
        lat,
        lon,
        timezone: 'UTC' // Default timezone
      },
      surfaceConditions: {
        asphalt: {
          temperature: asphaltTemp,
          condition: surfaceCondition,
          gripLevel: hasSnow ? "Low" : hasRain ? "Poor" : humidity > 90 ? "Fair" : "Good"
        },
        concrete: {
          temperature: concreteTemp,
          condition: surfaceCondition,
          gripLevel: hasSnow ? "Low" : hasRain ? "Poor" : humidity > 90 ? "Fair" : "Good"
        },
        gravel: {
          temperature: gravelTemp,
          condition: surfaceCondition
        }
      },
      drivingRisk: {
        overall: drivingRiskLevel,
        visibility: visibilityCondition,
        traction: tractionCondition,
        score: riskScore,
        description: hasRain 
          ? "Precipitation detected. Use caution and reduce speed." 
          : hasSnow 
            ? "Snow on road surfaces. Winter driving precautions required."
            : windGust > 30 
              ? "High wind gusts may affect vehicle stability."
              : "Normal driving conditions, exercise standard precautions.",
        crosswindRisk: windGust > 40 ? "High" : windGust > 20 ? "Moderate" : "Low",
        aquaplaningRisk: hasRain && windSpeed < 10 ? "Moderate" : hasRain ? "Low" : "Minimal"
      },
      washConditions: {
        recommended: !hasRain && !hasSnow && rainProbNext24h < 30 && humidity < 80,
        uv: isDaytime && cloudCover < 30 ? "High" : isDaytime && cloudCover < 70 ? "Moderate" : "Low",
        pollen: isDaytime && windSpeed > 5 && !hasRain ? "Moderate" : "Low",
        drying: humidity < 60 && windSpeed > 5 ? "Excellent" : 
                humidity < 70 && !hasRain ? "Good" : 
                humidity < 85 && !hasRain ? "Fair" : "Poor",
        rainProbabilityNext24h: rainProbNext24h,
        spotFreeWashing: humidity < 50 && !hasRain
      },
      detailingConditions: {
        recommended: !hasRain && !hasSnow && humidity < 70 && windSpeed < 15 && cloudCover > 40 && cloudCover < 90,
        humidity: humidity < 50 ? "Optimal" : humidity < 70 ? "Good" : "High",
        temperature: airTemp < 15 ? "Cold" : airTemp > 30 ? "Hot" : "Optimal",
        wind: windSpeed < 5 ? "Calm" : windSpeed < 15 ? "Moderate" : "High",
        lighting: isDaytime && cloudCover > 40 && cloudCover < 90 ? "Good diffused light" : 
                 isDaytime && cloudCover <= 40 ? "Bright direct sunlight" : "Poor",
        polishingConditions: !hasRain && humidity < 60 && airTemp > 15 && airTemp < 30 ? "Ideal" : 
                           !hasRain && humidity < 75 && airTemp > 10 ? "Good" : "Fair",
        coatingCuringFactor: humidity > 80 ? 1.5 : airTemp < 15 ? 1.3 : 1.0
      },
      performance: {
        tireWarmupTime: {
          sport: sportTireWarmup,
          summer: summerTireWarmup,
          allSeason: allSeasonTireWarmup,
          winter: winterTireWarmup,
          soft: sportTireWarmup - 1,
          medium: sportTireWarmup,
          hard: sportTireWarmup + 1,
          intermediate: 4 + coldModifier,
          wet: 2 + coldModifier
        },
        tirePerformance: {
          optimalCompound: hasSnow ? "Winter" : 
                           hasRain ? "Wet" : 
                           airTemp < 10 ? "Winter" : 
                           airTemp < 20 ? "All Season" : "Summer",
          degradationRate: hasRain ? 3 : asphaltTemp > 40 ? 8 : asphaltTemp > 25 ? 5 : 4,
          grainingSusceptibility: hasRain ? 2 : asphaltTemp < 15 ? 7 : 4,
          temperatureWindow: {
            min: airTemp < 15 ? 60 : 80,
            max: airTemp < 15 ? 90 : 110,
            current: asphaltTemp
          }
        },
        recommendedTirePressure: {
          front: {
            min: standardFrontPressure - 0.1 + tempPressureAdjustment,
            max: standardFrontPressure + 0.2 + tempPressureAdjustment,
            optimal: standardFrontPressure + tempPressureAdjustment,
            unit: "bar"
          },
          rear: {
            min: standardRearPressure - 0.1 + tempPressureAdjustment,
            max: standardRearPressure + 0.2 + tempPressureAdjustment,
            optimal: standardRearPressure + tempPressureAdjustment,
            unit: "bar"
          }
        },
        torqueEffect: {
          description: hasSnow ? "Greatly reduced power application required" : 
                       hasRain ? "Moderate power application recommended" : 
                       "Full power application possible",
          percentageAdjustment: hasSnow ? 50 : hasRain ? 75 : surfaceCondition === "Damp" ? 90 : 100,
          cornerExitRecommendation: hasSnow || hasRain ? "Progressive" : "Aggressive",
          tractionControlSuggestion: hasSnow ? 5 : hasRain ? 3 : surfaceCondition === "Damp" ? 2 : 1
        },
        aerodynamics: {
          dragCoefficient: airDensityFactor > 1.05 ? 1.05 : airDensityFactor < 0.95 ? 0.95 : 1.0,
          downforceEfficiency: hasRain ? 85 : 100,
          wingSettings: {
            front: hasRain ? "High" : asphaltTemp > 35 ? "Medium" : "High",
            rear: hasRain ? "Maximum" : "High"
          },
          airDensityImpact: airDensityFactor > 1.05 ? "Increased drag, more downforce" : 
                            airDensityFactor < 0.95 ? "Reduced drag, less downforce" : 
                            "Neutral effect",
          crosswindSensitivity: windSpeed > 20 ? 8 : windSpeed > 10 ? 5 : 3
        },
        enginePerformance: {
          airDensityFactor: airDensityFactor,
          coolingEfficiency: airTemp > 30 ? "Reduced" : airTemp < 10 ? "Excellent" : "Good",
          estimatedPowerChange: airDensityFactor > 1.05 ? "+2-5%" : 
                                airDensityFactor < 0.95 ? "-2-5%" : 
                                "Neutral",
          airIntakeTemperature: airTemp + (isDaytime && cloudCover < 50 ? 5 : 0),
          turboEfficiency: airDensityFactor > 1.05 ? 105 : airDensityFactor < 0.95 ? 95 : 100,
          optimalShiftPoints: {
            increase: airDensityFactor > 1.05 ? 5 : 0,
            decrease: airDensityFactor < 0.95 ? 5 : 0
          }
        },
        brakingPerformance: {
          coolingEfficiency: airTemp > 30 ? "Reduced" : airTemp < 10 ? "Excellent" : "Good",
          estimatedOptimalTemperature: 450, // °C
          paddleDegradation: hasRain ? 3 : hasSnow ? 1 : airTemp > 30 ? 7 : 5,
          brakingPointAdjustment: hasRain ? 10 : hasSnow ? 30 : 0 // meters earlier
        }
      }
    };
  } catch (error) {
    console.error('Error calculating automotive weather data:', error);
    // Return null or throw an error, depending on your error handling strategy
    throw error;
  }
}