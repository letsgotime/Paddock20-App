/**
 * PremiumFeatureBanner Component
 * Displays a banner for when users attempt to access premium features
 * Used with PermissionRoute and PremiumRoute components
 */
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LockKeyhole, Star, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface PremiumFeatureBannerProps {
  title?: string;
  description?: string;
  featureName?: string;
  onUpgrade?: () => void;
  onBack?: () => void;
  className?: string;
}

const PremiumFeatureBanner: React.FC<PremiumFeatureBannerProps> = ({
  title = "Premium Feature",
  description = "This feature is available exclusively to premium members.",
  featureName,
  onUpgrade,
  onBack,
  className = ""
}) => {
  const [, setLocation] = useLocation();
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default action is to navigate to premium subscription page
      setLocation('/premium');
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default action is to go back to previous page
      setLocation('/the-paddock');
    }
  };
  
  return (
    <div className={`container max-w-2xl mx-auto py-12 px-4 ${className}`}>
      <Card className="bg-zinc-900 border-carolina-blue overflow-hidden">
        <div className="h-3 bg-amber-600" />
        
        <CardHeader className="pt-8 pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center">
              <LockKeyhole className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center font-orbitron">
            {title}
          </h2>
          
          {featureName && (
            <p className="text-amber-500 text-center mt-1 font-medium">
              {featureName}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="text-center pb-4">
          <p className="text-zinc-300">
            {description}
          </p>
          
          <div className="mt-6 space-y-3">
            <div className="p-3 bg-zinc-800 rounded-lg flex items-center">
              <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-medium">Paddock Premium</h4>
                <p className="text-zinc-400 text-sm">Unlock all premium features and get exclusive access</p>
              </div>
            </div>
            
            <div className="p-3 bg-zinc-800 rounded-lg flex items-center">
              <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center mr-3">
                <ChevronRight className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-medium">Team Membership</h4>
                <p className="text-zinc-400 text-sm">Perfect for multiple vehicles and team management</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
          <Button 
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleUpgrade}
          >
            <Star className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>
          
          <Button 
            variant="outline"
            className="w-full sm:w-auto border-zinc-700 text-zinc-300"
            onClick={handleBack}
          >
            Return to Paddock
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PremiumFeatureBanner;