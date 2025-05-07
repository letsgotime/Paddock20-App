/**
 * FeatureUpsellCard Component
 * Promotes premium features throughout the application
 */
import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockKeyhole, Star, ArrowRight } from 'lucide-react';
import { FeatureFlag } from '@/utils/featureFlags';
import useFeatureFlag from '@/hooks/useFeatureFlag';

interface FeatureUpsellCardProps {
  feature: FeatureFlag;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

const FeatureUpsellCard: React.FC<FeatureUpsellCardProps> = ({
  feature,
  title,
  description,
  icon,
  className = '',
  compact = false
}) => {
  const [, setLocation] = useLocation();
  const { isPremiumFeature } = useFeatureFlag();
  
  // Default titles and descriptions for common premium features
  const featureDefaults: Partial<Record<FeatureFlag, { title: string; description: string; icon: React.ReactNode }>> = {
    [FeatureFlag.PODIUM_PURSUIT]: {
      title: 'Podium Pursuit',
      description: 'Compete with other drivers and track your achievements with our gamified driving experience.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.JUICE_BOX]: {
      title: 'Juice Box',
      description: 'Get detailed battery analytics and charging optimization for electric vehicles.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.WEATHER_ANALYTICS]: {
      title: 'Advanced Weather Analytics',
      description: 'Access premium weather data with 14-day forecasts and detailed driving conditions.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.DRIVE_OPTIMIZATION]: {
      title: 'Drive Optimization',
      description: 'Get personalized driving recommendations based on your vehicle and local conditions.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.MAINTENANCE_TRACKING]: {
      title: 'Maintenance Tracking',
      description: 'Track all maintenance records and get smart reminders for upcoming service needs.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.WEATHER_PADDOCK]: {
      title: 'Premium Weather Features',
      description: 'Upgrade to unlock advanced weather features and enhance your driving experience.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.DRIVE_JOURNAL]: {
      title: 'Premium Drive Journal',
      description: 'Unlimited drive journal entries with enhanced analytics and insights.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.GARAGE_VAULT]: {
      title: 'Premium Garage',
      description: 'Unlock unlimited vehicles and advanced maintenance tracking.',
      icon: <LockKeyhole />
    },
    [FeatureFlag.MY_DASHBOARD]: {
      title: 'Premium Dashboard',
      description: 'Customizable dashboard with advanced telemetry and insights.',
      icon: <LockKeyhole />
    }
  };
  
  // Use provided values or defaults
  const fallbackData = {
    title: 'Premium Feature',
    description: 'Upgrade to unlock this premium feature and enhance your driving experience.',
    icon: <LockKeyhole />
  };
  const defaultData = featureDefaults[feature] || fallbackData;
  const featureTitle = title || defaultData.title;
  const featureDescription = description || defaultData.description;
  const featureIcon = icon || defaultData.icon;
  
  const handleUpgrade = () => {
    setLocation('/premium');
  };
  
  // Compact version (for inline promotions)
  if (compact) {
    return (
      <Card className={`bg-zinc-900 border-amber-600/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-white font-medium">{featureTitle}</h4>
                <p className="text-zinc-400 text-xs">Premium feature</p>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-amber-500 hover:text-amber-400 p-0"
              onClick={handleUpgrade}
            >
              Upgrade <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Full version
  return (
    <Card className={`bg-zinc-900 border-amber-600/50 overflow-hidden ${className}`}>
      <div className="h-2 bg-amber-600" />
      
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
            {React.cloneElement(featureIcon as React.ReactElement, { 
              className: 'h-5 w-5 text-amber-500' 
            })}
          </div>
          <h3 className="text-lg font-bold text-white">{featureTitle}</h3>
        </div>
        
        <p className="text-zinc-400 text-sm mb-4">
          {featureDescription}
        </p>
        
        {isPremiumFeature(feature) && (
          <div className="bg-amber-600/10 rounded-md p-3 border border-amber-600/30">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-amber-400 text-xs">
                Available with PADDOCK20 Premium subscription
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pb-4 pt-0">
        <Button 
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          onClick={handleUpgrade}
        >
          <Star className="h-4 w-4 mr-2" />
          Upgrade to Premium
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureUpsellCard;