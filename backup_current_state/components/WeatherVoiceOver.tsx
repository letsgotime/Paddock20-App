import React from 'react';
import { getWeatherDescription } from '../lib/accessibility';

interface WeatherVoiceOverProps {
  weatherData: any;
  buttonClassName?: string;
}

/**
 * WeatherVoiceOver Component
 * 
 * A screen-reader friendly component that provides a button to read weather data aloud
 * and includes hidden text for screen readers
 */
const WeatherVoiceOver: React.FC<WeatherVoiceOverProps> = ({ 
  weatherData, 
  buttonClassName = "mt-4 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded"
}) => {
  if (!weatherData) {
    return null;
  }

  // Handler to speak the weather information
  const handleSpeak = () => {
    const weatherText = getWeatherDescription(weatherData);
    const utterance = new SpeechSynthesisUtterance(weatherText);
    
    // Try to get an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.includes('en-'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Hidden text for screen readers */}
      <div aria-live="polite" className="sr-only">
        {getWeatherDescription(weatherData)}
      </div>
      
      {/* Button to activate speech synthesis */}
      <button
        onClick={handleSpeak}
        className={buttonClassName}
        aria-label="Speak weather update aloud"
      >
        🎙️ Speak Weather Update
      </button>
    </>
  );
};

export default WeatherVoiceOver;