import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeatherIcon from './WeatherIcon';
import { generateWeatherDescription } from '../lib/accessibility';

/**
 * A simplified weather station component for the homepage
 * with voice over capability for accessibility
 */
const SimpleWeatherStation: React.FC = () => {
  const { weatherData, selectedLocation, unit } = useWeather();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Stop any ongoing speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!weatherData || !selectedLocation) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <p className="text-gray-400 text-center">Loading weather information...</p>
      </div>
    );
  }

  // Temperature unit symbol
  const tempUnit = unit === 'metric' ? '°C' : '°F';
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph';

  // Speak the current weather description
  const speakWeather = () => {
    // Cancel any previous speech
    window.speechSynthesis?.cancel();
    
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    
    const description = generateWeatherDescription(weatherData, unit);
    const utterance = new SpeechSynthesisUtterance(description);

    // Try to use a nice voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Daniel') || voice.name.includes('Google'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <WeatherIcon 
            iconCode={weatherData.weather[0].icon}
            size={36}
            className="mr-2"
          />
          <div>
            <p className="font-orbitron text-lg">{selectedLocation.name}</p>
            <p className="text-gray-400 text-sm">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="text-2xl font-medium">{Math.round(weatherData.main.temp)}{tempUnit}</div>
      </div>
      
      <div className="mt-3 mb-1">
        <div className="flex justify-between text-sm">
          <span>Feels like: {Math.round(weatherData.main.feels_like)}{tempUnit}</span>
          <span>{weatherData.weather[0].description}</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between text-sm text-gray-400">
        <span>Wind: {weatherData.wind.speed} {speedUnit}</span>
        <span>Humidity: {weatherData.main.humidity}%</span>
      </div>
      
      {/* Voice narration button */}
      <div className="mt-3 text-right">
        <Button
          size="sm"
          variant="ghost"
          onClick={speakWeather}
          aria-label={isSpeaking ? "Stop weather narration" : "Listen to weather narration"}
          className={`rounded-full h-8 w-8 p-0 ${isSpeaking ? 'text-green-500' : 'text-gray-400 hover:text-blue-400'}`}
        >
          {isSpeaking ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </Button>
      </div>
    </div>
  );
};

export default SimpleWeatherStation;