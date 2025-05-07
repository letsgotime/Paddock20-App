import React, { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { NativeAuthProvider, useNativeAuth } from '@/hooks/useNativeAuth';
import { AuthProvider } from '@/hooks/useAuth';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import PageTitleManager from './components/PageTitleManager';
import Header from './components/Header';
import AppHeader from './components/AppHeader';
import ContextualBreadcrumbs from './components/ContextualBreadcrumbs';
import FixedSoundBar from "./components/FixedSoundBar";
import Footer from "./components/Footer";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from './components/ProtectedRoute';
import UserOnboarding from "./components/UserOnboarding";
import SupportChatbot from "./components/SupportChatbot";
import OneTapWeatherSnapshot from "./components/OneTapWeatherSnapshot";
import RewardNotification from "./components/RewardNotification";
import RewardsTracker from "./components/RewardsTracker";
import NativeAuthPage from './pages/NativeAuthPage';
import OnboardingPage from './pages/OnboardingPage';

// New Pages
import ThePaddockPage from './pages/ThePaddockPage';
import EnhancedLogoutPage from './pages/EnhancedLogoutPage';
import JoinTheGrid from './pages/JoinTheGrid';
import OptimizedOnboardingPage from './pages/OptimizedOnboardingPage';
import BetaEnrollmentPage from './pages/BetaEnrollmentPage';
import PaddockPage from './pages/PaddockPage';

// Page imports
import Paddock20HomePage from "./pages/Paddock20HomePage";
import AdminPage from './pages/AdminPage';
import UserProfileHubPage from "./pages/UserProfileHubPage";
import OnboardingTestPage from "./pages/OnboardingTestPage";
import Settings from "@/pages/Settings";
import GarageVaultPage from "./pages/GarageVaultPage";
import GaragePage from "./pages/GaragePage";
import AddVehiclePage from "./pages/AddVehiclePage";
import VehicleModsPage from "./pages/VehicleModsPage";
import ModPlannerPage from "./pages/ModPlannerPage";
import WeatherPage from "./pages/WeatherPage";
import Weather from "./pages/Weather";
import TimeServicesPage from "./pages/TimeServicesPage";
import RoutePlannerPage from "./pages/RoutePlannerPage";
import DriveJournalPage from "./pages/DriveJournalPage";
import ManifestationStationPage from "./pages/ManifestationStationPage";
import JuiceBox from "./pages/JuiceBox";
import ProductOrganizerPage from "./pages/ProductOrganizerPage";
import TiresTimepieces from "./pages/TiresTimepieces";
import PodiumPursuitPage from "./pages/PodiumPursuitPage";
import EventsPage from "./pages/EventsPage";
import MotorsportsEventsPage from "./pages/MotorsportsEventsPage";
import MotorsportsGalleryPage from "./pages/MotorsportsGalleryPage";
import MembershipPage from "./pages/MembershipPage";
import ChatFeedPage from "./pages/ChatFeedPage";
import ContactPage from "./pages/ContactPage";
import EbooksPage from "./pages/EbooksPage";
import ConciergePage from "./pages/ConciergePage";
import DiscountsPage from "./pages/DiscountsPage";
import SpotifyTestPage from "./pages/SpotifyTestPage";
import SpotifyEnvCheck from "./pages/SpotifyEnvCheck";
import SpotifyCallbackPage from "./pages/SpotifyCallbackPage";
import ApiExplorerPage from "./pages/api-explorer-page";
import PrivacyPolicy from './pages/PrivacyPolicyPage';
import TermsOfService from './pages/TermsOfServicePage';
import BetaAgreement from './pages/BetaAgreement';
import EmailVerifiedPage from './pages/EmailVerifiedPage';
import AuthTestPage from './pages/AuthTestPage';

// Context providers
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { SoundProvider } from "./contexts/SoundContext";
import { VehicleProvider } from "./contexts/VehicleContext";
import { VehicleDataProvider } from "./contexts/VehicleDataContext";
import { LocationServicesProvider } from "./contexts/LocationServicesContext";
import { WeatherProvider } from "./contexts/ConsolidatedWeatherContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { RewardsProvider } from "./contexts/RewardsContext";
import { SpotifyProvider } from "./contexts/SpotifyContext";

// Accessibility
import { MAIN_CONTENT_ID } from './lib/accessibility';
import { useScrollToTop } from './hooks/useScrollToTop';

// Wrapper component for the scrollToTop hook to avoid React Node type errors
function ScrollToTopWrapper() {
  useScrollToTop();
  return null;
}

// Function to process onboarding status
function App() {
  // State to track if the user has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  
  // Get the current location
  const [location] = useLocation();
  
  // Check for onboarding status when app initializes
  useEffect(() => {
    const userProfileStr = localStorage.getItem('userProfile');
    
    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        const userId = userProfile.id;
        
        if (userId) {
          // Check if this user has completed onboarding
          const betaOnboardingKey = `paddock20_beta_onboarding_complete_${userId}`;
          const hasCompleted = localStorage.getItem(betaOnboardingKey) === 'true';
          setHasCompletedOnboarding(hasCompleted);
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
  }, []);

  // Special case for auth page to provide auth context
  if (location === '/auth') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PageTitleManager />
          <NativeAuthProvider>
            <AuthProvider>
              <>
                <AppHeader />
                <NativeAuthPage />
              </>
            </AuthProvider>
          </NativeAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Default App setup with query client and other global providers
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PageTitleManager />
        {/* Custom scroll-to-top behavior */}
        <ScrollToTopWrapper />
        
        {/* Wrap with native auth provider first, then the compatibility AuthProvider */}
        <NativeAuthProvider>
          <AuthProvider>
            <AppContent 
              hasCompletedOnboarding={hasCompletedOnboarding}
              setHasCompletedOnboarding={setHasCompletedOnboarding}
            />
          </AuthProvider>
        </NativeAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Separate component to access auth context
function AppContent({ 
  hasCompletedOnboarding, 
  setHasCompletedOnboarding 
}: { 
  hasCompletedOnboarding: boolean, 
  setHasCompletedOnboarding: (value: boolean) => void 
}) {
  // All hooks must be called in the same order on every render
  // So declare all hooks at the top of the component
  
  // Get location and navigate function from wouter
  const [location, navigate] = useLocation();
  
  // Use the native auth hook directly in AppContent
  const { user, loading, isAuthenticated } = useNativeAuth();
  
  // Redirect user to onboarding if authenticated and hasn't completed onboarding
  useEffect(() => {
    // Only redirect if user is authenticated, hasn't completed onboarding, 
    // and isn't already on an onboarding-related page
    if (isAuthenticated && !hasCompletedOnboarding && user?.id && 
        location !== '/onboarding' && location !== '/beta-enrollment') {
      // Use a setTimeout to avoid React state updates during render
      const redirectTimer = setTimeout(() => {
        navigate('/onboarding');
      }, 100);
      
      // Cleanup timer if component unmounts
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, hasCompletedOnboarding, user?.id, location, navigate]);
  
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

  // Wrap the application with required context providers
  return (
    <UserProfileProvider>
      <SoundProvider>
        <VehicleProvider>
          <VehicleDataProvider>
            <LocationServicesProvider>
              <WeatherProvider>
                <GalleryProvider>
                  <RewardsProvider>
                    <SpotifyProvider>
                      {/* Skip link for keyboard navigation */}
                      <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
                        Skip to main content
                      </a>
                    
                      {/* Main application container */}
                      <div className="min-h-screen bg-black font-openSans text-white">
                        {/* Header with auth controls */}
                        <AppHeader />
                      
                        {/* Main navigation header */}
                        <header role="banner">
                          {/* Breadcrumbs - only visible when logged in */}
                          {isAuthenticated && <ContextualBreadcrumbs />}
                        </header>
                        
                        {/* Fixed components */}
                        <FixedSoundBar />
                        {isAuthenticated && <SupportChatbot />}
                
                        {/* Main content area */}
                        <main id={MAIN_CONTENT_ID} className="container mx-auto px-4 mt-[60px] pb-[70px]" tabIndex={-1}>
                          <Toaster />
                          
                          {/* Floating weather widget */}
                          {isAuthenticated && (
                            <OneTapWeatherSnapshot 
                              floating={true}
                              className={location === '/weather-paddock' ? 'hidden' : ''}
                            />
                          )}
                          
                          {/* Routes defined here */}
                          {/* Publicly accessible routes */}
                          <Route path="/privacy-policy" component={PrivacyPolicy} />
                          <Route path="/terms-of-service" component={TermsOfService} />
                          <Route path="/beta-agreement" component={BetaAgreement} />
                          <Route path="/email-verified" component={EmailVerifiedPage} />
                          {/* Main auth page with updated branding - already handled with special case above */}
                          <Route path="/auth" component={() => null} />
                          <Route path="/join-the-grid" component={JoinTheGrid} />
                          <Route path="/spotify/callback" component={SpotifyCallbackPage} />
                          <Route path="/logout" component={EnhancedLogoutPage} />
                          
                          {/* User onboarding pages */}
                          <Route path="/onboarding" component={OnboardingPage} />
                          <Route path="/onboarding/optimized" component={() => <ProtectedRoute><OptimizedOnboardingPage /></ProtectedRoute>} />
                          <Route path="/onboarding/all" component={() => <ProtectedRoute><OptimizedOnboardingPage showAllFeatures={true} /></ProtectedRoute>} />
                          <Route path="/beta-enrollment" component={BetaEnrollmentPage} />
                          
                          {/* Protected routes */}
                          <Route path="/" component={() => <ProtectedRoute><ThePaddockPage /></ProtectedRoute>} />
                          <Route path="/the-paddock" component={() => <ProtectedRoute><ThePaddockPage /></ProtectedRoute>} />
                          <Route path="/paddock" component={() => <ProtectedRoute><PaddockPage /></ProtectedRoute>} />
                          <Route path="/admin" component={() => <ProtectedRoute><AdminPage /></ProtectedRoute>} />
                          <Route path="/onboarding-test" component={() => <ProtectedRoute><OnboardingTestPage /></ProtectedRoute>} />
                          <Route path="/settings" component={() => <ProtectedRoute><Settings /></ProtectedRoute>} />
                          <Route path="/garage" component={() => <ProtectedRoute><GaragePage /></ProtectedRoute>} />
                          <Route path="/add-vehicle" component={() => <ProtectedRoute><AddVehiclePage /></ProtectedRoute>} />
                          <Route path="/vehicle-mods" component={() => <ProtectedRoute><VehicleModsPage /></ProtectedRoute>} />
                          <Route path="/mod-planner" component={() => <ProtectedRoute><ModPlannerPage /></ProtectedRoute>} />
                          <Route path="/weather-paddock" component={() => <ProtectedRoute><WeatherPage /></ProtectedRoute>} />
                          <Route path="/weather" component={() => <ProtectedRoute><Weather /></ProtectedRoute>} />
                          <Route path="/time-services" component={() => <ProtectedRoute><TimeServicesPage /></ProtectedRoute>} />
                          <Route path="/route-planner" component={() => <ProtectedRoute><RoutePlannerPage /></ProtectedRoute>} />
                          <Route path="/drive-journal" component={() => <ProtectedRoute><DriveJournalPage /></ProtectedRoute>} />
                          <Route path="/manifestation-station" component={() => <ProtectedRoute><ManifestationStationPage /></ProtectedRoute>} />
                          <Route path="/juicebox" component={() => <ProtectedRoute><JuiceBox /></ProtectedRoute>} />
                          <Route path="/product-organizer" component={() => <ProtectedRoute><ProductOrganizerPage /></ProtectedRoute>} />
                          <Route path="/tires-timepieces" component={() => <ProtectedRoute><TiresTimepieces /></ProtectedRoute>} />
                          <Route path="/podium-pursuit" component={() => <ProtectedRoute><PodiumPursuitPage /></ProtectedRoute>} />
                          <Route path="/events" component={() => <ProtectedRoute><EventsPage /></ProtectedRoute>} />
                          <Route path="/motorsports-events" component={() => <ProtectedRoute><MotorsportsEventsPage /></ProtectedRoute>} />
                          <Route path="/motorsports-gallery" component={() => <ProtectedRoute><MotorsportsGalleryPage /></ProtectedRoute>} />
                          <Route path="/membership" component={() => <ProtectedRoute><MembershipPage /></ProtectedRoute>} />
                          <Route path="/chat-feed" component={() => <ProtectedRoute><ChatFeedPage /></ProtectedRoute>} />
                          <Route path="/contact" component={() => <ProtectedRoute><ContactPage /></ProtectedRoute>} />
                          <Route path="/ebooks" component={() => <ProtectedRoute><EbooksPage /></ProtectedRoute>} />
                          <Route path="/concierge" component={() => <ProtectedRoute><ConciergePage /></ProtectedRoute>} />
                          <Route path="/discounts" component={() => <ProtectedRoute><DiscountsPage /></ProtectedRoute>} />
                          <Route path="/spotify-test" component={() => <ProtectedRoute><SpotifyTestPage /></ProtectedRoute>} />
                          <Route path="/spotify-env-check" component={() => <ProtectedRoute><SpotifyEnvCheck /></ProtectedRoute>} />
                          <Route path="/api-explorer" component={() => <ProtectedRoute><ApiExplorerPage /></ProtectedRoute>} />
                          <Route path="/auth-test" component={AuthTestPage} />
                          
                          {/* Special debug route */}
                          <Route path="/debug" component={() => {
                            const SimpleDebug = React.lazy(() => import('./pages/SimpleDebug'));
                            return (
                              <React.Suspense fallback={<div className="p-8 text-white">Loading debug page...</div>}>
                                <SimpleDebug />
                              </React.Suspense>
                            );
                          }} />
                          
                          {/* Special geocoding test route */}
                          <Route path="/geocoding-test" component={() => (
                            <div className="container mx-auto py-6 px-4">
                              <div className="space-y-6">
                                <div>
                                  <h1 className="text-3xl font-bold tracking-tight">OpenCage Geocoding Explorer</h1>
                                  <p className="text-muted-foreground mt-2">
                                    Ultra-conservative implementation with 1 request/day limit and permanent caching
                                  </p>
                                </div>
                                
                                <div className="border-b pb-2" />
                                
                                <div className="flex items-center justify-center min-h-[50vh]">
                                  <div className="bg-muted rounded-lg p-8 text-center max-w-md">
                                    <h2 className="text-2xl font-bold mb-4">Geocoding Test</h2>
                                    <p className="mb-4">
                                      An ultra-conservative geocoding solution has been implemented to work with OpenCage's 1 request/day limit. 
                                      The solution includes 30-day caching, request limiting, and coordinate grid approximation.
                                    </p>
                                    <p className="text-sm mt-4 text-muted-foreground">
                                      Note: We can't display the full test UI currently due to some dependencies in the main LocationServicesContext that need to be fixed.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )} />
                          
                          {/* 404 fallback */}
                          <Route path="*" component={NotFound} />
                          
                          {/* Interactive elements */}
                          {isAuthenticated && <RewardNotification />}
                          {isAuthenticated && <RewardsTracker />}
                        </main>

                        {/* Footer */}
                        <Footer />
                      </div>
                    </SpotifyProvider>
                  </RewardsProvider>
                </GalleryProvider>
              </WeatherProvider>
            </LocationServicesProvider>
          </VehicleDataProvider>
        </VehicleProvider>
      </SoundProvider>
    </UserProfileProvider>
  );
}

export { App as default };