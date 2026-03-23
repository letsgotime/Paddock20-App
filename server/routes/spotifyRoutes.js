const express = require('express');
const router = express.Router();
const axios = require('axios');

// Spotify API endpoints
router.get('/api/spotify/weather-playlists', async (req, res) => {
  try {
    // Get query parameters from the request
    const { condition, temperature, isDay } = req.query;
    
    // Check if required parameters are present
    if (!condition) {
      return res.status(400).json({ error: 'Missing weather condition parameter' });
    }
    
    // Convert parameters to appropriate types
    const weatherCondition = condition.toLowerCase();
    const temp = temperature ? parseFloat(temperature) : 70; // Default to 70°F if not provided
    const isDaytime = isDay === 'true'; // Convert string to boolean
    
    // Determine mood/genre based on weather condition and time of day
    let searchTerms = '';
    let energyLevel = 0.5; // Default energy level (0.0 to 1.0)
    
    // Match weather conditions to appropriate playlist themes
    if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
      searchTerms = isDaytime ? 'summer driving playlist upbeat' : 'night drive chill playlist';
      energyLevel = isDaytime ? 0.8 : 0.5;
    } else if (weatherCondition.includes('cloud')) {
      searchTerms = 'indie atmospheric driving playlist';
      energyLevel = 0.6;
    } else if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
      searchTerms = 'rainy day driving playlist';
      energyLevel = 0.4;
    } else if (weatherCondition.includes('snow')) {
      searchTerms = 'winter driving playlist';
      energyLevel = 0.5;
    } else if (weatherCondition.includes('storm') || weatherCondition.includes('thunder')) {
      searchTerms = 'dramatic driving playlist';
      energyLevel = 0.7;
    } else if (weatherCondition.includes('fog') || weatherCondition.includes('mist')) {
      searchTerms = 'ambient driving playlist';
      energyLevel = 0.3;
    } else {
      // Default search terms if no specific weather condition is matched
      searchTerms = 'classic driving playlist';
      energyLevel = 0.6;
    }
    
    // Adjust energy level based on temperature
    if (temp > 85) {
      energyLevel += 0.1; // Hotter weather = more energetic music
      searchTerms += ' summer';
    } else if (temp < 40) {
      energyLevel -= 0.1; // Colder weather = more mellow music
      searchTerms += ' winter';
    }
    
    // Make sure energy level stays within 0-1 range
    energyLevel = Math.max(0, Math.min(1, energyLevel));
    
    // Check if we have the Spotify API credentials
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({ 
        error: 'Spotify API credentials are not configured',
        mockResponse: true,
        message: 'Would call Spotify API with search terms: ' + searchTerms
      });
    }
    
    // Get the Spotify access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      }
    });
    
    const accessToken = tokenResponse.data.access_token;
    
    // Search for playlists based on the search terms
    const playlistResponse = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      params: {
        q: searchTerms,
        type: 'playlist',
        limit: 10
      },
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });
    
    // Extract and format the playlists data
    const playlists = playlistResponse.data.playlists.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      imageUrl: item.images.length > 0 ? item.images[0].url : '',
      uri: item.uri,
      weatherType: weatherCondition,
      energyLevel: energyLevel,
      popularity: item.popularity || 50
    }));
    
    return res.json(playlists);
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error.message);
    return res.status(500).json({ error: 'Failed to fetch Spotify playlists' });
  }
});

module.exports = router;