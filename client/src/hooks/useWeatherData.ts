/**
 * useWeatherData hook
 * 
 * This custom hook provides easy access to the weather-related data from the 
 * LocationServicesContext with utility functions for working with weather information.
 */

import { useLocationServices } from '@/contexts/LocationServicesContext';

export function useWeatherData() {
  const {
    weatherData,
    forecastData,
    oneCallData,
    automotiveWeather,
    refreshWeather,
    preferences,
    loading,
    errors,
    lastUpdated,
    cacheStatus,
    formatLastUpdated,
    isStale
  } = useLocationServices();

  // Format temperature based on user preferences
  const formatTemperature = (temp: number | null | undefined): string => {
    if (temp === null || temp === undefined) return 'N/A';
    
    const unit = preferences.temperatureUnit === 'celsius' ? '°C' : '°F';
    return `${Math.round(temp)}${unit}`;
  };

  // Convert wind speed to appropriate units
  const formatWindSpeed = (speed: number | null | undefined): string => {
    if (speed === null || speed === undefined) return 'N/A';
    
    const unit = preferences.speedUnit === 'km/h' ? 'km/h' : 'mph';
    return `${Math.round(speed)} ${unit}`;
  };

  // Format precipitation chance as percentage
  const formatPrecipChance = (pop: number | null | undefined): string => {
    if (pop === null || pop === undefined) return 'N/A';
    
    // Ensure value is between 0-1 for percentage calculation
    const normalizedPop = pop > 1 ? pop / 100 : pop;
    return `${Math.round(normalizedPop * 100)}%`;
  };

  // Get an appropriate icon based on weather condition code
  const getWeatherIcon = (conditionCode: string | undefined, isDay = true): string => {
    if (!conditionCode) return 'cloud';
    
    // Map OpenWeather icon codes to Lucide icon names
    const iconMap: Record<string, string> = {
      '01d': 'sun',
      '01n': 'moon',
      '02d': 'cloud-sun',
      '02n': 'cloud-moon',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'clouds',
      '04n': 'clouds',
      '09d': 'cloud-drizzle',
      '09n': 'cloud-drizzle',
      '10d': 'cloud-rain',
      '10n': 'cloud-rain',
      '11d': 'cloud-lightning',
      '11n': 'cloud-lightning',
      '13d': 'cloud-snow',
      '13n': 'cloud-snow',
      '50d': 'cloud-fog',
      '50n': 'cloud-fog'
    };
    
    return iconMap[conditionCode] || 'cloud';
  };

  // Get a color associated with a temperature range
  const getTemperatureColor = (temp: number | null | undefined): string => {
    if (temp === null || temp === undefined) return 'text-gray-400';
    
    // Convert to Celsius for consistent color mapping
    const celsius = preferences.temperatureUnit === 'fahrenheit' 
      ? (temp - 32) * 5/9 
      : temp;
    
    if (celsius <= 0) return 'text-blue-500';
    if (celsius <= 10) return 'text-blue-300';
    if (celsius <= 20) return 'text-green-400';
    if (celsius <= 30) return 'text-yellow-400';
    if (celsius <= 35) return 'text-orange-400';
    return 'text-red-500';
  };

  // Get appropriate background class for current weather conditions
  const getWeatherBackgroundClass = (): string => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return 'bg-gradient-to-b from-gray-900 to-black';
    }
    
    const condition = weatherData.weather[0].main.toLowerCase();
    const isDay = weatherData.dt > (weatherData.sys?.sunrise || 0) && 
                  weatherData.dt < (weatherData.sys?.sunset || Infinity);
    
    if (condition.includes('clear')) {
      return isDay 
        ? 'bg-gradient-to-b from-blue-500 to-blue-700' 
        : 'bg-gradient-to-b from-blue-900 to-gray-900';
    }
    
    if (condition.includes('cloud')) {
      return isDay 
        ? 'bg-gradient-to-b from-blue-400 to-gray-600' 
        : 'bg-gradient-to-b from-gray-700 to-gray-900';
    }
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return 'bg-gradient-to-b from-blue-700 to-gray-800';
    }
    
    if (condition.includes('thunderstorm')) {
      return 'bg-gradient-to-b from-gray-700 to-gray-900';
    }
    
    if (condition.includes('snow')) {
      return 'bg-gradient-to-b from-blue-100 to-blue-300';
    }
    
    if (condition.includes('mist') || condition.includes('fog')) {
      return 'bg-gradient-to-b from-gray-400 to-gray-600';
    }
    
    return 'bg-gradient-to-b from-gray-700 to-gray-900';
  };

  // Get the forecast data for a specific day
  const getDayForecast = (dayOffset = 0) => {
    if (!forecastData || !forecastData.list || forecastData.list.length === 0) {
      return null;
    }
    
    const now = new Date();
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    
    // Format date string as YYYY-MM-DD
    const targetDateStr = targetDate.toISOString().slice(0, 10);
    
    // Get all forecast entries for the target date
    const dayEntries = forecastData.list.filter(entry => {
      const entryDate = new Date(entry.dt * 1000).toISOString().slice(0, 10);
      return entryDate === targetDateStr;
    });
    
    if (dayEntries.length === 0) {
      return null;
    }
    
    // Find min and max temperatures
    const temps = dayEntries.map(entry => entry.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    // Get the most frequent weather condition
    const conditionCounts = dayEntries.reduce((acc, entry) => {
      const condition = entry.weather[0].main;
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let primaryCondition = '';
    let maxCount = 0;
    
    for (const [condition, count] of Object.entries(conditionCounts)) {
      if (count > maxCount) {
        primaryCondition = condition;
        maxCount = count;
      }
    }
    
    // Check for any precipitation
    const hasPrecipitation = dayEntries.some(entry => 
      entry.rain || entry.snow || ['Rain', 'Snow', 'Drizzle', 'Thunderstorm'].includes(entry.weather[0].main)
    );
    
    return {
      date: targetDate,
      minTemp,
      maxTemp,
      condition: primaryCondition,
      icon: dayEntries[0].weather[0].icon,
      hasPrecipitation,
      entries: dayEntries
    };
  };

  // Get road condition recommendations based on weather
  const getRoadConditions = () => {
    if (!oneCallData || !oneCallData.current) {
      return {
        condition: 'Unknown',
        risk: 'Unknown',
        recommendation: 'No data available'
      };
    }
    
    const { weather, rain, snow, visibility = 10000 } = oneCallData.current;
    const weatherMain = weather?.[0]?.main || 'Clear';
    
    // Determine road condition
    let condition = 'Dry';
    let risk = 'Low';
    let recommendation = 'Normal driving conditions. No special precautions needed.';
    
    if (snow || weatherMain === 'Snow') {
      condition = 'Snow-covered';
      risk = 'High';
      recommendation = 'Reduce speed significantly. Increase following distance. Consider winter tires.';
    } else if (rain || ['Rain', 'Thunderstorm', 'Drizzle'].includes(weatherMain)) {
      condition = 'Wet';
      risk = 'Moderate';
      recommendation = 'Reduce speed. Be cautious of hydroplaning. Increase following distance.';
    } else if (weatherMain.includes('Fog') || weatherMain.includes('Mist')) {
      condition = 'Damp';
      risk = 'Moderate';
      recommendation = 'Use fog lights. Reduce speed. Be cautious of reduced visibility.';
    }
    
    // Adjust for visibility
    if (visibility < 1000) {
      risk = 'High';
      recommendation = 'Very poor visibility. Consider delaying travel if possible.';
    } else if (visibility < 4000 && risk !== 'High') {
      risk = 'Moderate';
    }
    
    return { condition, risk, recommendation };
  };

  // Get weather alert information
  const getWeatherAlerts = () => {
    if (!oneCallData || !oneCallData.alerts || oneCallData.alerts.length === 0) {
      return [];
    }
    
    return oneCallData.alerts.map(alert => ({
      title: alert.event,
      description: alert.description,
      start: new Date(alert.start * 1000),
      end: new Date(alert.end * 1000),
      severity: alert.severity
    }));
  };

  // Get automotive-specific weather data
  const getAutomotiveWeather = () => {
    return automotiveWeather;
  };

  return {
    // Pass through original data
    weatherData,
    forecastData,
    oneCallData,
    automotiveWeather,
    refreshWeather,
    preferences,
    loading: loading.weather,
    error: errors.weather,
    lastUpdated: lastUpdated.weather,
    cacheStatus: cacheStatus.weather,
    
    // Enhanced functionality
    formatTemperature,
    formatWindSpeed,
    formatPrecipChance,
    getWeatherIcon,
    getTemperatureColor,
    getWeatherBackgroundClass,
    getDayForecast,
    getRoadConditions,
    getWeatherAlerts,
    getAutomotiveWeather,
    formatLastUpdated: () => formatLastUpdated('weather'),
    isStale: () => isStale('weather')
  };
}