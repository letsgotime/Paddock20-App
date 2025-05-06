import React, { useState, useEffect } from 'react';
import { Trophy, Filter, Clock, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  getSportsList, 
  getEvents, 
  getMotorsportsEvents 
} from "@/services/sports/theRundownService";
import { format } from 'date-fns';

interface Sport {
  sport_id: number;
  name: string;
}

interface Event {
  event_id: string;
  event_date: string;
  sports: {
    name: string;
  };
  teams_normalized: {
    name: string;
    mascot: string;
  }[];
  teams: {
    team_id: number;
    name: string;
    is_home: boolean;
    is_away: boolean;
  }[];
  score?: {
    event_status: string;
    event_status_detail: string;
    score_away: number;
    score_home: number;
  };
  broadcast?: {
    network: string;
  };
  venue?: {
    name: string;
    city: string;
    country: string;
  };
}

const TheRundownExplorer: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    // On mount, load the sports list
    const loadSports = async () => {
      try {
        const sportsData = await getSportsList();
        if (sportsData && sportsData.sports) {
          setSports(sportsData.sports);
        }
      } catch (error) {
        console.error("Failed to load sports list:", error);
        toast({
          title: "Error loading sports",
          description: "Unable to load the sports list. Please try again later.",
          variant: "destructive"
        });
      }
    };

    loadSports();
  }, [toast]);

  const handleSportChange = (value: string) => {
    setSelectedSport(value);
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
        const sportId = parseInt(selectedSport, 10);
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
        description: "Unable to fetch events data. Please try again later.",
        variant: "destructive"
      });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
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
            TheRundown Sports API Explorer
          </CardTitle>
          <CardDescription>
            Explore sports events and schedule data with TheRundown API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Sports</TabsTrigger>
              <TabsTrigger value="motorsports">Motorsports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sport-select">Select Sport</Label>
                <Select value={selectedSport} onValueChange={handleSportChange}>
                  <SelectTrigger id="sport-select">
                    <SelectValue placeholder="Choose a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.sport_id} value={sport.sport_id.toString()}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="motorsports" className="space-y-4">
              <div className="p-4 border border-blue-900/30 rounded-md bg-blue-900/10">
                <div className="flex items-center mb-2">
                  <Trophy className="mr-2 h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold">Motorsports Focus</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get upcoming events from F1, NASCAR, IndyCar, and other motorsports categories
                </p>
              </div>
            </TabsContent>
            
            <div className="mt-4">
              <Button onClick={handleFetchEvents} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Events...
                  </>
                ) : (
                  "Fetch Events"
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
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
                          {formatEventDate(event.event_date)}
                        </div>
                        {event.venue && (
                          <div className="flex items-center text-sm">
                            <Filter className="mr-2 h-4 w-4 text-blue-400" />
                            {event.venue.name}, {event.venue.city}, {event.venue.country}
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
                      <div>
                        <Badge variant="secondary" className="text-xs">
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
              Data powered by TheRundown API
            </div>
            <Button variant="outline" onClick={() => setEvents([])} size="sm">
              Clear Results
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TheRundownExplorer;