/**
 * useFeatureFlag Hook
 * Custom hook for checking feature flags based on the current user
 */

import { useAuth } from '@/auth';
import { 
  FeatureFlag, 
  hasFeatureAccess, 
  getFeatureLimits, 
  hasReachedLimit,
  getAvailableFeatures,
  isPremiumFeature,
  getFeatureLimitDescription,
  type FeatureLimits
} from '@/utils/featureFlags';

interface UseFeatureFlagReturn {
  // Check if a feature is available to the current user
  hasAccess: (feature: FeatureFlag) => boolean;
  
  // Get all available features for the current user
  getAvailableFeatures: () => FeatureFlag[];
  
  // Get feature limits for the current user
  getLimits: () => FeatureLimits;
  
  // Check if a user has reached a specific limit
  hasReachedLimit: (limitKey: keyof FeatureLimits, currentCount: number) => boolean;
  
  // Check if a feature is premium
  isPremiumFeature: (feature: FeatureFlag) => boolean;
  
  // Get a user-friendly description of feature limitations
  getLimitDescription: (feature: FeatureFlag) => string;
}

export function useFeatureFlag(): UseFeatureFlagReturn {
  const { user } = useAuth();
  
  return {
    hasAccess: (feature: FeatureFlag) => hasFeatureAccess(user, feature),
    getAvailableFeatures: () => getAvailableFeatures(user),
    getLimits: () => getFeatureLimits(user),
    hasReachedLimit: (limitKey: keyof FeatureLimits, currentCount: number) => 
      hasReachedLimit(user, limitKey, currentCount),
    isPremiumFeature: (feature: FeatureFlag) => isPremiumFeature(feature),
    getLimitDescription: (feature: FeatureFlag) => getFeatureLimitDescription(user, feature)
  };
}

export default useFeatureFlag;