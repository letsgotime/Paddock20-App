import React, { useState, useEffect, useRef } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, PlayCircle, PauseCircle, SkipForward } from 'lucide-react';
import { 
  generateWeatherDescription, 
  generateForecastDescription,
  generateAlertDescription
} from '../lib/accessibility';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WeatherVoiceOver: React.FC = () => {
  const { weatherData, forecastData, oneCallData, unit } = useWeather();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Get available voices for speech synthesis
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Try to find a nice English voice
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && (voice.name.includes('Daniel') || voice.name.includes('Google'))
      ) || voices[0];
      
      setSelectedVoice(preferredVoice);
    };

    // Voice list might be ready immediately or need this event
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Setup speech synthesis event listeners
  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsPlaying(false);
      
      // Automatically play next section if there is one
      if (currentSection < getWeatherSections().length - 1) {
        setCurrentSection(prev => prev + 1);
        setTimeout(() => {
          speakText(getWeatherSections()[currentSection + 1]);
        }, 1000);
      }
    };

    if (utteranceRef.current) {
      utteranceRef.current.onend = handleSpeechEnd;
      utteranceRef.current.onerror = () => setIsPlaying(false);
    }

    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
    };
  }, [currentSection, utteranceRef.current]);

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Generate sections of weather information to speak
  const getWeatherSections = (): string[] => {
    const sections: string[] = [];

    // Current weather
    if (weatherData) {
      sections.push(generateWeatherDescription(weatherData, unit));
    }

    // Forecast
    if (forecastData) {
      sections.push(generateForecastDescription(forecastData, unit));
    }

    // Alerts
    if (oneCallData?.alerts && oneCallData.alerts.length > 0) {
      sections.push(generateAlertDescription(oneCallData));
    }

    return sections;
  };

  // Speak the text using speech synthesis
  const speakText = (text: string) => {
    if (!text || isMuted) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set utterance properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Keep reference to current utterance
    utteranceRef.current = utterance;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Stop speaking
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      const sections = getWeatherSections();
      if (sections.length > 0) {
        speakText(sections[currentSection]);
      }
    }
  };

  // Skip to next section
  const skipToNextSection = () => {
    stopSpeaking();
    
    const sections = getWeatherSections();
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      setTimeout(() => {
        speakText(sections[currentSection + 1]);
      }, 300);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  const weatherSections = getWeatherSections();
  const hasData = weatherSections.length > 0;

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-800">
      <div className="flex items-center mb-3">
        <h3 className="text-lg font-orbitron text-blue-400 mr-2">Voice Narration</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-xs text-gray-400 bg-gray-800 rounded-full px-2 py-1">?</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Weather information will be narrated through your device's speakers. Use the controls to start/stop the narration.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!hasData ? (
        <p className="text-gray-400 text-sm">Loading weather data for narration...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-300 truncate max-w-xs">
              {currentSection + 1} of {weatherSections.length}: 
              {weatherSections[currentSection].substring(0, 50)}...
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleMute}
              className={`rounded-full w-10 h-10 p-0 ${isMuted ? 'bg-red-900/20 text-red-500' : 'text-green-500'}`}
              aria-label={isMuted ? "Unmute narration" : "Mute narration"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={togglePlayPause}
              className="rounded-full w-10 h-10 p-0 text-blue-400"
              aria-label={isPlaying ? "Pause narration" : "Start narration"}
              disabled={isMuted}
            >
              {isPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={skipToNextSection}
              className="rounded-full w-10 h-10 p-0 text-blue-400"
              aria-label="Skip to next section"
              disabled={isMuted || currentSection >= weatherSections.length - 1}
            >
              <SkipForward size={18} />
            </Button>
            
            <div className="text-xs text-gray-400 ml-auto">
              {isPlaying ? "Speaking..." : "Ready"}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherVoiceOver;