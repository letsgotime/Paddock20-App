import PreDriveChecklistPage from './pages/PreDriveChecklistPage';
import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeImageCache } from "./services/unsplashService";
import NavigationControls from './components/NavigationControls';
import ContextualBreadcrumbs from './components/ContextualBreadcrumbs';
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
import Paddock20HomePageSimple from "./pages/Paddock20HomePageSimple";
import EmergencyDebugPage from "./pages/EmergencyDebugPage";
import DropdownNavbar from "./components/DropdownNavbar";
import Footer from "./components/Footer";
import { WeatherProvider } from "./contexts/WeatherContext";
import { GalleryProvider } from "./contexts/GalleryContext";
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
import SupportChatbot from "./components/SupportChatbot";
import HomePage from "./pages/Home";
import OneTapWeatherSnapshot from "./components/OneTapWeatherSnapshot";
import { useAuth } from "./hooks/useAuth";
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';
import './paddock20.css';

function App() {
  // TEMPORARY: Force preview mode to bypass auth
  const previewMode = true;
  const { session, loading } = useAuth();
  
  // For preview purposes, we'll create a mock session
  const effectiveSession = previewMode ? { user: { id: 'preview-user' } } : session;

  // Protected route component - updated for wouter
  const ProtectedRoute = ({ component: Component }: { component: React.ComponentType }) => {
    if (loading && !previewMode) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      );
    }
    
    if (!effectiveSession && !previewMode) {
      window.location.href = "/auth";
      return null;
    }
    
    return <Component />;
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
            {/* Skip link for keyboard navigation */}
            <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
              Skip to main content
            </a>
            
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
              
              <Switch>
                {/* Public authentication route */}
                <Route path="/auth">
                  {!session && !previewMode ? <AuthPage /> : (() => { window.location.href = "/dashboard"; return null; })()}
                </Route>
                
                {/* Protected routes */}
                <Route path="/">
                  <EmergencyDebugPage />
                </Route>
                <Route path="/simple"><ProtectedRoute component={Paddock20HomePageSimple} /></Route>
                <Route path="/home"><ProtectedRoute component={Home} /></Route>
                <Route path="/paddock20-original"><ProtectedRoute component={Paddock20HomePage} /></Route>
                <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
                <Route path="/personalized-dashboard"><ProtectedRoute component={PersonalizedDashboard} /></Route>
                
                {/* Main Garage Vault Hub - Central repository for all vehicle data */}
                <Route path="/garage-vault"><ProtectedRoute component={GarageVaultPage} /></Route>
                
                {/* New GoTime Garage Vault - Enhanced F1-style vehicle management */}
                <Route path="/gotime-garage"><ProtectedRoute component={GoTimeGarageVault} /></Route>
                
                {/* Legacy garage route redirects to new Garage Vault structure */}
                <Route path="/garage">
                  {() => { window.location.href = "/garage-vault"; return null; }}
                </Route>
                
                <Route path="/journal"><ProtectedRoute component={Journal} /></Route>
                <Route path="/marketplace"><ProtectedRoute component={Marketplace} /></Route>
                <Route path="/motorsports"><ProtectedRoute component={Motorsports} /></Route>
                <Route path="/events"><ProtectedRoute component={Events} /></Route>
                <Route path="/events-page"><ProtectedRoute component={EventsPage} /></Route>
                <Route path="/motorsports-events"><ProtectedRoute component={MotorsportsEventsPage} /></Route>
                <Route path="/juicebox"><ProtectedRoute component={JuiceBox} /></Route>
                <Route path="/gloss-reset"><ProtectedRoute component={GlossResetPage} /></Route>
                <Route path="/juice-loadouts"><ProtectedRoute component={LoadoutsPage} /></Route>
                <Route path="/gloss-growth"><ProtectedRoute component={GlossGrowthPage} /></Route>
                <Route path="/juicebox-videos"><ProtectedRoute component={VideoLibraryPage} /></Route>
                <Route path="/broker-portal"><ProtectedRoute component={BrokerPortalPage} /></Route>
                <Route path="/weather"><ProtectedRoute component={Weather} /></Route>
                <Route path="/new-weather-center"><ProtectedRoute component={NewGTGWeatherPage} /></Route>
                <Route path="/redline"><ProtectedRoute component={RedlineReportPage} /></Route>
                <Route path="/seasonal-checklist"><ProtectedRoute component={SeasonalChecklistPage} /></Route>
                <Route path="/pre-drive-checklist"><ProtectedRoute component={PreDriveChecklistPage} /></Route>
                <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
                <Route path="/vehicle-mods/:id"><ProtectedRoute component={VehicleModsPage} /></Route>
                <Route path="/membership"><ProtectedRoute component={MembershipPage} /></Route>
                
                <Route path="/paddock20-vault">
                  {() => { window.location.href = "/membership"; return null; }}
                </Route>
                
                <Route path="/tires-timepieces"><ProtectedRoute component={TiresTimepieces} /></Route>
                <Route path="/manifestation-station"><ProtectedRoute component={ManifestationStationPage} /></Route>
                <Route path="/mod-planner"><ProtectedRoute component={ModPlannerPage} /></Route>
                <Route path="/concierge"><ProtectedRoute component={ConciergePage} /></Route>
                <Route path="/hustle-planner"><ProtectedRoute component={HustlePlannerPage} /></Route>
                <Route path="/route-planner"><ProtectedRoute component={RoutePlannerPage} /></Route>
                <Route path="/drive-journal"><ProtectedRoute component={DriveJournalPage} /></Route>
                <Route path="/ebooks"><ProtectedRoute component={EBooksPage} /></Route>
                <Route path="/discounts"><ProtectedRoute component={DiscountsPage} /></Route>
                <Route path="/contact"><ProtectedRoute component={ContactPage} /></Route>
                <Route path="/chat-feed"><ProtectedRoute component={ChatFeedPage} /></Route>
                <Route path="/share"><ProtectedRoute component={ShareDemoPage} /></Route>
                <Route path="/mood-energy-tracker"><ProtectedRoute component={MoodEnergyTrackerPage} /></Route>
                <Route path="/motorsports-gallery"><ProtectedRoute component={MotorsportsGalleryPage} /></Route>
                <Route path="*" component={NotFound} />
              </Switch>
            
            {/* AI Support Chatbot - Available globally */}
            {(effectiveSession || previewMode) && <SupportChatbot />}
          </main>

          {/* Footer with links and information */}
          <Footer />
        </div>
        </GalleryProvider>
        </WeatherProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
