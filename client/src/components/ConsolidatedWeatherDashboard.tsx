import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

/**
 * A dashboard component that uses the consolidated weather service
 * This demonstrates our new approach to weather data retrieval
 */
export function ConsolidatedWeatherDashboard() {
  const { 
    weatherData, 
    automotiveWeatherData, 
    isLoading, 
    error, 
    refreshWeather,
    lastUpdated,
    failureCount,
    isUsingFallbackData
  } = useWeather();

  // Function to format time nicely
  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to calculate how long ago data was updated
  const getTimeAgo = () => {
    if (!lastUpdated) return 'Never';
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (error) {
    return (
      <Card className="bg-card border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Weather Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Failed to load weather data: {error.message}</p>
          <Button 
            onClick={refreshWeather} 
            variant="outline" 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Weather Data</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!weatherData || !automotiveWeatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Weather Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Please select a location to view weather information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="relative">
        <CardTitle className="flex justify-between items-center">
          <span>Weather Dashboard</span>
          <Button 
            onClick={refreshWeather} 
            variant="ghost" 
            size="sm"
            className="h-8"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardTitle>
        {isUsingFallbackData && (
          <p className="text-xs text-amber-500 absolute top-1 right-1 bg-card px-2 py-1 rounded-md">
            Using cached data (API rate limited)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status information */}
          <div className="text-xs text-muted-foreground mb-4 flex justify-between">
            <span>Last updated: {getTimeAgo()}</span>
            <span>API calls failed: {failureCount}</span>
          </div>

          {/* Current weather summary */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {automotiveWeatherData.conditions.summary}
              </h3>
              <p className="text-3xl font-bold">
                {Math.round(automotiveWeatherData.conditions.air_temperature)}°
                <span className="text-lg font-normal">F</span>
              </p>
              <p className="text-sm">
                Feels like {Math.round(automotiveWeatherData.conditions.feels_like)}°F
              </p>
            </div>
            <div className="text-right">
              <img 
                src={`https://openweathermap.org/img/wn/${automotiveWeatherData.conditions.icon}@2x.png`} 
                alt={automotiveWeatherData.conditions.summary} 
                className="h-16 w-16"
              />
              <p className="text-sm">
                Humidity: {automotiveWeatherData.conditions.humidity}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            {/* Automotive metrics */}
            <div>
              <h3 className="font-semibold mb-2">Driving Conditions</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Surface Condition:</span> 
                  <span className="font-medium">{automotiveWeatherData.automotive_metrics.track_surface.condition}</span>
                </li>
                <li className="flex justify-between">
                  <span>Grip Level:</span> 
                  <span className="font-medium">{automotiveWeatherData.automotive_metrics.track_surface.grip_level}</span>
                </li>
                <li className="flex justify-between">
                  <span>Surface Temp:</span> 
                  <span className="font-medium">{automotiveWeatherData.automotive_metrics.track_surface.temperature}°F</span>
                </li>
                <li className="flex justify-between">
                  <span>Visibility:</span> 
                  <span className="font-medium">{automotiveWeatherData.automotive_metrics.visibility_assessment}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sun Glare Risk:</span> 
                  <span className="font-medium">{automotiveWeatherData.automotive_metrics.sunglare_risk}</span>
                </li>
              </ul>
            </div>

            {/* Day details */}
            <div>
              <h3 className="font-semibold mb-2">Today's Details</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Sunrise:</span>
                  <span className="font-medium">{formatTime(automotiveWeatherData.sunrise_time)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunset:</span>
                  <span className="font-medium">{formatTime(automotiveWeatherData.sunset_time)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Wind:</span>
                  <span className="font-medium">
                    {Math.round(automotiveWeatherData.conditions.wind_speed)} mph
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>UV Index:</span>
                  <span className="font-medium">{automotiveWeatherData.conditions.uv_index}</span>
                </li>
                <li className="flex justify-between">
                  <span>Pressure:</span>
                  <span className="font-medium">{automotiveWeatherData.conditions.pressure} hPa</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tire recommendations */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Tire Recommendations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium">Performance Warmup</p>
                <p className="text-lg">
                  {automotiveWeatherData.automotive_metrics.drive_recommendations.tire_warmup_minutes.performance} min
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium">Street Warmup</p>
                <p className="text-lg">
                  {automotiveWeatherData.automotive_metrics.drive_recommendations.tire_warmup_minutes.street} min
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium">Pressure Adjust</p>
                <p className="text-lg">
                  {automotiveWeatherData.automotive_metrics.drive_recommendations.tire_pressure_adjustment > 0 ? 
                    `+${automotiveWeatherData.automotive_metrics.drive_recommendations.tire_pressure_adjustment}` : 
                    automotiveWeatherData.automotive_metrics.drive_recommendations.tire_pressure_adjustment} PSI
                </p>
              </div>
            </div>
          </div>

          {/* Hourly forecast */}
          {automotiveWeatherData.hourly_forecast && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Next Few Hours</h3>
              <div className="flex overflow-x-auto space-x-4 pb-2">
                {automotiveWeatherData.hourly_forecast.slice(0, 6).map((hour: any, index: number) => (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs">{formatTime(hour.time)}</span>
                    <span className="text-lg font-medium">{Math.round(hour.temperature)}°</span>
                    <span className="text-xs">{Math.round(hour.precipitation_chance)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsolidatedWeatherDashboard;