const axios = require('axios');

// Cache implementation for weather data
const cache = {
  data: {},
  timestamp: {},
  CACHE_DURATION: 15 * 60 * 1000 // 15 minutes
};

/**
 * Enhanced Automotive Weather API - F1 Pit Wall Style
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getEnhancedAutomotiveWeather(req, res) {
  try {
    const { lat, lon, units = 'imperial', vehicle_type = 'performance' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log('Enhanced F1-Style Automotive weather API called with params:', req.query);

    // Check cache first
    const cacheKey = `${lat}-${lon}-${units}-${vehicle_type}`;
    const now = Date.now();
    
    if (
      cache.data[cacheKey] && 
      cache.timestamp[cacheKey] && 
      now - cache.timestamp[cacheKey] < cache.CACHE_DURATION
    ) {
      console.log('Returning cached enhanced automotive weather data');
      return res.json(cache.data[cacheKey]);
    }
    
    // Need to fetch fresh data
    console.log(`Fetching weather data from OpenWeather for F1-style calculations: lat=${lat}, lon=${lon}`);
    
    const apiKey = process.env.OPENWEATHER_API_KEY || "2379a18ee0e478c88aa7d4aa1df44410";
    
    // Get multiple data sources for better calculations
    const [currentWeather, oneCall, forecast, airPollution] = await Promise.all([
      // Current conditions
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`),
      
      // One Call API for more detailed data
      axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`),
      
      // Forecast for trend analysis
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`),
      
      // Air pollution data (affects engine performance)
      axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    ]);
    
    console.log('Successfully fetched weather data from OpenWeather');
    
    // Extract relevant data from responses
    const current = currentWeather.data;
    const oneCallData = oneCall.data;
    const forecastData = forecast.data;
    const airQualityData = airPollution.data;
    
    // Calculate F1-style metrics
    const f1Data = calculateF1Metrics(current, oneCallData, forecastData, airQualityData, units, vehicle_type);
    
    // Update cache
    cache.data[cacheKey] = f1Data;
    cache.timestamp[cacheKey] = now;
    
    console.log('Successfully generated F1-style automotive weather data, sending response');
    res.json(f1Data);
  } catch (error) {
    console.error('Error fetching enhanced automotive weather data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch enhanced automotive weather data',
      message: error.message
    });
  }
}

/**
 * Calculate F1-style metrics based on weather data
 */
function calculateF1Metrics(current, oneCall, forecast, airQuality, units, vehicleType) {
  // Extract current, hourly, and daily data from one call
  const currentData = oneCall.current;
  const hourlyData = oneCall.hourly || [];
  const dailyData = oneCall.daily || [];
  
  // Temperature units suffix
  const tempUnit = units === 'imperial' ? 'F' : 'C';
  const speedUnit = units === 'imperial' ? 'mph' : 'km/h';
  
  // Time calculations
  const sunrise = new Date(current.sys.sunrise * 1000);
  const sunset = new Date(current.sys.sunset * 1000);
  const now = new Date();
  
  // Calculate asphalt/track temperature - typically 10-30°F warmer than air temp in daylight
  // Formula adjusted based on sun angle, cloud cover, and time of day
  let trackTempOffset = 0;
  const isDaytime = now > sunrise && now < sunset;
  const cloudCover = current.clouds ? current.clouds.all : 0;
  
  if (isDaytime) {
    // Base offset during day
    trackTempOffset = 20;
    
    // Adjust for cloud cover (reduces heating)
    trackTempOffset *= (1 - (cloudCover / 200)); // 0-100% cloud reduces effect
    
    // Time of day factor (highest around solar noon)
    const dayLength = sunset - sunrise;
    const timeSinceSunrise = now - sunrise;
    const dayProgress = Math.min(1, Math.max(0, timeSinceSunrise / dayLength));
    const timeFactorCurve = Math.sin(dayProgress * Math.PI);
    trackTempOffset *= timeFactorCurve;
  } else {
    // Track cools at night, but slower than air
    trackTempOffset = -5; // Track usually slightly warmer than air at night
  }
  
  // Final track temp calculation
  const trackTemp = current.main.temp + trackTempOffset;
  
  // Calculate grip index (0-100)
  let gripIndex = 100; // Start with optimal
  
  // Weather condition impacts grip
  const weatherId = current.weather[0].id;
  const isRaining = weatherId >= 200 && weatherId < 600;
  const isSnowing = weatherId >= 600 && weatherId < 700;
  const isFoggy = weatherId >= 700 && weatherId < 800;
  
  // Rain/snow drastically reduces grip
  if (isRaining) {
    const rainIntensity = Math.min(1, (currentData.rain ? currentData.rain['1h'] : 0) / 5);
    gripIndex -= 50 * rainIntensity;
  } else if (isSnowing) {
    gripIndex -= 70;
  }
  
  // Temperature affects grip (optimal between 60-85°F for most performance tires)
  const optimalLowTemp = 60;
  const optimalHighTemp = 85;
  if (trackTemp < optimalLowTemp) {
    // Cold track reduces grip
    const coldFactor = (optimalLowTemp - trackTemp) / 30; // How far below optimal
    gripIndex -= Math.min(40, 40 * coldFactor);
  } else if (trackTemp > optimalHighTemp) {
    // Hot track can reduce grip too
    const hotFactor = (trackTemp - optimalHighTemp) / 25; // How far above optimal
    gripIndex -= Math.min(30, 30 * hotFactor);
  }
  
  // Humidity affects grip
  const humidity = current.main.humidity;
  if (humidity > 85) {
    // Very humid conditions can make surface slightly slick
    gripIndex -= (humidity - 85) / 3;
  }
  
  // Get air quality impact (if available)
  let airQualityIndex = 0;
  if (airQuality && airQuality.list && airQuality.list[0]) {
    airQualityIndex = airQuality.list[0].main.aqi; // 1 (Good) to 5 (Very Poor)
  }
  
  // Engine performance impact from air quality and weather
  const enginePerformanceFactors = {
    airDensity: calculateAirDensity(current.main.temp, current.main.pressure, humidity),
    airQuality: airQualityIndex,
    humidity: humidity
  };
  
  // Calculate power adjustment percentage
  // Higher humidity and air pollution reduce engine efficiency
  // Air density affects power (lower density = less power)
  const basePowerAdjustment = ((1 - (humidity / 200)) - 0.5) * 10; // -5% to +5%
  const airQualityImpact = (airQualityIndex > 0) ? -((airQualityIndex - 1) * 0.8) : 0; // 0% to -3.2% 
  const airDensityImpact = (enginePerformanceFactors.airDensity - 1.225) * 10; // Normal air density = 1.225 kg/m³
  
  const powerAdjustment = parseFloat((basePowerAdjustment + airQualityImpact + airDensityImpact).toFixed(1));
  
  // Tire recommendations based on conditions
  let tireRecommendations = {};
  if (vehicleType === 'performance') {
    tireRecommendations = calculatePerformanceTireRecommendations(trackTemp, isRaining, gripIndex);
  } else {
    tireRecommendations = calculateStreetTireRecommendations(trackTemp, isRaining, gripIndex);
  }
  
  // Wind impact on handling
  const windSpeed = current.wind.speed;
  const windDirection = current.wind.deg;
  const crosswindSeverity = calculateCrosswindEffect(windSpeed, windDirection);
  
  // Visibility impact
  const visibility = current.visibility / 1000; // Convert to km
  let visibilityImpact = "Excellent";
  if (visibility < 1) {
    visibilityImpact = "Severely Restricted";
  } else if (visibility < 3) {
    visibilityImpact = "Poor";
  } else if (visibility < 5) {
    visibilityImpact = "Moderate";
  } else if (visibility < 8) {
    visibilityImpact = "Good";
  }
  
  // Calculate optimal braking points
  const brakingEfficiency = calculateBrakingEfficiency(gripIndex, trackTemp, isRaining);
  const brakingDistance = calculateBrakingDistance(brakingEfficiency, units);
  
  // Forecast and trend analysis
  const nextHours = hourlyData.slice(0, 12);
  const temperatureTrend = calculateTemperatureTrend(nextHours);
  const conditionChanges = identifyConditionChanges(nextHours);
  
  // Rain forecast analysis
  const rainForecast = analyzeRainForecast(nextHours, dailyData);
  
  // Track evolution prediction
  const trackEvolution = predictTrackEvolution(current, nextHours, dailyData, gripIndex);
  
  // F1-specific race strategy recommendations
  const raceStrategyData = formulateRaceStrategy(
    trackTemp, 
    gripIndex, 
    rainForecast, 
    temperatureTrend, 
    trackEvolution, 
    tireRecommendations,
    units
  );
  
  // Pitwall race performance telemetry
  const pitWallTelemetry = {
    sectors: [
      {
        name: "Sector 1",
        gripLevel: adjustGripForSector(gripIndex, 1),
        optimalLine: isRaining ? "Modified racing line to avoid wet patches" : "Standard racing line",
        brakingAdjustment: isRaining ? -14 : 0
      },
      {
        name: "Sector 2",
        gripLevel: adjustGripForSector(gripIndex, 2),
        optimalLine: isRaining ? "Conservative approach to corners" : "Standard racing line",
        brakingAdjustment: isRaining ? -12 : 0
      },
      {
        name: "Sector 3",
        gripLevel: adjustGripForSector(gripIndex, 3),
        optimalLine: isRaining ? "Caution in high-speed sections" : "Standard racing line",
        brakingAdjustment: isRaining ? -15 : 0
      }
    ],
    throttleApplication: isRaining ? "Progressive" : "Aggressive",
    racingLine: isRaining ? "Wet line - avoid standing water and rubber buildup" : "Standard racing line",
    cornerSpeed: isRaining ? "Reduced by 15-20%" : "Optimal",
    trackLimits: {
      risk: trackEvolution.evolution === "Improving" ? "Moderate" : "High",
      recommendation: "Caution at Turns 1, 5, and 11"
    }
  };
  
  // Driver coaching recommendations
  const driverCoaching = generateDriverCoaching(current, gripIndex, isRaining, trackTemp);
  
  // Format the response
  return {
    location: {
      name: current.name,
      country: current.sys.country,
      coordinates: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      }
    },
    timestamp: {
      current: new Date().toISOString(),
      dataAge: "Live",
      sessionTime: formatTime(new Date()),
      localTime: formatTime(new Date(now.getTime() + (current.timezone * 1000)))
    },
    currentConditions: {
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      pressure: current.main.pressure,
      humidity: current.main.humidity,
      dew_point: calculateDewPoint(current.main.temp, current.main.humidity),
      uvi: currentData.uvi || 0,
      clouds: current.clouds.all,
      wind_speed: current.wind.speed,
      wind_gust: current.wind.gust || current.wind.speed * 1.3, // Estimate if not available
      wind_deg: current.wind.deg,
      wind_direction: degreesToCardinal(current.wind.deg),
      visibility: visibility,
      weather: current.weather,
      is_day: isDaytime
    },
    trackTelemetry: {
      surface_temp: Math.round(trackTemp),
      surface_temp_delta: Math.round(trackTemp - current.main.temp),
      track_condition: getTrackCondition(isRaining, isSnowing, trackTemp, gripIndex),
      grip_index: Math.round(Math.max(0, Math.min(100, gripIndex))),
      grip_assessment: getGripAssessment(gripIndex),
      grip_delta_last_hour: trackEvolution.deltaLastHour,
      track_evolution: trackEvolution.evolution,
      evolution_trend: trackEvolution.trend,
      racing_line_condition: isRaining ? "Wet patches forming on standard line" : "Optimal rubber buildup",
      offline_grip: isRaining ? "Better than racing line" : "Reduced traction, avoid if possible",
      braking_markers: brakingDistance.braking_points,
      alerts: getTrackAlerts(current, gripIndex, isRaining),
      precipitation: {
        type: isRaining ? "Rain" : (isSnowing ? "Snow" : "None"),
        intensity: getPrecipitationIntensity(currentData),
        track_coverage: isRaining ? "Partial - wet patches forming" : "Dry",
        probability_next_hour: Math.round((hourlyData[0].pop || 0) * 100)
      }
    },
    airProperties: {
      density: enginePerformanceFactors.airDensity.toFixed(4),
      pressure_kpa: (current.main.pressure / 10).toFixed(1),
      humidity_impact: getHumidityImpact(humidity),
      air_quality_index: airQualityIndex,
      air_quality_impact: getAirQualityImpact(airQualityIndex)
    },
    vehiclePerformance: {
      power_adjustment: powerAdjustment,
      torque_curve: getTorqueCurveAdjustment(humidity, current.main.temp, airQualityIndex),
      cooling_efficiency: getCoolingEfficiency(current.main.temp, windSpeed),
      engine_temperature_delta: getEngineTempDelta(current.main.temp),
      optimal_engine_mapping: getEngineMapping(current, airQualityIndex, humidity),
      fuel_consumption_delta: getFuelConsumptionDelta(current.main.temp, humidity, airQualityIndex),
      braking: {
        efficiency_percentage: brakingEfficiency,
        distance_adjustment: brakingDistance.distance_adjustment,
        heat_dissipation: getHeatDissipation(current.main.temp, windSpeed),
        brake_temperature_management: getBrakeTemperatureManagement(current.main.temp, isRaining)
      },
      aerodynamics: {
        downforce_efficiency: getDownforceEfficiency(current.main.temp, current.main.pressure),
        drag_coefficient_adjustment: getDragCoefficientAdjustment(current.main.temp, current.main.pressure),
        crosswind_effect: crosswindSeverity
      },
      visibility: {
        driver_visibility: visibilityImpact,
        glare_risk: getGlareRisk(current, sunrise, sunset, now),
        spray_risk: isRaining ? "High - consider increased following distance" : "None"
      }
    },
    tireStrategy: {
      optimal_compound: tireRecommendations.optimal_compound,
      tire_temperature: {
        surface: tireRecommendations.surface_temp,
        core: tireRecommendations.core_temp,
        optimal_window: tireRecommendations.optimal_window,
        warmup_time: tireRecommendations.warmup_time
      },
      pressure: {
        recommendation: tireRecommendations.pressure_recommendation,
        front_pressure_delta: tireRecommendations.front_pressure_delta,
        rear_pressure_delta: tireRecommendations.rear_pressure_delta,
        pressure_buildup_rate: tireRecommendations.pressure_buildup_rate
      },
      wear: {
        expected_wear_rate: tireRecommendations.wear_rate,
        wear_pattern: tireRecommendations.wear_pattern,
        graining_risk: tireRecommendations.graining_risk,
        blistering_risk: tireRecommendations.blistering_risk,
        management_strategy: tireRecommendations.management_strategy
      }
    },
    raceStrategy: raceStrategyData,
    pitWallTelemetry: pitWallTelemetry,
    driverCoaching: driverCoaching,
    forecastTrend: {
      temperature: {
        trend: temperatureTrend.description,
        next_hour: Math.round(nextHours[0].temp),
        next_three_hours: Math.round(nextHours[2].temp)
      },
      condition_changes: conditionChanges,
      precipitation: rainForecast,
      wind_changes: {
        trend: "Steady",
        next_significant_change: "None expected"
      }
    },
    sunData: {
      sunrise: current.sys.sunrise * 1000,
      sunset: current.sys.sunset * 1000,
      daylight_remaining: isDaytime ? Math.round((sunset - now) / 60000) : 0,
      glare_risk: getGlareRisk(current, sunrise, sunset, now),
      glare_direction: getGlareDirection(current, sunrise, sunset, now)
    },
    session_advice: generateSessionAdvice(
      current, 
      trackTemp,
      gripIndex, 
      rainForecast, 
      visibilityImpact, 
      trackEvolution
    ),
    data_sources: {
      primary: "OpenWeather API",
      refresh_rate: "15 minutes",
      predictive_model: "F1 Telemetry Algorithm v1.2"
    }
  };
}

/**
 * Helper Functions for F1 Metric Calculations
 */

// Calculate air density
function calculateAirDensity(temp, pressure, humidity) {
  // Convert to proper units if needed
  const tempK = (temp * (9/5) + 32) ? (temp - 32) * (5/9) + 273.15 : temp + 273.15;
  const pressurePa = pressure * 100;
  
  // Simplified air density calculation
  // Normally would account for humidity properly but this is a simplification
  const R = 287.05; // Specific gas constant for dry air (J/(kg·K))
  const density = pressurePa / (R * tempK);
  
  return density;
}

// Calculate dew point
function calculateDewPoint(temp, humidity) {
  // Magnus approximation
  const a = 17.27;
  const b = 237.7;
  
  const gamma = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
  const dewPoint = (b * gamma) / (a - gamma);
  
  return dewPoint;
}

// Get track condition
function getTrackCondition(isRaining, isSnowing, trackTemp, gripIndex) {
  if (isSnowing) return "Snow";
  if (isRaining) {
    if (gripIndex < 30) return "Wet";
    return "Damp";
  }
  return "Dry";
}

// Get grip assessment based on index value
function getGripAssessment(gripIndex) {
  if (gripIndex >= 85) return "Excellent";
  if (gripIndex >= 70) return "Good";
  if (gripIndex >= 50) return "Moderate";
  if (gripIndex >= 30) return "Poor";
  return "Very Poor";
}

// Get precipitation intensity
function getPrecipitationIntensity(currentData) {
  const rainVolume = currentData.rain ? currentData.rain['1h'] : 0;
  const snowVolume = currentData.snow ? currentData.snow['1h'] : 0;
  
  if (rainVolume > 0) {
    if (rainVolume < 0.5) return "Light Rain";
    if (rainVolume < 4) return "Moderate Rain";
    return "Heavy Rain";
  }
  
  if (snowVolume > 0) {
    if (snowVolume < 0.5) return "Light Snow";
    if (snowVolume < 4) return "Moderate Snow";
    return "Heavy Snow";
  }
  
  return "None";
}

// Calculate temperature trend
function calculateTemperatureTrend(hourlyData) {
  if (hourlyData.length < 3) return { trend: 0, description: "Stable" };
  
  const firstTemp = hourlyData[0].temp;
  const lastTemp = hourlyData[2].temp;
  const trend = lastTemp - firstTemp;
  
  let description = "Stable";
  if (trend > 2) description = "Rising";
  else if (trend > 5) description = "Rapidly Rising";
  else if (trend < -2) description = "Falling";
  else if (trend < -5) description = "Rapidly Falling";
  
  return { trend, description };
}

// Identify weather condition changes
function identifyConditionChanges(hourlyData) {
  if (hourlyData.length < 3) return "No significant changes";
  
  const currentMainCondition = hourlyData[0].weather[0].main;
  
  for (let i = 1; i < 3; i++) {
    if (hourlyData[i].weather[0].main !== currentMainCondition) {
      return `Changing from ${currentMainCondition} to ${hourlyData[i].weather[0].main} in ${i} hour(s)`;
    }
  }
  
  return "Consistent conditions expected";
}

// Analyze rain forecast
function analyzeRainForecast(hourlyData, dailyData) {
  // Check for imminent rain in hourly data
  let rainExpected = false;
  let timeToRain = 0;
  let intensity = "None";
  let confidence = "High";
  
  for (let i = 0; i < hourlyData.length; i++) {
    const hour = hourlyData[i];
    if (hour.pop > 0.3) { // 30% chance of precipitation
      rainExpected = true;
      timeToRain = i;
      intensity = hour.rain ? 
        (hour.rain['1h'] < 1 ? "Light" : hour.rain['1h'] < 4 ? "Moderate" : "Heavy") : 
        "Unknown";
      break;
    }
  }
  
  // If no rain in hourly, check daily
  if (!rainExpected && dailyData.length > 0) {
    for (let i = 0; i < Math.min(2, dailyData.length); i++) {
      const day = dailyData[i];
      if (day.pop > 0.3) {
        rainExpected = true;
        timeToRain = i === 0 ? "Later today" : "Tomorrow";
        intensity = "Unknown";
        confidence = "Moderate";
        break;
      }
    }
  }
  
  return {
    expected: rainExpected,
    time_to_rain: timeToRain,
    intensity: intensity,
    confidence: confidence,
    session_impact: rainExpected ? (timeToRain < 3 ? "High" : "Low") : "None"
  };
}

// Predict track evolution
function predictTrackEvolution(current, hourlyData, dailyData, currentGrip) {
  let evolution = "Stable";
  let trend = "Neutral";
  let deltaLastHour = 0;
  
  // Previous hour's estimated grip
  const prevHourTemp = current.main.temp - 0.5; // Estimate
  const prevHourHumidity = current.main.humidity + 2; // Estimate
  const prevHourGrip = currentGrip - 2; // Estimate
  
  // Current trend based on temp and humidity changes
  const tempTrend = hourlyData[0].temp - prevHourTemp;
  const humidityTrend = hourlyData[0].humidity - prevHourHumidity;
  
  // Delta based on recent changes
  deltaLastHour = 2; // Default small improvement
  
  // Adjust for weather trends
  if (tempTrend > 1 && humidityTrend < 0) {
    // Getting warmer and less humid - track improves
    evolution = "Improving";
    trend = "Positive";
    deltaLastHour = 4;
  } else if (tempTrend < -1 || humidityTrend > 5) {
    // Getting colder or more humid - track deteriorates
    evolution = "Deteriorating";
    trend = "Negative";
    deltaLastHour = -3;
  }
  
  // Check for rain which greatly affects evolution
  for (let i = 0; i < 3; i++) {
    if (hourlyData[i].pop > 0.4) {
      evolution = "Deteriorating";
      trend = "Significantly Negative";
      deltaLastHour = -5;
      break;
    }
  }
  
  return {
    evolution: evolution,
    trend: trend,
    deltaLastHour: deltaLastHour,
    expected_changes: evolution === "Stable" ? 
      "Minimal changes expected" : 
      `${evolution} conditions with ${Math.abs(deltaLastHour)}% grip change per hour`
  };
}

// Calculate performance tire recommendations
function calculatePerformanceTireRecommendations(trackTemp, isRaining, gripIndex) {
  // Base values
  let optimalCompound = "Medium";
  let surfaceTemp = trackTemp + 10; // Tire surface runs hotter than track
  let coreTemp = trackTemp + 5; // Core temp is between track and surface temps
  let optimalWindow = "90-100°C";
  let warmupTime = 3;
  
  // Adjust based on conditions
  if (isRaining) {
    optimalCompound = "Wet";
    surfaceTemp = trackTemp + 5;
    coreTemp = trackTemp + 2;
    optimalWindow = "80-90°C";
    warmupTime = 5;
  } else if (trackTemp < 60) {
    optimalCompound = "Soft";
    optimalWindow = "85-95°C";
    warmupTime = 4;
  } else if (trackTemp > 85) {
    optimalCompound = "Hard";
    surfaceTemp = trackTemp + 15;
    coreTemp = trackTemp + 8;
    optimalWindow = "95-105°C";
    warmupTime = 2;
  }
  
  // Pressure recommendations
  let pressureRecommendation = "Standard";
  let frontPressureDelta = 0;
  let rearPressureDelta = 0;
  
  if (trackTemp < 60) {
    pressureRecommendation = "Increase pressures to accelerate warmup";
    frontPressureDelta = 1.5;
    rearPressureDelta = 1.0;
  } else if (trackTemp > 85) {
    pressureRecommendation = "Reduce pressures to manage overheating";
    frontPressureDelta = -1.0;
    rearPressureDelta = -1.5;
  }
  
  // Wear expectations
  let wearRate = "Moderate";
  let wearPattern = "Even";
  let grainingRisk = "Low";
  let blisteringRisk = "Low";
  
  if (trackTemp > 90) {
    wearRate = "High";
    blisteringRisk = "Moderate";
    wearPattern = "Increased center wear";
  } else if (trackTemp < 55) {
    wearRate = "Low";
    grainingRisk = "Moderate";
    wearPattern = "Increased shoulder wear";
  }
  
  if (gripIndex < 50) {
    wearRate = "Low";
    grainingRisk = "High";
  }
  
  return {
    optimal_compound: optimalCompound,
    surface_temp: Math.round(surfaceTemp),
    core_temp: Math.round(coreTemp),
    optimal_window: optimalWindow,
    warmup_time: warmupTime,
    pressure_recommendation: pressureRecommendation,
    front_pressure_delta: frontPressureDelta,
    rear_pressure_delta: rearPressureDelta,
    pressure_buildup_rate: isRaining ? "Slow" : (trackTemp > 85 ? "Rapid" : "Normal"),
    wear_rate: wearRate,
    wear_pattern: wearPattern,
    graining_risk: grainingRisk,
    blistering_risk: blisteringRisk,
    management_strategy: formulateTireManagementStrategy(
      optimalCompound, 
      wearRate, 
      grainingRisk, 
      blisteringRisk, 
      isRaining
    )
  };
}

// Calculate street tire recommendations
function calculateStreetTireRecommendations(trackTemp, isRaining, gripIndex) {
  // Base values
  let optimalCompound = "Performance Street";
  let surfaceTemp = trackTemp + 5; // Street tires run closer to track temp
  let coreTemp = trackTemp + 3;
  let optimalWindow = "70-85°C";
  let warmupTime = 8;
  
  // Adjust based on conditions
  if (isRaining) {
    optimalCompound = "All-Season";
    surfaceTemp = trackTemp + 2;
    coreTemp = trackTemp + 1;
    optimalWindow = "60-75°C";
    warmupTime = 10;
  } else if (trackTemp < 50) {
    optimalCompound = "Ultra High Performance All-Season";
    warmupTime = 12;
  } else if (trackTemp > 95) {
    optimalCompound = "Summer Performance";
    surfaceTemp = trackTemp + 8;
    coreTemp = trackTemp + 5;
    warmupTime = 6;
  }
  
  // Pressure recommendations
  let pressureRecommendation = "Manufacturer recommended";
  let frontPressureDelta = 0;
  let rearPressureDelta = 0;
  
  if (trackTemp < 50) {
    pressureRecommendation = "Increase pressures by 2-3 PSI";
    frontPressureDelta = 2.5;
    rearPressureDelta = 2.0;
  } else if (trackTemp > 90) {
    pressureRecommendation = "Check pressures regularly for overheating";
    frontPressureDelta = 0;
    rearPressureDelta = 0;
  }
  
  // Wear expectations
  let wearRate = "Normal";
  let wearPattern = "Even";
  let grainingRisk = "Very Low";
  let blisteringRisk = "Very Low";
  
  if (trackTemp > 95) {
    wearRate = "Accelerated";
    wearPattern = "Center wear likely";
  }
  
  return {
    optimal_compound: optimalCompound,
    surface_temp: Math.round(surfaceTemp),
    core_temp: Math.round(coreTemp),
    optimal_window: optimalWindow,
    warmup_time: warmupTime,
    pressure_recommendation: pressureRecommendation,
    front_pressure_delta: frontPressureDelta,
    rear_pressure_delta: rearPressureDelta,
    pressure_buildup_rate: isRaining ? "Minimal" : (trackTemp > 90 ? "Moderate" : "Slow"),
    wear_rate: wearRate,
    wear_pattern: wearPattern,
    graining_risk: grainingRisk,
    blistering_risk: blisteringRisk,
    management_strategy: "Standard driving practices recommended"
  };
}

// Formulate tire management strategy
function formulateTireManagementStrategy(compound, wearRate, grainingRisk, blisteringRisk, isRaining) {
  if (isRaining) {
    return "Gentle throttle application to minimize wheelspin and maintain temperature";
  }
  
  if (grainingRisk === "High") {
    return "Initial gentle driving to gradually build temperature, avoid sliding";
  }
  
  if (blisteringRisk === "Moderate" || blisteringRisk === "High") {
    return "Avoid aggressive cornering early in stint, manage temperature through smooth inputs";
  }
  
  if (wearRate === "High") {
    return "Conservative approach to high-speed corners, gentle on traction zones";
  }
  
  return "Standard management - progressive push as tires reach optimal window";
}

// Get track alerts
function getTrackAlerts(current, gripIndex, isRaining) {
  const alerts = [];
  
  if (gripIndex < 40) {
    alerts.push("LOW GRIP CONDITIONS - Exercise caution in all sectors");
  }
  
  if (isRaining) {
    alerts.push("STANDING WATER - Possible hydroplaning risk in low sections");
  }
  
  if (current.wind.speed > 15) {
    alerts.push("HIGH WINDS - Expect crosswind effects on main straight");
  }
  
  return alerts.length > 0 ? alerts : ["No current alerts"];
}

// Calculate crosswind effect
function calculateCrosswindEffect(windSpeed, windDirection) {
  // Simplified assessment based only on speed
  if (windSpeed < 5) return "Negligible";
  if (windSpeed < 10) return "Minimal";
  if (windSpeed < 15) return "Moderate";
  if (windSpeed < 25) return "Significant";
  return "Severe";
}

// Calculate braking efficiency
function calculateBrakingEfficiency(gripIndex, trackTemp, isRaining) {
  let base = gripIndex;
  
  // Temperature effects
  if (trackTemp < 60) {
    base -= (60 - trackTemp) * 0.2; // Colder reduces brake efficiency
  }
  
  // Rain significantly impacts braking
  if (isRaining) {
    base -= 25;
  }
  
  return Math.round(Math.max(30, Math.min(100, base)));
}

// Calculate braking distance
function calculateBrakingDistance(efficiency, units) {
  // Base 100% efficiency = standard braking distance
  // Every 10% reduction adds approximately 5% distance
  const adjustmentPercentage = (100 - efficiency) * 0.5;
  
  // Formulate braking points advice
  let brakingPoints = "Standard braking points";
  
  if (adjustmentPercentage > 20) {
    brakingPoints = "Brake significantly earlier at all major braking zones (+20-25 meters)";
  } else if (adjustmentPercentage > 10) {
    brakingPoints = "Brake earlier at all major braking zones (+10-15 meters)";
  } else if (adjustmentPercentage > 5) {
    brakingPoints = "Slightly earlier braking recommended (+5-10 meters)";
  }
  
  return {
    efficiency: efficiency,
    distance_adjustment: `+${Math.round(adjustmentPercentage)}%`,
    braking_points: brakingPoints
  };
}

// Helper function to convert degrees to cardinal direction
function degreesToCardinal(degrees) {
  const cardinals = [
    "N", "NNE", "NE", "ENE", 
    "E", "ESE", "SE", "SSE", 
    "S", "SSW", "SW", "WSW", 
    "W", "WNW", "NW", "NNW"
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return cardinals[index];
}

// Format time to race session format
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Get humidity impact assessment
function getHumidityImpact(humidity) {
  if (humidity < 30) return "Low - Beneficial for power";
  if (humidity < 60) return "Neutral";
  if (humidity < 80) return "Moderate reduction in power";
  return "High - Significant power reduction";
}

// Get air quality impact assessment
function getAirQualityImpact(aqi) {
  switch(aqi) {
    case 1: return "Clean air - Optimal engine performance";
    case 2: return "Good air - Minimal impact";
    case 3: return "Moderate - Slight reduction in efficiency";
    case 4: return "Poor - Filter load increased, efficiency reduced";
    case 5: return "Very poor - Significant performance impact";
    default: return "Data unavailable";
  }
}

// Get cooling efficiency
function getCoolingEfficiency(temp, windSpeed) {
  if (temp < 50) return "Excellent";
  if (temp < 70) return "Good";
  if (temp < 85) return "Adequate";
  if (temp < 95) return "Challenged";
  
  // High temperatures require more airflow/wind to cool effectively
  if (windSpeed > 10) return "Adequate - Assisted by airflow";
  return "Poor - Additional cooling measures recommended";
}

// Get engine temperature delta
function getEngineTempDelta(temp) {
  // Reference point: 70°F (21°C) as neutral
  const delta = temp - 70;
  if (Math.abs(delta) < 5) return "Neutral (±0°)";
  
  const direction = delta > 0 ? "+" : "";
  return `${direction}${Math.round(delta / 2)}°`; // Engine temp changes less than ambient
}

// Get optimal engine mapping
function getEngineMapping(current, airQualityIndex, humidity) {
  const temp = current.main.temp;
  const isRaining = current.weather[0].main === 'Rain';
  
  if (isRaining) return "Map 2 - Wet Weather (reduced power, smoother delivery)";
  
  if (temp > 90 && humidity > 70) return "Map 3 - Hot Weather (reduced power, focus on cooling)";
  
  if (temp < 50) return "Map 4 - Cold Weather (adjusted timing, focus on warmup)";
  
  if (airQualityIndex > 3) return "Map 5 - Reduced Efficiency Mode";
  
  return "Map 1 - Standard Performance";
}

// Get fuel consumption delta
function getFuelConsumptionDelta(temp, humidity, airQualityIndex) {
  let delta = 0;
  
  // Temperature effect
  if (temp < 50) delta += 2; // Cold increases consumption
  if (temp > 90) delta += 1.5; // Hot increases slightly
  
  // Humidity effect
  if (humidity > 80) delta += 1;
  
  // Air quality effect
  if (airQualityIndex > 3) delta += airQualityIndex - 3;
  
  if (delta === 0) return "Standard consumption";
  return `+${delta.toFixed(1)}%`;
}

// Get heat dissipation assessment
function getHeatDissipation(temp, windSpeed) {
  if (temp < 70) return "Excellent";
  if (temp < 85) {
    return windSpeed > 8 ? "Good" : "Adequate";
  }
  if (temp < 95) {
    return windSpeed > 10 ? "Adequate" : "Compromised";
  }
  return windSpeed > 15 ? "Compromised" : "Poor";
}

// Get brake temperature management recommendation
function getBrakeTemperatureManagement(temp, isRaining) {
  if (isRaining) return "Gentle on initial braking to maintain temperature";
  
  if (temp < 50) return "Higher brake pressure initially to build temperature";
  
  if (temp > 90) return "Cooling focused - maximize straight-line cooling";
  
  return "Standard management - balanced approach";
}

// Get downforce efficiency
function getDownforceEfficiency(temp, pressure) {
  // Air density affects downforce - colder and higher pressure = more dense = more downforce
  const tempFactor = (75 - temp) * 0.1; // Positive when colder than 75°F
  const pressureFactor = (pressure - 1013) * 0.01; // Standard pressure is 1013 hPa
  
  const efficiency = 100 + tempFactor + pressureFactor;
  
  return Math.round(efficiency);
}

// Get drag coefficient adjustment
function getDragCoefficientAdjustment(temp, pressure) {
  // Similar factors affect drag
  const tempFactor = (75 - temp) * 0.05;
  const pressureFactor = (pressure - 1013) * 0.005;
  
  const adjustment = tempFactor + pressureFactor;
  
  if (Math.abs(adjustment) < 0.5) return "Neutral";
  return adjustment > 0 ? `+${adjustment.toFixed(1)}%` : `${adjustment.toFixed(1)}%`;
}

// Get torque curve adjustment
function getTorqueCurveAdjustment(humidity, temp, airQualityIndex) {
  let lowEndAdjustment = 0;
  let midRangeAdjustment = 0;
  let topEndAdjustment = 0;
  
  // Humidity affects top end more
  if (humidity > 80) {
    lowEndAdjustment -= 1;
    midRangeAdjustment -= 2;
    topEndAdjustment -= 3;
  } else if (humidity < 30) {
    midRangeAdjustment += 1;
    topEndAdjustment += 2;
  }
  
  // Temperature effects
  if (temp < 50) {
    lowEndAdjustment -= 2;
    midRangeAdjustment -= 1;
  } else if (temp > 90) {
    midRangeAdjustment -= 1;
    topEndAdjustment -= 2;
  }
  
  // Air quality effects entire range
  if (airQualityIndex > 3) {
    const factor = airQualityIndex - 3;
    lowEndAdjustment -= factor;
    midRangeAdjustment -= factor;
    topEndAdjustment -= factor;
  }
  
  return {
    low_end: formatAdjustment(lowEndAdjustment),
    mid_range: formatAdjustment(midRangeAdjustment),
    top_end: formatAdjustment(topEndAdjustment)
  };
}

// Format adjustment value with sign
function formatAdjustment(value) {
  if (value === 0) return "0%";
  return value > 0 ? `+${value}%` : `${value}%`;
}

// Get glare risk assessment
function getGlareRisk(current, sunrise, sunset, now) {
  // No glare at night
  if (now < sunrise || now > sunset) return "None";
  
  // Higher risk around sunrise/sunset
  const sunriseTime = now - sunrise; // ms from sunrise
  const sunsetTime = sunset - now; // ms until sunset
  
  // Risky times are within 45 minutes of sunrise/sunset
  const riskThreshold = 45 * 60 * 1000; // 45 minutes in ms
  
  if (sunriseTime < riskThreshold) return "High - Dawn";
  if (sunsetTime < riskThreshold) return "High - Dusk";
  
  // Also depends on cloud cover
  if (current.clouds && current.clouds.all < 30) return "Moderate";
  
  return "Low";
}

// Get glare direction
function getGlareDirection(current, sunrise, sunset, now) {
  // No glare at night
  if (now < sunrise || now > sunset) return "None";
  
  const sunriseTime = now - sunrise; // ms from sunrise
  const sunsetTime = sunset - now; // ms until sunset
  const riskThreshold = 45 * 60 * 1000; // 45 minutes in ms
  
  if (sunriseTime < riskThreshold) return "East";
  if (sunsetTime < riskThreshold) return "West";
  
  return "Overhead";
}

// Adjust grip for different sectors (simulate track variations)
function adjustGripForSector(baseGrip, sector) {
  // Add some variation between sectors
  switch(sector) {
    case 1: return Math.min(100, baseGrip + 2);
    case 2: return Math.max(1, baseGrip - 3);
    case 3: return Math.min(100, baseGrip + 1);
    default: return baseGrip;
  }
}

// Generate driver coaching recommendations
function generateDriverCoaching(current, gripIndex, isRaining, trackTemp) {
  // Base recommendations
  let throttleApplication = "Progressive throttle application on corner exits";
  let brakingTechnique = "Standard braking technique - firm initial application tapering to turn-in";
  let corneringApproach = "Standard racing line through corners";
  let adaptationPoints = [];
  
  // Adjust based on conditions
  if (isRaining) {
    throttleApplication = "Extremely gentle throttle application to avoid breaking traction";
    brakingTechnique = "Early, gentle brake application with lighter pressure";
    corneringApproach = "Modified racing line to avoid standing water, later turn-in points";
    adaptationPoints = [
      "Turn 1: Take a wider entry to avoid inside puddles",
      "Turns 3-4: Reduce speed by 20% through this section",
      "Turn 7: Avoid aggressive curb usage, stay on smooth surface"
    ];
  } else if (gripIndex < 50) {
    throttleApplication = "Cautious throttle application, especially on corner exits";
    brakingTechnique = "Earlier braking points with reduced pressure";
    corneringApproach = "Conservative apex speeds with focus on exit stability";
    adaptationPoints = [
      "Turn 2: Reduce entry speed by 15%",
      "Turn 5: Square off the corner for better stability",
      "Turn 9: Avoid aggressive direction changes, smooth inputs required"
    ];
  } else if (trackTemp > 90) {
    throttleApplication = "Standard throttle application, but minimize wheelspin to manage tire temps";
    corneringApproach = "Standard racing line with focus on minimizing lateral load durations";
    adaptationPoints = [
      "Turns 4-5: Minimize time spent at maximum lateral load",
      "Turn 8: Short shift to reduce wheelspin and tire temperature",
      "All turns: Minimize steering input duration to reduce tire surface temp"
    ];
  }
  
  return {
    throttle_application: throttleApplication,
    braking_technique: brakingTechnique,
    cornering_approach: corneringApproach,
    key_adaptation_points: adaptationPoints,
    priority_focus: isRaining ? 
      "Maintaining traction in all phases of cornering" : 
      (gripIndex < 50 ? 
        "Smooth inputs to maximize available grip" : 
        "Consistency and optimizing lap time")
  };
}

// Formulate race strategy based on conditions
function formulateRaceStrategy(
  trackTemp, 
  gripIndex, 
  rainForecast, 
  temperatureTrend, 
  trackEvolution, 
  tireRecommendations,
  units
) {
  // Base strategy components
  let overallStrategy = "Standard dry weather strategy";
  let pitStopRecommendation = "Standard pit window";
  let riskAssessment = "Medium risk profile";
  
  // Adjust for conditions
  if (rainForecast.expected && rainForecast.time_to_rain < 3) {
    overallStrategy = "Prepare for changing conditions - weather transition imminent";
    pitStopRecommendation = "Consider early stop before rain if within window";
    riskAssessment = "High risk - uncertain grip levels expected";
  } else if (gripIndex < 50) {
    overallStrategy = "Conservative approach - focus on mistake minimization";
    pitStopRecommendation = "Standard timing, consider alternative compounds";
    riskAssessment = "High risk - reduced margins for error";
  } else if (trackTemp > 90 && units === 'imperial') {
    overallStrategy = "Heat management focus - preserve tires and brakes";
    pitStopRecommendation = "Consider earlier stops if thermal degradation appears";
    riskAssessment = "Medium-high risk - thermal management critical";
  } else if (trackEvolution.evolution === "Improving" && trackEvolution.deltaLastHour > 2) {
    overallStrategy = "Progressive push strategy - track improving steadily";
    pitStopRecommendation = "Standard timing - expect faster pace in second stint";
    riskAssessment = "Medium-low risk - conditions improving";
  }
  
  return {
    overall_approach: overallStrategy,
    pit_stop_recommendation: pitStopRecommendation,
    risk_assessment: riskAssessment,
    tire_strategy: {
      starting_compound: tireRecommendations.optimal_compound,
      estimated_wear_rate: tireRecommendations.wear_rate,
      stint_length_recommendation: getStintLengthRecommendation(
        tireRecommendations.wear_rate,
        rainForecast.expected,
        trackTemp
      ),
      compound_progression: getCompoundProgression(
        tireRecommendations.optimal_compound,
        rainForecast,
        temperatureTrend,
        trackEvolution
      )
    }
  };
}

// Get stint length recommendation
function getStintLengthRecommendation(wearRate, rainExpected, trackTemp) {
  if (rainExpected) return "Until weather transition";
  
  switch(wearRate) {
    case "High": return "Short stints (15-20 laps)";
    case "Moderate": return "Standard stints (20-25 laps)";
    case "Low": return "Extended stints (25-30+ laps)";
    default: return "Standard stint length";
  }
}

// Get compound progression recommendation
function getCompoundProgression(startCompound, rainForecast, temperatureTrend, trackEvolution) {
  if (rainForecast.expected && rainForecast.time_to_rain < 5) {
    return `${startCompound} → Intermediate/Wet depending on intensity`;
  }
  
  if (startCompound === "Wet" || startCompound === "Intermediate") {
    return `${startCompound} → Slicks when dry line forms`;
  }
  
  // For dry conditions
  if (temperatureTrend.description === "Rising" || temperatureTrend.description === "Rapidly Rising") {
    // Going from Soft→Medium→Hard if getting hotter
    if (startCompound === "Soft") return "Soft → Medium";
    if (startCompound === "Medium") return "Medium → Hard";
    return "Hard → Hard";
  }
  
  if (temperatureTrend.description === "Falling" || temperatureTrend.description === "Rapidly Falling") {
    // Going from Hard→Medium→Soft if getting cooler
    if (startCompound === "Hard") return "Hard → Medium";
    if (startCompound === "Medium") return "Medium → Soft";
    return "Soft → Soft";
  }
  
  // Default - same compound
  return `${startCompound} → ${startCompound}`;
}

// Generate session advice
function generateSessionAdvice(
  current, 
  trackTemp,
  gripIndex, 
  rainForecast, 
  visibilityImpact, 
  trackEvolution
) {
  // Determine overall conditions
  let overallConditions = "Optimal";
  
  if (gripIndex < 40 || rainForecast.expected || visibilityImpact === "Poor") {
    overallConditions = "Challenging";
  } else if (gripIndex < 70 || trackTemp < 60 || trackTemp > 90) {
    overallConditions = "Moderately challenging";
  }
  
  let advice = "Standard driving approach recommended - conditions are favorable.";
  
  if (overallConditions === "Challenging") {
    advice = "Exercise caution - conditions may require significant adaptation.";
  } else if (overallConditions === "Moderately challenging") {
    advice = "Minor adjustments needed - pay attention to specific areas of concern.";
  }
  
  // Specific advice based on conditions
  const specificAdvice = [];
  
  if (gripIndex < 50) {
    specificAdvice.push("Grip levels are low - reduce corner entry speeds and be gentle with inputs.");
  }
  
  if (rainForecast.expected && rainForecast.time_to_rain < 3) {
    specificAdvice.push("Rain expected soon - be prepared for changing grip levels.");
  }
  
  if (trackTemp < 60) {
    specificAdvice.push("Track temperature is low - focus on tire warmup procedures.");
  } else if (trackTemp > 90) {
    specificAdvice.push("Track temperature is high - manage thermal degradation carefully.");
  }
  
  if (current.wind.speed > 15) {
    specificAdvice.push("Strong winds present - expect crosswind effects particularly on main straights.");
  }
  
  return {
    overall_conditions: overallConditions,
    general_advice: advice,
    specific_recommendations: specificAdvice.length > 0 ? specificAdvice : ["No specific concerns to address"],
    confidence_level: "High"
  };
}

// For compatibility with TypeScript ESM imports
export { getEnhancedAutomotiveWeather };