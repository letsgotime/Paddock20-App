import React, { useState, useEffect } from 'react';
import { Download, Camera, Share2, Cloud, Check, History } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useWeather } from '../contexts/WeatherContext';

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
      const surfaceTemp = automotiveWeatherData?.automotive_metrics?.track_surface?.temperature || temp;
      
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

  // Full version
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-black/90 to-gray-900/80 rounded-xl p-4 border border-blue-900/30 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Weather Snapshot</h3>
          
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
            >
              {captureSuccess ? <Check size={16} /> : <Camera size={16} />}
            </button>
          </div>
        </div>
        
        <div className="mb-3 text-xs text-blue-300/70">
          Tap the camera icon to save current conditions
        </div>
        
        {/* Most recent snapshot preview */}
        {snapshots.length > 0 && (
          <div className="mt-4 border border-blue-900/20 rounded-lg overflow-hidden bg-black/40">
            <div className="p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/10 text-xs font-medium text-blue-400">
              Latest Snapshot: {formatDate(snapshots[0].timestamp)}
            </div>
            
            <div className="p-3 flex items-center">
              <div className="flex-grow">
                <div className="text-white text-lg font-semibold">{snapshots[0].temperature.toFixed(1)}°F</div>
                <div className="text-blue-300 text-xs">{snapshots[0].location}</div>
                <div className="text-gray-400 text-xs mt-1">{snapshots[0].condition}</div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Humidity: <span className="text-white">{snapshots[0].humidity}%</span></div>
                  <div className="text-gray-400">Wind: <span className="text-white">{snapshots[0].windSpeed} mph</span></div>
                  <div className="text-gray-400">Feels Like: <span className="text-white">{snapshots[0].feelsLike.toFixed(1)}°F</span></div>
                  <div className="text-gray-400">Surface: <span className="text-white">{snapshots[0].surfaceTemp.toFixed(1)}°F</span></div>
                </div>
              </div>
              
              {snapshots[0].imageData && (
                <div className="ml-3 flex flex-col space-y-1.5">
                  <button
                    onClick={() => downloadSnapshot(snapshots[0])}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-all"
                    aria-label="Download snapshot"
                    title="Download snapshot"
                  >
                    <Download size={15} />
                  </button>
                  
                  <button
                    onClick={() => shareSnapshot(snapshots[0])}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 transition-all"
                    aria-label="Share snapshot"
                    title="Share snapshot"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {snapshots.length === 0 && (
          <div className="h-24 flex flex-col items-center justify-center border border-dashed border-blue-900/30 rounded-lg bg-black/20 text-blue-400/60">
            <Cloud className="w-6 h-6 mb-2 opacity-40" />
            <span className="text-xs">No snapshots yet</span>
          </div>
        )}
        
        {/* View all snapshots link */}
        {snapshots.length > 0 && (
          <div className="mt-3 text-center">
            <button 
              className="text-xs text-blue-400 hover:text-blue-300 transition-all"
              onClick={() => {/* TODO: navigate to snapshots history */}}
            >
              View all {snapshots.length} snapshot{snapshots.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OneTapWeatherSnapshot;