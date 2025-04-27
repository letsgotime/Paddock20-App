import { Router } from 'express';

const router = Router();

// Route to get the OpenWeather API key
router.get('/api/weather-key', (req, res) => {
  // Send the API key from server environment
  res.json({ apiKey: process.env.OPENWEATHER_API_KEY });
});

export default router;