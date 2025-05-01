import React from 'react';
import { CloudRain } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import WeatherPaddockConfig from '../utils/DashboardConfig';
import CitySearch from '../components/CitySearch';
import LocationManager from '../components/LocationManager';
import CommuteTimeEstimator from '../components/CommuteTimeEstimator';
import DriveModeRecommendations from '../components/DriveModeRecommendations';
import TireStrategyComponent from '../components/TireStrategyComponent';
import WeatherAlertsDashboard from '../components/WeatherAlertsDashboard';

/**
 * WeatherPaddockDashboard - Main dashboard view for the Weather Paddock application
 */
const WeatherPaddockDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center mb-2">
          <CloudRain className="h-8 w-8 text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">WEATHER PADDOCK</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-gray-300">
          <div>
            <h3 className="text-blue-400 font-medium mb-1">F1-Inspired Precision</h3>
            <p>Real-time weather insights with professional motorsport-grade telemetry data visualization.</p>
          </div>
          
          <div>
            <h3 className="text-blue-400 font-medium mb-1">Road Performance</h3>
            <p>Optimize driving strategy with road condition analysis, grip estimations and tire recommendations.</p>
          </div>
          
          <div>
            <h3 className="text-blue-400 font-medium mb-1">Travel Optimization</h3>
            <p>Enhanced commute planning with weather-adjusted travel times and condition alerts.</p>
          </div>
        </div>
      </header>
      
      <main>
        <DashboardLayout config={WeatherPaddockConfig}>
          {/* Location Section */}
          <CitySearch id="search" />
          <LocationManager id="location-manager" />
          
          {/* Drive Time Analysis Section */}
          <CommuteTimeEstimator id="commute-time" />
          <DriveModeRecommendations id="drive-mode" />
          <TireStrategyComponent id="tire-strategy" />
          
          {/* Weather Metrics Section */}
          <WeatherAlertsDashboard id="weather-alerts" />
          
          {/* Empty placeholder for remaining components */}
          {['current-conditions', 'forecast', 'hourly-forecast', 'air-quality', 'solar-elevation'].map(id => (
            <div 
              key={id} 
              id={id} 
              className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 h-64 flex items-center justify-center"
            >
              <p className="text-gray-400">Feature Coming Soon</p>
            </div>
          ))}
        </DashboardLayout>
      </main>
      
      <footer className="mt-12 border-t border-gray-800 pt-6 pb-12 text-center text-gray-500 text-sm">
        <p>WEATHER PADDOCK | Powered by GoTime Motorsports</p>
        <p className="mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default WeatherPaddockDashboard;