/**
 * OpenWeather Service
 * Direct integration with OpenWeather API
 */

const API_BASE_URL = '/api';

// Get current weather for a location
export async function getWeatherData(location, unit = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&units=${unit}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch current weather data:', error);
    throw error;
  }
}

// Get weather forecast for a location
export async function getForecastData(location, unit = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&units=${unit}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch forecast data:', error);
    throw error;
  }
}

// Get one-call data (current, minutely, hourly, daily)
export async function getOneCallData(location, unit = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/onecall?lat=${location.lat}&lon=${location.lon}&units=${unit}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch one-call data:', error);
    throw error;
  }
}

// Get automotive-specific weather data
export async function getAutomotiveWeatherData(location, unit = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/automotive-weather?lat=${location.lat}&lon=${location.lon}&units=${unit}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch automotive weather data:', error);
    throw error;
  }
}

// Get complete weather data package
export async function getAllWeatherData(location, unit = 'imperial') {
  try {
    const [current, forecast, oneCall, automotive] = await Promise.all([
      getWeatherData(location, unit),
      getForecastData(location, unit),
      getOneCallData(location, unit),
      getAutomotiveWeatherData(location, unit)
    ]);
    
    return {
      current,
      forecast,
      oneCall,
      automotive
    };
  } catch (error) {
    console.error('Failed to fetch all weather data:', error);
    throw error;
  }
}

// Function expected by existing components
export async function fetchAutomotiveWeather(lat, lon, units = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/automotive-weather?lat=${lat}&lon=${lon}&units=${units}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch automotive weather data:', error);
    throw error;
  }
}

// Compatibility function for old code
export async function fetchCurrentWeather(lat, lon, units = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch current weather data:', error);
    throw error;
  }
}

// Compatibility function for old code
export async function fetchForecast(lat, lon, units = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch forecast data:', error);
    throw error;
  }
}

// Compatibility function for old code
export async function fetchOneCall(lat, lon, units = 'imperial') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/onecall?lat=${lat}&lon=${lon}&units=${units}`
    );
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch one-call data:', error);
    throw error;
  }
}

// Compatibility function for old code
export async function fetchAllWeatherData(lat, lon, units = 'imperial') {
  try {
    const [current, forecast, oneCall, automotive] = await Promise.all([
      fetchCurrentWeather(lat, lon, units),
      fetchForecast(lat, lon, units),
      fetchOneCall(lat, lon, units),
      fetchAutomotiveWeather(lat, lon, units)
    ]);
    
    return {
      current,
      forecast,
      oneCall,
      automotive
    };
  } catch (error) {
    console.error('Failed to fetch all weather data:', error);
    throw error;
  }
}

// Default Charlotte, NC coordinates
export const defaultLocation = {
  id: '1',
  name: 'Charlotte',
  lat: 35.2271,
  lon: -80.8431
};

// Format temperature for display with unit
export function formatTemperature(temp, unit) {
  return `${Math.round(temp)}°${unit === 'imperial' ? 'F' : 'C'}`;
}

// Convert Unix timestamp to formatted time
export function formatTime(unixTime, options = {}) {
  const date = new Date(unixTime * 1000);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    ...options
  });
}

// Get weather icon URL
export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}