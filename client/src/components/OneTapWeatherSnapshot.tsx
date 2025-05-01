import React, { useState } from 'react';
import { Download, Camera, Share2, Cloud, Check } from 'lucide-react';
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

const OneTapWeatherSnapshot: React.FC = () => {
  const { currentWeather, locationName } = useWeatherContext();
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Function to capture the weather snapshot
  const captureSnapshot = async () => {
    if (!currentWeather) return;
    
    setIsCapturing(true);
    
    try {
      // Create a new snapshot object
      const newSnapshot: WeatherSnapshot = {
        id: `snapshot-${Date.now()}`,
        timestamp: Date.now(),
        location: locationName || 'Unknown Location',
        temperature: currentWeather.temp || 0,
        condition: currentWeather.weatherDescription || 'Unknown',
        humidity: currentWeather.humidity || 0,
        windSpeed: currentWeather.windSpeed || 0,
        feelsLike: currentWeather.feelsLike || 0,
        surfaceTemp: currentWeather.surfaceTemp || 0,
      };
      
      // Try to capture the current weather display as an image
      try {
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
      setShowShareOptions(true);
      return;
    }
    
    try {
      const blob = await fetch(snapshot.imageData || '').then(r => r.blob());
      const file = new File([blob], `weather-snapshot.png`, { type: 'image/png' });
      
      await navigator.share({
        title: `Weather Snapshot - ${snapshot.location}`,
        text: `Weather in ${snapshot.location}: ${snapshot.temperature}°F, ${snapshot.condition}`,
        files: [file],
      });
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

  if (!currentWeather) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
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