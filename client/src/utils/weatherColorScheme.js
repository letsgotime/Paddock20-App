/**
 * Weather-based color scheme generator for UI styling
 * Dynamically adapts UI colors based on current weather condition
 */

/**
 * Get color scheme object based on weather condition
 * @param {string} condition - Weather condition (e.g., 'Clear', 'Rain', 'Snow')
 * @param {number} temperature - Current temperature in Fahrenheit
 * @param {boolean} isDay - Whether it's currently daytime
 * @returns {object} - Color scheme object with primary, bg, gradient, and accent colors
 */
export function getWeatherColorScheme(condition = 'Clear', temperature = 70, isDay = true) {
  const conditionLower = condition?.toLowerCase() || 'clear';
  
  // Define base color schemes
  const schemes = {
    clear: {
      day: {
        primary: '#0077cc',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#3399ff',
        text: '#ffffff',
        border: '#1a1a1a'
      },
      night: {
        primary: '#005299',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#0066cc',
        text: '#e6e6e6',
        border: '#151515'
      }
    },
    clouds: {
      day: {
        primary: '#0066b3',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#3399ff',
        text: '#e6e6e6',
        border: '#1a1a1a'
      },
      night: {
        primary: '#00487d',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#0059b3',
        text: '#d9d9d9',
        border: '#151515'
      }
    },
    rain: {
      day: {
        primary: '#00568c',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#0099cc',
        text: '#e6e6e6',
        border: '#1a1a1a'
      },
      night: {
        primary: '#003d66',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#0077b3',
        text: '#d9d9d9',
        border: '#151515'
      }
    },
    snow: {
      day: {
        primary: '#0066b3',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#80bfff',
        text: '#ffffff',
        border: '#1a1a1a'
      },
      night: {
        primary: '#00487d',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#0059b3',
        text: '#e6e6e6',
        border: '#151515'
      }
    },
    fog: {
      day: {
        primary: '#336699',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#6699cc',
        text: '#e6e6e6',
        border: '#1a1a1a'
      },
      night: {
        primary: '#1a334d',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#4d88cc',
        text: '#d9d9d9',
        border: '#151515'
      }
    },
    thunderstorm: {
      day: {
        primary: '#003366',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#0066cc',
        text: '#e6e6e6',
        border: '#1a1a1a'
      },
      night: {
        primary: '#00264d',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#004080',
        text: '#d9d9d9',
        border: '#151515'
      }
    },
    default: {
      day: {
        primary: '#0077cc',
        bg: '#050505',
        gradient: 'linear-gradient(to bottom, #111, #000)',
        accent: '#3399ff',
        text: '#ffffff',
        border: '#1a1a1a'
      },
      night: {
        primary: '#005299',
        bg: '#000000',
        gradient: 'linear-gradient(to bottom, #000, #111)',
        accent: '#0066cc',
        text: '#e6e6e6',
        border: '#151515'
      }
    }
  };
  
  // Determine scheme to use
  let scheme;
  
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    scheme = schemes.clear;
  } else if (conditionLower.includes('cloud')) {
    scheme = schemes.clouds;
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    scheme = schemes.rain;
  } else if (conditionLower.includes('snow') || conditionLower.includes('sleet')) {
    scheme = schemes.snow;
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
    scheme = schemes.fog;
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    scheme = schemes.thunderstorm;
  } else {
    scheme = schemes.default;
  }
  
  // Apply temperature-based adjustments
  const colors = isDay ? { ...scheme.day } : { ...scheme.night };
  
  if (temperature > 90) {
    // Hot conditions - intensify blue for contrast
    colors.primary = shiftColor(colors.primary, 5, 10, 20);
    colors.accent = shiftColor(colors.accent, 10, 15, 30);
  } else if (temperature < 32) {
    // Cold conditions - shift to deeper blue
    colors.primary = shiftColor(colors.primary, -10, -5, 0);
    colors.accent = shiftColor(colors.accent, -15, -5, 5);
  }
  
  return colors;
}

/**
 * Modify color by shifting RGB values
 * @param {string} hex - Hex color string
 * @param {number} rShift - Red shift value
 * @param {number} gShift - Green shift value
 * @param {number} bShift - Blue shift value
 * @returns {string} - Modified hex color string
 */
function shiftColor(hex, rShift, gShift, bShift) {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  
  // Apply shifts
  r = Math.max(0, Math.min(255, r + rShift));
  g = Math.max(0, Math.min(255, g + gShift));
  b = Math.max(0, Math.min(255, b + bShift));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get CSS classes for weather-specific container styling
 * @param {object} colorScheme - Color scheme from getWeatherColorScheme()
 * @returns {string} - CSS classes
 */
export function getContainerClasses(colorScheme) {
  return `bg-black/30 border-gray-800`;
}

/**
 * Get CSS color for alert level
 * @param {string} level - Alert level (Low, Moderate, High, Severe)
 * @returns {string} - CSS text color class
 */
export function getAlertLevelColor(level) {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'high':
      return 'text-orange-500';
    case 'severe':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get CSS background gradient for weather condition
 * @param {string} condition - Weather condition
 * @param {boolean} isDay - Whether it's daytime
 * @returns {string} - CSS background style
 */
export function getWeatherBackground(condition, isDay = true) {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return isDay 
      ? 'linear-gradient(to bottom, #1a1a2e, #16213e)'
      : 'linear-gradient(to bottom, #0d0d1a, #0f1525)';
  } else if (conditionLower.includes('snow')) {
    return isDay 
      ? 'linear-gradient(to bottom, #2c3e50, #1a1a2e)' 
      : 'linear-gradient(to bottom, #1a1a2e, #0d0d1a)';
  } else if (conditionLower.includes('cloud')) {
    return isDay 
      ? 'linear-gradient(to bottom, #2c3e50, #1a1a2e)' 
      : 'linear-gradient(to bottom, #0f1525, #0d0d1a)';
  } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return isDay 
      ? 'linear-gradient(to bottom, #111, #000)' 
      : 'linear-gradient(to bottom, #000, #111)';
  } else {
    return 'linear-gradient(to bottom, #111, #000)';
  }
}