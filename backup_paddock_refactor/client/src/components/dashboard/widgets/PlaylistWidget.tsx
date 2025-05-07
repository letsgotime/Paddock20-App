import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Play, Shuffle, ExternalLink, ArrowRight } from 'lucide-react';
import axios from 'axios';

// Driving activity categories
const drivingActivities = [
  'Maintenance',
  'Detailing',
  'Fun Drives',
  'Adding Mods',
  'Commute',
  'Track Days',
  'Car Shows',
  'Road Trips',
  'Off-Roading',
  'Car Photography'
];

// Sample playlist structure
interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  tracks: { total: number };
}

// Activity playlist mapping
interface ActivityPlaylists {
  [key: string]: Playlist[];
}

const PlaylistWidget: React.FC = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState('Fun Drives');
  const [playlistData, setPlaylistData] = useState<ActivityPlaylists>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch playlists from Spotify API
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        // Using the activity as a search term to get relevant playlists
        const response = await axios.get('/api/spotify/playlists', {
          params: { category: selectedActivity, limit: 10 }
        });
        
        // Update state with the received data
        setPlaylistData(prevData => ({
          ...prevData,
          [selectedActivity]: response.data.playlists || []
        }));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setIsLoading(false);
        
        // Fallback to cached data if available
        if (!playlistData[selectedActivity]) {
          setPlaylistData(prevData => ({
            ...prevData,
            [selectedActivity]: [] // Empty array if no data
          }));
        }
      }
    };
    
    // Only fetch if we don't already have data for this activity
    if (!playlistData[selectedActivity]) {
      fetchPlaylists();
    } else {
      setIsLoading(false);
    }
  }, [selectedActivity]);
  
  const currentPlaylists = playlistData[selectedActivity] || [];
  
  return (
    <div className="h-full flex flex-col">
      {/* Activity selector tabs */}
      <div className="flex overflow-x-auto mb-4 pb-1 scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
        {drivingActivities.map(activity => (
          <button
            key={activity}
            onClick={() => setSelectedActivity(activity)}
            className={`px-3 py-1.5 whitespace-nowrap text-sm font-medium mr-2 rounded-full transition-colors ${
              activity === selectedActivity
                ? 'bg-blue-900/50 text-blue-300'
                : 'bg-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {activity}
          </button>
        ))}
      </div>
      
      {/* Content area */}
      <div className="flex-grow relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-t-2 border-blue-400 rounded-full animate-spin"></div>
          </div>
        ) : currentPlaylists.length > 0 ? (
          <div className="space-y-3">
            {currentPlaylists.map(playlist => (
              <div 
                key={playlist.id} 
                className="flex items-center bg-black/30 p-2 rounded-md border border-blue-900/20 hover:border-blue-800/40 transition-colors group"
              >
                {playlist.images && playlist.images[0] ? (
                  <img 
                    src={playlist.images[0].url} 
                    alt={playlist.name} 
                    className="w-12 h-12 object-cover rounded mr-3" 
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-900/20 rounded flex items-center justify-center mr-3">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                
                <div className="flex-grow mr-3">
                  <div className="text-sm font-medium text-white">{playlist.name}</div>
                  <div className="text-xs text-gray-400">{playlist.tracks.total} tracks</div>
                </div>
                
                <div className="flex gap-1">
                  <a 
                    href={playlist.external_urls.spotify} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-blue-900/20 hover:bg-blue-800/30 text-blue-400"
                    title="Open in Spotify"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    className="p-1.5 rounded bg-green-900/20 hover:bg-green-800/30 text-green-400"
                    title="Play now"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Music className="w-12 h-12 text-blue-900/50 mb-3" />
            <h3 className="text-blue-400 font-medium mb-1">No Playlists Found</h3>
            <p className="text-gray-500 text-sm">
              We couldn't find any playlists for {selectedActivity}.
            </p>
          </div>
        )}
      </div>
      
      {/* Widget footer */}
      <div className="mt-3 pt-3 border-t border-blue-900/20 flex justify-between">
        <button
          onClick={() => navigate('/sound-library')}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          <span>View All Playlists</span>
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
        
        <button
          className="text-sm bg-green-900/30 hover:bg-green-800/40 text-green-400 px-3 py-1 rounded flex items-center space-x-1"
        >
          <Shuffle className="h-3 w-3 mr-1" />
          <span>Shuffle Play</span>
        </button>
      </div>
    </div>
  );
};

export default PlaylistWidget;