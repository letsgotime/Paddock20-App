/**
 * Weather utility functions for enhanced weather displays
 */

/**
 * Converts wind direction in degrees to a cardinal direction string
 * @param degrees - Wind direction in degrees
 * @returns Cardinal direction string (e.g., "N", "NE", "E", etc.)
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Converts wind speed to the Beaufort scale
 * @param speed - Wind speed in mph
 * @returns Beaufort scale (0-12) and description
 */
export function getBeaufortScale(speed: number): { scale: number; description: string } {
  if (speed < 1) return { scale: 0, description: 'Calm' };
  if (speed < 4) return { scale: 1, description: 'Light air' };
  if (speed < 8) return { scale: 2, description: 'Light breeze' };
  if (speed < 13) return { scale: 3, description: 'Gentle breeze' };
  if (speed < 19) return { scale: 4, description: 'Moderate breeze' };
  if (speed < 25) return { scale: 5, description: 'Fresh breeze' };
  if (speed < 32) return { scale: 6, description: 'Strong breeze' };
  if (speed < 39) return { scale: 7, description: 'High wind' };
  if (speed < 47) return { scale: 8, description: 'Gale' };
  if (speed < 55) return { scale: 9, description: 'Strong gale' };
  if (speed < 64) return { scale: 10, description: 'Storm' };
  if (speed < 73) return { scale: 11, description: 'Violent storm' };
  return { scale: 12, description: 'Hurricane' };
}

/**
 * Calculate the time difference between now and a future time
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted time difference string
 */
export function formatTimeDifference(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;
  
  if (diff <= 0) return 'now';
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Calculate the time until next refresh
 * @param refreshIntervalMinutes - Refresh interval in minutes
 * @returns Minutes until next refresh
 */
export function calculateRefreshTime(refreshIntervalMinutes: number): number {
  const now = new Date();
  const minutes = now.getMinutes();
  
  // Calculate minutes until next refresh
  return refreshIntervalMinutes - (minutes % refreshIntervalMinutes);
}

/**
 * Get a human-readable description of humidity comfort
 * @param humidity - Relative humidity percentage
 * @param temperature - Temperature in Fahrenheit
 * @returns Comfort description
 */
export function getHumidityComfort(humidity: number, temperature: number): string {
  if (temperature > 80) {
    if (humidity > 70) return 'Very uncomfortable';
    if (humidity > 60) return 'Uncomfortable';
    if (humidity > 40) return 'Slightly uncomfortable';
    return 'Comfortable';
  } else if (temperature > 68) {
    if (humidity > 80) return 'Uncomfortable';
    if (humidity > 60) return 'Slightly uncomfortable';
    if (humidity > 30) return 'Comfortable';
    return 'Slightly dry';
  } else {
    if (humidity > 90) return 'Damp';
    if (humidity > 70) return 'Slightly humid';
    if (humidity > 30) return 'Comfortable';
    return 'Dry';
  }
}

/**
 * Format date with customizable options
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date, 
  options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Determine if the sun is up at a given time
 * @param currentTime - Current time in unix timestamp (seconds)
 * @param sunrise - Sunrise time in unix timestamp (seconds)
 * @param sunset - Sunset time in unix timestamp (seconds)
 * @returns Boolean indicating if it's daytime
 */
export function isDaytime(currentTime: number, sunrise: number, sunset: number): boolean {
  return currentTime >= sunrise && currentTime <= sunset;
}

/**
 * Get a suitable color class for a UV index value
 * @param uvi - UV index value
 * @returns CSS color class
 */
export function getUVIndexColorClass(uvi: number): string {
  if (uvi >= 11) return 'text-purple-500';
  if (uvi >= 8) return 'text-red-500';
  if (uvi >= 6) return 'text-orange-500';
  if (uvi >= 3) return 'text-yellow-500';
  return 'text-green-500';
}

/**
 * Get a description of UV risk level
 * @param uvi - UV index value
 * @returns Risk level description
 */
export function getUVIndexRisk(uvi: number): string {
  if (uvi >= 11) return 'Extreme';
  if (uvi >= 8) return 'Very High';
  if (uvi >= 6) return 'High';
  if (uvi >= 3) return 'Moderate';
  return 'Low';
}