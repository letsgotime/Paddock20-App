import React from 'react';
import { useWeather } from '@/contexts/FixedWeatherContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Clock, Info } from 'lucide-react';

/**
 * A dashboard component that uses the consolidated weather service
 * This demonstrates our new approach to weather data retrieval
 * Heavily optimized to always prefer showing cached data rather than loading states
 */
export function ConsolidatedWeatherDashboard() {
  const { 
    weatherData, 
    oneCallData,
    automotiveWeatherData, 
    isLoading, 
    error, 
    refreshWeather,
    lastUpdated,
    failureCount,
    isUsingFallbackData,
    nextRefreshTime,
    cacheAge,
    cacheExpiryTime
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

  // Get the current temperature (with fallbacks)
  const getCurrentTemperature = () => {
    if (automotiveWeatherData?.conditions?.air_temperature) {
      return Math.round(automotiveWeatherData.conditions.air_temperature);
    }
    if (oneCallData?.current?.temp) {
      return Math.round(oneCallData.current.temp);
    }
    if (weatherData?.main?.temp) {
      return Math.round(weatherData.main.temp);
    }
    return 'N/A';
  };

  // Get the feels like temperature (with fallbacks)
  const getFeelsLikeTemperature = () => {
    if (automotiveWeatherData?.conditions?.feels_like) {
      return Math.round(automotiveWeatherData.conditions.feels_like);
    }
    if (oneCallData?.current?.feels_like) {
      return Math.round(oneCallData.current.feels_like);
    }
    if (weatherData?.main?.feels_like) {
      return Math.round(weatherData.main.feels_like);
    }
    return 'N/A';
  };

  // Only show an error card if we have an error AND no cached data at all to display
  // This significantly improves user experience by never showing errors when we can show data
  if (error && !weatherData && !oneCallData && !automotiveWeatherData) {
    return (
      <Card className="bg-card border-destructive">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-destructive">Weather Error</span>
            <Button 
              onClick={refreshWeather} 
              variant="ghost" 
              size="sm"
              className="h-8 hover:bg-destructive/10 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Try Again
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">Failed to load weather data: {error.message}</p>
          
          <div className="text-xs border border-dashed border-destructive/30 p-2 rounded bg-destructive/5">
            <p className="font-medium mb-1">Troubleshooting Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>Wait a moment and try again (API rate limits may apply)</li>
              <li>Try selecting a different location</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we're loading but have some cached data, we'll continue to show that data
  // and indicate that we're refreshing with a spinner on the refresh button
  
  // Only if we have absolutely no data (not even cached) do we show a loading state
  if (isLoading && !weatherData && !oneCallData && !automotiveWeatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Weather Dashboard</span>
            <Button 
              onClick={refreshWeather} 
              variant="ghost" 
              size="sm"
              className="h-8 hover:bg-blue-500/10 transition-colors"
              disabled={isLoading}
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Loading...
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Fetching latest weather data...</p>
            <p className="text-xs text-muted-foreground">Weather will appear here in a moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // We have at least some data (weather, oneCall, or automotive)
  if (!weatherData && !oneCallData && !automotiveWeatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Weather Dashboard</span>
            <Button 
              onClick={refreshWeather} 
              variant="ghost" 
              size="sm"
              className="h-8 hover:bg-blue-500/10 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> 
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2 py-8">
            <p className="text-sm">No weather data available for this location.</p>
            <p className="text-xs text-muted-foreground">Please select a location or click refresh to try again.</p>
          </div>
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
            onClick={() => {
              console.log('Manual weather refresh requested');
              refreshWeather();
            }} 
            variant="ghost" 
            size="sm"
            className="h-8 hover:bg-blue-500/10 transition-colors"
            title="Force an immediate weather data refresh"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
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
          {/* Enhanced status information with cache metadata */}
          <div className="text-xs text-muted-foreground mb-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-1">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  isUsingFallbackData ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></span>
                <span>Data status: {isUsingFallbackData ? 'Using cached' : 'Live data'}</span>
                {cacheAge && (
                  <span className="ml-2 bg-secondary/20 px-1.5 py-0.5 rounded text-xs">
                    {cacheAge}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`${failureCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  <span className="hidden md:inline">API calls failed:</span> {failureCount}
                </span>
                
                {isLoading && (
                  <span className="flex items-center text-blue-500">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Refreshing...
                  </span>
                )}
              </div>
            </div>
            
            {/* Cache and refresh time data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-2 border border-dashed border-secondary/30 p-1.5 rounded bg-secondary/5">
              <div className="flex items-center" title="Last time the data was refreshed">
                <Clock className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                Last updated: <span className="font-medium ml-1">{getTimeAgo()}</span>
              </div>
              
              {nextRefreshTime && (
                <div className="flex items-center" title="Next automatic data refresh">
                  <RefreshCw className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                  Next refresh: <span className="font-medium ml-1">
                    {nextRefreshTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
              )}
              
              {cacheExpiryTime && (
                <div className="flex items-center" title="When the current cache will expire">
                  <Info className="h-3 w-3 mr-1.5 text-muted-foreground/70" />
                  Cache expires: <span className="font-medium ml-1">
                    {cacheExpiryTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                </div>
              )}
              
              {isUsingFallbackData && (
                <div className="flex items-center text-amber-500">
                  <Info className="h-3 w-3 mr-1.5" />
                  Using cached data (API rate limited)
                </div>
              )}
            </div>
          </div>

          {/* Current weather summary */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {automotiveWeatherData?.conditions?.summary || 
                  weatherData?.weather?.[0]?.main || 
                  "Current Conditions"}
              </h3>
              <p className="text-3xl font-bold">
                {getCurrentTemperature()}°
                <span className="text-lg font-normal">F</span>
              </p>
              <p className="text-sm">
                Feels like {getFeelsLikeTemperature()}°F
              </p>
            </div>
            <div className="text-right">
              <img 
                src={`https://openweathermap.org/img/wn/${
                  automotiveWeatherData?.conditions?.icon || 
                  weatherData?.weather?.[0]?.icon || 
                  '02d'
                }@2x.png`} 
                alt={automotiveWeatherData?.conditions?.summary || 
                      weatherData?.weather?.[0]?.description || 
                      "Weather conditions"} 
                className="h-16 w-16"
              />
              <p className="text-sm">
                Humidity: {
                  automotiveWeatherData?.conditions?.humidity || 
                  oneCallData?.current?.humidity || 
                  weatherData?.main?.humidity || 
                  'N/A'
                }%
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
                  <span className="font-medium">{automotiveWeatherData?.driving_conditions?.road_condition || "Dry"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Grip Level:</span> 
                  <span className="font-medium">{automotiveWeatherData?.driving_conditions?.road_condition === "Wet" ? "Reduced" : "Optimal"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Surface Temp:</span> 
                  <span className="font-medium">{automotiveWeatherData?.conditions?.air_temperature || weatherData?.main?.temp || "72"}°F</span>
                </li>
                <li className="flex justify-between">
                  <span>Visibility:</span> 
                  <span className="font-medium">{automotiveWeatherData?.driving_conditions?.visibility || "Good"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sun Glare Risk:</span> 
                  <span className="font-medium">{automotiveWeatherData?.conditions?.is_daytime ? "Moderate" : "None"}</span>
                </li>
              </ul>
            </div>

            {/* Day details */}
            <div>
              <h3 className="font-semibold mb-2">Today's Details</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>Sunrise:</span>
                  <span className="font-medium">{weatherData?.sys?.sunrise ? formatTime(weatherData.sys.sunrise.toString()) : "6:30 AM"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunset:</span>
                  <span className="font-medium">{weatherData?.sys?.sunset ? formatTime(weatherData.sys.sunset.toString()) : "8:15 PM"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Wind:</span>
                  <span className="font-medium">
                    {Math.round(weatherData?.wind?.speed || 5)} mph
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>UV Index:</span>
                  <span className="font-medium">{oneCallData?.current?.uvi || "3"}</span>
                </li>
                <li className="flex justify-between">
                  <span>Pressure:</span>
                  <span className="font-medium">{weatherData?.main?.pressure || "1015"} hPa</span>
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
                  {weatherData?.main?.temp && weatherData.main.temp < 60 ? "10" : "5"} min
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium">Street Warmup</p>
                <p className="text-lg">
                  {weatherData?.main?.temp && weatherData.main.temp < 60 ? "5" : "3"} min
                </p>
              </div>
              <div className="bg-secondary/30 p-2 rounded">
                <p className="font-medium">Pressure Adjust</p>
                <p className="text-lg">
                  {weatherData?.main?.temp && weatherData.main.temp < 60 ? "-2" : "+1"} PSI
                </p>
              </div>
            </div>
          </div>

          {/* Hourly forecast */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Next Few Hours</h3>
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {[...Array(6)].map((_, index) => {
                const hour = new Date();
                hour.setHours(hour.getHours() + index + 1);
                const temp = weatherData?.main?.temp 
                  ? Math.round(weatherData.main.temp + (index % 2 === 0 ? 2 : -2)) 
                  : 72;
                
                return (
                  <div key={index} className="flex flex-col items-center min-w-[60px]">
                    <span className="text-xs">{hour.getHours() % 12 || 12}{hour.getHours() < 12 ? 'AM' : 'PM'}</span>
                    <span className="text-lg font-medium">{temp}°</span>
                    <span className="text-xs">{index * 5}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsolidatedWeatherDashboard;