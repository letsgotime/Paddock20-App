import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  CloudRain, 
  Gauge, 
  Car, 
  Clock, 
  MapPin, 
  AlertTriangle,
  BarChart4,
  Sun,
  CloudSun,
  CloudDrizzle,
  SnowIcon,
  CloudFog,
  Navigation
} from 'lucide-react';

interface DetailedCommuteAnalyticsProps {
  location: {
    id: string;
    name: string;
    type: string;
    icon: React.ReactNode;
    distance: number;
    travelTime: number;
    lat: number;
    lon: number;
    weatherImpact: number;
    tireRecommendation: string;
  };
}

const DetailedCommuteAnalytics: React.FC<DetailedCommuteAnalyticsProps> = ({ location }) => {
  const { weatherData, forecastData, unit } = useWeather();
  const [weatherConditions, setWeatherConditions] = useState<any | null>(null);
  const [projectedConditions, setProjectedConditions] = useState<any | null>(null);
  const [loadingProjections, setLoadingProjections] = useState<boolean>(true);
  const [trafficProjections, setTrafficProjections] = useState<any>(null);
  const [roadSafetyMetrics, setRoadSafetyMetrics] = useState<any>(null);
  const [vehiclePerformanceImpact, setVehiclePerformanceImpact] = useState<any>(null);
  const [weatherTrend, setWeatherTrend] = useState<any>(null);
  
  // Fetch detailed weather and projected data
  useEffect(() => {
    if (forecastData) {
      generateDetailedAnalytics();
    }
  }, [forecastData, location]);
  
  // Generate detailed analytics with projections
  const generateDetailedAnalytics = async () => {
    setLoadingProjections(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate detailed projections based on forecast data
      const projections = generateWeatherProjections();
      setProjectedConditions(projections);
      
      // Generate traffic projections
      const traffic = generateTrafficProjections();
      setTrafficProjections(traffic);
      
      // Generate road safety metrics
      const safety = generateRoadSafetyMetrics(projections);
      setRoadSafetyMetrics(safety);
      
      // Generate vehicle performance impact
      const performance = generateVehiclePerformanceImpact(projections);
      setVehiclePerformanceImpact(performance);
      
      // Generate weather trend analysis
      const trend = generateWeatherTrend();
      setWeatherTrend(trend);
      
      setLoadingProjections(false);
    } catch (error) {
      console.error("Error generating commute analytics:", error);
      setLoadingProjections(false);
    }
  };
  
  // Generate weather projections
  const generateWeatherProjections = () => {
    if (!forecastData || !forecastData.list) return null;
    
    // Get estimated commute time
    const commuteMinutes = location.travelTime;
    
    // Calculate arrival time
    const departureTime = new Date();
    const arrivalTime = new Date(departureTime.getTime() + commuteMinutes * 60 * 1000);
    
    // Find the closest forecast to arrival time
    let closestForecast = forecastData.list[0];
    let minTimeDiff = Infinity;
    
    for (const forecast of forecastData.list) {
      const forecastTime = new Date(forecast.dt * 1000);
      const timeDiff = Math.abs(forecastTime.getTime() - arrivalTime.getTime());
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestForecast = forecast;
      }
    }
    
    // Get hourly data points for the commute duration (interpolated)
    const hourlyDataPoints = [];
    let currentTime = new Date(departureTime);
    
    while (currentTime <= arrivalTime) {
      // Find closest forecast point to this hour
      let closestHourForecast = forecastData.list[0];
      let minHourDiff = Infinity;
      
      for (const forecast of forecastData.list) {
        const forecastTime = new Date(forecast.dt * 1000);
        const timeDiff = Math.abs(forecastTime.getTime() - currentTime.getTime());
        
        if (timeDiff < minHourDiff) {
          minHourDiff = timeDiff;
          closestHourForecast = forecast;
        }
      }
      
      // Add to hourly data
      hourlyDataPoints.push({
        time: new Date(currentTime),
        forecast: closestHourForecast
      });
      
      // Increment by 15 minutes
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
    }
    
    // Calculate journey impact metrics
    const windImpact = calculateWindImpact(closestForecast.wind.speed);
    const precipitationImpact = calculatePrecipitationImpact(closestForecast);
    const temperatureImpact = calculateTemperatureImpact(closestForecast.main.temp);
    const visibilityImpact = calculateVisibilityImpact(closestForecast);
    
    // Determine road surface projections
    const roadSurfaceTemp = estimateRoadSurfaceTemp(closestForecast.main.temp, closestForecast.weather[0].id);
    const roadCondition = determineRoadCondition(closestForecast, roadSurfaceTemp);
    
    // Return detailed projections
    return {
      departure: {
        time: departureTime,
        forecast: forecastData.list[0]
      },
      arrival: {
        time: arrivalTime,
        forecast: closestForecast
      },
      hourlyDataPoints,
      impacts: {
        wind: windImpact,
        precipitation: precipitationImpact,
        temperature: temperatureImpact,
        visibility: visibilityImpact,
        overall: calculateOverallImpact([windImpact, precipitationImpact, temperatureImpact, visibilityImpact])
      },
      road: {
        surfaceTemp: roadSurfaceTemp,
        condition: roadCondition
      }
    };
  };
  
  // Calculate impact metrics
  const calculateWindImpact = (windSpeed: number) => {
    // Convert to mph if needed
    const windSpeedMph = unit === 'imperial' ? windSpeed : windSpeed * 2.237;
    
    if (windSpeedMph < 5) return { score: 95, level: 'minimal', description: 'Minimal impact on driving' };
    if (windSpeedMph < 10) return { score: 90, level: 'minimal', description: 'Very light crosswind effect' };
    if (windSpeedMph < 15) return { score: 80, level: 'moderate', description: 'Light steering correction needed' };
    if (windSpeedMph < 25) return { score: 65, level: 'significant', description: 'Noticeable vehicle push, requires attention' };
    return { score: 45, level: 'severe', description: 'Strong crosswinds affecting vehicle stability' };
  };
  
  const calculatePrecipitationImpact = (forecast: any) => {
    const weatherId = forecast.weather[0].id;
    
    // Clear or clouds
    if (weatherId >= 800) {
      return { score: 95, level: 'minimal', description: 'Dry conditions, excellent visibility' };
    }
    
    // Mist, fog, etc.
    if (weatherId >= 700 && weatherId < 800) {
      return { score: 70, level: 'moderate', description: 'Reduced visibility, slower speeds recommended' };
    }
    
    // Snow
    if (weatherId >= 600 && weatherId < 700) {
      return { score: 45, level: 'severe', description: 'Snow affecting traction and visibility' };
    }
    
    // Rain
    if (weatherId >= 500 && weatherId < 600) {
      const pop = forecast.pop || 0;
      if (pop < 0.3) return { score: 85, level: 'minimal', description: 'Light rain possible, minimal impact' };
      if (pop < 0.6) return { score: 75, level: 'moderate', description: 'Rain expected, reduced traction' };
      return { score: 60, level: 'significant', description: 'Heavy rain likely, significantly reduced traction' };
    }
    
    // Drizzle
    if (weatherId >= 300 && weatherId < 400) {
      return { score: 80, level: 'moderate', description: 'Light precipitation, slightly reduced traction' };
    }
    
    // Thunderstorms
    if (weatherId >= 200 && weatherId < 300) {
      return { score: 50, level: 'severe', description: 'Thunderstorms, hazardous driving conditions' };
    }
    
    return { score: 90, level: 'minimal', description: 'Good driving conditions' };
  };
  
  const calculateTemperatureImpact = (temp: number) => {
    // Convert to F if needed for logic
    const tempF = unit === 'imperial' ? temp : (temp * 9/5) + 32;
    
    if (tempF < 32) return { score: 60, level: 'significant', description: 'Freezing temperatures, ice possible' };
    if (tempF < 40) return { score: 75, level: 'moderate', description: 'Cold, potential for black ice in shaded areas' };
    if (tempF >= 40 && tempF <= 85) return { score: 95, level: 'minimal', description: 'Optimal temperature range for driving' };
    if (tempF > 85 && tempF <= 95) return { score: 85, level: 'minimal', description: 'Warm, check tire pressure' };
    return { score: 80, level: 'moderate', description: 'Hot, monitor vehicle temperature' };
  };
  
  const calculateVisibilityImpact = (forecast: any) => {
    const weatherId = forecast.weather[0].id;
    const pop = forecast.pop || 0;
    const timeOfDay = new Date(forecast.dt * 1000).getHours();
    const isNighttime = timeOfDay < 6 || timeOfDay > 19;
    
    // Clear or clouds during day
    if (weatherId >= 800 && !isNighttime) {
      return { score: 95, level: 'minimal', description: 'Excellent visibility' };
    }
    
    // Clear or clouds at night
    if (weatherId >= 800 && isNighttime) {
      return { score: 85, level: 'minimal', description: 'Good nighttime visibility' };
    }
    
    // Fog or mist
    if (weatherId >= 700 && weatherId < 800) {
      if (isNighttime) {
        return { score: 55, level: 'severe', description: 'Significantly reduced visibility in fog/mist at night' };
      }
      return { score: 65, level: 'significant', description: 'Reduced visibility in fog/mist' };
    }
    
    // Heavy precipitation
    if (((weatherId >= 200 && weatherId < 300) || (weatherId >= 500 && weatherId < 600) && pop > 0.6)) {
      if (isNighttime) {
        return { score: 50, level: 'severe', description: 'Severely limited visibility in heavy rain at night' };
      }
      return { score: 60, level: 'significant', description: 'Poor visibility in heavy precipitation' };
    }
    
    // Snow
    if (weatherId >= 600 && weatherId < 700) {
      if (isNighttime) {
        return { score: 45, level: 'severe', description: 'Very poor visibility in snow at night' };
      }
      return { score: 60, level: 'significant', description: 'Reduced visibility in snow' };
    }
    
    // Light precipitation
    if (isNighttime) {
      return { score: 75, level: 'moderate', description: 'Moderately reduced nighttime visibility' };
    }
    
    return { score: 85, level: 'minimal', description: 'Generally good visibility' };
  };
  
  const calculateOverallImpact = (impacts: Array<{score: number, level: string, description: string}>) => {
    const avgScore = impacts.reduce((sum, impact) => sum + impact.score, 0) / impacts.length;
    
    if (avgScore >= 85) return { score: Math.round(avgScore), level: 'minimal', description: 'Excellent driving conditions' };
    if (avgScore >= 75) return { score: Math.round(avgScore), level: 'minimal', description: 'Good driving conditions' };
    if (avgScore >= 65) return { score: Math.round(avgScore), level: 'moderate', description: 'Moderate driving challenges' };
    if (avgScore >= 55) return { score: Math.round(avgScore), level: 'significant', description: 'Significant driving challenges' };
    return { score: Math.round(avgScore), level: 'severe', description: 'Severe driving conditions' };
  };
  
  // Estimate road surface temperature based on air temperature and weather
  const estimateRoadSurfaceTemp = (airTemp: number, weatherId: number) => {
    // Road surface is usually warmer than air during day and colder at night
    const timeOfDay = new Date().getHours();
    const isDaytime = timeOfDay >= 10 && timeOfDay <= 16;
    
    let surfaceTemp = airTemp;
    
    // During sunny days, road surface can be significantly warmer
    if (weatherId >= 800 && isDaytime) {
      surfaceTemp += unit === 'imperial' ? 10 : 5.6; // Add 10°F or 5.6°C
    }
    // During clear nights, road surface can be cooler
    else if (weatherId >= 800 && !isDaytime) {
      surfaceTemp -= unit === 'imperial' ? 5 : 2.8; // Subtract 5°F or 2.8°C
    }
    // During rainy weather, road surface temperature tends toward air temperature
    else if (weatherId >= 300 && weatherId < 600) {
      surfaceTemp = airTemp;
    }
    // During snowy weather, road surface usually stays near freezing
    else if (weatherId >= 600 && weatherId < 700) {
      const freezing = unit === 'imperial' ? 32 : 0;
      surfaceTemp = Math.min(airTemp, freezing + (unit === 'imperial' ? 2 : 1.1));
    }
    
    return Math.round(surfaceTemp);
  };
  
  // Determine road condition based on weather and surface temperature
  const determineRoadCondition = (forecast: any, surfaceTemp: number) => {
    const weatherId = forecast.weather[0].id;
    const freezingPoint = unit === 'imperial' ? 32 : 0;
    
    // Thunderstorms
    if (weatherId >= 200 && weatherId < 300) {
      return { condition: 'Wet', traction: 'Poor', hydroplaning: 'High risk', description: 'Heavy rain causing water pooling on roads' };
    }
    
    // Drizzle
    if (weatherId >= 300 && weatherId < 400) {
      return { condition: 'Damp', traction: 'Fair', hydroplaning: 'Low risk', description: 'Light moisture on road surface' };
    }
    
    // Rain
    if (weatherId >= 500 && weatherId < 600) {
      const heavyRain = weatherId >= 502;
      if (heavyRain) {
        return { condition: 'Very wet', traction: 'Poor', hydroplaning: 'High risk', description: 'Significant water on roads, possible flooding' };
      }
      return { condition: 'Wet', traction: 'Reduced', hydroplaning: 'Moderate risk', description: 'Wet roads with potential for standing water' };
    }
    
    // Snow
    if (weatherId >= 600 && weatherId < 700) {
      if (surfaceTemp > freezingPoint) {
        return { condition: 'Slushy', traction: 'Poor', hydroplaning: 'Moderate risk', description: 'Melting snow creating slush on roads' };
      }
      return { condition: 'Snow-covered', traction: 'Very poor', hydroplaning: 'Low risk', description: 'Snow accumulation reducing traction significantly' };
    }
    
    // Fog, mist
    if (weatherId >= 700 && weatherId < 800) {
      if (surfaceTemp <= freezingPoint) {
        return { condition: 'Icy patches', traction: 'Very poor', hydroplaning: 'Low risk', description: 'Moisture from fog freezing on cold road surfaces' };
      }
      return { condition: 'Damp', traction: 'Good to fair', hydroplaning: 'Low risk', description: 'Light moisture from humidity on road surface' };
    }
    
    // Clear or cloudy
    if (weatherId >= 800) {
      if (surfaceTemp <= freezingPoint) {
        return { condition: 'Potentially icy', traction: 'Variable', hydroplaning: 'Low risk', description: 'Cold surfaces may have ice in shaded areas' };
      }
      return { condition: 'Dry', traction: 'Excellent', hydroplaning: 'No risk', description: 'Optimal road conditions' };
    }
    
    return { condition: 'Unknown', traction: 'Unknown', hydroplaning: 'Unknown', description: 'Unable to determine road conditions' };
  };
  
  // Generate traffic projections based on time and weather
  const generateTrafficProjections = () => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isRushHour = !isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18));
    const isBusinessHours = !isWeekend && hour >= 9 && hour <= 17;
    
    let congestionLevel = 'low';
    let speedImpact = 0;
    let description = '';
    
    // Determine base traffic level by time of day
    if (isRushHour) {
      congestionLevel = 'high';
      speedImpact = -35; // percent slower
      description = 'Rush hour traffic, significant congestion expected';
    } else if (isBusinessHours) {
      congestionLevel = 'moderate';
      speedImpact = -15; // percent slower
      description = 'Regular business hour traffic, moderate congestion possible';
    } else if (hour >= 19 && hour <= 23) {
      congestionLevel = 'low';
      speedImpact = -5; // percent slower
      description = 'Evening traffic, generally flowing well';
    } else {
      congestionLevel = 'minimal';
      speedImpact = 0; // no impact
      description = 'Light traffic, free-flowing conditions';
    }
    
    // Adjust for weather impacts if we have projected conditions
    if (projectedConditions) {
      const weatherImpact = projectedConditions.impacts.overall;
      
      // Severe weather adds significant traffic
      if (weatherImpact.level === 'severe') {
        if (congestionLevel === 'high') {
          congestionLevel = 'severe';
          speedImpact -= 15;
          description = 'Severe traffic due to rush hour and hazardous weather';
        } else {
          congestionLevel = congestionLevel === 'moderate' ? 'high' : 'moderate';
          speedImpact -= 20;
          description = `${description} combined with weather-related slowdowns`;
        }
      } 
      // Significant weather impacts
      else if (weatherImpact.level === 'significant') {
        speedImpact -= 10;
        description = `${description} with additional delays from weather conditions`;
      }
      // Moderate weather impacts
      else if (weatherImpact.level === 'moderate') {
        speedImpact -= 5;
        description = `${description} with slight delays from weather conditions`;
      }
    }
    
    // Calculate adjusted travel time
    const baseMinutes = location.travelTime;
    const adjustedMinutes = Math.round(baseMinutes * (1 + speedImpact / 100));
    const timeImpact = adjustedMinutes - baseMinutes;
    
    return {
      congestionLevel,
      speedImpact,
      description,
      baseMinutes,
      adjustedMinutes,
      timeImpact
    };
  };
  
  // Generate road safety metrics based on weather projections
  const generateRoadSafetyMetrics = (projections: any) => {
    if (!projections) return null;
    
    const { impacts, road } = projections;
    
    // Calculate stopping distance adjustment based on conditions
    let stoppingDistanceFactors = [];
    let safetyTips = [];
    
    // Base stopping distance for dry conditions at 60mph is ~180 feet
    // (thinking distance ~60ft + braking distance ~120ft)
    const baseStoppingFeet = 180;
    
    // Road conditions affect braking distance
    if (road.condition.condition === 'Wet' || road.condition.condition === 'Damp') {
      stoppingDistanceFactors.push(1.5); // 50% increase
      safetyTips.push('Increase following distance on wet roads');
    } else if (road.condition.condition === 'Very wet') {
      stoppingDistanceFactors.push(2.0); // 100% increase
      safetyTips.push('Double your following distance in heavy rain');
    } else if (road.condition.condition === 'Slushy' || road.condition.condition === 'Snow-covered') {
      stoppingDistanceFactors.push(3.0); // 200% increase
      safetyTips.push('Triple your following distance in snow or slush');
    } else if (road.condition.condition === 'Icy patches' || road.condition.condition === 'Potentially icy') {
      stoppingDistanceFactors.push(10.0); // 900% increase
      safetyTips.push('Extreme caution needed - stopping distance increases up to 10x on ice');
    } else {
      stoppingDistanceFactors.push(1.0); // No increase
    }
    
    // Visibility affects reaction time
    if (impacts.visibility.level === 'severe') {
      stoppingDistanceFactors.push(1.3);
      safetyTips.push('Severely reduced visibility - slow down significantly');
    } else if (impacts.visibility.level === 'significant') {
      stoppingDistanceFactors.push(1.2);
      safetyTips.push('Poor visibility conditions - reduce speed accordingly');
    } else if (impacts.visibility.level === 'moderate') {
      stoppingDistanceFactors.push(1.1);
      safetyTips.push('Moderately reduced visibility - exercise caution');
    }
    
    // Calculate total stopping distance adjustment
    const stoppingDistanceFactor = stoppingDistanceFactors.reduce((a, b) => a * b, 1);
    const adjustedStoppingFeet = Math.round(baseStoppingFeet * stoppingDistanceFactor);
    
    // Convert to car lengths (assume 15ft per car)
    const carLengths = Math.round(adjustedStoppingFeet / 15);
    
    // Calculate recommended speed adjustment
    let speedAdjustment = 0;
    
    if (impacts.overall.level === 'severe') {
      speedAdjustment = -45; // 45% reduction recommended
      safetyTips.push('Reduce speed by at least 45% in these conditions');
    } else if (impacts.overall.level === 'significant') {
      speedAdjustment = -30; // 30% reduction recommended
      safetyTips.push('Reduce speed by 25-30% to maintain control');
    } else if (impacts.overall.level === 'moderate') {
      speedAdjustment = -15; // 15% reduction recommended
      safetyTips.push('Moderate speed reduction (15%) recommended');
    } else {
      safetyTips.push('Maintain safe speeds for conditions');
    }
    
    // Calculate safety score
    const safetyScore = Math.max(10, Math.min(100, Math.round(100 - (stoppingDistanceFactor - 1) * 50)));
    
    // Determine overall risk level
    let riskLevel = 'low';
    if (safetyScore < 40) riskLevel = 'extreme';
    else if (safetyScore < 60) riskLevel = 'high';
    else if (safetyScore < 80) riskLevel = 'moderate';
    
    // Limit to 3 safety tips
    const limitedTips = safetyTips.slice(0, 3);
    
    return {
      stoppingDistance: {
        feet: adjustedStoppingFeet,
        factor: stoppingDistanceFactor.toFixed(1) + 'x',
        carLengths
      },
      speedAdjustment,
      safetyScore,
      riskLevel,
      safetyTips: limitedTips
    };
  };
  
  // Generate vehicle performance impact data
  const generateVehiclePerformanceImpact = (projections: any) => {
    if (!projections) return null;
    
    const { impacts, road, arrival } = projections;
    const surfaceTemp = road.surfaceTemp;
    const weatherId = arrival.forecast.weather[0].id;
    
    const performanceImpacts = {
      tireGrip: { value: 0, description: '' },
      fuelEfficiency: { value: 0, description: '' },
      batteryRange: { value: 0, description: '' }, // For electric vehicles
      handlingResponse: { value: 0, description: '' },
      recommendations: [] as string[]
    };
    
    // Tire grip impact
    if (road.condition.condition === 'Dry') {
      performanceImpacts.tireGrip.value = 100;
      performanceImpacts.tireGrip.description = 'Optimal tire grip on dry roads';
    } else if (road.condition.condition === 'Damp') {
      performanceImpacts.tireGrip.value = 85;
      performanceImpacts.tireGrip.description = 'Slightly reduced tire grip on damp surfaces';
      performanceImpacts.recommendations.push('Gentle acceleration and braking recommended');
    } else if (road.condition.condition === 'Wet') {
      performanceImpacts.tireGrip.value = 70;
      performanceImpacts.tireGrip.description = 'Significantly reduced tire grip on wet roads';
      performanceImpacts.recommendations.push('Reduce speed in corners and avoid sudden maneuvers');
    } else if (road.condition.condition === 'Very wet') {
      performanceImpacts.tireGrip.value = 55;
      performanceImpacts.tireGrip.description = 'Poor tire grip in very wet conditions';
      performanceImpacts.recommendations.push('Use gentle inputs and increase following distances');
    } else if (road.condition.condition === 'Snow-covered' || road.condition.condition === 'Slushy') {
      performanceImpacts.tireGrip.value = 35;
      performanceImpacts.tireGrip.description = 'Very poor tire grip in snow/slush';
      performanceImpacts.recommendations.push('Snow tires or chains recommended if available');
    } else if (road.condition.condition.includes('Icy')) {
      performanceImpacts.tireGrip.value = 15;
      performanceImpacts.tireGrip.description = 'Minimal tire grip on icy surfaces';
      performanceImpacts.recommendations.push('Extreme caution needed, avoid unnecessary travel if possible');
    }
    
    // Fuel efficiency impact
    // Temperature impacts
    const tempF = unit === 'imperial' ? surfaceTemp : (surfaceTemp * 9/5) + 32;
    if (tempF < 32) {
      performanceImpacts.fuelEfficiency.value = -15;
      performanceImpacts.fuelEfficiency.description = 'Cold temperatures significantly reduce fuel efficiency';
      performanceImpacts.batteryRange.value = -30;
      performanceImpacts.batteryRange.description = 'Cold severely impacts EV battery range';
      performanceImpacts.recommendations.push('Allow extra range margin for EVs in cold weather');
    } else if (tempF < 45) {
      performanceImpacts.fuelEfficiency.value = -8;
      performanceImpacts.fuelEfficiency.description = 'Cool temperatures moderately reduce fuel efficiency';
      performanceImpacts.batteryRange.value = -15;
      performanceImpacts.batteryRange.description = 'Cool weather reduces EV range';
    } else if (tempF > 90) {
      performanceImpacts.fuelEfficiency.value = -5;
      performanceImpacts.fuelEfficiency.description = 'Hot weather slightly reduces fuel efficiency';
      performanceImpacts.batteryRange.value = -10;
      performanceImpacts.batteryRange.description = 'Heat reduces EV range due to climate control usage';
    } else {
      performanceImpacts.fuelEfficiency.value = 0;
      performanceImpacts.fuelEfficiency.description = 'Optimal temperature range for fuel efficiency';
      performanceImpacts.batteryRange.value = 0;
      performanceImpacts.batteryRange.description = 'Ideal temperature for battery performance';
    }
    
    // Wind impact on fuel efficiency
    if (impacts.wind.level === 'severe' || impacts.wind.level === 'significant') {
      performanceImpacts.fuelEfficiency.value -= 7;
      if (performanceImpacts.fuelEfficiency.description) {
        performanceImpacts.fuelEfficiency.description += ' with additional impact from high winds';
      } else {
        performanceImpacts.fuelEfficiency.description = 'High winds reducing aerodynamic efficiency';
      }
      performanceImpacts.batteryRange.value -= 5;
      performanceImpacts.recommendations.push('Wind resistance increases consumption - drive at moderate speeds');
    }
    
    // Handling response
    if (road.condition.traction === 'Excellent') {
      performanceImpacts.handlingResponse.value = 100;
      performanceImpacts.handlingResponse.description = 'Responsive and precise handling';
    } else if (road.condition.traction === 'Good' || road.condition.traction === 'Good to fair') {
      performanceImpacts.handlingResponse.value = 85;
      performanceImpacts.handlingResponse.description = 'Good handling response with minimal delay';
    } else if (road.condition.traction === 'Fair' || road.condition.traction === 'Reduced') {
      performanceImpacts.handlingResponse.value = 70;
      performanceImpacts.handlingResponse.description = 'Delayed response time to steering inputs';
      performanceImpacts.recommendations.push('Smoother steering inputs recommended');
    } else if (road.condition.traction === 'Poor') {
      performanceImpacts.handlingResponse.value = 50;
      performanceImpacts.handlingResponse.description = 'Significantly compromised handling';
      performanceImpacts.recommendations.push('Avoid quick steering corrections');
    } else if (road.condition.traction === 'Very poor') {
      performanceImpacts.handlingResponse.value = 30;
      performanceImpacts.handlingResponse.description = 'Severely limited vehicle control';
      performanceImpacts.recommendations.push('Minimal steering inputs and extreme caution required');
    } else {
      performanceImpacts.handlingResponse.value = 75;
      performanceImpacts.handlingResponse.description = 'Average handling response';
    }
    
    // Limit to most important 3 recommendations
    performanceImpacts.recommendations = performanceImpacts.recommendations.slice(0, 3);
    
    return performanceImpacts;
  };
  
  // Generate weather trend analysis
  const generateWeatherTrend = () => {
    if (!forecastData || !forecastData.list || forecastData.list.length < 3) return null;
    
    const nextThreeForecasts = forecastData.list.slice(0, 3);
    
    // Extract weather conditions, temps, and precipitation probability
    const conditions = nextThreeForecasts.map(f => ({
      time: new Date(f.dt * 1000),
      weatherId: f.weather[0].id,
      description: f.weather[0].description,
      temp: f.main.temp,
      pop: f.pop || 0
    }));
    
    // Analyze temperature trend
    const temps = conditions.map(c => c.temp);
    let tempTrend = 'stable';
    if (temps[2] > temps[0] + (unit === 'imperial' ? 3 : 1.7)) tempTrend = 'rising';
    else if (temps[2] < temps[0] - (unit === 'imperial' ? 3 : 1.7)) tempTrend = 'falling';
    
    // Analyze precipitation trend
    const pops = conditions.map(c => c.pop);
    let precipTrend = 'stable';
    if (pops[2] > pops[0] + 0.2) precipTrend = 'increasing';
    else if (pops[2] < pops[0] - 0.2) precipTrend = 'decreasing';
    
    // Analyze weather condition change
    let conditionChange = 'stable';
    const firstWeatherId = conditions[0].weatherId;
    const lastWeatherId = conditions[2].weatherId;
    
    // Check if moving to worse weather
    if (
      (firstWeatherId >= 800 && lastWeatherId < 800) || // Clear to any weather
      ((firstWeatherId >= 700 && firstWeatherId < 800) && lastWeatherId < 700) || // Atmosphere to precip
      ((firstWeatherId >= 300 && firstWeatherId < 600) && (lastWeatherId >= 200 && lastWeatherId < 300)) // Rain to thunderstorm
    ) {
      conditionChange = 'deteriorating';
    }
    // Check if moving to better weather
    else if (
      (lastWeatherId >= 800 && firstWeatherId < 800) || // Any weather to clear
      ((lastWeatherId >= 700 && lastWeatherId < 800) && firstWeatherId < 700) || // Precip to atmosphere
      ((lastWeatherId >= 300 && lastWeatherId < 600) && (firstWeatherId >= 200 && firstWeatherId < 300)) // Thunderstorm to rain
    ) {
      conditionChange = 'improving';
    }
    
    // Determine overall trend message
    let overallTrend = 'Conditions expected to remain consistent during trip';
    
    if (conditionChange === 'deteriorating') {
      overallTrend = 'Weather conditions expected to worsen during trip';
    } else if (conditionChange === 'improving') {
      overallTrend = 'Weather conditions expected to improve during trip';
    } else if (tempTrend === 'rising' && precipTrend === 'increasing') {
      overallTrend = 'Warmer with increased chance of precipitation';
    } else if (tempTrend === 'falling' && precipTrend === 'increasing') {
      overallTrend = 'Cooling with increased chance of precipitation';
    } else if (tempTrend === 'rising') {
      overallTrend = 'Temperatures rising during trip';
    } else if (tempTrend === 'falling') {
      overallTrend = 'Temperatures falling during trip';
    } else if (precipTrend === 'increasing') {
      overallTrend = 'Increasing chance of precipitation';
    } else if (precipTrend === 'decreasing') {
      overallTrend = 'Decreasing chance of precipitation';
    }
    
    return {
      points: conditions,
      tempTrend,
      precipTrend,
      conditionChange,
      overallTrend
    };
  };
  
  // Helper function to get weather icon
  const getWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) return <CloudDrizzle className="h-5 w-5 text-blue-400" />;
    if (weatherId >= 300 && weatherId < 500) return <CloudDrizzle className="h-5 w-5 text-blue-400" />;
    if (weatherId >= 500 && weatherId < 600) return <CloudRain className="h-5 w-5 text-blue-400" />;
    if (weatherId >= 600 && weatherId < 700) return <SnowIcon className="h-5 w-5 text-blue-400" />;
    if (weatherId >= 700 && weatherId < 800) return <CloudFog className="h-5 w-5 text-blue-400" />;
    if (weatherId === 800) return <Sun className="h-5 w-5 text-yellow-400" />;
    if (weatherId > 800) return <CloudSun className="h-5 w-5 text-blue-400" />;
    return <Sun className="h-5 w-5 text-blue-400" />;
  };
  
  // Helper function to get severity color
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'severe': 
      case 'extreme':
      case 'high':
        return 'text-red-400';
      case 'significant':
      case 'moderate':
        return 'text-yellow-400';
      case 'minimal':
      case 'low':
      default:
        return 'text-green-400';
    }
  };
  
  // Helper function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  return (
    <div className="bg-black/20 p-5 rounded-lg space-y-6 animate-fadein">
      {loadingProjections ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Generating detailed analysis...</p>
        </div>
      ) : projectedConditions ? (
        <>
          {/* Journey Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <h3 className="text-white text-lg font-semibold mb-3 flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-400" />
                {location.name} Journey Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Departure</span>
                    <span className="text-white text-sm">{formatTime(projectedConditions.departure.time)}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {getWeatherIcon(projectedConditions.departure.forecast.weather[0].id)}
                    <span className="ml-2 text-gray-300 capitalize">
                      {projectedConditions.departure.forecast.weather[0].description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                    <div className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-300">
                        {Math.round(projectedConditions.departure.forecast.main.temp)}°{unit === 'imperial' ? 'F' : 'C'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-300">
                        {Math.round(projectedConditions.departure.forecast.wind.speed)}{unit === 'imperial' ? 'mph' : 'm/s'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Arrival (Est.)</span>
                    <span className="text-white text-sm">{formatTime(projectedConditions.arrival.time)}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {getWeatherIcon(projectedConditions.arrival.forecast.weather[0].id)}
                    <span className="ml-2 text-gray-300 capitalize">
                      {projectedConditions.arrival.forecast.weather[0].description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                    <div className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-300">
                        {Math.round(projectedConditions.arrival.forecast.main.temp)}°{unit === 'imperial' ? 'F' : 'C'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-300">
                        {Math.round(projectedConditions.arrival.forecast.wind.speed)}{unit === 'imperial' ? 'mph' : 'm/s'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Weather Trend */}
              {weatherTrend && (
                <div className="bg-black/40 border border-gray-800 rounded-lg p-3 mb-4">
                  <h4 className="text-blue-400 text-sm font-semibold mb-2">Weather Trend During Journey</h4>
                  <p className="text-gray-300 text-sm mb-2">{weatherTrend.overallTrend}</p>
                  
                  <div className="flex items-center space-x-2 text-gray-400 text-xs">
                    <span className={weatherTrend.tempTrend === 'rising' ? 'text-red-400' : weatherTrend.tempTrend === 'falling' ? 'text-blue-400' : 'text-gray-400'}>
                      Temp: {weatherTrend.tempTrend}
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className={weatherTrend.precipTrend === 'increasing' ? 'text-blue-400' : weatherTrend.precipTrend === 'decreasing' ? 'text-green-400' : 'text-gray-400'}>
                      Precip: {weatherTrend.precipTrend}
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className={weatherTrend.conditionChange === 'improving' ? 'text-green-400' : weatherTrend.conditionChange === 'deteriorating' ? 'text-red-400' : 'text-gray-400'}>
                      Conditions: {weatherTrend.conditionChange}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Journey Stats */}
            <div>
              <h4 className="text-blue-400 text-sm font-semibold mb-2">Journey Statistics</h4>
              <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center">
                      <Car className="h-4 w-4 mr-1" /> Distance
                    </span>
                    <span className="text-white">{location.distance} miles</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Base Travel Time
                    </span>
                    <span className="text-white">{location.travelTime} mins</span>
                  </div>
                  
                  {trafficProjections && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Adjusted Travel Time
                      </span>
                      <span className={trafficProjections.timeImpact > 5 ? 'text-yellow-400' : 'text-white'}>
                        {trafficProjections.adjustedMinutes} mins
                        {trafficProjections.timeImpact > 0 && (
                          <span className="text-yellow-400 text-xs ml-1">
                            (+{trafficProjections.timeImpact})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center">
                      <Thermometer className="h-4 w-4 mr-1" /> Road Surface Temp
                    </span>
                    <span className="text-white">
                      {projectedConditions.road.surfaceTemp}°{unit === 'imperial' ? 'F' : 'C'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Weather Impact
                    </span>
                    <span className={`${getSeverityColor(projectedConditions.impacts.overall.level)}`}>
                      {projectedConditions.impacts.overall.level.charAt(0).toUpperCase() + projectedConditions.impacts.overall.level.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Analysis Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Road Conditions */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
              <h4 className="text-blue-400 text-sm font-semibold mb-3">Road Conditions</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Road Surface</span>
                  <span className="text-white">{projectedConditions.road.condition.condition}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Traction</span>
                  <span className={`${
                    projectedConditions.road.condition.traction === 'Excellent' || projectedConditions.road.condition.traction === 'Good' ? 'text-green-400' :
                    projectedConditions.road.condition.traction === 'Fair' || projectedConditions.road.condition.traction === 'Reduced' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {projectedConditions.road.condition.traction}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Hydroplaning Risk</span>
                  <span className={`${
                    projectedConditions.road.condition.hydroplaning === 'No risk' || projectedConditions.road.condition.hydroplaning === 'Low risk' ? 'text-green-400' :
                    projectedConditions.road.condition.hydroplaning === 'Moderate risk' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {projectedConditions.road.condition.hydroplaning}
                  </span>
                </div>
                
                <div className="text-gray-300 text-xs mt-2 border-t border-gray-800 pt-2">
                  {projectedConditions.road.condition.description}
                </div>
              </div>
            </div>
            
            {/* Traffic Projection */}
            {trafficProjections && (
              <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                <h4 className="text-blue-400 text-sm font-semibold mb-3">Traffic Projection</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Congestion Level</span>
                    <span className={`${
                      trafficProjections.congestionLevel === 'minimal' || trafficProjections.congestionLevel === 'low' ? 'text-green-400' :
                      trafficProjections.congestionLevel === 'moderate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {trafficProjections.congestionLevel.charAt(0).toUpperCase() + trafficProjections.congestionLevel.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Speed Impact</span>
                    <span className={trafficProjections.speedImpact < -20 ? 'text-red-400' : trafficProjections.speedImpact < -10 ? 'text-yellow-400' : 'text-white'}>
                      {trafficProjections.speedImpact}% normal speed
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Original Time</span>
                    <span className="text-white">{trafficProjections.baseMinutes} mins</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Expected Time</span>
                    <span className={trafficProjections.timeImpact > 10 ? 'text-red-400' : trafficProjections.timeImpact > 5 ? 'text-yellow-400' : 'text-white'}>
                      {trafficProjections.adjustedMinutes} mins
                      {trafficProjections.timeImpact > 0 && (
                        <span className="text-yellow-400 text-xs ml-1">
                          (+{trafficProjections.timeImpact})
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="text-gray-300 text-xs mt-2 border-t border-gray-800 pt-2">
                    {trafficProjections.description}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Advanced Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Safety Metrics */}
            {roadSafetyMetrics && (
              <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                <h4 className="text-blue-400 text-sm font-semibold mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Safety Metrics
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Safety Rating</span>
                      <span className={roadSafetyMetrics.safetyScore >= 80 ? 'text-green-400' : 
                                      roadSafetyMetrics.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {roadSafetyMetrics.safetyScore}/100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          roadSafetyMetrics.safetyScore >= 80 ? 'bg-green-500' : 
                          roadSafetyMetrics.safetyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${roadSafetyMetrics.safetyScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Risk Level</span>
                    <span className={`${
                      roadSafetyMetrics.riskLevel === 'low' ? 'text-green-400' :
                      roadSafetyMetrics.riskLevel === 'moderate' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {roadSafetyMetrics.riskLevel.charAt(0).toUpperCase() + roadSafetyMetrics.riskLevel.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Stopping Distance</span>
                    <span className="text-white">
                      {roadSafetyMetrics.stoppingDistance.feet} ft ({roadSafetyMetrics.stoppingDistance.factor})
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Following Distance</span>
                    <span className="text-white">
                      {roadSafetyMetrics.stoppingDistance.carLengths} car lengths
                    </span>
                  </div>
                  
                  {roadSafetyMetrics.speedAdjustment !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Speed Adjustment</span>
                      <span className="text-yellow-400">
                        {roadSafetyMetrics.speedAdjustment}% recommended
                      </span>
                    </div>
                  )}
                  
                  {roadSafetyMetrics.safetyTips.length > 0 && (
                    <div className="text-gray-300 text-xs mt-2 border-t border-gray-800 pt-2">
                      <ul className="space-y-1">
                        {roadSafetyMetrics.safetyTips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-400 mr-1">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Vehicle Performance Impact */}
            {vehiclePerformanceImpact && (
              <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                <h4 className="text-blue-400 text-sm font-semibold mb-3 flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Performance Impact
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Tire Grip</span>
                      <span className={vehiclePerformanceImpact.tireGrip.value >= 80 ? 'text-green-400' : 
                                      vehiclePerformanceImpact.tireGrip.value >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {vehiclePerformanceImpact.tireGrip.value}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          vehiclePerformanceImpact.tireGrip.value >= 80 ? 'bg-green-500' : 
                          vehiclePerformanceImpact.tireGrip.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${vehiclePerformanceImpact.tireGrip.value}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400 text-sm">Handling Response</span>
                      <span className={vehiclePerformanceImpact.handlingResponse.value >= 80 ? 'text-green-400' : 
                                      vehiclePerformanceImpact.handlingResponse.value >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {vehiclePerformanceImpact.handlingResponse.value}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          vehiclePerformanceImpact.handlingResponse.value >= 80 ? 'bg-green-500' : 
                          vehiclePerformanceImpact.handlingResponse.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${vehiclePerformanceImpact.handlingResponse.value}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Fuel Efficiency Impact</span>
                    <span className={vehiclePerformanceImpact.fuelEfficiency.value >= 0 ? 'text-green-400' : 
                                    vehiclePerformanceImpact.fuelEfficiency.value >= -10 ? 'text-yellow-400' : 'text-red-400'}>
                      {vehiclePerformanceImpact.fuelEfficiency.value >= 0 ? '+' : ''}{vehiclePerformanceImpact.fuelEfficiency.value}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">EV Range Impact</span>
                    <span className={vehiclePerformanceImpact.batteryRange.value >= 0 ? 'text-green-400' : 
                                    vehiclePerformanceImpact.batteryRange.value >= -15 ? 'text-yellow-400' : 'text-red-400'}>
                      {vehiclePerformanceImpact.batteryRange.value >= 0 ? '+' : ''}{vehiclePerformanceImpact.batteryRange.value}%
                    </span>
                  </div>
                  
                  {vehiclePerformanceImpact.recommendations.length > 0 && (
                    <div className="text-gray-300 text-xs mt-2 border-t border-gray-800 pt-2">
                      <ul className="space-y-1">
                        {vehiclePerformanceImpact.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-400 mr-1">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Weather Radar Map Placeholder */}
          <div className="border border-blue-900/30 rounded-lg overflow-hidden">
            <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
              <h4 className="text-blue-400 font-semibold flex items-center">
                <BarChart4 className="h-4 w-4 mr-2" />
                <span>Hourly Weather Projection</span>
              </h4>
              <span className="text-xs text-gray-400">Detailed precipitation forecast</span>
            </div>
            
            <div className="p-4 bg-black/30 overflow-x-auto">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 min-w-[600px]">
                {projectedConditions.hourlyDataPoints.slice(0, 6).map((point, index) => (
                  <div key={index} className="bg-black/40 border border-gray-800 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {formatTime(point.time)}
                    </div>
                    <div className="flex justify-center mb-1">
                      <img 
                        src={`https://openweathermap.org/img/wn/${point.forecast.weather[0].icon}.png`} 
                        alt={point.forecast.weather[0].description}
                        className="w-8 h-8"
                      />
                    </div>
                    <div className="text-white text-sm mb-1">
                      {Math.round(point.forecast.main.temp)}°
                    </div>
                    <div className="text-xs text-gray-400 truncate max-w-full">
                      {(point.forecast.pop * 100).toFixed(0)}% precip
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-full h-32 mt-4 bg-black/20 rounded-lg border border-gray-800 relative overflow-hidden">
                {/* Journey Timeline */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end">
                  {projectedConditions.hourlyDataPoints.map((point, index, arr) => {
                    const progress = index / (arr.length - 1);
                    const popHeight = (point.forecast.pop || 0) * 100;
                    const hasRain = point.forecast.weather[0].id >= 300 && point.forecast.weather[0].id < 600;
                    const hasSnow = point.forecast.weather[0].id >= 600 && point.forecast.weather[0].id < 700;
                    const color = hasSnow ? 'bg-blue-200/70' : hasRain ? 'bg-blue-500/70' : 'bg-blue-300/20';
                    
                    return (
                      <div 
                        key={index}
                        className="relative flex-1 flex items-end justify-center"
                        style={{ height: '100%' }}
                      >
                        <div 
                          className={`w-full ${color}`}
                          style={{ height: `${Math.max(4, popHeight)}%` }}
                        ></div>
                        
                        {index === 0 || index === arr.length - 1 ? (
                          <div className="absolute bottom-0 text-xs text-gray-400 transform translate-y-full pt-1">
                            {formatTime(point.time)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="absolute top-0 right-0 p-1 flex items-center space-x-2 text-xs text-gray-400">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500/70 mr-1"></div>
                    <span>Rain</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-200/70 mr-1"></div>
                    <span>Snow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-6 text-gray-400">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p>Unable to generate detailed analytics. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default DetailedCommuteAnalytics;