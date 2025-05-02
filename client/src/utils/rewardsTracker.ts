/**
 * Rewards tracker utility
 * 
 * This utility provides methods to track user activities across the application
 * for the rewards system without modifying existing components.
 * 
 * Usage:
 * import { trackWeatherCheck, trackMaintenance, etc. } from '../utils/rewardsTracker';
 * 
 * Then call the appropriate function when an action is performed:
 * trackWeatherCheck();
 * trackMaintenance();
 */

import { useRewards, UserStats } from '../contexts/RewardsContext';

// Singleton to store the rewards context functions
type RewardsTrackerType = {
  trackFeatureUsage?: (feature: string, count?: number) => void;
  earnPoints?: (points: number, reason: string) => void;
  trackPageVisit?: (page: string) => void;
  unlockReward?: (rewardId: string) => void;
  incrementStat?: (stat: keyof UserStats, amount?: number) => void;
};

// Global tracker that will be populated by the hook
const rewardsTracker: RewardsTrackerType = {};

// Hook to initialize the tracker
export const useRewardsTracker = () => {
  const rewards = useRewards();
  
  // Set up the tracker with context functions
  if (!rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage = rewards.trackFeatureUsage;
    rewardsTracker.earnPoints = rewards.earnPoints;
    rewardsTracker.trackPageVisit = rewards.trackPageVisit;
    rewardsTracker.unlockReward = rewards.unlockReward;
    rewardsTracker.incrementStat = rewards.incrementStat;
  }
  
  return rewards;
};

// Weather tracking
export const trackWeatherCheck = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('weather');
    rewardsTracker.earnPoints?.(10, 'Checked weather conditions');
  }
};

// Maintenance tracking
export const trackMaintenance = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('maintenance');
    rewardsTracker.earnPoints?.(25, 'Logged vehicle maintenance');
  }
};

// Modification tracking
export const trackModification = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('modification');
    rewardsTracker.earnPoints?.(30, 'Logged vehicle modification');
  }
};

// Detailing/gloss tracking
export const trackDetailingSession = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('detailing');
    rewardsTracker.earnPoints?.(20, 'Logged detailing session');
  }
};

// Drive logging tracking
export const trackDriveLog = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('drive');
    rewardsTracker.earnPoints?.(25, 'Logged a drive');
  }
};

// Photo upload tracking
export const trackPhotoUpload = (count: number = 1) => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('photo', count);
    rewardsTracker.earnPoints?.(15 * count, 'Uploaded photos to gallery');
  }
};

// Route planning tracking
export const trackRoutePlanning = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('route');
    rewardsTracker.earnPoints?.(35, 'Planned a drive route');
  }
};

// Manifestation Station tracking
export const trackManifestationGoal = () => {
  if (rewardsTracker.trackFeatureUsage) {
    rewardsTracker.trackFeatureUsage('manifestation');
    rewardsTracker.earnPoints?.(40, 'Set a goal in Manifestation Station');
  }
};

// Track page visit with reward points
export const trackPageVisitWithPoints = (page: string, points: number = 5, reason?: string) => {
  if (rewardsTracker.trackPageVisit) {
    rewardsTracker.trackPageVisit(page);
    rewardsTracker.earnPoints?.(points, reason || `Visited ${page}`);
  }
};

// Generic bonus points
export const awardBonusPoints = (points: number, reason: string) => {
  rewardsTracker.earnPoints?.(points, reason);
};

// Complete profile reward
export const completeProfileReward = () => {
  rewardsTracker.unlockReward?.('profile-complete');
};

// Mark feature as explored without awarding points
export const exploreFeature = (feature: string) => {
  if (rewardsTracker.trackPageVisit) {
    rewardsTracker.trackPageVisit(feature);
  }
};

// Helper function to safely increment a stat with type checking
export const safeIncrementStat = (stat: keyof UserStats, amount: number = 1) => {
  rewardsTracker.incrementStat?.(stat, amount);
};