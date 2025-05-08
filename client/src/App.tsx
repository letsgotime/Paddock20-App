import React, { useState, useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import PageTitleManager from './components/PageTitleManager';
import AppHeader from './components/AppHeader';
import FixedSoundBar from "./components/FixedSoundBar";
import Footer from "./components/Footer";
import NotFound from "@/pages/not-found";
import { MockAuthProvider } from './auth/MockAuthProvider';

// Page imports
import BetaWelcomePage from './pages/BetaWelcomePage';
import SimpleOnboardingPage from './pages/SimpleOnboardingPage';
import ThePaddockPage from './pages/ThePaddockPage';
import WeatherPage from "./pages/WeatherPage";
import GarageVaultPage from "./pages/GarageVaultPage";
import AddVehiclePage from "./pages/AddVehiclePage";
import ConnectVehiclePage from "./pages/ConnectVehiclePage";
import DriveJournalPage from "./pages/DriveJournalPage";
import ManifestationStationPage from "./pages/ManifestationStationPage";
import JuiceBox from "./pages/JuiceBox";
import PodiumPursuitPage from "./pages/PodiumPursuitPage";
import EventsPage from "./pages/EventsPage";
import TiresTimepieces from "./pages/TiresTimepieces";

// Context providers
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { SoundProvider } from "./contexts/SoundContext";
import { VehicleProvider } from "./contexts/VehicleContext";
import { VehicleDataProvider } from "./contexts/VehicleDataContext";
import { LocationServicesProvider } from "./contexts/LocationServicesContext";
import { WeatherProvider } from "./contexts/ConsolidatedWeatherContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { RewardsProvider } from "./contexts/RewardsContext";

// Accessibility
import { MAIN_CONTENT_ID } from './lib/accessibility';
import { useScrollToTop } from './hooks/useScrollToTop';

// Wrapper component for the scrollToTop hook to avoid React Node type errors
function ScrollToTopWrapper() {
  useScrollToTop();
  return null;
}

// Route component wrappers
function PaddockWrapper() {
  return <ThePaddockPage demoMode={true} />;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading/startup delay for better UX
    setTimeout(() => setIsLoading(false), 500);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8">
          <div className="w-24 h-24 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-3xl font-orbitron bg-gradient-to-r from-[#1982FC] to-[#08c519] bg-clip-text text-transparent">
            PADDOCK20
          </h1>
          <p className="text-gray-500 mt-2">Initializing telemetry systems...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PageTitleManager />
        <ScrollToTopWrapper />
        
        <MockAuthProvider>
          <UserProfileProvider>
            <SoundProvider>
              <VehicleProvider>
                <VehicleDataProvider>
                  <LocationServicesProvider>
                    <WeatherProvider>
                      <GalleryProvider>
                        <RewardsProvider>
                          {/* Skip link for keyboard navigation */}
                          <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
                            Skip to main content
                          </a>
                        
                          {/* Main application container */}
                          <div className="min-h-screen bg-black font-openSans text-white">
                            {/* App Header (global navigation) */}
                            <AppHeader demoMode={true} />
                            
                            {/* Fixed components */}
                            <FixedSoundBar />
                      
                            {/* Main content area */}
                            <main id={MAIN_CONTENT_ID} className="container mx-auto px-4 pb-[70px]" tabIndex={-1}>
                              <Toaster />
                              
                              {/* Routes defined here */}
                              <Switch>
                                {/* Primary routes */}
                                <Route path="/" component={BetaWelcomePage} />
                                <Route path="/home" component={ThePaddockPage} />
                                <Route path="/onboarding" component={SimpleOnboardingPage} />
                                <Route path="/juicebox" component={JuiceBox} />
                                <Route path="/the-paddock" component={ThePaddockPage} />
                                <Route path="/weather-paddock" component={WeatherPage} />
                                <Route path="/garage" component={GarageVaultPage} />
                                <Route path="/add-vehicle" component={AddVehiclePage} />
                                <Route path="/connect-vehicle" component={ConnectVehiclePage} />
                                <Route path="/manifestation-station" component={ManifestationStationPage} />
                                <Route path="/events" component={EventsPage} />
                                <Route path="/drive-journal" component={DriveJournalPage} />
                                <Route path="/tires-timepieces" component={TiresTimepieces} />
                                <Route path="/podium-pursuit" component={PodiumPursuitPage} />
                              
                                {/* Fallback route */}
                                <Route component={BetaWelcomePage} />
                              </Switch>
                            </main>
                            
                            {/* Footer */}
                            <Footer />
                          </div>
                        </RewardsProvider>
                      </GalleryProvider>
                    </WeatherProvider>
                  </LocationServicesProvider>
                </VehicleDataProvider>
              </VehicleProvider>
            </SoundProvider>
          </UserProfileProvider>
        </MockAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;