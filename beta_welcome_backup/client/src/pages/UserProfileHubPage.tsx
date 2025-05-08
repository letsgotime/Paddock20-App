import React, { useEffect } from 'react';
import UserProfileHub from '../components/UserProfileHub';
import ProfileDataCollector from '../services/ProfileDataCollector';
import { useWeather } from '../contexts/FixedWeatherContext';
import { useVehicle } from '../hooks/useVehicle';
import { useAuth } from '../hooks/useAuth';

const UserProfileHubPage: React.FC = () => {
  // Get authenticated user data
  const { user } = useAuth();
  
  // Fetch all the context data we need to populate the profile
  const { weatherData } = useWeather();
  const { activeVehicle, vehicles } = useVehicle();
  
  // Feed data into the ProfileDataCollector when component mounts or data changes
  useEffect(() => {
    // Log page view (tracks user activity)
    ProfileDataCollector.logPageView('UserProfileHubPage');
    
    // Feed weather data into the profile
    if (weatherData) {
      ProfileDataCollector.collectWeatherData(weatherData);
    }
    
    // Feed vehicle data if available
    if (activeVehicle) {
      // This syncs the active vehicle from the VehicleContext to the profile
      ProfileDataCollector.syncVehicleFromContext(activeVehicle);
      console.log('Active vehicle synced with profile:', activeVehicle.make, activeVehicle.model);
    }
    
    // Also sync any other vehicles in the garage
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(vehicle => {
        if (vehicle !== activeVehicle) {
          ProfileDataCollector.syncVehicleFromContext(vehicle);
        }
      });
      console.log('All vehicles synced with profile. Total vehicles:', vehicles.length);
    }
  }, [weatherData, activeVehicle, vehicles]);
  
  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24">
      {/* Background image with reduced opacity */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 opacity-20"
        style={{
          backgroundImage: "url('/assets/images/f1-stadium-sunset.png')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Main content container */}
      <div className="relative z-10 w-full max-w-[100%] sm:max-w-[1200px] mx-auto px-2 sm:px-4 pb-6">
        {/* Page header - consistent with other pages */}
        <div className="mb-4 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold font-orbitron">
            <span className="text-[#4B9CD3]">DRIVE</span>
            <span className="text-white">R </span>
            <span className="text-green-500">PROFILE</span>
          </h1>
          <p className="text-[#4B9CD3] font-orbitron text-lg sm:text-xl mt-2">YOUR AUTOMOTIVE IDENTITY</p>
        </div>
        
        {/* Inspirational Tagline */}
        <div className="mb-6">
          <p className="text-white text-center text-xl">Drive Like a Champion. Build Your Legacy.</p>
        </div>
        
        {/* User Profile Component */}
        <div className="mb-10">
          <UserProfileHub />
        </div>
        
        {/* Data exchange explanation - help users understand what's happening */}
        <div className="bg-black/40 border border-blue-900/30 rounded-lg p-4 mb-8 text-center">
          <h3 className="text-blue-400 text-lg mb-2 font-orbitron">INTEGRATED DRIVER DATA</h3>
          <p className="text-gray-300 text-sm max-w-3xl mx-auto">
            Your Driver Profile connects with all aspects of your automotive experience. 
            Weather conditions, vehicle data, drive logs, and achievement progress are 
            continuously synced to provide you with a complete picture of your driving life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHubPage;