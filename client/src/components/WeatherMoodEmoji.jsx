import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudSnow, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

const weatherEmojis = {
  'Clear': {
    day: { icon: Sun, color: 'text-yellow-400', text: 'Beautiful day!' },
    night: { icon: Sun, color: 'text-blue-300', text: 'Clear night!' }
  },
  'Clouds': {
    day: { icon: CloudSun, color: 'text-gray-400', text: 'Partly cloudy' },
    night: { icon: Cloud, color: 'text-gray-500', text: 'Cloudy night' }
  },
  'few clouds': {
    day: { icon: CloudSun, color: 'text-yellow-300', text: 'Just a few clouds' },
    night: { icon: CloudSun, color: 'text-blue-300', text: 'Partly cloudy night' }
  },
  'broken clouds': {
    day: { icon: Cloud, color: 'text-gray-300', text: 'Mostly cloudy' },
    night: { icon: Cloud, color: 'text-gray-500', text: 'Cloudy night' }
  },
  'scattered clouds': {
    day: { icon: CloudSun, color: 'text-gray-300', text: 'Scattered clouds' },
    night: { icon: Cloud, color: 'text-gray-400', text: 'Scattered clouds' }
  },
  'overcast clouds': {
    day: { icon: Cloud, color: 'text-gray-500', text: 'Overcast' },
    night: { icon: Cloud, color: 'text-gray-600', text: 'Overcast night' }
  },
  'Rain': {
    day: { icon: CloudRain, color: 'text-blue-400', text: 'Rainy day' },
    night: { icon: CloudRain, color: 'text-blue-500', text: 'Rainy night' }
  },
  'light rain': {
    day: { icon: CloudRain, color: 'text-blue-300', text: 'Light rain' },
    night: { icon: CloudRain, color: 'text-blue-400', text: 'Light rain' }
  },
  'moderate rain': {
    day: { icon: CloudRain, color: 'text-blue-400', text: 'Moderate rain' },
    night: { icon: CloudRain, color: 'text-blue-500', text: 'Moderate rain' }
  },
  'heavy rain': {
    day: { icon: CloudRain, color: 'text-blue-600', text: 'Heavy rain' },
    night: { icon: CloudRain, color: 'text-blue-700', text: 'Heavy rain' }
  },
  'Thunderstorm': {
    day: { icon: CloudLightning, color: 'text-purple-400', text: 'Thunderstorm!' },
    night: { icon: CloudLightning, color: 'text-purple-500', text: 'Thunderstorm!' }
  },
  'Snow': {
    day: { icon: CloudSnow, color: 'text-blue-100', text: 'Snowy day' },
    night: { icon: CloudSnow, color: 'text-blue-200', text: 'Snowy night' }
  },
  'Mist': {
    day: { icon: Wind, color: 'text-gray-300', text: 'Misty conditions' },
    night: { icon: Wind, color: 'text-gray-400', text: 'Misty night' }
  },
  'Fog': {
    day: { icon: Wind, color: 'text-gray-400', text: 'Foggy conditions' },
    night: { icon: Wind, color: 'text-gray-500', text: 'Foggy night' }
  },
  'Haze': {
    day: { icon: Wind, color: 'text-yellow-200', text: 'Hazy conditions' },
    night: { icon: Wind, color: 'text-yellow-300', text: 'Hazy night' }
  },
  'Drizzle': {
    day: { icon: CloudRain, color: 'text-blue-200', text: 'Light drizzle' },
    night: { icon: CloudRain, color: 'text-blue-300', text: 'Light drizzle' }
  }
};

// Fallback for unknown weather conditions
const defaultEmoji = {
  day: { icon: Sun, color: 'text-yellow-400', text: 'Weather looks good!' },
  night: { icon: Sun, color: 'text-blue-300', text: 'Clear night!' }
};

function WeatherMoodEmoji({ weatherCondition, isNight = false }) {
  const [animateIcon, setAnimateIcon] = useState(false);
  const timeOfDay = isNight ? 'night' : 'day';
  
  // Find the emoji that best matches the current condition
  const findMatchingEmoji = () => {
    // First try exact match
    if (weatherEmojis[weatherCondition]) {
      return weatherEmojis[weatherCondition][timeOfDay];
    }
    
    // Then try to find a partial match in the key
    for (const key in weatherEmojis) {
      if (weatherCondition.toLowerCase().includes(key.toLowerCase())) {
        return weatherEmojis[key][timeOfDay];
      }
    }
    
    // Check for common weather terms
    if (weatherCondition.toLowerCase().includes('rain')) {
      return weatherEmojis['Rain'][timeOfDay];
    } else if (weatherCondition.toLowerCase().includes('cloud')) {
      return weatherEmojis['Clouds'][timeOfDay];
    } else if (weatherCondition.toLowerCase().includes('thunder')) {
      return weatherEmojis['Thunderstorm'][timeOfDay];
    } else if (weatherCondition.toLowerCase().includes('snow')) {
      return weatherEmojis['Snow'][timeOfDay];
    } else if (weatherCondition.toLowerCase().includes('mist') || 
              weatherCondition.toLowerCase().includes('fog')) {
      return weatherEmojis['Mist'][timeOfDay];
    }
    
    // Fallback
    return defaultEmoji[timeOfDay];
  };
  
  const emoji = findMatchingEmoji();
  const IconComponent = emoji.icon;
  
  // Trigger animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateIcon(true);
      setTimeout(() => setAnimateIcon(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getAnimation = () => {
    if (emoji.icon === Sun) {
      return {
        rotate: [0, 20, 0, -20, 0],
        scale: [1, 1.2, 1]
      };
    } else if (emoji.icon === CloudRain) {
      return {
        y: [0, -10, 0],
        x: [0, 5, 0, -5, 0]
      };
    } else if (emoji.icon === CloudLightning) {
      return {
        scale: [1, 1.3, 1],
        opacity: [1, 0.8, 1]
      };
    } else if (emoji.icon === CloudSnow) {
      return {
        rotate: [0, 10, 0, -10, 0],
        y: [0, -5, 5, 0]
      };
    } else {
      return {
        scale: [1, 1.1, 1],
        y: [0, -5, 0]
      };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <motion.div
        animate={animateIcon ? getAnimation() : {}}
        transition={{ duration: 1 }}
        className={`${emoji.color} mx-auto mb-2`}
      >
        <IconComponent size={80} strokeWidth={1.5} />
      </motion.div>
      <p className="text-xl text-center font-medium text-gray-300">{emoji.text}</p>
    </div>
  );
}

export default WeatherMoodEmoji;