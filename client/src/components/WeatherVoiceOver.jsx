import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { generateWeatherDescription } from '../lib/accessibility';

/**
 * WeatherVoiceOver Component
 * 
 * A screen reader accessibility enhancement that provides an audible
 * weather description using the browser's Speech Synthesis API.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.weatherData - Current weather data object
 * @param {Object} props.forecastData - Optional forecast data object
 * @param {Object} props.drivingCondition - Optional driving condition assessment
 */
function WeatherVoiceOver({ weatherData, forecastData = null, drivingCondition = null }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Create a comprehensive description for screen readers
  const generateVoiceDescription = () => {
    if (!weatherData) {
      return 'Weather data is not available at this time.';
    }

    // Start with the base weather description
    let fullDescription = generateWeatherDescription(weatherData);

    // Add driving conditions if available
    if (drivingCondition) {
      fullDescription += ` Driving conditions assessment: ${drivingCondition.score} out of 10. `;
      fullDescription += `${drivingCondition.recommendation} `;
    }

    // Add forecast information if available
    if (forecastData && forecastData.list && forecastData.list.length > 0) {
      const nextForecast = forecastData.list[0];
      fullDescription += ` Upcoming forecast: ${nextForecast.weather[0].description}. `;
      fullDescription += ` Temperature will be ${Math.round(nextForecast.main.temp)}°F. `;
    }

    return fullDescription;
  };

  // Handle the speak button click
  const handleSpeak = () => {
    // Stop any ongoing speech
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Get the weather description
    const textToSpeak = generateVoiceDescription();

    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Customize voice settings
    utterance.rate = 1.0;  // Normal speaking rate
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    
    // Event handlers
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    // Try to set a better voice if available (English voices)
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(voice => voice.lang.includes('en-'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-4 flex items-center justify-center">
      <button
        onClick={handleSpeak}
        className="apex-button flex items-center space-x-2"
        aria-label={isPlaying ? "Stop weather voice reading" : "Listen to weather report"}
        aria-pressed={isPlaying}
      >
        {isPlaying ? (
          <>
            <VolumeX size={20} aria-hidden="true" />
            <span>Stop Reading</span>
          </>
        ) : (
          <>
            <Volume2 size={20} aria-hidden="true" />
            <span>Listen to Weather Report</span>
          </>
        )}
      </button>
      
      {/* Hidden text for screen readers only */}
      <div className="sr-only" aria-live="polite">
        {isPlaying ? 'Reading weather information aloud' : ''}
      </div>
    </div>
  );
}

export default WeatherVoiceOver;