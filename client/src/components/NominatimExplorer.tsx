import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Search, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import { nominatimService } from '@/services/location/nominatimService';
import { LocationInfo } from '@/contexts/EnhancedLocationContext';
import { useToast } from '@/components/ui/use-toast';

const NominatimExplorer: React.FC = () => {
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
      
      // Call Nominatim reverse geocoding
      const geocodeResult = await nominatimService.reverseGeocode(latitude, longitude);
      
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
      const result = await nominatimService.geocode(searchQuery);
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
    nominatimService.clearCache();
    updateCacheStats();
    toast({
      title: 'Cache Cleared',
      description: 'The Nominatim geocoding cache has been cleared',
    });
  };
  
  const updateCacheStats = () => {
    const stats = nominatimService.getCacheStats();
    setCacheStats(stats);
  };
  
  // Initialize
  useEffect(() => {
    updateCacheStats();
    // Do not automatically refresh location to respect API limits
    // User must click the button to initiate a request
  }, []);
  
  return (
    <div className="space-y-6">
      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Strict Usage Policy</AlertTitle>
        <AlertDescription>
          This service follows OpenStreetMap Nominatim's usage policy. Requests are limited to 1 every 2 seconds.
          <div className="mt-2 text-xs">
            Data {nominatimService.getAttribution()}
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
            <CardDescription>Your detected location with Nominatim geocoding</CardDescription>
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
                        .filter(([key, value]) => value && !key.includes('_code') && key !== 'ISO_3166')
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
              Search for any location using OSM Nominatim
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
                          .filter(([key, value]) => value && !key.includes('_code') && key !== 'ISO_3166')
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
          <CardTitle className="text-lg">Nominatim Geocoding Cache</CardTitle>
          <CardDescription>
            14-day caching to minimize API usage and respect usage policies
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
                <strong>Rate limiting:</strong> Max 1 request per 2 seconds with 14-day caching to respect Nominatim Usage Policy.
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

export default NominatimExplorer;