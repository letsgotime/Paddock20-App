// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useRef } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';

// Define interfaces
interface Location {
  lat: number;
  lon: number;
  placeId?: string;
}

const RoutePlannerPage = () => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [newWaypoint, setNewWaypoint] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [passengerInfo, setPassengerInfo] = useState("");
  const [routeCustomizations, setRouteCustomizations] = useState({
    roundTrip: false,
    scenic: false,
    foodStop: false,
    gasStop: false,
    avoidTolls: false,
    allowTolls: false,
  });
  const [preferredNavApp, setPreferredNavApp] = useState("Google Maps");
  const [weatherData, setWeatherData] = useState<any>(null);

  const handleWaypointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewWaypoint(e.target.value);
  };

  const addWaypoint = () => {
    if (newWaypoint.trim() !== "") {
      setWaypoints([...waypoints, newWaypoint]);
      setNewWaypoint("");
    }
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleRouteCustomizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRouteCustomizations((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Calculate weather-related driving conditions for the route
  const getRoadConditions = async (startLoc: string, endLoc: string) => {
    try {
      // Mock coordinates for this example - in a real app we'd use geocoding
      const mockCoordinates = {
        startLat: 35.2271,
        startLng: -80.8431,
        endLat: 35.7796,
        endLng: -78.6382
      };
      
      // Get weather at start and end locations
      const startWeather = await getWeatherData({
        lat: mockCoordinates.startLat,
        lon: mockCoordinates.startLng
      }, 'imperial');
      
      const endWeather = await getWeatherData({
        lat: mockCoordinates.endLat,
        lon: mockCoordinates.endLng
      }, 'imperial');
      
      // Get one-call weather data for more detailed forecast
      const startForecast = await getOneCallData({
        lat: mockCoordinates.startLat,
        lon: mockCoordinates.startLng
      }, 'imperial');
      
      // Calculate surface temperatures and driving conditions
      const surfaceTemp = Math.round(startWeather.main.temp + (startWeather.clouds.all < 50 ? 8 : 3));
      const roadCondition = getRoadConditionFromWeather(startWeather.weather[0].description, startWeather.main.temp);
      
      // Get vehicle-specific advice
      const vehicleAdvice = getVehicleSpecificAdvice(selectedVehicle, surfaceTemp, roadCondition);
      
      setWeatherData({
        startWeather,
        endWeather,
        startForecast,
        surfaceTemp,
        roadCondition,
        vehicleAdvice
      });
      
      return true;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return false;
    }
  };

  // Helper functions for weather data processing
  const getRoadConditionFromWeather = (description: string, temp: number) => {
    const desc = description.toLowerCase();
    
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return 'Wet - Reduced Traction';
    } else if (desc.includes('snow') || desc.includes('sleet')) {
      return 'Hazardous - Snow Covered';
    } else if (desc.includes('fog')) {
      return 'Reduced Visibility';
    } else if (temp < 32) {
      return 'Potential Black Ice';
    } else if (temp > 90) {
      return 'Hot Surface - Monitor Tire Pressure';
    }
    
    return 'Optimal Driving Conditions';
  };

  // Get vehicle-specific settings based on weather and road conditions
  const getVehicleSpecificAdvice = (vehicle: string, surfaceTemp: number, roadCondition: string) => {
    // Ferrari F8 specific settings - this would be expanded for other vehicles
    if (vehicle.includes('Ferrari F8')) {
      return {
        tirePressure: roadCondition.includes('Hot') ? 'Front: 34 PSI / Rear: 32 PSI' : 'Front: 32 PSI / Rear: 30 PSI',
        torqueSettings: roadCondition.includes('Wet') ? '80 ft-lb' : '96 ft-lb',
        drivingMode: roadCondition.includes('Wet') || roadCondition.includes('Snow') ? 'Wet Mode' : 'Sport Mode',
        tireWarmupTime: Math.max(3, Math.round(10 - surfaceTemp / 10)) + ' minutes'
      };
    }
    
    // Default advice for other vehicles
    return {
      tirePressure: 'Check manufacturer recommendations',
      torqueSettings: 'Standard settings recommended',
      drivingMode: roadCondition.includes('Wet') ? 'Comfort/Eco Mode' : 'Normal Mode',
      tireWarmupTime: Math.max(5, Math.round(15 - surfaceTemp / 10)) + ' minutes'
    };
  };

  const submitRoute = async () => {
    if (!startLocation || !endLocation) {
      alert("Please enter both start and end locations.");
      return;
    }
    
    // Get weather and road conditions
    const weatherLoaded = await getRoadConditions(startLocation, endLocation);
    
    console.log("Start:", startLocation);
    console.log("Waypoints:", waypoints);
    console.log("End:", endLocation);
    console.log("Vehicle:", selectedVehicle);
    console.log("Passenger Info:", passengerInfo);
    console.log("Customizations:", routeCustomizations);
    console.log("Preferred Nav App:", preferredNavApp);
    console.log("Weather Data:", weatherData);

    if (weatherLoaded) {
      alert("Route planned with current weather conditions! Ready to navigate.");
    } else {
      alert("Route planned! Weather data could not be loaded.");
    }
    // Implement real app launch logic here
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🛣️ Route Planner</h1>

      {/* Start Location */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Start Location"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Waypoints */}
      <div className="mb-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Multi-Stop Waypoints</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Add a waypoint"
            value={newWaypoint}
            onChange={handleWaypointChange}
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
          />
          <button
            onClick={addWaypoint}
            className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded"
          >
            ➕ Add Stop
          </button>
        </div>
        <ul className="space-y-2">
          {waypoints.map((wp, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
              <span className="text-white font-openSans">{wp}</span>
              <button
                onClick={() => removeWaypoint(index)}
                className="text-red-400 hover:text-red-300"
              >
                ✖ Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* End Location */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="End Location"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Vehicle Selection */}
      <div className="mb-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Vehicle Selection</h2>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option value="">Select your vehicle</option>
          <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
          <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
          <option value="BMW M4 G82">BMW M4 G82</option>
          {/* Dynamically load from Garage Vault later */}
        </select>
      </div>

      {/* Passenger Info */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Passenger Names (Optional)"
          value={passengerInfo}
          onChange={(e) => setPassengerInfo(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        />
      </div>

      {/* Route Customization */}
      <div className="mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Route Customizations</h2>
        <div className="flex flex-col space-y-2">
          {Object.keys(routeCustomizations).map((key) => (
            <label key={key} className="flex items-center space-x-2 text-white font-openSans">
              <input
                type="checkbox"
                name={key}
                checked={(routeCustomizations as any)[key]}
                onChange={handleRouteCustomizationChange}
                className="form-checkbox text-green-500"
              />
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Preference */}
      <div className="mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Preferred Navigation App</h2>
        <select
          value={preferredNavApp}
          onChange={(e) => setPreferredNavApp(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700"
        >
          <option>Google Maps</option>
          <option>Waze</option>
          <option>Apple Maps</option>
        </select>
      </div>

      {/* Weather/Road Conditions Preview */}
      {weatherData && (
        <div className="mb-8 bg-gray-900 p-4 rounded-lg border border-blue-900">
          <h2 className="text-blue-400 font-orbitron text-2xl mb-4">F1-Grade Driving Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-green-400 mb-2">Current Conditions</h3>
              <p className="text-white">Temperature: {weatherData.startWeather.main.temp}°F</p>
              <p className="text-white">Surface Temperature: {weatherData.surfaceTemp}°F</p>
              <p className="text-white">Weather: {weatherData.startWeather.weather[0].description}</p>
              <p className="text-white">Road Condition: {weatherData.roadCondition}</p>
            </div>
            
            {selectedVehicle && (
              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="text-green-400 mb-2">{selectedVehicle} Settings</h3>
                <p className="text-white">Recommended Tire Pressure: {weatherData.vehicleAdvice.tirePressure}</p>
                <p className="text-white">Torque Setting: {weatherData.vehicleAdvice.torqueSettings}</p>
                <p className="text-white">Optimal Driving Mode: {weatherData.vehicleAdvice.drivingMode}</p>
                <p className="text-white">Tire Warm-up Time: {weatherData.vehicleAdvice.tireWarmupTime}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={submitRoute}
        className="bg-blue-500 hover:bg-blue-400 text-black font-montserrat px-8 py-4 rounded w-full"
      >
        🚀 Plan Route
      </button>
    </div>
  );
};

export default RoutePlannerPage;