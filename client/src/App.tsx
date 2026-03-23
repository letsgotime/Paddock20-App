import PreDriveChecklistPage from './pages/pre-drive-checklist-page';
import React, { useEffect, useState } from 'react';
import { Route, Link, useLocation, Router } from 'wouter';
import Header from './components/Header';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageTitleManager from './components/PageTitleManager';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth0Callback from './components/Auth0Callback';
import EnhancedLogoutPage from './pages/enhanced-logout-page';
// Import disabled to remove Unsplash API warnings
// import { initializeImageCache } from "./services/unsplashService";
import NavigationControls from './components/NavigationControls';
import ContextualBreadcrumbs from './components/ContextualBreadcrumbs';
import { useScrollToTop } from './hooks/useScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from "./pages/not-found";
import Journal from "./pages/journal-page";
import Marketplace from "./pages/marketplace-page";
import Motorsports from "./pages/motorsports-page";
import Settings from "./pages/settings-page";
import EventsPage from "./pages/events-page";
import MotorsportsEventsPage from "./pages/motorsports-events-page";
import JuiceBox from "./pages/juice-box";
import GlossResetPage from "./pages/gloss-reset-page";
import LoadoutsPage from "./pages/loadouts-page";
import GlossGrowthPage from "./pages/gloss-growth-page";
import VideoLibraryPage from "./pages/video-library-page";
import BrokerPortalPage from "./pages/broker-portal-page";
import WeatherPage from "./pages/weather-page";
import WeatherPaddockPage from "./pages/weather-paddock-page";
import NewGTGWeatherPage from "./pages/new-gtgweather-page";
import RedlineReportPage from "./pages/redline-report-page";
import SeasonalChecklistPage from "./pages/seasonal-checklist-page";
import EbooksPage from "./pages/ebooks-page";
import Paddock20HomePage from "./pages/paddock20-home-page";
import ProductOrganizerPage from "./pages/product-organizer-page"; 
import UserProfileHubPage from "./pages/user-profile-hub-page"; 
import GaragePage from "./pages/garage-page"; 
import AddVehiclePage from "./pages/add-vehicle-page"; 
import FixedSoundBar from "./components/FixedSoundBar";
import Footer from "./components/Footer";
import { WeatherProvider } from "./contexts/ConsolidatedWeatherContext";
import { LocationServicesProvider } from "./contexts/LocationServicesContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { RewardsProvider } from "./contexts/RewardsContext";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import SpotifyCallbackPage from "./pages/spotify-callback-page";
import { VehicleProvider } from "./contexts/VehicleContext";
import { VehicleDataProvider } from "./contexts/VehicleDataContext";
import { SoundProvider } from "./contexts/SoundContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import SoundControlPanel from "./components/SoundControlPanel";
import RewardNotification from "./components/RewardNotification";
import RewardsTracker from "./components/RewardsTracker";
import AuthPage from "./pages/auth-page";
import DemoMode from "./pages/demo-mode";
import ThePaddockPage from "./pages/the-paddock-page";
// The following pages will be replaced by ThePaddockPage
// import DashboardPage from "./pages/dashboard-page";
// import PersonalizedDashboard from "./pages/personalized-dashboard";
// import UserProfileHubPage from "./pages/user-profile-hub-page";
// import GarageVaultPage from "./pages/garage-vault-page";
import GoTimeGarageVault from "./pages/go-time-garage-vault";
import VehicleModsPage from "./pages/vehicle-mods-page";
import MembershipPage from "./pages/membership-page";
import TiresTimepieces from "./pages/tires-timepieces";
import ManifestationStationPage from "./pages/manifestation-station-page";
import ModPlannerPage from "./pages/mod-planner-page";
import ConciergePage from "./pages/concierge-page";
import HustlePlannerPage from "./pages/hustle-planner-page";
import RoutePlannerPage from "./pages/route-planner-page";
import DriveJournalPage from "./pages/drive-journal-page";
import DiscountsPage from "./pages/discounts-page";
import ContactPage from "./pages/contact-page";
import ChatFeedPage from "./pages/chat-feed-page";
import ShareDemoPage from "./pages/share-demo-page";
import MoodEnergyTrackerPage from "./pages/mood-energy-tracker-page";
import MotorsportsGalleryPage from "./pages/motorsports-gallery-page";
import PodiumPursuitPage from "./pages/podium-pursuit-page";
import SoundLibraryPage from "./pages/sound-library-page";
import SpotifyTestPage from "./pages/spotify-test-page";
import SpotifyEnvCheck from "./pages/spotify-env-check";
import OnboardingTestPage from "./pages/onboarding-test-page";
import SupportChatbot from "./components/SupportChatbot";
import HomePage from "./pages/home-page";
import OneTapWeatherSnapshot from "./components/OneTapWeatherSnapshot";
import UserOnboarding from "./components/UserOnboarding";
// Auth Provider is imported in main.tsx
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';
import './paddock20.css';
import { getUserDisplayName } from './utils/DataIntegrityVerifier';
import DebugPage from "./pages/debug-page";

// Import legal pages
import PrivacyPolicy from './pages/privacy-policy-page';
import TermsOfService from './pages/terms-of-service-page';
import BetaAgreement from './pages/beta-agreement';
import EmailVerifiedPage from './pages/email-verified-page';
import AdminPage from './pages/admin-page';
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
          
          // Redirect to The Paddock after completing onboarding
          window.location.href = '/the-paddock';
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
          
          {/* Demo Mode route - Direct entry point that bypasses Auth0 completely */}
          <Route path="/demo-mode" component={() => <DemoMode />} />
          
          {/* Spotify callback route - Handles redirection after Spotify authentication */}
          <Route path="/spotify/callback" component={SpotifyCallbackPage} />
          
          {/* Logout Page - Handles secure logout process */}
          <Route path="/logout" component={EnhancedLogoutPage} />
          
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
        
          {/* Core Routes - Memoized to prevent recreation of components on every render */}
          <Route path="/" component={() => {
            // Using dynamic import for the HomePageHandler to avoid circular dependencies
            const HomePageHandlerPage = React.lazy(() => import('./components/HomePageHandler'));
            
            return (
              <React.Suspense fallback={<div className="p-8 text-white">Loading homepage...</div>}>
                <HomePageHandlerPage />
              </React.Suspense>
            );
          }} />
          <Route path="/the-paddock" component={() => <ProtectedRoute bypassAuth={true}><ThePaddockPage /></ProtectedRoute>} />
          <Route path="/admin" component={() => <ProtectedRoute bypassAuth={true}><AdminPage /></ProtectedRoute>} />
          
          {/* Beta Welcome Page - Special route to handle onboarding for new deployment users */}
          <Route path="/beta-welcome" component={() => {
            // Import the BetaWelcomePage component
            const BetaWelcomePage = React.lazy(() => import('./pages/beta-welcome-page'));
            return (
              <React.Suspense fallback={<div className="p-8 text-white">Loading beta welcome...</div>}>
                <BetaWelcomePage />
              </React.Suspense>
            );
          }} />
          
          {/* User & Profile Routes - Keeping these for backward compatibility but will be replaced by ThePaddockPage */}
          <Route path="/dashboard" component={() => <ProtectedRoute bypassAuth={true}><ThePaddockPage /></ProtectedRoute>} />
          <Route path="/personalized-dashboard" component={() => <ProtectedRoute bypassAuth={true}><ThePaddockPage /></ProtectedRoute>} />
          <Route path="/profile" component={() => <ProtectedRoute bypassAuth={true}><ThePaddockPage /></ProtectedRoute>} />
          <Route path="/onboarding-test" component={() => <ProtectedRoute bypassAuth={true}><OnboardingTestPage /></ProtectedRoute>} />
          <Route path="/settings" component={() => <ProtectedRoute bypassAuth={true}><Settings /></ProtectedRoute>} />
          
          {/* Vehicle Management Routes - Keeping these for backward compatibility but will be replaced by ThePaddockPage */}
          <Route path="/garage-vault" component={() => <ProtectedRoute bypassAuth={true}><ThePaddockPage /></ProtectedRoute>} />
          <Route path="/garage" component={() => <ProtectedRoute bypassAuth={true}><GaragePage /></ProtectedRoute>} />
          <Route path="/add-vehicle" component={() => <ProtectedRoute bypassAuth={true}><AddVehiclePage /></ProtectedRoute>} />
          <Route path="/vehicle-mods" component={() => <ProtectedRoute><VehicleModsPage /></ProtectedRoute>} />
          <Route path="/mod-planner" component={() => <ProtectedRoute><ModPlannerPage /></ProtectedRoute>} />
          
          {/* Feature Routes */}
          <Route path="/weather-paddock" component={() => <ProtectedRoute><WeatherPaddockPage /></ProtectedRoute>} />
          <Route path="/weather" component={() => <ProtectedRoute><WeatherPage /></ProtectedRoute>} />
          <Route path="/route-planner" component={() => <ProtectedRoute><RoutePlannerPage /></ProtectedRoute>} />
          <Route path="/drive-journal" component={() => <ProtectedRoute><DriveJournalPage /></ProtectedRoute>} />
          <Route path="/manifestation-station" component={() => <ProtectedRoute><ManifestationStationPage /></ProtectedRoute>} />
          <Route path="/juicebox" component={() => <ProtectedRoute><JuiceBox /></ProtectedRoute>} />
          <Route path="/product-organizer" component={() => <ProtectedRoute><ProductOrganizerPage /></ProtectedRoute>} />
          <Route path="/tires-timepieces" component={() => <ProtectedRoute><TiresTimepieces /></ProtectedRoute>} />
          <Route path="/podium-pursuit" component={() => <ProtectedRoute><PodiumPursuitPage /></ProtectedRoute>} />
          
          {/* Event & Community Routes */}
          <Route path="/events" component={() => <ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/motorsports-events" component={() => <ProtectedRoute><MotorsportsEventsPage /></ProtectedRoute>} />
          <Route path="/motorsports-gallery" component={() => <ProtectedRoute><MotorsportsGalleryPage /></ProtectedRoute>} />
          <Route path="/membership" component={() => <ProtectedRoute><MembershipPage /></ProtectedRoute>} />
          <Route path="/chat-feed" component={() => <ProtectedRoute><ChatFeedPage /></ProtectedRoute>} />
          <Route path="/contact" component={() => <ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="/ebooks" component={() => <ProtectedRoute><EbooksPage /></ProtectedRoute>} />
          <Route path="/concierge" component={() => <ProtectedRoute><ConciergePage /></ProtectedRoute>} />
          <Route path="/discounts" component={() => <ProtectedRoute><DiscountsPage /></ProtectedRoute>} />
          
          {/* Utility & Spotify Routes */}
          <Route path="/spotify-test" component={() => <ProtectedRoute><SpotifyTestPage /></ProtectedRoute>} />
          <Route path="/spotify-env-check" component={() => <ProtectedRoute><SpotifyEnvCheck /></ProtectedRoute>} />
          
          {/* Debug Pages */}
          <Route path="/debug" component={() => {
            const DebugPage = React.lazy(() => import('./pages/debug-page'));
            return (
              <React.Suspense fallback={<div className="p-8 text-white">Loading debug page...</div>}>
                <DebugPage />
              </React.Suspense>
            );
          }} />
          
          {/* 404 page for when no routes match */}
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
  
  // Function to mark onboarding as complete and redirect to The Paddock
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    // Redirect to The Paddock after onboarding completion
    window.location.href = '/the-paddock';
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
  
  // Check if the current path is /auth or /demo-mode
  const [location] = useLocation();
  const isAuthPage = location === '/auth';
  const isDemoModePage = location === '/demo-mode';
  
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
  
  // If we're on the demo mode page, bypass Auth0 completely
  if (isDemoModePage) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <DemoMode />
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
                    {/* Location Services Provider - Centralized location and weather data management */}
                    <LocationServicesProvider>
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
                    </LocationServicesProvider>
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