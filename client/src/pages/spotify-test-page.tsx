import React, { useState } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';
import SpotifyConnectButton from '../components/SpotifyConnectButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Music, ListMusic, Clock, Star } from 'lucide-react';
import { SpotifyTrack, SpotifyPlaylist } from '../services/spotify/spotifyTypes';
import PageTitle from '../components/PageTitle';

/**
 * SpotifyTestPage
 * 
 * A test page to demonstrate Spotify integration features
 */
const SpotifyTestPage: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    userProfile, 
    playlists, 
    refreshPlaylists,
    getPlaylistTracks,
    searchTracks,
    getTopTracks
  } = useSpotify();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(false);
  
  // Function to handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to load a user's top tracks
  const loadTopTracks = async () => {
    setIsLoadingTracks(true);
    try {
      const tracks = await getTopTracks();
      setTopTracks(tracks);
    } catch (error) {
      console.error('Error loading top tracks:', error);
    } finally {
      setIsLoadingTracks(false);
    }
  };
  
  // Function to load tracks for a selected playlist
  const loadPlaylistTracks = async (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist);
    setIsLoadingTracks(true);
    
    try {
      const response = await getPlaylistTracks(playlist.id);
      setPlaylistTracks(response.items.map(item => item.track));
    } catch (error) {
      console.error('Error loading playlist tracks:', error);
    } finally {
      setIsLoadingTracks(false);
    }
  };
  
  // Helper function to format duration
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="container py-8">
      <PageTitle title="Spotify Integration" />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-carolina-blue">Spotify Integration</h1>
        <SpotifyConnectButton />
      </div>
      
      {!isAuthenticated ? (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Connect to Spotify</CardTitle>
            <CardDescription>
              Connect your Spotify account to access playlists, search for music, and create drive playlists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 mb-4">
              To use the Spotify integration features, click the "Connect Spotify" button above.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg flex flex-col items-center">
                <ListMusic className="w-12 h-12 text-carolina-blue mb-2" />
                <h3 className="font-bold">Access Playlists</h3>
                <p className="text-sm text-center text-gray-400">View and manage your Spotify playlists</p>
              </div>
              <div className="p-4 border border-border rounded-lg flex flex-col items-center">
                <Music className="w-12 h-12 text-carolina-blue mb-2" />
                <h3 className="font-bold">Create Drive Playlists</h3>
                <p className="text-sm text-center text-gray-400">Generate playlists for your drives based on duration</p>
              </div>
              <div className="p-4 border border-border rounded-lg flex flex-col items-center">
                <Star className="w-12 h-12 text-carolina-blue mb-2" />
                <h3 className="font-bold">View Top Tracks</h3>
                <p className="text-sm text-center text-gray-400">See your most played tracks on Spotify</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* User profile info */}
          {userProfile && (
            <Card className="mb-8 bg-card border-border">
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-4">
                    {userProfile.images && userProfile.images[0]?.url && (
                      <img 
                        src={userProfile.images[0].url} 
                        alt={userProfile.display_name} 
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div>
                      <h2 className="text-xl">{userProfile.display_name}</h2>
                      <p className="text-sm text-gray-400">{userProfile.email}</p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          )}
          
          {/* Tabs for different features */}
          <Tabs defaultValue="playlists" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="top-tracks">Top Tracks</TabsTrigger>
            </TabsList>
            
            {/* Playlists Tab */}
            <TabsContent value="playlists">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Playlists</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => refreshPlaylists()}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing</>
                      ) : (
                        <>Refresh</>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    {playlists.length} playlists found in your Spotify account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedPlaylist ? (
                    <div>
                      <Button 
                        variant="link" 
                        onClick={() => setSelectedPlaylist(null)}
                        className="mb-4 pl-0"
                      >
                        ← Back to playlists
                      </Button>
                      
                      <div className="flex items-center gap-4 mb-6">
                        {selectedPlaylist.images && selectedPlaylist.images[0]?.url && (
                          <img 
                            src={selectedPlaylist.images[0].url} 
                            alt={selectedPlaylist.name} 
                            className="w-24 h-24 rounded-md"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{selectedPlaylist.name}</h3>
                          <p className="text-sm text-gray-400">{selectedPlaylist.tracks.total} tracks</p>
                          {selectedPlaylist.description && (
                            <p className="text-sm mt-1">{selectedPlaylist.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {isLoadingTracks ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-carolina-blue" />
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-md border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-2 text-left">#</th>
                                <th className="p-2 text-left">Title</th>
                                <th className="p-2 text-left">Artist</th>
                                <th className="p-2 text-left">Album</th>
                                <th className="p-2 text-right">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {playlistTracks.map((track, index) => (
                                <tr key={track.id} className="border-t border-border hover:bg-muted/50">
                                  <td className="p-2">{index + 1}</td>
                                  <td className="p-2 font-medium">{track.name}</td>
                                  <td className="p-2">{track.artists.map(a => a.name).join(', ')}</td>
                                  <td className="p-2">{track.album.name}</td>
                                  <td className="p-2 text-right">{formatDuration(track.duration_ms)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {playlists.map(playlist => (
                        <div 
                          key={playlist.id} 
                          className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => loadPlaylistTracks(playlist)}
                        >
                          {playlist.images && playlist.images[0]?.url ? (
                            <img 
                              src={playlist.images[0].url} 
                              alt={playlist.name} 
                              className="w-full aspect-square object-cover rounded-md mb-2"
                            />
                          ) : (
                            <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-md mb-2">
                              <Music className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <h3 className="font-medium truncate">{playlist.name}</h3>
                          <p className="text-sm text-gray-400">{playlist.tracks.total} tracks</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Search Tab */}
            <TabsContent value="search">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Search Tracks</CardTitle>
                  <CardDescription>
                    Search for tracks to create playlists or add to existing ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-6">
                    <Input 
                      placeholder="Search for tracks, artists, albums..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="overflow-hidden rounded-md border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-2 text-left">Title</th>
                            <th className="p-2 text-left">Artist</th>
                            <th className="p-2 text-left">Album</th>
                            <th className="p-2 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map(track => (
                            <tr key={track.id} className="border-t border-border hover:bg-muted/50">
                              <td className="p-2 font-medium">{track.name}</td>
                              <td className="p-2">{track.artists.map(a => a.name).join(', ')}</td>
                              <td className="p-2">{track.album.name}</td>
                              <td className="p-2 text-right">{formatDuration(track.duration_ms)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {searchQuery && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                  
                  {!searchQuery && !isSearching && (
                    <div className="text-center py-12 text-gray-400">
                      Enter a search term to find tracks
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Top Tracks Tab */}
            <TabsContent value="top-tracks">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Top Tracks</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadTopTracks()}
                      disabled={isLoadingTracks}
                    >
                      {isLoadingTracks ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading</>
                      ) : (
                        <>Load Top Tracks</>
                      )}
                    </Button>
                  </div>
                  <CardDescription>
                    Most played tracks on your Spotify account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTracks ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-carolina-blue" />
                    </div>
                  ) : topTracks.length > 0 ? (
                    <div className="overflow-hidden rounded-md border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-2 text-left">#</th>
                            <th className="p-2 text-left">Title</th>
                            <th className="p-2 text-left">Artist</th>
                            <th className="p-2 text-left">Album</th>
                            <th className="p-2 text-right">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topTracks.map((track, index) => (
                            <tr key={track.id} className="border-t border-border hover:bg-muted/50">
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2 font-medium">{track.name}</td>
                              <td className="p-2">{track.artists.map(a => a.name).join(', ')}</td>
                              <td className="p-2">{track.album.name}</td>
                              <td className="p-2 text-right">{formatDuration(track.duration_ms)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      Click "Load Top Tracks" to see your most played songs
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SpotifyTestPage;