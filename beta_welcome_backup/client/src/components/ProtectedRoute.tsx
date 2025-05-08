import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location] = useLocation();
  // Use the useAuth hook which provides a unified interface to authentication
  const auth = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState<boolean>(true);
  
  // Check if the user has completed the beta onboarding process
  useEffect(() => {
    // Only check onboarding status if we have an authenticated user
    if (!auth.user) {
      setCheckingOnboarding(false);
      return;
    }
    
    // At this point we know auth.user is not null
    const user = auth.user; // Create a local variable to satisfy TypeScript
    
    // Check user agreement status
    const checkOnboardingStatus = () => {
      setCheckingOnboarding(true);
      
      try {
        // Check if onboarding was just completed (special case)
        const justCompletedOnboarding = localStorage.getItem('paddock20_onboarding_just_completed') === 'true';
        
        if (justCompletedOnboarding) {
          console.log('Onboarding was just completed - bypassing checks');
          // Clear the flag so it's only used once
          localStorage.removeItem('paddock20_onboarding_just_completed');
          // Allow user to continue to protected route
          setHasCompletedOnboarding(true);
          return;
        }
        
        // Get user ID safely
        const userId = user.id.toString();
        
        // First check if user has completed beta onboarding
        const betaOnboardingKey = `paddock20_beta_onboarding_complete_${userId}`;
        const hasCompletedBetaOnboarding = localStorage.getItem(betaOnboardingKey) === 'true';
        
        // Then check if user has agreed to legal terms
        const legalAgreementsKey = `paddock20_legal_agreements_${userId}`;
        const legalAgreements = localStorage.getItem(legalAgreementsKey);
        const hasAgreedToTerms = legalAgreements ? JSON.parse(legalAgreements).accepted : false;
        
        // Both must be complete to proceed
        const onboardingComplete = hasCompletedBetaOnboarding && hasAgreedToTerms;
        setHasCompletedOnboarding(onboardingComplete);
        
        console.log('Onboarding status check:', { 
          userId,
          hasCompletedBetaOnboarding,
          hasAgreedToTerms,
          onboardingComplete
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If any error occurs, force user through onboarding again
        setHasCompletedOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, [auth.user]);
  
  console.log('ProtectedRoute checking auth status:', { 
    loading: auth.loading, 
    checkingOnboarding,
    user: auth.user ? 'authenticated' : 'not authenticated',
    hasCompletedOnboarding,
    currentPath: location
  });
  
  // Show loading state while checking authentication
  if (auth.loading || (auth.user && checkingOnboarding)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-300">
            {auth.loading ? "Verifying authentication..." : "Checking onboarding status..."}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated but hasn't completed onboarding, redirect to onboarding
  if (auth.user && hasCompletedOnboarding === false) {
    return <Redirect to="/onboarding" />;
  }

  // If authenticated and has completed onboarding, show the protected content
  if (auth.user && hasCompletedOnboarding) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to the login page
  // Also add a timestamp parameter to break any potential client-side caching
  return <Redirect to={`/auth?t=${Date.now()}`} />;
}