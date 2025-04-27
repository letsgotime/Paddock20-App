import React from 'react';
import { motion } from 'framer-motion';

// Define emoji and tips for different driving conditions
const drivingConditions = {
  // Temperature ranges
  temperature: {
    freezing: {
      range: [-100, 32], // Below 32°F
      emoji: '🥶',
      tip: 'Watch for black ice and let your car warm up!',
      animation: {
        rotate: [-5, 0, 5, 0],
        transition: { repeat: Infinity, duration: 1.5 }
      },
      color: '#87CEFA' // Light sky blue
    },
    cold: {
      range: [32, 50], // 32-50°F
      emoji: '🧊',
      tip: 'Roads might be slippery in the morning. Check tire pressure!',
      animation: {
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 2 }
      },
      color: '#ADD8E6' // Light blue
    },
    cool: {
      range: [50, 65], // 50-65°F
      emoji: '😌',
      tip: 'Perfect driving weather! Enjoy the ride.',
      animation: {
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 3 }
      },
      color: '#98FB98' // Pale green
    },
    warm: {
      range: [65, 80], // 65-80°F
      emoji: '😎',
      tip: 'Great top-down convertible weather!',
      animation: {
        rotate: [0, 10, 0],
        transition: { repeat: Infinity, duration: 3 }
      },
      color: '#FADA5E' // Khaki
    },
    hot: {
      range: [80, 95], // 80-95°F
      emoji: '🥵',
      tip: 'Check your coolant levels and A/C performance!',
      animation: {
        scale: [1, 1.2, 1],
        transition: { repeat: Infinity, duration: 1.5 }
      },
      color: '#FF7F50' // Coral
    },
    extreme: {
      range: [95, 150], // Above 95°F
      emoji: '🔥',
      tip: 'Extreme heat! Watch for tire pressure and overheating.',
      animation: {
        y: [0, -3, 0, -3, 0],
        rotate: [-5, 5, -5],
        transition: { repeat: Infinity, duration: 1 }
      },
      color: '#FF4500' // Orange red
    }
  },
  
  // Visibility conditions
  visibility: {
    poor: {
      range: [0, 2], // 0-2 miles
      emoji: '👀',
      tip: 'Low visibility! Reduce speed and use fog lights.',
      animation: {
        scale: [0.9, 1.1, 0.9],
        transition: { repeat: Infinity, duration: 2 }
      },
      color: '#B0C4DE' // Light steel blue
    },
    moderate: {
      range: [2, 5], // 2-5 miles
      emoji: '🧐',
      tip: 'Maintain safe following distance in limited visibility.',
      animation: {
        y: [0, -3, 0],
        transition: { repeat: Infinity, duration: 2.5 }
      },
      color: '#D3D3D3' // Light gray
    },
    good: {
      range: [5, 100], // Above 5 miles
      emoji: '👍',
      tip: 'Great visibility! Time to enjoy the scenery.',
      animation: {
        rotate: [0, 20, 0],
        transition: { repeat: Infinity, duration: 2 }
      },
      color: '#90EE90' // Light green
    }
  },
  
  // Wind conditions
  wind: {
    calm: {
      range: [0, 10], // 0-10 mph
      emoji: '🍃',
      tip: 'Smooth sailing! Perfect driving conditions.',
      animation: {
        x: [0, 3, 0, -3, 0],
        transition: { repeat: Infinity, duration: 4 }
      },
      color: '#E0FFFF' // Light cyan
    },
    breezy: {
      range: [10, 20], // 10-20 mph
      emoji: '💨',
      tip: 'Light crosswinds possible. Stay alert!',
      animation: {
        x: [0, 5, 0, -5, 0],
        transition: { repeat: Infinity, duration: 3 }
      },
      color: '#F0F8FF' // Alice blue
    },
    windy: {
      range: [20, 30], // 20-30 mph
      emoji: '🌬️',
      tip: 'Strong crosswinds! Both hands on the wheel.',
      animation: {
        rotate: [-2, 2, -2],
        x: [0, 8, 0, -8, 0],
        transition: { repeat: Infinity, duration: 2 }
      },
      color: '#D8BFD8' // Thistle
    },
    high: {
      range: [30, 45], // 30-45 mph
      emoji: '⚠️',
      tip: 'High winds! Caution with high-profile vehicles.',
      animation: {
        scale: [0.95, 1.05, 0.95],
        rotate: [-3, 3, -3],
        transition: { repeat: Infinity, duration: 0.8 }
      },
      color: '#FFA07A' // Light salmon
    },
    danger: {
      range: [45, 200], // Above 45 mph
      emoji: '⛔',
      tip: 'Dangerous wind conditions! Consider postponing travel.',
      animation: {
        scale: [1, 1.2, 1],
        rotate: [-5, 5, -5],
        transition: { repeat: Infinity, duration: 0.5 }
      },
      color: '#FF6347' // Tomato
    }
  },
  
  // Rain conditions
  precipitation: {
    none: {
      range: [0, 0.01], // Trace amount
      emoji: '☀️',
      tip: 'Dry roads ahead! Perfect driving conditions.',
      animation: {
        scale: [1, 1.1, 1],
        transition: { repeat: Infinity, duration: 3 }
      },
      color: '#FFFF99' // Light yellow
    },
    light: {
      range: [0.01, 0.1], // Light rain
      emoji: '🌦️',
      tip: 'Light rain can make roads slick. Reduce speed slightly.',
      animation: {
        y: [0, 3, 0],
        transition: { repeat: Infinity, duration: 2 }
      },
      color: '#87CEEB' // Sky blue
    },
    moderate: {
      range: [0.1, 0.3], // Moderate rain
      emoji: '🌧️',
      tip: 'Moderate rain. Increase following distance and use wipers.',
      animation: {
        y: [0, 5, 0],
        transition: { repeat: Infinity, duration: 1.5 }
      },
      color: '#4682B4' // Steel blue
    },
    heavy: {
      range: [0.3, 0.5], // Heavy rain
      emoji: '⛈️',
      tip: 'Heavy rain! Reduce speed by 5-10 mph and use headlights.',
      animation: {
        scale: [1, 1.1, 1],
        y: [0, 4, 0],
        transition: { repeat: Infinity, duration: 1.2 }
      },
      color: '#4169E1' // Royal blue
    },
    severe: {
      range: [0.5, 50], // Severe rain
      emoji: '🌊',
      tip: 'Severe rain! Risk of hydroplaning. Pull over if necessary.',
      animation: {
        scale: [1, 1.2, 1],
        rotate: [-3, 3, -3],
        transition: { repeat: Infinity, duration: 0.8 }
      },
      color: '#0000CD' // Medium blue
    }
  }
};

const DrivingConditionEmoji = ({ 
  temperature, 
  visibility, 
  windSpeed, 
  precipitation 
}) => {
  // Helper function to find the right condition based on value
  const findCondition = (category, value) => {
    if (!value && value !== 0) return null;
    
    return Object.values(drivingConditions[category]).find(condition => {
      const [min, max] = condition.range;
      return value >= min && value <= max;
    });
  };
  
  // Get conditions based on current weather
  const tempCondition = findCondition('temperature', temperature);
  const visibilityCondition = findCondition('visibility', visibility);
  const windCondition = findCondition('wind', windSpeed);
  const precipCondition = findCondition('precipitation', precipitation);
  
  // All possible conditions
  const allConditions = [
    tempCondition, 
    visibilityCondition, 
    windCondition, 
    precipCondition
  ].filter(Boolean);
  
  if (allConditions.length === 0) return null;

  return (
    <div className="driving-conditions rounded-xl p-4 mb-6 bg-gray-800 border border-gray-700">
      <h3 className="apex-header-green text-center mb-4">DRIVING CONDITIONS</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allConditions.map((condition, index) => (
          <div 
            key={index} 
            className="condition-card p-3 rounded-lg flex items-center gap-3"
            style={{ 
              background: `${condition.color}10`,
              border: `1px solid ${condition.color}30` 
            }}
          >
            <motion.div 
              className="text-3xl" 
              animate={condition.animation}
              style={{ filter: `drop-shadow(0 0 3px ${condition.color})` }}
            >
              {condition.emoji}
            </motion.div>
            
            <div>
              <p className="text-white text-sm">{condition.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrivingConditionEmoji;