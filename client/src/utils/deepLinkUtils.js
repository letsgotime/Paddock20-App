/**
 * Deep Linking Utility Functions
 * 
 * This module provides utilities for generating and parsing deep links
 * to various sections of the Paddock20 application, as well as 
 * integration with external mapping and weather applications.
 */

/**
 * Generate a deep link to a specific location in the application
 * 
 * @param {String} type - The type of link (weather, route, vehicle, journal)
 * @param {Object} params - Parameters for the deep link
 * @returns {String} The generated deep link URL
 */
export function generateDeepLink(type, params = {}) {
  // Base URL - would be the application's URL in production
  const baseUrl = window.location.origin;
  
  // Create query string from params
  const queryParams = new URLSearchParams();
  
  // Add common params
  queryParams.append('deeplink', 'true');
  queryParams.append('type', type);
  
  // Add type-specific params
  switch (type) {
    case 'weather':
      if (params.lat && params.lon) {
        queryParams.append('lat', params.lat);
        queryParams.append('lon', params.lon);
      }
      if (params.locationId) {
        queryParams.append('locationId', params.locationId);
      }
      if (params.locationName) {
        queryParams.append('locationName', params.locationName);
      }
      break;
      
    case 'route':
      if (params.originLat && params.originLon) {
        queryParams.append('originLat', params.originLat);
        queryParams.append('originLon', params.originLon);
      }
      if (params.destLat && params.destLon) {
        queryParams.append('destLat', params.destLat);
        queryParams.append('destLon', params.destLon);
      }
      if (params.originId) {
        queryParams.append('originId', params.originId);
      }
      if (params.destId) {
        queryParams.append('destId', params.destId);
      }
      if (params.originName) {
        queryParams.append('originName', params.originName);
      }
      if (params.destName) {
        queryParams.append('destName', params.destName);
      }
      break;
      
    case 'vehicle':
      if (params.vehicleId) {
        queryParams.append('vehicleId', params.vehicleId);
      }
      break;
      
    case 'journal':
      if (params.entryId) {
        queryParams.append('entryId', params.entryId);
      }
      if (params.date) {
        queryParams.append('date', params.date);
      }
      break;
      
    case 'dashboard':
      // Dashboard specific params
      if (params.panel) {
        queryParams.append('panel', params.panel);
      }
      break;
      
    default:
      break;
  }
  
  // Construct the final URL with path
  let path = '/';
  switch (type) {
    case 'weather':
      path = '/weather';
      break;
    case 'route':
      path = '/routes';
      break;
    case 'vehicle':
      path = '/garage';
      break;
    case 'journal':
      path = '/journal';
      break;
    default:
      break;
  }
  
  return `${baseUrl}${path}?${queryParams.toString()}`;
}

/**
 * Parse a deep link URL to extract parameters
 * 
 * @param {String} url - The deep link URL to parse
 * @returns {Object} The extracted parameters
 */
export function parseDeepLink(url) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);
  
  // Extract common params
  const isDeepLink = params.get('deeplink') === 'true';
  const type = params.get('type');
  
  if (!isDeepLink || !type) {
    return null;
  }
  
  // Extract type-specific params
  const result = { type };
  
  switch (type) {
    case 'weather':
      result.lat = params.get('lat');
      result.lon = params.get('lon');
      result.locationId = params.get('locationId');
      result.locationName = params.get('locationName');
      break;
      
    case 'route':
      result.originLat = params.get('originLat');
      result.originLon = params.get('originLon');
      result.destLat = params.get('destLat');
      result.destLon = params.get('destLon');
      result.originId = params.get('originId');
      result.destId = params.get('destId');
      result.originName = params.get('originName');
      result.destName = params.get('destName');
      break;
      
    case 'vehicle':
      result.vehicleId = params.get('vehicleId');
      break;
      
    case 'journal':
      result.entryId = params.get('entryId');
      result.date = params.get('date');
      break;
      
    case 'dashboard':
      result.panel = params.get('panel');
      break;
      
    default:
      break;
  }
  
  return result;
}

/**
 * Generate a link for external mapping applications
 * 
 * @param {Object} params - Parameters for the external map link
 * @param {String} app - The mapping app to target (google, apple, waze)
 * @returns {String} The generated external mapping app URL
 */
export function generateExternalMapLink(params, app = 'google') {
  const { destLat, destLon, destName, originLat, originLon, originName } = params;
  
  switch (app.toLowerCase()) {
    case 'google':
      let googleUrl = 'https://www.google.com/maps/dir/?api=1';
      
      if (originLat && originLon) {
        googleUrl += `&origin=${originLat},${originLon}`;
      } else if (originName) {
        googleUrl += `&origin=${encodeURIComponent(originName)}`;
      }
      
      if (destLat && destLon) {
        googleUrl += `&destination=${destLat},${destLon}`;
      } else if (destName) {
        googleUrl += `&destination=${encodeURIComponent(destName)}`;
      }
      
      googleUrl += '&travelmode=driving';
      return googleUrl;
      
    case 'apple':
      let appleUrl = 'https://maps.apple.com/?';
      
      if (originLat && originLon) {
        appleUrl += `saddr=${originLat},${originLon}`;
      } else if (originName) {
        appleUrl += `saddr=${encodeURIComponent(originName)}`;
      }
      
      if (destLat && destLon) {
        appleUrl += `&daddr=${destLat},${destLon}`;
      } else if (destName) {
        appleUrl += `&daddr=${encodeURIComponent(destName)}`;
      }
      
      appleUrl += '&dirflg=d';
      return appleUrl;
      
    case 'waze':
      let wazeUrl = 'https://waze.com/ul?';
      
      if (destLat && destLon) {
        wazeUrl += `ll=${destLat},${destLon}`;
      }
      
      if (destName) {
        wazeUrl += `&q=${encodeURIComponent(destName)}`;
      }
      
      wazeUrl += '&navigate=yes';
      return wazeUrl;
      
    default:
      return null;
  }
}

/**
 * Generate a sharable deep link message
 * 
 * @param {String} type - The type of link (weather, route, vehicle, journal)
 * @param {Object} params - Parameters for the deep link
 * @returns {Object} The message object with text and URL
 */
export function generateShareMessage(type, params = {}) {
  const url = generateDeepLink(type, params);
  let text = '';
  
  switch (type) {
    case 'weather':
      const locationName = params.locationName || 'this location';
      text = `Check out the current weather conditions for ${locationName} on Paddock20!`;
      break;
      
    case 'route':
      const origin = params.originName || 'starting point';
      const destination = params.destName || 'destination';
      text = `Check out my route from ${origin} to ${destination} with real-time weather impacts on Paddock20!`;
      break;
      
    case 'vehicle':
      text = `Check out my vehicle profile on Paddock20!`;
      break;
      
    case 'journal':
      text = `Check out my driving journal entry on Paddock20!`;
      break;
      
    default:
      text = `Check out Paddock20, the ultimate automotive weather platform!`;
      break;
  }
  
  return {
    text,
    url
  };
}

/**
 * Handle deep links on application startup
 * 
 * @param {Function} callback - Function to call with the parsed deep link data
 */
export function handleDeepLinksOnStartup(callback) {
  const currentUrl = window.location.href;
  const parsedData = parseDeepLink(currentUrl);
  
  if (parsedData) {
    callback(parsedData);
  }
}

/**
 * Check if the URL contains deep link parameters
 * 
 * @returns {Boolean} True if the URL contains deep link parameters
 */
export function hasDeepLinkParams() {
  const params = new URLSearchParams(window.location.search);
  return params.get('deeplink') === 'true';
}

/**
 * Clear deep link parameters from the URL
 */
export function clearDeepLinkParams() {
  // Remove deep link parameters without reloading the page
  const url = new URL(window.location.href);
  url.searchParams.delete('deeplink');
  url.searchParams.delete('type');
  
  // Remove all other params
  for (const key of [...url.searchParams.keys()]) {
    url.searchParams.delete(key);
  }
  
  window.history.replaceState({}, '', url.pathname);
}