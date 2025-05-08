import { fetchAutomotiveWeather, getOneCallData, AutomotiveWeatherData } from './openWeatherService';

// Types for drive recommendations
export type DriveWindow = {
  day: string;  // "Today" or "Tomorrow"
  timeRange: string; // e.g. "2PM - 5PM"
  rating: number; // 1-5
  description: string;
  conditions: string; // "Optimal", "Good", "Moderate", etc.
  colorClass: string; // Tailwind CSS gradient class
  borderClass: string; // Tailwind CSS border class
};

export type DrivingTip = {
  tip: string;
};

export type PerformanceAdjustment = {
  adjustment: string;
};

// Calculate optimal driving windows based on real weather data
export const getDriveRecommendations = async (
  location: { lat: number; lon: number },
  units: 'metric' | 'imperial' = 'imperial'
): Promise<{
  driveWindows: DriveWindow[];
  drivingTips: DrivingTip[];
  performanceAdjustments: PerformanceAdjustment[];
}> => {
  try {
    // Fetch comprehensive weather data
    const [automotiveData, forecastData] = await Promise.all([
      fetchAutomotiveWeather(location, units),
      getOneCallData(location, units)
    ]);
    
    // Calculate optimal drive windows using real hourly data
    const driveWindows = calculateDriveWindows(forecastData, automotiveData);
    
    // Extract driving tips from automotive data
    const drivingTips = generateDrivingTips(automotiveData);
    
    // Generate performance adjustments based on current conditions
    const performanceAdjustments = generatePerformanceAdjustments(automotiveData);
    
    return {
      driveWindows,
      drivingTips,
      performanceAdjustments
    };
  } catch (error) {
    console.error("Error fetching drive recommendations:", error);
    throw error;
  }
};

// Calculate optimal driving windows using real forecasted data
const calculateDriveWindows = (
  forecastData: any,
  automotiveData: AutomotiveWeatherData
): DriveWindow[] => {
  const windows: DriveWindow[] = [];
  
  if (!forecastData || !forecastData.daily || !forecastData.hourly) {
    return windows;
  }
  
  const hourlyData = forecastData.hourly;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayDate = now.getDate();
  const tomorrowDate = tomorrow.getDate();
  
  // Group hourly forecasts by day
  const todayHours: any[] = [];
  const tomorrowHours: any[] = [];
  
  hourlyData.forEach((hour: any) => {
    const hourDate = new Date(hour.dt * 1000);
    if (hourDate.getDate() === todayDate) {
      todayHours.push(hour);
    } else if (hourDate.getDate() === tomorrowDate) {
      tomorrowHours.push(hour);
    }
  });
  
  // Find optimal windows based on:
  // - Temperature (not too hot, not too cold)
  // - Low precipitation chance
  // - Good visibility
  // - Comfortable humidity
  // - Lower UV index
  
  // Process today's hours to find windows
  if (todayHours.length > 0) {
    const bestWindow = findBestWindow(todayHours, "Today");
    if (bestWindow) windows.push(bestWindow);
  }
  
  // Process tomorrow's hours to find multiple windows
  if (tomorrowHours.length > 0) {
    const bestWindow = findBestWindow(tomorrowHours, "Tomorrow");
    if (bestWindow) windows.push(bestWindow);
    
    // Find a secondary window for tomorrow if available
    const secondaryWindow = findSecondaryWindow(tomorrowHours, bestWindow, "Tomorrow");
    if (secondaryWindow) windows.push(secondaryWindow);
  }
  
  return windows;
};

// Find the best driving window within a set of hours
const findBestWindow = (hours: any[], day: string): DriveWindow | null => {
  if (hours.length < 3) return null;
  
  let bestWindowStart = 0;
  let bestWindowScore = 0;
  let bestWindowLength = 3; // minimum 3 hour window
  
  // Look for a 3-hour window with the best combined score
  for (let i = 0; i < hours.length - 2; i++) {
    const windowHours = hours.slice(i, i + 3);
    const score = calculateWindowScore(windowHours);
    
    if (score > bestWindowScore) {
      bestWindowScore = score;
      bestWindowStart = i;
    }
  }
  
  // Create the window data
  const startHour = new Date(hours[bestWindowStart].dt * 1000);
  const endHour = new Date(hours[bestWindowStart + bestWindowLength - 1].dt * 1000);
  
  // Format the time ranges
  const startTime = formatTime(startHour);
  const endTime = formatTime(endHour);
  
  // Determine rating and styling based on score
  const rating = calculateRating(bestWindowScore);
  const [conditions, colorClass, borderClass] = getRatingDetails(rating);
  
  return {
    day,
    timeRange: `${startTime} - ${endTime}`,
    rating,
    description: generateDescription(hours.slice(bestWindowStart, bestWindowStart + bestWindowLength)),
    conditions,
    colorClass,
    borderClass
  };
};

// Find a secondary window (different time of day than best window)
const findSecondaryWindow = (
  hours: any[], 
  primaryWindow: DriveWindow | null, 
  day: string
): DriveWindow | null => {
  if (!primaryWindow || hours.length < 3) return null;
  
  // Parse primary window time to avoid overlap
  const primaryTimeParts = primaryWindow.timeRange.split(' - ');
  const primaryStartHour = parseInt(primaryTimeParts[0].replace(/[AP]M/i, ''));
  const primaryEndHour = parseInt(primaryTimeParts[1].replace(/[AP]M/i, ''));
  const primaryIsMorning = primaryStartHour < 12;
  
  // Look for windows in the opposite time of day
  let bestWindowStart = 0;
  let bestWindowScore = 0;
  let bestWindowLength = 2; // shorter window for secondary option
  
  for (let i = 0; i < hours.length - 1; i++) {
    const hourDate = new Date(hours[i].dt * 1000);
    const hourNum = hourDate.getHours();
    
    // Skip if we're in the same time of day as primary window
    if ((primaryIsMorning && hourNum < 12) || (!primaryIsMorning && hourNum >= 12)) {
      continue;
    }
    
    const windowHours = hours.slice(i, i + 2);
    const score = calculateWindowScore(windowHours) * 0.8; // Slightly downgrade secondary windows
    
    if (score > bestWindowScore) {
      bestWindowScore = score;
      bestWindowStart = i;
    }
  }
  
  // If we didn't find any viable secondary window
  if (bestWindowScore === 0) return null;
  
  // Create the window data
  const startHour = new Date(hours[bestWindowStart].dt * 1000);
  const endHour = new Date(hours[bestWindowStart + bestWindowLength - 1].dt * 1000);
  
  // Format the time ranges
  const startTime = formatTime(startHour);
  const endTime = formatTime(endHour);
  
  // Determine rating and styling based on score
  const rating = calculateRating(bestWindowScore);
  const [conditions, colorClass, borderClass] = getRatingDetails(rating);
  
  return {
    day,
    timeRange: `${startTime} - ${endTime}`,
    rating,
    description: generateDescription(hours.slice(bestWindowStart, bestWindowStart + bestWindowLength)),
    conditions,
    colorClass,
    borderClass
  };
};

// Score a potential driving window based on weather factors
// Higher score = better driving conditions
const calculateWindowScore = (windowHours: any[]): number => {
  if (!windowHours.length) return 0;
  
  // Calculate average scores across all hours in the window
  let totalScore = 0;
  
  windowHours.forEach(hour => {
    let hourScore = 100; // Start with perfect score
    
    // Penalize for precipitation
    hourScore -= (hour.pop * 50); // 0-50 point penalty for rain probability
    
    // Penalize for extreme temperatures (ideal is 65-75°F)
    const temp = hour.temp;
    if (temp < 45) hourScore -= (45 - temp) * 1.5;
    else if (temp < 60) hourScore -= (60 - temp) * 0.5;
    else if (temp > 85) hourScore -= (temp - 85) * 1;
    else if (temp > 75) hourScore -= (temp - 75) * 0.5;
    
    // Penalize for high humidity
    if (hour.humidity > 80) hourScore -= (hour.humidity - 80) * 0.5;
    
    // Penalize for high wind (over 15mph is less pleasant)
    if (hour.wind_speed > 15) hourScore -= (hour.wind_speed - 15) * 2;
    
    // Penalize for poor visibility
    if (hour.visibility && hour.visibility < 9000) hourScore -= (9000 - hour.visibility) / 100;
    
    // Penalize for extreme UV (over 7 is high)
    if (hour.uvi > 7) hourScore -= (hour.uvi - 7) * 5;
    
    // Add the weighted hour score to the total
    totalScore += Math.max(0, hourScore);
  });
  
  // Return average score
  return totalScore / windowHours.length;
};

// Convert window score to star rating
const calculateRating = (score: number): number => {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 55) return 3;
  if (score >= 40) return 2;
  return 1;
};

// Get styling details based on rating
const getRatingDetails = (rating: number): [string, string, string] => {
  switch (rating) {
    case 5:
      return ["Optimal", "from-green-900/30 to-green-800/20", "border-green-800/30"];
    case 4:
      return ["Good", "from-green-900/30 to-green-800/20", "border-green-800/30"];
    case 3:
      return ["Good", "from-blue-900/30 to-blue-800/20", "border-blue-800/30"];
    case 2:
      return ["Moderate", "from-yellow-900/30 to-yellow-800/20", "border-yellow-800/30"];
    default:
      return ["Poor", "from-red-900/30 to-red-800/20", "border-red-800/30"];
  }
};

// Generate description of driving conditions
const generateDescription = (hours: any[]): string => {
  // Get weather conditions across window
  const conditions = hours.map(h => h.weather[0].main.toLowerCase());
  const uniqueConditions = Array.from(new Set(conditions));
  
  // Check for rain
  if (uniqueConditions.some(c => c.includes('rain') || c.includes('shower'))) {
    return "Precipitation expected during this window, use caution on wet surfaces";
  }
  
  // Check for clouds
  if (uniqueConditions.some(c => c.includes('cloud'))) {
    return "Partly cloudy conditions with good driving visibility";
  }
  
  // Check for ideal conditions
  if (uniqueConditions.some(c => c.includes('clear'))) {
    const avgTemp = hours.reduce((sum: number, h: any) => sum + h.temp, 0) / hours.length;
    if (avgTemp >= 65 && avgTemp <= 80) {
      return "Optimal conditions with ideal temperature and clear skies";
    } else if (avgTemp > 80) {
      return "Clear conditions but consider heat management for brakes and tires";
    } else {
      return "Clear conditions but cooler temperatures may affect tire grip";
    }
  }
  
  // Default description
  const avgWindSpeed = Math.round(hours.reduce((sum: number, h: any) => sum + h.wind_speed, 0) / hours.length);
  if (avgWindSpeed > 15) {
    return "Moderate conditions with potential for stronger winds";
  }
  
  return "Variable conditions with acceptable driving parameters";
};

// Generate driver-specific tips based on current conditions
const generateDrivingTips = (automotiveData: AutomotiveWeatherData): DrivingTip[] => {
  const tips: DrivingTip[] = [];
  
  // Extract relevant data
  const { conditions, automotive_metrics } = automotiveData;
  const { track_surface, tire_temperature_estimates, drive_recommendations } = automotive_metrics;
  
  // Brake cooling tip
  if (conditions.air_temperature > 85) {
    tips.push({
      tip: `Reduced brake cooling efficiency expected. Allow 15-20% more cooling time between hard braking zones.`
    });
  } else if (conditions.air_temperature < 45) {
    tips.push({
      tip: `Cold brake temperatures expected. Allow extra time for brake warm-up before aggressive driving.`
    });
  }
  
  // Surface grip tip
  tips.push({
    tip: `Surface grip will peak ${
      conditions.air_temperature > 75 ? "1-2" : "2-3"
    } hours after sunrise due to optimal asphalt temperature window.`
  });
  
  // Air density power tip
  tips.push({
    tip: `Current air density suggests ${
      conditions.humidity > 80 ? "3-4" : "2-3"
    }% power reduction. Adjust driving style accordingly.`
  });
  
  return tips;
};

// Generate performance adjustment recommendations
const generatePerformanceAdjustments = (automotiveData: AutomotiveWeatherData): PerformanceAdjustment[] => {
  const adjustments: PerformanceAdjustment[] = [];
  
  // Extract relevant data
  const { conditions, automotive_metrics } = automotiveData;
  
  // Engine type specific recommendations
  const torqueReduction = conditions.humidity > 70 ? "2.1" : "1.8";
  adjustments.push({
    adjustment: `For naturally aspirated engines: Expect ${torqueReduction}% torque reduction due to current air density factors.`
  });
  
  // Turbo recommendation
  const boostAdjustment = conditions.pressure < 1010 ? "1-2" : "0.5-1";
  adjustments.push({
    adjustment: `For turbocharged engines: Recalibrate boost by ${boostAdjustment}% to compensate for ${
      conditions.pressure < 1010 ? "decreased" : "current"
    } atmospheric pressure.`
  });
  
  // Brake bias recommendation based on surface
  adjustments.push({
    adjustment: `Brake bias: Consider ${
      automotive_metrics.track_surface.condition.includes("Damp") ? "2-3" : "1-2"
    }% forward adjustment to account for current surface conditions.`
  });
  
  return adjustments;
};

// Format time from Date object to AM/PM format
const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  return `${hours}${ampm}`;
};