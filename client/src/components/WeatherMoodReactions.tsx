import React, { useState, useEffect } from 'react';
import { Smile, Frown, CloudRain, Sun, Cloud, Snowflake, Wind, ThumbsUp, ThumbsDown } from 'lucide-react';

interface WeatherMoodReactionsProps {
  weatherData: any;
}

/**
 * Weather Mood Reactions Component
 * 
 * Displays emoji reactions based on current weather conditions and allows users
 * to react with their own mood in relation to the weather
 */
const WeatherMoodReactions: React.FC<WeatherMoodReactionsProps> = ({ weatherData }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodStats, setMoodStats] = useState<Record<string, number>>({
    'love': 0,
    'happy': 0,
    'sad': 0,
    'neutral': 0,
    'dislike': 0
  });
  const [animateEmoji, setAnimateEmoji] = useState<string | null>(null);
  
  // Determine appropriate weather emoji based on conditions
  const getWeatherEmoji = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return { icon: <Cloud size={40} />, description: 'Unknown weather conditions' };
    }

    const weatherCode = weatherData.weather[0].id;
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    
    // Thunderstorm
    if (weatherCode >= 200 && weatherCode < 300) {
      return { 
        icon: '⛈️', 
        description: 'Thunderstorm',
        moodSuggestion: 'Stay cozy indoors with a book or movie'
      };
    }
    
    // Drizzle
    if (weatherCode >= 300 && weatherCode < 400) {
      return { 
        icon: '🌦️', 
        description: 'Drizzle',
        moodSuggestion: 'Perfect for a light walk with a jacket' 
      };
    }
    
    // Rain
    if (weatherCode >= 500 && weatherCode < 600) {
      return { 
        icon: '🌧️', 
        description: 'Rain',
        moodSuggestion: 'Hot coffee and relaxing indoors recommended' 
      };
    }
    
    // Snow
    if (weatherCode >= 600 && weatherCode < 700) {
      return { 
        icon: '❄️', 
        description: 'Snow',
        moodSuggestion: 'Bundle up! Perfect for winter photography or a snowball fight' 
      };
    }
    
    // Atmosphere (fog, mist, etc.)
    if (weatherCode >= 700 && weatherCode < 800) {
      return { 
        icon: '🌫️', 
        description: 'Foggy/Misty',
        moodSuggestion: 'Drive carefully, turn on your fog lights' 
      };
    }
    
    // Clear
    if (weatherCode === 800) {
      return { 
        icon: '☀️', 
        description: 'Clear Sky',
        moodSuggestion: 'Perfect day for a drive or outdoor activities' 
      };
    }
    
    // Clouds
    if (weatherCode > 800) {
      return { 
        icon: '☁️', 
        description: 'Cloudy',
        moodSuggestion: 'Good day for a casual cruise' 
      };
    }
    
    // Fallback
    return { 
      icon: '🌡️', 
      description: weatherMain,
      moodSuggestion: 'Check local conditions before heading out' 
    };
  };

  // Get activity recommendations based on weather
  const getActivityRecommendation = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      return "Check weather conditions before planning activities";
    }

    const temp = weatherData.main?.temp || 0;
    const windSpeed = weatherData.wind?.speed || 0;
    const weatherCode = weatherData.weather[0].id;
    
    // Too hot
    if (temp > 95) {
      return "Too hot for most driving activities. Consider indoor car maintenance or detailing in a shaded area.";
    }
    
    // Hot weather
    if (temp > 85) {
      return "Good temperature for drives, but monitor engine temps. Early morning or evening drives recommended.";
    }
    
    // Ideal weather
    if (temp >= 65 && temp <= 85 && weatherCode >= 800) {
      return "Perfect conditions for driving! Ideal for spirited driving or scenic routes.";
    }
    
    // Cool weather
    if (temp >= 45 && temp < 65) {
      return "Great temperature for driving. Your car's performance might be slightly enhanced in cooler weather.";
    }
    
    // Cold weather
    if (temp < 45 && temp > 32) {
      return "Cold weather driving. Allow your car to warm up properly before driving hard.";
    }
    
    // Freezing weather
    if (temp <= 32) {
      return "Freezing conditions. Check tire pressure, use winter tires if available, and drive with caution.";
    }
    
    // Rain
    if (weatherCode >= 500 && weatherCode < 600) {
      return "Rainy conditions. Reduce speed, increase following distance, and be gentle with controls.";
    }
    
    // Snow
    if (weatherCode >= 600 && weatherCode < 700) {
      return "Snowy conditions. Consider postponing drive or use appropriate winter gear and techniques.";
    }
    
    // High winds
    if (windSpeed > 20) {
      return "High winds detected. Be cautious of crosswinds, especially in larger vehicles.";
    }
    
    // Default
    return "Check local conditions and drive accordingly. Always prioritize safety.";
  };

  // Simulate fetching mood statistics
  useEffect(() => {
    // In a real app, this would be an API call to get actual user mood statistics
    const simulatedStats = {
      'love': Math.floor(Math.random() * 30),
      'happy': Math.floor(Math.random() * 40),
      'neutral': Math.floor(Math.random() * 20),
      'sad': Math.floor(Math.random() * 15),
      'dislike': Math.floor(Math.random() * 10),
    };
    
    setMoodStats(simulatedStats);
  }, [weatherData]);

  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    // Animate the selected emoji
    setAnimateEmoji(mood);
    setTimeout(() => setAnimateEmoji(null), 1000);
    
    // Update selected mood
    setSelectedMood(mood);
    
    // Update mood stats (in a real app, this would be an API call)
    setMoodStats(prev => ({
      ...prev,
      [mood]: prev[mood] + 1
    }));
  };

  // Get total reactions for calculating percentages
  const totalReactions = Object.values(moodStats).reduce((sum, count) => sum + count, 0);

  // Get weather emoji and description
  const { icon, description, moodSuggestion } = getWeatherEmoji();
  const activityRecommendation = getActivityRecommendation();

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-blue-400 font-orbitron text-xl mb-4">Weather Mood Reactions</h3>
      
      {/* Weather emoji and description */}
      <div className="flex flex-col sm:flex-row items-center mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="text-5xl mb-3 sm:mb-0 sm:mr-4">
          {typeof icon === 'string' ? icon : icon}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{description}</p>
          <p className="text-sm text-gray-300">{moodSuggestion}</p>
        </div>
      </div>
      
      {/* Activity recommendation */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h4 className="text-green-500 font-orbitron text-lg mb-2">Driver's Recommendation</h4>
        <p className="text-gray-300">{activityRecommendation}</p>
      </div>
      
      {/* Mood reaction options */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">How do you feel about this weather?</h4>
        <div className="flex justify-between max-w-md mx-auto">
          <button 
            onClick={() => handleMoodSelect('love')}
            className={`p-2 rounded-full transition-transform ${animateEmoji === 'love' ? 'scale-150' : ''} ${selectedMood === 'love' ? 'bg-pink-900/30 ring-2 ring-pink-600' : 'hover:bg-gray-800'}`}
            aria-label="Love this weather"
            aria-pressed={selectedMood === 'love'}
          >
            <span className="text-2xl" role="img" aria-label="Love">😍</span>
          </button>
          
          <button 
            onClick={() => handleMoodSelect('happy')}
            className={`p-2 rounded-full transition-transform ${animateEmoji === 'happy' ? 'scale-150' : ''} ${selectedMood === 'happy' ? 'bg-green-900/30 ring-2 ring-green-600' : 'hover:bg-gray-800'}`}
            aria-label="Happy about this weather"
            aria-pressed={selectedMood === 'happy'}
          >
            <span className="text-2xl" role="img" aria-label="Happy">😊</span>
          </button>
          
          <button 
            onClick={() => handleMoodSelect('neutral')}
            className={`p-2 rounded-full transition-transform ${animateEmoji === 'neutral' ? 'scale-150' : ''} ${selectedMood === 'neutral' ? 'bg-blue-900/30 ring-2 ring-blue-600' : 'hover:bg-gray-800'}`}
            aria-label="Neutral about this weather"
            aria-pressed={selectedMood === 'neutral'}
          >
            <span className="text-2xl" role="img" aria-label="Neutral">😐</span>
          </button>
          
          <button 
            onClick={() => handleMoodSelect('sad')}
            className={`p-2 rounded-full transition-transform ${animateEmoji === 'sad' ? 'scale-150' : ''} ${selectedMood === 'sad' ? 'bg-purple-900/30 ring-2 ring-purple-600' : 'hover:bg-gray-800'}`}
            aria-label="Sad about this weather"
            aria-pressed={selectedMood === 'sad'}
          >
            <span className="text-2xl" role="img" aria-label="Sad">😔</span>
          </button>
          
          <button 
            onClick={() => handleMoodSelect('dislike')}
            className={`p-2 rounded-full transition-transform ${animateEmoji === 'dislike' ? 'scale-150' : ''} ${selectedMood === 'dislike' ? 'bg-red-900/30 ring-2 ring-red-600' : 'hover:bg-gray-800'}`}
            aria-label="Dislike this weather"
            aria-pressed={selectedMood === 'dislike'}
          >
            <span className="text-2xl" role="img" aria-label="Dislike">😠</span>
          </button>
        </div>
      </div>
      
      {/* Community mood statistics */}
      <div>
        <h4 className="text-white font-semibold mb-3">Community Reactions</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-xl mr-2" role="img" aria-hidden="true">😍</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 ml-2">
              <div 
                className="bg-pink-600 h-4 rounded-full" 
                style={{ width: `${totalReactions ? (moodStats.love / totalReactions * 100) : 0}%` }}
                aria-label={`${moodStats.love} love reactions, ${totalReactions ? Math.round(moodStats.love / totalReactions * 100) : 0}% of total`}
              />
            </div>
            <span className="ml-2 text-xs">{moodStats.love}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl mr-2" role="img" aria-hidden="true">😊</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 ml-2">
              <div 
                className="bg-green-600 h-4 rounded-full" 
                style={{ width: `${totalReactions ? (moodStats.happy / totalReactions * 100) : 0}%` }}
                aria-label={`${moodStats.happy} happy reactions, ${totalReactions ? Math.round(moodStats.happy / totalReactions * 100) : 0}% of total`}
              />
            </div>
            <span className="ml-2 text-xs">{moodStats.happy}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl mr-2" role="img" aria-hidden="true">😐</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 ml-2">
              <div 
                className="bg-blue-600 h-4 rounded-full" 
                style={{ width: `${totalReactions ? (moodStats.neutral / totalReactions * 100) : 0}%` }}
                aria-label={`${moodStats.neutral} neutral reactions, ${totalReactions ? Math.round(moodStats.neutral / totalReactions * 100) : 0}% of total`}
              />
            </div>
            <span className="ml-2 text-xs">{moodStats.neutral}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl mr-2" role="img" aria-hidden="true">😔</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 ml-2">
              <div 
                className="bg-purple-600 h-4 rounded-full" 
                style={{ width: `${totalReactions ? (moodStats.sad / totalReactions * 100) : 0}%` }}
                aria-label={`${moodStats.sad} sad reactions, ${totalReactions ? Math.round(moodStats.sad / totalReactions * 100) : 0}% of total`}
              />
            </div>
            <span className="ml-2 text-xs">{moodStats.sad}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-xl mr-2" role="img" aria-hidden="true">😠</span>
            <div className="flex-1 bg-gray-800 rounded-full h-4 ml-2">
              <div 
                className="bg-red-600 h-4 rounded-full" 
                style={{ width: `${totalReactions ? (moodStats.dislike / totalReactions * 100) : 0}%` }}
                aria-label={`${moodStats.dislike} dislike reactions, ${totalReactions ? Math.round(moodStats.dislike / totalReactions * 100) : 0}% of total`}
              />
            </div>
            <span className="ml-2 text-xs">{moodStats.dislike}</span>
          </div>
        </div>
      </div>
      
      {/* Selected mood confirmation */}
      {selectedMood && (
        <div className="mt-4 text-center text-sm text-gray-300">
          <p>Thanks for sharing your reaction to today's weather!</p>
        </div>
      )}
    </div>
  );
};

export default WeatherMoodReactions;