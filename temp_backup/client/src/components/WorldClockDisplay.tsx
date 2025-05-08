import React, { useState } from 'react';
import { useLocationServices } from '@/contexts/LocationServicesContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Globe, 
  Plus, 
  X, 
  Search, 
  MapPin, 
  Loader2, 
  Trash2,
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationData } from '@/contexts/LocationServicesContext';

export const WorldClockDisplay: React.FC = () => {
  const {
    worldClocks,
    addWorldClock,
    removeWorldClock,
    favoriteLocations,
    currentLocation,
    loading,
  } = useLocationServices();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const handleAddClock = async () => {
    if (selectedLocation) {
      await addWorldClock(selectedLocation);
      setSelectedLocation(null);
      setSearchQuery('');
      setIsAdding(false);
    }
  };

  const handleRemoveClock = (locationId: string) => {
    removeWorldClock(locationId);
  };

  const handleAddCurrentLocation = async () => {
    if (currentLocation) {
      await addWorldClock(currentLocation);
    }
  };

  // Filter locations based on search query
  const filteredLocations = searchQuery
    ? [...favoriteLocations].filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          World Clocks
        </CardTitle>
        <CardDescription>
          Keep track of time around the world
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {isAdding ? (
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {searchQuery && (
              <ScrollArea className="h-36 border rounded-md p-2">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(location => (
                    <div 
                      key={location.id}
                      className="flex items-center justify-between py-1 px-2 cursor-pointer hover:bg-accent rounded"
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="text-sm">{location.name}</span>
                      </div>
                      {selectedLocation?.id === location.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-muted-foreground text-sm">
                    No locations found
                  </div>
                )}
              </ScrollArea>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddCurrentLocation}
                disabled={!currentLocation}
              >
                <MapPin className="mr-1 h-3 w-3" />
                Add Current
              </Button>
              
              <Button 
                size="sm"
                onClick={handleAddClock}
                disabled={!selectedLocation}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Clock
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add World Clock
          </Button>
        )}

        {loading.time ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : worldClocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No world clocks added yet</p>
            <p className="text-sm">Add clocks to track time in different locations</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-3">
              {worldClocks.map(({ location, timeData }) => (
                <div 
                  key={location.id}
                  className="border rounded-md p-3 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {location.name}
                      </h3>
                      <div className="text-2xl font-bold mt-1">
                        {timeData?.localTime || '--:--'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {timeData?.localDate || ''}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveClock(location.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <div>
                      {timeData?.timezone} ({timeData?.timezoneAbbr})
                    </div>
                    
                    <div className="flex space-x-3">
                      {timeData?.sunriseTime && (
                        <div className="flex items-center">
                          <ChevronUp className="h-3 w-3 mr-1" />
                          {timeData.sunriseTime}
                        </div>
                      )}
                      {timeData?.sunsetTime && (
                        <div className="flex items-center">
                          <ChevronDown className="h-3 w-3 mr-1" />
                          {timeData.sunsetTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full text-xs text-muted-foreground text-center">
          {loading.time ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Updating clocks...
            </div>
          ) : (
            <div>
              {worldClocks.length === 0 ? '' : `${worldClocks.length} world clock${worldClocks.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WorldClockDisplay;