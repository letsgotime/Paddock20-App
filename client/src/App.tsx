import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { WeatherProvider } from "./contexts/WeatherContext";
import { useAuth } from "./hooks/useAuth";
import { MAIN_CONTENT_ID, LiveRegion } from './lib/accessibility';

// Components
import DropdownNavbar from "./components/DropdownNavbar";
import SupportChatbot from "./components/SupportChatbot";

// Pages
import HomePage from "./pages/HomePage";
import ChatFeedPage from "./pages/ChatFeedPage";
import TiresTimepiecesPage from "./pages/TiresTimepiecesPage";
import EventsMeetupsPage from "./pages/EventsMeetupsPage";
import AuthPage from "./pages/AuthPage";

import './paddock20.css';

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
              {(effectiveSession || previewMode) && (
                <>
                  <DropdownNavbar />
                </>
              )}
            </header>

            {/* Main content area */}
            <main id={MAIN_CONTENT_ID} className="container mx-auto px-4" tabIndex={-1}>
              {/* Toast notifications with ARIA live region built in */}
              <Toaster />
              
              <Routes>
                {/* Auth route */}
                <Route path="/auth" element={!session && !previewMode ? <AuthPage /> : <Navigate to="/" replace />} />

                {/* Protected routes - Only include pages we've implemented */}
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><EventsMeetupsPage /></ProtectedRoute>} />
                <Route path="/tires-timepieces" element={<ProtectedRoute><TiresTimepiecesPage /></ProtectedRoute>} />
                <Route path="/chat-feed" element={<ProtectedRoute><ChatFeedPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* AI Support Chatbot - Available globally */}
              {(effectiveSession || previewMode) && <SupportChatbot />}
            </main>

            {/* Footer with accessibility information */}
            <footer role="contentinfo" className="py-4 mt-8 border-t border-gray-800">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} GoTime Motorsports - Paddock20™</p>
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
