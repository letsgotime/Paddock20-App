/**
 * External App Integration Service
 * 
 * This service provides seamless integration with external navigation apps,
 * mapping services, car service apps, and other automotive/travel related
 * applications, creating a cohesive ecosystem experience.
 */

// Default app preferences (can be configured by user)
const DEFAULT_NAVIGATION_APP = 'google';
const DEFAULT_WEATHER_APP = 'weather';
const DEFAULT_CAR_SERVICE_APP = 'service';

// Icons for external apps (for UI display)
export const APP_ICONS = {
  // Navigation apps
  google: '🌎',
  apple: '🍎',
  waze: '📱',
  // Weather apps
  weather: '🌤️',
  accuweather: '☂️',
  darksky: '⛈️',
  // Car service apps
  service: '🔧',
  carmd: '🚗',
  // Social apps
  twitter: '🐦',
  facebook: '👍',
  instagram: '📸',
  // Other apps
  calendar: '📅',
  notes: '📝',
  contacts: '👤'
};

/**
 * Get user's preferred navigation app
 * If not set, return the default
 */
export function getPreferredNavigationApp() {
  return localStorage.getItem('preferredNavigationApp') || DEFAULT_NAVIGATION_APP;
}

/**
 * Set user's preferred navigation app
 */
export function setPreferredNavigationApp(app) {
  localStorage.setItem('preferredNavigationApp', app);
}

/**
 * Get user's preferred weather app
 * If not set, return the default
 */
export function getPreferredWeatherApp() {
  return localStorage.getItem('preferredWeatherApp') || DEFAULT_WEATHER_APP;
}

/**
 * Set user's preferred weather app
 */
export function setPreferredWeatherApp(app) {
  localStorage.setItem('preferredWeatherApp', app);
}

/**
 * Get user's preferred car service app
 * If not set, return the default
 */
export function getPreferredCarServiceApp() {
  return localStorage.getItem('preferredCarServiceApp') || DEFAULT_CAR_SERVICE_APP;
}

/**
 * Set user's preferred car service app
 */
export function setPreferredCarServiceApp(app) {
  localStorage.setItem('preferredCarServiceApp', app);
}

/**
 * Generate a universal deep link for external navigation applications
 * 
 * @param {Object} params - Navigation parameters
 * @param {String} app - Target navigation app (google, apple, waze)
 * @returns {String} Deep link URL for the specified app
 */
export function generateNavigationDeepLink(params, app = getPreferredNavigationApp()) {
  const { 
    destLat, destLon, destName, 
    originLat, originLon, originName,
    waypoints = [], // Array of {lat, lon, name} objects
    travelMode = 'driving',
    departureTime = null, // Date object or null for now
    avoidTolls = false,
    avoidHighways = false,
    avoidFerries = false
  } = params;
  
  // Force lowercase app name for consistency
  const appName = app.toLowerCase();
  
  // Format waypoints for each app
  let formattedWaypoints = [];
  if (waypoints && waypoints.length > 0) {
    // Different apps require different waypoint formats
    switch (appName) {
      case 'google':
        formattedWaypoints = waypoints.map(wp => 
          wp.lat && wp.lon ? `${wp.lat},${wp.lon}` : encodeURIComponent(wp.name)
        );
        break;
      case 'apple':
        // Apple Maps doesn't support waypoints in the same way
        break;
      case 'waze':
        // Waze doesn't support multiple waypoints in deep links
        break;
      default:
        break;
    }
  }
  
  // Build deep link URL based on app
  switch (appName) {
    case 'google':
      let googleUrl = 'https://www.google.com/maps/dir/?api=1';
      
      // Origin parameters
      if (originLat && originLon) {
        googleUrl += `&origin=${originLat},${originLon}`;
      } else if (originName) {
        googleUrl += `&origin=${encodeURIComponent(originName)}`;
      }
      
      // Destination parameters
      if (destLat && destLon) {
        googleUrl += `&destination=${destLat},${destLon}`;
      } else if (destName) {
        googleUrl += `&destination=${encodeURIComponent(destName)}`;
      }
      
      // Waypoints (if any)
      if (formattedWaypoints.length > 0) {
        googleUrl += `&waypoints=${formattedWaypoints.join('|')}`;
      }
      
      // Travel mode
      googleUrl += `&travelmode=${travelMode}`;
      
      // Additional options
      if (avoidTolls || avoidHighways || avoidFerries) {
        const avoids = [];
        if (avoidTolls) avoids.push('tolls');
        if (avoidHighways) avoids.push('highways');
        if (avoidFerries) avoids.push('ferries');
        googleUrl += `&avoid=${avoids.join('|')}`;
      }
      
      // Departure time
      if (departureTime) {
        googleUrl += `&departure_time=${Math.floor(departureTime.getTime() / 1000)}`;
      }
      
      return googleUrl;
    
    case 'apple':
      let appleUrl = 'https://maps.apple.com/?';
      
      // Origin parameters
      if (originLat && originLon) {
        appleUrl += `saddr=${originLat},${originLon}`;
      } else if (originName) {
        appleUrl += `saddr=${encodeURIComponent(originName)}`;
      }
      
      // Destination parameters
      if (destLat && destLon) {
        appleUrl += `&daddr=${destLat},${destLon}`;
      } else if (destName) {
        appleUrl += `&daddr=${encodeURIComponent(destName)}`;
      }
      
      // Travel mode (dirflg)
      switch (travelMode) {
        case 'driving':
          appleUrl += '&dirflg=d';
          break;
        case 'walking':
          appleUrl += '&dirflg=w';
          break;
        case 'transit':
          appleUrl += '&dirflg=r';
          break;
        default:
          appleUrl += '&dirflg=d'; // Default to driving
      }
      
      // Apple Maps has limited support for avoid options and waypoints via URL scheme
      return appleUrl;
    
    case 'waze':
      let wazeUrl = 'https://waze.com/ul?';
      
      // Waze primarily focuses on the destination
      if (destLat && destLon) {
        wazeUrl += `ll=${destLat},${destLon}`;
      }
      
      if (destName) {
        wazeUrl += `&q=${encodeURIComponent(destName)}`;
      }
      
      // Auto-navigate
      wazeUrl += '&navigate=yes';
      
      return wazeUrl;
    
    default:
      // Default to Google Maps if unrecognized app
      return generateNavigationDeepLink(params, 'google');
  }
}

/**
 * Open navigation in user's preferred app
 * 
 * @param {Object} params - Navigation parameters
 * @param {String} preferredApp - Override user's preferred app
 * @returns {Boolean} Success flag
 */
export function openExternalNavigation(params, preferredApp = null) {
  try {
    const app = preferredApp || getPreferredNavigationApp();
    const url = generateNavigationDeepLink(params, app);
    
    // Log analytics data about external app usage
    logExternalAppUsage('navigation', app, params);
    
    // Open the URL in a new tab
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Failed to open external navigation:', error);
    return false;
  }
}

/**
 * Generate a shareable map link with current route
 * 
 * @param {Object} params - Navigation parameters
 * @returns {Object} Object with text and URL for sharing
 */
export function generateShareableMapLink(params) {
  const { originName, destName } = params;
  const url = generateNavigationDeepLink(params, 'google'); // Google Maps is most widely compatible
  
  let text = 'Check out this route on Paddock20!';
  if (originName && destName) {
    text = `Check out my route from ${originName} to ${destName} on Paddock20!`;
  }
  
  return {
    text,
    url
  };
}

/**
 * Generate a deep link to a specific weather app
 * 
 * @param {Object} params - Weather parameters
 * @param {String} app - Target weather app
 * @returns {String} Deep link URL for the specified app
 */
export function generateWeatherDeepLink(params, app = getPreferredWeatherApp()) {
  const { lat, lon, locationName } = params;
  
  switch (app.toLowerCase()) {
    case 'weather': // iOS Weather app
      // iOS Weather app doesn't have a standard URL scheme
      // Fall back to coordinates in Apple Maps for approximate location
      return `https://maps.apple.com/?q=Weather&ll=${lat},${lon}`;
    
    case 'accuweather':
      return `https://www.accuweather.com/en/search-locations?query=${encodeURIComponent(locationName || '')}&lat=${lat}&lon=${lon}`;
    
    case 'weatherchannel':
      return `https://weather.com/weather/today/l/${lat},${lon}`;
    
    case 'darksky':
      return `https://darksky.net/forecast/${lat},${lon}/us12/en`;
    
    default:
      // Default to weather.com
      return `https://weather.com/weather/today/l/${lat},${lon}`;
  }
}

/**
 * Open weather in user's preferred app
 * 
 * @param {Object} params - Weather parameters
 * @param {String} preferredApp - Override user's preferred app
 * @returns {Boolean} Success flag
 */
export function openExternalWeather(params, preferredApp = null) {
  try {
    const app = preferredApp || getPreferredWeatherApp();
    const url = generateWeatherDeepLink(params, app);
    
    // Log analytics data about external app usage
    logExternalAppUsage('weather', app, params);
    
    // Open the URL in a new tab
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Failed to open external weather app:', error);
    return false;
  }
}

/**
 * Generate a deep link to a car service app
 * 
 * @param {Object} params - Service parameters
 * @param {String} app - Target service app
 * @returns {String} Deep link URL for the specified app
 */
export function generateCarServiceDeepLink(params, app = getPreferredCarServiceApp()) {
  const { 
    vehicleId, 
    serviceName, 
    lat, 
    lon, 
    appointmentTime 
  } = params;
  
  // This would be expanded with actual supported car service apps
  // For now, we'll use generic examples
  
  switch (app.toLowerCase()) {
    case 'service':
      // Placeholder for a generic service app
      return `https://example.com/service?vehicle=${vehicleId}&service=${encodeURIComponent(serviceName || '')}&lat=${lat}&lon=${lon}`;
    
    default:
      // Default placeholder
      return `https://example.com/service?vehicle=${vehicleId}&service=${encodeURIComponent(serviceName || '')}&lat=${lat}&lon=${lon}`;
  }
}

/**
 * Add to calendar (supports various platforms)
 * 
 * @param {Object} params - Calendar event parameters
 * @returns {String} Calendar URL or data
 */
export function generateCalendarLink(params) {
  const { 
    title, 
    description, 
    startTime, // Date object
    endTime,   // Date object
    location,
    url
  } = params;
  
  // Format dates for calendar
  const formatDate = (date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };
  
  // Start and end dates formatted for calendar
  const start = formatDate(startTime);
  const end = formatDate(endTime || new Date(startTime.getTime() + 60 * 60 * 1000)); // Default 1 hour duration
  
  // Generate URL for Google Calendar
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}&sprop=website:${encodeURIComponent(url || window.location.href)}`;
  
  // Generate URL for Outlook Web
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startTime.toISOString()}&enddt=${endTime ? endTime.toISOString() : ''}&body=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
  
  // Generate iCalendar data (for iOS/Apple Calendar and others)
  const icalData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ''}`,
    `LOCATION:${location || ''}`,
    `URL:${url || window.location.href}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  // Return object with multiple options
  return {
    google: googleCalendarUrl,
    outlook: outlookCalendarUrl,
    ical: icalData,
    // Function to download iCal file
    downloadIcal: () => {
      const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
}

/**
 * Share to social media platforms
 * 
 * @param {Object} params - Share parameters
 * @param {String} platform - Social media platform
 * @returns {String} Share URL
 */
export function generateSocialShareLink(params, platform) {
  const { 
    text, 
    url = window.location.href, 
    hashtags = [], 
    via = 'Paddock20',
    media = null // for Pinterest
  } = params;
  
  switch (platform.toLowerCase()) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}&via=${via}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    case 'pinterest':
      if (!media) return null;
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(text)}`;
    
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Shared from Paddock20')}&body=${encodeURIComponent(text + '\n\n' + url)}`;
    
    default:
      return null;
  }
}

/**
 * Open social sharing dialog
 * 
 * @param {Object} params - Share parameters
 * @param {String} platform - Social media platform
 * @returns {Boolean} Success flag
 */
export function shareToSocial(params, platform) {
  try {
    const url = generateSocialShareLink(params, platform);
    
    if (!url) return false;
    
    // Log analytics data about sharing
    logExternalAppUsage('social', platform, params);
    
    // Open as popup for better UX with social media
    const width = 575;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      url,
      `share-${platform}`,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
    
    return true;
  } catch (error) {
    console.error(`Failed to share to ${platform}:`, error);
    return false;
  }
}

/**
 * Detect if running on iOS device
 * @returns {Boolean}
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Detect if running on Android device
 * @returns {Boolean}
 */
export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get most appropriate navigation app based on platform
 * @returns {String} App name
 */
export function getDefaultNavigationAppForPlatform() {
  if (isIOS()) return 'apple';
  if (isAndroid()) return 'google';
  return 'google'; // Default
}

/**
 * Log external app usage for analytics
 * Private helper function
 * 
 * @param {String} type - Type of external app
 * @param {String} app - Specific app used
 * @param {Object} params - Parameters used
 */
function logExternalAppUsage(type, app, params) {
  // In a real implementation, this would send data to an analytics service
  // For now, we'll just log to console
  console.log('External App Usage:', {
    type,
    app,
    timestamp: new Date().toISOString(),
    // Don't log all params to avoid sensitive data
    hasOrigin: !!params.originName || !!(params.originLat && params.originLon),
    hasDestination: !!params.destName || !!(params.destLat && params.destLon),
  });
  
  // Store usage history in localStorage for user's reference
  try {
    const history = JSON.parse(localStorage.getItem('externalAppHistory') || '[]');
    history.unshift({
      type,
      app,
      timestamp: Date.now(),
      // Save minimal data for history
      summary: getSummaryForHistory(type, app, params)
    });
    
    // Keep only last 50 items
    if (history.length > 50) {
      history.length = 50;
    }
    
    localStorage.setItem('externalAppHistory', JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save external app history:', e);
  }
}

/**
 * Get a user-friendly summary for history
 * Private helper function
 * 
 * @param {String} type - Type of external app
 * @param {String} app - Specific app used
 * @param {Object} params - Parameters used
 * @returns {String} Summary text
 */
function getSummaryForHistory(type, app, params) {
  switch (type) {
    case 'navigation':
      const origin = params.originName || 'Current Location';
      const dest = params.destName || 'Selected Destination';
      return `${origin} → ${dest} (${app})`;
    
    case 'weather':
      return `Weather for ${params.locationName || 'Selected Location'} (${app})`;
    
    case 'social':
      return `Shared to ${app}`;
    
    default:
      return `Used ${app} integration`;
  }
}

/**
 * Get external app usage history
 * 
 * @param {Number} limit - Maximum number of items to return
 * @returns {Array} History items
 */
export function getExternalAppHistory(limit = 10) {
  try {
    const history = JSON.parse(localStorage.getItem('externalAppHistory') || '[]');
    return history.slice(0, limit);
  } catch (e) {
    console.error('Failed to load external app history:', e);
    return [];
  }
}

/**
 * Clear external app usage history
 */
export function clearExternalAppHistory() {
  localStorage.removeItem('externalAppHistory');
}

// Export all functions and constants
export default {
  // App preferences
  getPreferredNavigationApp,
  setPreferredNavigationApp,
  getPreferredWeatherApp,
  setPreferredWeatherApp,
  getPreferredCarServiceApp,
  setPreferredCarServiceApp,
  
  // App detection
  isIOS,
  isAndroid,
  getDefaultNavigationAppForPlatform,
  
  // Navigation functions
  generateNavigationDeepLink,
  openExternalNavigation,
  generateShareableMapLink,
  
  // Weather functions
  generateWeatherDeepLink,
  openExternalWeather,
  
  // Car service functions
  generateCarServiceDeepLink,
  
  // Calendar integration
  generateCalendarLink,
  
  // Social sharing
  generateSocialShareLink,
  shareToSocial,
  
  // History
  getExternalAppHistory,
  clearExternalAppHistory,
  
  // Icons for UI
  APP_ICONS
};