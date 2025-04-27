import PreDriveChecklistPage from './pages/PreDriveChecklistPage';
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Garage from "@/pages/Garage";
import Journal from "@/pages/Journal";
import Marketplace from "@/pages/Marketplace";
import Motorsports from "@/pages/Motorsports";
import Settings from "@/pages/Settings";
import Events from "./pages/Events";
import JuiceBox from "./pages/JuiceBox";
import GlossResetPage from "./pages/GlossResetPage";
import LoadoutsPage from "./pages/LoadoutsPage";
import GlossGrowthPage from "./pages/GlossGrowthPage";
import VideoLibraryPage from "./pages/VideoLibraryPage";
import BrokerPortalPage from "./pages/BrokerPortalPage";
import Weather from "./pages/Weather";
import SeasonalChecklistPage from "./pages/SeasonalChecklistPage";
import DropdownNavbar from "./components/DropdownNavbar";
import HorizontalNavbar from "./components/HorizontalNavbar";
import { WeatherProvider } from "./contexts/WeatherContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import GarageVaultPage from "./pages/GarageVaultPage";
import VehicleModsPage from "./pages/VehicleModsPage";
import Paddock20VaultPage from "./pages/Paddock20VaultPage";
import ManifestationStationPage from "./pages/ManifestationStationPage";
import ModPlannerPage from "./pages/ModPlannerPage";
import ConciergePage from "./pages/ConciergePage";
import HustlePlannerPage from "./pages/HustlePlannerPage";
import RoutePlannerPage from "./pages/RoutePlannerPage";
import { useAuth } from "./hooks/useAuth";
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';
import './apexvault.css';

function App() {
  // TEMPORARY: Force preview mode to bypass auth
  const previewMode = true;
  const { session, loading } = useAuth();
  
  // For preview purposes, we'll create a mock session
  const effectiveSession = previewMode ? { user: { id: 'preview-user' } } : session;

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

  return (
    <QueryClientProvider client={queryClient}>
      <WeatherProvider>
        <TooltipProvider>
          {/* Skip link for keyboard navigation */}
          <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
            Skip to main content
          </a>
          
          <div className="min-h-screen bg-black font-openSans text-white">
            {/* Header with navigation */}
            <header role="banner">
              {(effectiveSession || previewMode) && <DropdownNavbar />}
            </header>

            {/* Main content area */}
            <main id={MAIN_CONTENT_ID} className="container mx-auto px-4" tabIndex={-1}>
              {/* Toast notifications with ARIA live region built in */}
              <Toaster />
              
              <Routes>
                {/* Public authentication route */}
                <Route path="/auth" element={!session && !previewMode ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                {/* Main Garage Vault Hub - Central repository for all vehicle data */}
                <Route path="/garage-vault" element={<ProtectedRoute><GarageVaultPage /></ProtectedRoute>} />
                {/* Legacy garage route redirects to new Garage Vault structure */}
                <Route path="/garage" element={<Navigate to="/garage-vault" replace />} />
                
                <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
                <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                <Route path="/motorsports" element={<ProtectedRoute><Motorsports /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                <Route path="/juicebox" element={<ProtectedRoute><JuiceBox /></ProtectedRoute>} />
                <Route path="/gloss-reset" element={<ProtectedRoute><GlossResetPage /></ProtectedRoute>} />
                <Route path="/juice-loadouts" element={<ProtectedRoute><LoadoutsPage /></ProtectedRoute>} />
                <Route path="/gloss-growth" element={<ProtectedRoute><GlossGrowthPage /></ProtectedRoute>} />
                <Route path="/juicebox-videos" element={<ProtectedRoute><VideoLibraryPage /></ProtectedRoute>} />
                <Route path="/broker-portal" element={<ProtectedRoute><BrokerPortalPage /></ProtectedRoute>} />
                <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                <Route path="/seasonal-checklist" element={<ProtectedRoute><SeasonalChecklistPage /></ProtectedRoute>} />
                <Route path="/pre-drive-checklist" element={<ProtectedRoute><PreDriveChecklistPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/vehicle-mods/:id" element={<ProtectedRoute><VehicleModsPage /></ProtectedRoute>} />
                <Route path="/paddock20-vault" element={<ProtectedRoute><Paddock20VaultPage /></ProtectedRoute>} />
                <Route path="/manifestation-station" element={<ProtectedRoute><ManifestationStationPage /></ProtectedRoute>} />
                <Route path="/mod-planner" element={<ProtectedRoute><ModPlannerPage /></ProtectedRoute>} />
                <Route path="/concierge" element={<ProtectedRoute><ConciergePage /></ProtectedRoute>} />
                <Route path="/hustle-planner" element={<ProtectedRoute><HustlePlannerPage /></ProtectedRoute>} />
                <Route path="/route-planner" element={<ProtectedRoute><RoutePlannerPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer with accessibility information */}
            <footer role="contentinfo" className="py-4 mt-8 border-t border-gray-800">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} GoTime Motorsports - ApexVault™</p>
                <p className="mt-2">
                  <a href="#accessibility" className="text-green-500 hover:text-green-400 underline">
                    Accessibility Statement
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </TooltipProvider>
      </WeatherProvider>
    </QueryClientProvider>
  );
}

export default App;
