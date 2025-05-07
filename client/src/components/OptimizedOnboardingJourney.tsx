/**
 * OptimizedOnboardingJourney.tsx
 * 
 * An enhanced onboarding journey component that focuses on introducing only 30% of features
 * during initial onboarding, with status indicators for incomplete setup items.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  User, 
  Cloud, 
  Settings, 
  Gauge, 
  Map, 
  Calendar, 
  CheckCircle2, 
  CircleDashed,
  ArrowRight,
  PaintBucket,
  Trophy,
  Target,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserProfileStore } from '../services/userProfileService';
import { useVehicle } from '../hooks/useVehicle';
import { useToast } from '@/hooks/use-toast';

// Carolina blue color code for consistent branding
const CAROLINA_BLUE = '#1982FC';
const GOTIME_GREEN = '#08c519';

// Onboarding step categories
const STEP_CATEGORIES = {
  ESSENTIAL: 'essential', // Core features (30%)
  ADVANCED: 'advanced',   // Next-level features to promote after core onboarding
  PREMIUM: 'premium'      // Premium/paid features to upsell
};

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  category: string;
  actionText: string;
  actionPath: string;
  importance: number; // 1-10 scale for prioritization
}

interface OptimizedOnboardingJourneyProps {
  compact?: boolean;
  showAllSteps?: boolean;
}

export default function OptimizedOnboardingJourney({ 
  compact = false,
  showAllSteps = false
}: OptimizedOnboardingJourneyProps) {
  const { profile } = useUserProfileStore();
  const { vehicle, vehicles } = useVehicle();
  const { toast } = useToast();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [essentialStepsCompleted, setEssentialStepsCompleted] = useState(0);
  const [essentialStepsTotal, setEssentialStepsTotal] = useState(0);
  const [allStepsCompleted, setAllStepsCompleted] = useState(0);
  const [allStepsTotal, setAllStepsTotal] = useState(0);
  const [showTip, setShowTip] = useState(false);
  
  // Calculate onboarding progress
  useEffect(() => {
    if (!profile) return;
    
    // Define all onboarding steps
    const onboardingSteps: OnboardingStep[] = [
      // Essential Steps (30% core functionality)
      {
        id: 'profile',
        title: 'Driver Profile',
        description: 'Set up your personal driver profile',
        icon: <User className="h-5 w-5" />,
        completed: !!profile.name,
        category: STEP_CATEGORIES.ESSENTIAL,
        actionText: 'Complete Profile',
        actionPath: '/profile',
        importance: 10
      },
      {
        id: 'vehicle',
        title: 'Primary Vehicle',
        description: 'Add your main vehicle details',
        icon: <Car className="h-5 w-5" />,
        completed: vehicles.length > 0,
        category: STEP_CATEGORIES.ESSENTIAL,
        actionText: 'Add Vehicle',
        actionPath: '/garage/add',
        importance: 9
      },
      {
        id: 'location',
        title: 'Home Location',
        description: 'Set your primary location',
        icon: <Map className="h-5 w-5" />,
        completed: !!profile.location,
        category: STEP_CATEGORIES.ESSENTIAL,
        actionText: 'Set Location',
        actionPath: '/settings/location',
        importance: 8
      },
      {
        id: 'weather',
        title: 'Weather Setup',
        description: 'Configure basic weather alerts',
        icon: <Cloud className="h-5 w-5" />,
        completed: !!profile.weatherPreferences,
        category: STEP_CATEGORIES.ESSENTIAL,
        actionText: 'Setup Weather',
        actionPath: '/weather/setup',
        importance: 7
      },
      
      // Advanced Steps (introduced later)
      {
        id: 'preferences',
        title: 'Drive Preferences',
        description: 'Customize your driving experience',
        icon: <Settings className="h-5 w-5" />,
        completed: !!profile.drivePreferences,
        category: STEP_CATEGORIES.ADVANCED,
        actionText: 'Set Preferences',
        actionPath: '/settings/drive',
        importance: 6
      },
      {
        id: 'goals',
        title: 'Automotive Goals',
        description: 'Set your first automotive goal',
        icon: <Target className="h-5 w-5" />,
        completed: profile.goals && profile.goals.length > 0,
        category: STEP_CATEGORIES.ADVANCED,
        actionText: 'Set Goals',
        actionPath: '/goals',
        importance: 5
      },
      {
        id: 'maintenance',
        title: 'Service Records',
        description: 'Track vehicle maintenance',
        icon: <Gauge className="h-5 w-5" />,
        completed: profile.hasMaintenanceRecords,
        category: STEP_CATEGORIES.ADVANCED,
        actionText: 'Add Records',
        actionPath: '/garage/service',
        importance: 4
      },
      
      // Premium Features (upsell opportunities)
      {
        id: 'detailing',
        title: 'Detailing Plans',
        description: 'Create car detailing schedule',
        icon: <PaintBucket className="h-5 w-5" />,
        completed: profile.hasDetailingPlan,
        category: STEP_CATEGORIES.PREMIUM,
        actionText: 'Setup Detailing',
        actionPath: '/juicebox',
        importance: 3
      },
      {
        id: 'achievements',
        title: 'Driver Achievements',
        description: 'Track your automotive milestones',
        icon: <Trophy className="h-5 w-5" />,
        completed: profile.hasAchievements,
        category: STEP_CATEGORIES.PREMIUM,
        actionText: 'View Achievements',
        actionPath: '/achievements',
        importance: 2
      },
      {
        id: 'events',
        title: 'Automotive Calendar',
        description: 'Set up your events calendar',
        icon: <Calendar className="h-5 w-5" />,
        completed: profile.hasViewedEvents,
        category: STEP_CATEGORIES.PREMIUM,
        actionText: 'Calendar Setup',
        actionPath: '/events',
        importance: 1
      }
    ];
    
    // Count steps
    const essentialSteps = onboardingSteps.filter(step => step.category === STEP_CATEGORIES.ESSENTIAL);
    const essentialCompleted = essentialSteps.filter(step => step.completed).length;
    
    setEssentialStepsTotal(essentialSteps.length);
    setEssentialStepsCompleted(essentialCompleted);
    setAllStepsTotal(onboardingSteps.length);
    setAllStepsCompleted(onboardingSteps.filter(step => step.completed).length);
    
    // Filter steps based on props
    const stepsToShow = showAllSteps 
      ? onboardingSteps 
      : onboardingSteps.filter(step => 
          step.category === STEP_CATEGORIES.ESSENTIAL || 
          (step.category === STEP_CATEGORIES.ADVANCED && essentialCompleted === essentialSteps.length)
        );
    
    setSteps(stepsToShow);
    
  }, [profile, vehicles, vehicle, showAllSteps]);
  
  const handleTipToggle = () => {
    setShowTip(!showTip);
  };
  
  const getNextActionStep = () => {
    // Find the first incomplete essential step
    const nextEssential = steps
      .filter(step => step.category === STEP_CATEGORIES.ESSENTIAL && !step.completed)
      .sort((a, b) => b.importance - a.importance)[0];
    
    if (nextEssential) return nextEssential;
    
    // If all essential steps are complete, find the first incomplete advanced step
    const nextAdvanced = steps
      .filter(step => step.category === STEP_CATEGORIES.ADVANCED && !step.completed)
      .sort((a, b) => b.importance - a.importance)[0];
    
    if (nextAdvanced) return nextAdvanced;
    
    // Otherwise, suggest a premium feature
    return steps
      .filter(step => step.category === STEP_CATEGORIES.PREMIUM && !step.completed)
      .sort((a, b) => b.importance - a.importance)[0];
  };
  
  // For compact view in dashboard widgets
  if (compact) {
    const nextStep = getNextActionStep();
    const essentialProgress = essentialStepsTotal > 0 
      ? Math.round((essentialStepsCompleted / essentialStepsTotal) * 100) 
      : 0;
    
    return (
      <div className="bg-black/50 rounded-xl p-4 border border-[#222] shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 
              className={`h-5 w-5 ${
                essentialStepsCompleted === essentialStepsTotal 
                  ? 'text-[#08c519]' 
                  : 'text-[#1982FC]'
              }`} 
            />
            <h3 className="font-bold text-sm">Paddock Setup</h3>
          </div>
          <span className="text-xs font-medium">
            {essentialStepsCompleted}/{essentialStepsTotal} essential
          </span>
        </div>
        
        {/* Progress bar */}
        <Progress 
          value={essentialProgress} 
          className="h-2 mb-3"
          indicatorColor={essentialProgress === 100 ? 'bg-[#08c519]' : 'bg-[#1982FC]'}
        />
        
        {/* Next action */}
        {nextStep ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-full ${
                nextStep.category === STEP_CATEGORIES.ESSENTIAL 
                  ? 'bg-[#1982FC]/20' 
                  : nextStep.category === STEP_CATEGORIES.ADVANCED
                    ? 'bg-yellow-500/20'
                    : 'bg-purple-500/20'
              }`}>
                {nextStep.icon}
              </div>
              <span className="text-xs">{nextStep.title}</span>
            </div>
            <Link href={nextStep.actionPath}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs px-2 py-1 h-auto ${
                  nextStep.category === STEP_CATEGORIES.ESSENTIAL
                    ? 'text-[#1982FC] hover:text-[#1982FC]/80'
                    : nextStep.category === STEP_CATEGORIES.ADVANCED
                      ? 'text-yellow-500 hover:text-yellow-500/80'
                      : 'text-purple-500 hover:text-purple-500/80'
                }`}
              >
                {nextStep.actionText}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center text-xs text-[#08c519]">
            All setup tasks complete!
          </div>
        )}
      </div>
    );
  }
  
  // Full view for dedicated onboarding page
  return (
    <div className="bg-black/50 rounded-xl p-6 border border-[#222] shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1982FC]/30 to-[#08c519]/30 flex items-center justify-center">
              {essentialStepsCompleted === essentialStepsTotal 
                ? <CheckCircle2 className="h-6 w-6 text-[#08c519]" />
                : <CircleDashed className="h-6 w-6 text-[#1982FC]" />
              }
            </div>
            <h2 className="text-xl font-bold font-orbitron text-white">Your Paddock Journey</h2>
          </div>
          <p className="text-sm text-gray-400">
            {essentialStepsCompleted === essentialStepsTotal 
              ? 'Essential setup complete! Explore advanced features.'
              : `Essential setup: ${essentialStepsCompleted} of ${essentialStepsTotal} complete`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTipToggle}
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 border-[#1982FC]/30 text-[#1982FC] hover:text-[#1982FC]/80"
          >
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Setup Tips
          </Button>
          
          {!showAllSteps && (
            <Link href="/onboarding/all">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 border-[#1982FC]/30 text-[#1982FC] hover:text-[#1982FC]/80"
              >
                Show All Features
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Setup tip banner */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#1982FC]/10 border border-[#1982FC]/20 rounded-lg p-4 mb-6"
        >
          <h3 className="text-md font-medium text-[#1982FC] mb-2">Paddock Setup Tips</h3>
          <p className="text-sm text-gray-300 mb-3">
            Complete the essential setup items first to unlock the core Paddock20 experience. 
            After that, advanced features will become available. Premium features offer enhanced 
            capabilities for the ultimate automotive lifestyle.
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#1982FC]"></div>
              <span>Essential</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Advanced</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Premium</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Progress section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Essential Setup</span>
          <span className="text-sm text-gray-400">
            {essentialStepsCompleted}/{essentialStepsTotal}
          </span>
        </div>
        <Progress 
          value={(essentialStepsCompleted / essentialStepsTotal) * 100} 
          className="h-2.5 mb-4"
          indicatorColor={essentialStepsCompleted === essentialStepsTotal ? 'bg-[#08c519]' : 'bg-[#1982FC]'}
        />
        
        {showAllSteps && (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Progress</span>
              <span className="text-sm text-gray-400">
                {allStepsCompleted}/{allStepsTotal}
              </span>
            </div>
            <Progress 
              value={(allStepsCompleted / allStepsTotal) * 100} 
              className="h-2.5"
            />
          </>
        )}
      </div>
      
      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`border rounded-xl p-4 transition-all ${
              step.completed 
                ? 'bg-gradient-to-br from-[#08c519]/5 to-transparent border-[#08c519]/20' 
                : step.category === STEP_CATEGORIES.ESSENTIAL
                  ? 'bg-gradient-to-br from-[#1982FC]/5 to-transparent border-[#1982FC]/20'
                  : step.category === STEP_CATEGORIES.ADVANCED
                    ? 'bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/20'
                    : 'bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed 
                  ? 'bg-[#08c519]/10 text-[#08c519]' 
                  : step.category === STEP_CATEGORIES.ESSENTIAL
                    ? 'bg-[#1982FC]/10 text-[#1982FC]'
                    : step.category === STEP_CATEGORIES.ADVANCED
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-purple-500/10 text-purple-500'
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className={`font-medium ${
                    step.completed 
                      ? 'text-[#08c519]' 
                      : 'text-white'
                  }`}>
                    {step.title}
                  </h3>
                  {/* Status indicator */}
                  <div>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-[#08c519]" />
                    ) : (
                      <CircleDashed className={`h-5 w-5 ${
                        step.category === STEP_CATEGORIES.ESSENTIAL
                          ? 'text-[#1982FC]'
                          : step.category === STEP_CATEGORIES.ADVANCED
                            ? 'text-yellow-500'
                            : 'text-purple-500'
                      }`} />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                
                {!step.completed && (
                  <Link href={step.actionPath}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`w-full text-xs border-[#222] ${
                        step.category === STEP_CATEGORIES.ESSENTIAL
                          ? 'text-[#1982FC] hover:text-[#1982FC]/80 hover:border-[#1982FC]/30'
                          : step.category === STEP_CATEGORIES.ADVANCED
                            ? 'text-yellow-500 hover:text-yellow-500/80 hover:border-yellow-500/30'
                            : 'text-purple-500 hover:text-purple-500/80 hover:border-purple-500/30'
                      }`}
                    >
                      {step.actionText}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Essential completion message */}
      {essentialStepsCompleted === essentialStepsTotal && (
        <div className="mt-6 bg-[#08c519]/10 border border-[#08c519]/20 rounded-xl p-4">
          <h3 className="text-lg font-bold text-[#08c519] mb-2">Essential Setup Complete!</h3>
          <p className="text-gray-300 mb-3">
            You've completed all essential setup tasks. Your PADDOCK20 experience is now activated with core features.
            Continue setting up advanced features to enhance your automotive lifestyle.
          </p>
          
          {!showAllSteps && allStepsCompleted < allStepsTotal && (
            <Link href="/onboarding/all">
              <Button className="w-full bg-[#08c519] hover:bg-[#08c519]/80">
                Explore Advanced Features
              </Button>
            </Link>
          )}
        </div>
      )}
      
      {/* Complete setup message */}
      {allStepsCompleted === allStepsTotal && (
        <div className="mt-6 bg-[#08c519]/10 border border-[#08c519]/20 rounded-xl p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-[#08c519] mx-auto mb-2" />
          <h3 className="text-xl font-bold text-[#08c519] mb-2">Paddock Setup Complete!</h3>
          <p className="text-gray-300 mb-4">
            Congratulations! You've fully configured your PADDOCK20 experience. 
            All features are now activated and personalized to your automotive lifestyle.
          </p>
          <Link href="/paddock">
            <Button className="bg-[#08c519] hover:bg-[#08c519]/80">
              Enter Your Paddock
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}