// /client/src/pages/RoutePlannerPage.tsx

import React, { useState, useEffect } from "react";
import { getWeatherData, getOneCallData } from '@/services/openWeatherService';

// Define interfaces
interface Location {
  lat: number;
  lon: number;
  placeId?: string;
}

interface F1Telemetry {
  surfaceGrip: string;
  windEffect: string;
  aeroDragCoefficient: number;
  corneringGCoefficient: number;
  brakingDistance: string;
  optimalLineNotes: string;
  trackEvolution: string;
  tireDegradation: number;
}

interface ProDriverInsight {
  driverId: string;
  driverName: string;
  team?: string;
  quote: string;
  recommendedSetup: string;
  lapTime?: string;
  videoUrl?: string;
}

interface YoutubeResource {
  id: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  url: string;
  type: 'review' | 'onboard' | 'trackGuide' | 'drivingTips' | 'carSetup';
}

// Sample F1 driver insights data - would be fetched from an API in a real implementation
const F1_DRIVER_INSIGHTS: Record<string, ProDriverInsight[]> = {
  "Blue Ridge Parkway": [
    {
      driverId: "HAM44",
      driverName: "Lewis Hamilton",
      team: "Mercedes AMG",
      quote: "The elevation changes remind me of Spa. Focus on smooth inputs through the sweeping corners.",
      recommendedSetup: "Medium downforce, softer suspension for the undulations.",
      videoUrl: "https://www.youtube.com/watch?v=example1"
    },
    {
      driverId: "VER33",
      driverName: "Max Verstappen",
      team: "Red Bull Racing",
      quote: "Amazing flow to this road. You can really attack the apexes if you have good visibility.",
      recommendedSetup: "Stiff rear end to help with rotation on hairpins.",
      videoUrl: "https://www.youtube.com/watch?v=example2"
    }
  ],
  "Tail of the Dragon": [
    {
      driverId: "LEC16",
      driverName: "Charles Leclerc",
      team: "Ferrari",
      quote: "This reminds me of Monaco without the barriers. Precise turn-in is critical with these blind corners.",
      recommendedSetup: "Maximum steering response, moderate downforce.",
      videoUrl: "https://www.youtube.com/watch?v=example3"
    }
  ],
  "Pacific Coast Highway": [
    {
      driverId: "NOR4",
      driverName: "Lando Norris",
      team: "McLaren",
      quote: "Beautiful coastal road, but watch for changing grip levels where sea spray hits the asphalt.",
      recommendedSetup: "Wind compensation is key here, adjust aero balance accordingly.",
      videoUrl: "https://www.youtube.com/watch?v=example4"
    }
  ]
};

// Sample YouTube resources
const YOUTUBE_RESOURCES: Record<string, YoutubeResource[]> = {
  "Ferrari F8 Tributo": [
    {
      id: "yt1",
      title: "Ferrari F8 Tributo Track Test - Full Onboard Telemetry",
      channel: "Top Gear",
      thumbnailUrl: "https://img.youtube.com/vi/example1/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=example1",
      type: "onboard"
    },
    {
      id: "yt2",
      title: "How to Set Up Ferrari F8 for Track Days - Pro Driver Guide",
      channel: "Driver61",
      thumbnailUrl: "https://img.youtube.com/vi/example2/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=example2",
      type: "carSetup"
    }
  ],
  "Porsche 911 Carrera S": [
    {
      id: "yt3",
      title: "Porsche 911 Mountain Road Masterclass",
      channel: "Everyday Driver",
      thumbnailUrl: "https://img.youtube.com/vi/example3/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=example3",
      type: "drivingTips"
    }
  ],
  "BMW M4 G82": [
    {
      id: "yt4",
      title: "BMW M4 Competition - Track Guide with Telemetry",
      channel: "Misha Charoudin",
      thumbnailUrl: "https://img.youtube.com/vi/example4/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=example4",
      type: "trackGuide"
    }
  ]
};

const RoutePlannerPage = () => {
  // State
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [newWaypoint, setNewWaypoint] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [passengerInfo, setPassengerInfo] = useState("");
  const [routeCustomizations, setRouteCustomizations] = useState({
    scenic: false,
    foodStop: false,
    gasStop: false,
    avoidTolls: false,
    allowTolls: false,
  });
  const [preferredNavApp, setPreferredNavApp] = useState("Google Maps");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [f1Telemetry, setF1Telemetry] = useState<F1Telemetry | null>(null);
  const [driverInsights, setDriverInsights] = useState<ProDriverInsight[]>([]);
  const [youtubeResources, setYoutubeResources] = useState<YoutubeResource[]>([]);
  const [activeTab, setActiveTab] = useState<'weather' | 'telemetry' | 'drivers' | 'youtube'>('weather');
  
  // Get F1 driver insights based on location matches
  useEffect(() => {
    if (endLocation) {
      // Try to find matching insights for the end location
      // This is a simplistic approach - a real implementation would use more sophisticated matching
      const possibleMatches = Object.keys(F1_DRIVER_INSIGHTS);
      const matchedLocation = possibleMatches.find(loc => 
        endLocation.toLowerCase().includes(loc.toLowerCase()) || 
        loc.toLowerCase().includes(endLocation.toLowerCase())
      );
      
      if (matchedLocation && F1_DRIVER_INSIGHTS[matchedLocation]) {
        setDriverInsights(F1_DRIVER_INSIGHTS[matchedLocation]);
      } else {
        setDriverInsights([]);
      }
    }
  }, [endLocation]);
  
  // Get YouTube resources based on selected vehicle
  useEffect(() => {
    if (selectedVehicle && YOUTUBE_RESOURCES[selectedVehicle]) {
      setYoutubeResources(YOUTUBE_RESOURCES[selectedVehicle]);
    } else {
      setYoutubeResources([]);
    }
  }, [selectedVehicle]);

  // Handlers
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

  // Calculate F1-grade telemetry data based on weather conditions and vehicle
  const calculateF1Telemetry = (weather: any, vehicle: string): F1Telemetry => {
    // Base calculations using weather data
    const temp = weather?.main?.temp || 70;
    const humidity = weather?.main?.humidity || 50;
    const pressure = weather?.main?.pressure || 1013.25;
    const windSpeed = weather?.wind?.speed || 5;
    const windDirection = weather?.wind?.deg || 0;
    const clouds = weather?.clouds?.all || 0;
    const description = weather?.weather?.[0]?.description?.toLowerCase() || '';
    
    // Surface grip calculation
    let gripBase = 100; // 0-100 scale
    
    // Temperature affects grip
    if (temp < 45) gripBase -= 15; // Cold surface
    else if (temp > 90) gripBase -= 10; // Hot surface
    
    // Weather conditions affect grip
    if (description.includes('rain') || description.includes('drizzle')) {
      gripBase -= 40; // Wet surface
    } else if (description.includes('snow')) {
      gripBase -= 70; // Snow-covered
    } else if (description.includes('fog') || description.includes('mist')) {
      gripBase -= 5; // Visibility issues
    }
    
    // Humidity affects grip
    if (humidity > 80) gripBase -= 5;
    
    // Vehicle-specific grip adjustments
    if (vehicle.includes('Ferrari F8')) {
      gripBase += 5; // Better tire compound
    } else if (vehicle.includes('Porsche')) {
      gripBase += 7; // Excellent traction control
    }
    
    // Surface grip rating
    let surfaceGrip = 'Poor';
    if (gripBase >= 85) surfaceGrip = 'Excellent';
    else if (gripBase >= 70) surfaceGrip = 'Good';
    else if (gripBase >= 50) surfaceGrip = 'Moderate';
    
    // Wind effect calculations
    const windEffect = windSpeed > 15 
      ? 'High (Crosswind compensation required)' 
      : (windSpeed > 8 ? 'Moderate' : 'Low');
    
    // Aero drag coefficient (lower is better)
    const aeroDragCoefficient = 0.35 - (humidity / 1000) + (pressure - 1013.25) / 10000;
    
    // Cornering G-force coefficient (higher is better)
    const corneringGCoefficient = (gripBase / 100) * 1.5; // Max of ~1.5G for street cars
    
    // Braking distance (in feet, from 60mph)
    const brakingDistance = gripBase > 70 
      ? "Optimal (112-120 ft)" 
      : (gripBase > 50 ? "Extended (125-140 ft)" : "Compromised (145-180 ft)");
    
    // Optimal line notes
    const optimalLineNotes = description.includes('rain') 
      ? "Avoid racing line, seek higher ground, later braking points"
      : "Standard racing line optimal, early apex on corners";
    
    // Track evolution prediction
    const trackEvolution = clouds < 30 && temp > 65 
      ? "Improving (surface heating will increase grip)"
      : (description.includes('rain') ? "Deteriorating" : "Stable");
    
    // Tire degradation factor (percentage per 10 miles)
    let tireDegradation = 2.5; // Base 2.5% per 10 miles
    
    if (temp > 85) tireDegradation += 1; // Hot weather
    if (description.includes('rain')) tireDegradation -= 0.5; // Wet reduces wear
    
    // Vehicle-specific tire wear
    if (vehicle.includes('Ferrari')) {
      tireDegradation += 0.7; // Performance tires wear faster
    }
    
    return {
      surfaceGrip,
      windEffect,
      aeroDragCoefficient: parseFloat(aeroDragCoefficient.toFixed(4)),
      corneringGCoefficient: parseFloat(corneringGCoefficient.toFixed(2)),
      brakingDistance,
      optimalLineNotes,
      trackEvolution,
      tireDegradation: parseFloat(tireDegradation.toFixed(2))
    };
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
      
      // Calculate F1-style telemetry
      const telemetry = calculateF1Telemetry(startWeather, selectedVehicle);
      
      setWeatherData({
        startWeather,
        endWeather,
        startForecast,
        surfaceTemp,
        roadCondition,
        vehicleAdvice
      });
      
      setF1Telemetry(telemetry);
      
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
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Background image */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0 overflow-hidden">
        <img 
          src="/attached_assets/Stock Photos/ferrari-mountain-road.png" 
          alt="Mountain road" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10">
        {/* Ferrari-inspired header with racing stripe */}
        <div className="relative mb-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          <h1 className="text-blue-400 font-orbitron text-4xl pt-4 mb-2 border-b border-gray-800 pb-4">🛣️ PADDOCK20™ ROUTE PLANNER</h1>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600"></div>
          <p className="text-gray-400 italic mt-2">Powered by F1 Telemetry • Pro Driver Insights • Weather Analytics</p>
        </div>

        {/* Two-column layout for route inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            {/* Start Location */}
            <div>
              <label htmlFor="startLocation" className="block text-gray-300 mb-2 font-orbitron">START LOCATION</label>
              <input
                id="startLocation"
                type="text"
                placeholder="e.g., Charlotte, NC"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Waypoints */}
            <div>
              <label className="block text-gray-300 mb-2 font-orbitron">WAYPOINTS</label>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Add a waypoint"
                  value={newWaypoint}
                  onChange={handleWaypointChange}
                  className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
                <button
                  onClick={addWaypoint}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-md transition duration-200"
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {waypoints.map((wp, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <span className="text-white">{wp}</span>
                    <button
                      onClick={() => removeWaypoint(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* End Location */}
            <div>
              <label htmlFor="endLocation" className="block text-gray-300 mb-2 font-orbitron">DESTINATION</label>
              <input
                id="endLocation"
                type="text"
                placeholder="e.g., Asheville, NC"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Vehicle Selection */}
            <div>
              <label htmlFor="vehicleSelect" className="block text-gray-300 mb-2 font-orbitron">SELECT VEHICLE</label>
              <select
                id="vehicleSelect"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              >
                <option value="">Select your vehicle</option>
                <option value="Ferrari F8 Tributo">Ferrari F8 Tributo</option>
                <option value="Porsche 911 Carrera S">Porsche 911 Carrera S</option>
                <option value="BMW M4 G82">BMW M4 G82</option>
                {/* Dynamically load from Garage Vault later */}
              </select>
            </div>

            {/* Passenger Info */}
            <div>
              <label htmlFor="passengerInfo" className="block text-gray-300 mb-2 font-orbitron">PASSENGERS</label>
              <input
                id="passengerInfo"
                type="text"
                placeholder="Passenger Names (Optional)"
                value={passengerInfo}
                onChange={(e) => setPassengerInfo(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Route Customization */}
            <div>
              <label className="block text-gray-300 mb-2 font-orbitron">ROUTE PREFERENCES</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(routeCustomizations).map((key) => (
                  <label key={key} className="flex items-center space-x-2 text-white">
                    <input
                      type="checkbox"
                      name={key}
                      checked={(routeCustomizations as any)[key]}
                      onChange={handleRouteCustomizationChange}
                      className="form-checkbox text-red-600 rounded"
                    />
                    <span className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Preference */}
            <div>
              <label htmlFor="navApp" className="block text-gray-300 mb-2 font-orbitron">NAVIGATION APP</label>
              <select
                id="navApp"
                value={preferredNavApp}
                onChange={(e) => setPreferredNavApp(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:ring-1 focus:ring-red-600"
              >
                <option>Google Maps</option>
                <option>Waze</option>
                <option>Apple Maps</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button - Ferrari-styled */}
        <div className="flex justify-center mb-10">
          <button
            onClick={submitRoute}
            className="bg-red-600 hover:bg-red-700 text-white font-orbitron text-xl px-10 py-4 rounded-md shadow-lg transform transition duration-300 hover:scale-105"
          >
            ANALYZE ROUTE CONDITIONS
          </button>
        </div>

        {/* Results Section with Tabs */}
        {(weatherData || f1Telemetry || driverInsights.length > 0 || youtubeResources.length > 0) && (
          <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800 shadow-lg">
            <div className="border-b border-gray-800 mb-6">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`px-4 py-2 font-medium rounded-t-lg ${
                    activeTab === 'weather' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Weather Conditions
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`px-4 py-2 font-medium rounded-t-lg ${
                    activeTab === 'telemetry' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  F1 Telemetry
                </button>
                <button
                  onClick={() => setActiveTab('drivers')}
                  className={`px-4 py-2 font-medium rounded-t-lg ${
                    activeTab === 'drivers' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Pro Driver Insights
                </button>
                <button
                  onClick={() => setActiveTab('youtube')}
                  className={`px-4 py-2 font-medium rounded-t-lg ${
                    activeTab === 'youtube' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Video Resources
                </button>
              </nav>
            </div>

            {/* Weather Tab Content */}
            {activeTab === 'weather' && weatherData && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-orbitron text-red-500 mb-4">CURRENT DRIVING CONDITIONS</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-blue-400 font-semibold">Atmospheric Conditions</h3>
                      <div className="text-2xl text-yellow-500">
                        {weatherData.startWeather.weather[0].main === 'Clear' ? '☀️' : 
                         weatherData.startWeather.weather[0].main === 'Clouds' ? '☁️' :
                         weatherData.startWeather.weather[0].main === 'Rain' ? '🌧️' : '🌤️'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-white">
                      <div>
                        <p className="text-gray-400 text-sm">Air Temperature</p>
                        <p className="text-xl">{weatherData.startWeather.main.temp}°F</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Surface Temperature</p>
                        <p className="text-xl">{weatherData.surfaceTemp}°F</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Humidity</p>
                        <p>{weatherData.startWeather.main.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Wind</p>
                        <p>{weatherData.startWeather.wind.speed} mph</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Conditions</p>
                        <p>{weatherData.startWeather.weather[0].description}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Road Surface</p>
                        <p>{weatherData.roadCondition}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedVehicle && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow">
                      <div className="flex items-center mb-4">
                        <h3 className="text-blue-400 font-semibold">{selectedVehicle} Recommendations</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                          <span className="text-gray-300">Tire Pressure:</span>
                          <span className="text-white font-medium">{weatherData.vehicleAdvice.tirePressure}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                          <span className="text-gray-300">Torque Settings:</span>
                          <span className="text-white font-medium">{weatherData.vehicleAdvice.torqueSettings}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                          <span className="text-gray-300">Recommended Mode:</span>
                          <span className="text-white font-medium">{weatherData.vehicleAdvice.drivingMode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Tire Warmup:</span>
                          <span className="text-white font-medium">{weatherData.vehicleAdvice.tireWarmupTime}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* F1 Telemetry Tab Content */}
            {activeTab === 'telemetry' && f1Telemetry && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-orbitron text-red-500 mb-4">ADVANCED DRIVING TELEMETRY</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow">
                    <h3 className="text-blue-400 font-semibold mb-4">Surface & Tire Analysis</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 text-sm">Surface Grip</span>
                          <span className="text-white text-sm font-medium">{f1Telemetry.surfaceGrip}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              f1Telemetry.surfaceGrip === 'Excellent' ? 'bg-green-500 w-[90%]' :
                              f1Telemetry.surfaceGrip === 'Good' ? 'bg-green-400 w-[70%]' :
                              f1Telemetry.surfaceGrip === 'Moderate' ? 'bg-yellow-500 w-[50%]' :
                              'bg-red-500 w-[30%]'
                            }`}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-300 text-sm">Tire Degradation (per 10 miles)</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-white">{f1Telemetry.tireDegradation}%</span>
                          <div className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                            {f1Telemetry.tireDegradation < 2 ? 'Low Wear' : 
                             f1Telemetry.tireDegradation < 3 ? 'Normal' : 'High Wear'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-gray-400 mb-2">Track Evolution</h4>
                        <p className="text-white">{f1Telemetry.trackEvolution}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-gray-400 mb-2">Optimal Racing Line</h4>
                        <p className="text-white text-sm">{f1Telemetry.optimalLineNotes}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow">
                    <h3 className="text-blue-400 font-semibold mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                        <span className="text-gray-300">Cornering Force</span>
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-white">{f1Telemetry.corneringGCoefficient} G</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                        <span className="text-gray-300">Aero Drag Coefficient</span>
                        <span className="text-white">{f1Telemetry.aeroDragCoefficient}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                        <span className="text-gray-300">Wind Effect</span>
                        <span className="text-white">{f1Telemetry.windEffect}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Braking Distance (60-0 mph)</span>
                        <span className="text-white">{f1Telemetry.brakingDistance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Pro Driver Insights Tab Content */}
            {activeTab === 'drivers' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-orbitron text-red-500 mb-4">PRO DRIVER INSIGHTS</h2>
                
                {driverInsights.length > 0 ? (
                  <div className="space-y-6">
                    {driverInsights.map((driver, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl text-white">
                            {driver.driverName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-white">{driver.driverName}</h3>
                            <p className="text-blue-400 text-sm">{driver.team}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-white italic">"{driver.quote}"</p>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-3">
                          <h4 className="text-gray-400 mb-2">Recommended Setup:</h4>
                          <p className="text-white">{driver.recommendedSetup}</p>
                        </div>
                        
                        {driver.videoUrl && (
                          <div className="mt-4">
                            <a 
                              href={driver.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-red-500 hover:text-red-400"
                            >
                              <span>Watch Onboard Footage</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-6 rounded-lg text-center">
                    <p className="text-gray-400">No pro driver insights available for this route or vehicle.</p>
                    <p className="text-white mt-2">Try selecting a popular driving route like "Blue Ridge Parkway" or "Tail of the Dragon".</p>
                  </div>
                )}
              </div>
            )}
            
            {/* YouTube Resources Tab Content */}
            {activeTab === 'youtube' && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-orbitron text-red-500 mb-4">VIDEO RESOURCES</h2>
                
                {youtubeResources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {youtubeResources.map((resource, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow">
                        <div className="aspect-video bg-gray-900 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-white font-medium">{resource.title}</h3>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {resource.type === 'review' ? 'Review' :
                               resource.type === 'onboard' ? 'Onboard' :
                               resource.type === 'trackGuide' ? 'Track Guide' :
                               resource.type === 'drivingTips' ? 'Driving Tips' : 'Setup'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{resource.channel}</p>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block text-red-500 hover:text-red-400 text-sm font-medium"
                          >
                            Watch on YouTube →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-6 rounded-lg text-center">
                    <p className="text-gray-400">No video resources available for the selected vehicle.</p>
                    <p className="text-white mt-2">Try selecting a vehicle like "Ferrari F8 Tributo" to see available content.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Maps Integration Section */}
        <div className="mt-10 bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-orbitron text-blue-400 mb-4">MAPS INTEGRATION</h2>
          <p className="text-gray-300 mb-4">Your planned route will open in your preferred navigation app with all waypoints included.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" alt="Google Maps" className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-white font-medium">Google Maps</h3>
              <p className="text-gray-400 text-sm">Full route with real-time traffic</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <img src="https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Waze_logo.svg/1200px-Waze_logo.svg.png" alt="Waze" className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-white font-medium">Waze</h3>
              <p className="text-gray-400 text-sm">Community-driven hazard alerts</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Apple_Maps_logo_%28iOS%29.svg/1024px-Apple_Maps_logo_%28iOS%29.svg.png" alt="Apple Maps" className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-white font-medium">Apple Maps</h3>
              <p className="text-gray-400 text-sm">Seamless iOS integration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerPage;