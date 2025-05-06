import React, { useState } from 'react';
import { Volume2, VolumeX, Music2, Car } from 'lucide-react';
import { useSoundContext } from '@/contexts/SoundContext';
import SoundButton from '@/components/ui/SoundButton';

/**
 * F1-inspired sound control panel
 * Allows users to manage all sound settings in the application
 */
const SoundControlPanel: React.FC = () => {
  const { 
    isEnabled,
    ambientEnabled,
    volume,
    toggleSound,
    toggleAmbient,
    setVolumeLevel,
    playSound
  } = useSoundContext();
  
  const [expanded, setExpanded] = useState(false);
  
  const handleVolumeChange = (newValue: number) => {
    setVolumeLevel(newValue);
    
    // Play a sample sound to demonstrate new volume
    if (isEnabled) {
      playSound('ui_click');
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
    playSound('ui_click');
  };
  
  return (
    <div className="bg-gray-900 border border-blue-900/50 rounded-lg shadow-lg overflow-hidden">
      {/* Header with expand/collapse functionality */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-blue-900/30">
        <div className="flex items-center">
          <Volume2 className="h-4 w-4 mr-2 text-blue-400" />
          <h3 className="text-sm font-medium text-blue-400">Sound Controls</h3>
        </div>
        <SoundButton 
          onClick={toggleExpanded} 
          className="h-6 w-6 p-0 rounded bg-transparent hover:bg-blue-900/20"
          sound="ui_click"
        >
          <span className="sr-only">{expanded ? 'Collapse' : 'Expand'}</span>
          <div className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M4 6L8 10L12 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </SoundButton>
      </div>
      
      {/* Expandable content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Master sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-300">
              <Volume2 className="h-4 w-4 mr-2" />
              <span>Sound Effects</span>
            </div>
            <SoundButton
              className={`px-2 py-1 text-xs rounded ${
                isEnabled 
                  ? 'bg-green-900 hover:bg-green-800 text-green-400' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
              }`}
              onClick={toggleSound}
              sound="ui_success"
            >
              {isEnabled ? 'ON' : 'OFF'}
            </SoundButton>
          </div>
          
          {/* Ambient sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-300">
              <Music2 className="h-4 w-4 mr-2" />
              <span>Ambient Sounds</span>
            </div>
            <SoundButton
              className={`px-2 py-1 text-xs rounded ${
                ambientEnabled 
                  ? 'bg-green-900 hover:bg-green-800 text-green-400' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
              }`}
              onClick={toggleAmbient}
              sound="ui_success"
              disabled={!isEnabled}
            >
              {ambientEnabled ? 'ON' : 'OFF'}
            </SoundButton>
          </div>
          
          {/* Master volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Master Volume</span>
              <span className="text-xs text-gray-500">{volume}%</span>
            </div>
            <div className="h-5">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                disabled={!isEnabled}
                className={`w-full h-2 appearance-none rounded-full ${
                  isEnabled ? 'bg-gray-700' : 'bg-gray-800'
                }`}
                style={{
                  background: isEnabled 
                    ? `linear-gradient(to right, #3b82f6 ${volume}%, #374151 ${volume}%)` 
                    : '#374151'
                }}
              />
            </div>
          </div>
          
          {/* Sound test buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <SoundButton
              className="w-full px-2 py-1 text-xs rounded bg-blue-900/20 hover:bg-blue-900/40 text-blue-400"
              sound="ui_click"
              disabled={!isEnabled}
            >
              Test UI Sound
            </SoundButton>
            <SoundButton
              className="w-full px-2 py-1 text-xs rounded bg-blue-900/20 hover:bg-blue-900/40 text-blue-400"
              sound="notification"
              disabled={!isEnabled}
            >
              Test Notification
            </SoundButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundControlPanel;