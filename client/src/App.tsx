import React from 'react';
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
import DropdownNavbar from "./components/DropdownNavbar";
import { WeatherProvider } from "./contexts/WeatherContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./hooks/useAuth";
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

  return (
    <QueryClientProvider client={queryClient}>
      <WeatherProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-black font-openSans text-white">
            {(effectiveSession || previewMode) && <DropdownNavbar />}
            <div className="container mx-auto px-4">
              <Toaster />
              <Routes>
                {/* Public authentication route */}
                <Route path="/auth" element={!session && !previewMode ? <AuthPage /> : <Navigate to="/dashboard" replace />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/garage" element={<ProtectedRoute><Garage /></ProtectedRoute>} />
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
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </TooltipProvider>
      </WeatherProvider>
    </QueryClientProvider>
  );
}

export default App;
