import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Music, Disc } from 'lucide-react';
import { createLastFmProvider } from '../services/api/providers/music';
import { createCloudinaryProvider } from '../services/api/providers/media';

/**
 * MusicDisplay component for searching and displaying music via Last.fm API
 * with image optimization via Cloudinary
 */
export const MusicDisplay = () => {
  const [artist, setArtist] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create providers
  const lastFm = createLastFmProvider();
  const cloudinary = createCloudinaryProvider();
  
  const handleSearch = async () => {
    if (!artist.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Search Last.fm API
      const response = await lastFm.search(artist, 'artist', 8, 1);
      
      if (response.success && response.data) {
        const artists = response.data.results?.artistmatches?.artist || [];
        setSearchResults(artists);
      } else {
        setError('No artists found. Try a different search term.');
        setSearchResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search for artists');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getArtistDetails = async (name: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await lastFm.getArtistInfo(name);
      
      if (response.success && response.data) {
        setSelectedArtist(response.data);
      } else {
        setError('Failed to get artist details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get artist details');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Optimize image with Cloudinary
  const optimizeImage = (url: string) => {
    // Fallback to a default if no image is available
    if (!url || url === '') {
      return 'https://via.placeholder.com/300x300?text=No+Image';
    }
    
    try {
      // Apply avatar preset for artist images
      return cloudinary.applyPreset(url, 'avatar');
    } catch (error) {
      console.error('Image optimization error:', error);
      return url; // Fallback to original image if optimization fails
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-blue-400">Music Discovery</h2>
        <p className="text-gray-300">Find your favorite artists and discover new music</p>
      </div>
      
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search for an artist..."
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
          <Search className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {selectedArtist ? (
        <Card className="bg-slate-900 border-blue-900 mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <img 
                src={optimizeImage(selectedArtist.image?.[3]?.['#text'])}
                alt={selectedArtist.name}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div>
                <CardTitle className="text-2xl text-blue-400">{selectedArtist.name}</CardTitle>
                <CardDescription>
                  <span className="text-gray-300">
                    {selectedArtist.stats?.listeners && (
                      <span>{parseInt(selectedArtist.stats.listeners).toLocaleString()} listeners</span>
                    )}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Bio</h3>
              <p className="text-gray-300 text-sm">{selectedArtist.bio?.summary?.replace(/<a.*<\/a>/, '')}</p>
            </div>
            
            {selectedArtist.similar?.artist?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Similar Artists</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedArtist.similar.artist.slice(0, 4).map((similar: any) => (
                    <div 
                      key={similar.name} 
                      className="flex flex-col items-center cursor-pointer hover:opacity-80"
                      onClick={() => getArtistDetails(similar.name)}
                    >
                      <img 
                        src={optimizeImage(similar.image?.[2]?.['#text'])}
                        alt={similar.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <span className="text-xs mt-2 text-center text-gray-200">{similar.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-800 pt-4 flex justify-between">
            <Button variant="outline" onClick={() => setSelectedArtist(null)}>
              Back to results
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open(selectedArtist.url, '_blank')}
            >
              View on Last.fm
              <Disc className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {searchResults.map((result) => (
            <Card 
              key={result.name} 
              className="bg-slate-900 border-blue-900 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => getArtistDetails(result.name)}
            >
              <CardHeader className="pb-2">
                <img 
                  src={optimizeImage(result.image?.[2]?.['#text'])}
                  alt={result.name}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <CardTitle className="text-md text-blue-400">{result.name}</CardTitle>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                  <Music className="h-3 w-3 mr-1" />
                  {parseInt(result.listeners).toLocaleString()} listeners
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!selectedArtist && searchResults.length === 0 && !isLoading && (
        <div className="text-center py-10 text-gray-400">
          <Music size={48} className="mx-auto mb-4 opacity-50" />
          <p>Search for your favorite artists above</p>
        </div>
      )}
    </div>
  );
};

export default MusicDisplay;