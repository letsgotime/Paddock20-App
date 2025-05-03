import PreDriveChecklistPage from './pages/PreDriveChecklistPage';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeImageCache } from "./services/unsplashService";
import NavigationControls from './components/NavigationControls';
import ContextualBreadcrumbs from './components/ContextualBreadcrumbs';
import useScrollToTop from './hooks/useScrollToTop';
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
import DropdownNavbar from "./components/DropdownNavbar";
import Footer from "./components/Footer";
import { WeatherProvider } from "./contexts/WeatherContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { RewardsProvider } from "./contexts/RewardsContext";
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
import SupportChatbot from "./components/SupportChatbot";
import HomePage from "./pages/Home";
import OneTapWeatherSnapshot from "./components/OneTapWeatherSnapshot";
import UserOnboarding from "./components/UserOnboarding";
import { useAuth } from "./hooks/useAuth";
// Temporarily comment out AuthProvider until we complete the implementation
// import { AuthProvider } from "./context/AuthContext";
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';
import './paddock20.css';

// Import legal pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import BetaAgreement from './pages/BetaAgreement';

function App() {
  // TEMPORARY: Force preview mode to bypass auth
  const previewMode = true;
  const { session, loading } = useAuth();
  
  // State to track if the user has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    // Check if user has completed the legal agreement flow
    // In a real app, this would be stored in a database after user authentication
    const userAgreements = localStorage.getItem('userAgreements');
    if (userAgreements) {
      try {
        const agreements = JSON.parse(userAgreements);
        // Check version to ensure users re-agree when terms change
        return agreements.accepted && agreements.version === '1.0';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  
  // Use the scroll-to-top hook to ensure pages always start at the top
  useScrollToTop();
  
  // For preview purposes, we'll create a mock session
  const effectiveSession = previewMode ? { user: { id: 'preview-user' } } : session;
  
  // Function to mark onboarding as complete
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading && !previewMode) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      );
    }
    
    if (!effectiveSession && !previewMode) {
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
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
  }, []);
  
  // Initialize Unsplash image cache for marketplace listings
  useEffect(() => {
    // Pre-fetch images for marketplace listings to avoid rate limiting
    if (previewMode || effectiveSession) {
      console.log('Initializing image cache for marketplace listings...');
      initializeImageCache()
        .then(() => console.log('Image cache initialized successfully'))
        .catch((error) => console.error('Failed to initialize image cache:', error));
    }
  }, [previewMode, effectiveSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
          {/* Centralized Weather Provider - Provides weather data to all components */}
          <WeatherProvider>
            <GalleryProvider>
              {/* Rewards Provider - for site-wide gamification */}
              <RewardsProvider>
              {/* Skip link for keyboard navigation */}
              <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
                Skip to main content
              </a>
              
              {/* User Onboarding - Show for first time users or when terms update */}
              {(effectiveSession || previewMode) && !hasCompletedOnboarding && (
                <UserOnboarding onComplete={completeOnboarding} />
              )}
              
              <div className="min-h-screen bg-black font-openSans text-white">
                {/* Header with navigation */}
              <header role="banner">
                {(effectiveSession || previewMode) && (
                  <>
                    <DropdownNavbar />
                    <NavigationControls />
                    <ContextualBreadcrumbs />
                  </>
                )}
              </header>

            {/* Main content area */}
            <main id={MAIN_CONTENT_ID} className="container mx-auto px-4" tabIndex={-1}>
              {/* Toast notifications with ARIA live region built in */}
              <Toaster />
              
              {/* Global floating weather snapshot - will be available on all pages */}
              {(effectiveSession || previewMode) && (
                <OneTapWeatherSnapshot 
                  floating={true}
                  // Don't show on weather center page where it would be redundant
                  className={window.location.pathname === '/new-weather-center' ? 'hidden' : ''}
                />
              )}
              
              <Routes>
                {/* Public authentication route */}
                <Route path="/auth" element={!session && !previewMode ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
                
                {/* Legal Document Pages - Publicly accessible */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/beta-agreement" element={<BetaAgreement />} />
                
                {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Paddock20HomePage /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/personalized-dashboard" element={<ProtectedRoute><PersonalizedDashboard /></ProtectedRoute>} />
              {/* Main Garage Vault Hub - Central repository for all vehicle data */}
              <Route path="/garage-vault" element={<ProtectedRoute><GarageVaultPage /></ProtectedRoute>} />
              {/* New GoTime Garage Vault - Enhanced F1-style vehicle management */}
              <Route path="/gotime-garage" element={<ProtectedRoute><GoTimeGarageVault /></ProtectedRoute>} />
              {/* Legacy garage route redirects to new Garage Vault structure */}
              <Route path="/garage" element={<Navigate to="/garage-vault" replace />} />
              
              <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/motorsports" element={<ProtectedRoute><Motorsports /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/events-page" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
              <Route path="/motorsports-events" element={<ProtectedRoute><MotorsportsEventsPage /></ProtectedRoute>} />
              <Route path="/juicebox" element={<ProtectedRoute><JuiceBox /></ProtectedRoute>} />
              <Route path="/gloss-reset" element={<ProtectedRoute><GlossResetPage /></ProtectedRoute>} />
              <Route path="/juice-loadouts" element={<ProtectedRoute><LoadoutsPage /></ProtectedRoute>} />
              <Route path="/gloss-growth" element={<ProtectedRoute><GlossGrowthPage /></ProtectedRoute>} />
              <Route path="/juicebox-videos" element={<ProtectedRoute><VideoLibraryPage /></ProtectedRoute>} />
              <Route path="/broker-portal" element={<ProtectedRoute><BrokerPortalPage /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
              <Route path="/new-weather-center" element={<ProtectedRoute><NewGTGWeatherPage /></ProtectedRoute>} />
              <Route path="/redline" element={<ProtectedRoute><RedlineReportPage /></ProtectedRoute>} />
              <Route path="/seasonal-checklist" element={<ProtectedRoute><SeasonalChecklistPage /></ProtectedRoute>} />
              <Route path="/pre-drive-checklist" element={<ProtectedRoute><PreDriveChecklistPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/vehicle-mods/:id" element={<ProtectedRoute><VehicleModsPage /></ProtectedRoute>} />
              <Route path="/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
              <Route path="/paddock20-vault" element={<Navigate to="/membership" replace />} />
              <Route path="/tires-timepieces" element={<ProtectedRoute><TiresTimepieces /></ProtectedRoute>} />
              <Route path="/manifestation-station" element={<ProtectedRoute><ManifestationStationPage /></ProtectedRoute>} />
              <Route path="/mod-planner" element={<ProtectedRoute><ModPlannerPage /></ProtectedRoute>} />
              <Route path="/concierge" element={<ProtectedRoute><ConciergePage /></ProtectedRoute>} />
              <Route path="/hustle-planner" element={<ProtectedRoute><HustlePlannerPage /></ProtectedRoute>} />
              <Route path="/route-planner" element={<ProtectedRoute><RoutePlannerPage /></ProtectedRoute>} />
              <Route path="/drive-journal" element={<ProtectedRoute><DriveJournalPage /></ProtectedRoute>} />
              <Route path="/ebooks" element={<ProtectedRoute><EBooksPage /></ProtectedRoute>} />
              <Route path="/discounts" element={<ProtectedRoute><DiscountsPage /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
              <Route path="/chat-feed" element={<ProtectedRoute><ChatFeedPage /></ProtectedRoute>} />
              <Route path="/share" element={<ProtectedRoute><ShareDemoPage /></ProtectedRoute>} />
              <Route path="/mood-energy-tracker" element={<ProtectedRoute><MoodEnergyTrackerPage /></ProtectedRoute>} />
              <Route path="/motorsports-gallery" element={<ProtectedRoute><MotorsportsGalleryPage /></ProtectedRoute>} />
              <Route path="/podium-pursuit" element={<ProtectedRoute><PodiumPursuitPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* AI Support Chatbot - Available globally */}
            {(effectiveSession || previewMode) && <SupportChatbot />}
            
            {/* Rewards notification - will show when rewards are earned */}
            {(effectiveSession || previewMode) && <RewardNotification />}
            
            {/* Invisible rewards tracker component that monitors user activity */}
            {(effectiveSession || previewMode) && <RewardsTracker />}
          </main>

          {/* Footer with links and information */}
          <Footer />
        </div>
            </RewardsProvider>
          </GalleryProvider>
        </WeatherProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
