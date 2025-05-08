/**
 * Motorsport Sound Effects Library for Paddock20
 */

export interface SoundEffect {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  duration: string; // in format "0:00"
}

export const motorsportSounds: SoundEffect[] = [
  // F1 and Racing Sounds
  {
    id: 'f1_flyby',
    name: 'F1 Car Flyby',
    category: 'racing',
    description: 'High-pitched F1 car passing at full speed',
    url: 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3',
    duration: '0:02'
  },
  {
    id: 'engine_revving',
    name: 'Engine Revving',
    category: 'racing',
    description: 'Racing engine revving at high RPM',
    url: 'https://assets.mixkit.co/active_storage/sfx/2104/2104-preview.mp3',
    duration: '0:03'
  },
  {
    id: 'tire_screech',
    name: 'Tire Screech',
    category: 'racing',
    description: 'Performance tires screeching on asphalt',
    url: 'https://assets.mixkit.co/active_storage/sfx/698/698-preview.mp3',
    duration: '0:01'
  },
  {
    id: 'gear_shift',
    name: 'Quick Gear Shift',
    category: 'racing',
    description: 'Performance transmission quick-shift',
    url: 'https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3',
    duration: '0:01'
  },
  
  // UI Interaction Sounds
  {
    id: 'radio_beep',
    name: 'Paddock Radio Beep',
    category: 'interface',
    description: 'Radio communication beep from pit wall',
    url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    duration: '0:01'
  },
  {
    id: 'button_press',
    name: 'Carbon Fiber Button',
    category: 'interface',
    description: 'Carbon fiber steering wheel button press',
    url: 'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3',
    duration: '0:01'
  },
  {
    id: 'toggle_switch',
    name: 'Pit Wall Toggle',
    category: 'interface',
    description: 'Tactile toggle switch from pit wall console',
    url: 'https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3',
    duration: '0:01'
  },
  {
    id: 'menu_select',
    name: 'Telemetry Select',
    category: 'interface',
    description: 'Selection sound for telemetry interface',
    url: 'https://assets.mixkit.co/active_storage/sfx/1705/1705-preview.mp3',
    duration: '0:01'
  },
  
  // Notifications and Alerts
  {
    id: 'start_chime',
    name: 'Start-up Chime',
    category: 'notifications',
    description: 'Premium vehicle start-up notification',
    url: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3',
    duration: '0:02'
  },
  {
    id: 'alert_tone',
    name: 'Telemetry Alert',
    category: 'notifications',
    description: 'Important telemetry data notification',
    url: 'https://assets.mixkit.co/active_storage/sfx/1630/1630-preview.mp3',
    duration: '0:01'
  },
  {
    id: 'success_tone',
    name: 'Perfect Lap Tone',
    category: 'notifications',
    description: 'Successful completion/achievement sound',
    url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    duration: '0:02'
  },
  {
    id: 'warning_beep',
    name: 'Warning Beep',
    category: 'notifications',
    description: 'Critical system warning sound',
    url: 'https://assets.mixkit.co/active_storage/sfx/2197/2197-preview.mp3',
    duration: '0:01'
  },
  
  // Ambient and Environmental
  {
    id: 'paddock_ambient',
    name: 'Paddock Ambient',
    category: 'ambient',
    description: 'Background paddock/garage ambient noise',
    url: 'https://assets.mixkit.co/active_storage/sfx/2426/2426-preview.mp3',
    duration: '0:03'
  },
  {
    id: 'pit_stop',
    name: 'Quick Pit Stop',
    category: 'ambient',
    description: 'Quick pit stop tools and movements',
    url: 'https://assets.mixkit.co/active_storage/sfx/2729/2729-preview.mp3',
    duration: '0:02'
  },
  {
    id: 'car_door',
    name: 'Carbon Door Close',
    category: 'ambient',
    description: 'Premium car door closing',
    url: 'https://assets.mixkit.co/active_storage/sfx/2688/2688-preview.mp3', 
    duration: '0:01'
  }
];

// Categorized sounds for easy access
export const soundsByCategory = {
  racing: motorsportSounds.filter(sound => sound.category === 'racing'),
  interface: motorsportSounds.filter(sound => sound.category === 'interface'),
  notifications: motorsportSounds.filter(sound => sound.category === 'notifications'),
  ambient: motorsportSounds.filter(sound => sound.category === 'ambient'),
};

// Sound mappings to application events
export const soundMappings = {
  // UI interactions
  buttonClick: 'radio_beep',
  toggleSwitch: 'toggle_switch',
  menuSelect: 'menu_select',
  
  // Notifications
  success: 'success_tone',
  warning: 'warning_beep',
  alert: 'alert_tone',
  
  // Navigation
  navigationChange: 'button_press',
  
  // App states
  appStart: 'start_chime',
  telemetryUpdate: 'radio_beep',
  
  // Vehicle interactions
  vehicleSelect: 'car_door',
  performanceMode: 'engine_revving',
  drivingMode: 'gear_shift'
};