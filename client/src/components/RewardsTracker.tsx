import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRewardsTracker } from '../utils/rewardsTracker';

/**
 * This component doesn't render anything visible, but initializes
 * the rewards tracking system and monitors user activity.
 * It should be placed high in the component tree.
 */
const RewardsTracker: React.FC = () => {
  // Initialize rewards tracker
  const rewards = useRewardsTracker();
  const location = useLocation();
  
  // Track page visits for rewards
  useEffect(() => {
    if (location && location.pathname) {
      // Track the page visit
      rewards.trackPageVisit?.(location.pathname);
      
      // Don't check eligibility on every page load to avoid infinite loops
      // This will be handled by the rewards tracker internally
    }
  }, [location?.pathname]);
  
  // Run periodic checks for time-based rewards
  useEffect(() => {
    // Check for time-based achievements (night owl, early bird)
    const checkTimeBasedRewards = () => {
      const hour = new Date().getHours();
      
      // Night owl reward (after midnight)
      if (hour >= 0 && hour < 5) {
        rewards.unlockReward('night-owl');
      }
      
      // Early bird reward (before 6am)
      if (hour < 6) {
        rewards.unlockReward('early-bird');
      }
    };
    
    // Run immediately
    checkTimeBasedRewards();
    
    // Then set up timer to check every hour
    const timer = setInterval(checkTimeBasedRewards, 60 * 60 * 1000);
    
    return () => clearInterval(timer);
  }, [rewards]);
  
  return null; // This component doesn't render anything
};

export default RewardsTracker;