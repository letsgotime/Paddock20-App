import React from 'react';
import { Smile, Meh, Frown, Thermometer, Eye, Droplets, Wind } from 'lucide-react';
import { motion } from 'framer-motion';

function DrivingConditionEmoji({ 
  temperature, 
  visibility, 
  windSpeed, 
  precipitation 
}) {
  // Calculate driving condition score (0-100)
  const getConditionScore = () => {
    // Temperature factor (0-25 points)
    // Ideal temperature range is 50-75°F
    let tempScore = 25;
    if (temperature < 32) {
      // Freezing conditions
      tempScore = Math.max(5, (temperature / 32) * 15);
    } else if (temperature < 50) {
      // Cold but not freezing
      tempScore = 15 + ((temperature - 32) / 18) * 10;
    } else if (temperature > 85) {
      // Hot conditions
      tempScore = 25 - Math.min(15, (temperature - 85) / 10);
    }
    
    // Visibility factor (0-30 points)
    // Good visibility is > 5 miles
    let visibilityScore = 30;
    if (visibility < 0.25) {
      // Extremely poor visibility
      visibilityScore = 0;
    } else if (visibility < 1) {
      // Very poor visibility
      visibilityScore = visibility * 10;
    } else if (visibility < 5) {
      // Poor to moderate visibility
      visibilityScore = 10 + ((visibility - 1) / 4) * 20;
    }
    
    // Wind factor (0-20 points)
    // Low wind is < 10 mph
    let windScore = 20;
    if (windSpeed > 35) {
      // High wind
      windScore = 5;
    } else if (windSpeed > 20) {
      // Moderate to high wind
      windScore = 5 + ((35 - windSpeed) / 15) * 10;
    } else if (windSpeed > 10) {
      // Mild to moderate wind
      windScore = 15 + ((20 - windSpeed) / 10) * 5;
    }
    
    // Precipitation factor (0-25 points)
    // No precipitation is ideal
    let precipScore = 25;
    if (precipitation > 0.5) {
      // Heavy rain
      precipScore = 5;
    } else if (precipitation > 0.1) {
      // Moderate rain
      precipScore = 5 + ((0.5 - precipitation) / 0.4) * 10;
    } else if (precipitation > 0) {
      // Light rain
      precipScore = 15 + ((0.1 - precipitation) / 0.1) * 10;
    }
    
    // Calculate final score (0-100)
    return Math.round(tempScore + visibilityScore + windScore + precipScore);
  };
  
  const score = getConditionScore();
  
  // Get emoji and message based on score
  const getConditionDetails = () => {
    if (score >= 85) {
      return {
        icon: Smile,
        color: 'text-green-500',
        text: 'Excellent driving conditions',
        drivingTip: 'Perfect time for a drive! Enjoy the road responsibly.'
      };
    } else if (score >= 65) {
      return {
        icon: Smile,
        color: 'text-green-400',
        text: 'Good driving conditions',
        drivingTip: 'Good conditions overall. Enjoy your drive!'
      };
    } else if (score >= 50) {
      return {
        icon: Meh,
        color: 'text-yellow-400',
        text: 'Fair driving conditions',
        drivingTip: 'Drive with extra care and maintain safe distances.'
      };
    } else if (score >= 35) {
      return {
        icon: Frown,
        color: 'text-orange-400',
        text: 'Poor driving conditions',
        drivingTip: 'Consider postponing non-essential travel. Slow down if driving.'
      };
    } else {
      return {
        icon: Frown,
        color: 'text-red-500',
        text: 'Dangerous driving conditions',
        drivingTip: 'Avoid driving if possible. Emergency vehicles only.'
      };
    }
  };
  
  const conditionDetails = getConditionDetails();
  const IconComponent = conditionDetails.icon;
  
  // Get condition factor icons
  const getFactorIcons = () => {
    const factors = [];
    
    // Temperature factor
    if (temperature < 32) {
      factors.push({ 
        icon: Thermometer, 
        color: 'text-blue-400', 
        text: 'Freezing Temps' 
      });
    } else if (temperature > 85) {
      factors.push({ 
        icon: Thermometer, 
        color: 'text-red-400', 
        text: 'Hot Conditions' 
      });
    }
    
    // Visibility factor
    if (visibility < 5) {
      factors.push({ 
        icon: Eye, 
        color: 'text-gray-400', 
        text: 'Limited Visibility' 
      });
    }
    
    // Wind factor
    if (windSpeed > 15) {
      factors.push({ 
        icon: Wind, 
        color: 'text-teal-400', 
        text: 'Windy Conditions' 
      });
    }
    
    // Precipitation factor
    if (precipitation > 0) {
      factors.push({ 
        icon: Droplets, 
        color: 'text-blue-400', 
        text: 'Wet Roads' 
      });
    }
    
    return factors;
  };
  
  const factors = getFactorIcons();
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg mb-6">
      <h3 className="apex-header-green mb-4">DRIVING CONDITIONS</h3>
      
      <div className="flex flex-col items-center mb-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`${conditionDetails.color} mb-2`}
        >
          <IconComponent size={60} strokeWidth={1.5} />
        </motion.div>
        <p className="text-xl font-semibold text-white mb-1">{conditionDetails.text}</p>
        <p className="text-gray-300">{conditionDetails.drivingTip}</p>
      </div>
      
      {factors.length > 0 && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-sm text-gray-400 mb-2">Weather factors affecting driving:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {factors.map((factor, index) => {
              const FactorIcon = factor.icon;
              return (
                <div key={index} className="flex items-center gap-1 bg-gray-900 px-3 py-2 rounded-full">
                  <FactorIcon className={`${factor.color} h-4 w-4`} />
                  <span className="text-sm text-gray-300">{factor.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Add static method for getting driving condition outside component
DrivingConditionEmoji.getDrivingCondition = (temperature, visibility, windSpeed, precipitation) => {
  // Calculate score using the same logic
  // Temperature factor (0-25 points)
  let tempScore = 25;
  if (temperature < 32) {
    tempScore = Math.max(5, (temperature / 32) * 15);
  } else if (temperature < 50) {
    tempScore = 15 + ((temperature - 32) / 18) * 10;
  } else if (temperature > 85) {
    tempScore = 25 - Math.min(15, (temperature - 85) / 10);
  }
  
  // Visibility factor (0-30 points)
  let visibilityScore = 30;
  if (visibility < 0.25) {
    visibilityScore = 0;
  } else if (visibility < 1) {
    visibilityScore = visibility * 10;
  } else if (visibility < 5) {
    visibilityScore = 10 + ((visibility - 1) / 4) * 20;
  }
  
  // Wind factor (0-20 points)
  let windScore = 20;
  if (windSpeed > 35) {
    windScore = 5;
  } else if (windSpeed > 20) {
    windScore = 5 + ((35 - windSpeed) / 15) * 10;
  } else if (windSpeed > 10) {
    windScore = 15 + ((20 - windSpeed) / 10) * 5;
  }
  
  // Precipitation factor (0-25 points)
  let precipScore = 25;
  if (precipitation > 0.5) {
    precipScore = 5;
  } else if (precipitation > 0.1) {
    precipScore = 5 + ((0.5 - precipitation) / 0.4) * 10;
  } else if (precipitation > 0) {
    precipScore = 15 + ((0.1 - precipitation) / 0.1) * 10;
  }
  
  // Calculate final score (0-100)
  const score = Math.round(tempScore + visibilityScore + windScore + precipScore);
  
  // Return condition based on score
  if (score >= 85) {
    return {
      icon: "Smile",
      color: 'text-green-500',
      text: 'Excellent driving conditions',
      drivingTip: 'Perfect time for a drive! Enjoy the road responsibly.'
    };
  } else if (score >= 65) {
    return {
      icon: "Smile",
      color: 'text-green-400',
      text: 'Good driving conditions',
      drivingTip: 'Good conditions overall. Enjoy your drive!'
    };
  } else if (score >= 50) {
    return {
      icon: "Meh",
      color: 'text-yellow-400',
      text: 'Fair driving conditions',
      drivingTip: 'Drive with extra care and maintain safe distances.'
    };
  } else if (score >= 35) {
    return {
      icon: "Frown",
      color: 'text-orange-400',
      text: 'Poor driving conditions',
      drivingTip: 'Consider postponing non-essential travel. Slow down if driving.'
    };
  } else {
    return {
      icon: "Frown",
      color: 'text-red-500',
      text: 'Dangerous driving conditions',
      drivingTip: 'Avoid driving if possible. Emergency vehicles only.'
    };
  }
};

export default DrivingConditionEmoji;