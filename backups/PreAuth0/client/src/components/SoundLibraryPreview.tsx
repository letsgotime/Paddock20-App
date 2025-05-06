import React, { useState, useRef, useEffect } from 'react';
import { motorsportSounds, soundsByCategory, SoundEffect } from '../data/soundData';
import { Play, Pause, Volume2, Volume, RefreshCw, Check } from 'lucide-react';

const SoundLibraryPreview: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('racing');
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7); // 70% volume by default
  const [selectedSounds, setSelectedSounds] = useState<Record<string, boolean>>({});
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Categories for filtering
  const categories = [
    { id: 'racing', name: 'Racing Sounds' },
    { id: 'interface', name: 'Interface Sounds' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'ambient', name: 'Ambient' },
  ];

  // Play a sound
  const playSound = (sound: SoundEffect) => {
    try {
      // Import the sound service function dynamically to avoid circular dependencies
      import('../services/soundService').then(soundService => {
        // Try to use the sound service's playMotorsportSound function
        soundService.playMotorsportSound(sound.id);
        setCurrentSound(sound.id);
        
        // Use a timer to automatically clear the current sound status after the duration
        const durationInMs = parseDuration(sound.duration) * 1000;
        setTimeout(() => {
          if (currentSound === sound.id) {
            setCurrentSound(null);
          }
        }, durationInMs);
      });
    } catch (error) {
      console.error('Failed to play sound:', error);
      
      // Fallback to the basic audio element if the sound service fails
      if (audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play();
        setCurrentSound(sound.id);
      }
    }
  };
  
  // Helper function to parse duration string (e.g. "0:03") into seconds
  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 3; // Default fallback duration if parsing fails
  };

  // Toggle sound selection for use in the app
  const toggleSoundSelection = (soundId: string) => {
    setSelectedSounds(prev => ({
      ...prev,
      [soundId]: !prev[soundId]
    }));
  };

  // Export selected sounds
  const exportSelectedSounds = () => {
    const selectedIds = Object.keys(selectedSounds).filter(id => selectedSounds[id]);
    const exportData = motorsportSounds
      .filter(sound => selectedIds.includes(sound.id))
      .reduce((acc, sound) => {
        return {
          ...acc,
          [sound.id]: sound.url
        };
      }, {});
    
    // Create a configuration object with the selections
    const configStr = JSON.stringify(exportData, null, 2);
    
    // Show the exported config
    alert('Copy this configuration to use in your sound service:\n\n' + configStr);
    
    // Alternatively, copy to clipboard
    navigator.clipboard.writeText(configStr)
      .then(() => console.log('Configuration copied to clipboard'))
      .catch(err => console.error('Failed to copy configuration:', err));
  };

  // Effect to handle audio end
  useEffect(() => {
    const handleAudioEnd = () => {
      setCurrentSound(null);
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('ended', handleAudioEnd);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl border border-gray-800">
      <h2 className="text-2xl font-orbitron text-blue-400 mb-6">Motorsport Sound Library</h2>
      
      {/* Audio element (hidden) */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Volume controls */}
      <div className="flex items-center mb-6 bg-black/30 p-3 rounded-lg">
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          className="p-2 rounded-md bg-gray-800 hover:bg-gray-700"
        >
          {isMuted ? <Volume /> : <Volume2 />}
        </button>
        
        <input 
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="mx-4 w-48 accent-blue-500"
        />
        
        <span className="text-gray-400 text-sm">
          {Math.round(volume * 100)}%
        </span>
      </div>
      
      {/* Category tabs */}
      <div className="flex mb-6 overflow-x-auto hide-scrollbar">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 mr-2 rounded-t-lg transition-all flex items-center whitespace-nowrap
              ${activeCategory === category.id 
                ? 'bg-blue-900/30 text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/10'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Sound grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {soundsByCategory[activeCategory as keyof typeof soundsByCategory].map((sound) => (
          <div 
            key={sound.id}
            className={`p-4 rounded-lg border transition-all ${
              selectedSounds[sound.id] 
                ? 'border-green-500 bg-black/50' 
                : 'border-gray-800 bg-black/30 hover:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-md font-medium text-white">{sound.name}</h3>
              <span className="text-xs text-gray-500">{sound.duration}</span>
            </div>
            
            <p className="text-sm text-gray-400 mb-3">{sound.description}</p>
            
            <div className="flex justify-between items-center">
              <button
                onClick={() => playSound(sound)}
                disabled={currentSound === sound.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full 
                  ${currentSound === sound.id 
                    ? 'bg-blue-600 text-white cursor-default' 
                    : 'bg-blue-800 hover:bg-blue-700 text-white'}`}
              >
                {currentSound === sound.id ? <Pause size={18} /> : <Play size={18} />}
              </button>
              
              <button 
                onClick={() => toggleSoundSelection(sound.id)}
                className={`flex items-center px-3 py-1 rounded-md text-sm ${
                  selectedSounds[sound.id] 
                    ? 'bg-green-800 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {selectedSounds[sound.id] ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Selected
                  </>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Export controls */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {Object.values(selectedSounds).filter(Boolean).length} sounds selected
        </div>
        
        <div className="flex">
          <button
            onClick={() => setSelectedSounds({})}
            className="mr-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center text-sm"
          >
            <RefreshCw size={14} className="mr-1" />
            Reset Selection
          </button>
          
          <button
            onClick={exportSelectedSounds}
            disabled={Object.values(selectedSounds).filter(Boolean).length === 0}
            className={`px-4 py-2 rounded-md text-sm ${
              Object.values(selectedSounds).filter(Boolean).length === 0
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Export Selected Sounds
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500 border-t border-gray-800 pt-4">
        Sound effects are preview only. Use these samples to decide which ones you want to include in your application.
      </div>
    </div>
  );
};

export default SoundLibraryPreview;