import React from "react";
import WeatherStation from "../components/WeatherStation";

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-blue-500 mb-8">Weather Dashboard</h1>
      
      <div className="mb-12">
        <WeatherStation />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Weather Tips</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Check the forecast before planning outdoor activities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Weather can change rapidly - be prepared with proper clothing</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>UV index can be high even on cloudy days</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>During storms, stay away from open areas and tall structures</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-blue-400 mb-4">About This App</h2>
          <p className="text-gray-300">
            Our weather application provides real-time weather data and forecasts for locations worldwide.
            The app uses the OpenWeatherMap API to bring you accurate, up-to-date information to help you
            plan your day effectively. Features include current conditions, 5-day forecasts, and helpful
            weather advisories.
          </p>
          <div className="mt-4">
            <span className="text-blue-400 font-semibold">Data Sources: </span>
            <span className="text-gray-300">OpenWeatherMap</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-2">Weather Alert</h2>
        <p className="text-gray-300">
          For severe weather alerts and emergency information, please refer to your local weather service
          or national meteorological agency.
        </p>
      </div>
    </div>
  );
}

export default Home;