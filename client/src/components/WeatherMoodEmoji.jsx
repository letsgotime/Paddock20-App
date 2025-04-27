import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define emoji and animation mappings for different weather conditions
const weatherMoods = {
  // Clear skies
  'clear': {
    emoji: '😎',
    mood: 'Feeling sunny and optimistic!',
    color: '#FFD700', // Gold color
    animation: {
      y: [0, -10, 0],
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 3 }
    },
    background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  'clear night': {
    emoji: '🌙',
    mood: 'Calm night vibes...',
    color: '#E6E6FA', // Lavender color
    animation: {
      rotate: [0, 5, 0, -5, 0],
      transition: { repeat: Infinity, duration: 4 }
    },
    background: 'radial-gradient(circle, rgba(230,230,250,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Cloudy conditions
  'clouds': {
    emoji: '☁️',
    mood: 'Head in the clouds today.',
    color: '#B0C4DE', // Light steel blue
    animation: {
      x: [0, 10, 0, -10, 0],
      transition: { repeat: Infinity, duration: 7 }
    },
    background: 'radial-gradient(circle, rgba(176,196,222,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  'few clouds': {
    emoji: '🌤️',
    mood: 'Partly sunny with a dash of optimism!',
    color: '#ADD8E6', // Light blue
    animation: {
      x: [0, 8, 0, -8, 0],
      transition: { repeat: Infinity, duration: 6 }
    },
    background: 'radial-gradient(circle, rgba(173,216,230,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Rainy conditions
  'rain': {
    emoji: '🌧️',
    mood: 'Perfect day for puddle jumping!',
    color: '#4682B4', // Steel blue
    animation: {
      y: [0, 5, 0],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    background: 'radial-gradient(circle, rgba(70,130,180,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  'light rain': {
    emoji: '🌦️',
    mood: 'A little rain never hurt anyone!',
    color: '#87CEEB', // Sky blue
    animation: {
      y: [0, 3, 0],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    background: 'radial-gradient(circle, rgba(135,206,235,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  'heavy rain': {
    emoji: '⛈️',
    mood: 'Stay dry out there!',
    color: '#36454F', // Charcoal
    animation: {
      scale: [1, 1.1, 1],
      rotate: [-2, 0, 2, 0],
      transition: { repeat: Infinity, duration: 1 }
    },
    background: 'radial-gradient(circle, rgba(54,69,79,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Snow conditions
  'snow': {
    emoji: '❄️',
    mood: 'Let it snow! Time to hit the slopes!',
    color: '#E0FFFF', // Light cyan
    animation: {
      rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
      transition: { repeat: Infinity, duration: 8 }
    },
    background: 'radial-gradient(circle, rgba(224,255,255,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Misty/foggy conditions
  'mist': {
    emoji: '🌫️',
    mood: 'Mysterious vibes today...',
    color: '#DCDCDC', // Gainsboro
    animation: {
      opacity: [0.7, 1, 0.7],
      transition: { repeat: Infinity, duration: 4 }
    },
    background: 'radial-gradient(circle, rgba(220,220,220,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  'fog': {
    emoji: '🌫️',
    mood: 'Drive carefully in the fog!',
    color: '#D3D3D3', // Light gray
    animation: {
      opacity: [0.6, 0.9, 0.6],
      transition: { repeat: Infinity, duration: 3 }
    },
    background: 'radial-gradient(circle, rgba(211,211,211,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Stormy conditions
  'thunderstorm': {
    emoji: '⚡',
    mood: 'Electrifying atmosphere!',
    color: '#9370DB', // Medium purple
    animation: {
      scale: [1, 1.3, 1],
      transition: { repeat: Infinity, duration: 0.8 }
    },
    background: 'radial-gradient(circle, rgba(147,112,219,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Extreme weather
  'tornado': {
    emoji: '🌪️',
    mood: 'Seek shelter immediately!',
    color: '#696969', // Dim gray
    animation: {
      rotate: [0, 360],
      transition: { repeat: Infinity, duration: 2 }
    },
    background: 'radial-gradient(circle, rgba(105,105,105,0.2) 0%, rgba(0,0,0,0) 70%)'
  },
  
  // Default for unknown conditions
  'default': {
    emoji: '🌈',
    mood: 'Weather is always an adventure!',
    color: '#FFFFFF', // White
    animation: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2 }
    },
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 70%)'
  }
};

const WeatherMoodEmoji = ({ weatherCondition, isNight }) => {
  const [mood, setMood] = useState(null);
  
  useEffect(() => {
    // Convert the weather condition to lowercase for matching
    const condition = weatherCondition ? weatherCondition.toLowerCase() : '';
    
    // Check for night-time clear skies
    if (condition.includes('clear') && isNight) {
      setMood(weatherMoods['clear night']);
      return;
    }
    
    // Look for exact matches first
    if (weatherMoods[condition]) {
      setMood(weatherMoods[condition]);
      return;
    }
    
    // Look for partial matches
    const partialMatch = Object.keys(weatherMoods).find(key => 
      condition.includes(key) && key !== 'default'
    );
    
    if (partialMatch) {
      setMood(weatherMoods[partialMatch]);
      return;
    }
    
    // Fallback to default
    setMood(weatherMoods['default']);
  }, [weatherCondition, isNight]);
  
  if (!mood) return null;
  
  return (
    <div 
      className="weather-mood-container p-4 rounded-xl transition-all duration-300 my-4"
      style={{ 
        background: mood.background,
        border: `2px solid ${mood.color}25`
      }}
    >
      <div className="flex items-center justify-center mb-2">
        <motion.div 
          className="text-5xl md:text-6xl" 
          animate={mood.animation}
          style={{ filter: 'drop-shadow(0 0 8px ' + mood.color + ')' }}
        >
          {mood.emoji}
        </motion.div>
      </div>
      <p 
        className="text-center font-medium mt-1"
        style={{ color: mood.color }}
      >
        {mood.mood}
      </p>
    </div>
  );
};

export default WeatherMoodEmoji;