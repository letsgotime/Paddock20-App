import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Map, 
  Clock, 
  Sun, 
  Cloud, 
  CloudRain, 
  Music, 
  CarFront,
  Filter,
  Save,
  Route,
  Waypoints,
  ArrowRight
} from 'lucide-react';
import { useLocationServices } from '@/contexts/LocationServicesContext';
import { useVehicle } from '@/contexts/VehicleContext';
import { useSpotify } from '@/contexts/SpotifyContext';

/**
 * FunDrivePlanner Component
 * 
 * Interactive tool for planning drives with curated routes, weather insights, and playlist integration.
 * Features F1-inspired styling with emphasis on driver experience customization.
 */
export default function FunDrivePlanner() {
  const locationServices = useLocationServices();
  const vehicle = useVehicle();
  const spotify = useSpotify();
  
  const [driveType, setDriveType] = useState('scenic');
  const [duration, setDuration] = useState(60); // minutes
  const [distance, setDistance] = useState(30); // miles or km
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includeMusic, setIncludeMusic] = useState(true);
  const [startLocation, setStartLocation] = useState(locationServices?.currentLocation?.address || '');
  
  // Get weather forecast for planned drive time
  const getWeatherForecast = () => {
    if (!includeWeather || !locationServices?.forecast) return null;
    
    // Calculate forecast time based on current time + planned duration
    const forecastDate = new Date();
    forecastDate.setMinutes(forecastDate.getMinutes() + duration);
    
    // Return appropriate forecast data
    return locationServices.forecast.find(f => 
      new Date(f.time).getTime() > forecastDate.getTime()
    );
  };
  
  // Get weather icon based on conditions
  const getWeatherIcon = (conditions: string = '') => {
    const condLower = conditions.toLowerCase();
    
    if (condLower.includes('clear') || condLower.includes('sunny')) {
      return <Sun className="text-yellow-400" />;
    } else if (condLower.includes('rain') || condLower.includes('shower')) {
      return <CloudRain className="text-blue-400" />;
    } else {
      return <Cloud className="text-gray-400" />;
    }
  };
  
  // Get recommended playlists based on weather, time, and drive type
  const getRecommendedPlaylists = () => {
    if (!includeMusic || !spotify?.playlists) return [];
    
    // Filter playlists based on drive parameters
    return spotify.playlists.filter(playlist => {
      // In a real app, this would use sophisticated filtering logic based on
      // drive parameters, but we'll return available playlists from the context
      return true;
    });
  };
  
  const recommendedPlaylists = getRecommendedPlaylists();
  const weatherForecast = getWeatherForecast();
  
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-blue-400 font-orbitron text-sm">FUN DRIVE PLANNER</h3>
        <Badge variant="outline" className="text-green-400 border-green-500/30">
          {vehicle?.activeVehicle ? 'READY TO DRIVE' : 'SELECT VEHICLE'}
        </Badge>
      </div>
      
      {/* Drive Parameters */}
      <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-400 text-sm font-orbitron">DRIVE PARAMETERS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-400 text-xs block mb-1">STARTING LOCATION</Label>
            <div className="flex space-x-2">
              <Input 
                className="bg-black/30 border-gray-700 text-white"
                placeholder="Current location"
                value={startLocation}
                onChange={e => setStartLocation(e.target.value)}
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-gray-400 text-xs block mb-1">DRIVE TYPE</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={driveType === 'scenic' ? 'default' : 'outline'} 
                className={driveType === 'scenic' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700'}
                onClick={() => setDriveType('scenic')}
              >
                <Route className="mr-2 h-4 w-4" />
                Scenic
              </Button>
              <Button 
                variant={driveType === 'spirited' ? 'default' : 'outline'} 
                className={driveType === 'spirited' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700'}
                onClick={() => setDriveType('spirited')}
              >
                <Waypoints className="mr-2 h-4 w-4" />
                Spirited
              </Button>
              <Button 
                variant={driveType === 'relaxed' ? 'default' : 'outline'} 
                className={driveType === 'relaxed' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-700'}
                onClick={() => setDriveType('relaxed')}
              >
                <CarFront className="mr-2 h-4 w-4" />
                Relaxed
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-gray-400 text-xs">DURATION: {duration} MIN</Label>
                <span className="text-gray-500 text-xs">{Math.floor(duration / 60)}h {duration % 60}m</span>
              </div>
              <Slider 
                value={[duration]} 
                min={15} 
                max={240} 
                step={15} 
                onValueChange={(vals) => setDuration(vals[0])} 
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-gray-400 text-xs">DISTANCE: {distance} {locationServices?.preferences?.units === 'metric' ? 'KM' : 'MI'}</Label>
                <span className="text-gray-500 text-xs">Approx.</span>
              </div>
              <Slider 
                value={[distance]} 
                min={5} 
                max={200} 
                step={5} 
                onValueChange={(vals) => setDistance(vals[0])} 
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-weather" className="text-gray-300 flex items-center cursor-pointer">
                <Sun className="h-4 w-4 mr-2 text-blue-400" />
                Include weather insights
              </Label>
              <Switch 
                id="include-weather" 
                checked={includeWeather}
                onCheckedChange={setIncludeWeather}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="include-music" className="text-gray-300 flex items-center cursor-pointer">
                <Music className="h-4 w-4 mr-2 text-blue-400" />
                Include music recommendations
              </Label>
              <Switch 
                id="include-music" 
                checked={includeMusic}
                onCheckedChange={setIncludeMusic}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Weather Forecast (if enabled) */}
      {includeWeather && (
        <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm font-orbitron">WEATHER FORECAST</CardTitle>
          </CardHeader>
          <CardContent>
            {weatherForecast ? (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                    {getWeatherIcon(weatherForecast.conditions)}
                  </div>
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-white text-2xl font-mono">
                        {Math.round(weatherForecast.temp)}°
                      </span>
                      <span className="text-gray-400 text-xl ml-1">
                        {locationServices?.preferences?.units === 'metric' ? 'C' : 'F'}
                      </span>
                    </div>
                    <p className="text-gray-300">{weatherForecast.conditions}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-300 mb-1">
                    <Clock size={14} className="mr-1" />
                    <span>
                      {new Date(weatherForecast.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Map size={14} className="mr-1" />
                    <span>{locationServices?.currentLocation?.city || 'Your area'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400 py-2">
                Weather forecast not available for the planned time
              </p>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Spotify Integration (if enabled) */}
      {includeMusic && (
        <Card className="bg-gradient-to-r from-gray-900 to-black border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 text-sm font-orbitron">DRIVE SOUNDTRACK</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendedPlaylists.length > 0 ? (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">Recommended playlists for your drive:</p>
                
                <div className="space-y-2">
                  {recommendedPlaylists.slice(0, 3).map((playlist, index) => (
                    <div 
                      key={playlist.id || index}
                      className="flex items-center justify-between bg-black/30 p-2 rounded-md hover:bg-black/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        {playlist.image ? (
                          <img src={playlist.image} alt={playlist.name} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
                            <Music className="text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{playlist.name}</p>
                          <p className="text-gray-400 text-xs">{playlist.trackCount} tracks • {playlist.duration}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-blue-400">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-3">
                <Music className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">
                  Connect Spotify to get personalized drive soundtracks
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button variant="outline" className="flex-1 border-gray-700 text-white">
          <Filter className="mr-2 h-4 w-4" /> More Options
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          <Map className="mr-2 h-4 w-4" /> Plan My Drive
        </Button>
      </div>
      
      {/* Saved Routes */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-300 text-sm">Saved Routes</h3>
          <Button variant="ghost" size="sm" className="h-7 text-gray-400 hover:text-white">
            <Save className="h-3.5 w-3.5 mr-1" /> Manage
          </Button>
        </div>
        
        <Separator className="bg-gray-800 mb-3" />
        
        <div className="grid grid-cols-1 gap-2">
          {vehicle?.savedRoutes && vehicle.savedRoutes.length > 0 ? (
            vehicle.savedRoutes.map((route, index) => (
              <Card key={route.id || index} className="bg-black/30 border-gray-800">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{route.name}</p>
                    <div className="flex items-center text-gray-400 text-xs mt-1">
                      <Map size={12} className="mr-1" />
                      <span>{route.distance} {locationServices?.preferences?.units === 'metric' ? 'km' : 'mi'}</span>
                      <span className="mx-1">•</span>
                      <Clock size={12} className="mr-1" />
                      <span>{route.duration}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                    {route.type}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-2">No saved routes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}