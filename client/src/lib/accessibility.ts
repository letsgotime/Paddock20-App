// Accessibility helpers for screen readers and focus management

// ID for the main content area (for skip links)
export const MAIN_CONTENT_ID = 'main-content';

// ARIA labels for components
export const ARIA_LABELS = {
  weatherStation: {
    temperature: 'Current temperature',
    conditions: 'Weather conditions',
    location: 'Weather location',
    humidity: 'Humidity percentage',
    wind: 'Wind speed',
    feelsLike: 'Feels like temperature',
    forecast: 'Weather forecast',
    refresh: 'Refresh weather data'
  },
  zipWeather: {
    input: 'Enter zip code for weather',
    submit: 'Get weather for this location',
    error: 'Error getting weather data'
  },
  navigation: {
    mainMenu: 'Main navigation menu',
    skipToContent: 'Skip to main content'
  }
};

/**
 * Creates a live region element for screen reader announcements
 * @param politeness 'polite' or 'assertive'
 */
export class LiveRegion {
  private element: HTMLDivElement;

  constructor(politeness: 'polite' | 'assertive' = 'polite') {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', politeness);
    this.element.setAttribute('role', 'status');
    this.element.classList.add('sr-only');
    document.body.appendChild(this.element);
  }

  /**
   * Announce a message to screen readers
   * @param message The message to announce
   */
  announce(message: string): void {
    // Clear the region first (this is a common technique to ensure 
    // the announcement is made again even if the text hasn't changed)
    this.element.textContent = '';
    
    // Force a DOM reflow
    void this.element.offsetWidth;
    
    // Set the new text
    this.element.textContent = message;
  }

  /**
   * Remove the live region from the DOM
   */
  remove(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * Generate an accessible weather description based on current weather data
 * 
 * @param weatherData The weather data object
 * @param unit The temperature unit (metric or imperial)
 * @returns A detailed weather description string
 */
export function generateWeatherDescription(weatherData: any, unit: 'metric' | 'imperial' = 'imperial'): string {
  if (!weatherData) return '';

  const tempUnit = unit === 'metric' ? 'Celsius' : 'Fahrenheit';
  const speedUnit = unit === 'metric' ? 'meters per second' : 'miles per hour';
  
  const location = weatherData.name;
  const temp = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const description = weatherData.weather[0].description;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind.speed;
  
  return `Current weather for ${location}. 
    Temperature: ${temp} degrees ${tempUnit}, feels like ${feelsLike} degrees. 
    Conditions: ${description}. 
    Humidity: ${humidity} percent. 
    Wind speed: ${windSpeed} ${speedUnit}.`;
}

/**
 * Alternative weather description function with simplified parameter structure
 * This function provides backward compatibility with existing components
 * 
 * @param weatherData The weather data object with optional properties
 * @returns A simplified weather description string
 */
export function getWeatherDescription(weatherData: any): string {
  if (!weatherData) {
    return "No weather data available at this time.";
  }

  // Handle both API response format and simplified format
  const condition = weatherData.weather?.[0]?.description || weatherData.condition || "unknown";
  const temp = typeof weatherData.main?.temp !== 'undefined' ? Math.round(weatherData.main.temp) : (weatherData.temp || "unknown");
  const windSpeed = typeof weatherData.wind?.speed !== 'undefined' ? weatherData.wind.speed : (weatherData.windSpeed || "unknown");
  const uvIndex = weatherData.current?.uvi || weatherData.uvIndex || "unknown";

  return `Current weather conditions are ${condition}. Surface temperature is ${temp} degrees Fahrenheit. Wind speed is ${windSpeed} miles per hour. UV Index is ${uvIndex}.`;
}

/**
 * Generate a forecast description based on forecast data
 */
export function generateForecastDescription(forecastData: any, unit: 'metric' | 'imperial'): string {
  if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
    return '';
  }

  const tempUnit = unit === 'metric' ? 'Celsius' : 'Fahrenheit';
  const upcoming = forecastData.list.slice(0, 3); // Next 9 hours (3 hour intervals)
  
  const forecastText = upcoming.map((item: any, index: number) => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const temp = Math.round(item.main.temp);
    const conditions = item.weather[0].description;
    
    if (index === 0) {
      return `At ${time}: ${temp} degrees with ${conditions}.`;
    } else {
      return `Later at ${time}: ${temp} degrees with ${conditions}.`;
    }
  }).join(' ');
  
  return `Upcoming forecast. ${forecastText}`;
}

/**
 * Generate a detailed alert description if weather alerts exist
 */
export function generateAlertDescription(oneCallData: any): string {
  if (!oneCallData || !oneCallData.alerts || oneCallData.alerts.length === 0) {
    return '';
  }
  
  const alerts = oneCallData.alerts.map((alert: any) => {
    return `${alert.event} in effect until ${new Date(alert.end * 1000).toLocaleString()}.`;
  }).join(' ');
  
  return `Weather Alerts: ${alerts}`;
}