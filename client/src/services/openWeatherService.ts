// OpenWeather API service
const API_KEY = "2379a18ee0e478c88aa7d4aa1df44410";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution";
const ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall";

// Automotive weather data type
export interface AutomotiveWeatherData {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  current_time: string;
  sunrise_time: string;
  sunset_time: string;
  conditions: {
    summary: string;
    icon: string;
    air_temperature: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    cloud_cover: number;
    precipitation: number;
    uv_index: number;
    solar_radiation: number | null;
  };
  automotive_metrics: {
    track_surface: {
      temperature: number;
      condition: string;
      grip_level: string;
    };
    tire_temperature_estimates: {
      soft_compound: number;
      medium_compound: number;
      hard_compound: number;
      street_performance: number;
      all_season: number;
    };
    drive_recommendations: {
      tire_warmup_minutes: {
        performance: number;
        street: number;
        all_season: number;
      };
      torque_management: {
        recommended_percentage: number;
        traction_control: string;
      };
      tire_pressure_adjustment: number;
      braking_points: string;
    };
    visibility_assessment: string;
    sunglare_risk: string;
  };
  hourly_forecast: Array<{
    time: string;
    temperature: number;
    conditions: string;
    precipitation_chance: number;
  }>;
  alerts: Array<any>;
  data_sources: {
    weather: string;
    solar: string;
  };
}

// Get current weather data for a location
export const getWeatherData = async (location: { lat: number; lon: number }, units: 'metric' | 'imperial' = 'imperial') => {
  const response = await fetch(
    `${BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=${units}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return await response.json();
};

// Get one call weather data (current, hourly, daily forecasts)
export const getOneCallData = async (location: { lat: number; lon: number }, units: 'metric' | 'imperial' = 'imperial') => {
  const response = await fetch(
    `${BASE_URL}/onecall?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=${units}&exclude=minutely`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch one call data');
  }
  
  return await response.json();
};

// Format temperature with unit
export const formatTemperature = (temp: number, units: 'metric' | 'imperial' = 'imperial'): string => {
  const unit = units === 'imperial' ? '°F' : '°C';
  return `${Math.round(temp)}${unit}`;
};

// Utility functions for automotive weather analytics
export const calculateSurfaceTemperature = (airTemp: number, sunIntensity: number): number => {
  // Simple model: surface temp is air temp + adjustment based on sun intensity
  // Sun intensity should be 0-1 where 0 is night/cloudy and 1 is full sun
  const surfaceAdjustment = sunIntensity * 15; // Up to 15 degrees hotter in full sun
  return airTemp + surfaceAdjustment;
};

export const estimateTireWarmupTime = (
  airTemp: number, 
  surfaceTemp: number, 
  tireType: 'summer' | 'sport' | 'winter' | 'all-season' = 'summer'
): number => {
  // Base time in minutes
  let baseTime = 10;
  
  // Adjust for tire type
  if (tireType === 'summer') baseTime = 8;
  if (tireType === 'sport') baseTime = 6;
  if (tireType === 'winter') baseTime = 12;
  if (tireType === 'all-season') baseTime = 10;
  
  // Adjust for temperature
  if (airTemp < 50) {
    // Colder air increases warm-up time
    baseTime += Math.max(0, (50 - airTemp) / 5);
  } else if (airTemp > 80) {
    // Warmer air decreases warm-up time
    baseTime -= Math.min(baseTime / 2, (airTemp - 80) / 10);
  }
  
  // Surface temperature effect
  if (surfaceTemp > airTemp + 10) {
    // Hot surface helps tires warm up faster
    baseTime -= Math.min(baseTime / 3, (surfaceTemp - airTemp) / 15);
  }
  
  return Math.max(2, Math.round(baseTime));
};

export const estimateGripLevel = (
  airTemp: number,
  surfaceTemp: number,
  humidity: number,
  precipProbability: number,
  tireType: 'summer' | 'sport' | 'winter' | 'all-season' = 'summer'
): string => {
  // Base grip score (0-100)
  let gripScore = 80;
  
  // Temperature effects
  if (tireType === 'summer' || tireType === 'sport') {
    // Summer/sport tires perform best in warmer conditions
    if (airTemp < 45) gripScore -= 30;
    else if (airTemp < 60) gripScore -= 15;
    else if (airTemp > 80) gripScore += 5;
  } else if (tireType === 'winter') {
    // Winter tires perform best in colder conditions
    if (airTemp > 60) gripScore -= 25;
    else if (airTemp < 32) gripScore += 10;
  }
  
  // Surface temperature
  const idealSurfaceTemp = tireType === 'winter' ? 40 : 85;
  gripScore -= Math.min(20, Math.abs(surfaceTemp - idealSurfaceTemp) / 3);
  
  // Humidity effects (high humidity can reduce grip slightly)
  if (humidity > 80) {
    gripScore -= 5;
  }
  
  // Precipitation has major negative effect
  if (precipProbability > 0.3) {
    gripScore -= 30 * precipProbability;
  }
  
  // Convert numerical score to descriptive rating
  if (gripScore >= 85) return 'Excellent';
  if (gripScore >= 70) return 'Good';
  if (gripScore >= 50) return 'Moderate';
  if (gripScore >= 30) return 'Poor';
  return 'Dangerous';
};

// Estimate optimal torque settings for performance driving
export const getOptimalTorqueSetting = (
  carModel: string,
  surfaceTemp: number,
  surfaceCondition: string
): number => {
  // Default base torque (ft-lb)
  let baseTorque = 100;
  
  // Brand/model specific defaults
  if (carModel.toLowerCase().includes('ferrari')) {
    baseTorque = 96;
  } else if (carModel.toLowerCase().includes('porsche')) {
    baseTorque = 92;
  } else if (carModel.toLowerCase().includes('lamborghini')) {
    baseTorque = 98;
  }
  
  // Surface temperature adjustments
  if (surfaceTemp < 60) {
    // Reduce torque in colder conditions
    baseTorque = Math.round(baseTorque * 0.85);
  } else if (surfaceTemp > 100) {
    // Reduce torque in very hot conditions
    baseTorque = Math.round(baseTorque * 0.9);
  }
  
  // Surface condition adjustments
  if (surfaceCondition.toLowerCase().includes('wet')) {
    baseTorque = Math.round(baseTorque * 0.7);
  } else if (surfaceCondition.toLowerCase().includes('damp')) {
    baseTorque = Math.round(baseTorque * 0.8);
  }
  
  return baseTorque;
};

// Air Quality Data Interface
export interface AirQualityData {
  aqi: number;                // Air Quality Index (1: Good, 2: Fair, 3: Moderate, 4: Poor, 5: Very Poor)
  components: {
    co: number;               // Carbon monoxide (μg/m3)
    no: number;               // Nitrogen monoxide (μg/m3)
    no2: number;              // Nitrogen dioxide (μg/m3)
    o3: number;               // Ozone (μg/m3)
    so2: number;              // Sulphur dioxide (μg/m3)
    pm2_5: number;            // Fine particles (μg/m3)
    pm10: number;             // Coarse particles (μg/m3)
    nh3: number;              // Ammonia (μg/m3)
  };
  location: {
    lat: number;
    lon: number;
  };
  timestamp: number;          // Timestamp in seconds
}

// Road Risk Index Interface
export interface RoadRiskData {
  precipitation_intensity: number;  // mm/h
  road_temperature: number;         // °F or °C depending on units
  visibility_meters: number;        // meters
  crosswind_speed: number;          // mph or km/h
  risk_index: number;               // 0-100
  risk_factors: {
    precipitation: number;          // 0-10
    temperature: number;            // 0-10
    visibility: number;             // 0-10
    wind: number;                   // 0-10
  };
  alerts: string[];                 // Alert messages
  assessment: string;               // Text assessment
}

// Heat Index and Wind Chill Interface
export interface ThermalComfortData {
  heat_index: number;               // "Feels like" temperature in hot conditions
  wind_chill: number;               // "Feels like" temperature in cold conditions
  effective_temperature: number;    // The temperature that actually affects the body
  comfort_level: string;            // Descriptive assessment
  health_risk_level: string;        // None, Low, Moderate, High, Extreme
  warning: string | null;           // Warning message if conditions are extreme
}

// Weather Alerts Interface
export interface WeatherAlertData {
  alerts: Array<{
    sender_name: string;            // Source of the alert
    event: string;                  // Type of alert (e.g. "Flood Warning")
    start: number;                  // Start timestamp
    end: number;                    // End timestamp
    description: string;            // Description of the alert
    tags: string[];                 // Alert categories 
    severity: string;               // Severity level
  }>;
  has_alerts: boolean;              // Whether there are any active alerts
  highest_severity: string | null;  // Highest severity alert present
}

// Precipitation Details Interface
export interface PrecipitationData {
  current: {
    intensity: number;              // Current precipitation rate (mm/h)
    type: string;                   // "rain", "snow", "sleet", etc.
    accumulation: number;           // Accumulated precipitation in last hour
  };
  hourly_forecast: Array<{
    time: string;                   // Timestamp
    intensity: number;              // Precipitation rate (mm/h)
    probability: number;            // Probability (0-1)
    type: string;                   // "rain", "snow", etc.
  }>;
  daily_forecast: Array<{
    date: string;                   // Date
    max_intensity: number;          // Max precipitation rate (mm/h)
    accumulation: number;           // Expected accumulation
    probability: number;            // Probability (0-1)
    type: string;                   // Predominant type
  }>;
  trends: {
    intensifying: boolean;          // Is precipitation getting stronger?
    duration_estimate: number;      // Estimated duration in minutes
    expected_peak: number;          // Expected peak intensity
  };
}

// Get Air Quality Data
export const getAirQualityData = async (location: { lat: number; lon: number }): Promise<AirQualityData> => {
  try {
    const response = await fetch(
      `${AIR_POLLUTION_URL}?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Air quality API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      aqi: data.list[0].main.aqi,
      components: data.list[0].components,
      location: {
        lat: location.lat,
        lon: location.lon
      },
      timestamp: data.list[0].dt
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
};

// Calculate Road Risk Index based on weather conditions
export const calculateRoadRiskIndex = (
  weatherData: any,
  units: 'metric' | 'imperial' = 'imperial'
): RoadRiskData => {
  // Extract relevant data
  const precipitation = weatherData.currentConditions?.rain?.['1h'] || 
                       weatherData.currentConditions?.snow?.['1h'] || 0;
  const visibility = weatherData.currentConditions?.visibility || 10000; // meters
  const windSpeed = weatherData.currentConditions?.wind_speed || 0;
  const windDeg = weatherData.currentConditions?.wind_deg || 0;
  const temperature = weatherData.currentConditions?.temp || 20;
  const surfaceTemp = weatherData.drivingConditions?.surface_temperature || temperature;
  
  // Calculate risk factors (0-10 scale)
  const precipRisk = Math.min(10, precipitation * 5); // Scale precipitation intensity
  
  // Temperature risk - extreme cold or hot temps increase risk
  let tempRisk = 0;
  if (units === 'imperial') {
    if (surfaceTemp < 32) tempRisk = Math.min(10, (32 - surfaceTemp) / 3); // Freezing conditions
    else if (surfaceTemp > 90) tempRisk = Math.min(10, (surfaceTemp - 90) / 5); // Very hot
  } else {
    if (surfaceTemp < 0) tempRisk = Math.min(10, (0 - surfaceTemp) / 2); // Freezing
    else if (surfaceTemp > 32) tempRisk = Math.min(10, (surfaceTemp - 32) / 3); // Very hot
  }
  
  // Visibility risk - lower visibility increases risk
  const visibilityRisk = Math.min(10, (10000 - visibility) / 1000);
  
  // Wind risk - higher wind speeds increase risk
  const windRisk = Math.min(10, windSpeed / 5);
  
  // Calculate crosswind component using wind direction
  // Assuming 0 = North, 90 = East, etc.
  // For simplicity, we'll assume the road direction is east-west
  // Real implementation would consider actual road direction
  const crosswindSpeed = Math.abs(windSpeed * Math.sin(windDeg * Math.PI / 180));
  
  // Overall risk index (0-100)
  const riskIndex = Math.min(100, (precipRisk + tempRisk + visibilityRisk + windRisk) * 2.5);
  
  // Generate appropriate alerts
  const alerts = [];
  if (precipRisk > 5) alerts.push("Heavy precipitation - reduced traction");
  if (tempRisk > 5 && surfaceTemp < (units === 'imperial' ? 32 : 0)) alerts.push("Road surface near freezing - ice risk");
  if (visibilityRisk > 5) alerts.push("Reduced visibility ahead");
  if (crosswindSpeed > (units === 'imperial' ? 15 : 24)) alerts.push("Strong crosswinds - vehicle stability affected");
  
  // Risk assessment
  let assessment = "Optimal driving conditions";
  if (riskIndex > 80) assessment = "Extreme caution advised - hazardous conditions";
  else if (riskIndex > 60) assessment = "High risk conditions - reduce speed significantly";
  else if (riskIndex > 40) assessment = "Moderate risk - adjust driving style";
  else if (riskIndex > 20) assessment = "Slightly challenging conditions - stay alert";
  
  return {
    precipitation_intensity: precipitation,
    road_temperature: surfaceTemp,
    visibility_meters: visibility,
    crosswind_speed: crosswindSpeed,
    risk_index: riskIndex,
    risk_factors: {
      precipitation: precipRisk,
      temperature: tempRisk,
      visibility: visibilityRisk,
      wind: windRisk
    },
    alerts,
    assessment
  };
};

// Calculate heat index and wind chill
export const calculateThermalComfort = (
  weatherData: any,
  units: 'metric' | 'imperial' = 'imperial'
): ThermalComfortData => {
  const temp = weatherData.currentConditions?.temp || 0;
  const humidity = weatherData.currentConditions?.humidity || 0;
  const windSpeed = weatherData.currentConditions?.wind_speed || 0;
  
  let heatIndex = temp;
  let windChill = temp;
  
  // Calculate Heat Index (for temperatures above 80°F/27°C with humidity above 40%)
  if ((units === 'imperial' && temp >= 80) || (units === 'metric' && temp >= 27)) {
    if (humidity >= 40) {
      if (units === 'imperial') {
        // Rothfusz regression formula (imperial)
        heatIndex = -42.379 + 2.04901523 * temp + 10.14333127 * humidity
          - 0.22475541 * temp * humidity - 0.00683783 * temp * temp
          - 0.05481717 * humidity * humidity + 0.00122874 * temp * temp * humidity
          + 0.00085282 * temp * humidity * humidity - 0.00000199 * temp * temp * humidity * humidity;
      } else {
        // Approximate conversion for metric
        const tempF = (temp * 9/5) + 32;
        const hiF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity
          - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF
          - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity
          + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
        heatIndex = (hiF - 32) * 5/9;
      }
    }
  }
  
  // Calculate Wind Chill (for temperatures below 50°F/10°C and wind speeds above 3 mph/4.8 km/h)
  if ((units === 'imperial' && temp <= 50 && windSpeed > 3) || 
      (units === 'metric' && temp <= 10 && windSpeed > 4.8)) {
    if (units === 'imperial') {
      // Wind chill formula (imperial)
      windChill = 35.74 + 0.6215 * temp - 35.75 * Math.pow(windSpeed, 0.16) 
        + 0.4275 * temp * Math.pow(windSpeed, 0.16);
    } else {
      // Wind chill formula (metric)
      windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) 
        + 0.3965 * temp * Math.pow(windSpeed, 0.16);
    }
  }
  
  // Determine which one to use as the effective temperature
  const effectiveTemp = temp <= (units === 'imperial' ? 50 : 10) ? windChill : 
                      temp >= (units === 'imperial' ? 80 : 27) ? heatIndex : temp;
  
  // Determine comfort level
  let comfortLevel = "Comfortable";
  let healthRisk = "None";
  let warning = null;
  
  if (units === 'imperial') {
    if (effectiveTemp < 0) {
      comfortLevel = "Extremely Cold";
      healthRisk = "Extreme";
      warning = "Frostbite possible within 30 minutes. Hypothermia risk.";
    } else if (effectiveTemp < 20) {
      comfortLevel = "Very Cold";
      healthRisk = "High";
      warning = "Prolonged exposure may lead to hypothermia.";
    } else if (effectiveTemp < 32) {
      comfortLevel = "Cold";
      healthRisk = "Moderate";
    } else if (effectiveTemp < 50) {
      comfortLevel = "Cool";
      healthRisk = "Low";
    } else if (effectiveTemp > 105) {
      comfortLevel = "Extremely Hot";
      healthRisk = "Extreme";
      warning = "Heat stroke possible with prolonged exposure. Avoid outdoor activities.";
    } else if (effectiveTemp > 90) {
      comfortLevel = "Very Hot";
      healthRisk = "High";
      warning = "Heat exhaustion possible with prolonged activity.";
    } else if (effectiveTemp > 80) {
      comfortLevel = "Hot";
      healthRisk = "Moderate";
    } else if (effectiveTemp > 70) {
      comfortLevel = "Warm";
      healthRisk = "Low";
    }
  } else {
    // Metric equivalents
    if (effectiveTemp < -18) {
      comfortLevel = "Extremely Cold";
      healthRisk = "Extreme";
      warning = "Frostbite possible within 30 minutes. Hypothermia risk.";
    } else if (effectiveTemp < -6) {
      comfortLevel = "Very Cold";
      healthRisk = "High";
      warning = "Prolonged exposure may lead to hypothermia.";
    } else if (effectiveTemp < 0) {
      comfortLevel = "Cold";
      healthRisk = "Moderate";
    } else if (effectiveTemp < 10) {
      comfortLevel = "Cool";
      healthRisk = "Low";
    } else if (effectiveTemp > 40) {
      comfortLevel = "Extremely Hot";
      healthRisk = "Extreme";
      warning = "Heat stroke possible with prolonged exposure. Avoid outdoor activities.";
    } else if (effectiveTemp > 32) {
      comfortLevel = "Very Hot";
      healthRisk = "High";
      warning = "Heat exhaustion possible with prolonged activity.";
    } else if (effectiveTemp > 27) {
      comfortLevel = "Hot";
      healthRisk = "Moderate";
    } else if (effectiveTemp > 21) {
      comfortLevel = "Warm";
      healthRisk = "Low";
    }
  }
  
  return {
    heat_index: heatIndex,
    wind_chill: windChill,
    effective_temperature: effectiveTemp,
    comfort_level: comfortLevel,
    health_risk_level: healthRisk,
    warning
  };
};

// Extract, normalize, and format weather alerts
export const extractWeatherAlerts = (weatherData: any): WeatherAlertData => {
  const alerts = weatherData.alerts || [];
  
  let highestSeverity = null;
  const severityRanking = {
    'Unknown': 0,
    'Minor': 1,
    'Moderate': 2,
    'Severe': 3,
    'Extreme': 4
  };
  
  // Determine highest severity alert
  if (alerts.length > 0) {
    highestSeverity = alerts.reduce((highest: string, alert: any) => {
      const currentSeverity = alert.severity || 'Unknown';
      const currentRank = severityRanking[currentSeverity as keyof typeof severityRanking] || 0;
      const highestRank = severityRanking[highest as keyof typeof severityRanking] || 0;
      
      return currentRank > highestRank ? currentSeverity : highest;
    }, 'Unknown');
  }
  
  return {
    alerts: alerts.map((alert: any) => ({
      sender_name: alert.sender_name || 'Weather Service',
      event: alert.event || 'Weather Alert',
      start: alert.start || Date.now() / 1000,
      end: alert.end || (Date.now() / 1000 + 86400), // Default 24 hours
      description: alert.description || 'No description provided',
      tags: alert.tags || [],
      severity: alert.severity || 'Unknown'
    })),
    has_alerts: alerts.length > 0,
    highest_severity: highestSeverity
  };
};

// Extract and process detailed precipitation data
export const extractPrecipitationData = (weatherData: any): PrecipitationData => {
  // Current precipitation
  const currentRain = weatherData.currentConditions?.rain?.['1h'] || 0;
  const currentSnow = weatherData.currentConditions?.snow?.['1h'] || 0;
  
  let precipType = 'none';
  if (currentRain > 0) precipType = 'rain';
  else if (currentSnow > 0) precipType = 'snow';
  else if (weatherData.currentConditions?.weather?.[0]?.main?.toLowerCase().includes('rain')) precipType = 'rain';
  else if (weatherData.currentConditions?.weather?.[0]?.main?.toLowerCase().includes('snow')) precipType = 'snow';
  else if (weatherData.currentConditions?.weather?.[0]?.main?.toLowerCase().includes('drizzle')) precipType = 'drizzle';
  else if (weatherData.currentConditions?.weather?.[0]?.main?.toLowerCase().includes('sleet')) precipType = 'sleet';
  
  // Extract hourly precipitation data
  const hourlyForecast = (weatherData.hourly || []).slice(0, 24).map((hour: any) => {
    let type = 'none';
    if (hour.weather && hour.weather[0]) {
      const weather = hour.weather[0].main.toLowerCase();
      if (weather.includes('rain')) type = 'rain';
      else if (weather.includes('snow')) type = 'snow';
      else if (weather.includes('drizzle')) type = 'drizzle';
      else if (weather.includes('sleet')) type = 'sleet';
    }
    
    return {
      time: new Date(hour.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      intensity: hour.rain?.['1h'] || hour.snow?.['1h'] || 0,
      probability: hour.pop || 0,
      type
    };
  });
  
  // Extract daily precipitation data
  const dailyForecast = (weatherData.daily || []).slice(0, 7).map((day: any) => {
    let type = 'none';
    if (day.weather && day.weather[0]) {
      const weather = day.weather[0].main.toLowerCase();
      if (weather.includes('rain')) type = 'rain';
      else if (weather.includes('snow')) type = 'snow';
      else if (weather.includes('drizzle')) type = 'drizzle';
      else if (weather.includes('sleet')) type = 'sleet';
    }
    
    return {
      date: new Date(day.dt * 1000).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      max_intensity: day.rain || day.snow || 0,
      accumulation: day.rain || day.snow || 0,
      probability: day.pop || 0,
      type
    };
  });
  
  // Analyze trends
  const nextFewHours = hourlyForecast.slice(0, 6);
  const intensifying = nextFewHours.length > 1 && 
    nextFewHours[nextFewHours.length - 1].intensity > nextFewHours[0].intensity;
  
  // Find expected peak
  const peakIntensity = hourlyForecast.reduce((max, hour) => 
    hour.intensity > max ? hour.intensity : max, 0);
  
  // Estimate duration (number of consecutive hours with precipitation)
  let durationEstimate = 0;
  for (const hour of hourlyForecast) {
    if (hour.intensity > 0 || hour.probability > 0.3) {
      durationEstimate++;
    } else if (durationEstimate > 0) {
      // Stop counting once we hit a dry period
      break;
    }
  }
  
  return {
    current: {
      intensity: currentRain + currentSnow,
      type: precipType,
      accumulation: currentRain + currentSnow
    },
    hourly_forecast: hourlyForecast,
    daily_forecast: dailyForecast,
    trends: {
      intensifying,
      duration_estimate: durationEstimate * 60, // Convert hours to minutes
      expected_peak: peakIntensity
    }
  };
};

// Fetch enhanced automotive weather data with F1-style telemetry metrics
export const fetchAutomotiveWeather = async (
  location: { lat: number; lon: number }, 
  units: 'metric' | 'imperial' = 'imperial'
): Promise<AutomotiveWeatherData> => {
  try {
    const response = await fetch(
      `/api/automotive-weather?lat=${location.lat}&lon=${location.lon}&units=${units}`
    );
    
    if (!response.ok) {
      throw new Error(`Automotive weather API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching automotive weather data:', error);
    throw error;
  }
};