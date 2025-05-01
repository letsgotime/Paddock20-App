import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useWeather } from "../contexts/WeatherContext";
import { AutomotiveWeatherData } from "../types/automotive-weather";
import OneTapWeatherSnapshot from "../components/OneTapWeatherSnapshot";
import WorldClockPanel from "../components/WorldClockPanel";
import { 
  Thermometer, Droplets, Wind, Sun, CloudRain, Gauge, 
  Compass, Timer, Car, MapPin, BookOpen, Camera, Calendar,
  User, Settings, Brain, SprayCan, Check, Clock, Award, Wrench
} from "lucide-react";

const Paddock20HomePage: React.FC = () => {
  const { weatherData, automotiveWeatherData } = useWeather();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeSection, setActiveSection] = useState('command-center');
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const sessionHours = Math.floor(elapsedTime / 3600);
  const sessionMinutes = Math.floor((elapsedTime % 3600) / 60);
  const sessionSeconds = elapsedTime % 60;
  const sessionTime = `${sessionHours.toString().padStart(2, '0')}:${sessionMinutes.toString().padStart(2, '0')}:${sessionSeconds.toString().padStart(2, '0')}`;
  
  // Format date & time for display
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Dynamic carbon fiber racing background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 opacity-25"
        style={{
          backgroundImage: "url('/assets/images/carbon-fiber-pattern-dark.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Main content with F1-style grid layout */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* F1-style Command Center Header */}
        <header className="mb-6 bg-gradient-to-r from-black/95 via-gray-900/90 to-black/95 rounded-lg p-4 border border-blue-900/40 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-8">
                <h1 className="text-blue-400 font-orbitron text-2xl md:text-4xl font-bold tracking-wider">PADDOCK<span className="text-green-500">20</span>™</h1>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-mono">COMMAND CENTER</span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className="flex flex-col mr-4">
                    <span className="text-blue-400/80 text-xs uppercase font-mono">LOCAL TIME</span>
                    <span className="text-white text-xl font-mono font-bold tracking-wider">{formattedTime}</span>
                  </div>
                  <div className="bg-blue-900/20 px-3 py-2 rounded border border-blue-900/30">
                    <span className="text-gray-400 text-xs font-mono">DATE</span>
                    <div className="text-white text-sm font-medium">{formattedDate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-black/60 flex flex-col items-center justify-center px-3 py-2 rounded border border-blue-900/40">
                <span className="text-blue-400/70 text-xs mb-1 font-mono">SESSION</span>
                <div className="flex items-center">
                  <Timer className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-white text-sm font-mono">{sessionTime}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 px-4 py-2 rounded border border-green-800/40">
                <span className="text-green-400/70 text-xs font-mono">STATUS</span>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
              </div>
              <div className="bg-blue-900/20 px-4 py-2 rounded border border-blue-900/40">
                <span className="text-blue-400/70 text-xs font-mono">ENGINE</span>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-white text-sm font-bold">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Access Navigation Tabs - F1 Pit Wall Style */}
        <div className="mb-6 bg-gradient-to-r from-black/90 via-gray-900/80 to-black/90 rounded-lg border border-blue-900/30 overflow-x-auto hide-scrollbar">
          <div className="flex p-1">
            {[
              { id: 'command-center', label: 'Command Center', icon: <Gauge className="h-4 w-4" /> },
              { id: 'driver-weather', label: 'Driver Weather', icon: <CloudRain className="h-4 w-4" /> },
              { id: 'motorsports-gallery', label: 'Gallery', icon: <Camera className="h-4 w-4" /> },
              { id: 'drive-journal', label: 'Drive Journal', icon: <BookOpen className="h-4 w-4" /> },
              { id: 'route-planner', label: 'Route Planner', icon: <MapPin className="h-4 w-4" /> },
              { id: 'garage-vault', label: 'Garage', icon: <Car className="h-4 w-4" /> },
              { id: 'manifestation', label: 'Manifestation', icon: <Brain className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center px-4 py-2 whitespace-nowrap rounded-md transition-colors ${
                  activeSection === tab.id 
                    ? 'bg-blue-900/50 text-blue-400 border border-blue-500/40' 
                    : 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.id === 'motorsports-gallery' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-800/60 text-green-400 text-xs rounded-full animate-pulse">NEW</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area - Changes based on active section */}
        <div className="min-h-[600px]">
          {activeSection === 'command-center' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Weather & Time */}
              <div className="lg:col-span-1">
                {/* Weather Snapshot */}
                <div className="mb-6 bg-gradient-to-r from-black/80 to-gray-900/70 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-blue-400 font-orbitron text-lg">Weather Station</h3>
                    <Link to="/new-weather-center" className="text-green-500 text-xs hover:text-green-400 transition-colors">
                      Full Weather Center →
                    </Link>
                  </div>
                  <OneTapWeatherSnapshot className="h-full" />
                </div>
                
                {/* World Clock - F1 Style */}
                <div className="mb-6 bg-gradient-to-r from-black/80 to-gray-900/70 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-blue-400 font-orbitron text-lg">Time Stations</h3>
                    <Link to="/world-clocks" className="text-green-500 text-xs hover:text-green-400 transition-colors">
                      Manage Clocks →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-black/60 rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-blue-400 text-xs uppercase">LOCAL</div>
                          <div className="text-white text-xl font-mono font-bold">
                            {new Date().toLocaleTimeString('en-US', { 
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="bg-blue-900/30 px-2 py-1 rounded text-xs text-blue-300">
                          Home Base
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Time Zones */}
                    <div className="bg-black/40 rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-gray-400 text-xs uppercase">GMT/UTC</div>
                          <div className="text-white text-lg font-mono">
                            {new Date().toLocaleTimeString('en-GB', { 
                              timeZone: 'GMT',
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Reference
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-lg p-3 border border-blue-900/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-gray-400 text-xs uppercase">CET</div>
                          <div className="text-white text-lg font-mono">
                            {new Date().toLocaleTimeString('de-DE', { 
                              timeZone: 'Europe/Berlin',
                              hour12: false, 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Maranello
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center & Right Column - F1 Dashboard */}
              <div className="lg:col-span-2">
                {/* Driver Metrics Dashboard - F1 Pit Wall Style */}
                <div className="mb-6 bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-blue-400 font-orbitron text-lg">Driver Intelligence</h3>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                      <span className="text-green-400 text-xs">LIVE TELEMETRY</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Air Temp</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {weatherData && weatherData.main && typeof weatherData.main.temp === 'number' 
                          ? weatherData.main.temp.toFixed(1) + "°F" 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Surface Temp</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {automotiveWeatherData && 
                         automotiveWeatherData.automotive_metrics && 
                         automotiveWeatherData.automotive_metrics.track_surface && 
                         typeof automotiveWeatherData.automotive_metrics.track_surface.temperature === 'number'
                          ? automotiveWeatherData.automotive_metrics.track_surface.temperature.toFixed(1) + "°F"
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Humidity</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {weatherData && weatherData.main && typeof weatherData.main.humidity === 'number'
                          ? weatherData.main.humidity + "%" 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">UV Index</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {automotiveWeatherData && 
                         automotiveWeatherData.conditions && 
                         typeof automotiveWeatherData.conditions.uv_index === 'number'
                          ? automotiveWeatherData.conditions.uv_index.toFixed(1)
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Dew Point</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {automotiveWeatherData && 
                         automotiveWeatherData.conditions && 
                         typeof automotiveWeatherData.conditions.humidity === 'number'
                          ? automotiveWeatherData.conditions.humidity.toFixed(1) + "%"
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-3 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Wind Speed</div>
                      <div className="text-white text-xl font-mono font-semibold">
                        {weatherData && weatherData.wind && typeof weatherData.wind.speed === 'number'
                          ? weatherData.wind.speed + " mph" 
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Advanced Telemetry */}
                  <div className="bg-black/60 rounded-lg border border-gray-800 p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-blue-400 text-xs uppercase tracking-wider font-semibold">Drive Conditions</div>
                      <div className="text-green-400 text-xs">OPTIMIZED</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Surface Condition</div>
                        <div className="text-white text-sm font-medium">
                          {automotiveWeatherData && 
                           automotiveWeatherData.automotive_metrics && 
                           automotiveWeatherData.automotive_metrics.track_surface && 
                           automotiveWeatherData.automotive_metrics.track_surface.condition
                            ? automotiveWeatherData.automotive_metrics.track_surface.condition
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Grip Level</div>
                        <div className="text-white text-sm font-medium">
                          {automotiveWeatherData && 
                           automotiveWeatherData.automotive_metrics && 
                           automotiveWeatherData.automotive_metrics.track_surface && 
                           automotiveWeatherData.automotive_metrics.track_surface.grip_level
                            ? automotiveWeatherData.automotive_metrics.track_surface.grip_level
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Power Adjustment</div>
                        <div className="text-white text-sm font-medium">
                          {automotiveWeatherData && 
                           automotiveWeatherData.automotive_metrics && 
                           automotiveWeatherData.automotive_metrics.drive_recommendations && 
                           typeof automotiveWeatherData.automotive_metrics.drive_recommendations.torque_management?.recommended_percentage === 'number'
                            ? (automotiveWeatherData.automotive_metrics.drive_recommendations.torque_management.recommended_percentage > 0 ? "+" : "") + 
                              automotiveWeatherData.automotive_metrics.drive_recommendations.torque_management.recommended_percentage + "%"
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Visibility</div>
                        <div className="text-white text-sm font-medium">
                          {weatherData && weatherData.visibility
                            ? (weatherData.visibility / 1609).toFixed(1) + " mi"
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Today's Drive Plans */}
                  <div className="bg-gradient-to-r from-black/70 to-blue-900/20 rounded-lg border border-blue-900/30 p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-blue-400 text-sm font-semibold">TODAY'S DRIVE PLAN</h4>
                      <Link to="/route-planner" className="text-green-500 text-xs hover:text-green-400">
                        New Plan →
                      </Link>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-white">Get your ideal drive route</span>
                      </div>
                      <Link to="/route-planner" className="bg-blue-900/50 hover:bg-blue-800/50 text-blue-100 text-xs px-3 py-1 rounded">
                        Plan Drive
                      </Link>
                    </div>
                  </div>
                  
                  {/* Recent Journal Entries */}
                  <div className="bg-gradient-to-r from-black/70 to-blue-900/20 rounded-lg border border-blue-900/30 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-blue-400 text-sm font-semibold">RECENT DRIVE JOURNALS</h4>
                      <Link to="/drive-journal" className="text-green-500 text-xs hover:text-green-400">
                        All Journals →
                      </Link>
                    </div>
                    <div className="bg-black/40 rounded p-3 mb-2 border border-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-white text-sm">Weekend Mountain Drive</span>
                        </div>
                        <span className="text-gray-400 text-xs">2 days ago</span>
                      </div>
                    </div>
                    <Link to="/drive-journal-new" className="flex justify-center items-center bg-blue-900/20 hover:bg-blue-800/30 text-blue-300 rounded p-2 text-sm">
                      <span className="mr-2">Log Today's Drive</span>
                      <BookOpen className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                
                {/* Why Paddock20 + Garage/Profile Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Why Paddock20 */}
                  <div className="bg-gradient-to-r from-black/80 to-gray-900/70 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
                    <h3 className="text-blue-400 font-orbitron text-lg mb-3">Why Paddock20™</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-white text-sm">
                          <span className="text-green-400 font-medium">Driver-Focused Intelligence:</span> Every weather metric, route, and data point is optimized for driving enthusiasts.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-white text-sm">
                          <span className="text-green-400 font-medium">Beyond Weather:</span> Surface temperatures, grip levels, and power adjustments no other app provides.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-white text-sm">
                          <span className="text-green-400 font-medium">Growth Ecosystem:</span> From car care to personal goals, we help you document your journey and manifest your dreams.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link to="/membership" className="block text-center bg-gradient-to-r from-green-600 to-green-800 text-white px-4 py-2 rounded font-medium hover:from-green-700 hover:to-green-900 transition-all">
                        Explore Membership Benefits
                      </Link>
                    </div>
                  </div>
                  
                  {/* Garage/Profile Snapshot */}
                  <div className="bg-gradient-to-r from-black/80 to-gray-900/70 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-blue-400 font-orbitron text-lg">Your Garage</h3>
                      <Link to="/garage-vault" className="text-green-500 text-xs hover:text-green-400">
                        View Garage →
                      </Link>
                    </div>
                    
                    <div className="bg-black/60 rounded-lg p-3 border border-blue-900/20 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-white text-sm font-medium">Your Collection</span>
                        </div>
                        <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                          3 Vehicles
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-900/50 rounded p-1 text-center">
                          <div className="text-blue-400 text-xs">Daily</div>
                          <div className="text-white text-xs truncate">BMW M3</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-1 text-center">
                          <div className="text-blue-400 text-xs">Weekend</div>
                          <div className="text-white text-xs truncate">911 GT3</div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-1 text-center">
                          <div className="text-blue-400 text-xs">Project</div>
                          <div className="text-white text-xs truncate">Supra MK4</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/60 rounded-lg p-3 border border-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Wrench className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-white text-sm font-medium">Maintenance Alerts</span>
                        </div>
                        <span className="bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full">
                          1 Due
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-300">
                        <p>BMW M3: Oil change due in 500 miles</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link to="/personalized-dashboard" className="block text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded font-medium hover:from-blue-700 hover:to-blue-900 transition-all">
                        Go to My Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Weather Section */}
          {activeSection === 'driver-weather' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-blue-900/30 shadow-lg">
              <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Driver Weather Station</h2>
              <p className="text-gray-300 mb-6">Complete automotive weather intelligence for today's drive.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Weather Component */}
                <OneTapWeatherSnapshot className="h-full lg:col-span-1" />
                
                {/* Detailed Driver Metrics */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {/* Weather Metrics - Same as command center but expanded */}
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <Thermometer className="h-5 w-5 text-blue-400 mb-2" />
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Air Temp</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {weatherData && weatherData.main && typeof weatherData.main.temp === 'number' 
                          ? weatherData.main.temp.toFixed(1) + "°F" 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <Gauge className="h-5 w-5 text-blue-400 mb-2" />
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Surface Temp</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {automotiveWeatherData && 
                        automotiveWeatherData.automotive_metrics && 
                        automotiveWeatherData.automotive_metrics.track_surface && 
                        typeof automotiveWeatherData.automotive_metrics.track_surface.temperature === 'number'
                          ? automotiveWeatherData.automotive_metrics.track_surface.temperature.toFixed(1) + "°F"
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <Droplets className="h-5 w-5 text-blue-400 mb-2" />
                      <div className="text-blue-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Humidity</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {weatherData && weatherData.main && typeof weatherData.main.humidity === 'number'
                          ? weatherData.main.humidity + "%" 
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <Sun className="h-5 w-5 text-green-400 mb-2" />
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">UV Index</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {automotiveWeatherData && 
                        automotiveWeatherData.conditions && 
                        typeof automotiveWeatherData.conditions.uv_index === 'number'
                          ? automotiveWeatherData.conditions.uv_index.toFixed(1)
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <CloudRain className="h-5 w-5 text-green-400 mb-2" />
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Dew Point</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {automotiveWeatherData && 
                        automotiveWeatherData.weather && 
                        typeof automotiveWeatherData.weather.dewPoint === 'number'
                          ? automotiveWeatherData.weather.dewPoint.toFixed(1) + "°F"
                          : "N/A"}
                      </div>
                    </div>
                    
                    <div className="bg-black/60 p-4 rounded-lg border border-blue-900/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                      <Wind className="h-5 w-5 text-green-400 mb-2" />
                      <div className="text-green-400/70 text-xs mb-1 font-medium uppercase tracking-wider">Wind Speed</div>
                      <div className="text-white text-2xl font-mono font-semibold">
                        {weatherData && weatherData.wind && typeof weatherData.wind.speed === 'number'
                          ? weatherData.wind.speed + " mph" 
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link to="/new-weather-center" className="inline-block bg-blue-800/60 hover:bg-blue-700/60 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Open Full Weather Center
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Gallery Section */}
          {activeSection === 'motorsports-gallery' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-blue-900/30 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
                  <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
                  GoTime Motorsports Gallery
                </h2>
                <Link to="/motorsports-gallery" className="bg-green-800/40 hover:bg-green-700/40 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Open Full Gallery
                </Link>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300">
                  Experience GoTime Motorsports events and activities through our F1-inspired gallery. 
                  Every image tells a story of performance, precision, and passion.
                </p>
              </div>
              
              {/* Gallery Grid Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Gallery Item 1 */}
                <div className="bg-black/70 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg" 
                      alt="Ferrari 458" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="text-white text-sm font-medium">Ferrari 458 Italia</div>
                      <div className="text-gray-300 text-xs">HRE P101 Wheels</div>
                    </div>
                  </div>
                </div>
                
                {/* Gallery Item 2 */}
                <div className="bg-black/70 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/assets/gallery/ferrari-mountain-road.png" 
                      alt="Ferrari Mountain Road" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="text-white text-sm font-medium">Mountain Drive</div>
                      <div className="text-gray-300 text-xs">Blue Ridge Parkway</div>
                    </div>
                  </div>
                </div>
                
                {/* Gallery Item 3 - Video */}
                <div className="bg-black/70 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/assets/gallery/ferrari-f1.png" 
                      alt="Ferrari F1" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 rounded-full p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="text-white text-sm font-medium">F1 Track Day</div>
                      <div className="text-gray-300 text-xs">Circuit of The Americas</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Link to="/motorsports-gallery" className="bg-blue-800/40 hover:bg-blue-700/40 text-blue-300 px-4 py-2 rounded-lg text-sm transition-colors">
                  Browse Official Gallery
                </Link>
                <Link to="/motorsports-gallery?tab=personal" className="bg-green-800/40 hover:bg-green-700/40 text-green-300 px-4 py-2 rounded-lg text-sm transition-colors">
                  View My Gallery
                </Link>
              </div>
            </div>
          )}
          
          {/* Drive Journal Section */}
          {activeSection === 'drive-journal' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-blue-900/30 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
                  <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
                  Drive Journal
                </h2>
                <Link to="/drive-journal" className="bg-green-800/40 hover:bg-green-700/40 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Full Journal
                </Link>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">
                  Document your drives, track performance improvements, and build your driving legacy.
                </p>
              </div>
              
              {/* Journal Entries Preview */}
              <div className="space-y-4 mb-6">
                <div className="bg-black/60 rounded-lg p-4 border border-blue-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-blue-400 font-medium">Weekend Mountain Drive</h3>
                    <span className="text-gray-400 text-xs">2 days ago</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Perfect conditions on the mountain pass. The car felt incredibly planted through the corners.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-0.5 rounded">BMW M3</span>
                      <span className="bg-green-900/30 text-green-300 text-xs px-2 py-0.5 rounded">87 miles</span>
                    </div>
                    <Link to="/drive-journal?entry=123" className="text-blue-400 text-xs hover:text-blue-300">
                      View Entry →
                    </Link>
                  </div>
                </div>
                
                <div className="bg-black/60 rounded-lg p-4 border border-blue-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-blue-400 font-medium">Track Day</h3>
                    <span className="text-gray-400 text-xs">1 week ago</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Set a new personal best lap time. The suspension upgrades have transformed the handling.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-0.5 rounded">Porsche 911</span>
                      <span className="bg-green-900/30 text-green-300 text-xs px-2 py-0.5 rounded">Track Day</span>
                    </div>
                    <Link to="/drive-journal?entry=122" className="text-blue-400 text-xs hover:text-blue-300">
                      View Entry →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/drive-journal-new" className="bg-blue-800/40 hover:bg-blue-700/40 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors">
                  Log New Drive
                </Link>
                <Link to="/drive-journal" className="bg-gray-800/40 hover:bg-gray-700/40 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors">
                  View All Entries
                </Link>
              </div>
            </div>
          )}
          
          {/* Route Planner Section */}
          {activeSection === 'route-planner' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-blue-900/30 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
                  <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
                  Fun Drive Planner
                </h2>
                <Link to="/route-planner" className="bg-green-800/40 hover:bg-green-700/40 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Open Planner
                </Link>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">
                  Plan the perfect drive with curated routes optimized for driving enjoyment.
                </p>
              </div>
              
              {/* Route Planner Quick Start */}
              <div className="bg-black/60 rounded-lg p-5 border border-blue-900/30 mb-6">
                <h3 className="text-blue-400 font-medium mb-4">Quick Route Builder</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Starting Point</label>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter starting location"
                        className="bg-gray-900/60 text-white rounded-l px-3 py-2 w-full border border-blue-900/30 focus:outline-none focus:border-blue-500"
                      />
                      <button className="bg-blue-900/50 px-3 rounded-r border border-blue-900/30 border-l-0">
                        <MapPin className="h-5 w-5 text-blue-300" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Destination (optional)</label>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Enter destination or leave empty for loop"
                        className="bg-gray-900/60 text-white rounded-l px-3 py-2 w-full border border-blue-900/30 focus:outline-none focus:border-blue-500"
                      />
                      <button className="bg-blue-900/50 px-3 rounded-r border border-blue-900/30 border-l-0">
                        <MapPin className="h-5 w-5 text-blue-300" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Drive Type</label>
                    <select className="bg-gray-900/60 text-white rounded px-3 py-2 w-full border border-blue-900/30 focus:outline-none focus:border-blue-500">
                      <option>Fun/Spirited</option>
                      <option>Scenic</option>
                      <option>Mountain</option>
                      <option>Coastal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Distance</label>
                    <select className="bg-gray-900/60 text-white rounded px-3 py-2 w-full border border-blue-900/30 focus:outline-none focus:border-blue-500">
                      <option>Short (less than 50 miles)</option>
                      <option>Medium (50-100 miles)</option>
                      <option>Long (greater than 100 miles)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Road Type</label>
                    <select className="bg-gray-900/60 text-white rounded px-3 py-2 w-full border border-blue-900/30 focus:outline-none focus:border-blue-500">
                      <option>Twisty & Technical</option>
                      <option>Fast & Flowing</option>
                      <option>Scenic & Relaxed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Link to="/route-planner" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Generate Fun Drive Route
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4 border border-blue-900/20">
                  <h4 className="text-blue-400 text-sm uppercase tracking-wider mb-2">Featured Route</h4>
                  <div className="text-white font-medium">Blue Ridge Mountain Loop</div>
                  <div className="text-gray-300 text-sm">78 miles | Technical | Mountain Views</div>
                  <div className="mt-3">
                    <Link to="/route-planner?route=blue-ridge" className="text-blue-400 text-sm hover:text-blue-300">
                      View Route →
                    </Link>
                  </div>
                </div>
                
                <div className="bg-black/50 rounded-lg p-4 border border-blue-900/20">
                  <h4 className="text-blue-400 text-sm uppercase tracking-wider mb-2">Community Pick</h4>
                  <div className="text-white font-medium">Coastal Highway Cruise</div>
                  <div className="text-gray-300 text-sm">112 miles | Scenic | Ocean Views</div>
                  <div className="mt-3">
                    <Link to="/route-planner?route=coastal" className="text-blue-400 text-sm hover:text-blue-300">
                      View Route →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Garage Vault Section */}
          {activeSection === 'garage-vault' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-blue-900/30 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-blue-400 font-orbitron text-2xl flex items-center">
                  <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
                  Garage Vault
                </h2>
                <Link to="/garage-vault" className="bg-green-800/40 hover:bg-green-700/40 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Full Garage
                </Link>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">
                  Track your vehicles, maintenance, and modifications in one secure location.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Vehicle Card 1 */}
                <div className="bg-black/60 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative h-40">
                    <img 
                      src="/assets/garage/bmw-m3.jpg" 
                      alt="BMW M3" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-blue-900/70 px-2 py-1 rounded text-xs text-white">
                      Daily Driver
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-blue-400 font-medium">BMW M3 Competition</h3>
                    <div className="text-gray-300 text-sm mb-3">2022 | 14,580 miles</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-amber-300 flex items-center">
                        <Wrench className="h-3 w-3 mr-1" />
                        <span>Oil change due</span>
                      </div>
                      <Link to="/garage-vault?vehicle=1" className="text-blue-400 text-xs hover:text-blue-300">
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Card 2 */}
                <div className="bg-black/60 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative h-40">
                    <img 
                      src="/assets/garage/porsche-911.jpg" 
                      alt="Porsche 911" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-green-900/70 px-2 py-1 rounded text-xs text-white">
                      Weekend Car
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-blue-400 font-medium">Porsche 911 GT3</h3>
                    <div className="text-gray-300 text-sm mb-3">2021 | 5,245 miles</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-green-300 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        <span>All maintenance current</span>
                      </div>
                      <Link to="/garage-vault?vehicle=2" className="text-blue-400 text-xs hover:text-blue-300">
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Card 3 */}
                <div className="bg-black/60 rounded-lg overflow-hidden border border-blue-900/30 group">
                  <div className="relative h-40">
                    <img 
                      src="/assets/garage/toyota-supra.jpg" 
                      alt="Toyota Supra" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 bg-purple-900/70 px-2 py-1 rounded text-xs text-white">
                      Project Car
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-blue-400 font-medium">Toyota Supra MK4</h3>
                    <div className="text-gray-300 text-sm mb-3">1994 | 78,320 miles</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-blue-300 flex items-center">
                        <Wrench className="h-3 w-3 mr-1" />
                        <span>2 mods in progress</span>
                      </div>
                      <Link to="/garage-vault?vehicle=3" className="text-blue-400 text-xs hover:text-blue-300">
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/garage-vault-add" className="bg-blue-800/40 hover:bg-blue-700/40 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors">
                  Add New Vehicle
                </Link>
                <Link to="/garage-vault" className="bg-gray-800/40 hover:bg-gray-700/40 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors">
                  View All Vehicles
                </Link>
              </div>
            </div>
          )}
          
          {/* Manifestation Station Section */}
          {activeSection === 'manifestation' && (
            <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-green-900/30 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-green-400 font-orbitron text-2xl flex items-center">
                  <span className="inline-block w-1.5 h-6 bg-blue-500 mr-2"></span>
                  Manifestation Station™
                </h2>
                <Link to="/manifestation-station" className="bg-green-800/40 hover:bg-green-700/40 text-green-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  Enter Station
                </Link>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300">
                  Beyond weather tracking and route planning, Paddock20™ offers something truly unique: 
                  <span className="text-green-400 font-semibold"> The Manifestation Station</span>.
                  Our seven powerful elements help you transform automotive dreams into reality — whether it's 
                  exotic cars, luxury timepieces, or dream properties.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/60 rounded-lg p-5 border border-green-900/30">
                  <h3 className="text-green-400 font-orbitron text-xl mb-4">Why Manifestation?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-white text-sm">
                        <span className="text-green-400 font-medium">Structured Framework:</span> Turn vague dreams into achievable automotive goals with our proven system.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-white text-sm">
                        <span className="text-green-400 font-medium">Visual Accountability:</span> Document progress with photo evidence and milestone tracking.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-white text-sm">
                        <span className="text-green-400 font-medium">Discipline Tracker:</span> Daily practices that compound into life-changing results.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-900/30 p-1 rounded mr-3 mt-1">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-white text-sm">
                        <span className="text-green-400 font-medium">Community:</span> Join others manifesting their automotive dreams and legacy ambitions.
                      </p>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-black/60 rounded-lg p-5 border border-green-900/30">
                  <h3 className="text-green-400 font-orbitron text-xl mb-4">Seven Elements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-900/20 p-3 rounded border border-green-900/30">
                      <div className="flex items-center mb-1">
                        <Brain className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">Visualization</span>
                      </div>
                      <p className="text-gray-300 text-xs">Detailed imagery of your automotive dreams</p>
                    </div>
                    
                    <div className="bg-green-900/20 p-3 rounded border border-green-900/30">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">Discipline</span>
                      </div>
                      <p className="text-gray-300 text-xs">Daily consistency that builds to greatness</p>
                    </div>
                    
                    <div className="bg-green-900/20 p-3 rounded border border-green-900/30">
                      <div className="flex items-center mb-1">
                        <Award className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">Achievement</span>
                      </div>
                      <p className="text-gray-300 text-xs">Milestone tracking & recognition</p>
                    </div>
                    
                    <div className="bg-green-900/20 p-3 rounded border border-green-900/30">
                      <div className="flex items-center mb-1">
                        <Clock className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-300 font-medium">Timeline</span>
                      </div>
                      <p className="text-gray-300 text-xs">Strategic pathway to your goals</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link to="/manifestation-station" className="text-green-400 hover:text-green-300 text-sm">
                      Discover all seven elements →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Link to="/manifestation-station" className="bg-gradient-to-r from-green-600 to-green-800 text-white text-center px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-900 transition-colors">
                  Enter Manifestation Station™
                </Link>
                <Link to="/paddock20-vault" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-colors">
                  Paddock20 Membership
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Access Panel at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-blue-900/40 py-4 px-6 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <Link to="/personalized-dashboard" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Dashboard</span>
              </Link>
              
              <Link to="/motorsports-gallery" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <Camera className="h-6 w-6" />
                <span className="text-xs mt-1">Gallery</span>
              </Link>
              
              <Link to="/new-weather-center" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <CloudRain className="h-6 w-6" />
                <span className="text-xs mt-1">Weather</span>
              </Link>
              
              <Link to="/route-planner" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <MapPin className="h-6 w-6" />
                <span className="text-xs mt-1">Routes</span>
              </Link>
              
              <Link to="/manifestation-station" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors">
                <Brain className="h-6 w-6" />
                <span className="text-xs mt-1">Manifest</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paddock20HomePage;