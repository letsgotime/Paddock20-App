/**
 * ⚠️ BETA FILE PROTECTION ⚠️
 * 
 * WARNING: This file is part of the Beta Program core implementation.
 * DO NOT MODIFY this file without proper authorization.
 * Any unauthorized changes may break the beta enrollment process.
 * 
 * Last verified: May 07, 2025
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import userProfileWarehouse from '@/services/UserProfileWarehouse';
import { CarFront, User, Target, Palette, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';

const steps = ['intro', 'vehicle', 'goals', 'theme', 'complete'] as const;
type Step = typeof steps[number];

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ isOpen = true, onClose }: OnboardingModalProps) {
  const { user } = useAuth();
  const { setOnboardingComplete } = useOnboarding();
  const [step, setStep] = useState<Step>('intro');
  const [formData, setFormData] = useState({
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      nickname: '',
      color: '',
    },
    goals: {
      drivingGoals: '',
      interests: [] as string[],
    },
    theme: 'carbon',
    region: {
      name: '',
      lat: 0,
      lon: 0,
    }
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill any existing data from userProfileWarehouse
  useEffect(() => {
    const profile = userProfileWarehouse.getProfile();
    if (profile) {
      // Get first vehicle if it exists
      const vehicle = profile.vehicles && profile.vehicles.length > 0 ? profile.vehicles[0] : null;
      
      if (vehicle) {
        setFormData(prev => ({
          ...prev,
          vehicle: {
            make: vehicle.make || '',
            model: vehicle.model || '',
            year: vehicle.year?.toString() || new Date().getFullYear().toString(),
            nickname: vehicle.nickname || '',
            color: vehicle.color || '',
          }
        }));
      }
      
      // Get preferences
      const preferences = profile.preferences;
      if (preferences) {
        // Map UI theme based on preferences.theme
        let uiTheme = 'carbon';
        if (preferences.theme === 'dark') uiTheme = 'carbon';
        else if (preferences.theme === 'light') uiTheme = 'light';
        
        // Driving interests can be stored in a custom field, use empty array as default
        const drivingInterests = preferences.customFields?.drivingInterests || [];
        
        setFormData(prev => ({
          ...prev,
          theme: uiTheme,
          goals: {
            ...prev.goals,
            interests: drivingInterests,
          }
        }));
      }
      
      // Get location
      const weatherPrefs = preferences?.weatherPreferences;
      if (weatherPrefs && weatherPrefs.defaultLocation) {
        setFormData(prev => ({
          ...prev,
          region: {
            name: weatherPrefs.defaultLocation.name || '',
            lat: weatherPrefs.defaultLocation.lat || 0,
            lon: weatherPrefs.defaultLocation.lon || 0,
          }
        }));
      }
    }
  }, []);

  if (!isOpen) return null;

  const updateProfile = async (data: any) => {
    setIsLoading(true);
    try {
      // Update warehouse
      if (data.vehicle) {
        // Check if we need to add a new vehicle or update existing
        const profile = userProfileWarehouse.getProfile();
        const vehicles = profile?.vehicles || [];
        
        if (vehicles.length === 0) {
          // Add new vehicle
          const vehicleData = {
            id: Date.now().toString(),
            make: data.vehicle.make,
            model: data.vehicle.model,
            year: parseInt(data.vehicle.year),
            nickname: data.vehicle.nickname || `${data.vehicle.make} ${data.vehicle.model}`,
            // Add vehicle metadata to store color since it's not in the VehicleReference interface
            metadata: {
              color: data.vehicle.color || 'Unknown'
            },
            status: 'active' as const
          };
          
          userProfileWarehouse.addVehicleReference(vehicleData);
        } else {
          // Update first vehicle
          userProfileWarehouse.updateVehicleReference(vehicles[0].id, {
            make: data.vehicle.make,
            model: data.vehicle.model,
            year: parseInt(data.vehicle.year),
            nickname: data.vehicle.nickname
          });
        }
      }
      
      if (data.goals) {
        // Add to goals collection instead of preferences
        userProfileWarehouse.addGoal({
          id: Date.now().toString(),
          type: 'experience',
          description: data.goals.drivingGoals,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
          createdAt: new Date().toISOString().split('T')[0],
          status: 'pending',
          priority: 'medium',
          category: 'driving',
          steps: data.goals.interests.map((interest: string) => ({
            id: `step-${interest}`,
            title: interest,
            completed: false
          }))
        });
      }
      
      if (data.theme) {
        // Update UI preferences
        userProfileWarehouse.updatePreferences({
          theme: data.theme === 'carbon' ? 'dark' : 'light',
          colorAccent: data.theme === 'neon' ? '#ff00ff' : 
                      data.theme === 'track' ? '#ff3300' : '#1982FC',
          notifications: true, // Default to enabled
          customFields: {
            drivingInterests: data.goals?.interests || []
          }
        });
      }
      
      if (data.region) {
        // Use updateWeatherPreferences which handles proper structure
        userProfileWarehouse.updateWeatherPreferences({
          defaultLocation: {
            name: data.region.name,
            lat: data.region.lat,
            lon: data.region.lon
          },
          units: 'imperial' // Default to imperial units
        });
      }
      
      if (data.onboarding_complete) {
        userProfileWarehouse.updateIdentity({
          onboardingCompleted: true
        });
      }
      
      // Also update server if user is logged in
      if (user?.id) {
        await fetch(`/api/user-profile/${user.id}/onboarding`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: step,
            data: data,
            completed: step === 'complete'
          }),
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (step === 'vehicle') {
      if (!formData.vehicle.make || !formData.vehicle.model) {
        toast({
          title: 'Missing Information',
          description: 'Please provide at least the make and model of your vehicle.',
          variant: 'destructive',
        });
        return;
      }
      await updateProfile({ vehicle: formData.vehicle });
    }
    
    if (step === 'goals') {
      await updateProfile({ goals: formData.goals });
    }
    
    if (step === 'theme') {
      await updateProfile({ theme: formData.theme });
    }
    
    if (step === 'complete') {
      await updateProfile({ onboarding_complete: true });
      
      // Update onboarding context
      setOnboardingComplete(true);
      
      toast({
        title: 'Setup Complete',
        description: 'Welcome to The Paddock! Your profile is ready.',
      });
      
      // Close the modal if callback provided
      if (onClose) onClose();
      
      // Navigate to the paddock
      setTimeout(() => {
        navigate('/the-paddock');
      }, 1000);
      
      return;
    }

    // Move to next step
    const currentIndex = steps.indexOf(step);
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  // Get step icon
  const getStepIcon = () => {
    switch (step) {
      case 'intro': return <User className="h-8 w-8 text-[#1982FC]" />;
      case 'vehicle': return <CarFront className="h-8 w-8 text-[#1982FC]" />;
      case 'goals': return <Target className="h-8 w-8 text-[#1982FC]" />;
      case 'theme': return <Palette className="h-8 w-8 text-[#1982FC]" />;
      case 'complete': return <CheckCircle className="h-8 w-8 text-[#08c519]" />;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <h2 className="text-2xl font-orbitron text-[#1982FC]">Welcome to PADDOCK20!</h2>
            </div>
            <p className="text-gray-200">
              Let's get you set up with a personalized experience. We'll guide you through a few quick steps to configure your profile.
            </p>
            <div className="p-4 border border-[#1982FC]/30 rounded-md bg-black/40">
              <h3 className="text-[#1982FC] font-medium mb-2">What's Included in Setup:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <CarFront className="h-4 w-4 text-[#08c519]" />
                  <span>Your vehicle information</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#08c519]" />
                  <span>Driving goals and interests</span>
                </li>
                <li className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#08c519]" />
                  <span>UI theme preferences</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'vehicle':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <h2 className="text-2xl font-orbitron text-[#1982FC]">Your Vehicle</h2>
            </div>
            <p className="text-gray-200 mb-4">
              Tell us about your primary vehicle to unlock personalized features.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-gray-200">Make</Label>
                <Input
                  id="make"
                  value={formData.vehicle.make}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vehicle: { ...formData.vehicle, make: e.target.value } 
                  })}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Toyota"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model" className="text-gray-200">Model</Label>
                <Input
                  id="model"
                  value={formData.vehicle.model}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vehicle: { ...formData.vehicle, model: e.target.value } 
                  })}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Supra"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-gray-200">Year</Label>
                <Input
                  id="year"
                  value={formData.vehicle.year}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vehicle: { ...formData.vehicle, year: e.target.value } 
                  })}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. 2023"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color" className="text-gray-200">Color</Label>
                <Input
                  id="color"
                  value={formData.vehicle.color}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vehicle: { ...formData.vehicle, color: e.target.value } 
                  })}
                  className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                  placeholder="e.g. Nitro Yellow"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-gray-200">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={formData.vehicle.nickname}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  vehicle: { ...formData.vehicle, nickname: e.target.value } 
                })}
                className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white"
                placeholder="e.g. The Beast"
              />
            </div>
          </div>
        );
        
      case 'goals':
        const interests = [
          { id: 'track', label: 'Track Days' },
          { id: 'autocross', label: 'Autocross' },
          { id: 'rally', label: 'Rally' },
          { id: 'drift', label: 'Drifting' },
          { id: 'drag', label: 'Drag Racing' },
          { id: 'offroad', label: 'Off-Roading' },
          { id: 'restoration', label: 'Restoration' },
          { id: 'detailing', label: 'Detailing' },
          { id: 'modification', label: 'Modifications' },
          { id: 'shows', label: 'Car Shows' }
        ];
        
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <h2 className="text-2xl font-orbitron text-[#1982FC]">Driving Goals</h2>
            </div>
            <p className="text-gray-200 mb-4">
              Tell us about your automotive interests and goals.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="drivingGoals" className="text-gray-200">Driving Goals or Habits</Label>
              <Textarea
                id="drivingGoals"
                value={formData.goals.drivingGoals}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  goals: { ...formData.goals, drivingGoals: e.target.value } 
                })}
                className="bg-gray-800 border-gray-700 focus:border-[#1982FC] text-white min-h-[100px]"
                placeholder="What do you want to achieve with your driving? (e.g. Improve track times, learn drifting, etc.)"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-200">Automotive Interests (select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => (
                  <div 
                    key={interest.id}
                    className={`
                      p-2 border rounded-md cursor-pointer transition-colors
                      ${formData.goals.interests.includes(interest.id) 
                        ? 'border-[#08c519] bg-[#08c519]/20 text-white' 
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-[#1982FC]'}
                    `}
                    onClick={() => {
                      const newInterests = formData.goals.interests.includes(interest.id)
                        ? formData.goals.interests.filter(i => i !== interest.id)
                        : [...formData.goals.interests, interest.id];
                        
                      setFormData({
                        ...formData,
                        goals: { ...formData.goals, interests: newInterests }
                      });
                    }}
                  >
                    {interest.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'theme':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <h2 className="text-2xl font-orbitron text-[#1982FC]">UI Preferences</h2>
            </div>
            <p className="text-gray-200 mb-4">
              Select your preferred interface theme for The Paddock.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-gray-200">Garage Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) => setFormData({ ...formData, theme: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="carbon">Carbon Fiber (Default)</SelectItem>
                  <SelectItem value="neon">Neon Lights</SelectItem>
                  <SelectItem value="track">Track Mode</SelectItem>
                  <SelectItem value="classic">Classic Racing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`
                  aspect-video rounded-md p-3 cursor-pointer border-2 transition-all
                  ${formData.theme === 'carbon' ? 'border-[#08c519]' : 'border-transparent'}
                `}
                style={{ background: 'linear-gradient(45deg, #111, #222)' }}
                onClick={() => setFormData({ ...formData, theme: 'carbon' })}
              >
                <div className="h-full rounded flex items-center justify-center">
                  <span className="text-white font-medium">Carbon Fiber</span>
                </div>
              </div>
              
              <div 
                className={`
                  aspect-video rounded-md p-3 cursor-pointer border-2 transition-all
                  ${formData.theme === 'neon' ? 'border-[#08c519]' : 'border-transparent'}
                `}
                style={{ background: 'linear-gradient(45deg, #111, #1f0033)' }}
                onClick={() => setFormData({ ...formData, theme: 'neon' })}
              >
                <div className="h-full rounded flex items-center justify-center">
                  <span className="text-[#ff00ff] font-medium">Neon Lights</span>
                </div>
              </div>
              
              <div 
                className={`
                  aspect-video rounded-md p-3 cursor-pointer border-2 transition-all
                  ${formData.theme === 'track' ? 'border-[#08c519]' : 'border-transparent'}
                `}
                style={{ background: 'linear-gradient(45deg, #111, #330000)' }}
                onClick={() => setFormData({ ...formData, theme: 'track' })}
              >
                <div className="h-full rounded flex items-center justify-center">
                  <span className="text-[#ff3300] font-medium">Track Mode</span>
                </div>
              </div>
              
              <div 
                className={`
                  aspect-video rounded-md p-3 cursor-pointer border-2 transition-all
                  ${formData.theme === 'classic' ? 'border-[#08c519]' : 'border-transparent'}
                `}
                style={{ background: 'linear-gradient(45deg, #222, #333)' }}
                onClick={() => setFormData({ ...formData, theme: 'classic' })}
              >
                <div className="h-full rounded flex items-center justify-center">
                  <span className="text-white font-medium">Classic Racing</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-[#08c519]" />
              <h2 className="text-2xl font-orbitron text-[#1982FC]">Setup Complete!</h2>
            </div>
            <p className="text-gray-200">
              Your Paddock20 profile is ready. You now have access to all the features designed for your automotive lifestyle.
            </p>
            <div className="p-4 border border-[#08c519]/30 rounded-md bg-black/40 text-left">
              <h3 className="text-[#08c519] font-medium mb-2">What's Next:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#08c519] mt-0.5" />
                  <span>Explore your personalized dashboard with real-time driving conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#08c519] mt-0.5" />
                  <span>Track your vehicle maintenance and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#08c519] mt-0.5" />
                  <span>Connect with the Paddock20 community</span>
                </li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gradient-to-b from-gray-900 to-black border border-[#1982FC]/40 rounded-lg max-w-2xl w-full p-6 relative shadow-xl">
        <div className="mb-6">
          {/* Progress indicator */}
          <div className="flex justify-between mb-2">
            {steps.map((s, i) => (
              <div 
                key={s}
                className={`
                  w-full h-1 mx-1 rounded-full transition-colors
                  ${steps.indexOf(step) >= i ? 'bg-[#1982FC]' : 'bg-gray-700'}
                `}
              />
            ))}
          </div>
        </div>
        
        <div className="min-h-[320px]">
          {renderStep()}
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button
            className={`
              ${step === 'complete' ? 'bg-[#08c519] hover:bg-[#06a015]' : 'bg-[#1982FC] hover:bg-[#1672e0]'}
            `}
            disabled={isLoading}
            onClick={handleNext}
          >
            {isLoading ? 'Processing...' : (
              <span className="flex items-center gap-2">
                {step === 'complete' ? 'Launch The Paddock' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}