import React, { useState, useEffect } from 'react';
import { Download, Camera, Share2, Cloud, Check, History } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useWeather } from '../contexts/FixedWeatherContext';

interface WeatherSnapshot {
  id: string;
  timestamp: number;
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  surfaceTemp: number;
  imageData?: string;
}

interface OneTapWeatherSnapshotProps {
  floating?: boolean;
  mini?: boolean;
  className?: string;
}

const OneTapWeatherSnapshot: React.FC<OneTapWeatherSnapshotProps> = ({ 
  floating = false,
  mini = false,
  className = ''
}) => {
  const { 
    weatherData,
    selectedLocation,
    automotiveWeatherData
  } = useWeather();
  
  // Initialize snapshots from localStorage if available
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('weather-snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading snapshots from storage:", e);
      return [];
    }
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  
  // Function to capture the weather snapshot
  const captureSnapshot = async () => {
    if (!weatherData || !automotiveWeatherData) return;
    
    setIsCapturing(true);
    
    try {
      // Get the current main weather values from the API data
      const temp = weatherData.main?.temp;
      const condition = weatherData.weather?.[0]?.description || 'Unknown';
      const humidity = weatherData.main?.humidity || 0;
      const windSpeed = weatherData.wind?.speed || 0;
      const feelsLike = weatherData.main?.feels_like || temp;
      const surfaceTemp = automotiveWeatherData?.conditions?.air_temperature || temp;
      
      // Create a new snapshot object with real API data
      const newSnapshot: WeatherSnapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: Date.now(),
        location: selectedLocation?.name || 'Unknown Location',
        temperature: temp || 0,
        condition: condition,
        humidity: humidity,
        windSpeed: windSpeed,
        feelsLike: feelsLike || 0,
        surfaceTemp: surfaceTemp || 0,
      };
      
      // Try to capture the current weather display as an image if available
      try {
        // This will capture any element with this ID - we could add it to the CurrentWeatherWidget
        const weatherElement = document.getElementById('weather-snapshot-capture-area');
        if (weatherElement) {
          const canvas = await html2canvas(weatherElement, {
            backgroundColor: null,
            logging: false,
            scale: 2, // Higher quality
          });
          newSnapshot.imageData = canvas.toDataURL('image/png');
        }
      } catch (err) {
        console.error('Error capturing weather display:', err);
        // Continue without image if capture fails
      }
      
      // Add to snapshots
      setSnapshots(prev => [newSnapshot, ...prev]);
      
      // Show success message briefly
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 2000);
      
      // Save to localStorage
      const savedSnapshots = JSON.parse(localStorage.getItem('weather-snapshots') || '[]');
      localStorage.setItem('weather-snapshots', JSON.stringify([newSnapshot, ...savedSnapshots]));
      
    } catch (error) {
      console.error('Error creating snapshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Function to download a snapshot as an image
  const downloadSnapshot = (snapshot: WeatherSnapshot) => {
    if (!snapshot.imageData) return;
    
    const link = document.createElement('a');
    link.href = snapshot.imageData;
    link.download = `weather-snapshot-${new Date(snapshot.timestamp).toISOString().split('T')[0]}.png`;
    link.click();
  };
  
  // Function to share a snapshot (if Web Share API is available)
  const shareSnapshot = async (snapshot: WeatherSnapshot) => {
    if (!navigator.share) {
      alert('Sharing is not supported on this device');
      return;
    }
    
    try {
      // If we have image data, share that too
      if (snapshot.imageData) {
        const blob = await fetch(snapshot.imageData).then(r => r.blob());
        const file = new File([blob], `weather-snapshot.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `Weather Snapshot - ${snapshot.location}`,
          text: `Weather in ${snapshot.location}: ${snapshot.temperature.toFixed(1)}°F, ${snapshot.condition}`,
          files: [file],
        });
      } else {
        // Text-only share if no image
        await navigator.share({
          title: `Weather Snapshot - ${snapshot.location}`,
          text: `Weather in ${snapshot.location}: ${snapshot.temperature.toFixed(1)}°F, ${snapshot.condition}. Humidity: ${snapshot.humidity}%, Wind: ${snapshot.windSpeed} mph`
        });
      }
    } catch (error) {
      console.error('Error sharing snapshot:', error);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Return null if no weather data available
  if (!weatherData) {
    return null;
  }

  // Mini version (just the camera button)
  if (mini) {
    return (
      <div className={`${className}`}>
        <button 
          onClick={captureSnapshot}
          disabled={isCapturing || captureSuccess}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all shadow-md ${
            captureSuccess 
              ? 'bg-green-700/80 text-green-100' 
              : isCapturing 
                ? 'bg-blue-900/70 text-blue-300/50' 
                : 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 hover:text-blue-200 active:bg-blue-900/80'
          }`}
          aria-label="Capture weather snapshot"
          title="Save current weather"
        >
          {captureSuccess ? <Check size={18} /> : <Camera size={18} />}
        </button>
        
        {snapshots.length > 0 && (
          <button
            onClick={() => {/* TODO: navigate to snapshots history */}}
            className="w-9 h-9 mt-2 flex items-center justify-center rounded-full transition-all shadow-md bg-black/40 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
            aria-label="View saved snapshots"
            title={`View ${snapshots.length} saved snapshot${snapshots.length > 1 ? 's' : ''}`}
          >
            <History size={18} />
          </button>
        )}
      </div>
    );
  }

  // Floating version
  if (floating) {
    return (
      <div className={`fixed bottom-20 right-4 z-30 ${className}`}>
        <div className="bg-gradient-to-r from-black/90 to-gray-900/90 rounded-full p-3 border border-blue-900/30 shadow-lg">
          <button 
            onClick={captureSnapshot}
            disabled={isCapturing || captureSuccess}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              captureSuccess 
                ? 'bg-green-700/40 text-green-400' 
                : isCapturing 
                  ? 'bg-blue-900/30 text-blue-300/50' 
                  : 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50'
            }`}
            aria-label="Capture weather snapshot"
            title="Save current weather conditions"
          >
            {captureSuccess ? <Check size={22} /> : <Camera size={22} />}
          </button>
        </div>
      </div>
    );
  }

  // Full version - Enhanced F1-inspired design
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-5 border border-blue-900/30 shadow-lg backdrop-blur-sm relative">
        {/* Carbon fiber pattern overlay for F1 style */}
        <div className="absolute inset-0 opacity-5 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat"></div>
        
        {/* F1-style diagonal racing stripe */}
        <div className="absolute -top-2 -right-2 w-20 h-12 bg-blue-500/10 rotate-12 transform origin-top-right"></div>
        
        {/* Top status bar - F1 pit wall style */}
        <div className="flex items-center justify-between mb-4 border-b border-blue-900/30 pb-2 relative z-10">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <h3 className="text-blue-400 font-orbitron font-bold text-sm uppercase tracking-wider">Weather Snapshot</h3>
          </div>
          
          <div className="flex space-x-1">
            <button 
              onClick={captureSnapshot}
              disabled={isCapturing || captureSuccess}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all 
                ${captureSuccess 
                  ? 'bg-green-700/40 text-green-400' 
                  : isCapturing 
                    ? 'bg-blue-900/30 text-blue-300/50' 
                    : 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50'}`}
              aria-label="Capture weather snapshot"
              title="Capture current weather telemetry"
            >
              {captureSuccess ? <Check size={16} /> : <Camera size={16} />}
            </button>
          </div>
        </div>
        
        <div className="mb-4 p-2 rounded bg-blue-900/10 border border-blue-900/20 text-xs text-blue-300/90 flex items-center">
          <Camera className="w-3.5 h-3.5 mr-2 text-blue-400" />
          <span className="font-medium">
            Tap to capture complete drive environment telemetry
          </span>
        </div>
        
        {/* Current Weather Conditions Preview - F1 Telemetry Style */}
        <div className="mb-4 border border-blue-900/30 rounded-lg bg-black/60 overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 text-xs font-medium flex items-center justify-between border-b border-blue-900/20">
            <span className="text-blue-300 font-orbitron uppercase tracking-wide">Current Driver Conditions</span>
            <span className="text-blue-400/70 font-mono">{new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="p-3">
            <div className="flex items-center mb-2">
              {weatherData?.weather?.[0]?.icon && (
                <div className="mr-3 rounded bg-blue-900/20 p-1.5 border border-blue-900/20">
                  <img 
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                    className="w-12 h-12" 
                    alt={weatherData.weather[0].description || 'Weather icon'} 
                  />
                </div>
              )}
              
              <div>
                <div className="text-white text-2xl font-mono font-bold">
                  {weatherData?.main?.temp ? `${weatherData.main.temp.toFixed(1)}°F` : "--°F"}
                </div>
                <div className="text-blue-300 text-xs">{selectedLocation?.name || 'Current Location'}</div>
                <div className="text-gray-400 text-xs flex items-center mt-1">
                  {weatherData?.weather?.[0]?.description ? (
                    <span className="capitalize">{weatherData.weather[0].description}</span>
                  ) : (
                    "Weather data"
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-2 bg-black/60 rounded border border-blue-900/30 flex flex-col">
                <span className="text-xs text-blue-400/70 font-medium mb-1">Track Grip</span>
                <span className="text-white text-sm font-mono">
                  {automotiveWeatherData?.driving_conditions?.road_condition || "--"}
                </span>
              </div>
              
              <div className="p-2 bg-black/60 rounded border border-blue-900/30 flex flex-col">
                <span className="text-xs text-blue-400/70 font-medium mb-1">Surface Temp</span>
                <span className="text-white text-sm font-mono">
                  {automotiveWeatherData?.conditions?.air_temperature 
                    ? `${automotiveWeatherData.conditions.air_temperature.toFixed(1)}°F`
                    : "--°F"}
                </span>
              </div>
              
              <div className="p-2 bg-black/60 rounded border border-blue-900/30 flex flex-col">
                <span className="text-xs text-blue-400/70 font-medium mb-1">Wind</span>
                <span className="text-white text-sm font-mono">
                  {weatherData?.wind?.speed ? `${weatherData.wind.speed.toFixed(1)} mph` : "-- mph"}
                </span>
              </div>
              
              <div className="p-2 bg-black/60 rounded border border-blue-900/30 flex flex-col">
                <span className="text-xs text-blue-400/70 font-medium mb-1">Visibility</span>
                <span className="text-white text-sm font-mono">
                  {automotiveWeatherData?.driving_conditions?.visibility || "--"}
                </span>
              </div>
            </div>
            
            {/* Driver Recommendations */}
            {automotiveWeatherData?.performance_metrics && (
              <div className="mt-3 pt-3 border-t border-blue-900/20">
                <div className="text-xs text-blue-400 font-medium mb-2 font-orbitron uppercase tracking-wide">
                  Drive Recommendations
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500/30 mr-2"></div>
                    <span className="text-gray-400">Fuel Impact: </span>
                    <span className="text-white ml-1 font-mono">
                      {automotiveWeatherData.performance_metrics.fuel_efficiency_impact}%
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500/30 mr-2"></div>
                    <span className="text-gray-400">Handling: </span>
                    <span className="text-white ml-1 font-mono">
                      {automotiveWeatherData.performance_metrics.handling_adjustments}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Most recent snapshot preview - for after capture */}
        {snapshots.length > 0 && (
          <div className="border border-blue-900/20 rounded-lg overflow-hidden bg-black/50">
            <div className="p-2 bg-gradient-to-r from-green-900/20 to-blue-900/10 text-xs font-medium text-green-400 flex items-center justify-between">
              <span className="font-orbitron uppercase">Latest Capture</span>
              <span className="text-gray-400 font-mono">{formatDate(snapshots[0].timestamp)}</span>
            </div>
            
            <div className="p-3 flex items-start">
              <div className="flex-grow">
                <div className="text-white text-lg font-mono font-semibold">{snapshots[0].temperature.toFixed(1)}°F</div>
                <div className="text-blue-300 text-xs">{snapshots[0].location}</div>
                <div className="text-gray-400 text-xs mt-1 capitalize">{snapshots[0].condition}</div>
                
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70 mr-1.5"></div>
                    Humidity: <span className="text-white ml-1 font-mono">{snapshots[0].humidity}%</span>
                  </div>
                  <div className="text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70 mr-1.5"></div>
                    Wind: <span className="text-white ml-1 font-mono">{snapshots[0].windSpeed} mph</span>
                  </div>
                  <div className="text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70 mr-1.5"></div>
                    Feels Like: <span className="text-white ml-1 font-mono">{snapshots[0].feelsLike.toFixed(1)}°F</span>
                  </div>
                  <div className="text-gray-400 flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70 mr-1.5"></div>
                    Surface: <span className="text-white ml-1 font-mono">{snapshots[0].surfaceTemp.toFixed(1)}°F</span>
                  </div>
                </div>
              </div>
              
              {snapshots[0].imageData && (
                <div className="ml-3 flex space-x-1">
                  <button
                    onClick={() => downloadSnapshot(snapshots[0])}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-all"
                    aria-label="Download snapshot"
                    title="Download snapshot"
                  >
                    <Download size={14} />
                  </button>
                  
                  <button
                    onClick={() => shareSnapshot(snapshots[0])}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-all"
                    aria-label="Share snapshot"
                    title="Share snapshot"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {snapshots.length === 0 && (
          <div className="h-24 relative flex flex-col items-center justify-center border border-dashed border-blue-900/30 rounded-lg bg-black/30 text-blue-400/60">
            {/* F1-style diagonal racing stripe */}
            <div className="absolute inset-0 opacity-10 bg-[url('/assets/images/carbon-fiber-pattern.png')] bg-repeat"></div>
            <Cloud className="w-6 h-6 mb-2 opacity-40" />
            <span className="text-xs font-medium">No snapshots captured yet</span>
            <span className="text-[10px] text-blue-500/50 mt-1">Tap camera to save current conditions</span>
          </div>
        )}
        
        {/* View all snapshots link */}
        {snapshots.length > 0 && (
          <div className="mt-3 flex justify-center">
            <button 
              className="text-xs text-blue-400 hover:text-blue-300 transition-all px-3 py-1 rounded-full bg-blue-900/20 border border-blue-900/20 hover:bg-blue-900/30"
              onClick={() => {/* TODO: navigate to snapshots history */}}
            >
              <div className="flex items-center">
                <History className="w-3 h-3 mr-1.5" />
                View all {snapshots.length} snapshot{snapshots.length > 1 ? 's' : ''}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneTapWeatherSnapshot;