/**
 * Sound Service for Paddock20
 * Provides ambient sound design for user interactions
 * 
 * Enhanced version with F1-style telemetry and motorsport sound design
 */

// Define sound types available
export type SoundType = 
  | 'ui_click'
  | 'ui_hover'
  | 'ui_toggle'
  | 'ui_error'
  | 'ui_success'
  | 'menu_open'
  | 'menu_close'
  | 'notification'
  | 'ambient_on'
  | 'ambient_off'
  | 'ambient_loop'
  | 'telemetry_alert'
  | 'achievement'
  | 'race_start'
  | 'race_flag'
  | 'engine_start';

import { motorsportSounds, soundMappings } from '../data/soundData';

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

  // Motorsport sound library
  motorsport: motorsportSounds.reduce((acc, sound) => ({
    ...acc,
    [sound.id]: sound.url
  }), {}),
};

// Cache audio objects for better performance
const audioCache: Record<string, HTMLAudioElement> = {};

// Background ambient sounds for pages
const backgroundAmbients: Record<string, { soundId: string, volume: number, loop: boolean }> = {
  '/': { soundId: 'paddock_ambient', volume: 0.2, loop: true },
  '/garage-vault': { soundId: 'pit_stop', volume: 0.15, loop: true },
  '/manifestation-station': { soundId: 'start_chime', volume: 0.3, loop: false },
  '/new-weather-center': { soundId: 'radio_beep', volume: 0.25, loop: false },
};

// Keep track of any currently playing ambient sound
let currentAmbientAudio: HTMLAudioElement | null = null;
let currentAmbientSoundId: string | null = null;

// User preferences for sound (defaulting to disabled for ambient sounds)
let soundEnabled = false; // Default to off as requested
let volume = 0.5; // 50% volume by default
let ambientSoundsEnabled = false; // Separate setting for ambient background sounds

// Interaction mappings to sounds - for automatic playback on specific actions
export const interactionSoundMap = {
  // Navigation interactions
  pageTransition: 'button_press',
  back: 'menu_select',
  forward: 'toggle_switch',
  menu: {
    open: 'radio_beep',
    close: 'menu_select',
    select: 'button_press',
    hover: 'radio_beep' // Softer version
  },
  
  // UI element interactions
  button: {
    click: 'button_press',
    hover: 'radio_beep'
  },
  toggle: 'toggle_switch',
  checkbox: 'button_press',
  slider: 'gear_shift',
  dropdown: {
    open: 'menu_select',
    close: 'menu_select',
    select: 'button_press'
  },
  
  // Weather and telemetry
  weather: {
    dataUpdate: 'radio_beep',
    refresh: 'alert_tone',
    warning: 'warning_beep'
  },
  telemetry: {
    update: 'radio_beep',
    alert: 'warning_beep',
    optimal: 'success_tone'
  },
  
  // Vehicle interactions
  vehicle: {
    select: 'car_door',
    details: 'engine_revving',
    stats: 'gear_shift',
    error: 'warning_beep'
  },
  
  // Feedback and notifications
  notification: {
    success: 'success_tone',
    error: 'warning_beep',
    info: 'radio_beep',
    warning: 'alert_tone'
  },
  
  // Special page interactions
  manifestationStation: {
    goalComplete: 'success_tone',
    milestoneReached: 'start_chime',
    newGoalSet: 'gear_shift'
  },
  weatherCenter: {
    locationChange: 'radio_beep',
    refresh: 'button_press',
    alert: 'warning_beep',
    optimal: 'success_tone'
  },
  garageVault: {
    addVehicle: 'car_door',
    removeVehicle: 'tire_screech',
    updateVehicle: 'engine_revving' 
  }
};

/**
 * Initialize the sound service and load user preferences
 */
export function initSoundService(): void {
  try {
    // Load user preferences from localStorage if available
    const soundPrefs = localStorage.getItem('paddock20_sound_preferences');
    if (soundPrefs) {
      const prefs = JSON.parse(soundPrefs);
      soundEnabled = prefs.enabled !== undefined ? prefs.enabled : false; // Default to off if not specified
      volume = prefs.volume !== undefined ? prefs.volume : 0.5;
      ambientSoundsEnabled = prefs.ambientEnabled !== undefined ? prefs.ambientEnabled : false;
    } else {
      // If no preferences are stored, initialize with sounds disabled
      saveSoundPreferences();
    }
    
    // Pre-load common sound effects
    preloadSounds(['ui.buttonClick', 'ui.success', 'ui.error', 'navigation.select']);
    
    // Preload motorsport sounds for commonly used UI interactions
    const commonMotorsportSounds = [
      'radio_beep', 
      'button_press', 
      'toggle_switch', 
      'success_tone',
      'car_door',
      'alert_tone',
      'warning_beep'
    ];
    
    commonMotorsportSounds.forEach(soundId => {
      const sound = motorsportSounds.find(s => s.id === soundId);
      if (sound) {
        const audio = new Audio(sound.url);
        audio.load();
        audioCache[`motorsport.${soundId}`] = audio;
      }
    });
    
    // Listen for page transitions to play ambient sounds
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
    }
    
    console.log('Enhanced Sound service initialized with F1-style telemetry and motorsport sounds');
  } catch (error) {
    console.error('Error initializing sound service:', error);
  }
}

/**
 * Handle route changes for ambient sounds
 */
function handleRouteChange() {
  if (!soundEnabled || !ambientSoundsEnabled) return;
  
  const currentPath = window.location.pathname;
  
  // Check if current path has ambient sound
  const ambientSoundData = backgroundAmbients[currentPath];
  if (ambientSoundData) {
    // Stop any currently playing ambient
    stopCurrentAmbient();
    
    // Play the new ambient sound for this path
    playAmbientSound(ambientSoundData.soundId, ambientSoundData.volume, ambientSoundData.loop);
  } else {
    // If no ambient assigned to this path, stop any current ambient
    stopCurrentAmbient();
  }
}

/**
 * Stop any currently playing ambient sound
 */
function stopCurrentAmbient() {
  if (currentAmbientAudio) {
    currentAmbientAudio.pause();
    currentAmbientAudio = null;
    currentAmbientSoundId = null;
  }
}

/**
 * Play an ambient sound (typically for page background)
 */
export function playAmbientSound(soundId: string, ambientVolume: number = 0.2, loop: boolean = true): void {
  if (!soundEnabled || !ambientSoundsEnabled) return;
  
  try {
    // Stop any currently playing ambient
    stopCurrentAmbient();
    
    // Find the sound in the motorsport category
    const sound = motorsportSounds.find(s => s.id === soundId);
    if (!sound) {
      console.warn(`Ambient sound not found: ${soundId}`);
      return;
    }
    
    const soundKey = `ambient.${soundId}`;
    let audio: HTMLAudioElement;
    
    // Use cached audio if available
    if (audioCache[soundKey]) {
      audio = audioCache[soundKey];
      audio.currentTime = 0;
    } else {
      // Create and cache new audio
      audio = new Audio(sound.url);
      audioCache[soundKey] = audio;
    }
    
    // Configure ambient sound
    audio.loop = loop;
    audio.volume = ambientVolume * volume; // Apply both ambient volume and user volume
    
    // Play the sound
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(err => {
        console.warn(`Failed to play ambient sound ${soundId}:`, err);
      });
    }
    
    // Track the current ambient
    currentAmbientAudio = audio;
    currentAmbientSoundId = soundId;
  } catch (error) {
    console.error('Error playing ambient sound:', error);
  }
}

/**
 * Preload sound files into cache for instant playback
 */
export function preloadSounds(soundKeys: string[]): void {
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
 * Preload ambient sounds for faster playback
 */
export function preloadAmbientSounds(): void {
  Object.values(backgroundAmbients).forEach(({ soundId }) => {
    const sound = motorsportSounds.find(s => s.id === soundId);
    if (sound && !audioCache[`ambient.${soundId}`]) {
      const audio = new Audio(sound.url);
      audio.load();
      audioCache[`ambient.${soundId}`] = audio;
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
  
  // Type-safe access to sounds object
  const categoryObj = sounds[category as keyof typeof sounds];
  if (!categoryObj) return null;
  
  // Type-safe access to sound within category
  return (categoryObj as Record<string, string>)[soundName] || null;
}

/**
 * Play a sound by its category and name
 */
/**
 * Play a sound effect with the given SoundType
 * @param sound The sound type to play
 * @param volume Volume level between 0.0 and 1.0
 */
export function playSound(sound: SoundType | string, volume: number = 0.7): void {
  if (!soundEnabled) return;
  
  if (typeof sound === 'string' && (sound.includes('.') || sound.includes('/'))) {
    // Handle the original dot-notation method
    try {
      const soundPath = getSoundPathFromKey(sound);
      if (!soundPath) {
        console.warn(`Sound not found: ${sound}`);
        return;
      }
      
      let audio: HTMLAudioElement;
      
      // Use cached audio if available
      if (audioCache[sound]) {
        audio = audioCache[sound];
        // Reset audio to beginning if it's already playing
        audio.currentTime = 0;
      } else {
        // Create and cache new audio
        audio = new Audio(soundPath);
        audioCache[sound] = audio;
      }
      
      // Apply volume setting
      audio.volume = volume;
      
      // Play the sound
      audio.play().catch(err => {
        // Handle common errors like autoplay restrictions
        console.warn(`Failed to play sound ${sound}:`, err);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
    return;
  }

  // Handle SoundType enum case
  // For SoundType, use predefined paths from the old implementation
  const soundPaths: Record<SoundType, string> = {
    ui_click: '/assets/sounds/button-click.mp3',
    ui_hover: '/assets/sounds/hover.mp3',
    ui_toggle: '/assets/sounds/toggle.mp3',
    ui_error: '/assets/sounds/error.mp3',
    ui_success: '/assets/sounds/success.mp3',
    menu_open: '/assets/sounds/menu-open.mp3',
    menu_close: '/assets/sounds/menu-close.mp3',
    notification: '/assets/sounds/notification.mp3',
    ambient_on: '/assets/sounds/ambient-on.mp3',
    ambient_off: '/assets/sounds/ambient-off.mp3',
    ambient_loop: '/assets/sounds/ambient-loop.mp3',
    telemetry_alert: '/assets/sounds/telemetry-alert.mp3',
    achievement: '/assets/sounds/achievement.mp3',
    race_start: '/assets/sounds/race-start.mp3',
    race_flag: '/assets/sounds/race-flag.mp3',
    engine_start: '/assets/sounds/engine-start.mp3'
  };

  try {
    const path = soundPaths[sound as SoundType];
    if (!path) {
      console.warn(`Sound not found: ${sound}`);
      return;
    }
    
    // Use cached audio if available
    if (!audioCache[sound as string]) {
      audioCache[sound as string] = new Audio(path);
    }
    
    const audio = audioCache[sound as string];
    audio.volume = Math.max(0, Math.min(1, volume));
    
    // Reset audio to beginning if already playing
    audio.currentTime = 0;
    
    // Play the sound
    audio.play().catch(err => {
      console.warn(`Failed to play sound ${sound}:`, err);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

/**
 * Play a sequence of sounds with delays
 * @param sounds Array of sounds to play in sequence
 * @param volume Volume level between 0.0 and 1.0
 * @param delayMs Milliseconds to wait between sounds
 */
export function playSoundSequence(
  sounds: SoundType[],
  volume: number = 0.7,
  delayMs: number = 300
): void {
  if (!sounds.length) return;
  
  // Play the first sound immediately
  playSound(sounds[0], volume);
  
  // Play remaining sounds with delays
  let currentIndex = 1;
  if (sounds.length > 1) {
    const interval = setInterval(() => {
      if (currentIndex < sounds.length) {
        playSound(sounds[currentIndex], volume);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delayMs);
  }
}

/**
 * Play a motorsport sound by its ID
 * @param soundId The ID of the motorsport sound to play (from motorsportSounds)
 * @param volumeScale Optional volume scaling factor (0.0-1.0)
 */
export function playMotorsportSound(soundId: string, volumeScale: number = 1.0): void {
  if (!soundEnabled) return;
  
  try {
    // Find the sound in the motorsport category
    const sound = motorsportSounds.find(s => s.id === soundId);
    if (!sound) {
      console.warn(`Motorsport sound not found: ${soundId}`);
      return;
    }
    
    const soundKey = `motorsport.${soundId}`;
    let audio: HTMLAudioElement;
    
    // Use cached audio if available
    if (audioCache[soundKey]) {
      audio = audioCache[soundKey];
      // Reset audio to beginning if it's already playing
      audio.currentTime = 0;
    } else {
      // Create and cache new audio
      audio = new Audio(sound.url);
      audioCache[soundKey] = audio;
    }
    
    // Apply volume setting with optional scaling
    audio.volume = Math.min(1.0, volume * volumeScale);
    
    // Play the sound
    audio.play().catch(err => {
      // Handle common errors like autoplay restrictions
      console.warn(`Failed to play motorsport sound ${soundId}:`, err);
    });
  } catch (error) {
    console.error('Error playing motorsport sound:', error);
  }
}

/**
 * Play a sound for a specific interaction type
 * Uses the interaction sound map to determine which sound to play
 * 
 * @param interactionType The type of interaction (e.g., "button.click")
 * @param volumeScale Optional volume scaling factor (0.0-1.0)
 */
export function playInteractionSound(interactionType: string, volumeScale: number = 1.0): void {
  if (!soundEnabled) return;
  
  try {
    const parts = interactionType.split('.');
    let soundId: string | null = null;
    
    // Navigate the interaction sound map
    let currentMap: any = interactionSoundMap;
    for (const part of parts) {
      if (!currentMap[part]) {
        console.warn(`Unknown interaction type: ${interactionType}`);
        return;
      }
      currentMap = currentMap[part];
      if (typeof currentMap === 'string') {
        soundId = currentMap;
        break;
      }
    }
    
    // If we found a sound ID, play it
    if (soundId) {
      playMotorsportSound(soundId, volumeScale);
    }
  } catch (error) {
    console.error('Error playing interaction sound:', error);
  }
}

/**
 * Enable or disable all sounds
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  
  // If disabling, stop any background ambient
  if (!enabled && currentAmbientAudio) {
    stopCurrentAmbient();
  }
  
  saveSoundPreferences();
}

/**
 * Set the volume level for all sounds (0.0 to 1.0)
 */
export function setVolume(level: number): void {
  volume = Math.max(0, Math.min(1, level));
  
  // Update volume of any playing ambient
  if (currentAmbientAudio && soundEnabled && ambientSoundsEnabled) {
    const ambientId = currentAmbientSoundId || '';
    const ambientData = Object.values(backgroundAmbients).find(data => data.soundId === ambientId);
    if (ambientData) {
      currentAmbientAudio.volume = ambientData.volume * volume;
    }
  }
  
  saveSoundPreferences();
}

/**
 * Enable or disable ambient background sounds
 */
export function setAmbientSoundsEnabled(enabled: boolean): void {
  ambientSoundsEnabled = enabled;
  
  // If enabling, check if we should play a sound for the current page
  if (enabled && soundEnabled && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const ambientData = backgroundAmbients[currentPath];
    if (ambientData) {
      playAmbientSound(ambientData.soundId, ambientData.volume, ambientData.loop);
    }
  }
  
  // If disabling, stop any playing ambient
  if (!enabled && currentAmbientAudio) {
    stopCurrentAmbient();
  }
  
  saveSoundPreferences();
}

/**
 * Save user sound preferences to localStorage
 */
function saveSoundPreferences(): void {
  try {
    localStorage.setItem('paddock20_sound_preferences', JSON.stringify({
      enabled: soundEnabled,
      volume: volume,
      ambientEnabled: ambientSoundsEnabled
    }));
  } catch (error) {
    console.warn('Could not save sound preferences:', error);
  }
}

/**
 * Get current sound settings
 */
export function getSoundSettings(): { 
  enabled: boolean, 
  volume: number,
  ambientEnabled: boolean
} {
  return {
    enabled: soundEnabled,
    volume: volume,
    ambientEnabled: ambientSoundsEnabled
  };
}

/**
 * Clean up audio resources
 */
export function cleanupSoundService(): void {
  // Stop any playing ambient sound
  stopCurrentAmbient();
  
  // Clear all cached audio
  Object.keys(audioCache).forEach(key => {
    const audio = audioCache[key];
    audio.pause();
    audio.src = '';
  });
  
  // Remove route change listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handleRouteChange);
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initSoundService();
}