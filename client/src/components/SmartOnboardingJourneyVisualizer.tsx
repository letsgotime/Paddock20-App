/**
 * SmartOnboardingJourneyVisualizer.tsx
 * 
 * A component that visualizes the user's onboarding journey status and progress,
 * ensuring all onboarded data feeds to driver profiles and all site components.
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
  ArrowRight 
} from 'lucide-react';
import { useUserProfileStore } from '../services/userProfileService';
import ProfileDataCollector from '../services/ProfileDataCollector';
import EngagementRewardsService from '../services/engagementRewardsService';
import { useVehicle } from '../hooks/useVehicle';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  feedsTo: string[];
}

interface SmartOnboardingJourneyVisualizerProps {
  compact?: boolean;
}

export default function SmartOnboardingJourneyVisualizer({ 
  compact = false 
}: SmartOnboardingJourneyVisualizerProps) {
  const { profile } = useUserProfileStore();
  const { vehicle, vehicles } = useVehicle();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [feedingData, setFeedingData] = useState<{
    sourceId: string;
    destinationId: string;
    active: boolean;
  } | null>(null);
  
  // Calculate onboarding progress
  useEffect(() => {
    if (!profile) return;
    
    // Define the onboarding steps
    const onboardingSteps: OnboardingStep[] = [
      {
        id: 'profile',
        title: 'Driver Profile',
        description: 'Set up your personal driver profile',
        icon: <User className="h-5 w-5" />,
        completed: !!profile.name,
        feedsTo: ['settings', 'dashboard', 'weather']
      },
      {
        id: 'vehicle',
        title: 'Vehicle Setup',
        description: 'Add your first vehicle',
        icon: <Car className="h-5 w-5" />,
        completed: vehicles.length > 0,
        feedsTo: ['garage', 'juicebox', 'dashboard', 'weather']
      },
      {
        id: 'location',
        title: 'Location Setup',
        description: 'Set your home location',
        icon: <Map className="h-5 w-5" />,
        completed: !!profile.location,
        feedsTo: ['weather', 'routes', 'dashboard']
      },
      {
        id: 'weather',
        title: 'Weather Preferences',
        description: 'Configure weather alerts',
        icon: <Cloud className="h-5 w-5" />,
        completed: !!profile.weatherPreferences,
        feedsTo: ['dashboard', 'routes']
      },
      {
        id: 'preferences',
        title: 'Drive Preferences',
        description: 'Set your driving preferences',
        icon: <Settings className="h-5 w-5" />,
        completed: !!profile.drivePreferences,
        feedsTo: ['dashboard', 'routes', 'juicebox']
      },
      {
        id: 'goals',
        title: 'Automotive Goals',
        description: 'Set your first automotive goal',
        icon: <Gauge className="h-5 w-5" />,
        completed: profile.goals && profile.goals.length > 0,
        feedsTo: ['dashboard', 'rewards']
      },
      {
        id: 'events',
        title: 'Event Calendar',
        description: 'Check your upcoming events',
        icon: <Calendar className="h-5 w-5" />,
        completed: profile.hasViewedEvents,
        feedsTo: ['dashboard']
      }
    ];
    
    setSteps(onboardingSteps);
    setCompletedCount(onboardingSteps.filter(step => step.completed).length);
    
    // Auto-hide visualizer if all steps are completed and user has seen it before
    if (profile.onboardingComplete && profile.hasViewedOnboarding) {
      setShowVisualizer(false);
    }
    
  }, [profile, vehicles, vehicle]);
  
  // Handle data flow visualization
  useEffect(() => {
    if (!profile || completedCount === 0) return;
    
    // Simulate data flowing between components
    const feedDataInterval = setInterval(() => {
      // Only do this if some steps are completed
      const completedSteps = steps.filter(step => step.completed);
      if (completedSteps.length === 0) {
        setFeedingData(null);
        return;
      }
      
      // Randomly choose a completed step
      const randomStep = completedSteps[Math.floor(Math.random() * completedSteps.length)];
      
      // Randomly choose a destination from its feedsTo list
      const randomDestination = randomStep.feedsTo[Math.floor(Math.random() * randomStep.feedsTo.length)];
      
      // Set the active data flow
      setFeedingData({
        sourceId: randomStep.id,
        destinationId: randomDestination,
        active: true
      });
      
      // Clear the active data flow after a delay
      setTimeout(() => {
        setFeedingData(null);
      }, 2000);
      
    }, 5000);
    
    return () => clearInterval(feedDataInterval);
  }, [steps, completedCount, profile]);
  
  // Mark onboarding as complete when all steps are done
  useEffect(() => {
    if (!profile) return;
    
    const allCompleted = steps.length > 0 && steps.every(step => step.completed);
    
    if (allCompleted && profile.onboardingComplete === undefined) {
      // Get the update function directly to avoid re-rendering loop
      const updateProfile = useUserProfileStore.getState().updateProfile;
      
      // Add a _skipBroadcast flag to prevent circular updates
      updateProfile({ 
        onboardingComplete: true,
        hasViewedOnboarding: true,
        lastActive: new Date().toISOString(),
        _skipBroadcast: true
      });
      
      // Record activity in rewards system with source tracking to prevent loops
      EngagementRewardsService.recordActivity(
        'profile_updated',
        'Completed onboarding process',
        'onboarding',
        { source: 'SmartOnboardingJourneyVisualizer' }
      );
      
      // Update last active timestamp with source tracking
      ProfileDataCollector.updateLastActive('SmartOnboardingJourneyVisualizer');
    }
  }, [steps, profile]);
  
  if (!showVisualizer) return null;
  
  // Force feed all onboarded data to driver profiles and dashboards
  const syncAllData = () => {
    if (!profile) return;
    
    console.log('Syncing all onboarded data to site-wide components...');
    
    // Use a source identifier to prevent circular references
    const SOURCE = 'SmartOnboardingJourneyVisualizer_syncAllData';
    
    // Sync vehicle data
    if (vehicles.length > 0) {
      ProfileDataCollector.syncAllVehicles(vehicles, SOURCE);
    }
    
    // Sync driver profile data
    if (profile.name) {
      window.dispatchEvent(new CustomEvent('profile-update', {
        detail: {
          profile,
          source: SOURCE
        }
      }));
    }
    
    // Sync location data
    if (profile.location) {
      window.dispatchEvent(new CustomEvent('location-update', {
        detail: {
          location: profile.location,
          source: SOURCE
        }
      }));
    }
    
    // Sync goals
    if (profile.goals && profile.goals.length > 0) {
      window.dispatchEvent(new CustomEvent('goals-update', {
        detail: {
          goals: profile.goals,
          source: SOURCE
        }
      }));
    }
    
    // Mark that we've viewed onboarding (with _skipBroadcast flag to prevent loops)
    const updateProfile = useUserProfileStore.getState().updateProfile;
    updateProfile({ 
      hasViewedOnboarding: true,
      lastActive: new Date().toISOString(),
      _skipBroadcast: true
    });
  };
  
  // Compact view
  if (compact) {
    return (
      <div className="bg-black/50 rounded-xl p-4 border border-[#222] shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 ${completedCount === steps.length ? 'text-[#08c519]' : 'text-blue-400'}`} />
            <h3 className="font-bold text-sm">Onboarding Journey</h3>
          </div>
          <span className="text-sm font-medium">
            {completedCount}/{steps.length} completed
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-[#08c519]" 
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Next steps */}
        {completedCount < steps.length ? (
          <div className="space-y-2">
            {steps.filter(step => !step.completed).slice(0, 2).map(step => (
              <div key={step.id} className="flex items-center gap-2 text-sm">
                <CircleDashed className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{step.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <button 
            onClick={() => setShowVisualizer(false)}
            className="w-full py-1.5 rounded-lg bg-[#08c519]/20 hover:bg-[#08c519]/30 text-[#08c519] text-sm font-medium transition-colors"
          >
            Onboarding Complete!
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-black/50 rounded-xl p-6 border border-[#222] shadow-md relative overflow-hidden">
      {/* Data flow overlay layer */}
      <div className="absolute inset-0 pointer-events-none">
        {feedingData && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#08c519] z-10"
          />
        )}
      </div>
      
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#08c519]/30 to-blue-700/30 flex items-center justify-center">
            <CheckCircle2 className={`h-6 w-6 ${completedCount === steps.length ? 'text-[#08c519]' : 'text-blue-400'}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Your Onboarding Journey</h2>
            <p className="text-sm text-gray-400">
              {completedCount === steps.length 
                ? 'All steps completed!' 
                : `${completedCount} of ${steps.length} steps completed`}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={syncAllData}
            className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Sync All Data
          </button>
          {completedCount === steps.length && (
            <button 
              onClick={() => setShowVisualizer(false)}
              className="py-2 px-4 rounded-lg bg-[#08c519]/20 hover:bg-[#08c519]/30 text-[#08c519] text-sm font-medium transition-colors"
            >
              Hide Journey
            </button>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-[#08c519]" 
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Steps Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`border rounded-xl p-4 relative ${
              step.completed 
                ? 'bg-gradient-to-br from-[#08c519]/10 to-blue-700/10 border-[#08c519]/20' 
                : 'bg-[#111] border-[#222]'
            }`}
          >
            {/* Connection lines to show data flow */}
            {step.completed && step.feedsTo.map(dest => (
              <div key={`${step.id}-${dest}`} className="absolute">
                {/* This is where we visualize the connections */}
                {feedingData?.sourceId === step.id && feedingData?.destinationId === dest && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 100 }}
                    transition={{ duration: 1 }}
                    className="absolute h-0.5 bg-[#08c519] origin-left"
                    style={{
                      top: '50%',
                      left: '100%',
                      transformOrigin: 'left center'
                    }}
                  />
                )}
              </div>
            ))}
            
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed 
                  ? 'bg-[#08c519]/20 text-[#08c519]' 
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {step.icon}
              </div>
              <div>
                <h3 className={`font-bold ${step.completed ? 'text-white' : 'text-gray-400'}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{step.description}</p>
                
                {/* Integration status section */}
                <div className="text-xs space-y-1">
                  <p className="text-gray-400">Data feeds to:</p>
                  <div className="flex flex-wrap gap-1">
                    {step.feedsTo.map(feed => (
                      <span 
                        key={feed} 
                        className={`px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          step.completed 
                            ? 'bg-[#08c519]/10 text-[#08c519]' 
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {feed}
                        {step.completed && feedingData?.sourceId === step.id && feedingData?.destinationId === feed && (
                          <ArrowRight className="h-2.5 w-2.5 text-[#08c519] animate-pulse" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute top-3 right-3">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-[#08c519]" />
              ) : (
                <CircleDashed className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Completion message */}
      {completedCount === steps.length && (
        <div className="mt-6 bg-[#08c519]/20 border border-[#08c519]/30 rounded-xl p-4 text-center">
          <h3 className="text-lg font-bold text-[#08c519] mb-2">Onboarding Complete!</h3>
          <p className="text-gray-300">
            All your data is now synchronized across the entire Paddock20 platform.
            Your drive experience is fully integrated and personalized.
          </p>
        </div>
      )}
    </div>
  );
}