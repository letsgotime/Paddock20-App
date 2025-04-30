import React, { useState, useEffect } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { 
  BookOpen, Plus, Calendar, Clock, MapPin, Car, 
  Heart, Sun, Cloud, CloudRain, ThumbsUp, ThumbsDown,
  Star, Filter, Search, ChevronDown, PenTool, Image,
  Mic, Paperclip, Tag, Trash2, Edit2
} from 'lucide-react';

interface JournalEntry {
  id: string;
  vehicle_id: string;
  title: string;
  date: string;
  distance: number;
  start_location?: string;
  end_location?: string;
  route_taken?: string;
  weather_conditions: string;
  mood_rating: number; // 1-5
  energy_level: number; // 1-5
  driving_performance: number; // 1-5
  vehicle_performance: number; // 1-5
  notes: string;
  tags?: string[];
  images?: string[];
  audio_notes?: string[];
  created_at: string;
  updated_at?: string;
}

const DriveJournalPage: React.FC = () => {
  const { vehicles, activeVehicle, setActiveVehicle } = useVehicles();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [entryFilter, setEntryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    distance: 0,
    start_location: '',
    end_location: '',
    route_taken: '',
    weather_conditions: 'sunny',
    mood_rating: 3,
    energy_level: 3,
    driving_performance: 3,
    vehicle_performance: 3,
    notes: '',
    tags: []
  });
  
  // Load journal entries for the active vehicle
  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (!activeVehicle) return;
      
      try {
        setLoading(true);
        
        // In a real app, this would fetch from an API or database
        // For demo purposes, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setJournalEntries(getDemoEntries(activeVehicle.id));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching journal entries:', err);
        setLoading(false);
      }
    };
    
    fetchJournalEntries();
  }, [activeVehicle]);
  
  // Get filtered entries
  const getFilteredEntries = () => {
    if (!journalEntries.length) return [];
    
    let filtered = [...journalEntries];
    
    // Filter by vehicle if needed
    if (activeVehicle) {
      filtered = filtered.filter(entry => entry.vehicle_id === activeVehicle.id);
    }
    
    // Apply additional filters
    if (entryFilter === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (entryFilter === 'longest') {
      filtered = filtered.sort((a, b) => b.distance - a.distance);
    } else if (entryFilter === 'highest-rated') {
      filtered = filtered.sort((a, b) => {
        const aAvg = (a.mood_rating + a.driving_performance + a.vehicle_performance) / 3;
        const bAvg = (b.mood_rating + b.driving_performance + b.vehicle_performance) / 3;
        return bAvg - aAvg;
      });
    }
    
    // Apply search query if any
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.notes.toLowerCase().includes(query) ||
        entry.start_location?.toLowerCase().includes(query) ||
        entry.end_location?.toLowerCase().includes(query) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };
  
  // Demo entries
  const getDemoEntries = (vehicleId: string): JournalEntry[] => {
    return [
      {
        id: '1',
        vehicle_id: vehicleId,
        title: 'Sunday Mountain Drive',
        date: '2023-10-15',
        distance: 122,
        start_location: 'Nashville, TN',
        end_location: 'Asheville, NC',
        route_taken: 'Blue Ridge Parkway',
        weather_conditions: 'sunny',
        mood_rating: 5,
        energy_level: 4,
        driving_performance: 5,
        vehicle_performance: 5,
        notes: 'Perfect fall day for a drive in the mountains. The colors were spectacular and the car handled the curves beautifully. Stopped at three overlooks for photos.',
        tags: ['weekend', 'mountains', 'fall'],
        images: [
          'https://images.unsplash.com/photo-1635963989842-451b87c4bfb8?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop'
        ],
        created_at: '2023-10-15T18:30:00Z'
      },
      {
        id: '2',
        vehicle_id: vehicleId,
        title: 'Early Morning Commute',
        date: '2023-10-18',
        distance: 28,
        start_location: 'Home',
        end_location: 'Office',
        route_taken: 'Highway 40',
        weather_conditions: 'rainy',
        mood_rating: 2,
        energy_level: 2,
        driving_performance: 3,
        vehicle_performance: 4,
        notes: 'Heavy rain made the commute challenging. Hydroplaned briefly but the car recovered well. Need to replace wipers soon for better visibility.',
        tags: ['commute', 'rain', 'weekday'],
        created_at: '2023-10-18T08:45:00Z'
      },
      {
        id: '3',
        vehicle_id: vehicleId,
        title: 'Track Day at Nashville Superspeedway',
        date: '2023-10-22',
        distance: 87,
        start_location: 'Nashville, TN',
        end_location: 'Nashville Superspeedway',
        route_taken: 'I-840',
        weather_conditions: 'cloudy',
        mood_rating: 5,
        energy_level: 5,
        driving_performance: 4,
        vehicle_performance: 5,
        notes: 'Amazing track day! Improved my lap times by 2.3 seconds from last session. The new tires made a huge difference in cornering grip. Noticed some brake fade after 10 laps though.',
        tags: ['track', 'performance', 'weekend'],
        images: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop'
        ],
        audio_notes: ['track-day-debrief.mp3'],
        created_at: '2023-10-22T16:15:00Z'
      }
    ];
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle rating changes
  const handleRatingChange = (name: string, value: number) => {
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };
  
  // Add a tag to the new entry
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    setNewEntry(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag.trim()]
    }));
  };
  
  // Remove a tag from the new entry
  const removeTag = (tagToRemove: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Submit new entry
  const submitNewEntry = () => {
    if (!activeVehicle) return;
    
    // Validate entry
    if (!newEntry.title || !newEntry.date) {
      alert('Please add a title and date for your drive journal entry');
      return;
    }
    
    // Create the new entry
    const entry: JournalEntry = {
      id: Date.now().toString(),
      vehicle_id: activeVehicle.id,
      title: newEntry.title!,
      date: newEntry.date!,
      distance: newEntry.distance || 0,
      start_location: newEntry.start_location,
      end_location: newEntry.end_location,
      route_taken: newEntry.route_taken,
      weather_conditions: newEntry.weather_conditions || 'sunny',
      mood_rating: newEntry.mood_rating || 3,
      energy_level: newEntry.energy_level || 3,
      driving_performance: newEntry.driving_performance || 3,
      vehicle_performance: newEntry.vehicle_performance || 3,
      notes: newEntry.notes || '',
      tags: newEntry.tags,
      created_at: new Date().toISOString()
    };
    
    // Add to journalEntries
    setJournalEntries(prev => [entry, ...prev]);
    
    // Reset form
    setNewEntry({
      title: '',
      date: new Date().toISOString().split('T')[0],
      distance: 0,
      start_location: '',
      end_location: '',
      route_taken: '',
      weather_conditions: 'sunny',
      mood_rating: 3,
      energy_level: 3,
      driving_performance: 3,
      vehicle_performance: 3,
      notes: '',
      tags: []
    });
    
    // Close form
    setShowNewEntryForm(false);
  };
  
  // Delete an entry
  const deleteEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };
  
  // Render star rating component
  const StarRating = ({ 
    name,
    value, 
    onChange,
    readOnly = false
  }: { 
    name: string;
    value: number;
    onChange?: (name: string, value: number) => void;
    readOnly?: boolean;
  }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onChange?.(name, star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} p-1`}
            disabled={readOnly}
          >
            <Star 
              className={`h-5 w-5 ${
                star <= value 
                  ? 'text-amber-400 fill-amber-400' 
                  : 'text-gray-400'
              }`} 
            />
          </button>
        ))}
      </div>
    );
  };
  
  // Weather icon mapping
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-amber-400" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      default:
        return <Sun className="h-5 w-5 text-amber-400" />;
    }
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Drive Journal</h1>
            <p className="text-gray-400 mt-1">
              Record your driving experiences, emotions, and performance insights
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowNewEntryForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Journal Entry
            </button>
            
            <select 
              value={entryFilter} 
              onChange={e => setEntryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Entries</option>
              <option value="recent">Most Recent</option>
              <option value="longest">Longest Drives</option>
              <option value="highest-rated">Highest Rated</option>
            </select>
          </div>
        </div>
        
        {/* Vehicle selector */}
        {vehicles.length > 0 && (
          <div className="mb-6 bg-gray-900/40 rounded-xl p-4 border border-gray-800">
            <h2 className="text-lg font-medium text-white mb-3 flex items-center">
              <Car className="h-5 w-5 text-blue-400 mr-2" />
              Select Vehicle
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {vehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => setActiveVehicle(vehicle)}
                  className={`p-3 rounded-lg border transition-colors ${
                    activeVehicle?.id === vehicle.id
                      ? 'bg-blue-900/30 border-blue-500 text-white'
                      : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800/80'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-xs opacity-70">
                    {vehicle.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search journal entries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Journal entries list */}
          <div className={`${selectedEntry ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
            {loading ? (
              <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : getFilteredEntries().length === 0 ? (
              <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
                <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-3">No Journal Entries</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  {activeVehicle ? 
                    searchQuery ? 
                      "No entries match your search criteria." :
                      "You haven't recorded any drives with this vehicle yet." : 
                    "Select a vehicle to see journal entries or create a new one."}
                </p>
                <button
                  onClick={() => setShowNewEntryForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Entry
                </button>
              </div>
            ) : (
              <>
                {/* Journal entries */}
                {getFilteredEntries().map(entry => (
                  <div 
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`bg-gray-900/40 rounded-xl p-5 border cursor-pointer transition-colors ${
                      selectedEntry?.id === entry.id 
                        ? 'border-blue-500 bg-blue-900/10' 
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-white">{entry.title}</h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(entry.date)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Car className="h-4 w-4 mr-1" />
                        {vehicles.find(v => v.id === entry.vehicle_id)?.model || 'Vehicle'}
                      </div>
                      
                      {entry.distance > 0 && (
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.distance} miles
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-400">
                        {getWeatherIcon(entry.weather_conditions)}
                        <span className="ml-1 capitalize">{entry.weather_conditions}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400">
                        <Heart className="h-4 w-4 mr-1 text-red-400" />
                        <StarRating name="mood_rating" value={entry.mood_rating} readOnly />
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{entry.notes}</p>
                    
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {entry.images && entry.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {entry.images.slice(0, 3).map((img, idx) => (
                          <div 
                            key={idx} 
                            className="w-16 h-16 rounded overflow-hidden bg-gray-800"
                          >
                            <img 
                              src={img} 
                              alt={`Drive ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {entry.images.length > 3 && (
                          <div className="w-16 h-16 rounded overflow-hidden bg-gray-800 flex items-center justify-center">
                            <span className="text-white">+{entry.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* Entry detail view */}
          {selectedEntry && (
            <div className="lg:col-span-7">
              <div className="bg-gray-900/40 rounded-xl border border-gray-800 sticky top-4">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">{selectedEntry.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedEntry(null)}
                      className="p-2 text-gray-400 hover:text-gray-300"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteEntry(selectedEntry.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Date</div>
                          <div className="text-white flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
                            {formatDate(selectedEntry.date)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Distance</div>
                          <div className="text-white flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5 text-blue-400" />
                            {selectedEntry.distance} miles
                          </div>
                        </div>
                      </div>
                      
                      {(selectedEntry.start_location || selectedEntry.end_location) && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 mb-1">Route</div>
                          <div className="text-white">
                            {selectedEntry.start_location && (
                              <div className="flex items-start mb-1">
                                <span className="text-gray-500 mr-2">From:</span>
                                {selectedEntry.start_location}
                              </div>
                            )}
                            {selectedEntry.end_location && (
                              <div className="flex items-start">
                                <span className="text-gray-500 mr-2">To:</span>
                                {selectedEntry.end_location}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {selectedEntry.route_taken && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 mb-1">Route Details</div>
                          <div className="text-white">{selectedEntry.route_taken}</div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">Weather</div>
                        <div className="text-white flex items-center">
                          {getWeatherIcon(selectedEntry.weather_conditions)}
                          <span className="ml-1.5 capitalize">{selectedEntry.weather_conditions}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <Heart className="h-3.5 w-3.5 mr-1 text-red-400" />
                            Mood
                          </div>
                          <StarRating name="mood_rating" value={selectedEntry.mood_rating} readOnly />
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Energy Level</div>
                          <StarRating name="energy_level" value={selectedEntry.energy_level} readOnly />
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Driving Performance</div>
                          <StarRating name="driving_performance" value={selectedEntry.driving_performance} readOnly />
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Vehicle Performance</div>
                          <StarRating name="vehicle_performance" value={selectedEntry.vehicle_performance} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Notes</div>
                    <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 text-white">
                      {selectedEntry.notes}
                    </div>
                  </div>
                  
                  {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.images && selectedEntry.images.length > 0 && (
                    <div className="mb-6">
                      <div className="text-sm text-gray-500 mb-2">Images</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedEntry.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="aspect-video rounded overflow-hidden bg-gray-800"
                          >
                            <img 
                              src={img} 
                              alt={`Drive ${idx + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.audio_notes && selectedEntry.audio_notes.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">Audio Notes</div>
                      <div className="space-y-2">
                        {selectedEntry.audio_notes.map((audio, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-gray-900/60 rounded-lg border border-gray-800 flex items-center"
                          >
                            <Mic className="h-5 w-5 text-blue-400 mr-2" />
                            <span className="text-white text-sm">{audio}</span>
                            <button className="ml-auto text-gray-400 hover:text-blue-400">
                              <Play className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* New Entry Form Modal */}
        {showNewEntryForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                <h3 className="text-xl font-semibold text-white">New Drive Journal Entry</h3>
                <button 
                  onClick={() => setShowNewEntryForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newEntry.title || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Give your drive a title"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newEntry.date || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Distance (miles)
                      </label>
                      <input
                        type="number"
                        name="distance"
                        value={newEntry.distance || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Start Location
                      </label>
                      <input
                        type="text"
                        name="start_location"
                        value={newEntry.start_location || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Where did you start?"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        End Location
                      </label>
                      <input
                        type="text"
                        name="end_location"
                        value={newEntry.end_location || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Where did you end up?"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Route Taken
                      </label>
                      <input
                        type="text"
                        name="route_taken"
                        value={newEntry.route_taken || ''}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Which route did you take?"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Weather Conditions
                      </label>
                      <select
                        name="weather_conditions"
                        value={newEntry.weather_conditions || 'sunny'}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sunny">Sunny</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="rainy">Rainy</option>
                        <option value="snowy">Snowy</option>
                        <option value="foggy">Foggy</option>
                        <option value="windy">Windy</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Mood Rating
                      </label>
                      <StarRating 
                        name="mood_rating" 
                        value={newEntry.mood_rating || 3} 
                        onChange={handleRatingChange}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Energy Level
                      </label>
                      <StarRating 
                        name="energy_level" 
                        value={newEntry.energy_level || 3} 
                        onChange={handleRatingChange}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Driving Performance
                      </label>
                      <StarRating 
                        name="driving_performance" 
                        value={newEntry.driving_performance || 3} 
                        onChange={handleRatingChange}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Vehicle Performance
                      </label>
                      <StarRating 
                        name="vehicle_performance" 
                        value={newEntry.vehicle_performance || 3} 
                        onChange={handleRatingChange}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Tags
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          id="tag-input"
                          className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('tag-input') as HTMLInputElement;
                            addTag(input.value);
                            input.value = '';
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg"
                        >
                          Add
                        </button>
                      </div>
                      
                      {newEntry.tags && newEntry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {newEntry.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1.5 text-gray-400 hover:text-red-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={newEntry.notes || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Write about your driving experience..."
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Attachments
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <Image className="h-5 w-5 mr-2" />
                      Add Images
                    </button>
                    
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Record Audio
                    </button>
                    
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <Paperclip className="h-5 w-5 mr-2" />
                      Attach Files
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewEntryForm(false)}
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={submitNewEntry}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveJournalPage;