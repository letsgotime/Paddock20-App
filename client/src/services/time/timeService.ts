/**
 * Time Services for PADDOCK20
 * 
 * This service provides time-related functionality:
 * - Local time for any location
 * - Time zone information
 * - Sunrise/sunset calculations
 * - Drive timing optimization
 * - World clock functionality
 * 
 * Primary API: TimeZoneDB with fallbacks to browser-based calculations
 */

import axios from 'axios';
import { Location } from '@/lib/weather';

// Types for TimeZoneDB API responses
interface TimeZoneResponse {
  status: string;
  message: string;
  countryCode: string;
  countryName: string;
  zoneName: string;
  abbreviation: string;
  gmtOffset: number;
  dst: string;
  zoneStart: number;
  zoneEnd: number | null;
  nextAbbreviation: string | null;
  timestamp: number;
  formatted: string;
}

export interface TimeData {
  // Basic time information
  timestamp: number;
  localTime: string;
  localDate: string;
  timezone: string;
  timezoneAbbr: string;
  utcOffset: number;
  isDST: boolean;
  
  // Location context
  countryCode: string;
  countryName: string;
  
  // Calculated time data
  dayPeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  sunriseTime?: string;
  sunsetTime?: string;
  daylight?: {
    durationMinutes: number;
    percentRemaining: number;
  };
  
  // Driving-related time data
  goldenHour?: {
    morning?: {
      start: string;
      end: string;
    };
    evening?: {
      start: string;
      end: string;
    };
  };
}

/**
 * Fetch time data for a specific location using TimeZoneDB API
 * Falls back to browser-based calculations if API is unavailable
 */
export async function fetchTimeData(location: Location): Promise<TimeData> {
  try {
    const API_KEY = process.env.TIMEZONEDB_API_KEY || '';
    const hasApiKey = API_KEY.length > 0;
    
    let timeZoneData: TimeZoneResponse;
    
    if (hasApiKey) {
      // Use the TimeZoneDB API
      const response = await axios.get('https://api.timezonedb.com/v2.1/get-time-zone', {
        params: {
          key: API_KEY,
          format: 'json',
          by: 'position',
          lat: location.lat,
          lng: location.lon
        }
      });
      
      timeZoneData = response.data;
    } else {
      // Fallback to browser-based calculation
      console.warn('TimeZoneDB API key not available, using browser-based time calculation');
      timeZoneData = await calculateTimeZoneDataBrowserBased(location);
    }
    
    return processTimeData(timeZoneData, location);
  } catch (error) {
    console.error('Error fetching time data:', error);
    // Even in case of API error, provide time data based on browser
    const fallbackData = await calculateTimeZoneDataBrowserBased(location);
    return processTimeData(fallbackData, location);
  }
}

/**
 * Calculate time zone data using browser APIs as a fallback
 * Less accurate but works without external API
 */
async function calculateTimeZoneDataBrowserBased(location: Location): Promise<TimeZoneResponse> {
  // Current time in UTC
  const now = new Date();
  
  // Try to guess the timezone from browser
  const dateTimeFormat = new Intl.DateTimeFormat();
  const timeZoneFromBrowser = dateTimeFormat.resolvedOptions().timeZone;
  
  // Format the time string
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZoneFromBrowser
  });
  
  const formattedTime = formatter.format(now);
  
  // Calculate offset (not precise as it doesn't account for the specific location)
  const offset = now.getTimezoneOffset() * -60; // Convert to seconds and invert (getTimezoneOffset returns inverse)
  
  return {
    status: "OK",
    message: "Using browser-based time calculations",
    countryCode: "UN", // Unknown
    countryName: "Unknown",
    zoneName: timeZoneFromBrowser || "Unknown",
    abbreviation: "UNK",
    gmtOffset: offset,
    dst: "0", // Can't reliably determine DST from browser
    zoneStart: 0,
    zoneEnd: null,
    nextAbbreviation: null,
    timestamp: Math.floor(now.getTime() / 1000),
    formatted: formattedTime
  };
}

/**
 * Process raw time data into a standardized format with additional calculations
 */
function processTimeData(timeZoneData: TimeZoneResponse, location: Location): TimeData {
  // Create a date object from the timestamp
  const localTime = new Date(timeZoneData.timestamp * 1000);
  
  // Parse time parts
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  
  // Determine day period
  let dayPeriod: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hours >= 5 && hours < 12) {
    dayPeriod = 'morning';
  } else if (hours >= 12 && hours < 17) {
    dayPeriod = 'afternoon';
  } else if (hours >= 17 && hours < 21) {
    dayPeriod = 'evening';
  } else {
    dayPeriod = 'night';
  }
  
  // Format the local time and date
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const localTimeString = timeFormatter.format(localTime);
  const localDateString = dateFormatter.format(localTime);
  
  // Calculate sunrise and sunset times (approximate)
  // These would be more accurate with an API, but we can estimate
  const { sunrise, sunset } = calculateSunriseSunset(location, timeZoneData.gmtOffset);
  
  // Format sunrise/sunset times
  const sunriseTime = formatTime(sunrise);
  const sunsetTime = formatTime(sunset);
  
  // Calculate daylight information
  const now = new Date(timeZoneData.timestamp * 1000);
  const daylightInfo = calculateDaylightInfo(now, sunrise, sunset);
  
  // Calculate GoTime Golden Hour™ (ideal photography/driving times)
  const goldenHourInfo = calculateGoldenHours(sunrise, sunset);
  
  return {
    timestamp: timeZoneData.timestamp,
    localTime: localTimeString,
    localDate: localDateString,
    timezone: timeZoneData.zoneName,
    timezoneAbbr: timeZoneData.abbreviation,
    utcOffset: timeZoneData.gmtOffset,
    isDST: timeZoneData.dst === "1",
    
    countryCode: timeZoneData.countryCode,
    countryName: timeZoneData.countryName,
    
    dayPeriod,
    sunriseTime,
    sunsetTime,
    daylight: daylightInfo,
    goldenHour: goldenHourInfo
  };
}

/**
 * Calculate approximate sunrise and sunset times based on location and date
 * This is a simplified calculation - would be more accurate with a dedicated API
 */
function calculateSunriseSunset(location: { lat: number, lon: number }, gmtOffset: number) {
  // Basic calculations for sunrise/sunset
  // This is a simplified version - a real implementation would use proper algorithms
  // or preferably data from a weather API that provides this information
  
  const now = new Date();
  const date = now.getDate();
  const month = now.getMonth() + 1;
  
  // Create a base date at UTC
  const baseDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  
  // Approximate calculation based on latitude and time of year
  // This is very approximate and just for demonstration
  // A real implementation would use proper solar calculations
  
  // Base times (very approximate - would use proper algorithms in production)
  let baseSunriseHour = 6; // 6 AM
  let baseSunsetHour = 18; // 6 PM
  
  // Adjust for latitude (days are longer in summer in northern latitudes, shorter in southern)
  const latitudeAdjustment = location.lat / 90; // -1 to 1
  
  // Adjust for time of year
  // Northern hemisphere: longer days in June, shorter in December
  // Southern hemisphere: reversed
  const monthFactor = Math.cos(((month - 6) / 6) * Math.PI); // -1 in Dec, 1 in Jun
  const dayLengthAdjustment = latitudeAdjustment * monthFactor * 2; // Up to +/-2 hours
  
  // Apply adjustments
  baseSunriseHour = Math.max(4, Math.min(8, baseSunriseHour - dayLengthAdjustment / 2));
  baseSunsetHour = Math.max(16, Math.min(22, baseSunsetHour + dayLengthAdjustment / 2));
  
  // Create sunrise and sunset dates, adjusting for timezone
  const sunrise = new Date(baseDate);
  sunrise.setUTCHours(baseSunriseHour);
  sunrise.setUTCSeconds(gmtOffset); // Adjust for timezone
  
  const sunset = new Date(baseDate);
  sunset.setUTCHours(baseSunsetHour);
  sunset.setUTCSeconds(gmtOffset); // Adjust for timezone
  
  return { sunrise, sunset };
}

/**
 * Calculate daylight information based on current time and sunrise/sunset
 */
function calculateDaylightInfo(now: Date, sunrise: Date, sunset: Date) {
  // Total daylight duration in minutes
  const daylightMinutes = (sunset.getTime() - sunrise.getTime()) / (60 * 1000);
  
  // Calculate how much daylight is remaining
  let remainingMinutes = 0;
  if (now < sunrise) {
    // Before sunrise - full day remaining
    remainingMinutes = daylightMinutes;
  } else if (now > sunset) {
    // After sunset - no daylight remaining
    remainingMinutes = 0;
  } else {
    // During daylight - calculate remaining
    remainingMinutes = (sunset.getTime() - now.getTime()) / (60 * 1000);
  }
  
  const percentRemaining = Math.round((remainingMinutes / daylightMinutes) * 100);
  
  return {
    durationMinutes: Math.round(daylightMinutes),
    percentRemaining: Math.max(0, Math.min(100, percentRemaining))
  };
}

/**
 * Calculate GoTime Golden Hour™ - ideal times for photography and scenic drives
 * GoTime Golden Hour™ is typically the hour after sunrise and the hour before sunset
 */
function calculateGoldenHours(sunrise: Date, sunset: Date) {
  // Morning golden hour = sunrise to sunrise + 1 hour
  const morningGoldenHourStart = new Date(sunrise);
  const morningGoldenHourEnd = new Date(sunrise);
  morningGoldenHourEnd.setHours(morningGoldenHourEnd.getHours() + 1);
  
  // Evening golden hour = sunset - 1 hour to sunset
  const eveningGoldenHourStart = new Date(sunset);
  eveningGoldenHourStart.setHours(eveningGoldenHourStart.getHours() - 1);
  const eveningGoldenHourEnd = new Date(sunset);
  
  return {
    morning: {
      start: formatTime(morningGoldenHourStart),
      end: formatTime(morningGoldenHourEnd)
    },
    evening: {
      start: formatTime(eveningGoldenHourStart),
      end: formatTime(eveningGoldenHourEnd)
    }
  };
}

/**
 * Format a date object as a time string in 12-hour format
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Convert timestamp to local date/time string for a specific timezone
 */
export function formatTimestampForTimezone(timestamp: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone
    }).format(new Date(timestamp * 1000));
  } catch (error) {
    console.error(`Error formatting time for timezone ${timeZone}:`, error);
    // Fallback to user's local timezone
    return new Date(timestamp * 1000).toLocaleString();
  }
}

/**
 * Convert hour decimal (e.g. 14.5 = 2:30 PM) to formatted time string
 */
export function formatHourDecimal(hourDecimal: number, use24Hour = false): string {
  const hours = Math.floor(hourDecimal);
  const minutes = Math.round((hourDecimal - hours) * 60);
  
  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } else {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

/**
 * Check if current time is within GoTime Golden Hour™
 */
export function isGoldenHour(timeData: TimeData | null): boolean {
  if (!timeData || !timeData.goldenHour) return false;
  
  const now = new Date();
  const currentTimeString = formatTime(now);
  
  // Check if current time is within morning GoTime Golden Hour™
  const isMorningGoldenHour = timeData.goldenHour.morning ? 
    isTimeBetween(currentTimeString, 
                 timeData.goldenHour.morning.start, 
                 timeData.goldenHour.morning.end) : false;
  
  // Check if current time is within evening GoTime Golden Hour™
  const isEveningGoldenHour = timeData.goldenHour.evening ? 
    isTimeBetween(currentTimeString, 
                 timeData.goldenHour.evening.start, 
                 timeData.goldenHour.evening.end) : false;
  
  return isMorningGoldenHour || isEveningGoldenHour;
}

/**
 * Check if a time is between two other times
 * Handles cases like "11:30 PM" being between "11:00 PM" and "12:30 AM"
 */
function isTimeBetween(time: string, start: string, end: string): boolean {
  // Convert to 24-hour format for comparison
  const convertTo24Hour = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };
  
  const timeMinutes = convertTo24Hour(time);
  const startMinutes = convertTo24Hour(start);
  const endMinutes = convertTo24Hour(end);
  
  // Handle cases crossing midnight
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  } else {
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }
}

/**
 * Calculate optimal departure time based on weather and daylight
 */
export function calculateOptimalDepartureTime(
  timeData: TimeData | null, 
  weatherData: any, 
  tripDurationMinutes: number
): string | null {
  if (!timeData || !weatherData) return null;
  
  // This is a placeholder for more complex calculations that would take into account:
  // - Weather forecast (avoid driving during precipitation)
  // - Daylight (prefer daylight driving)
  // - Traffic conditions (if available)
  // - GoTime Golden Hour™ (scenic driving)
  
  // For now, let's implement a simple heuristic:
  // 1. If there's enough daylight remaining, suggest departing now
  // 2. If sunset is approaching, suggest departing immediately to maximize daylight
  // 3. If it's already dark, suggest waiting until morning
  
  const now = new Date();
  const nowHours = now.getHours() + now.getMinutes() / 60;
  
  // Check if trip can be completed before sunset
  if (timeData.daylight && timeData.daylight.percentRemaining > 0) {
    const minutesOfDaylightRemaining = timeData.daylight.durationMinutes * (timeData.daylight.percentRemaining / 100);
    
    if (minutesOfDaylightRemaining > tripDurationMinutes) {
      // Can complete trip in daylight - suggest departing now
      return 'Depart now to complete trip in daylight';
    }
  }
  
  // If evening GoTime Golden Hour™ is approaching and trip is short
  if (timeData.goldenHour && timeData.goldenHour.evening) {
    const eveningGoldenHourStart = timeData.goldenHour.evening.start;
    // Parse time like "5:30 PM"
    const match = eveningGoldenHourStart.match(/(\d+):(\d+) ([AP]M)/);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3];
      
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const goTimeGoldenHourStartDecimal = hours + minutes / 60;
      
      // If GoTime Golden Hour™ is approaching and trip is short enough
      if (nowHours < goTimeGoldenHourStartDecimal && goTimeGoldenHourStartDecimal - nowHours < 2 && tripDurationMinutes < 120) {
        return `Depart at ${timeData.goldenHour.evening.start} for scenic sunset drive`;
      }
    }
  }
  
  // If it's night, suggest morning
  if (timeData.dayPeriod === 'night') {
    if (timeData.goldenHour && timeData.goldenHour.morning) {
      return `Depart at ${timeData.goldenHour.morning.start} for optimal morning drive`;
    }
    return 'Depart after sunrise tomorrow for best conditions';
  }
  
  // Default suggestion
  return 'Current time is optimal for departure';
}