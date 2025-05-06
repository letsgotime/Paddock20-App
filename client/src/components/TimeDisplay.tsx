import React from 'react';
import { useLocationServices } from '@/contexts/LocationServicesContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Sunrise, Sunset, Sparkles, RefreshCw, Globe, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeDisplayProps {
  showControls?: boolean;
  showLocation?: boolean;
  variant?: 'compact' | 'full' | 'minimal';
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  showControls = true,
  showLocation = true,
  variant = 'full'
}) => {
  const {
    timeData,
    currentLocation,
    loading,
    lastUpdated,
    refreshTime,
    isGoldenHour,
    formatLastUpdated
  } = useLocationServices();

  const handleRefresh = async () => {
    await refreshTime();
  };

  // Loading state
  if (loading.time) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!timeData) {
    return (
      <Card className="w-full border-muted-foreground/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Time Information
          </CardTitle>
          <CardDescription>
            No time data available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Time data could not be loaded for this location.
          </p>
        </CardContent>
        {showControls && (
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Minimal variant (just current time)
  if (variant === 'minimal') {
    return (
      <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
        <Clock className="mr-1 h-3 w-3" />
        {timeData.localTime}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className="w-full border-muted-foreground/20">
        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {timeData.localTime}
            </CardTitle>
            {isGoldenHour() && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <Sparkles className="mr-1 h-3 w-3" /> Golden Hour
              </Badge>
            )}
          </div>
          {showLocation && currentLocation && (
            <CardDescription className="flex items-center text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {currentLocation.name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pb-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <div className="flex items-center">
              <Sunrise className="h-3 w-3 mr-1" />
              {timeData.sunriseTime || 'N/A'}
            </div>
            <div className="flex items-center">
              <Sunset className="h-3 w-3 mr-1" />
              {timeData.sunsetTime || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant (default)
  return (
    <Card className="w-full border-muted-foreground/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Local Time
          </CardTitle>
          {isGoldenHour() && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Sparkles className="mr-1 h-3 w-3" /> Golden Hour
            </Badge>
          )}
        </div>
        {showLocation && currentLocation && (
          <CardDescription className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {currentLocation.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{timeData.localTime}</h3>
            <p className="text-sm text-muted-foreground">{timeData.localDate}</p>
            <div className="flex items-center mt-1">
              <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {timeData.timezone} ({timeData.timezoneAbbr}, UTC{timeData.utcOffset >= 0 ? '+' : ''}{timeData.utcOffset / 3600})
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center">
                <Sunrise className="h-4 w-4 mr-1 text-amber-500" />
                <span className="text-sm font-medium">Sunrise</span>
              </div>
              <p className="text-md">{timeData.sunriseTime || 'N/A'}</p>
            </div>
            <div>
              <div className="flex items-center">
                <Sunset className="h-4 w-4 mr-1 text-orange-500" />
                <span className="text-sm font-medium">Sunset</span>
              </div>
              <p className="text-md">{timeData.sunsetTime || 'N/A'}</p>
            </div>
          </div>

          {timeData.daylight && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Daylight: {Math.floor(timeData.daylight.durationMinutes / 60)}h {timeData.daylight.durationMinutes % 60}m
                {timeData.daylight.percentRemaining > 0 && 
                  ` (${timeData.daylight.percentRemaining}% remaining)`}
              </p>
            </div>
          )}

          {timeData.goldenHour && (
            <div className="border rounded-md p-2 bg-muted/50">
              <h4 className="text-xs font-medium flex items-center mb-1">
                <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                Golden Hours (Best for drives & photos)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {timeData.goldenHour.morning && (
                  <div>
                    <span className="text-muted-foreground">Morning:</span>{' '}
                    {timeData.goldenHour.morning.start} - {timeData.goldenHour.morning.end}
                  </div>
                )}
                {timeData.goldenHour.evening && (
                  <div>
                    <span className="text-muted-foreground">Evening:</span>{' '}
                    {timeData.goldenHour.evening.start} - {timeData.goldenHour.evening.end}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showControls && (
        <CardFooter className="pt-0 flex justify-between text-xs text-muted-foreground">
          <span>
            Updated {lastUpdated.time ? formatDistanceToNow(lastUpdated.time, { addSuffix: true }) : 'never'}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-6 w-6"
            title="Refresh time data"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TimeDisplay;