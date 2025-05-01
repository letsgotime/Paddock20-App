import React, { useState, useEffect, lazy, Suspense } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { useWeather } from '../contexts/WeatherContext';
import WorldClockPanel from '../components/WorldClockPanel';
import { getDriveRecommendations } from '../services/driveRecommendations';
import { fallbackDriveWindows, fallbackDrivingTips, fallbackPerformanceAdjustments } from '../utils/fallbackData';
import { Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';

// Lazy load the automotive weather component to improve initial loading performance
const AutomotiveEnthusiastWeather = lazy(() => import('../components/AutomotiveEnthusiastWeather'));

// Loading component for suspended content
const WeatherLoadingFallback = () => (
  <div className="p-6 text-center rounded-lg bg-gradient-to-br from-gray-900 to-black">
    <p className="text-blue-400 text-xl font-orbitron mb-4">Loading Automotive Weather Data...</p>
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
  </div>
);

function Weather() {
  const { currentWeather, location, isLoading: isWeatherContextLoading, units } = useWeather();
  const [isPageReady, setIsPageReady] = useState(false);
  const [driveWindows, setDriveWindows] = useState([]);
  const [drivingTips, setDrivingTips] = useState([]);
  const [performanceAdjustments, setPerformanceAdjustments] = useState([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);
  
  // Add a controlled delay to ensure API-driven data is loaded properly
  useEffect(() => {
    if (!isWeatherContextLoading) {
      // Add a short delay to allow all API data to propagate
      const timer = setTimeout(() => {
        setIsPageReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isWeatherContextLoading]);
  
  // Force the component to render even if API encounters errors
  useEffect(() => {
    const forceRender = setTimeout(() => {
      if (!isPageReady) {
        console.log("Force rendering weather components after timeout");
        setIsPageReady(true);
      }
    }, 2000);
    
    return () => clearTimeout(forceRender);
  }, [isPageReady]);

  // Load drive recommendations from API when location is available
  useEffect(() => {
    async function loadDriveRecommendations() {
      if (!location || !location.lat || !location.lon) return;

      try {
        setIsRecommendationsLoading(true);
        setRecommendationsError(null);
        
        const data = await getDriveRecommendations(
          { lat: location.lat, lon: location.lon }, 
          units
        );
        
        // If we got data from the API, use it
        if (data && data.driveWindows && data.driveWindows.length > 0) {
          setDriveWindows(data.driveWindows);
          setDrivingTips(data.drivingTips || []);
          setPerformanceAdjustments(data.performanceAdjustments || []);
        } else {
          // If no API data is available, use the fallback data
          console.log("Using fallback driving recommendations data");
          setDriveWindows(fallbackDriveWindows);
          setDrivingTips(fallbackDrivingTips);
          setPerformanceAdjustments(fallbackPerformanceAdjustments);
        }
      } catch (error) {
        console.error("Failed to load drive recommendations:", error);
        setRecommendationsError("Unable to load real-time drive recommendations.");
        
        // Use fallback data on error
        console.log("Using fallback driving recommendations data due to API error");
        setDriveWindows(fallbackDriveWindows);
        setDrivingTips(fallbackDrivingTips);
        setPerformanceAdjustments(fallbackPerformanceAdjustments);
      } finally {
        setIsRecommendationsLoading(false);
      }
    }
    
    loadDriveRecommendations();
  }, [location, units]);

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <span 
          key={i} 
          className={i <= rating ? "text-blue-400" : "text-gray-600"}
        >
          ★
        </span>
      );
    }
    
    return <div className="inline-flex">{stars}</div>;
  };

  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      {/* Page header with proper heading hierarchy */}
      <header className="mb-10 text-center">
        <h1 className="apex-header text-3xl mb-2">Paddock20™ Weather Hub</h1>
        <p className="text-gray-400">
          F1-inspired automotive weather analytics and drive recommendations
        </p>
      </header>
      
      {/* Global Time & Conditions - uses the centralized WeatherContext */}
      <section className="mb-6" aria-labelledby="global-circuit-heading">
        <h2 id="global-circuit-heading" className="apex-header-green text-xl mb-4">Global Time & Conditions</h2>
        <WorldClockPanel />
      </section>
      
      {/* F1-style motorsport weather station - lazy loaded for performance */}
      <section className="mb-10" aria-labelledby="paddock-weather-heading">
        <h2 id="paddock-weather-heading" className="apex-header-green text-xl mb-4">Automotive Weather Dashboard</h2>
        <Suspense fallback={<WeatherLoadingFallback />}>
          {isPageReady && <AutomotiveEnthusiastWeather />}
        </Suspense>
      </section>

      {/* Upcoming Drive Planner Section - API-driven */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="drive-planner-heading">
        <h2 id="drive-planner-heading" className="apex-header text-xl mb-4">Upcoming Drive Planner</h2>
        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-500 font-semibold">Optimal Drive Windows</h3>
            <span className="text-xs text-gray-400">Next 48 Hours</span>
          </div>
          
          {isRecommendationsLoading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading driving recommendations...</p>
            </div>
          ) : recommendationsError ? (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/40 text-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-gray-300">{recommendationsError}</p>
              <p className="text-gray-400 text-sm mt-2">Weather data is still available for planning your drive</p>
            </div>
          ) : driveWindows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {driveWindows.map((window, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-r ${window.colorClass} p-3 rounded-lg border ${window.borderClass}`}
                >
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{window.day}</span>
                    <span className="text-blue-400">{renderStars(window.rating)}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{window.timeRange}</p>
                  <p className="text-gray-400 text-xs mt-2">{window.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-gray-800/20 border border-gray-700 text-center">
              <p className="text-gray-300">No optimal driving windows available for the next 48 hours.</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for updated recommendations</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Tips Section - API-driven */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="quick-tips-heading">
        <h2 id="quick-tips-heading" className="apex-header text-xl mb-4">Driving Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2 flex items-center">
              <Thermometer className="w-4 h-4 mr-2" />
              Today's Driving Tips
            </h3>
            {isRecommendationsLoading ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading driving tips...</p>
              </div>
            ) : drivingTips.length > 0 ? (
              <ul className="text-gray-300 text-sm space-y-2">
                {drivingTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>{tip.tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No driving tips available based on current conditions.</p>
            )}
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2 flex items-center">
              <Wind className="w-4 h-4 mr-2" />
              Performance Adjustments
            </h3>
            {isRecommendationsLoading ? (
              <div className="py-4 text-center">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading performance data...</p>
              </div>
            ) : performanceAdjustments.length > 0 ? (
              <ul className="text-gray-300 text-sm space-y-2">
                {performanceAdjustments.map((adjustment, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>{adjustment.adjustment}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No performance adjustments available based on current conditions.</p>
            )}
          </div>
        </div>
      </section>

      {/* Vehicle-Specific Recommendations */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="vehicle-recommendations-heading">
        <h2 id="vehicle-recommendations-heading" className="apex-header text-xl mb-4">Vehicle-Specific Recommendations</h2>
        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-green-500 font-semibold">Select Your Vehicle</h3>
            <div className="mt-2 sm:mt-0 flex items-center">
              <select className="bg-black border border-gray-700 text-white rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Select vehicle --</option>
                <option value="911">Porsche 911 Carrera S</option>
                <option value="m3">BMW M3 Competition</option>
                <option value="gt">Ford Mustang GT</option>
                <option value="miata">Mazda MX-5 Miata</option>
              </select>
              <button className="ml-2 px-3 py-1 bg-blue-900/50 text-blue-400 rounded text-sm hover:bg-blue-800/50">Load</button>
            </div>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">Select a vehicle to view tailored performance recommendations based on current weather conditions</p>
          </div>
        </div>
      </section>

      {/* Weather accessibility information */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading" className="apex-header-green text-xl mb-4">Accessibility Features</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Weather data is fully accessible to screen readers</li>
          <li>Use the "Listen to Weather Report" button to hear detailed weather information</li>
          <li>All weather conditions include text alternatives to emoji representations</li>
          <li>Weather alerts and driving recommendations are optimized for assistive technologies</li>
          <li>Keyboard navigation is fully supported throughout the weather interface</li>
        </ul>
      </section>
    </div>
  );
}

export default Weather;