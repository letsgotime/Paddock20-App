import React, { useState, useEffect } from 'react';
import { Volume2, RefreshCw, Volume } from 'lucide-react';
import { getWeatherDescription } from '@/lib/accessibility';

interface WeatherData {
  name?: string;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
  };
  weather?: Array<{
    description?: string;
    icon?: string;
  }>;
  wind?: {
    speed?: number;
  };
  current?: {
    uvi?: number;
  };
}

/**
 * Voice Enabled Weather Component
 * 
 * A concise weather display with text-to-speech capabilities
 * for improved accessibility
 */
const VoiceEnabledWeather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('Could not fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Unable to load weather information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech functionality
  const speakWeather = () => {
    if (!weatherData) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const weatherDescription = getWeatherDescription(weatherData);
    const utterance = new SpeechSynthesisUtterance(weatherDescription);
    
    // Set speech properties
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Try to get a natural-sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.includes('en-'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
    
    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Get weather icon URL based on OpenWeather icon code
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-12 bg-gray-800 rounded mb-2"></div>
        <div className="h-6 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg shadow-lg">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchWeatherData}
          className="mt-2 text-red-400 hover:text-red-300 flex items-center"
        >
          <RefreshCw size={14} className="mr-1" /> Try again
        </button>
      </div>
    );
  }

  if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
        <p>No weather data available</p>
      </div>
    );
  }

  // Extract weather data
  const location = weatherData.name;
  const temperature = weatherData.main?.temp ? Math.round(weatherData.main.temp) : 'N/A';
  const description = weatherData.weather[0]?.description || 'Unknown conditions';
  const iconCode = weatherData.weather[0]?.icon || '01d';

  return (
    <div className="p-4 bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg border border-gray-800 hover:border-green-800 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-blue-500">Current Weather</h3>
        <button 
          onClick={fetchWeatherData}
          aria-label="Refresh weather data"
          className="text-gray-400 hover:text-blue-400 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-2xl font-bold mb-1">{temperature}°F</p>
          <p className="text-blue-400 mb-1">{description}</p>
          <p className="text-gray-400 text-sm">{location}</p>
        </div>
        <div className="w-16 h-16">
          <img 
            src={getWeatherIconUrl(iconCode)} 
            alt={description}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Voice controls with accessibility */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={speakWeather}
          className={`flex items-center px-3 py-1 rounded-full ${
            isSpeaking ? 'bg-blue-700 text-white' : 'bg-gray-800 text-blue-400 hover:bg-gray-700'
          } transition-colors`}
          aria-label={isSpeaking ? "Stop speaking weather information" : "Speak weather information"}
          aria-pressed={isSpeaking}
        >
          {isSpeaking ? (
            <>
              <Volume size={16} className="mr-1" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 size={16} className="mr-1" />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>
      
      {/* Hidden for screen readers */}
      <div className="sr-only" aria-live="polite">
        {getWeatherDescription(weatherData)}
      </div>
    </div>
  );
};

export default VoiceEnabledWeather;