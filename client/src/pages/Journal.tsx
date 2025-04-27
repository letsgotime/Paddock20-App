import React, { useState, useEffect } from 'react';
import { fetchDriveJournal, addDriveEntry, deleteDriveEntry, DriveEntry } from '../services/driveJournalService';
import DriveLoggerForm from '../components/DriveLoggerForm';
import { vehicleProfile } from '../data/vehicles';

// Mood options with emojis
const moodOptions = [
  { value: 'exhilarated', label: '🤩 Exhilarated' },
  { value: 'focused', label: '🧠 Focused' },
  { value: 'relaxed', label: '😌 Relaxed' },
  { value: 'refreshed', label: '😊 Refreshed' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'stressed', label: '😰 Stressed' },
  { value: 'frustrated', label: '😤 Frustrated' }
];

// Drive tag options
const tagOptions = [
  { value: 'canyon', label: '🏔️ Canyon Run' },
  { value: 'track', label: '🏁 Track Day' },
  { value: 'commute', label: '🏙️ Commute' },
  { value: 'roadtrip', label: '🛣️ Road Trip' },
  { value: 'scenic', label: '🌄 Scenic Drive' },
  { value: 'autocross', label: '🚩 Autocross' },
  { value: 'offroad', label: '🌲 Off-Road' }
];

function Journal() {
  const [entries, setEntries] = useState<DriveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [isDeleting, setIsDeleting] = useState(false);

  // Enhanced entry with mood and tags
  const [newEntry, setNewEntry] = useState<DriveEntry>({
    date: new Date().toISOString().split('T')[0],
    car: vehicleProfile.make + ' ' + vehicleProfile.model,
    location: '',
    mileage: '',
    treadDepth: '',
    weather: '',
    mood: '',
    notes: '',
    photoUrl: '',
    tags: []
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await fetchDriveJournal();
      setEntries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Drive Journal entries:', error);
      setLoading(false);
    }
  }

  const handleAddDrive = async (entry: DriveEntry) => {
    try {
      setLoading(true);
      await addDriveEntry(entry);
      await loadEntries(); // Reload entries after adding new one
      setShowForm(false);
    } catch (error) {
      console.error('Error adding drive entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrive = async (id: number) => {
    if (!id || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await deleteDriveEntry(id);
      await loadEntries(); // Reload entries after deletion
    } catch (error) {
      console.error('Error deleting drive entry:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter entries based on selected tag
  const filteredEntries = filterTag 
    ? entries.filter(entry => entry.tags && entry.tags.includes(filterTag))
    : entries;
    
  // Sort entries based on selected option
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortOption === 'longest') {
      return parseInt(b.mileage) - parseInt(a.mileage);
    } else {
      return 0;
    }
  });

  // Helper function to get mood emoji
  const getMoodEmoji = (mood: string) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.label.split(' ')[0] : '';
  };

  // Helper function to get tag label
  const getTagLabel = (tag: string) => {
    const tagOption = tagOptions.find(option => option.value === tag);
    return tagOption ? tagOption.label : tag;
  };

  return (
    <div className="p-10 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-blue-400 font-orbitron text-3xl mb-4 md:mb-0">
            📝 Drive Journal
          </h1>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="apex-button flex items-center"
          >
            {showForm ? '❌ Cancel' : '➕ Add New Drive'}
          </button>
        </div>
        
        <p className="text-white text-center mb-8">
          Track your drives, experiences, and vehicle performance metrics.
        </p>
        
        {showForm && (
          <div className="mb-10 bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800">
            <DriveLoggerForm onAddDrive={handleAddDrive} />
          </div>
        )}
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap justify-between mb-8 gap-4">
          <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800">
            <label htmlFor="filter-tag" className="text-white mr-2">Filter by Tag:</label>
            <select 
              id="filter-tag"
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="bg-black text-white border border-gray-700 rounded-md p-2"
            >
              <option value="">All Tags</option>
              {tagOptions.map(tag => (
                <option key={tag.value} value={tag.value}>{tag.label}</option>
              ))}
            </select>
          </div>
          
          <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-4 rounded-lg border border-gray-800">
            <label htmlFor="sort-option" className="text-white mr-2">Sort by:</label>
            <select 
              id="sort-option"
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              className="bg-black text-white border border-gray-700 rounded-md p-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="longest">Longest Drives</option>
            </select>
          </div>
        </div>

        {/* Drive Journal Entries */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
            <p className="text-gray-400 mt-4">Loading drive logs...</p>
          </div>
        ) : sortedEntries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sortedEntries.map((entry, index) => (
              <div key={index} className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-blue-400 font-orbitron text-xl">{entry.location}</h3>
                    <div className="text-gray-400 text-sm">{new Date(entry.date).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags && entry.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-800 text-green-400 text-xs px-2 py-1 rounded-full">
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Vehicle</p>
                      <p className="text-white">{entry.car}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Distance</p>
                      <p className="text-white">{entry.mileage} miles</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Weather</p>
                      <p className="text-white">{entry.weather}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tread Depth</p>
                      <p className="text-white">{entry.treadDepth} mm</p>
                    </div>
                  </div>
                  
                  {entry.mood && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">Driving Mood</p>
                      <p className="text-white">{getMoodEmoji(entry.mood)} {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</p>
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm">Notes</p>
                      <p className="text-white">{entry.notes}</p>
                    </div>
                  )}
                  
                  {entry.photoUrl && (
                    <div className="mt-4">
                      <img 
                        src={entry.photoUrl} 
                        alt="Drive Photo" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => entry.id && handleDeleteDrive(entry.id)}
                      className="text-red-500 hover:text-red-400 text-sm flex items-center"
                      disabled={isDeleting}
                    >
                      🗑️ Delete Entry
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 mb-4">No drives logged yet. Start tracking your adventures!</p>
            <button 
              onClick={() => setShowForm(true)}
              className="apex-button inline-flex items-center"
            >
              Add Your First Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Journal;