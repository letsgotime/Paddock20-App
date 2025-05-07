/**
 * Mood and energy tracking data
 */
export interface MoodEnergy {
  id: string;
  userId: string;
  timestamp: string;
  date: string;
  
  // Basic metrics (1-10 scale)
  mood: number;
  energy: number;
  focus?: number;
  motivation?: number;
  stress?: number;
  
  // Context
  context?: 'pre_drive' | 'post_drive' | 'morning' | 'evening' | 'pre_event' | 'post_event' | 'custom';
  customContext?: string;
  vehicleId?: string;
  driveLogId?: string;
  eventId?: string;
  
  // Additional data
  notes?: string;
  weatherConditions?: string;
  location?: string;
  tags?: string[];
  
  // Connected data
  sleep?: {
    hours: number;
    quality: number; // 1-10
  };
  nutrition?: {
    quality: number; // 1-10
    hydration: number; // 1-10
    caffeine: boolean;
  };
  exercise?: {
    completed: boolean;
    intensity: number; // 1-10
    duration: number; // minutes
  };
  
  // Performance impact assessment
  perceivedPerformanceImpact?: number; // -5 to +5 scale
  drivingAbilityImpact?: number; // -5 to +5 scale
  confidenceLevel?: number; // 1-10 scale
  
  // Visualization 
  color?: string; // Color representing this mood/energy state
  emoji?: string; // Emoji representing this mood/energy state
}