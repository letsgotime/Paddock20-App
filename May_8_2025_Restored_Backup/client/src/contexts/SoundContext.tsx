import React, { createContext, ReactNode, useContext } from 'react';
import { SoundType } from '@/services/soundService';
import useSoundEffect from '@/hooks/useSoundEffect';

/**
 * Interface defining the sound context API
 */
interface SoundContextType {
  // Current sound system state
  isEnabled: boolean;
  ambientEnabled: boolean;
  volume: number;
  
  // Methods for controlling sounds
  playSound: (sound: SoundType) => void;
  toggleSound: () => void;
  toggleAmbient: () => void;
  setVolumeLevel: (newVolume: number) => void;
}

// Create the context with default values
const SoundContext = createContext<SoundContextType>({
  isEnabled: false,
  ambientEnabled: false,
  volume: 70,
  playSound: () => {},
  toggleSound: () => {},
  toggleAmbient: () => {},
  setVolumeLevel: () => {},
});

/**
 * Hook to access the SoundContext
 * @returns The sound context value
 */
export const useSoundContext = () => useContext(SoundContext);

/**
 * SoundProvider component that wraps the application with sound functionality
 */
export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the custom hook to manage sound effects
  const {
    isEnabled,
    ambientEnabled,
    volume,
    playSound,
    toggleSound,
    toggleAmbient,
    setVolumeLevel
  } = useSoundEffect();
  
  return (
    <SoundContext.Provider
      value={{
        isEnabled,
        ambientEnabled,
        volume,
        playSound,
        toggleSound,
        toggleAmbient,
        setVolumeLevel
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export default SoundContext;