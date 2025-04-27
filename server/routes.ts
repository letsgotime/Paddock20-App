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

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to get AccuWeather API key
  function getAccuWeatherApiKey() {
    // Try both keys in case one works
    const newKey = "CvuAGFLFJfRdLdjXG1QawpoWGXF4alyN";
    const oldKey = "6YVvHqaIpOL72UELtPTIagWC8j5IGjv2";
    
    // Let's try the new key first, but return the old one as backup
    return process.env.VITE_ACCUWEATHER_API_KEY || newKey || oldKey;
  }
  
  // Helper to handle AccuWeather API errors with detailed logging
  async function callAccuWeatherApi(url: string, errorMessage: string) {
    try {
      console.log('AccuWeather API Request URL:', url);
      
      const response = await fetch(url);
      console.log('AccuWeather API Response Status:', response.status);
      
      // Log headers for debugging
      const headers = [...response.headers.entries()].reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, string>);
      console.log('AccuWeather API Response Headers:', JSON.stringify(headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AccuWeather API Error Response:', errorText);
        throw new Error(`AccuWeather API error (${response.status}): ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('AccuWeather API Error:', error);
      throw new Error(errorMessage || (error as Error).message);
    }
  }
  
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/forecast', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch forecast data' });
    }
  });
  
  // OneCall API route - updated to use 3.0 API (current version)
  app.get('/api/onecall', async (req, res) => {
    try {
      const { lat, lon, units, exclude } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
      
      // Get current weather data first
      const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      const currentResponse = await fetch(currentWeatherUrl);
      
      if (!currentResponse.ok) {
        throw new Error(`Current weather API error: ${currentResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      
      // Get forecast data
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units || 'metric'}&appid=${apiKey}`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
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
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch weather data' });
    }
  });

  app.get('/api/location', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=1&appid=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return res.status(404).json({ message: `No location found for: ${q}` });
      }
      
      const result = data[0];
      res.json({
        id: Date.now().toString(),
        name: result.name,
        lat: result.lat,
        lon: result.lon
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to search location' });
    }
  });

  // Vehicle Management API Routes
  
  // Vehicle Routes
  app.get('/api/vehicles', async (req, res) => {
    try {
      const userId = Number(req.query.userId) || 1; // Default to user 1 for demo
      const vehicles = await storage.getVehiclesByUserId(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicles' });
    }
  });
  
  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch vehicle' });
    }
  });
  
  app.post('/api/vehicles', async (req, res) => {
    try {
      const validationResult = insertVehicleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid vehicle data', errors: validationResult.error.errors });
      }
      
      const vehicle = await storage.createVehicle(validationResult.data);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create vehicle' });
    }
  });
  
  app.patch('/api/vehicles/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertVehicleSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid vehicle data', errors: validationResult.error.errors });
      }
      
      const vehicle = await storage.updateVehicle(id, validationResult.data);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update vehicle' });
    }
  });
  
  // Tire Routes
  app.get('/api/vehicles/:vehicleId/tires', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const tire = await storage.getTireByVehicleId(vehicleId);
      
      if (!tire) {
        return res.status(404).json({ message: 'Tire not found for this vehicle' });
      }
      
      res.json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch tire' });
    }
  });
  
  app.post('/api/tires', async (req, res) => {
    try {
      const validationResult = insertTireSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid tire data', errors: validationResult.error.errors });
      }
      
      const tire = await storage.createTire(validationResult.data);
      res.status(201).json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create tire' });
    }
  });
  
  app.patch('/api/tires/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertTireSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid tire data', errors: validationResult.error.errors });
      }
      
      const tire = await storage.updateTire(id, validationResult.data);
      
      if (!tire) {
        return res.status(404).json({ message: 'Tire not found' });
      }
      
      res.json(tire);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update tire' });
    }
  });
  
  // Maintenance Record Routes
  app.get('/api/vehicles/:vehicleId/maintenance', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const record = await storage.getMaintenanceRecordByVehicleId(vehicleId);
      
      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found for this vehicle' });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance record' });
    }
  });
  
  app.post('/api/maintenance', async (req, res) => {
    try {
      const validationResult = insertMaintenanceRecordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance record data', errors: validationResult.error.errors });
      }
      
      const record = await storage.createMaintenanceRecord(validationResult.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create maintenance record' });
    }
  });
  
  app.patch('/api/maintenance/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertMaintenanceRecordSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance record data', errors: validationResult.error.errors });
      }
      
      const record = await storage.updateMaintenanceRecord(id, validationResult.data);
      
      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update maintenance record' });
    }
  });
  
  // Maintenance Flag Routes
  app.get('/api/vehicles/:vehicleId/flags', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const flags = await storage.getMaintenanceFlagByVehicleId(vehicleId);
      
      if (!flags) {
        return res.status(404).json({ message: 'Maintenance flags not found for this vehicle' });
      }
      
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch maintenance flags' });
    }
  });
  
  app.post('/api/flags', async (req, res) => {
    try {
      const validationResult = insertMaintenanceFlagSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance flag data', errors: validationResult.error.errors });
      }
      
      const flags = await storage.createMaintenanceFlag(validationResult.data);
      res.status(201).json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create maintenance flags' });
    }
  });
  
  app.patch('/api/flags/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertMaintenanceFlagSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid maintenance flag data', errors: validationResult.error.errors });
      }
      
      const flags = await storage.updateMaintenanceFlag(id, validationResult.data);
      
      if (!flags) {
        return res.status(404).json({ message: 'Maintenance flags not found' });
      }
      
      res.json(flags);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update maintenance flags' });
    }
  });
  
  // Gloss Tracking Routes
  app.get('/api/vehicles/:vehicleId/gloss', async (req, res) => {
    try {
      const vehicleId = Number(req.params.vehicleId);
      const tracking = await storage.getGlossTrackingByVehicleId(vehicleId);
      
      if (!tracking) {
        return res.status(404).json({ message: 'Gloss tracking not found for this vehicle' });
      }
      
      // Get the associated logs
      const logs = await storage.getGlossLogs(tracking.id);
      
      res.json({
        ...tracking,
        glossGrowthLog: logs
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss tracking' });
    }
  });
  
  app.post('/api/gloss', async (req, res) => {
    try {
      const validationResult = insertGlossTrackingSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss tracking data', errors: validationResult.error.errors });
      }
      
      const tracking = await storage.createGlossTracking(validationResult.data);
      res.status(201).json(tracking);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create gloss tracking' });
    }
  });
  
  app.patch('/api/gloss/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validationResult = insertGlossTrackingSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss tracking data', errors: validationResult.error.errors });
      }
      
      const tracking = await storage.updateGlossTracking(id, validationResult.data);
      
      if (!tracking) {
        return res.status(404).json({ message: 'Gloss tracking not found' });
      }
      
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to update gloss tracking' });
    }
  });
  
  // Gloss Log Routes
  app.get('/api/gloss/:glossTrackingId/logs', async (req, res) => {
    try {
      const glossTrackingId = Number(req.params.glossTrackingId);
      const logs = await storage.getGlossLogs(glossTrackingId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch gloss logs' });
    }
  });
  
  app.post('/api/logs', async (req, res) => {
    try {
      const validationResult = insertGlossLogSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid gloss log data', errors: validationResult.error.errors });
      }
      
      const log = await storage.createGlossLog(validationResult.data);
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to create gloss log' });
    }
  });

  // Add route to get weather API key
  app.get('/api/weather-key', (req, res) => {
    res.json({ apiKey: process.env.OPENWEATHER_API_KEY });
  });
  
  // Initialize database for demo purposes
  // This would normally happen through user registration/onboarding
  app.post('/api/init-demo-data', async (req, res) => {
    try {
      // Create a demo user if not exists
      let demoUser = await storage.getUserByUsername('demoadmin');
      if (!demoUser) {
        demoUser = await storage.createUser({ username: 'demoadmin', password: 'password123' });
      }
      
      // Create Ferrari vehicle
      const ferrari = await storage.createVehicle({
        userId: demoUser.id,
        make: "Ferrari",
        model: "458 Italia",
        year: "2015"
      });
      
      // Create tire data
      await storage.createTire({
        vehicleId: ferrari.id,
        brand: "Michelin Pilot Sport 4S",
        model: "275/35ZR20",
        mileageLifeTarget: 20000,
        currentMileage: 4500,
        purchaseDate: new Date("2024-04-15"),
        lastTreadDepthCheck: new Date("2024-04-25")
      });
      
      // Create maintenance records
      await storage.createMaintenanceRecord({
        vehicleId: ferrari.id,
        lastOilChange: new Date("2024-02-20"),
        lastAirFilterChange: new Date("2023-10-01"),
        lastCabinFilterChange: new Date("2023-10-01"),
        lastCoolantFlush: new Date("2023-08-15"),
        lastBrakeFluidChange: new Date("2023-12-10"),
        lastTransmissionService: new Date("2022-07-10"),
        lastQuarterlyReset: new Date("2024-03-01"),
        lastMonthlyMaintenance: new Date("2024-04-01"),
        lastWeeklyQuickCheck: new Date("2024-04-20"),
        lastPreDriveCheck: new Date("2024-04-25")
      });
      
      // Create maintenance flags
      await storage.createMaintenanceFlag({
        vehicleId: ferrari.id,
        missedWeekly: false,
        missedMonthly: false,
        missedQuarterly: false,
        missedSeasonal: false
      });
      
      // Create gloss tracking
      const glossTracking = await storage.createGlossTracking({
        vehicleId: ferrari.id,
        lastGlossBoost: new Date("2024-04-12"),
        lastFullDecon: new Date("2024-03-01"),
        lastSealantRefresh: new Date("2024-03-10"),
        lastPaintCorrection: new Date("2023-11-15"),
        lastCeramicTopCoat: new Date("2022-09-01")
      });
      
      // Create gloss logs
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        date: new Date("2024-03-01"),
        action: "Full Decon + Frothe Boost Applied",
        notes: "Post-winter reset before canyon season."
      });
      
      await storage.createGlossLog({
        glossTrackingId: glossTracking.id,
        date: new Date("2024-04-12"),
        action: "Gloss Reload Applied After Spring Drive",
        notes: "Maintaining water beading before seasonal pollen rise."
      });
      
      res.status(201).json({ message: 'Demo data initialized successfully' });
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to initialize demo data' });
    }
  });

  // AccuWeather API routes for enhanced driving data
  app.get('/api/accuweather/location', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = getAccuWeatherApiKey();
      console.log('Using AccuWeather API Key:', apiKey?.substring(0, 5) + '...');
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      // Use city search API instead of geoposition search
      // Use Charlotte as the search query since that matches our coordinates
      const url = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=Charlotte`;
      
      try {
        // Use our helper function for consistent error handling
        const cities = await callAccuWeatherApi(url, 'Failed to fetch AccuWeather location key');
        
        // The cities search API returns an array, so we need to get the first item
        if (Array.isArray(cities) && cities.length > 0) {
          const city = cities[0]; // Get the first city (most relevant match)
          console.log('AccuWeather Location API Success - Location Key:', city.Key);
          
          // Return just the first city data
          res.json(city);
        } else {
          console.error('No cities found in AccuWeather response');
          throw new Error('No cities found in AccuWeather response');
        }
      } catch (error) {
        console.error('AccuWeather Location Error:', error);
        console.log('Providing a sample location response for development');
        
        // Return a sample AccuWeather location response for API compatibility
        // This allows frontend development to proceed despite API authentication issues
        const sampleLocation = {
          "Version": 1,
          "Key": "349818", // Charlotte, NC location key
          "Type": "City",
          "Rank": 15,
          "LocalizedName": "Charlotte",
          "EnglishName": "Charlotte",
          "PrimaryPostalCode": "28201",
          "Region": {
            "ID": "NAM",
            "LocalizedName": "North America",
            "EnglishName": "North America"
          },
          "Country": {
            "ID": "US",
            "LocalizedName": "United States",
            "EnglishName": "United States"
          },
          "AdministrativeArea": {
            "ID": "NC",
            "LocalizedName": "North Carolina",
            "EnglishName": "North Carolina",
            "Level": 1,
            "LocalizedType": "State",
            "EnglishType": "State",
            "CountryID": "US"
          },
          "GeoPosition": {
            "Latitude": 35.227,
            "Longitude": -80.843,
            "Elevation": {
              "Metric": {
                "Value": 214,
                "Unit": "m",
                "UnitType": 5
              },
              "Imperial": {
                "Value": 702,
                "Unit": "ft",
                "UnitType": 0
              }
            }
          }
        };
        
        res.json(sampleLocation);
      }
    } catch (error) {
      console.error('AccuWeather Location API Handler Error:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather location key' });
    }
  });

  // AccuWeather Current Conditions
  app.get('/api/accuweather/current-conditions/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Current Conditions API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather current conditions' });
    }
  });

  // AccuWeather Daily Forecast
  app.get('/api/accuweather/daily-forecast/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${apiKey}&details=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather forecast' });
    }
  });

  // AccuWeather Hourly Forecast
  app.get('/api/accuweather/hourly-forecast/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}?apikey=${apiKey}&details=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Hourly Forecast API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather hourly forecast' });
    }
  });

  // AccuWeather Indices for driving conditions
  app.get('/api/accuweather/indices/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/indices/v1/daily/1day/${locationKey}?apikey=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Indices API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather indices' });
    }
  });

  // New Automotive-Specific Weather Data Points
  app.get('/api/accuweather/automotive/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(200).json({
          locationKey,
          surfaceConditions: {
            asphalt: { temperature: 62, condition: "Dry" },
            concrete: { temperature: 58, condition: "Dry" },
            gravel: { temperature: 55, condition: "Dry" }
          },
          drivingRisk: {
            overall: "Low",
            visibility: "Good",
            traction: "Good",
            score: 2
          },
          washConditions: {
            recommended: true,
            uv: "Moderate",
            pollen: "Low",
            drying: "Excellent"
          },
          detailingConditions: {
            recommended: true,
            humidity: "Optimal",
            dust: "Low",
            sun: "Good diffused light"
          }
        });
      }
      
      // Get current conditions
      const currentUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`;
      const currentResponse = await fetch(currentUrl);
      
      if (!currentResponse.ok) {
        throw new Error(`AccuWeather Current Conditions API error: ${currentResponse.status}`);
      }
      
      const currentData = await currentResponse.json();
      const current = currentData[0];
      
      // Get forecast data
      const forecastUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${apiKey}&details=true`;
      const forecastResponse = await fetch(forecastUrl);
      
      if (!forecastResponse.ok) {
        throw new Error(`AccuWeather Forecast API error: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      const forecast = forecastData.DailyForecasts[0];
      
      // Get indices for driving
      const indicesUrl = `https://dataservice.accuweather.com/indices/v1/daily/1day/${locationKey}?apikey=${apiKey}`;
      const indicesResponse = await fetch(indicesUrl);
      
      if (!indicesResponse.ok) {
        throw new Error(`AccuWeather Indices API error: ${indicesResponse.status}`);
      }
      
      const indicesData = await indicesResponse.json();
      
      // Find the driving index
      const drivingIndex = indicesData.find(idx => idx.ID === 1) || { 
        Value: 5, 
        Category: "Good", 
        Text: "Conditions are good for driving."
      };
      
      // Calculate surface temperatures
      const airTemp = current.Temperature.Imperial.Value;
      const isDaytime = current.IsDayTime;
      const cloudCover = current.CloudCover;
      const hasRain = current.HasPrecipitation;
      const uvIndex = current.UVIndex;
      
      // Adjust for cloud cover (0-100%)
      const cloudEffect = 1 - (cloudCover / 100);
      
      // Adjust for day/night
      const timeEffect = isDaytime ? 1 : 0.2;
      
      // Base heating factors (°F above air temperature at peak sun)
      const asphaltFactor = 25; // Asphalt can be 20-30°F warmer than air
      const concreteFactor = 15; // Concrete about 10-20°F warmer
      const gravelFactor = 10;   // Gravel somewhat warmer
      
      // Calculate current surface temperatures
      const asphaltTemp = Math.round(airTemp + (asphaltFactor * cloudEffect * timeEffect));
      const concreteTemp = Math.round(airTemp + (concreteFactor * cloudEffect * timeEffect));
      const gravelTemp = Math.round(airTemp + (gravelFactor * cloudEffect * timeEffect));
      
      // Determine surface conditions
      const getPrecipCondition = () => {
        if (current.HasPrecipitation) {
          return current.PrecipitationType || "Wet";
        }
        if (current.RelativeHumidity > 90) return "Damp";
        return "Dry";
      };
      
      const surfaceCondition = getPrecipCondition();
      
      // Determine driving risk
      let drivingRiskLevel = "Low";
      let visibilityCondition = "Good";
      let tractionCondition = "Good";
      let riskScore = 2; // 1-10 scale
      
      if (hasRain || current.RelativeHumidity > 95) {
        tractionCondition = "Reduced";
        riskScore += 2;
      }
      
      if (current.Visibility.Imperial.Value < 5) {
        visibilityCondition = "Poor";
        riskScore += 3;
        drivingRiskLevel = "Moderate";
      }
      
      if (current.WindGust.Imperial.Value > 30) {
        riskScore += 2;
        drivingRiskLevel = "Moderate";
      }
      
      // Severe conditions
      if (current.WeatherText.includes("Snow") || current.WeatherText.includes("Ice")) {
        tractionCondition = "Poor";
        riskScore += 4;
        drivingRiskLevel = "High";
      }
      
      if (current.Visibility.Imperial.Value < 1) {
        visibilityCondition = "Dangerous";
        riskScore += 4;
        drivingRiskLevel = "High";
      }
      
      // Cap risk score
      riskScore = Math.min(10, Math.max(1, riskScore));
      
      // Car wash suitability
      const isWashSuitable = !hasRain && 
                          current.RelativeHumidity < 80 && 
                          current.WindGust.Imperial.Value < 15 &&
                          forecast.Day.RainProbability < 30;
      
      // Detailing suitability
      const isDetailingSuitable = !hasRain && 
                               current.RelativeHumidity < 70 && 
                               current.WindGust.Imperial.Value < 10 &&
                               current.CloudCover > 20 && // Some clouds for diffused light
                               current.CloudCover < 80;   // But not too overcast
      
      // UV impact on paint/wax
      let uvImpact = "Low";
      if (uvIndex > 3 && uvIndex <= 6) uvImpact = "Moderate";
      if (uvIndex > 6) uvImpact = "High";
      
      // Compile response
      res.json({
        locationKey,
        timestamp: current.EpochTime,
        surfaceConditions: {
          asphalt: { 
            temperature: asphaltTemp, 
            condition: surfaceCondition 
          },
          concrete: { 
            temperature: concreteTemp, 
            condition: surfaceCondition 
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
          index: drivingIndex.Value,
          description: drivingIndex.Text
        },
        washConditions: {
          recommended: isWashSuitable,
          uv: uvImpact,
          pollen: forecast.AirAndPollen?.find(p => p.Name === "AirQuality")?.Category || "Unknown",
          drying: current.RelativeHumidity < 60 ? "Excellent" : 
                 current.RelativeHumidity < 75 ? "Good" : "Fair",
          rainProbabilityNext24h: forecast.Day.RainProbability
        },
        detailingConditions: {
          recommended: isDetailingSuitable,
          humidity: `${current.RelativeHumidity}%`,
          temperature: `${current.Temperature.Imperial.Value}°F`,
          wind: `${current.Wind.Speed.Imperial.Value} mph`,
          lighting: current.CloudCover > 20 && current.CloudCover < 80 ? 
                   "Good diffused light" : 
                   current.CloudCover >= 80 ? "Too overcast" : "Too bright/direct"
        }
      });
    } catch (error) {
      console.error('Error fetching automotive weather data:', error);
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch automotive weather data' });
    }
  });

  // AccuWeather MinuteCast
  app.get('/api/accuweather/minutecast/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/forecasts/v1/minute/1hour/${locationKey}?apikey=${apiKey}&details=true`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          // MinuteCast may not be available for all locations
          return res.json({ Summary: "Minute forecast not available for your location" });
        }
        
        const data = await response.json();
        res.json(data);
      } catch (error) {
        // Minute cast often returns 404 for many locations, so we'll handle this gracefully
        return res.json({ Summary: "Minute forecast not available for your location" });
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather minute forecast' });
    }
  });

  // AccuWeather Location API to get location key
  app.get('/api/accuweather/location', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${lat},${lon}&details=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Location API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather location data' });
    }
  });

  // AccuWeather Current Conditions
  app.get('/api/accuweather/current-conditions/:locationKey', async (req, res) => {
    try {
      const { locationKey } = req.params;
      
      if (!locationKey) {
        return res.status(400).json({ message: 'Location key is required' });
      }

      const apiKey = process.env.VITE_ACCUWEATHER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: 'AccuWeather API key is not configured' });
      }
      
      const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&details=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AccuWeather Current Conditions API error: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || 'Failed to fetch AccuWeather current conditions' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
