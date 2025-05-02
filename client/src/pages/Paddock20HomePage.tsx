import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventsPreview from '../components/EventsPreview';
import MotorsportsGallery from '../components/MotorsportsGallery';
import { useWeather } from '../contexts/WeatherContext';
import { Thermometer, Droplets, Wind, Sun, Leaf, Gauge, Cloud, ArrowUp, Compass, Timer, Clock, Zap, Map, Shield, Calendar, Trophy, Flame } from 'lucide-react';

// Array of driving insights to rotate through - based on weather patterns
const drivingInsights = [
  { 
    icon: <Zap className="h-3.5 w-3.5 text-yellow-400 mr-1.5" />, 
    text: "DRIVING TIP", 
    value: "Optimal tire pressure for today" 
  },
  { 
    icon: <Shield className="h-3.5 w-3.5 text-blue-400 mr-1.5" />, 
    text: "SAFETY ALERT", 
    value: "Low risk conditions" 
  },
  { 
    icon: <Map className="h-3.5 w-3.5 text-green-400 mr-1.5" />, 
    text: "ROUTE INSIGHT", 
    value: "Perfect day for mountain roads" 
  },
  { 
    icon: <Flame className="h-3.5 w-3.5 text-orange-400 mr-1.5" />, 
    text: "TRACK DAY", 
    value: "3 events this weekend" 
  },
  { 
    icon: <Calendar className="h-3.5 w-3.5 text-purple-400 mr-1.5" />, 
    text: "COMMUNITY", 
    value: "Cars & Coffee on Sunday" 
  },
  { 
    icon: <Trophy className="h-3.5 w-3.5 text-amber-400 mr-1.5" />, 
    text: "ACHIEVEMENT", 
    value: "92% driver rating" 
  }
];

const Paddock20HomePage: React.FC = () => {
  const { 
    weatherData, 
    automotiveWeatherData,
    lastUpdated,
    isUsingFallbackData
  } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [insightIndex, setInsightIndex] = useState(0);
  const [timeFormat, setTimeFormat] = useState('24h'); // '12h' or '24h'
  const [dateFormat, setDateFormat] = useState('mdy'); // 'mdy', 'dmy', or 'ymd'
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const [showDateOptions, setShowDateOptions] = useState(false);
  
  // Load time and date format preferences from local storage
  useEffect(() => {
    const savedTimeFormat = localStorage.getItem('paddock20_timeFormat');
    const savedDateFormat = localStorage.getItem('paddock20_dateFormat');
    
    if (savedTimeFormat) {
      setTimeFormat(savedTimeFormat);
    }
    
    if (savedDateFormat) {
      setDateFormat(savedDateFormat);
    }
  }, []);
  
  // Update clock and cycle through driving insights
  useEffect(() => {
    // Update time every second
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Cycle through driving insights every 8 seconds
    const insightTimer = setInterval(() => {
      setInsightIndex(prevIndex => (prevIndex + 1) % drivingInsights.length);
    }, 8000);
    
    // Close format options dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTimeOptions && !target.closest('.time-format-dropdown')) {
        setShowTimeOptions(false);
      }
      if (showDateOptions && !target.closest('.date-format-dropdown')) {
        setShowDateOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(insightTimer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimeOptions, showDateOptions]);
  
  // Save preferences when changed
  const saveTimeFormat = (format: string) => {
    setTimeFormat(format);
    localStorage.setItem('paddock20_timeFormat', format);
    setShowTimeOptions(false);
  };
  
  const saveDateFormat = (format: string) => {
    setDateFormat(format);
    localStorage.setItem('paddock20_dateFormat', format);
    setShowDateOptions(false);
  };
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour12: timeFormat === '12h', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Different date formats
  let dateOptions: Intl.DateTimeFormatOptions;
  
  switch (dateFormat) {
    case 'dmy':
      dateOptions = { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      };
      break;
    case 'ymd':
      dateOptions = { 
        weekday: 'short', 
        year: 'numeric',
        month: 'short',
        day: 'numeric' 
      };
      break;
    default: // 'mdy'
      dateOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      };
  }
  
  const formattedDate = currentTime.toLocaleDateString('en-US', dateOptions);
  
  // Get the current driving insight
  const currentInsight = drivingInsights[insightIndex];
  
  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24">
      {/* Background image added first, moved to the back with z-index */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 opacity-20"
        style={{
          backgroundImage: "url('/assets/images/f1-stadium-sunset.png')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      
      {/* Main content container includes the header now - with full width on mobile */}
      <div className="relative z-10 w-full max-w-[100%] sm:max-w-[1200px] mx-auto px-2 sm:px-4 pb-6">
        {/* ULTRA BASIC HEADER - ALIGNED WITH PAGE MARGINS */}
        <div className="mb-4">
          <div className="mb-2">
            <h1 className="text-center text-5xl sm:text-6xl font-bold font-orbitron">
              <span className="text-[#4B9CD3]">PADDOCK</span>
              <span className="text-green-500">20</span>
            </h1>
            <p className="text-center text-[#4B9CD3] font-orbitron text-lg sm:text-xl mt-2">COMMAND CENTER</p>
          </div>
          
          <div className="text-center text-white mb-2 flex flex-wrap justify-center">
            <div className="time-format-dropdown py-1 px-2 bg-[#0a0a0a] my-1 mx-1 inline-block border-l-2 border-blue-500 border-t border-b border-r border-gray-800 hover:border-blue-500/40 transition-all duration-300 hover:bg-[#0c0c0c] cursor-pointer hover:shadow-[0_0_10px_rgba(75,156,211,0.25)] rounded-sm relative group"
                onClick={() => setShowTimeOptions(!showTimeOptions)}>
              <div className="flex items-center">
                <span className="text-white">{formattedTime}</span>
                <span className="flex items-center ml-2 bg-blue-900/40 text-blue-300 text-[10px] rounded-sm py-0.5 px-1 border border-blue-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20v-6M12 8V2M6 12H2M22 12h-4"/>
                  </svg>
                  {timeFormat === '24h' ? '24H' : '12H'}
                </span>
              </div>
              
              {/* Interactive indicator */}
              <div className="mt-1 flex items-center text-[10px] text-blue-400/60">
                <div className="h-1 w-1 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                <span>Click to change time format</span>
              </div>
              
              {/* Time Format Options */}
              {showTimeOptions && (
                <div className="absolute z-50 left-0 top-full mt-1 bg-gradient-to-b from-[#111] to-black border border-blue-900/50 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full p-0 overflow-hidden">
                  <div className="bg-blue-900/20 px-2 py-1 text-[10px] uppercase text-blue-400/80 font-medium tracking-wider">
                    Select Format
                  </div>
                  <div 
                    className={`px-3 py-2 text-left cursor-pointer flex items-center justify-between transition-colors
                    ${timeFormat === '24h' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-900'}`}
                    onClick={(e) => { e.stopPropagation(); saveTimeFormat('24h'); }}
                  >
                    <span>24-hour (Military)</span>
                    {timeFormat === '24h' && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div 
                    className={`px-3 py-2 text-left cursor-pointer flex items-center justify-between transition-colors
                    ${timeFormat === '12h' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-900'}`}
                    onClick={(e) => { e.stopPropagation(); saveTimeFormat('12h'); }}
                  >
                    <span>12-hour (AM/PM)</span>
                    {timeFormat === '12h' && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="date-format-dropdown py-1 px-2 bg-[#0a0a0a] my-1 mx-1 inline-block border-l-2 border-blue-500 border-t border-b border-r border-gray-800 hover:border-blue-500/40 transition-all duration-300 hover:bg-[#0c0c0c] cursor-pointer hover:shadow-[0_0_10px_rgba(75,156,211,0.25)] rounded-sm relative group"
                onClick={() => setShowDateOptions(!showDateOptions)}>
              <div className="flex items-center">
                <span className="text-white">{formattedDate}</span>
                <span className="flex items-center ml-2 bg-blue-900/40 text-blue-300 text-[10px] rounded-sm py-0.5 px-1 border border-blue-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  FORMAT
                </span>
              </div>
              
              {/* Interactive indicator */}
              <div className="mt-1 flex items-center text-[10px] text-blue-400/60">
                <div className="h-1 w-1 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                <span>Click to change date format</span>
              </div>
              
              {/* Date Format Options */}
              {showDateOptions && (
                <div className="absolute z-50 left-0 top-full mt-1 bg-gradient-to-b from-[#111] to-black border border-blue-900/50 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full p-0 overflow-hidden">
                  <div className="bg-blue-900/20 px-2 py-1 text-[10px] uppercase text-blue-400/80 font-medium tracking-wider">
                    Select Format
                  </div>
                  <div 
                    className={`px-3 py-2 text-left cursor-pointer flex items-center justify-between transition-colors
                    ${dateFormat === 'mdy' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-900'}`}
                    onClick={(e) => { e.stopPropagation(); saveDateFormat('mdy'); }}
                  >
                    <span>Month-Day (US Style)</span>
                    {dateFormat === 'mdy' && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div 
                    className={`px-3 py-2 text-left cursor-pointer flex items-center justify-between transition-colors
                    ${dateFormat === 'dmy' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-900'}`}
                    onClick={(e) => { e.stopPropagation(); saveDateFormat('dmy'); }}
                  >
                    <span>Day-Month (European)</span>
                    {dateFormat === 'dmy' && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div 
                    className={`px-3 py-2 text-left cursor-pointer flex items-center justify-between transition-colors
                    ${dateFormat === 'ymd' ? 'bg-blue-900/30 text-blue-300' : 'text-gray-300 hover:bg-gray-900'}`}
                    onClick={(e) => { e.stopPropagation(); saveDateFormat('ymd'); }}
                  >
                    <span>Year-Month-Day (ISO)</span>
                    {dateFormat === 'ymd' && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-3 py-1 bg-[#111] m-1 inline-block border border-transparent hover:border-[#4B9CD3]/40 transition-all duration-300 hover:bg-black cursor-pointer hover:shadow-[0_0_8px_rgba(75,156,211,0.3)] rounded-sm min-w-[180px]">
              {currentInsight.icon} <span className="text-xs font-medium">{currentInsight.text}</span>: {currentInsight.value}
            </div>
          </div>
        </div>
        
        {/* Inspirational Message */}
        <div className="mb-6 text-center">
          <h2 className="text-blue-400 font-orbitron text-3xl mb-2">Welcome to Your Paddock</h2>
          <p className="text-gray-400">Daily weather checks, route planning, and vehicle monitoring in one place</p>
        </div>

      {/* Enhanced F1-Inspired Live Weather Station - Driver-Oriented Weather Dashboard */}
      <section className="mb-8 relative">
        {/* Section accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent"></div>
        
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4 pl-4 flex items-center">
          <Gauge className="mr-2 h-5 w-5 text-blue-400" />
          Live Drive Intelligence
          <span className="ml-3 text-xs bg-blue-900/30 px-2 py-0.5 rounded-sm text-blue-300 uppercase tracking-wide">Real-time Telemetry</span>
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Driver-Oriented Weather Metrics */}
          <div className="bg-gradient-to-r from-black/95 to-gray-900/90 rounded-xl p-5 border border-blue-900/30 shadow-lg backdrop-blur-sm relative overflow-hidden">
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
                {lastUpdated ? (
                  <span className="text-xs text-green-400 font-mono">
                    {isUsingFallbackData ? "CACHED" : "LIVE"} - {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-xs text-green-400 font-mono">LOADING</span>
                )}
              </div>
            </div>
            
            <div id="weather-snapshot-capture-area" className="grid grid-cols-1 gap-6 relative z-10">
              {/* F1-style telemetry clock display with race-inspired design */}
              <div className="bg-black/80 p-4 rounded-lg border border-blue-700/30 shadow-lg overflow-hidden hover:shadow-[0_0_15px_rgba(75,156,211,0.2)] transition-all duration-300 group/clock">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-blue-400/80 text-xs uppercase tracking-wider font-bold mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1 group-hover/clock:text-blue-300 transition-colors duration-300" />
                      <span className="group-hover/clock:text-blue-300 transition-colors duration-300">DRIVE TIME</span>
                    </div>
                    <div className="text-white text-3xl font-mono font-bold tracking-wider group-hover/clock:text-blue-100 transition-colors duration-300" id="live-clock">
                      {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-900/30 px-3 py-2 rounded-sm border border-blue-800/20 transition-all duration-300 hover:border-blue-600/50 hover:bg-blue-900/40 cursor-pointer">
                      <div className="text-blue-400/70 text-xs mb-1 uppercase font-semibold">Session</div>
                      <div className="text-white text-sm font-medium flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                        ACTIVE
                      </div>
                    </div>
                    <div className="bg-green-900/30 px-3 py-2 rounded-sm border border-green-800/20 transition-all duration-300 hover:border-green-600/50 hover:bg-green-900/40 cursor-pointer">
                      <div className="text-green-400/70 text-xs mb-1 uppercase font-semibold">Conditions</div>
                      <div className="text-white text-sm font-medium flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        OPTIMAL
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subtle animated accent line */}
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-600/0 via-blue-600/50 to-blue-600/0 mt-3 opacity-50 group-hover/clock:opacity-80 transition-opacity duration-500"></div>
              </div>
              
              {/* Core Driver Metrics - Enhanced F1 Style Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Thermometer className="h-3 w-3 mr-1 group-hover:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover:text-blue-300 transition-colors duration-300">Air Temp</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors duration-300">
                    {weatherData && weatherData.main && typeof weatherData.main.temp === 'number' 
                      ? weatherData.main.temp.toFixed(1) + "°F" 
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors duration-300" 
                         style={{ width: weatherData?.main?.temp ? `${Math.min(100, (weatherData.main.temp/100)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Droplets className="h-3 w-3 mr-1 group-hover:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover:text-blue-300 transition-colors duration-300">Humidity</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors duration-300">
                    {weatherData && weatherData.main && typeof weatherData.main.humidity === 'number'
                      ? weatherData.main.humidity + "%" 
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors duration-300" 
                         style={{ width: weatherData?.main?.humidity ? `${weatherData.main.humidity}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Thermometer className="h-3 w-3 mr-1 group-hover:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover:text-blue-300 transition-colors duration-300">Surface Temp</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors duration-300">
                    {automotiveWeatherData && 
                     automotiveWeatherData.automotive_metrics && 
                     automotiveWeatherData.automotive_metrics.track_surface && 
                     typeof automotiveWeatherData.automotive_metrics.track_surface.temperature === 'number'
                      ? automotiveWeatherData.automotive_metrics.track_surface.temperature.toFixed(1) + "°F"
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors duration-300" 
                         style={{ width: automotiveWeatherData?.automotive_metrics?.track_surface?.temperature ? `${Math.min(100, (automotiveWeatherData.automotive_metrics.track_surface.temperature/120)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Sun className="h-3 w-3 mr-1 group-hover:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover:text-blue-300 transition-colors duration-300">UV Index</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors duration-300">
                    {automotiveWeatherData && 
                     automotiveWeatherData.conditions && 
                     typeof automotiveWeatherData.conditions.uv_index === 'number'
                      ? automotiveWeatherData.conditions.uv_index.toFixed(1)
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors duration-300" 
                         style={{ width: automotiveWeatherData?.conditions?.uv_index ? `${Math.min(100, (automotiveWeatherData.conditions.uv_index/11)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-blue-900/30 relative overflow-hidden group hover:border-blue-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-blue-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Cloud className="h-3 w-3 mr-1 group-hover:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover:text-blue-300 transition-colors duration-300">Dew Point</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-blue-300 transition-colors duration-300">
                    {weatherData && 
                     weatherData.main && 
                     typeof weatherData.main.temp === 'number' &&
                     typeof weatherData.main.humidity === 'number'
                      ? (weatherData.main.temp - 10).toFixed(1) + "°F"
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors duration-300" 
                         style={{ width: weatherData?.main?.temp ? `${Math.min(100, ((weatherData.main.temp - 10)/80)*100)}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div className="bg-black/70 p-3 rounded-sm border border-green-900/30 relative overflow-hidden group hover:border-green-500 hover:bg-black/90 hover:shadow-[0_0_10px_rgba(72,187,120,0.15)] transition-all duration-300 cursor-pointer">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500 group-hover:h-[105%] transition-all duration-500"></div>
                  <div className="text-green-400/90 text-xs mb-1 font-medium uppercase tracking-wider flex items-center">
                    <Wind className="h-3 w-3 mr-1 group-hover:text-green-300 transition-colors duration-300" />
                    <span className="group-hover:text-green-300 transition-colors duration-300">Wind Speed</span>
                  </div>
                  <div className="text-white text-xl font-mono font-semibold group-hover:text-green-300 transition-colors duration-300">
                    {weatherData && weatherData.wind && typeof weatherData.wind.speed === 'number'
                      ? weatherData.wind.speed + " mph" 
                      : isUsingFallbackData ? "Cached" : "Loading..."}
                  </div>
                  <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 group-hover:bg-green-400 transition-colors duration-300" 
                         style={{ width: weatherData?.wind?.speed ? `${Math.min(100, (weatherData.wind.speed/30)*100)}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced F1-style telemetry bar */}
              <div className="bg-black/80 rounded-sm border border-gray-800 p-4 relative overflow-hidden hover:border-blue-800/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 group/telemetry">
                {/* F1-style diagonal racing stripe */}
                <div className="absolute top-0 right-0 w-20 h-6 bg-blue-500/20 -skew-x-45 transform origin-top-right group-hover/telemetry:bg-blue-500/30 transition-all duration-500"></div>
                
                <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2 group-hover/telemetry:border-blue-900/40 transition-colors duration-300">
                  <div className="text-blue-400 text-xs uppercase tracking-wider font-bold flex items-center">
                    <Gauge className="h-3.5 w-3.5 mr-1.5 group-hover/telemetry:text-blue-300 transition-colors duration-300" />
                    <span className="group-hover/telemetry:text-blue-300 transition-colors duration-300">Advanced Telemetry</span>
                  </div>
                  <div className="text-green-400 text-xs flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1.5"></span>
                    LIVE FEED
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="group cursor-pointer px-2 py-1 rounded-sm hover:bg-blue-900/10 transition-all duration-300">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1 group-hover:scale-125 transition-transform duration-300"></span>
                      Surface
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors duration-300 flex items-center">
                      {weatherData?.weather && weatherData.weather[0] ? 
                        weatherData.weather[0].main === "Rain" ? "Wet" : 
                        weatherData.weather[0].main === "Snow" ? "Snow" : "Dry"
                        : isUsingFallbackData ? "Cached" : "Loading..."}
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                        {weatherData?.weather && weatherData.weather[0] && weatherData.weather[0].main === "Rain" ? 
                          <span className="text-blue-400">●</span> : 
                          weatherData?.weather && weatherData.weather[0] && weatherData.weather[0].main === "Snow" ? 
                          <span className="text-white">●</span> : 
                          <span className="text-green-400">●</span>}
                      </span>
                    </div>
                  </div>
                  <div className="group cursor-pointer px-2 py-1 rounded-sm hover:bg-blue-900/10 transition-all duration-300">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1 group-hover:scale-125 transition-transform duration-300"></span>
                      Grip Level
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors duration-300 flex items-center">
                      {weatherData?.main ? 
                        // Simple mapping based on temp and humidity
                        (weatherData.main.humidity > 80 ? "Reduced" : 
                         weatherData.main.humidity < 40 ? "Optimal" : "Good")
                        : isUsingFallbackData ? "Cached" : "Loading..."}
                      <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs">
                        {weatherData?.main && weatherData.main.humidity > 80 ? 
                          <span className="text-yellow-400">▼</span> : 
                          weatherData?.main && weatherData.main.humidity < 40 ? 
                          <span className="text-green-400">▲</span> : 
                          <span className="text-blue-400">■</span>}
                      </span>
                    </div>
                  </div>
                  <div className="group cursor-pointer px-2 py-1 rounded-sm hover:bg-green-900/10 transition-all duration-300">
                    <div className="text-green-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-green-500 mr-1 group-hover:scale-125 transition-transform duration-300"></span>
                      Power Adjust
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-green-300 transition-colors duration-300">
                      {weatherData?.main?.temp ? 
                        // Simple algorithm - not actual data, but based on available weather metrics
                        ((weatherData.main.temp > 85) ? "-" : "+") + 
                        Math.abs(Math.round((weatherData.main.temp - 70) / 5)) + "%"
                        : isUsingFallbackData ? "Cached" : "Loading..."}
                    </div>
                  </div>
                  <div className="group cursor-pointer px-2 py-1 rounded-sm hover:bg-blue-900/10 transition-all duration-300">
                    <div className="text-blue-300/80 text-xs mb-1 font-semibold uppercase flex items-center">
                      <span className="h-1 w-1 rounded-full bg-blue-500 mr-1 group-hover:scale-125 transition-transform duration-300"></span>
                      Visibility
                    </div>
                    <div className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors duration-300">
                      {weatherData && weatherData.visibility
                        ? (weatherData.visibility / 1609).toFixed(1) + " mi"
                        : isUsingFallbackData ? "Cached" : "Loading..."}
                    </div>
                  </div>
                </div>
                
                {/* Subtle pulsing data transmission effect */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover/telemetry:opacity-100 transition-opacity duration-700" style={{animation: 'pulse 3s infinite'}}></div>
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
      
      {/* User Dashboard & Garage Vault Row */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Dashboard Widget */}
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-orbitron text-blue-400 text-xl flex items-center">
              <span className="inline-block w-1.5 h-6 bg-blue-500 mr-2"></span>
              User Dashboard
            </h2>
            <div className="bg-green-600/30 px-2 py-1 rounded text-green-400 text-xs font-medium">
              MEMBER ACCESS
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-white text-lg font-medium">Alex Garza</h3>
              <p className="text-gray-400 text-sm flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Paddock20 Elite Member
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">MEMBERSHIP</p>
              <p className="text-white font-medium">Elite Tier</p>
            </div>
            <div className="bg-black/40 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">DRIVE LOGS</p>
              <p className="text-white font-medium">23 Records</p>
            </div>
            <div className="bg-black/40 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">STATUS</p>
              <p className="text-green-400 font-medium">Active</p>
            </div>
            <div className="bg-black/40 p-3 rounded border border-gray-800">
              <p className="text-gray-400 text-xs mb-1">NEXT EVENT</p>
              <p className="text-white font-medium">May 15</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
              <span>My Dashboard</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </Link>
            
            <div className="flex gap-2">
              <Link to="/dashboard" className="bg-green-600/10 hover:bg-green-600/20 text-green-400 p-1.5 rounded block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </Link>
              <Link to="/settings" className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-1.5 rounded block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </Link>
              <Link to="/notifications" className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 p-1.5 rounded block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Garage Vault Widget */}
        <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg p-6 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-orbitron text-blue-400 text-xl flex items-center">
              <span className="inline-block w-1.5 h-6 bg-green-500 mr-2"></span>
              Garage Vault 
            </h2>
            <div className="flex items-center">
              <div className="text-xs text-gray-400 mr-2">3 Vehicles</div>
              <Link to="/garage-vault" className="text-green-400 hover:text-green-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-gray-800 bg-black/20 mb-4">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img 
                src="/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg" 
                alt="Ferrari 458" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-white font-orbitron text-lg">Ferrari 458</h3>
                      <p className="text-gray-300 text-xs">2015 • V8 Twin-Turbo • 18,942 mi</p>
                    </div>
                    <div className="bg-blue-600/60 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
                      PRIMARY
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 border-t border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-400 font-medium">Vehicle Actions</div>
                <div className="text-xs text-blue-400">Last updated: 2 days ago</div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Link to="/garage-vault?action=maintenance" className="text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors px-2 py-1 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Maintenance</span>
                </Link>
                
                <Link to="/garage-vault?section=gloss&action=wash" className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors px-2 py-1 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
                    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
                  </svg>
                  <span>Wash/Detail</span>
                </Link>
                
                <Link to="/garage-vault?section=modifications&action=mod" className="text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors px-2 py-1 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Mod</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/40 rounded overflow-hidden border border-gray-800 group hover:border-green-800 transition-colors">
              <div className="h-32 overflow-hidden relative">
                <img 
                  src="/assets/gallery/ferrari-mountain-road.png" 
                  alt="McLaren 720S" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h4 className="text-white text-sm font-medium">McLaren 720S</h4>
                  <p className="text-gray-300 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-500 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m18 16 4-4-4-4"></path>
                      <path d="m6 8-4 4 4 4"></path>
                      <path d="m14.5 4-5 16"></path>
                    </svg>
                    14 Service Records
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-black/40 rounded overflow-hidden border border-gray-800 group hover:border-blue-800 transition-colors">
              <div className="h-32 overflow-hidden relative">
                <img 
                  src="/assets/gallery/ferrari-desert.png" 
                  alt="Porsche 911" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h4 className="text-white text-sm font-medium">Porsche 911</h4>
                  <p className="text-gray-300 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-500 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                      <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                    7 Fun Drive Plans
                  </p>
                </div>
              </div>
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

      {/* Inspirational Slogan - Now appears directly above Manifestation Station */}
      <div className="mb-6 text-center">
        <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Drive Like a Champion. <span className="text-green-500">Build Your Legacy.</span></h2>
      </div>

      {/* Manifestation Station */}
      <section className="bg-gradient-to-br from-[#0d0d12] to-[#151520] rounded-xl shadow-2xl border border-blue-900/30 overflow-hidden mb-12 relative">
        {/* F1-inspired accent strips */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-600 to-green-500"></div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Visualization */}
          <div className="w-full lg:w-1/2 relative overflow-hidden">
            <div className="h-full min-h-[300px] lg:min-h-0 relative">
              <img 
                src="/assets/gallery/ferrari-mountain-road.png" 
                alt="Manifestation Visualization" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
                <div>
                  <span className="bg-green-600/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded">PREMIUM FEATURE</span>
                </div>
                <div className="flex space-x-1">
                  <span className="bg-gray-900/60 backdrop-blur-sm text-gray-200 text-xs px-2 py-1 rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    28
                  </span>
                  <span className="bg-gray-900/60 backdrop-blur-sm text-gray-200 text-xs px-2 py-1 rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    142
                  </span>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-4">
                  <h3 className="text-white font-orbitron text-2xl">Manifestation Station</h3>
                  <p className="text-gray-300 text-sm">Visualize your automotive aspirations</p>
                </div>
                <div className="bg-blue-600/30 backdrop-blur-sm rounded-lg border border-blue-500/20 p-3 relative cursor-pointer hover:bg-blue-600/40 transition-colors">
                  <div className="absolute -right-2 -top-2 bg-blue-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div className="text-blue-200 text-sm mb-2">Active Goals</div>
                  <div className="space-y-2">
                    <div className="bg-blue-900/30 rounded px-3 py-2 flex justify-between items-center hover:bg-blue-900/50 transition-colors">
                      <span className="text-white text-sm">Ferrari 488 GTB</span>
                      <span className="text-green-400 text-xs">68%</span>
                    </div>
                    <div className="bg-blue-900/30 rounded px-3 py-2 flex justify-between items-center hover:bg-blue-900/50 transition-colors">
                      <span className="text-white text-sm">Monaco Grand Prix</span>
                      <span className="text-yellow-400 text-xs">42%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Goal Setting */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 bg-gradient-to-br from-[#0d0d12] to-[#151520]">
            <div className="mb-4 pb-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-blue-400 text-xl font-orbitron">Set Your Next Goal</h3>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                <span className="text-xs text-gray-400">AI Powered</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-400 text-xs mb-1">GOAL TYPE</label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => alert('Vehicle goal type selected!')}
                    className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded text-sm hover:bg-blue-600/30 transition-colors">
                    Vehicle
                  </button>
                  <button 
                    onClick={() => alert('Experience goal type selected!')}
                    className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 text-gray-400 rounded text-sm hover:bg-gray-700/50 transition-colors">
                    Experience
                  </button>
                  <button 
                    onClick={() => alert('Achievement goal type selected!')}
                    className="px-3 py-1.5 bg-gray-800/50 border border-gray-700 text-gray-400 rounded text-sm hover:bg-gray-700/50 transition-colors">
                    Achievement
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">DESCRIPTION</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="My next automotive goal is..." 
                    className="w-full bg-black/30 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button 
                    onClick={() => alert('Search for a goal!')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-xs mb-1">TARGET DATE</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <select 
                      onChange={() => alert('Time frame selected!')}
                      className="w-full appearance-none bg-black/30 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                      <option>3 months</option>
                      <option>6 months</option>
                      <option>1 year</option>
                      <option>2 years</option>
                      <option>5 years</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => alert('Goal added successfully!')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Goal
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/20 to-transparent p-3 rounded-lg border-l-2 border-blue-600">
              <p className="text-gray-300 text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>
                  Neuroscience shows visualization increases goal achievement by 1.2-1.4x. Paddock20's Manifestation Station uses this principle to accelerate your automotive ambitions.
                </span>
              </p>
            </div>
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

          {/* Fun Drive Planner */}
          <Link to="/fun-drive-planner" className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-lg hover:border-green-500 transition-colors">
            <h3 className="text-blue-400 font-orbitron text-2xl mb-4">🛣️ Fun Drive Planner</h3>
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
              Beyond weather tracking and fun drive planning, Paddock20™ offers something truly unique: <span className="text-green-400 font-semibold">The Manifestation Station</span>.
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