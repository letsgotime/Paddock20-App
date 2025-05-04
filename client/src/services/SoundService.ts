/**
 * Sound Service for Paddock20
 * Provides F1-inspired sound effects for the application
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

// Sound mapping to file paths
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

// Cache for audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

/**
 * Play a sound effect
 * @param sound The sound identifier to play
 * @param volume Volume level between 0.0 and 1.0
 */
export function playSound(sound: SoundType, volume: number = 0.7): void {
  try {
    const path = soundPaths[sound];
    if (!path) {
      console.warn(`Sound not found: ${sound}`);
      return;
    }
    
    // Use cached audio if available
    if (!audioCache[sound]) {
      audioCache[sound] = new Audio(path);
    }
    
    const audio = audioCache[sound];
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
 * Clean up audio resources
 */
export function cleanup(): void {
  Object.keys(audioCache).forEach(key => {
    const audio = audioCache[key];
    audio.pause();
    audio.src = '';
    delete audioCache[key];
  });
}