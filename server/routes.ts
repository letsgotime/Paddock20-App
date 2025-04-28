import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertTireSchema, 
  insertMaintenanceRecordSchema, 
  insertMaintenanceFlagSchema, 
  insertGlossTrackingSchema,
  insertGlossLogSchema
} from "@shared/schema";

// OpenWeather API key - updated April 28, 2025
const OPENWEATHER_API_KEY = "2379a18ee0e478c88aa7d4aa1df44410";

export async function registerRoutes(app: Express): Promise<Server> {
  // Using only OpenWeather API for all weather services
  
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use the OpenWeather API key constant
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
      console.log(`Fetching OpenWeather data for: ${lat},${lon}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/forecast', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use the OpenWeather API key constant 
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('OpenWeather Forecast API error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch forecast data' });
    }
  });
  
  // OneCall API 3.0 route - direct implementation
  app.get('/api/onecall', async (req, res) => {
    try {
      const { lat, lon, units, exclude } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      // Use the OpenWeather API key constant 
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units || 'metric'}${exclude ? `&exclude=${exclude}` : ''}&appid=${OPENWEATHER_API_KEY}`;
      
      console.log(`Fetching OneCall 3.0 data for: ${lat},${lon}`);
      const oneCallResponse = await fetch(oneCallUrl);
      
      // Check if we can use the 3.0 API with our key (it might require subscription)
      if (oneCallResponse.ok) {
        const oneCallData = await oneCallResponse.json();
        return res.json(oneCallData);
      } else {
        console.log(`OneCall 3.0 API error: ${oneCallResponse.status}. Falling back to 2.5 API...`);
        
        // Fallback to 2.5 API implementation with data combination
        // Get current weather data first
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
        const currentResponse = await fetch(currentWeatherUrl);
        
        if (!currentResponse.ok) {
          throw new Error(`Current weather API error: ${currentResponse.status} - ${await currentResponse.text()}`);
        }
        
        const currentData = await currentResponse.json();
        
        // Get forecast data
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        
        if (!forecastResponse.ok) {
          throw new Error(`Forecast API error: ${forecastResponse.status} - ${await forecastResponse.text()}`);
        }
        
        const forecastData = await forecastResponse.json();
      
        // Construct a response mimicking the OneCall API structure
        // This will allow the frontend to continue working without major changes
        const combinedData = {
          lat: Number(lat),
          lon: Number(lon),
          timezone: currentData.timezone,
          timezone_offset: currentData.timezone,
          current: {
            dt: currentData.dt,
            sunrise: currentData.sys.sunrise,
            sunset: currentData.sys.sunset,
            temp: currentData.main.temp,
            feels_like: currentData.main.feels_like,
            pressure: currentData.main.pressure,
            humidity: currentData.main.humidity,
            dew_point: currentData.main.temp - ((100 - currentData.main.humidity) / 5),
            uvi: 0, // Approximation since UVI isn't available in basic API
            clouds: currentData.clouds.all,
            visibility: currentData.visibility,
            wind_speed: currentData.wind.speed,
            wind_deg: currentData.wind.deg,
            weather: currentData.weather
          },
          hourly: forecastData.list.slice(0, 24).map(item => ({
            dt: item.dt,
            temp: item.main.temp,
            feels_like: item.main.feels_like,
            pressure: item.main.pressure,
            humidity: item.main.humidity,
            dew_point: item.main.temp - ((100 - item.main.humidity) / 5),
            uvi: 0,
            clouds: item.clouds.all,
            visibility: item.visibility,
            wind_speed: item.wind.speed,
            wind_deg: item.wind.deg,
            weather: item.weather,
            pop: item.pop
          })),
          daily: []
        };
        
        // Create approximated daily forecast by grouping the 3-hour forecasts by day
        const dailyMap = {};
        
        forecastData.list.forEach(item => {
          const date = new Date(item.dt * 1000).toISOString().split('T')[0];
          
          if (!dailyMap[date]) {
            dailyMap[date] = {
              temps: [],
              weather: [],
              dt: item.dt
            };
          }
          
          dailyMap[date].temps.push(item.main.temp);
          dailyMap[date].weather.push(item.weather[0]);
        });
        
        // Convert to array and format for daily response
        combinedData.daily = Object.values(dailyMap).map((day: any) => {
          // Find most common weather condition for the day
          const weatherFrequency = {};
          day.weather.forEach(w => {
            if (!weatherFrequency[w.id]) weatherFrequency[w.id] = 0;
            weatherFrequency[w.id]++;
          });
          
          const mostCommonWeatherId = Object.keys(weatherFrequency).reduce((a, b) => 
            weatherFrequency[a] > weatherFrequency[b] ? a : b
          );
          
          const dayWeather = day.weather.find(w => w.id.toString() === mostCommonWeatherId);
          
          return {
            dt: day.dt,
            sunrise: currentData.sys.sunrise, // Approximate
            sunset: currentData.sys.sunset,   // Approximate
            temp: {
              day: day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length,
              min: Math.min(...day.temps),
              max: Math.max(...day.temps),
              night: day.temps[day.temps.length - 1] || day.temps[0],
              eve: day.temps[Math.floor(day.temps.length * 0.7)] || day.temps[0],
              morn: day.temps[0]
            },
            weather: [dayWeather]
          };
        });
        
        res.json(combinedData);
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });
  
  // Advanced F1-style Automotive Weather Data endpoint (combines multiple APIs)
  app.get('/api/automotive-weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      
      // Get current weather and forecast data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${OPENWEATHER_API_KEY}`;
      
      // Parallel API requests for maximum efficiency
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);
      
      // Check for errors and process responses
      if (!weatherResponse.ok) {
        const errorText = await weatherResponse.text();
        throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
      }
      
      if (!forecastResponse.ok) {
        const errorText = await forecastResponse.text();
        throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorText}`);
      }
      
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      
      // Extract base weather data
      const airTemp = weatherData.main.temp;
      const isDaytime = new Date().getHours() > 6 && new Date().getHours() < 20;
      const cloudCover = weatherData.clouds?.all || 0;
      const hasRain = weatherData.weather.some((w) => 
        w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Thunderstorm');
      const hasSnow = weatherData.weather.some((w) => w.main === 'Snow');
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
      const next24hForecasts = forecastData.list.filter((f) => {
        const forecastTime = new Date(f.dt * 1000);
        const now = new Date();
        const hoursDiff = (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursDiff >= 0 && hoursDiff <= 24;
      });
      
      const rainProbNext24h = next24hForecasts.length > 0 
        ? Math.max(...next24hForecasts.map((f) => f.pop * 100))
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
      
      // Compile the automotive weather data
      const automotiveWeatherData = {
        timestamp: Date.now(),
        location: {
          lat: Number(lat),
          lon: Number(lon),
          timezone: weatherData.timezone,
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
              rear: hasRain ? "High" : "Maximum"
            },
            airDensityImpact: airDensityFactor > 1.05 ? "Higher engine power, better cooling" : 
                              airDensityFactor < 0.95 ? "Reduced engine power, monitor temperatures" : 
                              "Nominal engine performance"
          },
          enginePerformance: {
            airDensityFactor: airDensityFactor,
            coolingEfficiency: airTemp < 15 ? "Excellent" : airTemp < 25 ? "Good" : airTemp < 35 ? "Moderate" : "Poor",
            estimatedPowerChange: airDensityFactor > 1.05 ? "+3-5%" : airDensityFactor < 0.95 ? "-3-5%" : "Nominal"
          },
          brakingPerformance: {
            coolingEfficiency: airTemp < 20 ? "Excellent" : airTemp < 30 ? "Good" : "Moderate",
            estimatedOptimalTemperature: airTemp < 15 ? 350 : 400
          }
        }
      };
      
      // Return the automotive weather data
      res.json(automotiveWeatherData);
    } catch (error) {
      console.error('Error fetching automotive weather data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch automotive weather data' });
    }
  });
  
  // Weather API key endpoint (safe version that doesn't expose full key)
  app.get('/api/weather-key', (req, res) => {
    res.json({ key: OPENWEATHER_API_KEY.substring(0, 5) + '...' });
  });

  // Database CRUD routes for vehicle management
  app.get('/api/vehicles', async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicles' });
    }
  });

  // Default redirect for development
  app.get('/', (req, res) => {
    res.redirect('/');
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}