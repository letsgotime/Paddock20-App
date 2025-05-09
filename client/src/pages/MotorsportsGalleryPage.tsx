import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useGallery, MediaItem, EventGroup, UserGallery } from '../contexts/GalleryContext';

const MotorsportsGalleryPage: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { 
    eventsData, 
    featuredMedia, 
    loadingGallery, 
    error, 
    refreshGallery,
    userGalleries,
    currentUserGallery,
    switchToUserGallery,
    switchToOfficialGallery,
    addUserEvent,
    addUserMedia,
    importMediaFromUrl
  } = useGallery();
  
  // Gallery view state
  const [activeTab, setActiveTab] = useState<'official' | 'personal'>('official');
  const [activeView, setActiveView] = useState<'grid' | 'events'>('events');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos' | 'documents' | 'audio'>('all');
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // For personal galleries
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user'); // In a real app, this would be from auth
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [urlToImport, setUrlToImport] = useState('');
  const [fileTypeToImport, setFileTypeToImport] = useState<MediaItem['type']>('image');
  const [uploadEventId, setUploadEventId] = useState<string>('');
  const [newEventName, setNewEventName] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  
  // Effect to simulate upload progress (would be real upload in production)
  useEffect(() => {
    if (uploading && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress(prev => Math.min(prev + 10, 100));
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (uploading && uploadProgress === 100) {
      // Reset after "upload" completes
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        refreshGallery();
      }, 1000);
    }
  }, [uploading, uploadProgress, refreshGallery]);

  // Filter media based on active filter
  const getAllMedia = () => {
    let allMedia: MediaItem[] = [];
    
    // Check if events data is loaded
    if (!eventsData || eventsData.length === 0) {
      console.log('No events data available');
      return [];
    }
    
    // Extract all media from all events
    eventsData.forEach(event => {
      if (event.media && event.media.length > 0) {
        const eventMedia = event.media.map(m => {
          // Ensure the media item has the correct type
          if (!m.type) {
            console.warn('Media item missing type:', m);
            return { ...m, type: 'image', event: event.name }; // Default to image if no type
          }
          return { ...m, event: event.name };
        });
        allMedia = [...allMedia, ...eventMedia];
      }
    });
    
    console.log('Total media items before filtering:', allMedia.length, allMedia);
    console.log('Current media filter:', mediaFilter);
    
    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allMedia = allMedia.filter(item => 
        (item.title && item.title.toLowerCase().includes(query)) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.event && item.event.toLowerCase().includes(query))
      );
      console.log('Media items after search filter:', allMedia.length);
    }
    
    // Apply media type filter with enhanced logging
    let filteredMedia = [...allMedia]; // Create a new array to avoid reference issues
    if (mediaFilter === 'photos') {
      console.log('Filtering for photos only...');
      filteredMedia = allMedia.filter(item => {
        const isImage = item.type === 'image';
        if (!isImage) {
          console.log('Filtered out non-image:', item);
        }
        return isImage;
      });
      console.log('Photos after filtering:', filteredMedia.length);
    } else if (mediaFilter === 'videos') {
      console.log('Filtering for videos only...');
      filteredMedia = allMedia.filter(item => {
        const isVideo = item.type === 'video';
        if (!isVideo) {
          console.log('Filtered out non-video:', item);
        }
        return isVideo;
      });
      console.log('Videos after filtering:', filteredMedia.length);
    }
    
    console.log('Final media items after all filtering:', filteredMedia.length, filteredMedia);
    
    // Make sure we always return an array
    return Array.isArray(filteredMedia) ? filteredMedia : [];
  };
  
  // Get media for active event
  const getEventMedia = () => {
    if (!activeEvent) {
      console.log('No active event selected');
      return [];
    }
    
    const event = eventsData.find(e => e.name === activeEvent);
    if (!event) {
      console.log('Event not found:', activeEvent);
      return [];
    }
    
    console.log('Active event:', event.name);
    
    let filteredMedia = event.media || [];
    console.log('Media items in event before filtering:', filteredMedia.length);
    
    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMedia = filteredMedia.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description?.toLowerCase().includes(query)
      );
      console.log('Media items after search filter:', filteredMedia.length);
    }
    
    // Apply media type filter
    let result = filteredMedia;
    if (mediaFilter === 'photos') {
      result = filteredMedia.filter(item => item.type === 'image');
      console.log('Photos after filtering:', result.length);
    } else if (mediaFilter === 'videos') {
      result = filteredMedia.filter(item => item.type === 'video');
      console.log('Videos after filtering:', result.length);
    }
    
    console.log('Final event media items after all filtering:', result.length);
    return result;
  };

  // Simulate file upload
  const handleFileUpload = () => {
    setUploading(true);
    setUploadProgress(0);
  };
  
  // Media viewer component
  const MediaViewer = ({ item }: { item: MediaItem }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="max-w-5xl w-full max-h-screen p-4">
          <div className="bg-black rounded-lg overflow-hidden border border-blue-900/30">
            <div className="relative">
              {item.type === 'image' ? (
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full object-contain max-h-[70vh]"
                />
              ) : (
                <div className="aspect-video bg-black flex items-center justify-center">
                  {/* This would be a video player in production */}
                  <img 
                    src={item.src} 
                    alt={item.alt} 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 bg-black/70 p-1 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="text-white text-xl font-orbitron">{item.title}</h3>
              <p className="text-gray-400 mt-1">{item.description}</p>
              
              <div className="flex items-center mt-3">
                <div className="bg-blue-900/30 px-2 py-1 rounded text-xs text-blue-400">
                  {item.event}
                </div>
                {item.type === 'video' && (
                  <div className="ml-2 bg-red-900/30 px-2 py-1 rounded text-xs text-red-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Video
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-black pb-16">
      {/* Header with F1-style dashboard */}
      <header className="pt-8 pb-6 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-blue-400 font-orbitron text-3xl md:text-4xl">
                GoTime Motorsports Gallery
              </h1>
              <p className="text-gray-400 mt-2">
                {activeTab === 'official' 
                  ? 'Memorable moments from our exclusive events and drives' 
                  : 'Create and manage your personal gallery of driving memories'}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button 
                onClick={() => {
                  // Use navigate directly for more reliable navigation
                  setLocation('/');
                  // Also scroll to top
                  window.scrollTo(0, 0);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Return Home</span>
              </button>
            </div>
          </div>
          
          {/* Gallery type tabs */}
          <div className="mb-6">
            <div className="inline-flex bg-black/60 rounded-lg overflow-hidden border border-gray-800">
              <button
                onClick={() => {
                  setActiveTab('official');
                  switchToOfficialGallery();
                  setActiveEvent(null);
                }}
                className={`px-5 py-2.5 font-orbitron flex items-center ${
                  activeTab === 'official' 
                    ? 'bg-blue-900/40 text-blue-400 border-b-2 border-blue-500' 
                    : 'text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                OFFICIAL GALLERY
              </button>
              <button
                onClick={() => {
                  setActiveTab('personal');
                  switchToUserGallery(currentUserId);
                  setActiveEvent(null);
                }}
                className={`px-5 py-2.5 font-orbitron flex items-center ${
                  activeTab === 'personal' 
                    ? 'bg-green-900/40 text-green-400 border-b-2 border-green-500' 
                    : 'text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                MY GALLERY
              </button>
            </div>
          </div>
          
          {/* Controls bar */}
          <div className="bg-black/60 rounded-lg p-3 border border-blue-900/30 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex bg-black/60 rounded overflow-hidden border border-gray-800">
                <button
                  onClick={() => setActiveView('events')}
                  className={`px-3 py-1.5 text-sm flex items-center ${activeView === 'events' ? 'bg-green-800/30 text-green-400' : 'text-gray-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Events
                </button>
                <button
                  onClick={() => setActiveView('grid')}
                  className={`px-3 py-1.5 text-sm flex items-center ${activeView === 'grid' ? 'bg-green-800/30 text-green-400' : 'text-gray-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Media Grid
                </button>
              </div>
              
              <div className="flex bg-black/60 rounded overflow-hidden border border-gray-800">
                <button
                  onClick={() => {
                    console.log('Setting filter to ALL');
                    setMediaFilter('all');
                    // Force grid view when changing filter
                    if (activeView !== 'grid') {
                      setActiveView('grid');
                    }
                  }}
                  className={`px-3 py-1.5 text-sm ${mediaFilter === 'all' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    console.log('Setting filter to PHOTOS');
                    setMediaFilter('photos');
                    // Force grid view when changing filter
                    if (activeView !== 'grid') {
                      setActiveView('grid');
                    }
                  }}
                  className={`px-3 py-1.5 text-sm ${mediaFilter === 'photos' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                >
                  Photos
                </button>
                <button
                  onClick={() => {
                    console.log('Setting filter to VIDEOS');
                    setMediaFilter('videos');
                    // Force grid view when changing filter
                    if (activeView !== 'grid') {
                      setActiveView('grid');
                    }
                  }}
                  className={`px-3 py-1.5 text-sm ${mediaFilter === 'videos' ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
                >
                  Videos
                </button>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/60 border border-gray-800 rounded-lg py-2 pl-10 pr-4 w-full md:w-64 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Gallery Management Panel - different for official vs personal */}
        {activeTab === 'official' ? (
          /* Official Gallery - Admin panel (view only for regular users) */
          <div className="mb-8 bg-gray-900/40 rounded-lg border border-blue-900/20 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-blue-400 font-orbitron text-lg">Official Gallery Management</h2>
                <p className="text-gray-400 text-sm">GoTime Motorsports official event gallery</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setActiveTab('personal')}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  <span>Create My Gallery</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center p-2 bg-black/30 rounded border border-blue-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="text-sm text-gray-400">
                Only official GoTime administrators can add content to the official gallery.
                Switch to "My Gallery" to create and manage your personal collection.
              </span>
            </div>
          </div>
        ) : (
          /* Personal Gallery - Full management panel */
          <div className="mb-8 bg-green-900/20 rounded-lg border border-green-900/20 p-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-green-400 font-orbitron text-lg">My Gallery Management</h2>
                <p className="text-gray-400 text-sm">Create, upload and organize your personal automotive memories</p>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  disabled={uploading}
                  className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload Media</span>
                </button>
                
                <button 
                  onClick={() => setShowNewEventModal(true)}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
                  </svg>
                  <span>Create Event</span>
                </button>
              </div>
            </div>
            
            {/* Security info */}
            <div className="mt-4 flex items-center p-2 bg-black/30 rounded border border-green-900/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span className="text-sm text-gray-400">
                Your gallery uses enterprise-grade security with encrypted storage and secure access controls.
                <span className="ml-1 text-green-400 hover:underline cursor-pointer">Upgrade security settings</span>
              </span>
            </div>
            
            {/* Upload progress bar */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Uploading media...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {loadingGallery ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-t-2 border-l-2 border-blue-500 rounded-full animate-spin"></div>
              <span className="mt-4 text-blue-400 font-orbitron">Loading Gallery Data</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className="text-red-400 font-orbitron text-lg mt-2">Gallery Error</h3>
            <p className="text-gray-300 mt-1">{error}</p>
            <button 
              onClick={refreshGallery}
              className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        ) : activeView === 'events' ? (
          <div>
            {/* Event view */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <h2 className="text-white font-orbitron text-2xl">
                {activeEvent ? activeEvent : activeTab === 'official' ? 'Motorsport Events' : 'My Events'}
              </h2>
              
              {activeEvent && (
                <button
                  onClick={() => setActiveEvent(null)}
                  className="text-blue-400 flex items-center gap-1 hover:text-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5"></path>
                    <path d="M12 19l-7-7 7-7"></path>
                  </svg>
                  <span>Back to Events</span>
                </button>
              )}
            </div>
            
            {!activeEvent ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'official' ? (
                  // Official gallery events
                  eventsData.map((event, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900/30 border border-gray-800 hover:border-blue-900/40 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
                      onClick={() => setActiveEvent(event.name)}
                    >
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={event.cover} 
                          alt={event.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="p-4">
                        <div className="text-xs text-blue-400 font-orbitron mb-1">{event.date}</div>
                        <h3 className="text-white font-orbitron text-xl">{event.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{event.location}</p>
                        <p className="text-gray-500 mt-3 text-sm">{event.description}</p>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-blue-300 text-xs font-orbitron">
                            {event.media.length} MEDIA ITEMS
                          </div>
                          <div className="flex items-center text-green-400 text-sm">
                            <span>View Event</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14"></path>
                              <path d="M12 5l7 7-7 7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // User's personal gallery events
                  currentUserGallery?.events && currentUserGallery.events.length > 0 ? (
                    currentUserGallery.events.map((event, index) => (
                      <div 
                        key={index}
                        className="bg-gray-900/30 border border-gray-800 hover:border-green-900/40 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer"
                        onClick={() => setActiveEvent(event.name)}
                      >
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={event.cover} 
                            alt={event.name} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          {event.isPrivate && (
                            <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="text-xs text-green-400 font-orbitron mb-1">{event.date}</div>
                          <h3 className="text-white font-orbitron text-xl">{event.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{event.location}</p>
                          <p className="text-gray-500 mt-3 text-sm">{event.description}</p>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-green-300 text-xs font-orbitron">
                              {event.media.length} ITEMS
                            </div>
                            <div className="flex justify-end gap-2">
                              <button className="p-1 bg-black/40 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 20h9"></path>
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                              </button>
                              <div className="flex items-center text-green-400 text-sm">
                                <span>View</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5l7 7-7 7"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 bg-black/20 border border-green-900/10 rounded-lg p-10 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500/50 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      <h3 className="text-green-400 font-orbitron text-xl mt-4">Create Your First Event</h3>
                      <p className="text-gray-400 mt-2 max-w-md mx-auto">
                        Create an event to organize your media. You can add photos, videos, documents, and audio recordings to your events.
                      </p>
                      <button 
                        onClick={() => setShowNewEventModal(true)}
                        className="mt-6 bg-green-700 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                      >
                        Create Event
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {getEventMedia().length > 0 ? getEventMedia().map((media, index) => (
                  <div 
                    key={index} 
                    className="group bg-gray-900/30 border border-gray-800 hover:border-blue-500/30 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setSelectedMedia(media)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={media.src} 
                        alt={media.alt} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {media.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <h4 className="text-white font-orbitron text-sm truncate">{media.title}</h4>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p className="mt-4 text-gray-400">No media found with current filters</p>
                    <button 
                      onClick={() => {
                        setMediaFilter('all');
                        setSearchQuery('');
                      }}
                      className="mt-3 text-blue-400 hover:text-blue-300"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Grid view of all media */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-orbitron text-2xl">Media Library</h2>
              
              <div className="text-gray-400 text-sm">
                {getAllMedia().length} items
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getAllMedia().length > 0 ? getAllMedia().map((media, index) => (
                <div 
                  key={index} 
                  className="group bg-gray-900/30 border border-gray-800 hover:border-blue-500/30 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedMedia(media)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={media.src} 
                      alt={media.alt} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {media.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <h4 className="text-white font-orbitron text-sm truncate">{media.title}</h4>
                      <p className="text-gray-400 text-xs">{media.event}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p className="mt-4 text-gray-400">No media found with current filters</p>
                  <button 
                    onClick={() => {
                      setMediaFilter('all');
                      setSearchQuery('');
                    }}
                    className="mt-3 text-blue-400 hover:text-blue-300"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Media viewer */}
      {selectedMedia && <MediaViewer item={selectedMedia} />}
      
      {/* Media Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-lg border border-green-900/30 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-400 font-orbitron text-xl">Upload Media</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="bg-black/40 p-1 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Select Event
              </label>
              <select 
                value={uploadEventId}
                onChange={(e) => setUploadEventId(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select an event</option>
                {currentUserGallery?.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Upload Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-900/30 border border-blue-900/30 hover:bg-blue-900/40 text-blue-400 py-2 px-4 rounded flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>File Upload</span>
                </button>
                <button className="bg-green-900/30 border border-green-900/30 hover:bg-green-900/40 text-green-400 py-2 px-4 rounded flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>URL Import</span>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Import from URL
              </label>
              <input
                type="text"
                value={urlToImport}
                onChange={(e) => setUrlToImport(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Media Type
              </label>
              <select 
                value={fileTypeToImport}
                onChange={(e) => setFileTypeToImport(e.target.value as MediaItem['type'])}
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="image">Photo</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="audio">Voice Recording</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (uploadEventId && urlToImport) {
                    // Simulate URL import
                    setUploading(true);
                    setUploadProgress(0);
                    
                    // In a real app, this would call importMediaFromUrl
                    // For demo purposes, we'll just simulate the upload
                    setTimeout(() => {
                      setShowUploadModal(false);
                    }, 2000);
                  }
                }}
                disabled={!uploadEventId || !urlToImport}
                className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                Import Media
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 rounded-lg border border-blue-900/30 p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-400 font-orbitron text-xl">Create New Event</h3>
              <button 
                onClick={() => setShowNewEventModal(false)}
                className="bg-black/40 p-1 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Event Name*
              </label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., My Track Day at VIR"
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Location*
              </label>
              <input
                type="text"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                placeholder="e.g., Virginia International Raceway"
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Date*
              </label>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Describe your event..."
                rows={3}
                className="w-full bg-black border border-gray-800 rounded py-2 px-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowNewEventModal(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newEventName && newEventLocation && newEventDate) {
                    // Create a new event
                    const newEvent: EventGroup = {
                      id: `user-event-${Date.now()}`,
                      name: newEventName,
                      date: new Date(newEventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      location: newEventLocation,
                      description: newEventDescription,
                      cover: "/assets/gallery/default-event-cover.jpg", // Default cover image
                      media: [],
                      isUserGenerated: true,
                      owner: currentUserId,
                      isPrivate: false,
                      securityLevel: 'standard'
                    };
                    
                    // Add the event to the user's gallery
                    addUserEvent(currentUserId, newEvent);
                    
                    // Close the modal and reset form
                    setShowNewEventModal(false);
                    setNewEventName('');
                    setNewEventLocation('');
                    setNewEventDate('');
                    setNewEventDescription('');
                  }
                }}
                disabled={!newEventName || !newEventLocation || !newEventDate}
                className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* F1-style bottom telemetry bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-blue-900/30 p-1.5 flex justify-between items-center z-40">
        <div className="text-xs text-blue-400 font-orbitron ml-2 flex items-center">
          <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
          GALLERY TELEMETRY
        </div>
        
        <div className="flex items-center divide-x divide-gray-800">
          {activeTab === 'official' ? (
            <>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">EVENTS:</span>
                <span className="text-xs text-green-400">{eventsData.length}</span>
              </div>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">PHOTOS:</span>
                <span className="text-xs text-green-400">
                  {eventsData.reduce((count, event) => count + event.media.filter(m => m.type === 'image').length, 0)}
                </span>
              </div>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">VIDEOS:</span>
                <span className="text-xs text-green-400">
                  {eventsData.reduce((count, event) => count + event.media.filter(m => m.type === 'video').length, 0)}
                </span>
              </div>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">FEATURED:</span>
                <span className="text-xs text-green-400">{featuredMedia.length}</span>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">MY EVENTS:</span>
                <span className="text-xs text-green-400">{currentUserGallery?.events?.length || 0}</span>
              </div>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">MY MEDIA:</span>
                <span className="text-xs text-green-400">
                  {currentUserGallery?.events?.reduce((count, event) => count + event.media.length, 0) || 0}
                </span>
              </div>
              <div className="px-3 flex items-center">
                <span className="text-xs text-gray-500 mr-1">SECURITY:</span>
                <span className="text-xs text-green-400">{currentUserGallery?.securitySettings?.defaultSecurityLevel || 'standard'}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="text-xs text-gray-400 mr-2">
          <span className="text-blue-400">SYNC:</span> ACTIVE
        </div>
      </div>
    </div>
  );
};

export default MotorsportsGalleryPage;