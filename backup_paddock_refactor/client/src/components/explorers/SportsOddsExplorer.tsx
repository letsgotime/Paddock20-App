import React, { useState, useEffect } from 'react';
import { Trophy, DollarSign, Activity, Percent, Clock, Calendar, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

// Import the combined sports service
import { 
  getSportsList, 
  getEvents, 
  getOdds,
  getMotorsportsEvents,
  getApiUsage,
  hasReachedDailyLimits
} from "@/services/sports/combinedSportsService";

interface Sport {
  sport_id: number | string;
  name: string;
  source?: string;
}

interface Team {
  name: string;
  mascot?: string;
}

interface Venue {
  name: string;
  city: string;
  country: string;
}

interface Score {
  event_status: string;
  score_away: number;
  score_home: number;
}

interface Broadcast {
  network: string;
}

interface Event {
  event_id: string;
  event_date: string;
  sports: {
    name: string;
  };
  teams_normalized: Team[];
  score?: Score;
  broadcast?: Broadcast;
  venue?: Venue;
  source?: string;
}

interface Odd {
  id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
      }[];
    }[];
  }[];
}

const SportsOddsExplorer: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [odds, setOdds] = useState<Odd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [apiUsage, setApiUsage] = useState({ rundown: 0, odds: 0 });
  const [apiLimits, setApiLimits] = useState({ rundown: false, odds: false });
  const { toast } = useToast();

  useEffect(() => {
    // Load sports list and API usage on mount
    loadSports();
    updateApiStatus();
  }, []);

  const updateApiStatus = () => {
    const usage = getApiUsage();
    const limits = hasReachedDailyLimits();
    setApiUsage(usage);
    setApiLimits(limits);
  };

  const loadSports = async () => {
    setIsLoading(true);
    try {
      const sportsData = await getSportsList();
      if (sportsData && sportsData.sports) {
        setSports(sportsData.sports);
      } else {
        toast({
          title: "No sports data available",
          description: "Could not retrieve the sports list at this time.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to load sports list:", error);
      toast({
        title: "Error loading sports",
        description: "Unable to load the sports list. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      updateApiStatus();
    }
  };

  const handleSportChange = (value: string) => {
    setSelectedSport(value);
    setEvents([]);
    setOdds([]);
  };

  const handleFetchEvents = async () => {
    if (!selectedSport && activeTab !== 'motorsports') {
      toast({
        title: "Sport selection required",
        description: "Please select a sport to fetch events",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let eventsData;
      
      if (activeTab === 'motorsports') {
        eventsData = await getMotorsportsEvents();
      } else {
        const sportId = parseInt(selectedSport, 10) || selectedSport;
        eventsData = await getEvents(sportId);
      }
      
      if (eventsData && eventsData.events) {
        setEvents(eventsData.events);
        
        if (eventsData.events.length === 0) {
          toast({
            title: "No events found",
            description: "There are no upcoming events for this selection",
            variant: "default"
          });
        }
      } else {
        setEvents([]);
        toast({
          title: "No events data",
          description: "The API returned no events information",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({
        title: "Error fetching events",
        description: "Unable to fetch events data. API daily limit may have been reached.",
        variant: "destructive"
      });
      setEvents([]);
    } finally {
      setIsLoading(false);
      updateApiStatus();
    }
  };

  const handleFetchOdds = async () => {
    if (!selectedSport) {
      toast({
        title: "Sport selection required",
        description: "Please select a sport to fetch odds",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const oddsData = await getOdds(selectedSport);
      
      if (oddsData && oddsData.length > 0) {
        setOdds(oddsData);
      } else {
        setOdds([]);
        toast({
          title: "No odds data",
          description: "There are no odds available for this selection",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Failed to fetch odds:", error);
      toast({
        title: "Error fetching odds",
        description: "Unable to fetch odds data. API daily limit may have been reached.",
        variant: "destructive"
      });
      setOdds([]);
    } finally {
      setIsLoading(false);
      updateApiStatus();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-blue-400" />
            Sports Data Explorer
          </CardTitle>
          <CardDescription>
            Explore sports events, scores, and betting odds with combined API data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <RefreshCw className="mr-2 h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">TheRundown API</span>
                  </div>
                  <Badge variant={apiLimits.rundown ? "destructive" : "outline"}>
                    {apiLimits.rundown ? "Limit Reached" : "Available"}
                  </Badge>
                </div>
                <Progress 
                  value={(apiUsage.rundown / 20) * 100} 
                  className="h-2 mt-2" 
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {apiUsage.rundown}/20 daily requests used
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">The Odds API</span>
                  </div>
                  <Badge variant={apiLimits.odds ? "destructive" : "outline"}>
                    {apiLimits.odds ? "Limit Reached" : "Available"}
                  </Badge>
                </div>
                <Progress 
                  value={(apiUsage.odds / 15) * 100} 
                  className="h-2 mt-2" 
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {apiUsage.odds}/15 daily requests used (500/month)
                </div>
              </Card>
            </div>
            
            {(apiLimits.rundown || apiLimits.odds) && (
              <Alert variant="destructive" className="mb-4">
                <Activity className="h-4 w-4" />
                <AlertTitle>API Usage Alert</AlertTitle>
                <AlertDescription>
                  {apiLimits.rundown && apiLimits.odds 
                    ? "Both API daily limits have been reached. Data is being served from cache only."
                    : apiLimits.rundown 
                      ? "TheRundown API daily limit reached. Some features are using cached data only."
                      : "The Odds API daily limit reached. Odds data is using cached data only."
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        
          <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="events">Events & Scores</TabsTrigger>
              <TabsTrigger value="odds">Betting Odds</TabsTrigger>
              <TabsTrigger value="motorsports">Motorsports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sport-select-events">Select Sport</Label>
                <Select value={selectedSport} onValueChange={handleSportChange}>
                  <SelectTrigger id="sport-select-events">
                    <SelectValue placeholder="Choose a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem 
                        key={`${sport.sport_id}_${sport.source || 'default'}`} 
                        value={sport.sport_id.toString()}
                      >
                        {sport.name} {sport.source ? `(${sport.source})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleFetchEvents} 
                disabled={isLoading || (!selectedSport && activeTab !== 'motorsports')} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Events...
                  </>
                ) : (
                  "Fetch Events & Scores"
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="odds" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sport-select-odds">Select Sport</Label>
                <Select value={selectedSport} onValueChange={handleSportChange}>
                  <SelectTrigger id="sport-select-odds">
                    <SelectValue placeholder="Choose a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem 
                        key={`${sport.sport_id}_${sport.source || 'default'}`} 
                        value={sport.sport_id.toString()}
                      >
                        {sport.name} {sport.source ? `(${sport.source})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleFetchOdds} 
                disabled={isLoading || !selectedSport} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Odds...
                  </>
                ) : (
                  "Fetch Betting Odds"
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="motorsports" className="space-y-4">
              <div className="p-4 border border-blue-900/30 rounded-md bg-blue-900/10">
                <div className="flex items-center mb-2">
                  <Trophy className="mr-2 h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold">Motorsports Events</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  View upcoming events from F1, NASCAR, IndyCar, and other motorsports categories
                </p>
              </div>
              
              <Button 
                onClick={handleFetchEvents} 
                disabled={isLoading} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Motorsports...
                  </>
                ) : (
                  "Fetch Motorsports Events"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Events Display */}
      {activeTab !== 'odds' && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events & Scores</CardTitle>
            <CardDescription>
              {activeTab === 'motorsports' 
                ? "Upcoming motorsports events" 
                : `Events for ${sports.find(s => s.sport_id.toString() === selectedSport)?.name || 'selected sport'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.event_id} className="overflow-hidden border-blue-900/30 hover:bg-blue-950/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {event.sports?.name || "Sports Event"}
                          </Badge>
                          <CardTitle className="text-lg">{
                            event.teams_normalized?.[0]?.name && event.teams_normalized?.[1]?.name
                              ? `${event.teams_normalized[0].name} vs ${event.teams_normalized[1].name}`
                              : "Upcoming Event"
                          }</CardTitle>
                        </div>
                        {event.score && (
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {event.score.score_away} - {event.score.score_home}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.score.event_status}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-blue-400" />
                          {formatDate(event.event_date)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center text-sm">
                            <Trophy className="mr-2 h-4 w-4 text-blue-400" />
                            {event.venue.name}
                            {(event.venue.city || event.venue.country) && (
                              <>, {event.venue.city}{event.venue.country ? `, ${event.venue.country}` : ''}</>
                            )}
                          </div>
                        )}
                        {event.broadcast && (
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-blue-400" />
                            Broadcast on {event.broadcast.network}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 border-t border-blue-900/20 flex justify-between items-center bg-blue-900/5">
                      <div className="text-xs text-muted-foreground">
                        ID: {event.event_id}
                      </div>
                      <div className="flex items-center">
                        {event.source && (
                          <Badge variant="secondary" className="text-xs mr-2">
                            Source: {event.source}
                          </Badge>
                        )}
                        <Badge variant={event.score ? "default" : "secondary"} className="text-xs">
                          {event.score ? "Live Score Available" : "Upcoming"}
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-blue-900/30 pt-4">
            <div className="text-sm text-muted-foreground">
              Data powered by combined sports APIs with aggressive caching
            </div>
            <Button variant="outline" onClick={() => setEvents([])} size="sm">
              Clear Results
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Odds Display */}
      {activeTab === 'odds' && odds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Betting Odds</CardTitle>
            <CardDescription>
              Latest odds for {sports.find(s => s.sport_id.toString() === selectedSport)?.name || 'selected sport'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {odds.map((odd) => (
                  <Card key={odd.id} className="overflow-hidden border-blue-900/30">
                    <CardHeader className="pb-3">
                      <Badge variant="outline" className="mb-2 w-fit">
                        {odd.sport_key.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <CardTitle className="text-lg">
                        {odd.home_team} vs {odd.away_team}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(odd.commence_time)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {odd.bookmakers.slice(0, 3).map((bookmaker) => (
                          <div key={bookmaker.key} className="space-y-2">
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4 text-blue-400" />
                              <h4 className="font-semibold">{bookmaker.title}</h4>
                            </div>
                            
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Bet Type</TableHead>
                                  <TableHead>Team/Outcome</TableHead>
                                  <TableHead className="text-right">Odds</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {bookmaker.markets.map((market) => (
                                  market.outcomes.map((outcome, index) => (
                                    <TableRow key={`${market.key}-${outcome.name}-${index}`}>
                                      {index === 0 && (
                                        <TableCell rowSpan={market.outcomes.length} className="align-top font-medium">
                                          {market.key === 'h2h' ? 'Moneyline' : 
                                           market.key === 'spreads' ? 'Point Spread' : 
                                           market.key === 'totals' ? 'Over/Under' : 
                                           market.key}
                                        </TableCell>
                                      )}
                                      <TableCell>{outcome.name}</TableCell>
                                      <TableCell className="text-right">
                                        <Badge variant={outcome.price > 0 ? "outline" : "default"}>
                                          {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="py-2 border-t border-blue-900/20 flex justify-between items-center bg-blue-900/5">
                      <div className="text-xs text-muted-foreground">
                        ID: {odd.id}
                      </div>
                      <div>
                        <Badge variant="secondary" className="text-xs">
                          {odd.bookmakers.length} bookmakers available
                        </Badge>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-blue-900/30 pt-4">
            <div className="text-sm text-muted-foreground flex items-center">
              <Percent className="h-4 w-4 mr-1 text-blue-400" />
              Odds powered by The Odds API
            </div>
            <Button variant="outline" onClick={() => setOdds([])} size="sm">
              Clear Results
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SportsOddsExplorer;