import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Weather API proxy routes
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, units } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
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

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
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

  app.get('/api/location', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY || "default_key";
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

  const httpServer = createServer(app);

  return httpServer;
}
