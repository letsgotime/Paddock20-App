/**
 * Sound Service for Paddock20
 * Provides ambient sound design for user interactions
 */

// Sound categories with their respective URLs
const sounds = {
  // Navigation sounds
  navigation: {
    menuOpen: '/assets/sounds/menu-open.mp3',
    menuClose: '/assets/sounds/menu-close.mp3',
    hover: '/assets/sounds/hover.mp3',
    select: '/assets/sounds/select.mp3',
    back: '/assets/sounds/back.mp3',
  },
  
  // UI interaction sounds
  ui: {
    buttonClick: '/assets/sounds/button-click.mp3',
    toggle: '/assets/sounds/toggle.mp3',
    success: '/assets/sounds/success.mp3',
    error: '/assets/sounds/error.mp3',
    notification: '/assets/sounds/notification.mp3',
    modal: '/assets/sounds/modal.mp3',
  },
  
  // Data and telemetry sounds
  telemetry: {
    dataUpdate: '/assets/sounds/data-update.mp3',
    alert: '/assets/sounds/alert.mp3',
    warning: '/assets/sounds/warning.mp3',
  },
  
  // Automotive sounds
  automotive: {
    engineStart: '/assets/sounds/engine-start.mp3',
    engineRev: '/assets/sounds/engine-rev.mp3',
    shifter: '/assets/sounds/shifter.mp3',
    horn: '/assets/sounds/horn.mp3',
  },
};

// Cache audio objects for better performance
const audioCache: Record<string, HTMLAudioElement> = {};

// User preferences for sound (defaulting to enabled)
let soundEnabled = true;
let volume = 0.5; // 50% volume by default

/**
 * Initialize the sound service and load user preferences
 */
export function initSoundService(): void {
  try {
    // Load user preferences from localStorage if available
    const soundPrefs = localStorage.getItem('paddock20_sound_preferences');
    if (soundPrefs) {
      const prefs = JSON.parse(soundPrefs);
      soundEnabled = prefs.enabled !== undefined ? prefs.enabled : true;
      volume = prefs.volume !== undefined ? prefs.volume : 0.5;
    }
    
    // Pre-load common sound effects
    preloadSounds(['ui.buttonClick', 'ui.success', 'ui.error', 'navigation.select']);
    
    console.log('Sound service initialized');
  } catch (error) {
    console.error('Error initializing sound service:', error);
  }
}

/**
 * Preload sound files into cache for instant playback
 */
export function preloadSounds(soundKeys: string[]): void {
  if (!soundEnabled) return;
  
  soundKeys.forEach(key => {
    const soundPath = getSoundPathFromKey(key);
    if (soundPath && !audioCache[key]) {
      const audio = new Audio(soundPath);
      audio.load();
      audioCache[key] = audio;
    }
  });
}

/**
 * Get sound file path from a dot-notation key
 */
function getSoundPathFromKey(key: string): string | null {
  const parts = key.split('.');
  if (parts.length !== 2) return null;
  
  const [category, soundName] = parts;
  return sounds[category as keyof typeof sounds]?.[soundName as any] || null;
}

/**
 * Play a sound by its category and name
 */
export function playSound(soundKey: string): void {
  if (!soundEnabled) return;
  
  try {
    const soundPath = getSoundPathFromKey(soundKey);
    if (!soundPath) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }
    
    let audio: HTMLAudioElement;
    
    // Use cached audio if available
    if (audioCache[soundKey]) {
      audio = audioCache[soundKey];
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
    } else {
      // Create and cache new audio
      audio = new Audio(soundPath);
      audioCache[soundKey] = audio;
    }
    
    // Apply volume setting
    audio.volume = volume;
    
    // Play the sound
    audio.play().catch(err => {
      // Handle common errors like autoplay restrictions
      console.warn(`Failed to play sound ${soundKey}:`, err);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

/**
 * Enable or disable all sounds
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  saveSoundPreferences();
}

/**
 * Set the volume level for all sounds (0.0 to 1.0)
 */
export function setVolume(level: number): void {
  volume = Math.max(0, Math.min(1, level));
  saveSoundPreferences();
}

/**
 * Save user sound preferences to localStorage
 */
function saveSoundPreferences(): void {
  try {
    localStorage.setItem('paddock20_sound_preferences', JSON.stringify({
      enabled: soundEnabled,
      volume: volume
    }));
  } catch (error) {
    console.warn('Could not save sound preferences:', error);
  }
}

/**
 * Get current sound settings
 */
export function getSoundSettings(): { enabled: boolean, volume: number } {
  return {
    enabled: soundEnabled,
    volume: volume
  };
}

/**
 * Clean up audio resources
 */
export function cleanupSoundService(): void {
  Object.keys(audioCache).forEach(key => {
    const audio = audioCache[key];
    audio.pause();
    audio.src = '';
  });
}