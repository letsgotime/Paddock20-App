import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Navbar from "@/components/Navbar";
import { WeatherProvider } from "./contexts/WeatherContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-black font-openSans text-white">
            <Navbar />
            <div className="container mx-auto px-4">
              <Toaster />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/garage" element={<Garage />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/motorsports" element={<Motorsports />} />
                <Route path="/events" element={<Events />} />
                <Route path="/settings" element={<Settings />} />
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
