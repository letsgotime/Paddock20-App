import React, { useState, useEffect } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { useLocation } from 'wouter';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Clock, 
  Sun, 
  Cloud, 
  FileWarning, 
  ArrowRight, 
  ChevronDown, 
  ArrowDownUp,
  Gauge,
  Flag
} from 'lucide-react';

// F1-style track condition component
const TrackConditionMeter: React.FC<{ label: string; value: number; maxValue: number; color: string; unit?: string }> = ({ 
  label, 
  value, 
  maxValue,
  color,
  unit
}) => {
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-mono font-semibold">{value}{unit}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Track sector component
const TrackSector: React.FC<{ 
  sectorNumber: number; 
  weather?: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  timeOfDay?: string;
}> = ({ 
  sectorNumber,
  weather = 'Unknown', 
  temperature = 0,
  humidity = 0,
  windSpeed = 0,
  timeOfDay = 'day'
}) => {
  
  // Get weather icon based on condition
  const getWeatherIcon = () => {
    switch(weather.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="text-yellow-400" />;
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="text-gray-400" />;
      case 'rain':
      case 'drizzle':
      case 'light rain':
        return <Droplets className="text-blue-400" />;
      default:
        return <Sun className="text-yellow-400" />;
    }
  };
  
  // Get color theme based on time of day
  const getTimeColor = () => {
    switch(timeOfDay) {
      case 'night':
        return 'bg-gradient-to-r from-gray-900 to-blue-900 border-blue-900/50';
      case 'dusk':
        return 'bg-gradient-to-r from-gray-900 to-purple-900 border-purple-900/50';
      case 'dawn':
        return 'bg-gradient-to-r from-gray-900 to-orange-900 border-orange-900/50';
      default:
        return 'bg-gradient-to-r from-gray-900 to-gray-800 border-gray-700/50';
    }
  };
  
  return (
    <div className={`rounded-lg p-4 mb-2 border ${getTimeColor()}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-xs font-bold">
            S{sectorNumber}
          </div>
          <h3 className="font-semibold">Sector {sectorNumber}</h3>
        </div>
        <div className="flex items-center">
          {getWeatherIcon()}
          <span className="text-sm ml-1">{weather}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="flex items-center">
          <Thermometer size={16} className="text-red-400 mr-1" />
          <span className="text-sm">{temperature}°C</span>
        </div>
        <div className="flex items-center">
          <Droplets size={16} className="text-blue-400 mr-1" />
          <span className="text-sm">{humidity}%</span>
        </div>
        <div className="flex items-center">
          <Wind size={16} className="text-blue-300 mr-1" />
          <span className="text-sm">{windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
};

// Main component
const RedlineReportPage: React.FC = () => {
  const { weatherData, oneCallData, isLoading, error } = useWeather();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    sectors: true,
    forecast: false,
    alerts: false
  });
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Redline report data calculated from weather data
  const [redlineData, setRedlineData] = useState({
    trackTemp: 0,
    airTemp: 0,
    humidity: 0,
    windSpeed: 0,
    windDirection: 0,
    precipitation: 0,
    visibility: 10,
    uvIndex: 0,
    sectors: [
      { weather: 'Clear', temperature: 0, humidity: 0, windSpeed: 0, timeOfDay: 'day' },
      { weather: 'Clear', temperature: 0, humidity: 0, windSpeed: 0, timeOfDay: 'day' },
      { weather: 'Clear', temperature: 0, humidity: 0, windSpeed: 0, timeOfDay: 'day' }
    ],
    trackCondition: 'Dry',
    gripLevel: 'High',
    alerts: [] as string[]
  });
  
  // Calculate redline data from weather data
  useEffect(() => {
    if (weatherData && oneCallData) {
      const currentAirTemp = oneCallData.current.temp;
      // Track temp typically 10-15°C above air temp under sunny conditions, less in cloudy
      const isSunny = weatherData.weather[0].main.toLowerCase() === 'clear';
      const trackTempOffset = isSunny ? 15 : 8;
      const trackTemp = currentAirTemp + trackTempOffset;
      
      // Sectors with slight temperature variations
      const sector1Temp = currentAirTemp - 1;
      const sector2Temp = currentAirTemp;
      const sector3Temp = currentAirTemp + 1;
      
      // Wind variations per sector (simplified model)
      const baseWindSpeed = weatherData.wind.speed;
      const sector1Wind = Math.max(0, baseWindSpeed - 0.5);
      const sector2Wind = baseWindSpeed;
      const sector3Wind = Math.max(0, baseWindSpeed + 0.5);
      
      // Grip level calculation based on track temp, humidity and precipitation
      const humidity = weatherData.main.humidity;
      const hasPrecipitation = 
        weatherData.weather[0].main.toLowerCase().includes('rain') || 
        weatherData.weather[0].main.toLowerCase().includes('drizzle');
      
      let trackCondition = 'Dry';
      let gripLevel = 'High';
      
      if (hasPrecipitation) {
        trackCondition = 'Wet';
        gripLevel = 'Low';
      } else if (humidity > 80) {
        trackCondition = 'Damp';
        gripLevel = 'Medium';
      } else if (trackTemp < 15) {
        gripLevel = 'Medium';
      } else if (trackTemp > 40) {
        gripLevel = 'Medium'; // Too hot can reduce grip
      }
      
      // Alerts for extreme conditions
      const alerts = [];
      if (trackTemp > 50) alerts.push('Extreme track temperature may affect tire durability');
      if (humidity > 90) alerts.push('High humidity may create slippery conditions');
      if (baseWindSpeed > 20) alerts.push('Strong crosswinds may affect high-speed stability');
      if (oneCallData.current.uvi > 8) alerts.push('High UV index - crew protection recommended');
      
      // Get current hour to determine time of day simulation
      const currentHour = new Date().getHours();
      const sector1TimeOfDay = currentHour < 8 ? 'dawn' : (currentHour > 18 ? 'dusk' : 'day');
      const sector2TimeOfDay = currentHour < 7 ? 'dawn' : (currentHour > 19 ? 'dusk' : 'day');
      const sector3TimeOfDay = currentHour < 6 ? 'dawn' : (currentHour > 20 ? 'dusk' : 'day');
      
      setRedlineData({
        trackTemp: Math.round(trackTemp),
        airTemp: Math.round(currentAirTemp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(baseWindSpeed),
        windDirection: weatherData.wind.deg || 0,
        precipitation: hasPrecipitation ? 1 : 0,
        visibility: Math.min(10, weatherData.visibility / 1000), // Convert to km, max 10
        uvIndex: Math.round(oneCallData.current.uvi || 0),
        sectors: [
          { 
            weather: weatherData.weather[0].main, 
            temperature: Math.round(sector1Temp), 
            humidity: weatherData.main.humidity - 2, 
            windSpeed: Math.round(sector1Wind),
            timeOfDay: sector1TimeOfDay
          },
          { 
            weather: weatherData.weather[0].main, 
            temperature: Math.round(sector2Temp), 
            humidity: weatherData.main.humidity, 
            windSpeed: Math.round(sector2Wind),
            timeOfDay: sector2TimeOfDay
          },
          { 
            weather: weatherData.weather[0].main, 
            temperature: Math.round(sector3Temp), 
            humidity: weatherData.main.humidity + 2, 
            windSpeed: Math.round(sector3Wind),
            timeOfDay: sector3TimeOfDay
          }
        ],
        trackCondition,
        gripLevel,
        alerts
      });
    }
  }, [weatherData, oneCallData]);
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
          <div className="h-40 bg-gray-800 rounded mb-6"></div>
          <div className="h-60 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error || !weatherData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <FileWarning className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Load Redline Report</h2>
          <p className="text-gray-400 mb-4">
            We couldn't gather the necessary track data. Please check your connection or try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-blue-500 tracking-wide mb-2">Redline Report</h1>
        <p className="text-gray-400">
          F1-style track intelligence for high-performance driving based on real-time weather conditions. 
          Current data for {weatherData.name} area.
        </p>
      </div>
      
      {/* Track condition overview */}
      <div className="mb-6 bg-black/30 rounded-lg border border-gray-800">
        <button 
          onClick={() => toggleSection('overview')}
          className="w-full p-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold flex items-center">
            <Gauge className="mr-2 text-blue-400" size={20} />
            Track Conditions Overview
          </h2>
          <ChevronDown 
            className={`transition-transform ${expandedSections.overview ? 'rotate-180' : ''}`} 
            size={20}
          />
        </button>
        
        {expandedSections.overview && (
          <div className="p-4 pt-0 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/60 rounded-lg p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium">Surface Analysis</h3>
                  <div className="px-3 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm flex items-center">
                    <Flag size={14} className="mr-1" /> {redlineData.trackCondition}
                  </div>
                </div>
                
                <TrackConditionMeter 
                  label="Track Temperature" 
                  value={redlineData.trackTemp} 
                  maxValue={60} 
                  color="bg-gradient-to-r from-yellow-500 to-red-500"
                  unit="°C"
                />
                
                <TrackConditionMeter 
                  label="Air Temperature" 
                  value={redlineData.airTemp} 
                  maxValue={40} 
                  color="bg-gradient-to-r from-blue-500 to-purple-500"
                  unit="°C"
                />
                
                <TrackConditionMeter 
                  label="Humidity" 
                  value={redlineData.humidity} 
                  maxValue={100} 
                  color="bg-gradient-to-r from-blue-400 to-blue-600"
                  unit="%"
                />
                
                <TrackConditionMeter 
                  label="UV Index" 
                  value={redlineData.uvIndex} 
                  maxValue={10} 
                  color="bg-gradient-to-r from-yellow-400 to-orange-500"
                />
              </div>
              
              <div className="bg-gray-900/60 rounded-lg p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-medium">Performance Impact</h3>
                  <div className={`px-3 py-1 rounded text-sm flex items-center
                    ${redlineData.gripLevel === 'High' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 
                    redlineData.gripLevel === 'Medium' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' :
                    'bg-red-500/20 border border-red-500/30 text-red-400'}`}
                  >
                    <ArrowDownUp size={14} className="mr-1" /> Grip: {redlineData.gripLevel}
                  </div>
                </div>
                
                <TrackConditionMeter 
                  label="Wind Speed" 
                  value={redlineData.windSpeed} 
                  maxValue={30} 
                  color="bg-gradient-to-r from-teal-500 to-green-500"
                  unit=" km/h"
                />
                
                <TrackConditionMeter 
                  label="Visibility" 
                  value={redlineData.visibility} 
                  maxValue={10} 
                  color="bg-gradient-to-r from-gray-400 to-gray-600"
                  unit=" km"
                />
                
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">Wind Direction</div>
                  <div className="flex items-center">
                    <div className="h-24 w-24 bg-gray-800 rounded-full relative mb-2 mr-3">
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                        {redlineData.windDirection}°
                      </div>
                      <div 
                        className="absolute top-1/2 left-1/2 h-1 w-10 bg-blue-400 rounded-full origin-left"
                        style={{ 
                          transform: `translateY(-50%) translateX(-50%) rotate(${redlineData.windDirection}deg)`,
                        }}
                      >
                        <div className="absolute right-0 -top-1 h-3 w-3 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm mb-1">{redlineData.windSpeed} km/h</div>
                      <div className="text-xs text-gray-400">
                        {redlineData.windSpeed < 5 ? 'Light winds - optimal conditions' :
                        redlineData.windSpeed < 15 ? 'Moderate winds - minor adjustments needed' :
                        'Strong winds - may affect high-speed cornering'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Track sectors */}
      <div className="mb-6 bg-black/30 rounded-lg border border-gray-800">
        <button 
          onClick={() => toggleSection('sectors')}
          className="w-full p-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold flex items-center">
            <Flag className="mr-2 text-blue-400" size={20} />
            Track Sectors
          </h2>
          <ChevronDown 
            className={`transition-transform ${expandedSections.sectors ? 'rotate-180' : ''}`} 
            size={20}
          />
        </button>
        
        {expandedSections.sectors && (
          <div className="p-4 pt-0 border-t border-gray-800">
            <div className="mb-4 p-3 bg-gray-900/40 rounded">
              <p className="text-sm text-gray-400">
                Track sectors display localized weather conditions across different parts of the driving area. 
                Use this data to anticipate changing conditions during extended driving sessions.
              </p>
            </div>
            
            {redlineData.sectors.map((sector, index) => (
              <TrackSector
                key={index}
                sectorNumber={index + 1}
                weather={sector.weather}
                temperature={sector.temperature}
                humidity={sector.humidity}
                windSpeed={sector.windSpeed}
                timeOfDay={sector.timeOfDay}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Alerts */}
      {redlineData.alerts.length > 0 && (
        <div className="mb-6 bg-black/30 rounded-lg border border-gray-800">
          <button 
            onClick={() => toggleSection('alerts')}
            className="w-full p-4 flex justify-between items-center text-left"
          >
            <h2 className="text-xl font-semibold flex items-center">
              <FileWarning className="mr-2 text-red-400" size={20} />
              Track Alerts
            </h2>
            <ChevronDown 
              className={`transition-transform ${expandedSections.alerts ? 'rotate-180' : ''}`} 
              size={20}
            />
          </button>
          
          {expandedSections.alerts && (
            <div className="p-4 pt-0 border-t border-gray-800">
              <ul className="divide-y divide-red-900/30">
                {redlineData.alerts.map((alert, index) => (
                  <li key={index} className="py-3 flex items-start">
                    <ArrowRight className="text-red-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">{alert}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Race day forecast */}
      <div className="mb-6 bg-black/30 rounded-lg border border-gray-800">
        <button 
          onClick={() => toggleSection('forecast')}
          className="w-full p-4 flex justify-between items-center text-left"
        >
          <h2 className="text-xl font-semibold flex items-center">
            <Clock className="mr-2 text-blue-400" size={20} />
            Session Planning
          </h2>
          <ChevronDown 
            className={`transition-transform ${expandedSections.forecast ? 'rotate-180' : ''}`} 
            size={20}
          />
        </button>
        
        {expandedSections.forecast && (
          <div className="p-4 pt-0 border-t border-gray-800">
            <div className="bg-gray-900/40 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400">
                Based on current conditions, here are strategies to optimize your driving session:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/60 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Recommended Setup</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>
                      Tire Pressure: {redlineData.trackTemp > 30 ? 'Lower than standard (~1-2 psi)' : 
                      redlineData.trackTemp < 15 ? 'Higher than standard (~1-2 psi)' : 
                      'Standard recommended pressure'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>
                      Downforce: {redlineData.windSpeed > 15 ? 'Increase for stability' : 
                      'Standard configuration'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>
                      Suspension: {redlineData.trackCondition === 'Wet' ? 'Softer setup recommended' : 
                      'Standard to firm setup'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>
                      Brake Balance: {redlineData.trackCondition === 'Wet' ? 'Forward bias recommended' : 
                      'Neutral to slight rear bias'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-900/60 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Driver Notes</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>
                      {redlineData.trackCondition === 'Dry' && redlineData.gripLevel === 'High' ? 
                        'Optimal conditions for record attempts' : 
                        'Focus on consistent lap times rather than records'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>
                      {redlineData.sectors[0].timeOfDay !== 'day' || 
                       redlineData.sectors[1].timeOfDay !== 'day' || 
                       redlineData.sectors[2].timeOfDay !== 'day' ? 
                        'Be aware of changing light conditions between sectors' : 
                        'Consistent visibility across all sectors'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>
                      {redlineData.windSpeed > 10 ? 
                        `Watch for crosswinds particularly from ${redlineData.windDirection}° direction` : 
                        'Minimal wind effect on vehicle dynamics'}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                    <span>
                      {redlineData.uvIndex > 5 ? 
                        'High UV index - ensure proper hydration and cabin cooling' : 
                        'Moderate UV levels - standard precautions sufficient'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-800">
        <p>Redline Report - Data refreshes every 30 minutes</p>
        <p className="mt-1">Weather data provided by OpenWeatherMap & AccuWeather</p>
      </footer>
    </div>
  );
};

export default RedlineReportPage;