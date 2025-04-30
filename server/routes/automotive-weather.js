/**
 * Specialized automotive-focused weather data API
 * Provides enhanced metrics specifically for driving enthusiasts
 */

const axios = require('axios');

// Cache management to limit API calls
const cache = {
  data: {},
  timestamp: {},
  CACHE_DURATION: 15 * 60 * 1000 // 15 minutes
};

/**
 * Retrieves enhanced automotive-focused weather data
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getAutomotiveWeather(req, res) {
  try {
    const { lat, lon, units = 'imperial' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log('Automotive weather API called with params:', req.query);

    // Check cache first
    const cacheKey = `${lat}-${lon}-${units}`;
    const now = Date.now();
    
    if (
      cache.data[cacheKey] && 
      cache.timestamp[cacheKey] && 
      now - cache.timestamp[cacheKey] < cache.CACHE_DURATION
    ) {
      console.log('Returning cached automotive weather data');
      return res.json(cache.data[cacheKey]);
    }

    // Need to fetch fresh data
    console.log(`Fetching weather data from OpenWeather for automotive calculations: lat=${lat}, lon=${lon}`);
    
    const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
    
    // Get multiple data sources for better calculations
    const [currentWeather, oneCall, forecast] = await Promise.all([
      // Current conditions
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`),
      
      // One Call API for more detailed data
      axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`),
      
      // Forecast for trend analysis
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`)
    ]);
    
    console.log('Successfully fetched weather data from OpenWeather');
    
    // Extract relevant data from responses
    const current = currentWeather.data;
    const oneCallData = oneCall.data;
    const forecastData = forecast.data;
    
    // Calculate automotive-specific weather metrics
    const automotiveData = calculateAutomotiveMetrics(current, oneCallData, forecastData, units);
    
    // Update cache
    cache.data[cacheKey] = automotiveData;
    cache.timestamp[cacheKey] = now;
    
    console.log('Successfully generated automotive weather data, sending response');
    res.json(automotiveData);
  } catch (error) {
    console.error('Error fetching automotive weather data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch automotive weather data',
      message: error.message
    });
  }
}

/**
 * Calculate enhanced driving-focused weather metrics
 */
function calculateAutomotiveMetrics(current, oneCall, forecast, units) {
  // Current standard weather data
  const airTemp = current.main.temp;
  const feelsLike = current.main.feels_like;
  const humidity = current.main.humidity;
  const pressure = current.main.pressure;
  const windSpeed = current.wind.speed;
  const windDegree = current.wind.deg;
  const cloudCover = current.clouds.all;
  const condition = current.weather[0].main;
  const visibility = current.visibility / 1000; // convert to km

  // Get rain and snow if available
  const rainVolume = current.rain ? current.rain['1h'] || 0 : 0;
  const snowVolume = current.snow ? current.snow['1h'] || 0 : 0;
  
  // Calculate track surface temperature
  const trackTemp = calculateTrackTemp(airTemp, cloudCover, condition, units);
  
  // UV Index from OneCall API if available
  const uvIndex = oneCall.current.uvi || 0;
  
  // Dew point
  const dewPoint = oneCall.current.dew_point || calculateDewPoint(airTemp, humidity, units);
  
  // Calculate grip level
  const gripIndex = calculateGripLevel(condition, trackTemp, humidity, rainVolume, snowVolume);
  
  // Calculate track evolution 
  const trackEvolution = calculateTrackEvolution(condition, rainVolume, snowVolume, cloudCover);
  
  // Tire data calculations
  const tireData = calculateTireMetrics(trackTemp, airTemp, condition, humidity, rainVolume);
  
  // Calculate performance impact metrics
  const performanceData = calculatePerformanceImpact(
    airTemp, 
    pressure, 
    humidity, 
    windSpeed, 
    windDegree, 
    condition, 
    visibility,
    rainVolume,
    snowVolume
  );
  
  // Precipitation probability from OneCall
  const precipProbability = oneCall.hourly[0].pop * 100; // Convert to percentage
  
  // Get forecast trend data
  const forecastTrend = analyzeForecastTrend(forecast);
  
  return {
    lat: current.coord.lat,
    lon: current.coord.lon,
    timezone: oneCall.timezone,
    timezone_offset: oneCall.timezone_offset,
    location: {
      name: current.name,
      country: current.sys.country
    },
    currentConditions: {
      dt: current.dt,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      temp: airTemp,
      feels_like: feelsLike,
      pressure,
      humidity,
      dew_point: dewPoint,
      uvi: uvIndex,
      clouds: cloudCover,
      visibility,
      wind_speed: windSpeed,
      wind_deg: windDegree,
      wind_direction: getWindDirection(windDegree),
      weather: current.weather,
      rain: rainVolume,
      snow: snowVolume,
      is_day: isDaytime(current.dt, current.sys.sunrise, current.sys.sunset)
    },
    drivingConditions: {
      track_temp: trackTemp,
      track_condition: gripIndex.condition,
      grip_index: gripIndex.index,
      grip_assessment: assessGrip(gripIndex.index),
      track_evolution: trackEvolution,
      track_evolution_trend: assessEvolution(trackEvolution),
      precipitation_probability: precipProbability,
      precipitation_intensity: assessPrecipitation(rainVolume, snowVolume),
    },
    tireData,
    performanceData,
    alertLevel: calculateAlertLevel(condition, visibility, windSpeed, rainVolume, snowVolume),
    drivingRecommendation: generateDrivingRecommendation(
      condition, 
      trackTemp, 
      gripIndex, 
      visibility, 
      performanceData.crosswind_effect
    ),
    forecastTrend
  };
}

/**
 * Calculate estimated track temperature based on weather conditions
 */
function calculateTrackTemp(airTemp, cloudCover, condition, units) {
  // Base calculation: track temp is generally warmer than air temp
  let trackTemp = airTemp;
  
  // Factor by which track warms above air temp depends on units
  const tempFactor = units === 'imperial' ? 20 : 11; // 20°F or 11°C
  
  // Sunlight warms the track (more with less cloud cover)
  const sunExposureFactor = (100 - cloudCover) / 100;
  
  if (condition === 'Clear') {
    // Clear sky - maximum heating
    trackTemp += tempFactor * sunExposureFactor;
  } else if (condition === 'Clouds' && cloudCover < 70) {
    // Partly cloudy still allows some heating
    trackTemp += (tempFactor / 2) * sunExposureFactor;
  }
  
  // Rain and snow cool the surface
  if (condition === 'Rain' || condition === 'Drizzle') {
    const rainCooling = units === 'imperial' ? 5 : 2.8; // 5°F or 2.8°C
    trackTemp -= rainCooling;
  }
  
  if (condition === 'Snow') {
    const freezingTemp = units === 'imperial' ? 32 : 0;
    trackTemp = Math.min(trackTemp, freezingTemp); // Snow keeps surface at or below freezing
  }
  
  return Math.round(trackTemp);
}

/**
 * Calculate grip level based on track conditions
 */
function calculateGripLevel(condition, trackTemp, humidity, rainVolume, snowVolume) {
  let gripIndex = 0;
  let gripCondition = 'Dry';
  
  // Conditions that affect grip
  if ((condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') && rainVolume > 0.5) {
    gripIndex = 40; // Wet conditions have poor grip
    gripCondition = 'Wet';
  } else if ((condition === 'Rain' || condition === 'Drizzle') && rainVolume > 0) {
    gripIndex = 60; // Light rain
    gripCondition = 'Damp';
  } else if (condition === 'Snow' || snowVolume > 0) {
    gripIndex = 20; // Snow has very poor grip
    gripCondition = 'Snow-covered';
  } else if (condition === 'Mist' || condition === 'Fog' || humidity > 90) {
    gripIndex = 70; // Damp has reduced grip
    gripCondition = 'Damp';
  } else {
    // Dry conditions, but temperature affects grip
    if (trackTemp >= 70 && trackTemp <= 110) {
      gripIndex = 100; // Ideal temperature range
      gripCondition = 'Optimal';
    } else if (trackTemp > 110) {
      gripIndex = 85; // Too hot - rubber degrades
      gripCondition = 'Hot';
    } else if (trackTemp >= 50) {
      gripIndex = 90; // Slightly cool
      gripCondition = 'Good';
    } else {
      gripIndex = 80; // Too cold
      gripCondition = 'Cold';
    }
  }
  
  return { index: gripIndex, condition: gripCondition };
}

/**
 * Calculate track evolution (rubber buildup)
 */
function calculateTrackEvolution(condition, rainVolume, snowVolume, cloudCover) {
  // Base evolution
  let evolution = 70;
  
  // Rain washes away rubber
  if ((condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') && rainVolume > 0.5) {
    evolution = 30; // Heavy rain washes away rubber
  } else if ((condition === 'Rain' || condition === 'Drizzle') && rainVolume > 0) {
    evolution = 50; // Light rain partially washes away rubber
  } else if (condition === 'Snow' || snowVolume > 0) {
    evolution = 20; // Snow/ice cover
  }
  
  return evolution;
}

/**
 * Calculate tire-related metrics
 */
function calculateTireMetrics(trackTemp, airTemp, condition, humidity, rainVolume) {
  // Base warmup times (minutes)
  let warmupTimes = {
    sport: 4,
    street: 7,
    all_season: 10
  };
  
  // Temperature adjustment
  let tempFactor = 1.0;
  
  if (airTemp < 40) {
    tempFactor = 1.7; // Cold makes it much harder to warm tires
  } else if (airTemp < 60) {
    tempFactor = 1.3; // Cool makes it harder to warm tires
  } else if (airTemp > 85) {
    tempFactor = 0.8; // Hot makes it easier to warm tires
  }
  
  // Condition adjustment
  let conditionFactor = 1.0;
  
  if ((condition === 'Rain' || condition === 'Drizzle') && rainVolume > 0) {
    conditionFactor = 1.5; // Wet makes it harder to warm tires
  } else if (condition === 'Snow') {
    conditionFactor = 2.0; // Snow makes it much harder to warm tires
  }
  
  // Calculate tire surface and core temperatures
  const tireSurfaceTemp = Math.round(trackTemp * 1.05);
  const tireCoreTemp = Math.round(trackTemp * 0.95);
  
  // Determine optimal tire compound
  let optimalCompound;
  
  if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
    optimalCompound = 'Wet';
  } else if (condition === 'Snow') {
    optimalCompound = 'Winter';
  } else if (trackTemp < 60) {
    optimalCompound = 'Soft';
  } else if (trackTemp > 100) {
    optimalCompound = 'Hard';
  } else {
    optimalCompound = 'Medium';
  }
  
  // Calculate adjusted warmup times
  for (const tireType in warmupTimes) {
    warmupTimes[tireType] = Math.round(warmupTimes[tireType] * tempFactor * conditionFactor);
  }
  
  // Estimated tire wear rate (1-10 scale, 10 being fastest wear)
  let tireWearRate = 5; // Default medium wear
  
  if (trackTemp > 100) {
    tireWearRate = 8; // Hot temps increase wear
  } else if (trackTemp < 40) {
    tireWearRate = 3; // Cold reduces wear but also grip
  }
  
  if (condition === 'Rain' || condition === 'Drizzle') {
    tireWearRate = 4; // Wet conditions generally reduce wear
  }
  
  return {
    tire_surface_temp: tireSurfaceTemp,
    tire_core_temp: tireCoreTemp,
    optimal_compound: optimalCompound,
    warmup_times: warmupTimes,
    wear_rate: tireWearRate,
    wear_pattern: getTireWearPattern(trackTemp, condition, humidity)
  };
}

/**
 * Calculate expected tire wear pattern
 */
function getTireWearPattern(trackTemp, condition, humidity) {
  if (condition === 'Rain' || condition === 'Drizzle') {
    return 'Even with reduced overall wear';
  }
  
  if (trackTemp > 100) {
    return 'Accelerated center wear with thermal degradation';
  }
  
  if (trackTemp < 40) {
    return 'Uneven wear with limited contact patch';
  }
  
  if (humidity > 80 && trackTemp > 70) {
    return 'Tendency toward shoulder wear in humid conditions';
  }
  
  return 'Balanced wear pattern expected';
}

/**
 * Calculate performance impact metrics
 */
function calculatePerformanceImpact(
  airTemp, 
  pressure, 
  humidity, 
  windSpeed, 
  windDegree, 
  condition, 
  visibility,
  rainVolume,
  snowVolume
) {
  // Calculate power adjustment based on air density
  // Standard conditions
  const standardTemp = 59; // 15°C or 59°F
  const standardPressure = 1013.25; // hPa
  const standardHumidity = 0; // Dry air
  
  // Simple air density calculation (simplified)
  const tempFactor = (standardTemp + 460) / (airTemp + 460); // Convert to Rankine
  const pressureFactor = pressure / standardPressure;
  const humidityFactor = 1 - (humidity / 100) * 0.02; // Simplified - humidity reduces air density
  
  const airDensityRatio = (tempFactor * pressureFactor * humidityFactor);
  
  // Power is roughly proportional to air density
  const powerChange = (airDensityRatio - 1) * 100;
  
  // Calculate braking efficiency
  let brakingEfficiency = 1.0;
  
  // Conditions that affect braking
  if ((condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') && rainVolume > 0.5) {
    brakingEfficiency = 0.7; // Wet conditions reduce braking significantly
  } else if ((condition === 'Rain' || condition === 'Drizzle') && rainVolume > 0) {
    brakingEfficiency = 0.8; // Light rain reduces braking
  } else if (condition === 'Snow' || snowVolume > 0) {
    brakingEfficiency = 0.4; // Snow severely reduces braking
  } else if (condition === 'Mist' || condition === 'Fog') {
    brakingEfficiency = 0.9; // Slightly reduced in damp conditions
  }
  
  // Calculate crosswind effect
  let crosswindEffect;
  
  if (windSpeed < 5) {
    crosswindEffect = 'Negligible';
  } else if (windSpeed < 10) {
    crosswindEffect = 'Minimal';
  } else if (windSpeed < 15) {
    crosswindEffect = 'Moderate';
  } else if (windSpeed < 25) {
    crosswindEffect = 'Significant';
  } else {
    crosswindEffect = 'Severe';
  }
  
  // Assess visibility
  let visibilityAssessment;
  
  if (condition === 'Fog' || condition === 'Mist') {
    visibilityAssessment = 'Poor';
  } else if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm' || condition === 'Snow') {
    visibilityAssessment = 'Reduced';
  } else if (visibility < 2) {
    visibilityAssessment = 'Poor';
  } else if (visibility < 5) {
    visibilityAssessment = 'Moderate';
  } else {
    visibilityAssessment = 'Excellent';
  }
  
  return {
    power_adjustment: parseFloat(powerChange.toFixed(1)), 
    braking_efficiency: parseFloat((brakingEfficiency * 100).toFixed(0)),
    cornering_grip: gripAssessmentToValue(assessGrip(calculateGripLevel(condition, airTemp, humidity, rainVolume, snowVolume).index)),
    crosswind_effect: crosswindEffect,
    visibility: visibilityAssessment
  };
}

/**
 * Map grip assessment to numeric value
 */
function gripAssessmentToValue(assessment) {
  const mapping = {
    'Excellent': 95,
    'Good': 85,
    'Moderate': 70,
    'Poor': 50,
    'Very Poor': 30
  };
  
  return mapping[assessment] || 70;
}

/**
 * Calculate alert level based on severe weather conditions
 */
function calculateAlertLevel(condition, visibility, windSpeed, rainVolume, snowVolume) {
  // Start with no alert
  let alertLevel = 'None';
  
  // Check for severe conditions
  if (condition === 'Thunderstorm' || 
      condition === 'Tornado' || 
      windSpeed > 30 || 
      visibility < 0.5 || 
      rainVolume > 10 || 
      snowVolume > 5) {
    alertLevel = 'Severe';
  } 
  // Check for moderate alerts
  else if (condition === 'Snow' || 
           windSpeed > 20 || 
           visibility < 2 || 
           rainVolume > 5) {
    alertLevel = 'Moderate';
  }
  // Check for minor alerts
  else if (condition === 'Rain' || 
           condition === 'Drizzle' || 
           condition === 'Fog' || 
           condition === 'Mist' || 
           windSpeed > 15 || 
           visibility < 5) {
    alertLevel = 'Minor';
  }
  
  return alertLevel;
}

/**
 * Generate driving recommendations based on conditions
 */
function generateDrivingRecommendation(condition, trackTemp, gripIndex, visibility, crossWindEffect) {
  if (condition === 'Thunderstorm' || visibility < 1) {
    return "Hazardous driving conditions. Consider postponing performance driving activities. If necessary to drive, use extreme caution with significantly reduced speeds.";
  }
  
  if (condition === 'Snow' || gripIndex.condition === 'Snow-covered') {
    return "Winter conditions require specialized driving techniques. Use winter tires, gentle inputs, and increased following distances. Limit performance driving activities.";
  }
  
  if ((condition === 'Rain' || condition === 'Drizzle') && gripIndex.condition === 'Wet') {
    return "Wet conditions. Reduced grip requires smooth inputs, earlier braking points, and gentle accelerator application. Avoid standing water and be aware of hydroplaning risk.";
  }
  
  if (gripIndex.condition === 'Damp') {
    return "Damp conditions can be deceptive. Grip levels may vary throughout a journey. Exercise caution particularly in shaded areas. Smooth, progressive inputs recommended.";
  }
  
  if (crossWindEffect === 'Significant' || crossWindEffect === 'Severe') {
    return "Strong crosswinds detected. Vehicle stability may be compromised, particularly at higher speeds or when passing large vehicles. Maintain a firm grip on the steering wheel.";
  }
  
  if (trackTemp < 40) {
    return "Cold surface temperatures will limit grip, particularly in the first few miles. Extended warm-up period recommended for both vehicle and tires before spirited driving.";
  }
  
  if (trackTemp > 110) {
    return "Hot track conditions may lead to accelerated tire wear and potential overheating. Monitor temps closely during extended driving sessions and moderate pace accordingly.";
  }
  
  if (gripIndex.condition === 'Optimal') {
    return "Optimal driving conditions. Surface temperatures and grip levels ideal for performance driving. Standard reference points and techniques apply.";
  }
  
  return "Standard driving conditions. No specific adjustments needed beyond regular safe driving practices.";
}

/**
 * Analyze 5-day forecast data for trend information
 */
function analyzeForecastTrend(forecastData) {
  const forecast = forecastData.list;
  
  if (!forecast || forecast.length === 0) {
    return {
      temperature_trend: 'Stable',
      condition_trend: 'Stable',
      next_precipitation: null
    };
  }
  
  // Check temperature trend
  const startTemp = forecast[0].main.temp;
  const midTemp = forecast[Math.floor(forecast.length / 2)].main.temp;
  const endTemp = forecast[forecast.length - 1].main.temp;
  
  let temperatureTrend;
  if (endTemp > startTemp + 5) {
    temperatureTrend = 'Rising';
  } else if (endTemp < startTemp - 5) {
    temperatureTrend = 'Falling';
  } else {
    temperatureTrend = 'Stable';
  }
  
  // Check for condition changes
  const currentCondition = forecast[0].weather[0].main;
  
  // Find next precipitation
  let nextPrecipitation = null;
  for (let i = 1; i < forecast.length; i++) {
    const forecastItem = forecast[i];
    const condition = forecastItem.weather[0].main;
    
    if (condition === 'Rain' || condition === 'Snow' || condition === 'Drizzle' || condition === 'Thunderstorm') {
      nextPrecipitation = {
        condition: condition,
        time: forecastItem.dt,
        temp: forecastItem.main.temp
      };
      break;
    }
  }
  
  // Check for significant condition changes
  const conditionCounts = {};
  forecast.forEach(item => {
    const condition = item.weather[0].main;
    conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
  });
  
  const mainCondition = Object.keys(conditionCounts).reduce((a, b) => 
    conditionCounts[a] > conditionCounts[b] ? a : b
  );
  
  let conditionTrend;
  if (mainCondition !== currentCondition) {
    conditionTrend = `Changing to ${mainCondition}`;
  } else if (nextPrecipitation) {
    conditionTrend = `Precipitation expected`;
  } else {
    conditionTrend = 'Stable';
  }
  
  return {
    temperature_trend: temperatureTrend,
    condition_trend: conditionTrend,
    next_precipitation: nextPrecipitation
  };
}

/**
 * Convert wind direction degrees to human-readable direction
 */
function getWindDirection(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 
    'E', 'ESE', 'SE', 'SSE', 
    'S', 'SSW', 'SW', 'WSW', 
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Determine if it's currently daytime
 */
function isDaytime(currentTime, sunrise, sunset) {
  return currentTime >= sunrise && currentTime < sunset;
}

/**
 * Calculate dew point if not provided
 */
function calculateDewPoint(temp, humidity, units) {
  // Magnus approximation
  const a = units === 'imperial' ? 17.27 : 17.27;
  const b = units === 'imperial' ? 237.7 : 237.7;
  
  // Convert to Celsius for calculation if imperial
  let tempC = units === 'imperial' ? (temp - 32) * 5/9 : temp;
  
  // Calculate
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity/100);
  const dewPointC = (b * alpha) / (a - alpha);
  
  // Convert back to Fahrenheit if needed
  return units === 'imperial' ? (dewPointC * 9/5) + 32 : dewPointC;
}

/**
 * Assess grip level quality
 */
function assessGrip(gripIndex) {
  if (gripIndex >= 90) {
    return 'Excellent';
  } else if (gripIndex >= 75) {
    return 'Good';
  } else if (gripIndex >= 50) {
    return 'Moderate';
  } else if (gripIndex >= 30) {
    return 'Poor';
  } else {
    return 'Very Poor';
  }
}

/**
 * Assess track evolution trend
 */
function assessEvolution(evolutionValue) {
  if (evolutionValue >= 80) {
    return 'Rapid';
  } else if (evolutionValue >= 60) {
    return 'Steady';
  } else if (evolutionValue >= 40) {
    return 'Slow';
  } else {
    return 'Minimal';
  }
}

/**
 * Assess precipitation intensity
 */
function assessPrecipitation(rainVolume, snowVolume) {
  const totalPrecip = rainVolume + snowVolume;
  
  if (totalPrecip === 0) {
    return 'None';
  } else if (totalPrecip < 1) {
    return 'Light';
  } else if (totalPrecip < 4) {
    return 'Moderate';
  } else {
    return 'Heavy';
  }
}

module.exports = { getAutomotiveWeather };