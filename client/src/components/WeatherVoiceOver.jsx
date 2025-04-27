import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

function WeatherVoiceOver({ 
  weatherData, 
  forecastData, 
  drivingCondition,
  isVisible = true 
}) {
  const [speaking, setSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  
  // Check if speech synthesis is available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechEnabled(true);
    }
  }, []);
  
  // Generate detailed weather description
  const generateWeatherDescription = useCallback(() => {
    if (!weatherData) return '';
    
    // Build weather description
    let description = `Current weather conditions for ${weatherData.name}. `;
    
    // Current conditions
    if (weatherData.weather && weatherData.weather.length > 0) {
      description += `The current condition is ${weatherData.weather[0].description}. `;
    }
    
    // Temperature
    if (weatherData.main) {
      description += `The temperature is ${Math.round(weatherData.main.temp)} degrees Fahrenheit, `;
      description += `with a feels like temperature of ${Math.round(weatherData.main.feels_like)} degrees. `;
      description += `Humidity is at ${weatherData.main.humidity} percent. `;
    }
    
    // Wind
    if (weatherData.wind) {
      description += `Wind is blowing at ${Math.round(weatherData.wind.speed)} miles per hour. `;
    }
    
    // Add driving recommendation if available
    if (drivingCondition) {
      description += `Driving conditions are ${drivingCondition.text.toLowerCase()}. ${drivingCondition.drivingTip} `;
    }
    
    // Add forecast if available
    if (forecastData && forecastData.list && forecastData.list.length > 0) {
      const nextForecast = forecastData.list[0];
      description += `In the next few hours, expect ${nextForecast.weather[0].description} `;
      description += `with temperatures around ${Math.round(nextForecast.main.temp)} degrees Fahrenheit. `;
    }
    
    return description;
  }, [weatherData, forecastData, drivingCondition]);
  
  // Speak the weather information
  const speak = useCallback(() => {
    if (!speechEnabled || !weatherData) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const description = generateWeatherDescription();
    const utterance = new SpeechSynthesisUtterance(description);
    
    // Set voice settings
    utterance.rate = 0.95; // Slightly slower
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Get available voices and set a preferable one if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Alex') || // macOS voice
      voice.name.includes('Google US English') || // Chrome
      voice.name.includes('Microsoft David') || // Windows
      voice.name.includes('English United States') // Generic
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Event handlers
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled, weatherData, generateWeatherDescription]);
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (!speechEnabled) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [speechEnabled]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (speechEnabled) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechEnabled]);
  
  if (!isVisible || !speechEnabled) return null;
  
  return (
    <div className="flex flex-col items-center mb-4">
      <button
        onClick={speaking ? stopSpeaking : speak}
        className="flex items-center gap-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
        aria-label={speaking ? "Stop weather voice description" : "Play weather voice description"}
      >
        {speaking ? (
          <>
            <VolumeX className="h-5 w-5 text-red-400" />
            <span>Stop Voice Description</span>
          </>
        ) : (
          <>
            <Volume2 className="h-5 w-5 text-green-400" />
            <span>Listen to Weather Report</span>
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 mt-1">
        {speaking ? "Playing weather report..." : "Click to hear detailed weather information"}
      </p>
    </div>
  );
}

export default WeatherVoiceOver;