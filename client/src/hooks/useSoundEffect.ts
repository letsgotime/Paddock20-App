import { useState, useEffect, useCallback } from 'react';
import { playSound, playSoundSequence, SoundType } from '@/services/soundService';

/**
 * Custom hook for managing sound effects throughout the application
 * Provides a consistent API for playing sounds and managing sound settings
 */
export default function useSoundEffect() {
  // State for sound settings
  const [isEnabled, setIsEnabled] = useState(() => {
    const savedState = localStorage.getItem('soundEnabled');
    return savedState !== null ? savedState === 'true' : true;
  });
  
  const [ambientEnabled, setAmbientEnabled] = useState(() => {
    const savedState = localStorage.getItem('ambientEnabled');
    return savedState !== null ? savedState === 'true' : false;
  });
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('soundVolume');
    return savedVolume !== null ? parseInt(savedVolume, 10) : 70;
  });
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('soundEnabled', String(isEnabled));
    localStorage.setItem('ambientEnabled', String(ambientEnabled));
    localStorage.setItem('soundVolume', String(volume));
  }, [isEnabled, ambientEnabled, volume]);

  // Function to play a sound if sound is enabled
  const handlePlaySound = useCallback((sound: SoundType) => {
    if (isEnabled) {
      playSound(sound, volume / 100);
    }
  }, [isEnabled, volume]);
  
  // Function to toggle sound on/off
  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
    playSound('ui_toggle', volume / 100);
  }, [volume]);
  
  // Function to toggle ambient sounds
  const toggleAmbient = useCallback(() => {
    setAmbientEnabled(prev => {
      // Play different sounds based on whether we're turning on or off
      if (!prev) {
        // Fix the call to playSoundSequence - pass an array of SoundType
        playSoundSequence([
          'ambient_on' as SoundType, 
          'ambient_loop' as SoundType
        ], volume / 100);
      } else {
        playSound('ambient_off', volume / 100);
      }
      return !prev;
    });
  }, [volume]);
  
  // Function to set volume level (0-100)
  const setVolumeLevel = useCallback((newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
    playSound('ui_click', newVolume / 100);
  }, []);
  
  // Ambient sound loop management
  useEffect(() => {
    let ambientLoop: HTMLAudioElement | null = null;
    
    if (ambientEnabled && isEnabled) {
      // Create and play the ambient loop
      ambientLoop = new Audio('/assets/sounds/ambient_loop.mp3');
      ambientLoop.loop = true;
      ambientLoop.volume = (volume / 100) * 0.3; // Ambient sounds at 30% of master volume
      ambientLoop.play().catch(error => {
        console.warn('Failed to play ambient sound loop:', error);
      });
    }
    
    return () => {
      if (ambientLoop) {
        ambientLoop.pause();
        ambientLoop = null;
      }
    };
  }, [ambientEnabled, isEnabled, volume]);
  
  return {
    isEnabled,
    ambientEnabled,
    volume,
    playSound: handlePlaySound,
    toggleSound,
    toggleAmbient,
    setVolumeLevel,
  };
}