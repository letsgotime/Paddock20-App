import { Router } from "express";
import axios from "axios";

const router = Router();

// Get current weather data for a city
router.get("/current", async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenWeather API key is not configured" });
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching current weather:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch weather data",
      details: error.response?.data?.message || error.message
    });
  }
});

// Get 5-day forecast for a city
router.get("/forecast", async (req, res) => {
  try {
    const { city } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenWeather API key is not configured" });
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching forecast:", error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch forecast data",
      details: error.response?.data?.message || error.message
    });
  }
});

export default router;