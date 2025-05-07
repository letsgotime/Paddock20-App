import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  getUserProfileFromLocalStorage, 
  markOnboardingComplete, 
  hasCompletedOnboarding
} from '@/utils/authFlowUtils';
import UserOnboarding from '@/components/UserOnboarding';

export default function OnboardingPage() {
  const { isAuthenticated, user } = useNativeAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    // Get current user ID
    const userProfile = getUserProfileFromLocalStorage() || user;
    
    // If user has already completed onboarding, redirect to dashboard
    if (userProfile && userProfile.id && hasCompletedOnboarding(userProfile.id.toString())) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, user]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setLoading(true);
    
    try {
      // Get the current user ID to mark onboarding as complete
      const userProfile = getUserProfileFromLocalStorage() || user;
      
      if (userProfile && userProfile.id) {
        // Use our utility to mark onboarding as complete
        markOnboardingComplete(userProfile.id.toString());
        
        // Show success toast
        toast({
          title: "Onboarding Complete",
          description: "Welcome to Paddock20! Your account is ready to use.",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        console.error('Failed to get user profile for completing onboarding');
        
        // Show error toast
        toast({
          title: "Error",
          description: "Could not complete onboarding. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "An error occurred while completing onboarding.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {isAuthenticated && (
        <UserOnboarding 
          onComplete={handleOnboardingComplete} 
          user={user || getUserProfileFromLocalStorage()}
        />
      )}
    </div>
  );
}