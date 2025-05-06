/**
 * TheRundown API Explorer Component
 * 
 * This component provides a user interface to explore TheRundown API functionality:
 * - Browse sports and leagues data
 * - View upcoming events for selected sports
 * - Get motorsports-specific events
 * - Display API usage statistics and cache status
 */

import { useState, useEffect } from 'react';
import { 
  getSportsList, 
  getEvents, 
  getMotorsportsEvents,
  getApiUsage,
  clearCache
} from '@/services/sports/theRundownService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Car, Calendar, TrendingUp, Database, BarChart, RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format } from 'date-fns';

// Interface for sport data
interface Sport {
  sport_id: number;
  name: string;
  has_outrights: boolean;
}

// Interface for event data
interface Event {
  event_id: string;
  sport_id: number;
  home_team: string;
  away_team: string;
  event_date: string;
  broadcast?: string;
  competition?: string;
  venue?: string;
}

const TheRundownExplorer = () => {
  // Data state
  const [sportsList, setSportsList] = useState<Sport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [motorsportsEvents, setMotorsportsEvents] = useState<Event[]>([]);

  // UI state
  const [isLoadingSports, setIsLoadingSports] = useState<boolean>(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [isLoadingMotorsports, setIsLoadingMotorsports] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // API usage
  const [apiUsage, setApiUsage] = useState<{
    requestsToday: number;
    dailyLimit: number;
    remainingRequests: number;
  } | null>(null);
  
  // Check if we're near the quota limit
  const isNearQuota = apiUsage ? (apiUsage.requestsToday / apiUsage.dailyLimit) >= 0.75 : false;
  const hasReachedQuota = apiUsage ? apiUsage.remainingRequests <= 0 : false;
  
  // Load sports list on mount
  useEffect(() => {
    fetchSportsList();
    updateApiUsage();
  }, []);
  
  // Update API usage info
  const updateApiUsage = () => {
    try {
      setApiUsage(getApiUsage());
    } catch (error) {
      console.error('Error updating API usage:', error);
    }
  };
  
  // Fetch sports list
  const fetchSportsList = async () => {
    if (hasReachedQuota) {
      setApiError('API quota exceeded. Try again tomorrow.');
      return;
    }
    
    setIsLoadingSports(true);
    setApiError(null);
    
    try {
      const response = await getSportsList();
      if (response && response.sports) {
        setSportsList(response.sports);
      }
    } catch (error) {
      console.error('Error fetching sports list:', error);
      setApiError('Failed to fetch sports list. ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoadingSports(false);
      updateApiUsage();
    }
  };
  
  // Fetch events for selected sport
  const fetchEvents = async (sportId: number) => {
    if (hasReachedQuota) {
      setApiError('API quota exceeded. Try again tomorrow.');
      return;
    }
    
    setIsLoadingEvents(true);
    setApiError(null);
    setEvents([]);
    
    try {
      const response = await getEvents(sportId);
      if (response && response.events) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error(`Error fetching events for sport ID ${sportId}:`, error);
      setApiError(`Failed to fetch events. ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingEvents(false);
      updateApiUsage();
    }
  };
  
  // Fetch motorsports events
  const fetchMotorsportsEvents = async () => {
    if (hasReachedQuota) {
      setApiError('API quota exceeded. Try again tomorrow.');
      return;
    }
    
    setIsLoadingMotorsports(true);
    setApiError(null);
    setMotorsportsEvents([]);
    
    try {
      const response = await getMotorsportsEvents();
      if (response && response.events) {
        setMotorsportsEvents(response.events);
      }
    } catch (error) {
      console.error('Error fetching motorsports events:', error);
      setApiError(`Failed to fetch motorsports events. ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingMotorsports(false);
      updateApiUsage();
    }
  };
  
  // Handle sport selection
  const handleSportSelect = (sportId: string) => {
    const id = parseInt(sportId, 10);
    setSelectedSportId(id);
    fetchEvents(id);
  };
  
  // Handle cache clearing
  const handleClearCache = () => {
    try {
      clearCache();
      updateApiUsage();
      setApiError('Cache cleared successfully!');
      
      // Reset data
      setSportsList([]);
      setEvents([]);
      setMotorsportsEvents([]);
      setSelectedSportId(null);
      
      // Refetch sports list
      fetchSportsList();
    } catch (error) {
      console.error('Error clearing cache:', error);
      setApiError(`Failed to clear cache. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Format date for display
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          TheRundown Sports API Explorer
        </CardTitle>
        <CardDescription>
          Explore sports data, events, and motorsports information from TheRundown API
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="sports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sports" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Sports & Events</span>
            </TabsTrigger>
            <TabsTrigger value="motorsports" className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>Motorsports</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>API Usage</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sports & Leagues</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSportsList}
                disabled={isLoadingSports || hasReachedQuota}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSports ? 'animate-spin' : ''}`} />
                {isLoadingSports ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            {apiError && (
              <Alert 
                variant={apiError.includes('Cache cleared') ? 'default' : 'destructive'} 
                className="mt-4"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {apiError.includes('Cache cleared') ? 'Success' : 'Error'}
                </AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            
            {isNearQuota && (
              <Alert className="mt-4 border-amber-500 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Usage Warning</AlertTitle>
                <AlertDescription>
                  {hasReachedQuota 
                    ? 'API quota exceeded. Try again tomorrow.' 
                    : `You're nearing your daily API quota limit (${apiUsage?.requestsToday}/${apiUsage?.dailyLimit}). Results may come from cache.`
                  }
                </AlertDescription>
              </Alert>
            )}
            
            {/* Sports Selection */}
            {sportsList.length > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sport-select">Select a Sport</Label>
                  <Select 
                    value={selectedSportId?.toString() || ''} 
                    onValueChange={handleSportSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportsList.map((sport) => (
                        <SelectItem key={sport.sport_id} value={sport.sport_id.toString()}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Events List */}
                {selectedSportId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        Upcoming Events
                        {sportsList.find(s => s.sport_id === selectedSportId)?.name && (
                          <span className="ml-2 text-muted-foreground">
                            {sportsList.find(s => s.sport_id === selectedSportId)?.name}
                          </span>
                        )}
                      </h4>
                      {isLoadingEvents && (
                        <Badge variant="outline" className="bg-muted">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </Badge>
                      )}
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      {events.length > 0 ? (
                        events.map((event, index) => (
                          <AccordionItem key={event.event_id} value={event.event_id}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex flex-col items-start text-left">
                                <div className="font-medium">
                                  {event.home_team} vs {event.away_team}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatEventDate(event.event_date)}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {event.competition && (
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Competition:</span>
                                    <span>{event.competition}</span>
                                  </div>
                                )}
                                {event.venue && (
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Venue:</span>
                                    <span>{event.venue}</span>
                                  </div>
                                )}
                                {event.broadcast && (
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Broadcast:</span>
                                    <span>{event.broadcast}</span>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <div className="py-4 text-center text-muted-foreground">
                          {isLoadingEvents 
                            ? 'Loading events...' 
                            : 'No events found for this sport. Select a different sport or try again later.'}
                        </div>
                      )}
                    </Accordion>
                  </div>
                )}
              </div>
            )}
            
            {sportsList.length === 0 && !isLoadingSports && !apiError && (
              <div className="py-8 text-center">
                <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Sports Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Click the refresh button to load sports data from the API
                </p>
                <Button 
                  onClick={fetchSportsList}
                  disabled={hasReachedQuota}
                >
                  Load Sports Data
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="motorsports" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Motorsports Events</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchMotorsportsEvents}
                disabled={isLoadingMotorsports || hasReachedQuota}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMotorsports ? 'animate-spin' : ''}`} />
                {isLoadingMotorsports ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            {apiError && apiError.includes('motorsports') && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center gap-2 my-4">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-medium">Special Collection: F1, NASCAR, IndyCar & More</span>
            </div>
            
            {/* Motorsports Events List */}
            <Accordion type="single" collapsible className="w-full">
              {motorsportsEvents.length > 0 ? (
                motorsportsEvents.map((event, index) => (
                  <AccordionItem key={event.event_id} value={event.event_id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <div className="font-medium">
                          {event.home_team || event.competition || 'Motorsport Event'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatEventDate(event.event_date)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {event.competition && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Competition:</span>
                            <span>{event.competition}</span>
                          </div>
                        )}
                        {event.venue && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Venue:</span>
                            <span>{event.venue}</span>
                          </div>
                        )}
                        {event.broadcast && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Broadcast:</span>
                            <span>{event.broadcast}</span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="py-8 text-center">
                  {isLoadingMotorsports 
                    ? (
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="h-16 w-16 text-muted-foreground animate-spin" />
                        <p className="text-muted-foreground">Loading motorsports events...</p>
                      </div>
                    ) 
                    : (
                      <div className="flex flex-col items-center gap-4">
                        <Car className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No Motorsports Events Available</h3>
                        <p className="text-muted-foreground mb-4">
                          Click the refresh button to load motorsports events from the API
                        </p>
                        <Button 
                          onClick={fetchMotorsportsEvents}
                          disabled={hasReachedQuota}
                        >
                          Load Motorsports Events
                        </Button>
                      </div>
                    )
                  }
                </div>
              )}
            </Accordion>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">API Usage Statistics</h3>
              <Button variant="outline" size="sm" onClick={updateApiUsage}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
            
            {apiUsage && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Today's Usage:</span>
                    <span className="font-medium">
                      {apiUsage.requestsToday} / {apiUsage.dailyLimit} requests
                    </span>
                  </div>
                  <Progress 
                    value={(apiUsage.requestsToday / apiUsage.dailyLimit) * 100} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Remaining: {apiUsage.remainingRequests} requests</span>
                    <span>Resets at midnight</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Cache Management</h4>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleClearCache}
                    >
                      Clear Cache
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    API responses are cached to minimize usage and stay within free tier limits.
                    Clearing the cache will force fresh data to be fetched from the API on next request.
                  </p>
                </div>
                
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>API Usage Information</AlertTitle>
                  <AlertDescription>
                    The free tier of TheRundown API allows 20 requests per day. The system implements aggressive
                    caching to stay within these limits. Sports data is cached for 24 hours, while event data
                    is cached for 6 hours.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <div className="w-full text-xs text-muted-foreground">
          <p>
            This explorer uses TheRundown API to fetch sports information, including events and
            competition details. A special integration for motorsports data combines information from
            multiple sports categories.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TheRundownExplorer;