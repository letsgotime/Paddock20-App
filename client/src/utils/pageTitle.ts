/**
 * Utility for managing page titles consistently across the application
 */

const APP_NAME = "Paddock20";

/**
 * Sets the document title with consistent formatting
 * 
 * @param pageTitle The page-specific title
 * @param includeAppName Whether to append the app name
 */
export function setPageTitle(pageTitle: string, includeAppName: boolean = true) {
  if (includeAppName) {
    document.title = `${pageTitle} | ${APP_NAME}`;
  } else {
    document.title = pageTitle;
  }
}

/**
 * Converts route paths to user-friendly page titles
 * 
 * @param path The current route path 
 * @returns A formatted page title
 */
export function getPageTitleFromPath(path: string): string {
  if (!path || path === '/') return 'Home';
  
  // Remove leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Handle common special cases
  const specialCases: Record<string, string> = {
    'weather-paddock': 'Weather Paddock',
    'garage-vault': 'Garage Vault',
    'manifestation-station': 'Manifestation Station',
    'product-organizer': 'Product Organizer',
    'sound-library': 'Sound Library',
    'juicebox': 'JuiceBox',
    'gotime-garage': 'GoTime Garage',
    'tires-timepieces': 'Tires & Timepieces',
    'weather': 'Weather',
    'drive-journal': 'Drive Journal',
    'route-planner': 'Route Planner',
  };
  
  // Check for special cases first
  for (const [key, value] of Object.entries(specialCases)) {
    if (cleanPath === key || cleanPath.startsWith(`${key}/`)) {
      return value;
    }
  }
  
  // Default formatting: capitalize each word and replace hyphens with spaces
  return cleanPath
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Updates the page title based on the current path
 * 
 * @param path The current route path
 */
export function updatePageTitleFromPath(path: string): void {
  const pageTitle = getPageTitleFromPath(path);
  setPageTitle(pageTitle);
}