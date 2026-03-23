import React, { useEffect, useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { aviationProvider, Flight, NearbyFlightsResponse } from '@/services/api/providers/AviationProvider';
import { Plane, Loader2, Info, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

/**
 * Aviation Overlay Component
 * 
 * Displays nearby flight information based on the current weather location
 */
export const AviationOverlay: React.FC = () => {
  const { selectedLocation: location } = useWeather();
  const [flightData, setFlightData] = useState<NearbyFlightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFlightIndex, setActiveFlightIndex] = useState(-1);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFlights = async () => {
      if (!location || !location.lat || !location.lon) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await aviationProvider.getNearbyFlights(
          location.lat,
          location.lon,
          100 // 100km radius
        );
        
        if (response.success && response.data) {
          setFlightData(response.data);
        } else {
          setError(response.error || 'Failed to fetch flight data');
          toast({
            title: 'Aviation Data Error',
            description: response.error || 'Failed to fetch flight data',
            variant: 'destructive'
          });
        }
      } catch (err) {
        setError('An error occurred while fetching flight data');
        toast({
          title: 'Aviation Data Error',
          description: 'An error occurred while fetching flight data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlights();
  }, [location, toast]);
  
  const renderFlightStatus = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-500',
      scheduled: 'bg-blue-500',
      landed: 'bg-gray-500',
      cancelled: 'bg-red-500',
      incident: 'bg-orange-500',
      diverted: 'bg-purple-500'
    };
    
    return (
      <Badge className={`${statusColors[status.toLowerCase()] || 'bg-gray-500'}`}>
        {status}
      </Badge>
    );
  };
  
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  const formatFlightTime = (flight: Flight) => {
    const departure = formatTime(flight.departure.scheduled);
    const arrival = formatTime(flight.arrival.scheduled);
    
    return `${departure} → ${arrival}`;
  };
  
  if (loading) {
    return (
      <Card className="w-full h-full border-zinc-800 bg-black/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-zinc-400">Loading flight data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full h-full border-zinc-800 bg-black/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="text-zinc-400">Unable to load flight data</p>
            <Button
              variant="ghost"
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!flightData || !flightData.flights || flightData.flights.length === 0) {
    return (
      <Card className="w-full h-full border-zinc-800 bg-black/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <Info className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-zinc-400">No active flights found in this area</p>
            <p className="text-xs text-zinc-500 mt-1">Try a different location or check back later</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border-zinc-800 bg-black/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <Plane className="mr-2 h-5 w-5 text-primary" /> 
            Nearby Flights
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {flightData.flights.length} Active
          </Badge>
        </div>
        <CardDescription>
          {flightData.nearby_airports} airports within {flightData.radius}km
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="list">Flight List</TabsTrigger>
            <TabsTrigger value="details">Flight Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-0">
            <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
              {flightData.flights.map((flight, index) => (
                <div 
                  key={`${flight.flight.iata || flight.flight.icao}-${index}`}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-zinc-900 ${activeFlightIndex === index ? 'bg-zinc-900 border-l-2 border-primary' : ''}`}
                  onClick={() => setActiveFlightIndex(index)}
                >
                  <div className="flex items-center">
                    <div className="p-1 rounded-full bg-zinc-800 mr-2">
                      <Plane className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{flight.flight.iata || flight.flight.icao}</div>
                      <div className="text-xs text-zinc-500">
                        {flight.departure.iata} → {flight.arrival.iata}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {renderFlightStatus(flight.flight_status)}
                    <span className="text-xs text-zinc-500 mt-1">
                      {formatFlightTime(flight)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="mt-0">
            {activeFlightIndex === -1 ? (
              <div className="text-center py-8 text-zinc-500">
                <Plane className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a flight to view details</p>
              </div>
            ) : (
              <div className="pt-2">
                {(() => {
                  const flight = flightData.flights[activeFlightIndex];
                  return (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            {flight.flight.iata || flight.flight.icao}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="ml-2" variant="outline">
                                    {flight.airline.name}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Airline: {flight.airline.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </h3>
                          <p className="text-zinc-400 text-sm">
                            {flight.flight_date}
                          </p>
                        </div>
                        {renderFlightStatus(flight.flight_status)}
                      </div>
                      
                      <div className="flex justify-between mb-4">
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold">{flight.departure.iata}</div>
                          <div className="text-xs text-zinc-500">{flight.departure.airport}</div>
                        </div>
                        <div className="flex items-center px-2 text-zinc-500">→</div>
                        <div className="text-center flex-1">
                          <div className="text-xl font-bold">{flight.arrival.iata}</div>
                          <div className="text-xs text-zinc-500">{flight.arrival.airport}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-zinc-900 p-2 rounded-md">
                          <div className="text-xs text-zinc-500">Departure</div>
                          <div>
                            <span className="text-sm font-medium">
                              {formatTime(flight.departure.scheduled)}
                            </span>
                            {flight.departure.delay ? (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {flight.departure.delay} min delay
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex mt-1">
                            {flight.departure.terminal && (
                              <span className="text-xs text-zinc-500 mr-2">
                                Terminal: {flight.departure.terminal}
                              </span>
                            )}
                            {flight.departure.gate && (
                              <span className="text-xs text-zinc-500">
                                Gate: {flight.departure.gate}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-zinc-900 p-2 rounded-md">
                          <div className="text-xs text-zinc-500">Arrival</div>
                          <div>
                            <span className="text-sm font-medium">
                              {formatTime(flight.arrival.scheduled)}
                            </span>
                            {flight.arrival.delay ? (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                {flight.arrival.delay} min delay
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex mt-1">
                            {flight.arrival.terminal && (
                              <span className="text-xs text-zinc-500 mr-2">
                                Terminal: {flight.arrival.terminal}
                              </span>
                            )}
                            {flight.arrival.gate && (
                              <span className="text-xs text-zinc-500">
                                Gate: {flight.arrival.gate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {flight.live && (
                        <div className="bg-zinc-900/50 p-2 rounded-md mt-2">
                          <div className="text-xs text-zinc-500 mb-1">Live Tracking</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-zinc-500">Altitude:</span>{' '}
                              {flight.live.altitude} ft
                            </div>
                            <div>
                              <span className="text-zinc-500">Direction:</span>{' '}
                              {flight.live.direction}°
                            </div>
                            <div>
                              <span className="text-zinc-500">Speed:</span>{' '}
                              {flight.live.speed_horizontal} km/h
                            </div>
                            <div>
                              <span className="text-zinc-500">Status:</span>{' '}
                              {flight.live.is_ground ? 'On Ground' : 'In Air'}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800">
          <span className="text-xs text-zinc-600">
            {flightData.data_attribution}
          </span>
          <span className="text-xs text-zinc-600">
            Updated: {new Date(flightData.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AviationOverlay;