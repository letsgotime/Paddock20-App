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
  category: 'engagement' | 'maintenance' | 'driving' | 'community' | 'learning';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserRewards {
  totalPoints: number;
  level: number;
  rewards: Reward[];
  streakDays: number;
  lastActive: string;
}

interface RewardsContextType {
  userRewards: UserRewards;
  recentReward: Reward | null;
  showRewardNotification: boolean;
  earnPoints: (points: number, reason: string) => void;
  unlockReward: (rewardId: string) => void;
  dismissRewardNotification: () => void;
  checkRewardsEligibility: () => void;
  pointsToNextLevel: number;
  levelProgress: number; // 0-100 percentage
}

// Sample rewards data - this would typically come from a database
const availableRewards: Reward[] = [
  {
    id: 'login-streak-3',
    title: 'Consistency Cruiser',
    description: 'Log in for 3 consecutive days',
    points: 50,
    icon: '🏆',
    achieved: false,
    category: 'engagement',
    level: 'bronze'
  },
  {
    id: 'first-maintenance',
    title: 'Maintenance Maestro',
    description: 'Log your first maintenance record',
    points: 75,
    icon: '🔧',
    achieved: false,
    category: 'maintenance',
    level: 'bronze'
  },
  {
    id: 'weather-check-10',
    title: 'Weather Watcher',
    description: 'Check the weather 10 times',
    points: 40,
    icon: '🌤️',
    achieved: false,
    category: 'engagement',
    level: 'bronze'
  },
  {
    id: 'first-gloss-log',
    title: 'Shine Champion',
    description: 'Log your first detailing session',
    points: 60,
    icon: '✨',
    achieved: false,
    category: 'maintenance',
    level: 'bronze'
  },
  {
    id: 'profile-complete',
    title: 'Identity Master',
    description: 'Complete your driver profile',
    points: 100,
    icon: '🏎️',
    achieved: false,
    category: 'engagement',
    level: 'silver'
  },
  {
    id: 'feature-explorer',
    title: 'Feature Explorer',
    description: 'Visit 5 different sections of the app',
    points: 80,
    icon: '🧭',
    achieved: false,
    category: 'engagement',
    level: 'bronze'
  },
  {
    id: 'first-drive-log',
    title: 'Journey Journalist',
    description: 'Log your first drive',
    points: 50,
    icon: '📝',
    achieved: false,
    category: 'driving',
    level: 'bronze'
  },
  {
    id: 'first-mod',
    title: 'Mod Master',
    description: 'Log your first vehicle modification',
    points: 80,
    icon: '🛠️',
    achieved: false,
    category: 'maintenance',
    level: 'silver'
  },
  {
    id: 'first-gallery-upload',
    title: 'Visual Virtuoso',
    description: 'Upload your first photo to the gallery',
    points: 40,
    icon: '📸',
    achieved: false,
    category: 'engagement',
    level: 'bronze'
  },
];

// Initial state for user rewards
const initialUserRewards: UserRewards = {
  totalPoints: 0,
  level: 1,
  rewards: [],
  streakDays: 0,
  lastActive: new Date().toISOString(),
};

// Points required for each level
const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];

// Create the rewards context
export const RewardsContext = createContext<RewardsContextType | null>(null);

export const RewardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for user rewards
  const [userRewards, setUserRewards] = useState<UserRewards>(() => {
    // Load from localStorage if available
    const savedRewards = localStorage.getItem('paddock20_userRewards');
    if (savedRewards) {
      return JSON.parse(savedRewards);
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
    localStorage.setItem('paddock20_userRewards', JSON.stringify(userRewards));
  }, [userRewards]);
  
  // Track visited pages for the 'Feature Explorer' achievement
  useEffect(() => {
    // Skip if the reward is already achieved
    if (userRewards.rewards.some(r => r.id === 'feature-explorer' && r.achieved)) {
      return;
    }
    
    // Get visited pages from localStorage or initialize
    const visitedPages = JSON.parse(localStorage.getItem('paddock20_visitedPages') || '[]');
    
    // Add current page if not already added
    if (!visitedPages.includes(location)) {
      visitedPages.push(location);
      localStorage.setItem('paddock20_visitedPages', JSON.stringify(visitedPages));
      
      // Check if we've visited enough pages
      if (visitedPages.length >= 5) {
        unlockReward('feature-explorer');
      }
    }
  }, [location]);
  
  // Check login streak
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
          lastActive: today
        }));
        
        // Check for streak rewards
        if (newStreakDays === 3 && !userRewards.rewards.some(r => r.id === 'login-streak-3')) {
          unlockReward('login-streak-3');
        }
      } else {
        // Streak broken
        setUserRewards(prev => ({
          ...prev,
          streakDays: 1, // Reset to 1 for today
          lastActive: today
        }));
      }
    }
  }, []);
  
  // Check if the user is eligible for any rewards
  const checkRewardsEligibility = () => {
    // This would typically include more complex logic based on user behavior
    // For demonstration purposes, we're keeping it simple
  };
  
  // Add points to the user's total
  const earnPoints = (points: number, reason: string) => {
    setUserRewards(prev => {
      const newTotal = prev.totalPoints + points;
      
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
          category: 'engagement',
          level: 'gold'
        });
        setShowRewardNotification(true);
      }
      
      return {
        ...prev,
        totalPoints: newTotal,
        level: newLevel
      };
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
    setUserRewards(prev => ({
      ...prev,
      rewards: [...prev.rewards, achievedReward],
      totalPoints: prev.totalPoints + achievedReward.points
    }));
    
    // Set as recent reward for notification
    setRecentReward(achievedReward);
    setShowRewardNotification(true);
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
        pointsToNextLevel,
        levelProgress
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