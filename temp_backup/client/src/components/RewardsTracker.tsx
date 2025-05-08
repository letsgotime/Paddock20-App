import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRewardsTracker } from '../utils/rewardsTracker';

/**
 * This component doesn't render anything visible, but initializes
 * the rewards tracking system and monitors user activity.
 * It should be placed high in the component tree.
 */
const RewardsTracker: React.FC = () => {
  // Initialize rewards tracker - need to declare outside try/catch for hook rules
  const rewards = useRewardsTracker();
  const [location] = useLocation();
  
  // Track page visits for rewards
  useEffect(() => {
    const trackVisit = () => {
      try {
        // With wouter, location is just the path string
        if (location && rewards && typeof rewards.trackPageVisit === 'function') {
          // Track the page visit
          rewards.trackPageVisit(location);
        }
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };
    
    // Add a small timeout to avoid potential render loops
    const timer = setTimeout(trackVisit, 50);
    return () => clearTimeout(timer);
  }, [location]); // Intentionally removed rewards dependency
  
  // Run periodic checks for time-based rewards
  useEffect(() => {
    try {
      // Only proceed if rewards is properly initialized
      if (!rewards || typeof rewards.unlockReward !== 'function') return;
      
      // Check for time-based achievements (night owl, early bird)
      const checkTimeBasedRewards = () => {
        try {
          const hour = new Date().getHours();
          
          // Night owl reward (after midnight)
          if (hour >= 0 && hour < 5) {
            rewards.unlockReward('night-owl');
          }
          
          // Early bird reward (before 6am)
          if (hour < 6) {
            rewards.unlockReward('early-bird');
          }
        } catch (error) {
          console.error('Error checking time-based rewards:', error);
        }
      };
      
      // Run immediately, but only once when component mounts
      // or when rewards implementation changes
      checkTimeBasedRewards();
      
      // Then set up timer to check every hour
      const timer = setInterval(checkTimeBasedRewards, 60 * 60 * 1000);
      
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error setting up time-based rewards:', error);
    }
  }, []); // Empty dependency array to run only once on mount
  
  return null; // This component doesn't render anything
};

export default RewardsTracker;