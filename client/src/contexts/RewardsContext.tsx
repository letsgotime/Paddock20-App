import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

// Define reward types and interfaces
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  achieved: boolean;
  dateAchieved?: string;
  category: 'engagement' | 'maintenance' | 'driving' | 'community' | 'learning' | 'milestone' | 'special';
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  secretAchievement?: boolean;
}

export interface UserStats {
  weatherChecks: number;
  maintenanceLogged: number;
  modificationLogged: number;
  detailingSessionsLogged: number;
  drivesLogged: number;
  photosUploaded: number;
  routesPlanned: number;
  manifestationStationUses: number;
  featuresExplored: Set<string>;
  visitCount: Record<string, number>;
  lastFeatureUse: Record<string, string>; // ISO date strings
  totalSessionTime: number; // in minutes
}

export interface UserRewards {
  totalPoints: number;
  level: number;
  rewards: Reward[];
  streakDays: number;
  lastActive: string;
  stats: UserStats;
  totalLoginDays: number;
  pointsHistory: {date: string, points: number, reason: string}[];
}

interface RewardsContextType {
  userRewards: UserRewards;
  recentReward: Reward | null;
  showRewardNotification: boolean;
  earnPoints: (points: number, reason: string) => void;
  unlockReward: (rewardId: string) => void;
  dismissRewardNotification: () => void;
  checkRewardsEligibility: () => void;
  trackFeatureUsage: (feature: string, count?: number) => void;
  trackPageVisit: (page: string) => void;
  trackFeatureExplored: (feature: string) => void;
  pointsToNextLevel: number;
  levelProgress: number; // 0-100 percentage
  getPendingAchievements: () => Reward[];
  getCompletedAchievements: () => Reward[];
  getAchievementsByCategory: (category: string) => Reward[];
  incrementStat: (stat: keyof UserStats, amount?: number) => void;
  resetStats: () => void;
}

// Define metrics that can trigger achievements
export type RewardTriggerMetric = 
  'weatherChecks' | 
  'maintenanceLogged' | 
  'modificationLogged' |
  'detailingSessionsLogged' |
  'drivesLogged' |
  'photosUploaded' |
  'streakDays' |
  'featuresExplored' |
  'routesPlanned' |
  'manifestationStationUses' |
  'totalLoginDays' |
  'totalPoints';

// A comprehensive reward database with challenging achievements
const availableRewards: Reward[] = [
  // ENGAGEMENT REWARDS
  {
    id: 'login-streak-3',
    title: 'Consistency Cruiser',
    description: 'Log in for 3 consecutive days',
    points: 150,
    icon: '🔄',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'login-streak-7',
    title: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    points: 350,
    icon: '📅',
    achieved: false,
    category: 'engagement',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'login-streak-30',
    title: 'Monthly Motor Master',
    description: 'Log in for 30 consecutive days',
    points: 1500,
    icon: '🔥',
    achieved: false,
    category: 'engagement',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'login-days-100',
    title: 'Century Driver',
    description: 'Log in for a total of 100 days',
    points: 2500,
    icon: '🏆',
    achieved: false,
    category: 'engagement',
    level: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'login-days-365',
    title: 'Year-Round Rider',
    description: 'Log in for a total of 365 days',
    points: 10000,
    icon: '👑',
    achieved: false,
    category: 'engagement',
    level: 'diamond',
    rarity: 'legendary'
  },
  {
    id: 'feature-explorer-5',
    title: 'App Explorer',
    description: 'Visit 5 different sections of the app',
    points: 250,
    icon: '🧭',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'feature-explorer-10',
    title: 'Paddock Pathfinder',
    description: 'Explore 10 different features of Paddock20',
    points: 500,
    icon: '🔍',
    achieved: false,
    category: 'engagement',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'feature-explorer-15',
    title: 'Interface Innovator',
    description: 'Explore 15 different features of Paddock20',
    points: 1000,
    icon: '🌟',
    achieved: false,
    category: 'engagement',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'profile-complete',
    title: 'Identity Established',
    description: 'Complete your driver profile',
    points: 300,
    icon: '🏎️',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Use Paddock20 after midnight',
    points: 200,
    icon: '🦉',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'uncommon',
    secretAchievement: true
  },
  
  // WEATHER REWARDS
  {
    id: 'weather-check-10',
    title: 'Weather Watcher',
    description: 'Check the weather 10 times',
    points: 150,
    icon: '🌤️',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'weather-check-50',
    title: 'Forecast Fanatic',
    description: 'Check the weather 50 times',
    points: 400,
    icon: '☁️',
    achieved: false,
    category: 'engagement',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'weather-check-100',
    title: 'Meteorology Maven',
    description: 'Check the weather 100 times',
    points: 800,
    icon: '⛈️',
    achieved: false,
    category: 'engagement',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'weather-check-500',
    title: 'Weather Wizard',
    description: 'Check the weather 500 times',
    points: 2500,
    icon: '🌪️',
    achieved: false,
    category: 'engagement',
    level: 'platinum',
    rarity: 'epic'
  },
  
  // MAINTENANCE REWARDS
  {
    id: 'first-maintenance',
    title: 'Maintenance Starter',
    description: 'Log your first maintenance record',
    points: 200,
    icon: '🔧',
    achieved: false,
    category: 'maintenance',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'maintenance-streak-3',
    title: 'Maintenance Streak',
    description: 'Log maintenance 3 days in a row',
    points: 500,
    icon: '🔧',
    achieved: false,
    category: 'maintenance',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'maintenance-logged-10',
    title: 'Maintenance Maven',
    description: 'Log 10 maintenance records',
    points: 750,
    icon: '🧰',
    achieved: false,
    category: 'maintenance',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'maintenance-logged-50',
    title: 'Master Mechanic',
    description: 'Log 50 maintenance records',
    points: 1500,
    icon: '⚙️',
    achieved: false,
    category: 'maintenance',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'maintenance-logged-100',
    title: 'Engineering Excellence',
    description: 'Log 100 maintenance records',
    points: 3000,
    icon: '🏭',
    achieved: false,
    category: 'maintenance',
    level: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'first-gloss-log',
    title: 'Shine Starter',
    description: 'Log your first detailing session',
    points: 200,
    icon: '✨',
    achieved: false,
    category: 'maintenance',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'gloss-log-10',
    title: 'Gloss Guardian',
    description: 'Log 10 detailing sessions',
    points: 750,
    icon: '💎',
    achieved: false,
    category: 'maintenance',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'gloss-log-50',
    title: 'Detailing Dynasty',
    description: 'Log 50 detailing sessions',
    points: 1750,
    icon: '🔆',
    achieved: false,
    category: 'maintenance',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'first-mod',
    title: 'Modification Starter',
    description: 'Log your first vehicle modification',
    points: 250,
    icon: '🛠️',
    achieved: false,
    category: 'maintenance',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'mod-log-10',
    title: 'Mod Master',
    description: 'Log 10 vehicle modifications',
    points: 800,
    icon: '⚡',
    achieved: false,
    category: 'maintenance',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'mod-log-30',
    title: 'Customization King',
    description: 'Log 30 vehicle modifications',
    points: 2000,
    icon: '🏁',
    achieved: false,
    category: 'maintenance',
    level: 'gold',
    rarity: 'rare'
  },
  
  // DRIVING REWARDS
  {
    id: 'first-drive-log',
    title: 'Journey Starter',
    description: 'Log your first drive',
    points: 200,
    icon: '📝',
    achieved: false,
    category: 'driving',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'drive-log-10',
    title: 'Road Chronicler',
    description: 'Log 10 drives',
    points: 650,
    icon: '📔',
    achieved: false,
    category: 'driving',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'drive-log-50',
    title: 'Journey Journalist',
    description: 'Log 50 drives',
    points: 1500,
    icon: '📚',
    achieved: false,
    category: 'driving',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'drive-log-100',
    title: 'Travel Testament',
    description: 'Log 100 drives',
    points: 3000,
    icon: '🗺️',
    achieved: false,
    category: 'driving',
    level: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'first-route-plan',
    title: 'Route Planner',
    description: 'Plan your first fun drive route',
    points: 250,
    icon: '🧭',
    achieved: false,
    category: 'driving',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'route-plan-10',
    title: 'Navigation Virtuoso',
    description: 'Plan 10 fun drive routes',
    points: 750,
    icon: '🗾',
    achieved: false,
    category: 'driving',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'route-plan-30',
    title: 'Road Cartographer',
    description: 'Plan 30 fun drive routes',
    points: 1800,
    icon: '🧠',
    achieved: false,
    category: 'driving',
    level: 'gold',
    rarity: 'rare'
  },
  
  // GALLERY & MEDIA
  {
    id: 'first-gallery-upload',
    title: 'Visual Starter',
    description: 'Upload your first photo to the gallery',
    points: 175,
    icon: '📸',
    achieved: false,
    category: 'engagement',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'gallery-upload-10',
    title: 'Visual Virtuoso',
    description: 'Upload 10 photos to your gallery',
    points: 600,
    icon: '📷',
    achieved: false,
    category: 'engagement',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'gallery-upload-50',
    title: 'Photography Pro',
    description: 'Upload 50 photos to your gallery',
    points: 1500,
    icon: '📹',
    achieved: false,
    category: 'engagement',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'gallery-upload-100',
    title: 'Media Maestro',
    description: 'Upload 100 photos to your gallery',
    points: 3000,
    icon: '🎞️',
    achieved: false,
    category: 'engagement',
    level: 'platinum',
    rarity: 'epic'
  },
  
  // MANIFESTATION STATION
  {
    id: 'first-manifestation',
    title: 'Manifestation Starter',
    description: 'Set your first goal in Manifestation Station',
    points: 250,
    icon: '🎯',
    achieved: false,
    category: 'learning',
    level: 'bronze',
    rarity: 'common'
  },
  {
    id: 'manifestation-5',
    title: 'Vision Voyager',
    description: 'Set 5 goals in Manifestation Station',
    points: 700,
    icon: '🔮',
    achieved: false,
    category: 'learning',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'manifestation-20',
    title: 'Dream Developer',
    description: 'Set 20 goals in Manifestation Station',
    points: 1800,
    icon: '✨',
    achieved: false,
    category: 'learning',
    level: 'gold',
    rarity: 'rare'
  },
  
  // MILESTONE ACHIEVEMENTS
  {
    id: 'bronze-collection',
    title: 'Bronze Collector',
    description: 'Earn 5 bronze-level achievements',
    points: 1000,
    icon: '🥉',
    achieved: false,
    category: 'milestone',
    level: 'silver',
    rarity: 'uncommon'
  },
  {
    id: 'silver-collection',
    title: 'Silver Collector',
    description: 'Earn 5 silver-level achievements',
    points: 2000,
    icon: '🥈',
    achieved: false,
    category: 'milestone',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'gold-collection',
    title: 'Gold Collector',
    description: 'Earn 5 gold-level achievements',
    points: 5000,
    icon: '🥇',
    achieved: false,
    category: 'milestone',
    level: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'achievement-hunter',
    title: 'Achievement Hunter',
    description: 'Earn 20 different achievements',
    points: 3000,
    icon: '🏵️',
    achieved: false,
    category: 'milestone',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'achievement-master',
    title: 'Achievement Master',
    description: 'Earn 50 different achievements',
    points: 10000,
    icon: '👑',
    achieved: false,
    category: 'milestone',
    level: 'diamond',
    rarity: 'legendary'
  },
  {
    id: 'points-milestone-5000',
    title: 'Points Prodigy',
    description: 'Accumulate 5,000 total points',
    points: 1000,
    icon: '💯',
    achieved: false,
    category: 'milestone',
    level: 'gold',
    rarity: 'rare'
  },
  {
    id: 'points-milestone-25000',
    title: 'Points Master',
    description: 'Accumulate 25,000 total points',
    points: 5000,
    icon: '🌠',
    achieved: false,
    category: 'milestone',
    level: 'platinum',
    rarity: 'epic'
  },
  {
    id: 'points-milestone-100000',
    title: 'Points Legend',
    description: 'Accumulate 100,000 total points',
    points: 15000,
    icon: '⭐',
    achieved: false,
    category: 'milestone',
    level: 'diamond',
    rarity: 'legendary'
  },
  
  // SECRET ACHIEVEMENTS
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Use Paddock20 before 6:00 AM',
    points: 300,
    icon: '🐦',
    achieved: false,
    category: 'special',
    level: 'bronze',
    rarity: 'uncommon',
    secretAchievement: true
  },
  {
    id: 'paddock-explorer',
    title: 'Paddock Explorer',
    description: 'Visit every section of the app in one session',
    points: 500,
    icon: '🔭',
    achieved: false,
    category: 'special',
    level: 'silver',
    rarity: 'rare',
    secretAchievement: true
  },
  {
    id: 'feature-ninja',
    title: 'Feature Ninja',
    description: 'Use all features without viewing the help documentation',
    points: 1000,
    icon: '🥷',
    achieved: false,
    category: 'special',
    level: 'gold',
    rarity: 'epic',
    secretAchievement: true
  },
  {
    id: 'perfect-streak-30',
    title: 'Perfect Tactician',
    description: 'Earn points every single day for 30 days straight',
    points: 5000,
    icon: '🧿',
    achieved: false,
    category: 'special',
    level: 'platinum',
    rarity: 'legendary',
    secretAchievement: true
  }
];

// Define the metric thresholds for automatic rewards
const metricThresholds: Record<RewardTriggerMetric, {rewardId: string, threshold: number}[]> = {
  'weatherChecks': [
    { rewardId: 'weather-check-10', threshold: 25 },
    { rewardId: 'weather-check-50', threshold: 100 },
    { rewardId: 'weather-check-100', threshold: 250 },
    { rewardId: 'weather-check-500', threshold: 1000 }
  ],
  'maintenanceLogged': [
    { rewardId: 'first-maintenance', threshold: 1 },
    { rewardId: 'maintenance-logged-10', threshold: 25 },
    { rewardId: 'maintenance-logged-50', threshold: 100 },
    { rewardId: 'maintenance-logged-100', threshold: 250 }
  ],
  'modificationLogged': [
    { rewardId: 'first-mod', threshold: 1 },
    { rewardId: 'mod-log-10', threshold: 10 },
    { rewardId: 'mod-log-30', threshold: 30 }
  ],
  'detailingSessionsLogged': [
    { rewardId: 'first-gloss-log', threshold: 1 },
    { rewardId: 'gloss-log-10', threshold: 10 },
    { rewardId: 'gloss-log-50', threshold: 50 }
  ],
  'drivesLogged': [
    { rewardId: 'first-drive-log', threshold: 1 },
    { rewardId: 'drive-log-10', threshold: 10 },
    { rewardId: 'drive-log-50', threshold: 50 },
    { rewardId: 'drive-log-100', threshold: 100 }
  ],
  'photosUploaded': [
    { rewardId: 'first-gallery-upload', threshold: 1 },
    { rewardId: 'gallery-upload-10', threshold: 10 },
    { rewardId: 'gallery-upload-50', threshold: 50 },
    { rewardId: 'gallery-upload-100', threshold: 100 }
  ],
  'streakDays': [
    { rewardId: 'login-streak-3', threshold: 3 },
    { rewardId: 'login-streak-7', threshold: 7 },
    { rewardId: 'login-streak-30', threshold: 30 }
  ],
  'featuresExplored': [
    { rewardId: 'feature-explorer-5', threshold: 5 },
    { rewardId: 'feature-explorer-10', threshold: 10 },
    { rewardId: 'feature-explorer-15', threshold: 15 }
  ],
  'routesPlanned': [
    { rewardId: 'first-route-plan', threshold: 1 },
    { rewardId: 'route-plan-10', threshold: 10 },
    { rewardId: 'route-plan-30', threshold: 30 }
  ],
  'manifestationStationUses': [
    { rewardId: 'first-manifestation', threshold: 1 },
    { rewardId: 'manifestation-5', threshold: 5 },
    { rewardId: 'manifestation-20', threshold: 20 }
  ],
  'totalLoginDays': [
    { rewardId: 'login-days-100', threshold: 100 },
    { rewardId: 'login-days-365', threshold: 365 }
  ],
  'totalPoints': [
    { rewardId: 'points-milestone-5000', threshold: 5000 },
    { rewardId: 'points-milestone-25000', threshold: 25000 },
    { rewardId: 'points-milestone-100000', threshold: 100000 }
  ]
};

// Initial state for user stats
const initialUserStats: UserStats = {
  weatherChecks: 0,
  maintenanceLogged: 0,
  modificationLogged: 0,
  detailingSessionsLogged: 0,
  drivesLogged: 0,
  photosUploaded: 0,
  routesPlanned: 0,
  manifestationStationUses: 0,
  featuresExplored: new Set<string>(),
  visitCount: {},
  lastFeatureUse: {},
  totalSessionTime: 0
};

// Initial state for user rewards
const initialUserRewards: UserRewards = {
  totalPoints: 0,
  level: 1,
  rewards: [],
  streakDays: 0,
  lastActive: new Date().toISOString(),
  stats: initialUserStats,
  totalLoginDays: 1,
  pointsHistory: []
};

// Points required for each level - more challenging progression
const levelThresholds = [
  0,       // Level 1
  500,     // Level 2
  1500,    // Level 3
  3000,    // Level 4
  6000,    // Level 5
  10000,   // Level 6
  15000,   // Level 7
  25000,   // Level 8
  40000,   // Level 9
  60000,   // Level 10
  85000,   // Level 11
  115000,  // Level 12
  150000,  // Level 13
  200000,  // Level 14
  250000   // Level 15
];

// Create the rewards context
export const RewardsContext = createContext<RewardsContextType | null>(null);

export const RewardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for user rewards
  const [userRewards, setUserRewards] = useState<UserRewards>(() => {
    // Load from localStorage if available
    const savedRewards = localStorage.getItem('paddock20_userRewards');
    if (savedRewards) {
      try {
        const parsed = JSON.parse(savedRewards);
        // Ensure stats object has all required properties
        if (!parsed.stats) {
          parsed.stats = initialUserStats;
        } else {
          // Convert featuresExplored back to a Set
          if (parsed.stats.featuresExplored && Array.isArray(parsed.stats.featuresExplored)) {
            parsed.stats.featuresExplored = new Set(parsed.stats.featuresExplored);
          } else {
            parsed.stats.featuresExplored = new Set<string>();
          }
          
          // Ensure all stats properties exist
          Object.keys(initialUserStats).forEach(key => {
            if (parsed.stats[key] === undefined) {
              parsed.stats[key] = initialUserStats[key as keyof UserStats];
            }
          });
        }
        
        // Ensure pointsHistory exists
        if (!parsed.pointsHistory) {
          parsed.pointsHistory = [];
        }
        
        // Ensure totalLoginDays exists
        if (!parsed.totalLoginDays) {
          parsed.totalLoginDays = 1;
        }
        
        return parsed;
      } catch (e) {
        console.error("Error parsing saved rewards:", e);
        return initialUserRewards;
      }
    }
    return initialUserRewards;
  });
  
  // Track the most recently earned reward for notifications
  const [recentReward, setRecentReward] = useState<Reward | null>(null);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [location] = useLocation();
  
  // Calculate points needed for next level
  const currentLevel = userRewards.level;
  const nextLevelThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const prevLevelThreshold = levelThresholds[currentLevel - 1] || 0;
  const pointsToNextLevel = nextLevelThreshold - userRewards.totalPoints;
  
  // Calculate progress as percentage
  const levelRange = nextLevelThreshold - prevLevelThreshold;
  const pointsInCurrentLevel = userRewards.totalPoints - prevLevelThreshold;
  const levelProgress = Math.min(Math.floor((pointsInCurrentLevel / levelRange) * 100), 100);
  
  // Save rewards to localStorage when they change
  useEffect(() => {
    // Convert Set to array for storage
    const statsForStorage = {
      ...userRewards.stats,
      featuresExplored: Array.from(userRewards.stats.featuresExplored)
    };
    
    const rewardsForStorage = {
      ...userRewards,
      stats: statsForStorage
    };
    
    localStorage.setItem('paddock20_userRewards', JSON.stringify(rewardsForStorage));
  }, [userRewards]);
  
  // Login tracking
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userRewards.lastActive.split('T')[0];
    
    // If it's a new day
    if (today !== lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if last active was yesterday (continuing a streak)
      if (lastActive === yesterdayStr) {
        const newStreakDays = userRewards.streakDays + 1;
        
        setUserRewards(prev => ({
          ...prev,
          streakDays: newStreakDays,
          totalLoginDays: prev.totalLoginDays + 1,
          lastActive: today
        }));
        
        // Check streak rewards
        checkMetricAchievements('streakDays', newStreakDays);
        checkMetricAchievements('totalLoginDays', userRewards.totalLoginDays + 1);
      } else {
        // Streak broken
        setUserRewards(prev => ({
          ...prev,
          streakDays: 1, // Reset to 1 for today
          totalLoginDays: prev.totalLoginDays + 1,
          lastActive: today
        }));
        
        // Check login days achievements
        checkMetricAchievements('totalLoginDays', userRewards.totalLoginDays + 1);
      }
      
      // Check time-based secret achievements
      const hour = new Date().getHours();
      if (hour < 6 && !userRewards.rewards.some(r => r.id === 'early-bird')) {
        unlockReward('early-bird');
      } else if (hour >= 0 && hour < 5 && !userRewards.rewards.some(r => r.id === 'night-owl')) {
        unlockReward('night-owl');
      }
    }
  }, []);
  
  // Track page visit for rewards and stats
  const trackPageVisit = (page: string) => {
    // Update visit count for this page
    setUserRewards(prev => {
      const updatedVisitCount = { ...prev.stats.visitCount };
      updatedVisitCount[page] = (updatedVisitCount[page] || 0) + 1;
      
      return {
        ...prev,
        stats: {
          ...prev.stats,
          visitCount: updatedVisitCount
        }
      };
    });
    
    // Track as a feature exploration
    trackFeatureExplored(page);
  };
  
  // Track feature exploration
  const trackFeatureExplored = (feature: string) => {
    setUserRewards(prev => {
      // Skip if already explored
      if (prev.stats.featuresExplored.has(feature)) {
        return prev;
      }
      
      // Add to explored features
      const updatedFeatures = new Set(prev.stats.featuresExplored);
      updatedFeatures.add(feature);
      
      // Check for feature explorer achievements
      const shouldCheckAchievements = updatedFeatures.size !== prev.stats.featuresExplored.size;
      
      const updatedRewards = {
        ...prev,
        stats: {
          ...prev.stats,
          featuresExplored: updatedFeatures
        }
      };
      
      // Check for achievements
      if (shouldCheckAchievements) {
        setTimeout(() => checkMetricAchievements('featuresExplored', updatedFeatures.size), 0);
        
        // Check for secret achievement - visited all sections
        const allSections = [
          '/', 
          '/garage-vault', 
          '/manifestation-station',
          '/new-weather-center',
          '/route-planner',
          '/drive-journal',
          '/juicebox',
          '/settings',
          '/dashboard'
        ];
        
        // Check if user has visited all sections
        const hasVisitedAll = allSections.every(section => updatedFeatures.has(section));
        if (hasVisitedAll && !prev.rewards.some(r => r.id === 'paddock-explorer')) {
          setTimeout(() => unlockReward('paddock-explorer'), 100);
        }
      }
      
      return updatedRewards;
    });
  };
  
  // Track feature usage
  const trackFeatureUsage = (feature: string, count: number = 1) => {
    // Update feature usage stats
    setUserRewards(prev => {
      // Determine which stat to increment based on feature
      let updatedStats = { ...prev.stats };
      
      switch (feature) {
        case 'weather':
          updatedStats.weatherChecks += count;
          break;
        case 'maintenance':
          updatedStats.maintenanceLogged += count;
          break;
        case 'modification':
          updatedStats.modificationLogged += count;
          break;
        case 'detailing':
          updatedStats.detailingSessionsLogged += count;
          break;
        case 'drive':
          updatedStats.drivesLogged += count;
          break;
        case 'photo':
          updatedStats.photosUploaded += count;
          break;
        case 'route':
          updatedStats.routesPlanned += count;
          break;
        case 'manifestation':
          updatedStats.manifestationStationUses += count;
          break;
      }
      
      // Update last use time
      updatedStats.lastFeatureUse = {
        ...updatedStats.lastFeatureUse,
        [feature]: new Date().toISOString()
      };
      
      const updatedRewards = {
        ...prev,
        stats: updatedStats
      };
      
      // Check for achievements
      setTimeout(() => {
        switch (feature) {
          case 'weather':
            checkMetricAchievements('weatherChecks', updatedStats.weatherChecks);
            break;
          case 'maintenance':
            checkMetricAchievements('maintenanceLogged', updatedStats.maintenanceLogged);
            break;
          case 'modification':
            checkMetricAchievements('modificationLogged', updatedStats.modificationLogged);
            break;
          case 'detailing':
            checkMetricAchievements('detailingSessionsLogged', updatedStats.detailingSessionsLogged);
            break;
          case 'drive':
            checkMetricAchievements('drivesLogged', updatedStats.drivesLogged);
            break;
          case 'photo':
            checkMetricAchievements('photosUploaded', updatedStats.photosUploaded);
            break;
          case 'route':
            checkMetricAchievements('routesPlanned', updatedStats.routesPlanned);
            break;
          case 'manifestation':
            checkMetricAchievements('manifestationStationUses', updatedStats.manifestationStationUses);
            break;
        }
      }, 0);
      
      return updatedRewards;
    });
  };
  
  // Directly increment a specific stat
  const incrementStat = (stat: keyof UserStats, amount: number = 1) => {
    if (typeof userRewards.stats[stat] === 'number') {
      setUserRewards(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [stat]: (prev.stats[stat] as number) + amount
        }
      }));
      
      // Check for achievements based on this stat
      if (metricThresholds[stat as RewardTriggerMetric]) {
        const newValue = (userRewards.stats[stat] as number) + amount;
        checkMetricAchievements(stat as RewardTriggerMetric, newValue);
      }
    }
  };
  
  // Reset all stats (for testing/development)
  const resetStats = () => {
    setUserRewards({
      ...initialUserRewards,
      lastActive: new Date().toISOString()
    });
  };
  
  // Check achievements for a specific metric
  const checkMetricAchievements = (metric: RewardTriggerMetric, currentValue: number) => {
    if (!metricThresholds[metric]) return;
    
    // Look for threshold achievements that the user qualifies for
    metricThresholds[metric].forEach(({ rewardId, threshold }) => {
      if (currentValue >= threshold && !userRewards.rewards.some(r => r.id === rewardId)) {
        unlockReward(rewardId);
      }
    });
    
    // Special case for collections (meta-achievements)
    if (metric === 'streakDays' || metric === 'maintenanceLogged') {
      checkCollectionAchievements();
    }
  };
  
  // Check for collection achievements (bronze collector, silver collector, etc.)
  const checkCollectionAchievements = () => {
    // Count achievements by level
    const bronzeCount = userRewards.rewards.filter(r => r.level === 'bronze').length;
    const silverCount = userRewards.rewards.filter(r => r.level === 'silver').length;
    const goldCount = userRewards.rewards.filter(r => r.level === 'gold').length;
    
    // Check for collection achievements
    if (bronzeCount >= 5 && !userRewards.rewards.some(r => r.id === 'bronze-collection')) {
      unlockReward('bronze-collection');
    }
    
    if (silverCount >= 5 && !userRewards.rewards.some(r => r.id === 'silver-collection')) {
      unlockReward('silver-collection');
    }
    
    if (goldCount >= 5 && !userRewards.rewards.some(r => r.id === 'gold-collection')) {
      unlockReward('gold-collection');
    }
    
    // Check for achievement hunter/master
    const totalCount = userRewards.rewards.length;
    if (totalCount >= 20 && !userRewards.rewards.some(r => r.id === 'achievement-hunter')) {
      unlockReward('achievement-hunter');
    }
    
    if (totalCount >= 50 && !userRewards.rewards.some(r => r.id === 'achievement-master')) {
      unlockReward('achievement-master');
    }
  };
  
  // Check if the user is eligible for any rewards
  const checkRewardsEligibility = () => {
    // Check all metrics against current values
    Object.entries(metricThresholds).forEach(([metric, thresholds]) => {
      // Get current value for this metric
      let currentValue: number;
      const metricKey = metric as RewardTriggerMetric;
      
      switch (metricKey) {
        case 'featuresExplored':
          currentValue = userRewards.stats.featuresExplored.size;
          break;
        case 'totalPoints':
          currentValue = userRewards.totalPoints;
          break;
        case 'streakDays':
          currentValue = userRewards.streakDays;
          break;
        case 'totalLoginDays':
          currentValue = userRewards.totalLoginDays;
          break;
        default:
          // @ts-ignore - we know these are numeric properties
          currentValue = userRewards.stats[metricKey] || 0;
      }
      
      checkMetricAchievements(metricKey, currentValue);
    });
    
    // Check collection achievements
    checkCollectionAchievements();
  };
  
  // Add points to the user's total
  const earnPoints = (points: number, reason: string) => {
    setUserRewards(prev => {
      const newTotal = prev.totalPoints + points;
      
      // Record points in history
      const pointHistoryEntry = {
        date: new Date().toISOString(),
        points,
        reason
      };
      
      // Check if we've reached a new level
      let newLevel = prev.level;
      while (newLevel < levelThresholds.length && newTotal >= levelThresholds[newLevel]) {
        newLevel++;
      }
      
      // If level increased, show a notification
      if (newLevel > prev.level) {
        setRecentReward({
          id: `level-up-${newLevel}`,
          title: `Level ${newLevel} Achieved!`,
          description: `You've reached Driver Level ${newLevel}`,
          points: 0, // No points for level-up itself
          icon: '🏅',
          achieved: true,
          dateAchieved: new Date().toISOString(),
          category: 'milestone',
          level: 'gold',
          rarity: 'rare'
        });
        setShowRewardNotification(true);
      }
      
      const updatedRewards = {
        ...prev,
        totalPoints: newTotal,
        level: newLevel,
        pointsHistory: [...prev.pointsHistory, pointHistoryEntry]
      };
      
      // Check for points milestones
      setTimeout(() => checkMetricAchievements('totalPoints', newTotal), 0);
      
      return updatedRewards;
    });
  };
  
  // Unlock a specific reward
  const unlockReward = (rewardId: string) => {
    // Find the reward
    const reward = availableRewards.find(r => r.id === rewardId);
    if (!reward || userRewards.rewards.some(r => r.id === rewardId)) {
      return; // Reward doesn't exist or is already unlocked
    }
    
    // Mark as achieved
    const achievedReward = {
      ...reward,
      achieved: true,
      dateAchieved: new Date().toISOString()
    };
    
    // Add to user rewards and award points
    setUserRewards(prev => {
      // Record points in history too
      const pointHistoryEntry = {
        date: new Date().toISOString(),
        points: achievedReward.points,
        reason: `Achievement: ${achievedReward.title}`
      };
      
      return {
        ...prev,
        rewards: [...prev.rewards, achievedReward],
        totalPoints: prev.totalPoints + achievedReward.points,
        pointsHistory: [...prev.pointsHistory, pointHistoryEntry]
      };
    });
    
    // Set as recent reward for notification
    setRecentReward(achievedReward);
    setShowRewardNotification(true);
  };
  
  // Get pending achievements (useful for recommendations)
  const getPendingAchievements = () => {
    const earnedRewardIds = new Set(userRewards.rewards.map(r => r.id));
    return availableRewards.filter(reward => 
      !earnedRewardIds.has(reward.id) && !reward.secretAchievement
    );
  };
  
  // Get all completed achievements
  const getCompletedAchievements = () => {
    return userRewards.rewards;
  };
  
  // Get achievements by category
  const getAchievementsByCategory = (category: string) => {
    return userRewards.rewards.filter(r => r.category === category);
  };
  
  // Dismiss the reward notification
  const dismissRewardNotification = () => {
    setShowRewardNotification(false);
    setRecentReward(null);
  };
  
  return (
    <RewardsContext.Provider
      value={{
        userRewards,
        recentReward,
        showRewardNotification,
        earnPoints,
        unlockReward,
        dismissRewardNotification,
        checkRewardsEligibility,
        trackFeatureUsage,
        trackPageVisit,
        trackFeatureExplored,
        pointsToNextLevel,
        levelProgress,
        getPendingAchievements,
        getCompletedAchievements,
        getAchievementsByCategory,
        incrementStat,
        resetStats
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
};

// Custom hook to use the rewards context
export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};