import React, { useEffect } from 'react';
import { useLocationServices } from '@/contexts/LocationServicesContext';
import TimeDisplay from '@/components/TimeDisplay';
import WorldClockDisplay from '@/components/WorldClockDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock,
  RefreshCw,
  Sun,
  Sunset,
  Sunrise,
  Globe,
  MapPin,
  CornerUpRight,
  Route
} from 'lucide-react';

export const TimeServicesPage: React.FC = () => {
  const {
    refreshTime,
    timeData,
    currentLocation,
    refreshLocation,
    loading,
    isGoldenHour,
    getOptimalDriveTime
  } = useLocationServices();

  // Refresh time data when the component mounts
  useEffect(() => {
    refreshTime();
  }, [refreshTime]);

  const handleRefreshAll = async () => {
    await refreshLocation();
    await refreshTime();
  };

  // Placeholder trip duration for getOptimalDriveTime
  const sampleTripDuration = 90; // 90 minutes

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Services</h1>
          <p className="text-muted-foreground">
            Time-based information and intelligence for driving
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={handleRefreshAll}
            disabled={loading.time || loading.location}
            className="flex items-center"
          >
            {(loading.time || loading.location) ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>

      {currentLocation && (
        <div className="mb-2 flex items-center">
          <Badge variant="outline" className="flex items-center">
            <MapPin className="mr-1 h-3 w-3" />
            {currentLocation.name}
          </Badge>
          {isGoldenHour() && (
            <Badge variant="secondary" className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <Sun className="mr-1 h-3 w-3" />
              Golden Hour
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main time display */}
        <div className="md:col-span-2">
          <TimeDisplay />
        </div>

        {/* World clocks */}
        <div className="md:col-span-1">
          <WorldClockDisplay />
        </div>

        {/* Driving recommendations based on time */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="mr-2 h-5 w-5" />
                Time-Based Drive Recommendations
              </CardTitle>
              <CardDescription>
                Plan your drives based on optimal lighting and time conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="current">
                <TabsList className="mb-4">
                  <TabsTrigger value="current">Current Conditions</TabsTrigger>
                  <TabsTrigger value="planning">Drive Planning</TabsTrigger>
                  <TabsTrigger value="analytics">Time Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="current">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center">
                          <Sun className="mr-2 h-4 w-4" />
                          Lighting Conditions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {timeData ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Time of Day:</span>
                              <span className="font-medium capitalize">{timeData.dayPeriod || 'Unknown'}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Daylight:</span>
                              <span className="font-medium">
                                {timeData.daylight 
                                  ? `${Math.floor(timeData.daylight.durationMinutes / 60)}h ${timeData.daylight.durationMinutes % 60}m`
                                  : 'Unknown'
                                }
                              </span>
                            </div>
                            
                            {timeData.daylight && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Remaining:</span>
                                <span className="font-medium">
                                  {timeData.daylight.percentRemaining}%
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Golden Hour:</span>
                              <span className="font-medium">
                                {isGoldenHour() 
                                  ? <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Active Now</Badge>
                                  : 'Not Active'
                                }
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-muted-foreground">
                            No lighting data available
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Timing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {timeData ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Current Time:</span>
                              <span className="font-medium">{timeData.localTime}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sunrise:</span>
                              <span className="font-medium flex items-center">
                                <Sunrise className="h-3 w-3 mr-1 text-amber-500" />
                                {timeData.sunriseTime || 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sunset:</span>
                              <span className="font-medium flex items-center">
                                <Sunset className="h-3 w-3 mr-1 text-orange-500" />
                                {timeData.sunsetTime || 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Timezone:</span>
                              <span className="font-medium">{timeData.timezoneAbbr || 'Unknown'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-muted-foreground">
                            No timing data available
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center">
                          <CornerUpRight className="mr-2 h-4 w-4" />
                          Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {timeData ? (
                          <div>
                            <div className="text-lg font-semibold mb-2">
                              {getOptimalDriveTime(sampleTripDuration) || 'No specific recommendation'}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isGoldenHour() 
                                ? "Current golden hour conditions provide optimal natural lighting for scenic driving."
                                : "Based on current time and lighting conditions."
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-muted-foreground">
                            No recommendation data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="planning">
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Advanced Drive Planning</h3>
                    <p>Coming soon - Plan your drives based on golden hour, lighting conditions, and other time-based factors</p>
                  </div>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Time Analytics</h3>
                    <p>Coming soon - Analyze your driving patterns by time of day and optimize your routes</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeServicesPage;