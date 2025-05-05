import { ReactNode, useEffect, useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Controls whether to bypass real authentication and use the mock user
// Set to true for development environments, false for production
// Changed to false to ensure proper authentication flow
const DEV_MODE = false;

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
    
    // Check user agreement status
    const checkOnboardingStatus = () => {
      setCheckingOnboarding(true);
      
      try {
        // Get user ID safely (we already checked auth.user is not null above)
        const userId = auth.user.id.toString();
        
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

  // If authenticated (either through real auth or DEV_MODE) and has completed onboarding, show the protected content
  if ((DEV_MODE || auth.user) && (DEV_MODE || hasCompletedOnboarding)) {
    return <>{children}</>;
  }

  // If not authenticated and not in DEV_MODE, redirect to the login page
  // Also add a timestamp parameter to break any potential client-side caching
  return <Redirect to={`/auth?t=${Date.now()}`} />;
}