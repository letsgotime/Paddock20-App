import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import F1PitWallDashboard from '../components/F1PitWallDashboard';

function WeatherRouteAnalysisPage() {
  const { weatherData, loading, error } = useWeather();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-700">
        <h2 className="text-xl font-bold mb-2">Error Loading Weather Data</h2>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <p className="text-sm text-gray-400">
          Please ensure your API keys are set up correctly and try again.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">GoTime Weather Route Analysis</h1>
        <p className="text-gray-400">
          Advanced F1-inspired weather analytics for your daily commute.
        </p>
      </header>
      
      <F1PitWallDashboard weatherData={weatherData} />
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by GoTime Motorsports | Using real-time weather data</p>
      </footer>
    </div>
  );
}

export default WeatherRouteAnalysisPage;