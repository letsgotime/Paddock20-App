import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import ProtectedRoute from './ProtectedRoute';

// Import the homepage component
const Paddock20HomePage = React.lazy(() => import('../pages/paddock20-home-page'));

/**
 * Component to handle the root path routing logic
 * This determines whether to show the homepage or redirect to /the-paddock
 * based on environment and onboarding status
 */
const HomePageHandler: React.FC = () => {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // In deployment environments, redirect to beta welcome if onboarding is not complete
    const isDeployment = window.location.hostname.includes('replit.app');
    const onboardingCompleted = localStorage.getItem('paddock20_onboarding_completed') === 'true';
    
    // For deployments with incomplete onboarding, redirect to beta-welcome
    if (isDeployment && !onboardingCompleted) {
      console.log('HomePageHandler: Redirecting to /beta-welcome (onboarding not completed)');
      navigate('/beta-welcome');
    }
    // Otherwise stay on homepage (/)
  }, [navigate]);
  
  // Show the standard homepage while checking (or if not redirecting)
  return (
    <React.Suspense fallback={<div className="p-8 text-white">Loading homepage...</div>}>
      <ProtectedRoute bypassAuth={true}>
        <Paddock20HomePage />
      </ProtectedRoute>
    </React.Suspense>
  );
};

export default HomePageHandler;