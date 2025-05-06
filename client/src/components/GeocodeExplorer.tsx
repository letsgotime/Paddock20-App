import React, { useState } from 'react';
import { useEnhancedLocation } from '@/contexts/EnhancedLocationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Search, MapPin, Trash2 } from 'lucide-react';

const GeocodeExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo | null>(null);
  const [searching, setSearching] = useState(false);
  
  const { 
    locationInfo, 
    loading, 
    error, 
    refreshLocation, 
    searchLocation,
    cacheStats,
    clearCache
  } = useEnhancedLocation();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const result = await searchLocation(searchQuery);
      setSearchResults(result);
    } finally {
      setSearching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {/* Current Location Card */}
        <Card className="w-full md:w-1/2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />
              Current Location
            </CardTitle>
            <CardDescription>Your detected location with OpenCage geocoding</CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : locationInfo ? (
              <div className="space-y-4">
                <div className="text-xl font-semibold text-primary">
                  {locationInfo.city || 'Unknown'}{locationInfo.region ? `, ${locationInfo.region}` : ''}{locationInfo.country ? `, ${locationInfo.country}` : ''}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {locationInfo.formattedAddress}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Latitude:</span> {locationInfo.lat.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span> {locationInfo.lon.toFixed(6)}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Last Updated:</span>{' '}
                    {locationInfo.lastUpdated.toLocaleString()}
                  </div>
                </div>
                
                {locationInfo.components && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Location Components</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(locationInfo.components)
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
                {error || 'No location available'}
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => refreshLocation()}
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
                  Refresh Location
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
              Search for any location (uses 1 API call per new search)
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter a place name, address, or coordinates"
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
          <CardTitle className="text-lg">OpenCage Geocoding Cache</CardTitle>
          <CardDescription>
            Ultra-conservative caching to manage the 1 request/day limit
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
                <strong>Note:</strong> OpenCage API has a limit of 2,500 requests/day on free plan.
                This implementation enforces a strict 1 request/day limit with 30-day caching.
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

export default GeocodeExplorer;