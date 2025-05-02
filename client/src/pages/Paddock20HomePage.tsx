import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventsPreview from '../components/EventsPreview';
import OneTapWeatherSnapshot from '../components/OneTapWeatherSnapshot';
import MotorsportsGallery from '../components/MotorsportsGallery';
import { useWeather } from '../contexts/WeatherContext';
import { Thermometer, Droplets, Wind, Sun, Leaf, Gauge, Cloud, ArrowUp, Compass, Timer, Clock } from 'lucide-react';

const Paddock20HomePage: React.FC = () => {
  const { weatherData, automotiveWeatherData } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
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
  
  // Racing-inspired elapsed session time format
  const sessionHours = Math.floor(elapsedTime / 3600);
  const sessionMinutes = Math.floor((elapsedTime % 3600) / 60);
  const sessionSeconds = elapsedTime % 60;
  const sessionTime = `${sessionHours.toString().padStart(2, '0')}:${sessionMinutes.toString().padStart(2, '0')}:${sessionSeconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="min-h-screen bg-black">
      {/* Dynamic racing-inspired background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-30"
        style={{
          backgroundImage: "url('/assets/images/f1-stadium-sunset.png')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Main content container with grid-based layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* F1-Inspired Command Center Header - Enhanced Style */}
      <header className="mb-6 bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 rounded-lg p-4 border-l-4 border-t border-r border-b border-blue-900/40 shadow-xl overflow-hidden relative">
        {/* Carbon fiber pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat"></div>
        
        {/* Blue accent line - F1-style */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-8">
              <h1 className="text-blue-400 font-orbitron text-2xl md:text-4xl font-bold tracking-wider flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-500">PADDOCK</span>
                <span className="text-green-500">20</span>
                <span className="text-xs ml-1 text-blue-400">™</span>
              </h1>
              <div className="flex items-center mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">COMMAND CENTER</span>
                <div className="ml-2 h-0.5 w-10 bg-blue-500/30"></div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <div className="flex flex-col mr-4 bg-black/50 px-3 py-1.5 rounded-sm border border-blue-900/30">
                  <span className="text-blue-400/80 text-xs uppercase font-semibold">PADDOCK TIME</span>
                  <span className="text-white text-xl font-mono font-bold tracking-wider">{formattedTime}</span>
                </div>
                <div className="bg-blue-900/20 px-3 py-1.5 rounded-sm border border-blue-800/20">
                  <span className="text-gray-400 text-xs font-semibold">DATE</span>
                  <div className="text-white text-sm font-medium">{formattedDate}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="bg-black/60 flex flex-col items-center justify-center px-3 py-2 rounded-sm border border-blue-900/40">
              <span className="text-blue-400/70 text-xs mb-1 font-semibold">SESSION TIME</span>
              <div className="flex items-center">
                <Timer className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-white text-sm font-mono">{sessionTime}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 px-4 py-2 rounded-sm border border-green-800/40">
              <span className="text-green-400/70 text-xs font-semibold">TELEMETRY</span>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                <span className="text-white text-sm font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced F1-Inspired Live Weather Station - Driver-Oriented Weather Dashboard */}
      <section className="mb-8 relative">
        {/* Section accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent"></div>
        
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4 pl-4 flex items-center">
          <Gauge className="mr-2 h-5 w-5 text-blue-400" />
          Live Drive Intelligence
          <span className="ml-3 text-xs bg-blue-900/30 px-2 py-0.5 rounded-sm text-blue-300 uppercase tracking-wide">Real-time Telemetry</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Snapshot */}
          <div className="lg:col-span-1">
            <OneTapWeatherSnapshot className="h-full" />
          </div>
          
          {/* Driver-Oriented Weather Metrics */}
          <div className="lg:col-span-2 bg-gradient-to-r from-black/95 to-gray-900/90 rounded-xl p-5 border border-blue-900/30 shadow-lg backdrop-blur-sm relative overflow-hidden">
            {/* Carbon fiber pattern overlay for F1 style */}
            <div className="absolute inset-0 opacity-5 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat pointer-events-none"></div>
            
            {/* Top status bar - F1 pit wall style */}
            <div className="flex justify-between items-center mb-4 border-b border-blue-900/30 pb-2 relative z-10">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider">Driver Conditions</h3>
              </div>
              <div className="flex space-x-2 items-center">
                <span className="text-xs text-gray-400">DATA REFRESH:</span>
                <span className="text-xs text-green-400 font-mono">LIVE</span>
              </div>
            </div>
            
            <div id="weather-snapshot-capture-area" className="grid grid-cols-1 gap-6 relative z-10">
              {/* F1-style telemetry clock display with race-inspired design */}
              <div className="bg-black/80 p-4 rounded-lg border border-blue-700/30 shadow-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-blue-400/80 text-xs uppercase tracking-wider font-bold mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      DRIVE TIME
                    </div>
                    <div className="text-white text-3xl font-mono font-bold tracking-wider" id="live-clock">
                      {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-900/30 px-3 py-2 rounded-sm border border-blue-800/20">
                      <div className="text-blue-400/70 text-xs mb-1 uppercase font-semibold">Session</div>
                      <div className="text-white text-sm font-medium flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                        ACTIVE
                      </div>
                    </div>
                    <div className="bg-green-900/30 px-3 py-2 rounded-sm border border-green-800/20">
                      <div className="text-green-400/70 text-xs mb-1 uppercase font-semibold">Conditions</div>
                      <div className="text-white text-sm font-medium flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        OPTIMAL
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Core Driver Metrics - Enhanced F1 Style Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Air Temp
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors">
                    {weatherData && weatherData.main && typeof weatherData.main.temp === 'number' 
                      ? weatherData.main.temp.toFixed(1) + "°F" 
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: weatherData?.main?.temp ? `${Math.min(100, (weatherData.main.temp/100)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Droplets className="h-3 w-3 mr-1" />
                    Humidity
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors">
                    {weatherData && weatherData.main && typeof weatherData.main.humidity === 'number'
                      ? weatherData.main.humidity + "%" 
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: weatherData?.main?.humidity ? `${weatherData.main.humidity}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Thermometer className="h-3 w-3 mr-1" />
                    Surface Temp
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors">
                    {automotiveWeatherData && 
                     automotiveWeatherData.automotive_metrics && 
                     automotiveWeatherData.automotive_metrics.track_surface && 
                     typeof automotiveWeatherData.automotive_metrics.track_surface.temperature === 'number'
                      ? automotiveWeatherData.automotive_metrics.track_surface.temperature.toFixed(1) + "°F"
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: automotiveWeatherData?.automotive_metrics?.track_surface?.temperature ? `${Math.min(100, (automotiveWeatherData.automotive_metrics.track_surface.temperature/120)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Sun className="h-3 w-3 mr-1" />
                    UV Index
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors">
                    {automotiveWeatherData && 
                     automotiveWeatherData.conditions && 
                     typeof automotiveWeatherData.conditions.uv_index === 'number'
                      ? automotiveWeatherData.conditions.uv_index.toFixed(1)
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: automotiveWeatherData?.conditions?.uv_index ? `${Math.min(100, (automotiveWeatherData.conditions.uv_index/11)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Cloud className="h-3 w-3 mr-1" />
                    Dew Point
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors">
                    {automotiveWeatherData && 
                     automotiveWeatherData.conditions && 
                     typeof automotiveWeatherData.conditions.humidity === 'number'
                      ? (automotiveWeatherData.conditions.feels_like - 10).toFixed(1) + "°F"
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: automotiveWeatherData?.conditions?.feels_like ? `${Math.min(100, ((automotiveWeatherData.conditions.feels_like - 10)/80)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-green-900/30 relative overflow-hidden group hover:border-green-500 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="text-green-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Wind className="h-3 w-3 mr-1" />
                    Wind Speed
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-green-300 transition-colors">
                    {weatherData && weatherData.wind && typeof weatherData.wind.speed === 'number'
                      ? weatherData.wind.speed + " mph" 
                      : "N/A"}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: weatherData?.wind?.speed ? `${Math.min(100, (weatherData.wind.speed/30)*100)}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced F1-style telemetry bar */}
              <div className="bg-black/80 rounded-sm border border-gray-800 p-4 relative overflow-hidden">
                {/* F1-style diagonal racing stripe */}
                <div className="absolute top-0 right-0 w-20 h-6 bg-blue-500/20 -skew-x-45 transform origin-top-right"></div>
                
                <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                  <div className="text-blue-400 text-xs uppercase tracking-wider font-bold flex items-center">
                    <Gauge className="h-3.5 w-3.5 mr-1.5" />
                    Advanced Telemetry
                  </div>
                  <div className="text-green-400 text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                    LIVE FEED
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="group">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1"></span>
                      Surface
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                      {automotiveWeatherData && 
                       automotiveWeatherData.automotive_metrics && 
                       automotiveWeatherData.automotive_metrics.track_surface && 
                       automotiveWeatherData.automotive_metrics.track_surface.condition
                        ? automotiveWeatherData.automotive_metrics.track_surface.condition
                        : "N/A"}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1"></span>
                      Grip Level
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                      {automotiveWeatherData && 
                       automotiveWeatherData.automotive_metrics && 
                       automotiveWeatherData.automotive_metrics.track_surface && 
                       automotiveWeatherData.automotive_metrics.track_surface.grip_level
                        ? automotiveWeatherData.automotive_metrics.track_surface.grip_level
                        : "N/A"}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-green-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-green-500 mr-1"></span>
                      Power Adjust
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-green-300 transition-colors">
                      {automotiveWeatherData && 
                       automotiveWeatherData.conditions && 
                       typeof automotiveWeatherData.conditions.power_efficiency === 'number'
                        ? (automotiveWeatherData.conditions.power_efficiency > 0 ? "+" : "") + 
                          automotiveWeatherData.conditions.power_efficiency + "%"
                        : "N/A"}
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1"></span>
                      Visibility
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                      {weatherData && weatherData.visibility
                        ? (weatherData.visibility / 1609).toFixed(1) + " mi"
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-blue-900/5 rounded-sm text-sm text-blue-300 border-l-2 border-blue-500/50">
              <p className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-2 text-blue-400" />
                All metrics are real-time and critical for driving decisions. For detailed forecast and track conditions, visit the <Link to="/new-weather-center" className="text-blue-400 hover:underline font-medium">Weather Center <span className="text-xs">→</span></Link>
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Motorsports Events Preview */}
      <section className="mb-8">
        <EventsPreview />
      </section>

      {/* GoTime Motorsports Gallery - F1 Style */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-orbitron text-blue-400 text-2xl flex items-center">
            <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
            GoTime Motorsports Gallery
          </h2>
          <a 
            href="https://www.instagram.com/gotimemotorsports/" 
            target="_blank"
            rel="noopener noreferrer" 
            className="text-green-500 hover:text-green-400 flex items-center gap-2 text-sm transition-colors"
          >
            <span>Follow @gotimemotorsports</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
        
        {/* Import the F1-inspired Motorsports Gallery component */}
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 shadow-xl">
          <div className="mb-4">
            <p className="text-blue-400 text-sm">
              Experience GoTime Motorsports events and activities through our F1-inspired gallery. 
              Every image tells a story of performance, precision, and passion.
            </p>
          </div>
          
          {/* Award-winning F1-inspired GoTime Events Gallery */}
          <div className="mt-4">
            <div className="motorsports-gallery w-full rounded-xl overflow-hidden bg-gradient-to-br from-black to-gray-900 border border-blue-900/30 shadow-xl">
              {/* Featured image with F1-style telemetry overlay */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src="/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg" 
                  alt="Ferrari 458 With HRE P101 Wheels"
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-in-out"
                />
                
                {/* F1-style telemetry overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="mb-4">
                      <h3 className="text-white font-orbitron text-2xl">Ferrari 458</h3>
                      <p className="text-gray-300 text-sm">Custom HRE P101 wheels by TAG Motorsports</p>
                    </div>
                    
                    {/* F1-style telemetry data bar */}
                    <div className="bg-black/60 rounded px-4 py-2 backdrop-blur-sm border border-blue-900/30">
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-blue-400">SESSION</span>
                          <span className="text-white ml-2">LIVE</span>
                        </div>
                        <div>
                          <span className="text-blue-400">SECTOR</span>
                          <span className="text-white ml-2">S3</span>
                        </div>
                        <div>
                          <span className="text-blue-400">DELTA</span>
                          <span className="text-green-500 ml-2">-0.153</span>
                        </div>
                        <div>
                          <span className="text-blue-400">ERS</span>
                          <span className="text-white ml-2">83%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Thumbnail gallery + video navigation */}
              <div className="px-4 py-3 bg-black/80">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-blue-400 text-xs uppercase tracking-wider">GoTime Motorsports Gallery</h4>
                  <div className="flex items-center space-x-3">
                    <button className="text-white bg-green-600/80 text-xs px-2 py-0.5 rounded">Photos</button>
                    <button className="text-white bg-blue-600/80 text-xs px-2 py-0.5 rounded">Videos</button>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-2 pb-1 hide-scrollbar">
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all ring-2 ring-blue-500 scale-105">
                    <img src="/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg" alt="Ferrari 458" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all opacity-60 hover:opacity-100">
                    <img src="/assets/gallery/ferrari-mountain-road.png" alt="Ferrari Mountain Road" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all opacity-60 hover:opacity-100 relative">
                    <img src="/assets/gallery/ferrari-f1.png" alt="Ferrari F1" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all opacity-60 hover:opacity-100">
                    <img src="/assets/gallery/ferrari-desert.png" alt="Ferrari Desert" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all opacity-60 hover:opacity-100">
                    <img src="/assets/gallery/mclaren-4184249_1280.jpg" alt="McLaren" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden transition-all opacity-60 hover:opacity-100 relative">
                    <img src="/assets/gallery/race-car-8338236_1280.jpg" alt="Race Car" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="flex items-center">
              <div className="h-10 w-1 bg-green-500 mr-3"></div>
              <div>
                <p className="text-white text-sm font-medium">Elevating automotive excellence through community</p>
                <p className="text-gray-400 text-xs mt-1">
                  Exclusive drives, elite events, and motorsports culture
                </p>
              </div>
            </div>
            <Link 
              to="/motorsports-gallery" 
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm px-4 py-2 rounded hover:from-blue-700 hover:to-green-700 transition-all flex items-center gap-2"
            >
              <span>Full Gallery</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Paddock20 */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-8 mb-12">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-6">Why Paddock20™? Why Now?</h2>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <h3 className="text-green-500 font-orbitron text-xl mb-3">The Paddock Concept</h3>
            <p className="text-white font-openSans text-base leading-relaxed mb-4">
              In motorsports, the paddock is the secured area where teams prepare, service, and manage their race cars.
              It's where the real work happens — where strategy becomes reality.
            </p>
            <p className="text-white font-openSans text-base leading-relaxed">
              Having "paddock access" means you're part of the team, part of the action, not just spectating.
            </p>
          </div>
          
          <div className="flex-1">
            <h3 className="text-green-500 font-orbitron text-xl mb-3">Paddock20™ Vision</h3>
            <p className="text-white font-openSans text-base leading-relaxed mb-4">
              Because real enthusiasts deserve real systems. Because parking lot dreams deserve pit lane execution. 
              Because knowing when to drive is as important as knowing how.
            </p>
            <p className="text-white font-openSans text-base leading-relaxed">
              No noise. No fake flex. Just pure data, pure drive, pure community. 
              Built by operators who care about discipline more than downloads.
            </p>
          </div>
        </div>
        
        <blockquote className="border-l-4 border-green-500 pl-4 italic text-gray-300 font-openSans">
          "The paddock isn't where you show off. It's where you get ready to win. 
          Paddock20™ was built for that same mindset."
        </blockquote>
      </section>

      {/* Core Features */}
      <section className="mb-12">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-8 text-center">Your Command Center</h2>
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Weather Center */}
          <Link to="/new-weather-center" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">☁️ Weather Center</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Live conditions. Surface temps. Tire readiness. Torque specs. All in one glance.
              Precision starts before the ignition turns.
            </p>
          </Link>

          {/* Route Planner */}
          <Link to="/route-planner" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🛣️ Route Planner</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Find your next run. Map your line. Plan like a pro. Perfect drives aren't accidents.
              They're calculated moves.
            </p>
          </Link>

          {/* Garage Vault */}
          <Link to="/garage-vault" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🚗 Garage Vault</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Your vehicles. Your mods. Your finish history. Fully tracked. Fully owned.
            </p>
          </Link>

          {/* Juice Box */}
          <Link to="/juicebox" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🧼 Juice Box</h3>
            <p className="text-white font-openSans text-base leading-relaxed">
              Elite detailing guides, products, and systems. Built for gloss. Built for margin.
            </p>
          </Link>

        </div>
      </section>

      {/* Quick Access Links */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">Quick Access Launchpad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/motorsports-events" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🏎️</span>
            <span className="text-white font-openSans hover:text-green-400">Find Motorsport Events</span>
          </Link>
          <Link to="/drive-journal" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">📝</span>
            <span className="text-white font-openSans hover:text-green-400">Your Drive Journal</span>
          </Link>
          <Link to="/gloss-growth" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">✨</span>
            <span className="text-white font-openSans hover:text-green-400">Gloss Growth</span>
          </Link>
          <Link to="/hustle-planner" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">🧠</span>
            <span className="text-white font-openSans hover:text-green-400">Hustle Planner</span>
          </Link>
          <Link to="/ebooks" className="bg-black p-4 rounded-lg border border-gray-800 hover:border-green-500 transition-colors">
            <span className="text-2xl block mb-2">📚</span>
            <span className="text-white font-openSans hover:text-green-400">GoTime eBooks</span>
          </Link>
        </div>
      </section>

      {/* Manifestation Station Call-Out */}
      <section className="mb-12 bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-6 border border-green-900/30 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-2/3">
            <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Drive Like a Champion. <span className="text-green-500">Build Your Legacy.</span></h2>
            <p className="text-white font-openSans text-lg mb-4">
              Beyond weather tracking and route planning, Paddock20™ offers something truly unique: <span className="text-green-400 font-semibold">The Manifestation Station</span>.
            </p>
            <p className="text-gray-300 font-openSans mb-6">
              Our seven powerful elements help you transform automotive dreams into reality — whether it's exotic cars, luxury timepieces, or dream properties. We don't just track conditions; we help create them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/manifestation-station" className="bg-gradient-to-r from-green-600 to-green-800 text-white px-5 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-900 transition duration-300 flex items-center gap-2">
                <span>Explore Manifestation Station</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </Link>
              <Link to="/membership" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition duration-300">
                Become a Member
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 bg-black/40 p-4 rounded-lg border border-green-900/20">
            <div className="text-center mb-4">
              <span className="inline-block h-4 w-4 rounded-full bg-green-500 animate-pulse"></span>
              <h3 className="text-green-400 font-orbitron text-xl mt-2">Beyond Automotive</h3>
              <div className="h-0.5 w-16 bg-green-500/50 mx-auto my-2"></div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Goal Visualization Framework</span>
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Structured Achievement System</span>
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Community Accountability</span>
              </li>
              <li className="flex items-center text-gray-300">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>From Dream Cars to Dream Life</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Final Hook */}
      <section className="text-center mt-16">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Drive Life. Document Legacy.</h2>
        <p className="text-white font-openSans text-lg mb-6">
          Built for the serious. Designed for the seamless.
        </p>
        <div className="mt-8">
          <Link to="/membership" className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition duration-300 shadow-lg">
            Join Paddock20™ Today
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Paddock20HomePage;