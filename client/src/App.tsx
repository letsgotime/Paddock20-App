import PreDriveChecklistPage from './pages/PreDriveChecklistPage';
import React, { useEffect, useState } from 'react';
import { Route, Link, useLocation } from 'wouter';
import Header from './components/Header';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTitleManager from './components/PageTitleManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth0Callback from './components/Auth0Callback';
import LogoutPage from './pages/LogoutPage';
// Import disabled to remove Unsplash API warnings
// import { initializeImageCache } from "./services/unsplashService";
import NavigationControls from './components/NavigationControls';
import ContextualBreadcrumbs from './components/ContextualBreadcrumbs';
import { useScrollToTop } from './hooks/useScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Garage from "@/pages/Garage";
import Journal from "@/pages/Journal";
import Marketplace from "@/pages/Marketplace";
import Motorsports from "@/pages/Motorsports";
import Settings from "@/pages/Settings";
import Events from "./pages/Events";
import EventsPage from "./pages/EventsPage";
import MotorsportsEventsPage from "./pages/MotorsportsEventsPage";
import JuiceBox from "./pages/JuiceBox";
import GlossResetPage from "./pages/GlossResetPage";
import LoadoutsPage from "./pages/LoadoutsPage";
import GlossGrowthPage from "./pages/GlossGrowthPage";
import VideoLibraryPage from "./pages/VideoLibraryPage";
import BrokerPortalPage from "./pages/BrokerPortalPage";
import Weather from "./pages/Weather";
import WeatherPage from "./pages/WeatherPage";
import NewGTGWeatherPage from "./pages/NewGTGWeatherPage";
import RedlineReportPage from "./pages/RedlineReportPage";
import SeasonalChecklistPage from "./pages/SeasonalChecklistPage";
import EBooksPage from "./pages/eBooksPage";
import Paddock20HomePage from "./pages/Paddock20HomePage";
import ProductOrganizerPage from "./pages/ProductOrganizerPage"; 
import UserProfileHubPage from "./pages/UserProfileHubPage"; 
import GaragePage from "./pages/GaragePage"; 
import AddVehiclePage from "./pages/AddVehiclePage"; 
import FixedSoundBar from "./components/FixedSoundBar";
import Footer from "./components/Footer";
import { WeatherProvider } from "./contexts/ConsolidatedWeatherContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { RewardsProvider } from "./contexts/RewardsContext";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import SpotifyCallbackPage from "./pages/SpotifyCallbackPage";
import { VehicleProvider } from "./contexts/VehicleContext";
import { VehicleDataProvider } from "./contexts/VehicleDataContext";
import { SoundProvider } from "./contexts/SoundContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import SoundControlPanel from "./components/SoundControlPanel";
import RewardNotification from "./components/RewardNotification";
import RewardsTracker from "./components/RewardsTracker";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import GarageVaultPage from "./pages/GarageVaultPage";
import GoTimeGarageVault from "./pages/GoTimeGarageVault";
import VehicleModsPage from "./pages/VehicleModsPage";
import MembershipPage from "./pages/MembershipPage";
import TiresTimepieces from "./pages/TiresTimepieces";
import ManifestationStationPage from "./pages/ManifestationStationPage";
import ModPlannerPage from "./pages/ModPlannerPage";
import ConciergePage from "./pages/ConciergePage";
import HustlePlannerPage from "./pages/HustlePlannerPage";
import RoutePlannerPage from "./pages/RoutePlannerPage";
import DriveJournalPage from "./pages/DriveJournalPage";
import DiscountsPage from "./pages/DiscountsPage";
import ContactPage from "./pages/ContactPage";
import ChatFeedPage from "./pages/ChatFeedPage";
import ShareDemoPage from "./pages/ShareDemoPage";
import MoodEnergyTrackerPage from "./pages/MoodEnergyTrackerPage";
import MotorsportsGalleryPage from "./pages/MotorsportsGalleryPage";
import PodiumPursuitPage from "./pages/PodiumPursuitPage";
import SoundLibraryPage from "./pages/SoundLibraryPage";
import SpotifyTestPage from "./pages/SpotifyTestPage";
import SpotifyEnvCheck from "./pages/SpotifyEnvCheck";
import OnboardingTestPage from "./pages/OnboardingTestPage";
import SupportChatbot from "./components/SupportChatbot";
import HomePage from "./pages/Home";
import OneTapWeatherSnapshot from "./components/OneTapWeatherSnapshot";
import UserOnboarding from "./components/UserOnboarding";
// Auth Provider is imported in main.tsx
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';
import './paddock20.css';
import { getUserDisplayName } from './utils/DataIntegrityVerifier';
import DebugPage from "./pages/DebugPage";

// Import legal pages
import PrivacyPolicy from './pages/PrivacyPolicyPage';
import TermsOfService from './pages/TermsOfServicePage';
import BetaAgreement from './pages/BetaAgreement';
import EmailVerifiedPage from './pages/EmailVerifiedPage';
import AdminPage from './pages/AdminPage';
// BetaEnrollmentPage removed as not needed

// Create an AuthenticatedApp component to handle auth-dependent UI
function AuthenticatedContent({ 
  hasCompletedOnboarding, 
  setHasCompletedOnboarding 
}: { 
  hasCompletedOnboarding: boolean, 
  setHasCompletedOnboarding: (value: boolean) => void 
}) {
  // Access auth state using the useAuth hook since we're inside the AuthProvider
  const { user, loading, isAuthenticated } = useAuth(); // isAuthenticated computed in useAuth hook
  
  // Get current location for routing
  const [location] = useLocation();
  
  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="p-8 text-center">
          <div className="w-16 h-16 border-t-2 border-carolina-blue border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-carolina-blue">Loading Paddock20...</p>
        </div>
      </div>
    );
  }
  
  // Show user onboarding if authenticated and hasn't completed onboarding
  if (isAuthenticated && !hasCompletedOnboarding && user?.id) {
    return (
      <UserOnboarding 
        onComplete={() => {
          // Mark onboarding as complete in localStorage
          const betaOnboardingKey = `paddock20_beta_onboarding_complete_${user.id}`;
          localStorage.setItem(betaOnboardingKey, 'true');
          
          // Update state
          setHasCompletedOnboarding(true);
        }} 
      />
    );
  }

  return (
    <>
      {/* Skip link for keyboard navigation */}
      <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
        Skip to main content
      </a>
    
      {/* Components that depend on auth state would check that here */}
      <div className="min-h-screen bg-black font-openSans text-white">
        {/* Authentication Header - always visible */}
        <Header />
      
        {/* Main navigation header */}
        <header role="banner">
          {/* Breadcrumbs - only visible when logged in */}
          {isAuthenticated && <ContextualBreadcrumbs />}
        </header>
        
        {/* GoTime Motorsports logo with navigation and sound controls - always fixed to bottom */}
        <FixedSoundBar />
        
        {/* AI Support Chatbot - Available globally when authenticated */}
        {isAuthenticated && <SupportChatbot />}

        {/* Main content area - adjusted for fixed header at top and fixed footer at bottom */}
        <main id={MAIN_CONTENT_ID} className="container mx-auto px-4 mt-[60px] pb-[70px]" tabIndex={-1}>
          {/* Toast notifications with ARIA live region built in */}
          <Toaster />
          
          {/* Global floating weather snapshot - only when authenticated */}
          {isAuthenticated && (
            <OneTapWeatherSnapshot 
              floating={true}
              // Don't show on weather paddock page where it would be redundant
              className={location === '/weather-paddock' ? 'hidden' : ''}
            />
          )}
            
          {/* Routes defined here */}
          {/* Legal Document Pages - Publicly accessible */}
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/beta-agreement" component={BetaAgreement} />
          <Route path="/email-verified" component={EmailVerifiedPage} />
          
          {/* Auth0 callback route - Handles redirection after Auth0 authentication */}
          <Route path="/auth/callback" component={Auth0Callback} />
          
          {/* Spotify callback route - Handles redirection after Spotify authentication */}
          <Route path="/spotify/callback" component={SpotifyCallbackPage} />
          
          {/* Logout Page - Handles secure logout process */}
          <Route path="/logout" component={LogoutPage} />
          
          {/* Beta Enrollment Page - Removed as not needed */}
          
          {/* User Onboarding - Explicit URL path that redirects to the proper flow */}
          <Route 
            path="/onboarding" 
            component={() => {
              // Check if user is authenticated
              if (isAuthenticated && user?.id) {
                // Update local storage directly - this will trigger the onboarding flow
                // in the AuthenticatedContent component on next render
                const betaOnboardingKey = `paddock20_beta_onboarding_complete_${user.id}`;
                localStorage.removeItem(betaOnboardingKey);
                
                // Redirect to home, which will then show the onboarding
                window.location.href = '/';
                return <div className="p-8 text-white">Redirecting to onboarding...</div>;
              } else {
                // Not authenticated, redirect to auth page
                window.location.href = '/auth';
                return <div className="p-8 text-white">Please log in to continue onboarding...</div>;
              }
            }} 
          />
        
          {/* Simplified routes for authentication testing */}
          <Route path="/" component={() => <ProtectedRoute><Paddock20HomePage /></ProtectedRoute>} />
          <Route path="/dashboard" component={() => <ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" component={() => <ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/spotify-test" component={() => <ProtectedRoute><SpotifyTestPage /></ProtectedRoute>} />
          <Route path="/spotify-env-check" component={() => <ProtectedRoute><SpotifyEnvCheck /></ProtectedRoute>} />
          <Route path="/onboarding-test" component={() => <ProtectedRoute><OnboardingTestPage /></ProtectedRoute>} />
          
          {/* Debug Pages */}
          <Route path="/debug" component={() => {
            const SimpleDebug = React.lazy(() => import('./pages/SimpleDebug'));
            return (
              <React.Suspense fallback={<div className="p-8 text-white">Loading debug page...</div>}>
                <SimpleDebug />
              </React.Suspense>
            );
          }} />
          
          <Route path="*" component={NotFound} />
          
          {/* Rewards notification - only shown when authenticated */}
          {isAuthenticated && <RewardNotification />}
          
          {/* Invisible rewards tracker component - only active when authenticated */}
          {isAuthenticated && <RewardsTracker />}
        </main>

        {/* Footer with links and information */}
        <Footer />
      </div>
    </>
  );
}

function App() {
  // State to track if the user has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  
  // Check for onboarding status when app initializes - this will be updated once auth is ready
  useEffect(() => {
    // Get user profile from local storage
    const userProfileStr = localStorage.getItem('userProfile');
    
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        const userId = userProfile.id;
        
        if (userId) {
          // Check if this user has completed onboarding
          const betaOnboardingKey = `paddock20_beta_onboarding_complete_${userId}`;
          const hasCompleted = localStorage.getItem(betaOnboardingKey) === 'true';
          
          // Also check for legal agreements
          const legalAgreementsKey = `paddock20_legal_agreements_${userId}`;
          const legalAgreements = localStorage.getItem(legalAgreementsKey);
          
          let hasAcceptedAgreements = false;
          if (legalAgreements) {
            try {
              const agreements = JSON.parse(legalAgreements);
              // Check version to ensure users re-agree when terms change
              hasAcceptedAgreements = agreements.accepted && agreements.version === '1.0';
            } catch (e) {
              console.error('Error parsing legal agreements:', e);
            }
          }
          
          // Both onboarding and legal agreements must be completed
          setHasCompletedOnboarding(hasCompleted && hasAcceptedAgreements);
        }
      } catch (e) {
        console.error('Error checking onboarding status:', e);
      }
    }
  }, []);
  
  // Use the scroll-to-top hook to ensure pages always start at the top
  useScrollToTop();
  
  // Authentication state is now managed through AuthContext with Auth0
  
  // Function to mark onboarding as complete
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  // Create a global screen reader notification system
  useEffect(() => {
    // Create a live region for screen reader announcements
    const announcer = new LiveRegion('polite');
    
    // Clean up when component unmounts
    return () => {
      announcer.remove();
    };
  }, []);
  
  // Handle return from external navigation apps
  useEffect(() => {
    // Check if we have a saved return point from navigation
    const returnPoint = sessionStorage.getItem('weatherAppReturnPoint');
    if (returnPoint) {
      // Clear the return point from storage
      sessionStorage.removeItem('weatherAppReturnPoint');
      
      // Navigate to the saved path if it's different from current path
      if (window.location.pathname !== returnPoint) {
        window.history.pushState(null, '', returnPoint);
      }
    }
    
    // Listen for custom route change events from the FixedSoundBar
    const handleRouteChange = (event: CustomEvent) => {
      try {
        const { path } = event.detail;
        if (path && window.location.pathname !== path) {
          // Navigate to the path using React Router programmatically
          window.history.pushState(null, '', path);
          // Dispatch a popstate event to trigger React Router navigation
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } catch (error) {
        console.error('Error handling route change:', error);
      }
    };
    
    // Add event listener
    window.addEventListener('routeChange', handleRouteChange as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('routeChange', handleRouteChange as EventListener);
    };
  }, []);
  
  // Authentication status is now handled by AuthContext from Auth0
  // This redundant effect has been removed to prevent conflicts
  
  // Check if the current path is /auth
  const [location] = useLocation();
  const isAuthPage = location === '/auth';
  
  // If we're on the auth page, render only the AuthPage component
  if (isAuthPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  
  // Otherwise, render the full application
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Page Title Manager - Updates browser tab title based on current route */}
        <PageTitleManager />
        
        {/* Auth Provider - Provides authentication context to all components */}
        <AuthProvider>
            {/* User Profile Provider - centralized user data warehouse */}
            <UserProfileProvider>
              {/* Sound Provider - Provides F1-inspired sound effects throughout the app */}
              <SoundProvider>
                {/* Vehicle Provider - Provides vehicle data to all components */}
                <VehicleProvider>
                  {/* Vehicle Data Provider - Provides comprehensive vehicle activity, media, and document data */}
                  <VehicleDataProvider>
                    {/* Centralized Weather Provider - Provides weather data to all components */}
                    <WeatherProvider>
                      {/* Gallery Provider - For media management */}
                      <GalleryProvider>
                        {/* Rewards Provider - for site-wide gamification */}
                        <RewardsProvider>
                          {/* Spotify Provider - for Spotify integration */}
                          <SpotifyProvider>
                            {/* Use the AuthenticatedContent component to handle all auth-dependent UI */}
                            <AuthenticatedContent 
                              hasCompletedOnboarding={hasCompletedOnboarding}
                              setHasCompletedOnboarding={setHasCompletedOnboarding}
                            />
                          </SpotifyProvider>
                        </RewardsProvider>
                      </GalleryProvider>
                    </WeatherProvider>
                  </VehicleDataProvider>
                </VehicleProvider>
              </SoundProvider>
            </UserProfileProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
  );
}

export default App;