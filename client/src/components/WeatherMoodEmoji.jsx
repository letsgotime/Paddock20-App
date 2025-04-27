import React, { useState, useEffect } from 'react';

/**
 * WeatherMoodEmoji Component
 * 
 * Translates weather conditions into mood-based emojis with animations
 * to provide an intuitive and accessible representation of weather.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.weatherData - Weather data object
 */
function WeatherMoodEmoji({ weatherData }) {
  const [mood, setMood] = useState({
    emoji: '🌤️',
    description: 'Partly cloudy',
    animation: '',
    color: 'text-blue-300',
    ariaLabel: 'Partly cloudy weather'
  });

  useEffect(() => {
    if (!weatherData || !weatherData.weather || !weatherData.weather.length) {
      return;
    }

    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherDescription = weatherData.weather[0].description.toLowerCase();
    const temp = weatherData.main ? weatherData.main.temp : null;
    const windSpeed = weatherData.wind ? weatherData.wind.speed : 0;
    const humidity = weatherData.main ? weatherData.main.humidity : 0;
    const isDay = weatherData.dt > weatherData.sys.sunrise && weatherData.dt < weatherData.sys.sunset;
    
    let emoji, description, animation, color, ariaLabel;

    // Determine emoji based on weather condition
    if (weatherCondition.includes('thunderstorm')) {
      emoji = '⛈️';
      description = 'Stormy';
      animation = 'animate-bounce';
      color = 'text-purple-400';
      ariaLabel = 'Thunderstorm weather';
    } else if (weatherCondition.includes('drizzle') || (weatherCondition.includes('rain') && weatherDescription.includes('light'))) {
      emoji = '🌦️';
      description = 'Light rain';
      animation = 'animate-pulse';
      color = 'text-blue-300';
      ariaLabel = 'Light rain weather';
    } else if (weatherCondition.includes('rain')) {
      if (weatherDescription.includes('heavy')) {
        emoji = '🌧️';
        description = 'Heavy rain';
        animation = 'animate-bounce';
        color = 'text-blue-600';
        ariaLabel = 'Heavy rain weather';
      } else {
        emoji = '🌧️';
        description = 'Rainy';
        animation = 'animate-pulse';
        color = 'text-blue-400';
        ariaLabel = 'Rainy weather';
      }
    } else if (weatherCondition.includes('snow')) {
      emoji = '❄️';
      description = 'Snowy';
      animation = 'animate-spin-slow';
      color = 'text-blue-100';
      ariaLabel = 'Snowy weather';
    } else if (weatherCondition.includes('mist') || weatherCondition.includes('fog')) {
      emoji = '🌫️';
      description = 'Foggy';
      animation = 'animate-pulse';
      color = 'text-gray-400';
      ariaLabel = 'Foggy weather';
    } else if (weatherCondition.includes('clear')) {
      if (isDay) {
        emoji = '☀️';
        description = 'Sunny';
        animation = 'animate-spin-slow';
        color = 'text-yellow-400';
        ariaLabel = 'Sunny weather';
      } else {
        emoji = '🌙';
        description = 'Clear night';
        animation = 'animate-pulse';
        color = 'text-blue-200';
        ariaLabel = 'Clear night weather';
      }
    } else if (weatherCondition.includes('cloud')) {
      if (weatherDescription.includes('few') || weatherDescription.includes('scattered')) {
        emoji = '🌤️';
        description = 'Partly cloudy';
        animation = '';
        color = 'text-blue-300';
        ariaLabel = 'Partly cloudy weather';
      } else {
        emoji = '☁️';
        description = 'Cloudy';
        animation = '';
        color = 'text-gray-400';
        ariaLabel = 'Cloudy weather';
      }
    } else if (weatherCondition.includes('dust') || weatherCondition.includes('sand')) {
      emoji = '🌪️';
      description = 'Dusty';
      animation = 'animate-spin';
      color = 'text-yellow-600';
      ariaLabel = 'Dusty or sandy weather';
    } else if (weatherCondition.includes('tornado')) {
      emoji = '🌪️';
      description = 'Tornado';
      animation = 'animate-spin';
      color = 'text-red-500';
      ariaLabel = 'Tornado warning';
    } else if (weatherCondition.includes('smoke')) {
      emoji = '🔥';
      description = 'Smoky';
      animation = 'animate-pulse';
      color = 'text-orange-500';
      ariaLabel = 'Smoky conditions';
    } else {
      emoji = '🌡️';
      description = 'Weather available';
      animation = '';
      color = 'text-gray-400';
      ariaLabel = 'Weather information available';
    }

    // Temperature mood enhancers
    if (temp !== null) {
      if (temp > 95) {
        emoji = '🥵';
        description = 'Scorching hot';
        animation = 'animate-pulse';
        color = 'text-red-500';
        ariaLabel = 'Extremely hot weather';
      } else if (temp < 32) {
        emoji = '🥶';
        description = 'Freezing cold';
        animation = 'animate-pulse';
        color = 'text-blue-300';
        ariaLabel = 'Freezing cold weather';
      }
    }

    // Extreme weather conditions override
    if (windSpeed > 50) {
      emoji = '💨';
      description = 'Extremely windy';
      animation = 'animate-bounce';
      color = 'text-blue-700';
      ariaLabel = 'Dangerously windy conditions';
    }

    // Set the determined weather mood
    setMood({
      emoji,
      description,
      animation,
      color,
      ariaLabel
    });

  }, [weatherData]);

  if (!weatherData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center mb-4" role="img" aria-label={mood.ariaLabel}>
      <span className={`text-6xl ${mood.animation} ${mood.color}`} aria-hidden="true">
        {mood.emoji}
      </span>
      <p className={`mt-2 font-semibold ${mood.color}`} aria-hidden="true">
        {mood.description}
      </p>
      
      {/* Hidden text for screen readers */}
      <span className="sr-only">Current weather mood: {mood.description}</span>
    </div>
  );
}

export default WeatherMoodEmoji;