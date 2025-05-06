import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Search, MapPin, Trash2, ExternalLink } from 'lucide-react';
import { positionstackService } from '@/services/location/positionstackService';
import { LocationInfo } from '@/contexts/EnhancedLocationContext';
import { useToast } from '@/components/ui/use-toast';

const PositionstackExplorer: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    entries: number;
    oldestEntryDays: number;
    newestEntryDays: number;
    sizeKB: number;
  } | null>(null);
  
  const refreshLocation = async () => {
    setLoading(true);
    try {
      // Try browser geolocation API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60 * 60 * 1000 // 1 hour
          });
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
      
      // Got coordinates, now reverse geocode
      const { latitude, longitude } = position.coords;
      
      // Call Positionstack reverse geocoding
      const geocodeResult = await positionstackService.reverseGeocode(latitude, longitude);
      
      if (geocodeResult) {
        setCurrentLocation(geocodeResult);
      } else {
        toast({
          title: 'Geocoding Failed',
          description: 'Could not get location details from coordinates',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Location Detection Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      updateCacheStats();
    }
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const result = await positionstackService.geocode(searchQuery);
      setSearchResults(result);
      if (!result) {
        toast({
          title: 'No Results Found',
          description: 'Try a different search term or location',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Search Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
      updateCacheStats();
    }
  };
  
  const clearCache = () => {
    positionstackService.clearCache();
    updateCacheStats();
    toast({
      title: 'Cache Cleared',
      description: 'The Positionstack geocoding cache has been cleared',
    });
  };
  
  const updateCacheStats = () => {
    const stats = positionstackService.getCacheStats();
    setCacheStats(stats);
  };
  
  // Initialize
  useEffect(() => {
    updateCacheStats();
    // Do not automatically refresh location to avoid API usage
  }, []);
  
  return (
    <div className="space-y-6">
      <Alert className="mb-4 border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
        <ExternalLink className="h-4 w-4" />
        <AlertTitle>Positionstack API</AlertTitle>
        <AlertDescription>
          Powered by the Positionstack geocoding API with 7-day aggressive caching and rate limiting.
          <div className="mt-2 text-xs">
            {positionstackService.getAttribution()}
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Current Location Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Current Location
            </CardTitle>
            <CardDescription>Your detected location with Positionstack geocoding</CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : currentLocation ? (
              <div className="space-y-4">
                <div className="text-xl font-semibold text-primary">
                  {currentLocation.city || 'Unknown'}{currentLocation.region ? `, ${currentLocation.region}` : ''}{currentLocation.country ? `, ${currentLocation.country}` : ''}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {currentLocation.formattedAddress}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span> {currentLocation.lat.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span> {currentLocation.lon.toFixed(6)}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {currentLocation.lastUpdated.toLocaleString()}
                  </div>
                </div>
                
                {currentLocation.components && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Location Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(currentLocation.components)
                        .filter(([key, value]) => value)
                        .map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key.replace(/_/g, ' ')}: {value}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Click the button below to detect your location
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={refreshLocation}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Detect Location
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Search Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Search Locations
            </CardTitle>
            <CardDescription>
              Search for any location using Positionstack
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter a place name, address, or landmark"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={searching || !searchQuery.trim()}>
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
              
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults ? (
                <div className="space-y-4 mt-4">
                  <div className="text-xl font-semibold text-primary">
                    {searchResults.city || 'Unknown'}{searchResults.region ? `, ${searchResults.region}` : ''}{searchResults.country ? `, ${searchResults.country}` : ''}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {searchResults.formattedAddress}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Latitude:</span> {searchResults.lat.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-medium">Longitude:</span> {searchResults.lon.toFixed(6)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Last Updated:</span>{' '}
                      {searchResults.lastUpdated.toLocaleString()}
                    </div>
                  </div>
                  
                  {searchResults.components && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2">Location Components</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(searchResults.components)
                          .filter(([key, value]) => value)
                          .map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key.replace(/_/g, ' ')}: {value}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Search results will appear here
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Cache Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Positionstack Geocoding Cache</CardTitle>
          <CardDescription>
            7-day caching for efficient API usage (100,000 requests/month limit)
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{cacheStats?.entries || 0}</div>
                <div className="text-sm text-muted-foreground">Cached Locations</div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{cacheStats?.oldestEntryDays || 0}</div>
                <div className="text-sm text-muted-foreground">Days (Oldest Entry)</div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{cacheStats?.newestEntryDays || 0}</div>
                <div className="text-sm text-muted-foreground">Days (Newest Entry)</div>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-3xl font-bold">{cacheStats?.sizeKB || 0} KB</div>
                <div className="text-sm text-muted-foreground">Cache Size</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <strong>Plan:</strong> Basic Plan - 100,000 requests/month with 7-day aggressive caching
              </div>
              
              <Button variant="destructive" size="sm" onClick={clearCache}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PositionstackExplorer;