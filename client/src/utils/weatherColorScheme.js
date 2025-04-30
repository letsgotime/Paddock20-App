/**
 * Weather-specific adaptive color scheme utilities
 * Provides dynamic styling based on current weather conditions
 */

/**
 * Get tailwind color scheme based on weather conditions
 * @param {string} condition - Weather condition (e.g., 'Clear', 'Rain', 'Snow')
 * @param {number} temperature - Current temperature in Fahrenheit
 * @param {boolean} isDay - Whether it's currently daytime
 */
export function getWeatherColorScheme(condition = 'Clear', temperature = 70, isDay = true) {
  // Default scheme
  const defaultScheme = {
    primary: 'blue',
    secondary: 'slate',
    accent: 'amber',
    background: 'gradient-to-br from-slate-900 to-zinc-900',
    opacity: '40'
  };
  
  // Handle special conditions
  if (!condition) return defaultScheme;
  
  const conditionLower = typeof condition === 'string' ? condition.toLowerCase() : 'clear';
  
  // Check for rain
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return {
      primary: 'blue',
      secondary: 'slate',
      accent: 'sky',
      background: 'gradient-to-br from-slate-900 to-blue-950',
      opacity: '30'
    };
  }
  
  // Check for snow
  if (conditionLower.includes('snow')) {
    return {
      primary: 'blue', 
      secondary: 'slate',
      accent: 'cyan',
      background: 'gradient-to-br from-slate-900 to-slate-800',
      opacity: '25'
    };
  }
  
  // Check for clouds
  if (conditionLower.includes('cloud')) {
    return {
      primary: 'blue',
      secondary: 'slate', 
      accent: 'gray',
      background: 'gradient-to-br from-zinc-900 to-slate-800',
      opacity: '30'
    };
  }
  
  // Check for fog/haze
  if (conditionLower.includes('fog') || conditionLower.includes('haze') || conditionLower.includes('mist')) {
    return {
      primary: 'blue',
      secondary: 'gray',
      accent: 'slate',
      background: 'gradient-to-br from-slate-900 to-slate-700',
      opacity: '25'
    };
  }
  
  // Check for thunderstorms
  if (conditionLower.includes('thunder')) {
    return {
      primary: 'blue',
      secondary: 'slate',
      accent: 'violet',
      background: 'gradient-to-br from-slate-900 to-violet-950',
      opacity: '30'
    };
  }
  
  // Temperature-based for clear/default conditions
  if (temperature < 32) {
    // Very cold
    return {
      primary: 'blue',
      secondary: 'indigo',
      accent: 'cyan',
      background: 'gradient-to-br from-slate-900 to-blue-950',
      opacity: '30'
    };
  } else if (temperature < 50) {
    // Cold
    return {
      primary: 'blue',
      secondary: 'slate',
      accent: 'blue',
      background: 'gradient-to-br from-slate-900 to-blue-900',
      opacity: '30'
    };
  } else if (temperature > 90) {
    // Hot
    return {
      primary: 'blue',
      secondary: 'red',
      accent: 'amber',
      background: 'gradient-to-br from-slate-900 to-red-950',
      opacity: '30'
    };
  } else if (temperature > 75) {
    // Warm
    return {
      primary: 'blue',
      secondary: 'amber',
      accent: 'yellow',
      background: 'gradient-to-br from-slate-900 to-amber-950',
      opacity: '30'
    };
  }
  
  // Check if night
  if (!isDay) {
    return {
      primary: 'blue',
      secondary: 'blue',
      accent: 'violet',
      background: 'gradient-to-br from-slate-950 to-blue-950',
      opacity: '40'
    };
  }
  
  // Default
  return defaultScheme;
}

/**
 * Get container classes based on weather color scheme
 * @param {Object} colorScheme - Weather color scheme object
 */
export function getContainerClasses(colorScheme) {
  return `border-${colorScheme.secondary}-800 bg-${colorScheme.background} bg-opacity-${colorScheme.opacity}`;
}

/**
 * Get appropriate text color class for weather condition 
 * @param {string} condition - Weather condition
 * @param {string} defaultColor - Default color class
 */
export function getConditionTextColor(condition, defaultColor = 'text-white') {
  if (!condition) return defaultColor;
  
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'text-blue-400';
  }
  
  if (conditionLower.includes('snow')) {
    return 'text-cyan-400';
  }
  
  if (conditionLower.includes('cloud')) {
    return 'text-gray-300';
  }
  
  if (conditionLower.includes('clear')) {
    return 'text-amber-400';
  }
  
  if (conditionLower.includes('fog') || conditionLower.includes('haze')) {
    return 'text-gray-400';
  }
  
  if (conditionLower.includes('thunder')) {
    return 'text-purple-400';
  }
  
  return defaultColor;
}

/**
 * Get icon color based on a metric's risk level
 * @param {number} value - The metric value
 * @param {number} threshold - The threshold for triggering caution
 * @param {number} dangerThreshold - The threshold for triggering danger
 * @param {boolean} inverse - Whether higher values are better 
 */
export function getRiskColor(value, threshold, dangerThreshold, inverse = false) {
  if (inverse) {
    // Higher is better
    if (value >= threshold) return 'text-green-500';
    if (value >= dangerThreshold) return 'text-amber-500';
    return 'text-red-500';
  } else {
    // Lower is better
    if (value <= threshold) return 'text-green-500';
    if (value <= dangerThreshold) return 'text-amber-500';
    return 'text-red-500';
  }
}

/**
 * Get color for weather alert level
 * @param {string} level - Alert level string
 */
export function getAlertLevelColor(level) {
  switch(level?.toLowerCase()) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-amber-500';
    case 'high':
      return 'text-orange-500';
    case 'severe':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get animation class based on weather condition
 * @param {string} condition - Weather condition
 */
export function getWeatherAnimation(condition) {
  if (!condition) return '';
  
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'weather-rain';
  }
  
  if (conditionLower.includes('snow')) {
    return 'weather-snow';
  }
  
  if (conditionLower.includes('fog') || conditionLower.includes('haze')) {
    return 'weather-fog';
  }
  
  return '';
}