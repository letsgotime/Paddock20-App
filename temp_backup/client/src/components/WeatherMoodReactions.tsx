import React, { useState } from 'react';

interface WeatherMoodReactionsProps {
  weatherData: any;
}

/**
 * A component that allows users to react to current weather conditions
 * with emoji-based reactions and mood indicators
 */
const WeatherMoodReactions: React.FC<WeatherMoodReactionsProps> = ({ weatherData }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState<{[key: string]: number}>({
    '😍': 0,
    '😎': 0,
    '😊': 0,
    '😐': 0,
    '😒': 0,
    '😢': 0,
    '😡': 0,
    '🥶': 0,
    '🥵': 0
  });
  const [hasReacted, setHasReacted] = useState(false);
  
  if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
    return null;
  }
  
  // Get weather condition details
  const temp = weatherData.main?.temp || 0;
  const weatherId = weatherData.weather[0].id;
  const weatherType = weatherData.weather[0].main;
  
  // Suggest relevant moods based on weather
  const getSuggestedMoods = () => {
    // Thunderstorm
    if (weatherId >= 200 && weatherId < 300) {
      return ['😒', '😐', '😡'];
    }
    // Drizzle
    else if (weatherId >= 300 && weatherId < 400) {
      return ['😐', '😒', '😢'];
    }
    // Rain
    else if (weatherId >= 500 && weatherId < 600) {
      return ['😐', '😒', '😢'];
    }
    // Snow
    else if (weatherId >= 600 && weatherId < 700) {
      return ['😍', '😊', '🥶'];
    }
    // Atmosphere (fog, haze, etc.)
    else if (weatherId >= 700 && weatherId < 800) {
      return ['😐', '😒'];
    }
    // Clear
    else if (weatherId === 800) {
      // If it's clear but very cold
      if (temp < 40) {
        return ['😎', '🥶', '😊'];
      }
      // If it's clear but very hot
      else if (temp > 85) {
        return ['😎', '🥵', '😒'];
      }
      // If it's clear and nice
      else {
        return ['😍', '😎', '😊'];
      }
    }
    // Cloudy
    else if (weatherId > 800) {
      return ['😐', '😒', '😊'];
    }
    
    // Default set of moods
    return ['😊', '😐', '😒'];
  };
  
  const getReactionTitle = () => {
    // Default question
    let question = "How do you feel about today's weather?";
    
    // Customize based on weather
    if (weatherId >= 200 && weatherId < 300) {
      question = "How's the thunderstorm affecting your mood?";
    } else if (weatherId >= 500 && weatherId < 600) {
      question = "Rain got you feeling a certain way?";
    } else if (weatherId >= 600 && weatherId < 700) {
      question = "How's the snow making you feel?";
    } else if (weatherId === 800 && temp > 85) {
      question = "Is this heat working for you?";
    } else if (weatherId === 800 && temp < 40) {
      question = "How are you handling the cold clear day?";
    } else if (weatherId === 800 && temp >= 40 && temp <= 85) {
      question = "Perfect weather! How's it affecting your vibe?";
    }
    
    return question;
  };
  
  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    if (hasReacted) return;
    
    setSelectedMood(mood);
    setReactionCount({
      ...reactionCount,
      [mood]: reactionCount[mood] + 1
    });
    setHasReacted(true);
  };
  
  // Get all moods to display
  const allMoods = Object.keys(reactionCount);
  
  // Get suggested moods for this weather
  const suggestedMoods = getSuggestedMoods();
  
  // Get other moods (not in suggested)
  const otherMoods = allMoods.filter(mood => !suggestedMoods.includes(mood));
  
  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-blue-400 font-orbitron text-xl mb-4">Weather Mood Tracker</h3>
      
      <div className="mb-4">
        <p className="text-white">{getReactionTitle()}</p>
      </div>
      
      <div className="space-y-4">
        {/* Weather description */}
        <div className="bg-gray-800 rounded p-3 flex items-center justify-between">
          <div>
            <span className="text-gray-400">Current conditions:</span>
            <span className="ml-2 text-white">
              {weatherData.weather[0].description.charAt(0).toUpperCase() + 
               weatherData.weather[0].description.slice(1)}
              {temp ? `, ${Math.round(temp)}°` : ''}
            </span>
          </div>
        </div>
        
        {/* Suggested Moods */}
        <div>
          <h4 className="text-green-400 text-sm font-semibold mb-2">SUGGESTED FOR THIS WEATHER:</h4>
          <div className="flex flex-wrap gap-3">
            {suggestedMoods.map(mood => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`text-2xl p-2 rounded-full transition-all ${
                  selectedMood === mood
                    ? 'bg-blue-500 transform scale-110'
                    : 'bg-gray-800 hover:bg-gray-700'
                } ${hasReacted && selectedMood !== mood ? 'opacity-50' : ''}`}
                disabled={hasReacted && selectedMood !== mood}
                aria-label={`React with ${mood} emoji`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        
        {/* Other Moods */}
        <div>
          <h4 className="text-gray-400 text-sm font-semibold mb-2">OTHER MOODS:</h4>
          <div className="flex flex-wrap gap-3">
            {otherMoods.map(mood => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`text-2xl p-2 rounded-full transition-all ${
                  selectedMood === mood
                    ? 'bg-blue-500 transform scale-110'
                    : 'bg-gray-800 hover:bg-gray-700'
                } ${hasReacted && selectedMood !== mood ? 'opacity-50' : ''}`}
                disabled={hasReacted && selectedMood !== mood}
                aria-label={`React with ${mood} emoji`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results Section (simplified for this version) */}
        {hasReacted && (
          <div className="mt-6 bg-gray-800 p-4 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">Community Vibes</h4>
            <p className="text-gray-300 mb-4">
              You and others in your area feel {selectedMood} about today's weather.
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {Object.entries(reactionCount)
                .sort(([_, countA], [__, countB]) => countB - countA)
                .slice(0, 5)
                .map(([mood, count]) => (
                  <div 
                    key={mood} 
                    className={`p-2 rounded-lg text-center ${
                      mood === selectedMood ? 'bg-blue-900/40 border border-blue-700' : 'bg-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood}</div>
                    <div className="text-sm text-gray-300">
                      {count} {count === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
        
        {/* Reset Button (only show after reacting) */}
        {hasReacted && (
          <button
            onClick={() => {
              setHasReacted(false);
              setSelectedMood(null);
            }}
            className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
          >
            Reset my reaction
          </button>
        )}
        
        {/* Automotive-specific mood note */}
        <div className="mt-4 text-sm text-gray-400 italic">
          <p>Note: Weather reactions help the Paddock20 community plan drives and events based on collective preferences.</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherMoodReactions;