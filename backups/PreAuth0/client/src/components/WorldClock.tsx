import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, ChevronsUpDown, Settings, Clock, Plus, Trash2, X, Edit2, Save } from 'lucide-react';
import { cn } from "@/lib/utils";

// Sample city data with timezones
const AVAILABLE_CITIES = [
  { name: "New York", timezone: "America/New_York", country: "USA", emoji: "🇺🇸" },
  { name: "London", timezone: "Europe/London", country: "UK", emoji: "🇬🇧" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan", emoji: "🇯🇵" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore", emoji: "🇸🇬" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE", emoji: "🇦🇪" },
  { name: "Sydney", timezone: "Australia/Sydney", country: "Australia", emoji: "🇦🇺" },
  { name: "Paris", timezone: "Europe/Paris", country: "France", emoji: "🇫🇷" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "China", emoji: "🇨🇳" },
  { name: "Los Angeles", timezone: "America/Los_Angeles", country: "USA", emoji: "🇺🇸" },
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia", emoji: "🇷🇺" },
  { name: "Mumbai", timezone: "Asia/Kolkata", country: "India", emoji: "🇮🇳" },
  { name: "Sao Paulo", timezone: "America/Sao_Paulo", country: "Brazil", emoji: "🇧🇷" },
  { name: "Monaco", timezone: "Europe/Monaco", country: "Monaco", emoji: "🇲🇨" },
  { name: "Barcelona", timezone: "Europe/Madrid", country: "Spain", emoji: "🇪🇸" },
  { name: "Montreal", timezone: "America/Montreal", country: "Canada", emoji: "🇨🇦" },
  { name: "Melbourne", timezone: "Australia/Melbourne", country: "Australia", emoji: "🇦🇺" },
  { name: "Silverstone", timezone: "Europe/London", country: "UK", emoji: "🇬🇧" },
  { name: "Suzuka", timezone: "Asia/Tokyo", country: "Japan", emoji: "🇯🇵" },
  { name: "Abu Dhabi", timezone: "Asia/Dubai", country: "UAE", emoji: "🇦🇪" },
  { name: "Austin", timezone: "America/Chicago", country: "USA", emoji: "🇺🇸" },
  { name: "Jeddah", timezone: "Asia/Riyadh", country: "Saudi Arabia", emoji: "🇸🇦" },
  { name: "Miami", timezone: "America/New_York", country: "USA", emoji: "🇺🇸" },
  { name: "Las Vegas", timezone: "America/Los_Angeles", country: "USA", emoji: "🇺🇸" },
  { name: "Imola", timezone: "Europe/Rome", country: "Italy", emoji: "🇮🇹" },
  { name: "Monza", timezone: "Europe/Rome", country: "Italy", emoji: "🇮🇹" },
  { name: "Baku", timezone: "Asia/Baku", country: "Azerbaijan", emoji: "🇦🇿" },
  { name: "Bahrain", timezone: "Asia/Bahrain", country: "Bahrain", emoji: "🇧🇭" },
  { name: "Sochi", timezone: "Europe/Moscow", country: "Russia", emoji: "🇷🇺" },
  { name: "Mexico City", timezone: "America/Mexico_City", country: "Mexico", emoji: "🇲🇽" },
  { name: "Spa", timezone: "Europe/Brussels", country: "Belgium", emoji: "🇧🇪" },
  { name: "Zandvoort", timezone: "Europe/Amsterdam", country: "Netherlands", emoji: "🇳🇱" },
  { name: "Budapest", timezone: "Europe/Budapest", country: "Hungary", emoji: "🇭🇺" },
  { name: "Istanbul", timezone: "Europe/Istanbul", country: "Turkey", emoji: "🇹🇷" },
  { name: "Bern", timezone: "Europe/Zurich", country: "Switzerland", emoji: "🇨🇭" },
  { name: "Vienna", timezone: "Europe/Vienna", country: "Austria", emoji: "🇦🇹" },
  { name: "Seoul", timezone: "Asia/Seoul", country: "South Korea", emoji: "🇰🇷" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong", country: "Hong Kong", emoji: "🇭🇰" },
  { name: "Bangkok", timezone: "Asia/Bangkok", country: "Thailand", emoji: "🇹🇭" },
  { name: "Jakarta", timezone: "Asia/Jakarta", country: "Indonesia", emoji: "🇮🇩" },
  { name: "Amsterdam", timezone: "Europe/Amsterdam", country: "Netherlands", emoji: "🇳🇱" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "Germany", emoji: "🇩🇪" },
  { name: "Rome", timezone: "Europe/Rome", country: "Italy", emoji: "🇮🇹" },
  { name: "Cairo", timezone: "Africa/Cairo", country: "Egypt", emoji: "🇪🇬" },
  { name: "Johannesburg", timezone: "Africa/Johannesburg", country: "South Africa", emoji: "🇿🇦" },
];

interface City {
  name: string;
  timezone: string;
  country: string;
  emoji: string;
  customName?: string;
  id?: string;
}

interface WorldClockProps {
  className?: string;
  compact?: boolean;
}

const WorldClock: React.FC<WorldClockProps> = ({ className, compact = false }) => {
  // Default cities if user hasn't selected any yet
  const defaultCities: City[] = [
    { name: "Monaco", timezone: "Europe/Monaco", country: "Monaco", emoji: "🇲🇨", id: "default-1" },
    { name: "New York", timezone: "America/New_York", country: "USA", emoji: "🇺🇸", id: "default-2" },
    { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan", emoji: "🇯🇵", id: "default-3" },
    { name: "London", timezone: "Europe/London", country: "UK", emoji: "🇬🇧", id: "default-4" },
    { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore", emoji: "🇸🇬", id: "default-5" },
  ];

  // State for user's selected cities
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [times, setTimes] = useState<{[key: string]: string}>({});
  const [dates, setDates] = useState<{[key: string]: string}>({});
  const [currentTime, setCurrentTime] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [clockMode, setClockMode] = useState<'12h' | '24h'>('12h');
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [cityBeingEdited, setCityBeingEdited] = useState<City | null>(null);
  
  // Load saved cities from localStorage
  useEffect(() => {
    const savedCities = localStorage.getItem('worldClockCities');
    const savedClockMode = localStorage.getItem('worldClockMode');
    
    if (savedCities) {
      setSelectedCities(JSON.parse(savedCities));
    } else {
      // Use default cities if no saved cities
      setSelectedCities(defaultCities);
    }
    
    if (savedClockMode === '12h' || savedClockMode === '24h') {
      setClockMode(savedClockMode);
    }
  }, []);
  
  // Save selected cities to localStorage whenever they change
  useEffect(() => {
    if (selectedCities.length > 0) {
      localStorage.setItem('worldClockCities', JSON.stringify(selectedCities));
    }
  }, [selectedCities]);
  
  // Save clock mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('worldClockMode', clockMode);
  }, [clockMode]);

  // Update time for all cities every second
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      
      // Update current time
      setCurrentTime(formatTime(now, clockMode));
      
      // Update times for all cities
      const newTimes: {[key: string]: string} = {};
      const newDates: {[key: string]: string} = {};
      
      selectedCities.forEach(city => {
        try {
          const options: Intl.DateTimeFormatOptions = { 
            timeZone: city.timezone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: clockMode === '12h'
          };
          
          const dateOptions: Intl.DateTimeFormatOptions = {
            timeZone: city.timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          };
          
          newTimes[city.id || city.name] = new Intl.DateTimeFormat('en-US', options).format(now);
          newDates[city.id || city.name] = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
        } catch (error) {
          console.error(`Error formatting time for ${city.name}:`, error);
          newTimes[city.id || city.name] = 'Invalid timezone';
          newDates[city.id || city.name] = '';
        }
      });
      
      setTimes(newTimes);
      setDates(newDates);
    };
    
    // Update immediately
    updateTimes();
    
    // Then update every second
    const intervalId = setInterval(updateTimes, 1000);
    
    return () => clearInterval(intervalId);
  }, [selectedCities, clockMode]);

  // Format time based on 12h/24h mode
  const formatTime = (date: Date, mode: '12h' | '24h'): string => {
    if (mode === '12h') {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
      });
    }
  };

  // Add a new city to the selected cities
  const handleAddCity = (newCity: City) => {
    // Generate a unique ID for the city
    const cityWithId = {
      ...newCity,
      id: `city-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      customName: customName.trim() || undefined
    };
    
    // Only allow up to 5 cities
    if (selectedCities.length < 5) {
      setSelectedCities([...selectedCities, cityWithId]);
    } else {
      alert("You can only add up to 5 cities. Please remove one first.");
    }
    
    // Reset the selection
    setSelectedCity(null);
    setCustomName('');
    setOpen(false);
  };

  // Remove a city from the selected cities
  const handleRemoveCity = (cityId: string) => {
    setSelectedCities(selectedCities.filter(city => (city.id || city.name) !== cityId));
  };

  // Start editing a city's custom name
  const handleEditCity = (city: City) => {
    setCityBeingEdited(city);
    setCustomName(city.customName || '');
  };

  // Save the edited custom name
  const handleSaveEdit = () => {
    if (!cityBeingEdited) return;
    
    setSelectedCities(selectedCities.map(city => 
      (city.id || city.name) === (cityBeingEdited.id || cityBeingEdited.name) 
        ? { ...city, customName: customName.trim() || undefined } 
        : city
    ));
    
    setCityBeingEdited(null);
    setCustomName('');
  };

  // Toggle 12h/24h clock mode
  const toggleClockMode = () => {
    setClockMode(prevMode => prevMode === '12h' ? '24h' : '12h');
  };

  // Reset to default cities
  const resetToDefaultCities = () => {
    setSelectedCities(defaultCities);
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] border-gray-800">
        <CardContent className={cn("p-4", compact ? "pt-3 pb-2" : "pt-4")}>
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className={cn("font-bold text-white", compact ? "text-sm" : "text-lg")}>World Clock</h3>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Clock mode toggle */}
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-800"
                onClick={toggleClockMode}
              >
                {clockMode === '12h' ? '12h' : '24h'}
              </Badge>
              
              {/* Edit mode toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${editMode ? 'text-blue-400' : 'text-gray-400'}`}
                onClick={() => setEditMode(!editMode)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Clock list */}
          <div className={`space-y-${compact ? '1' : '3'}`}>
            {selectedCities.map((city) => (
              <div 
                key={city.id || city.name} 
                className={`relative flex justify-between items-center p-2 ${
                  !compact && "rounded-lg border border-gray-800 bg-black/30"
                }`}
              >
                {/* City info */}
                <div className="flex items-center">
                  <div className="text-xl mr-2">{city.emoji}</div>
                  <div>
                    {cityBeingEdited && (cityBeingEdited.id || cityBeingEdited.name) === (city.id || city.name) ? (
                      <div className="flex items-center">
                        <Input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="h-7 py-1 px-2 w-32 bg-gray-900 border-gray-700"
                          placeholder={city.name}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-1 text-green-500"
                          onClick={handleSaveEdit}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400"
                          onClick={() => setCityBeingEdited(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className={cn("font-medium text-white", compact ? "text-sm" : "")}>
                          {city.customName || city.name}
                        </span>
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1 text-gray-400 hover:text-blue-400"
                            onClick={() => handleEditCity(city)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                    <span className={cn("text-gray-400", compact ? "text-xs" : "text-sm")}>
                      {dates[(city.id || city.name)]}
                    </span>
                  </div>
                </div>
                
                {/* Time */}
                <div className="flex items-center">
                  <span className={cn("font-mono font-medium", 
                    compact ? "text-sm text-white" : "text-lg text-blue-400"
                  )}>
                    {times[(city.id || city.name)]}
                  </span>
                  
                  {/* Remove button (only in edit mode) */}
                  {editMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2 text-red-400"
                      onClick={() => handleRemoveCity(city.id || city.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Add city button (only in edit mode) */}
            {editMode && selectedCities.length < 5 && (
              <div className="flex justify-center p-2 mt-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="bg-gray-900/70 border-gray-700 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add a City</DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4">
                      <Tabs defaultValue="search" className="w-full">
                        <TabsList className="w-full bg-gray-800 border border-gray-700">
                          <TabsTrigger value="search" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                            Search
                          </TabsTrigger>
                          <TabsTrigger value="common" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                            Common Cities
                          </TabsTrigger>
                          <TabsTrigger value="f1" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white">
                            F1 Venues
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="search" className="mt-4">
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between bg-gray-800 border-gray-700 text-white"
                              >
                                {selectedCity
                                  ? `${selectedCity.emoji} ${selectedCity.name}`
                                  : "Select a city..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
                              <Command className="bg-transparent">
                                <CommandInput placeholder="Search cities..." className="text-white" />
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup className="max-h-[200px] overflow-y-auto">
                                  {AVAILABLE_CITIES.map((city) => (
                                    <CommandItem
                                      key={city.name}
                                      value={city.name}
                                      onSelect={() => {
                                        setSelectedCity(city);
                                        setOpen(false);
                                      }}
                                      className="text-white hover:bg-gray-700"
                                    >
                                      <CheckIcon
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedCity?.name === city.name
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {city.emoji} {city.name} ({city.country})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TabsContent>
                        
                        <TabsContent value="common" className="mt-4">
                          <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_CITIES.slice(0, 10).map((city) => (
                              <Button
                                key={city.name}
                                variant="outline"
                                className={`justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 ${
                                  selectedCity?.name === city.name ? 'ring-1 ring-blue-500' : ''
                                }`}
                                onClick={() => setSelectedCity(city)}
                              >
                                <span className="mr-2">{city.emoji}</span>
                                <span className="truncate">{city.name}</span>
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="f1" className="mt-4">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "Monaco", "Silverstone", "Monza", "Suzuka", 
                              "Austin", "Singapore", "Abu Dhabi", "Spa", 
                              "Melbourne", "Montreal"
                            ].map(venueName => {
                              const city = AVAILABLE_CITIES.find(c => c.name === venueName);
                              if (!city) return null;
                              
                              return (
                                <Button
                                  key={city.name}
                                  variant="outline"
                                  className={`justify-start bg-gray-800 border-gray-700 hover:bg-gray-700 ${
                                    selectedCity?.name === city.name ? 'ring-1 ring-blue-500' : ''
                                  }`}
                                  onClick={() => setSelectedCity(city)}
                                >
                                  <span className="mr-2">{city.emoji}</span>
                                  <span className="truncate">{city.name}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      {selectedCity && (
                        <div className="mt-4">
                          <label className="text-sm text-gray-400">
                            Custom Name (Optional)
                          </label>
                          <Input
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder={selectedCity.name}
                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="border-gray-700 text-gray-400">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button 
                        onClick={() => selectedCity && handleAddCity(selectedCity)}
                        disabled={!selectedCity}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        Add
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            {/* Reset button (only in edit mode) */}
            {editMode && (
              <div className="flex justify-center p-2">
                <Button 
                  variant="outline" 
                  className="bg-gray-900/70 border-gray-700 hover:bg-gray-800 text-xs"
                  onClick={resetToDefaultCities}
                >
                  Reset to Default Cities
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldClock;