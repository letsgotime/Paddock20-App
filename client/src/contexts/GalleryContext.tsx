import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define data interfaces
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  src: string;
  alt: string;
  title: string;
  description?: string;
  event?: string;
  date?: string;
  featured?: boolean;
  thumbnail?: string;
  owner?: string; // ID of the user who owns this media
  secured?: boolean; // If the media has additional security
  tags?: string[]; // For searchability
  fileSize?: number; // Size in bytes
  duration?: number; // For audio/video in seconds
  mimetype?: string; // For proper handling of different file types
  externalSource?: string; // URL source if imported from external link
}

export interface EventGroup {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  cover: string;
  media: MediaItem[];
  isUserGenerated?: boolean; // Whether this is a user-created event
  owner?: string; // User ID of the owner
  isPrivate?: boolean; // If this gallery is private
  accessList?: string[]; // Users who can access if private
  securityLevel?: 'standard' | 'enhanced' | 'enterprise'; // Security tier
}

export interface UserGallery {
  userId: string;
  displayName: string;
  profileImage?: string;
  events: EventGroup[];
  featuredMedia: MediaItem[];
  securitySettings: {
    defaultPrivacy: 'public' | 'private' | 'shared';
    defaultSecurityLevel: 'standard' | 'enhanced' | 'enterprise';
    twoFactorEnabled: boolean;
    encryptionEnabled: boolean;
  };
}

// Define context type
interface GalleryContextType {
  // Official gallery data
  eventsData: EventGroup[];
  featuredMedia: MediaItem[];
  loadingGallery: boolean;
  error: string | null;
  
  // User gallery data
  userGalleries: UserGallery[];
  currentUserGallery: UserGallery | null;
  
  // Actions
  refreshGallery: () => void;
  addEvent: (event: EventGroup) => void;
  addMediaToEvent: (eventName: string, media: MediaItem) => void;
  setMediaAsFeatured: (mediaId: string, featured: boolean) => void;
  
  // User gallery actions
  createUserGallery: (userId: string, displayName: string) => void;
  switchToUserGallery: (userId: string) => void;
  switchToOfficialGallery: () => void;
  addUserEvent: (userId: string, event: EventGroup) => void;
  addUserMedia: (userId: string, eventId: string, media: MediaItem) => void;
  setUserMediaAsFeatured: (userId: string, mediaId: string, featured: boolean) => void;
  importMediaFromUrl: (userId: string, eventId: string, url: string, type: MediaItem['type']) => Promise<MediaItem | null>;
}

// Create the context
const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

// Define the provider component
interface GalleryProviderProps {
  children: ReactNode;
}

export const GalleryProvider: React.FC<GalleryProviderProps> = ({ children }) => {
  // Official Gallery state
  const [eventsData, setEventsData] = useState<EventGroup[]>([]);
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // User Gallery state
  const [userGalleries, setUserGalleries] = useState<UserGallery[]>([]);
  const [currentUserGallery, setCurrentUserGallery] = useState<UserGallery | null>(null);
  const [userGalleryLoading, setUserGalleryLoading] = useState<boolean>(false);
  const [userGalleryError, setUserGalleryError] = useState<string | null>(null);
  
  // Sample data initialization - in production this would fetch from an API or database
  useEffect(() => {
    loadGalleryData();
    // Initialize with a sample user gallery for demo purposes
    initSampleUserGallery();
  }, []);

  const initSampleUserGallery = () => {
    const sampleUserGallery: UserGallery = {
      userId: 'demo-user',
      displayName: 'Demo User',
      profileImage: '/assets/gallery/user-profile.jpg',
      events: [
        {
          id: 'user-event-1',
          name: "My Track Day",
          date: "May 5, 2023",
          location: "Road Atlanta",
          description: "Personal track day with friends at Road Atlanta.",
          cover: "/assets/gallery/porsche-911-gt2-5795128_1280.jpg",
          isUserGenerated: true,
          owner: 'demo-user',
          isPrivate: false,
          securityLevel: 'standard',
          media: [
            {
              id: "user-1",
              type: "image",
              src: "/assets/gallery/porsche-911-gt2-5795128_1280.jpg",
              alt: "Porsche 911 GT2",
              title: "My Porsche at the Track",
              description: "Taking the Porsche out for a spin at Road Atlanta",
              event: "My Track Day",
              featured: true,
              owner: 'demo-user'
            }
          ]
        }
      ],
      featuredMedia: [
        {
          id: "user-1",
          type: "image",
          src: "/assets/gallery/porsche-911-gt2-5795128_1280.jpg",
          alt: "Porsche 911 GT2",
          title: "My Porsche at the Track",
          description: "Taking the Porsche out for a spin at Road Atlanta",
          event: "My Track Day",
          featured: true,
          owner: 'demo-user'
        }
      ],
      securitySettings: {
        defaultPrivacy: 'public',
        defaultSecurityLevel: 'standard',
        twoFactorEnabled: false,
        encryptionEnabled: false
      }
    };
    
    setUserGalleries([sampleUserGallery]);
  };

  const loadGalleryData = async () => {
    setLoadingGallery(true);
    setError(null);

    try {
      // This is where you would fetch data from your API
      // For now, we'll use static data
      const data: EventGroup[] = [
        {
          id: 'official-event-1',
          name: "Charlotte Cars & Coffee",
          date: "April 15, 2023",
          location: "Charlotte, NC",
          description: "Monthly gathering of exotic and performance cars in the heart of Charlotte.",
          cover: "/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg",
          media: [
            {
              id: "cc-1",
              type: "image",
              src: "/assets/gallery/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg",
              alt: "Ferrari 458 With HRE P101 Wheels",
              title: "Ferrari 458",
              description: "Custom HRE P101 wheels by TAG Motorsports",
              event: "Charlotte Cars & Coffee",
              featured: true
            },
            {
              id: "cc-2",
              type: "image",
              src: "/assets/gallery/ferrari-mountain-road.png",
              alt: "Ferrari on mountain road",
              title: "Mountain Run",
              description: "Precision engineering meets the perfect road",
              event: "Charlotte Cars & Coffee"
            },
            {
              id: "cc-3",
              type: "video",
              src: "/assets/gallery/ferrari-f1.png", // This would be a video URL in production
              alt: "Ferrari F1 Race Car",
              title: "F1 Sound Check",
              description: "Listen to the incredible sounds of this F1-inspired engine",
              event: "Charlotte Cars & Coffee"
            }
          ]
        },
        {
          id: 'official-event-2',
          name: "Tail of the Dragon Run",
          date: "May 22, 2023",
          location: "Deals Gap, NC",
          description: "Epic mountain run through one of America's most challenging roads.",
          cover: "/assets/gallery/ferrari-mountain-road.png",
          media: [
            {
              id: "td-1",
              type: "image",
              src: "/assets/gallery/ferrari-mountain-road.png",
              alt: "Ferrari on mountain road",
              title: "Dragon's Curve",
              description: "Taking on the infamous curves of Tail of the Dragon",
              event: "Tail of the Dragon Run",
              featured: true
            },
            {
              id: "td-2",
              type: "video",
              src: "/assets/gallery/mclaren-4184249_1280.jpg", // This would be a video URL in production
              alt: "McLaren supercar run",
              title: "McLaren Mountain Run",
              description: "In-car footage of the McLaren tackling Tail of the Dragon",
              event: "Tail of the Dragon Run"
            },
            {
              id: "td-3",
              type: "image",
              src: "/assets/gallery/ferrari-desert.png",
              alt: "Ferrari in scenic view",
              title: "Vista Point",
              description: "Taking in the spectacular mountain views",
              event: "Tail of the Dragon Run"
            }
          ]
        },
        {
          id: 'official-event-3',
          name: "Track Day at VIR",
          date: "June 10, 2023",
          location: "Virginia International Raceway",
          description: "Full day of high-performance driving at one of America's premier road courses.",
          cover: "/assets/gallery/race-car-8338236_1280.jpg",
          media: [
            {
              id: "vir-1",
              type: "image",
              src: "/assets/gallery/race-car-8338236_1280.jpg",
              alt: "Race car on track",
              title: "Track Attack",
              description: "Full-throttle action at Virginia International Raceway",
              event: "Track Day at VIR",
              featured: true
            },
            {
              id: "vir-2",
              type: "video",
              src: "/assets/gallery/redbull-f1-motion.jpg", // This would be a video URL in production
              alt: "Red Bull F1 car in motion",
              title: "Hot Lap",
              description: "POV footage of a blistering hot lap at VIR",
              event: "Track Day at VIR"
            },
            {
              id: "vir-3",
              type: "image",
              src: "/assets/gallery/porsche-911-gt2-5795128_1280.jpg",
              alt: "Porsche 911 GT2",
              title: "Porsche Paddock",
              description: "Porsche lineup in the paddock before track time",
              event: "Track Day at VIR"
            },
            {
              id: "vir-4",
              type: "document",
              src: "/assets/gallery/sample-document.pdf", // Placeholder - would be real doc in production
              alt: "Track Map",
              title: "VIR Track Map",
              description: "Detailed track map with turn numbers and braking points",
              event: "Track Day at VIR"
            },
            {
              id: "vir-5",
              type: "audio",
              src: "/assets/gallery/sample-audio.mp3", // Placeholder - would be real audio in production
              alt: "Engine Sound",
              title: "V12 Engine Sound",
              description: "Amazing V12 engine sound recorded during the event",
              event: "Track Day at VIR",
              duration: 45
            }
          ]
        }
      ];

      setEventsData(data);

      // Extract featured media
      const featured: MediaItem[] = [];
      data.forEach(event => {
        event.media.forEach(item => {
          if (item.featured) {
            featured.push({ ...item, event: event.name });
          }
        });
      });
      
      setFeaturedMedia(featured);
      setLoadingGallery(false);
    } catch (err) {
      console.error('Error loading gallery data:', err);
      setError('Failed to load gallery data');
      setLoadingGallery(false);
    }
  };

  const refreshGallery = () => {
    loadGalleryData();
  };

  const addEvent = (event: EventGroup) => {
    setEventsData(prev => [...prev, event]);
    
    // Update featured media if any
    const newFeatured = event.media.filter(item => item.featured);
    if (newFeatured.length > 0) {
      setFeaturedMedia(prev => [...prev, ...newFeatured.map(item => ({ ...item, event: event.name }))]);
    }
  };

  const addMediaToEvent = (eventName: string, media: MediaItem) => {
    setEventsData(prev => {
      const newEvents = [...prev];
      const eventIndex = newEvents.findIndex(e => e.name === eventName);
      
      if (eventIndex >= 0) {
        newEvents[eventIndex] = {
          ...newEvents[eventIndex],
          media: [...newEvents[eventIndex].media, media]
        };
      }
      
      return newEvents;
    });
    
    // Update featured media if needed
    if (media.featured) {
      setFeaturedMedia(prev => [...prev, { ...media, event: eventName }]);
    }
  };

  const setMediaAsFeatured = (mediaId: string, featured: boolean) => {
    // Update in events data
    setEventsData(prev => {
      const newEvents = [...prev];
      
      for (let i = 0; i < newEvents.length; i++) {
        const mediaIndex = newEvents[i].media.findIndex(m => m.id === mediaId);
        
        if (mediaIndex >= 0) {
          const updatedMedia = [...newEvents[i].media];
          updatedMedia[mediaIndex] = {
            ...updatedMedia[mediaIndex],
            featured
          };
          
          newEvents[i] = {
            ...newEvents[i],
            media: updatedMedia
          };
          
          break;
        }
      }
      
      return newEvents;
    });
    
    // Update featured media list
    if (featured) {
      // Find the media item in events data
      let mediaItem: MediaItem | undefined;
      let eventName: string | undefined;
      
      for (const event of eventsData) {
        const found = event.media.find(m => m.id === mediaId);
        if (found) {
          mediaItem = found;
          eventName = event.name;
          break;
        }
      }
      
      if (mediaItem && eventName) {
        setFeaturedMedia(prev => [...prev, { ...mediaItem, event: eventName }]);
      }
    } else {
      setFeaturedMedia(prev => prev.filter(item => item.id !== mediaId));
    }
  };
  
  // User Gallery Methods
  const createUserGallery = (userId: string, displayName: string) => {
    // Check if user gallery already exists
    if (userGalleries.some(gallery => gallery.userId === userId)) {
      return;
    }
    
    const newUserGallery: UserGallery = {
      userId,
      displayName,
      events: [],
      featuredMedia: [],
      securitySettings: {
        defaultPrivacy: 'public',
        defaultSecurityLevel: 'standard',
        twoFactorEnabled: false,
        encryptionEnabled: false
      }
    };
    
    setUserGalleries(prev => [...prev, newUserGallery]);
  };
  
  const switchToUserGallery = (userId: string) => {
    const gallery = userGalleries.find(g => g.userId === userId);
    if (gallery) {
      setCurrentUserGallery(gallery);
    }
  };
  
  const switchToOfficialGallery = () => {
    setCurrentUserGallery(null);
  };
  
  const addUserEvent = (userId: string, event: EventGroup) => {
    setUserGalleries(prev => {
      const newGalleries = [...prev];
      const galleryIndex = newGalleries.findIndex(g => g.userId === userId);
      
      if (galleryIndex >= 0) {
        newGalleries[galleryIndex] = {
          ...newGalleries[galleryIndex],
          events: [...newGalleries[galleryIndex].events, event]
        };
        
        // Update currentUserGallery if needed
        if (currentUserGallery?.userId === userId) {
          setCurrentUserGallery(newGalleries[galleryIndex]);
        }
      }
      
      return newGalleries;
    });
  };
  
  const addUserMedia = (userId: string, eventId: string, media: MediaItem) => {
    setUserGalleries(prev => {
      const newGalleries = [...prev];
      const galleryIndex = newGalleries.findIndex(g => g.userId === userId);
      
      if (galleryIndex >= 0) {
        const eventIndex = newGalleries[galleryIndex].events.findIndex(e => e.id === eventId);
        
        if (eventIndex >= 0) {
          const updatedEvents = [...newGalleries[galleryIndex].events];
          updatedEvents[eventIndex] = {
            ...updatedEvents[eventIndex],
            media: [...updatedEvents[eventIndex].media, media]
          };
          
          newGalleries[galleryIndex] = {
            ...newGalleries[galleryIndex],
            events: updatedEvents
          };
          
          // Update featured media if needed
          if (media.featured) {
            newGalleries[galleryIndex] = {
              ...newGalleries[galleryIndex],
              featuredMedia: [
                ...newGalleries[galleryIndex].featuredMedia,
                { ...media, event: updatedEvents[eventIndex].name }
              ]
            };
          }
          
          // Update currentUserGallery if needed
          if (currentUserGallery?.userId === userId) {
            setCurrentUserGallery(newGalleries[galleryIndex]);
          }
        }
      }
      
      return newGalleries;
    });
  };
  
  const setUserMediaAsFeatured = (userId: string, mediaId: string, featured: boolean) => {
    setUserGalleries(prev => {
      const newGalleries = [...prev];
      const galleryIndex = newGalleries.findIndex(g => g.userId === userId);
      
      if (galleryIndex < 0) return prev;
      
      const gallery = newGalleries[galleryIndex];
      
      // Find the media in the events
      let mediaItem: MediaItem | undefined;
      let eventName: string | undefined;
      
      // Search through all events for this media
      for (let i = 0; i < gallery.events.length; i++) {
        const event = gallery.events[i];
        const mediaIndex = event.media.findIndex(m => m.id === mediaId);
        
        if (mediaIndex >= 0) {
          // Update the featured flag in the event's media
          const updatedMedia = [...event.media];
          updatedMedia[mediaIndex] = {
            ...updatedMedia[mediaIndex],
            featured
          };
          
          // Update the event with the updated media
          const updatedEvents = [...gallery.events];
          updatedEvents[i] = {
            ...event,
            media: updatedMedia
          };
          
          mediaItem = updatedMedia[mediaIndex];
          eventName = event.name;
          
          // Update the gallery with the updated events
          newGalleries[galleryIndex] = {
            ...gallery,
            events: updatedEvents
          };
          
          break;
        }
      }
      
      // Update featured media list
      if (featured && mediaItem && eventName) {
        // Add to featured media
        newGalleries[galleryIndex] = {
          ...newGalleries[galleryIndex],
          featuredMedia: [
            ...newGalleries[galleryIndex].featuredMedia, 
            { ...mediaItem, event: eventName }
          ]
        };
      } else {
        // Remove from featured media
        newGalleries[galleryIndex] = {
          ...newGalleries[galleryIndex],
          featuredMedia: newGalleries[galleryIndex].featuredMedia.filter(item => item.id !== mediaId)
        };
      }
      
      // Update currentUserGallery if needed
      if (currentUserGallery?.userId === userId) {
        setCurrentUserGallery(newGalleries[galleryIndex]);
      }
      
      return newGalleries;
    });
  };
  
  // Function to import media from URL
  const importMediaFromUrl = async (userId: string, eventId: string, url: string, type: MediaItem['type']) => {
    try {
      // In a real app, this would call a backend service to fetch and process the URL
      // For now, we'll simulate this with a delay
      
      // Create a unique ID for the media
      const mediaId = `imported-${Date.now()}`;
      
      // Set placeholder data
      const newMedia: MediaItem = {
        id: mediaId,
        type,
        src: url, // In a real implementation, this would be a processed/stored version of the URL
        alt: "Imported media",
        title: "Imported media",
        description: "Imported from URL",
        owner: userId,
        externalSource: url
      };
      
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add media to user's event
      addUserMedia(userId, eventId, newMedia);
      
      return newMedia;
    } catch (err) {
      console.error('Error importing media from URL:', err);
      return null;
    }
  };
  
  // Check if user is admin (in a real app, this would be determined by auth)
  const isUserAdmin = (userId: string) => {
    // In this demo, we'll consider 'admin-user' as the admin
    return userId === 'admin-user';
  };
  
  const value = {
    // Official gallery data
    eventsData,
    featuredMedia,
    loadingGallery,
    error,
    
    // User gallery data
    userGalleries,
    currentUserGallery,
    
    // Actions - restricted by permissions
    refreshGallery,
    addEvent: (event: EventGroup) => {
      // Only admin can add events to official gallery
      if (event.owner && isUserAdmin(event.owner)) {
        addEvent(event);
      } else {
        console.error('Permission denied: Only admins can add events to the official gallery');
      }
    },
    addMediaToEvent: (eventName: string, media: MediaItem) => {
      // Only admin can add media to official gallery
      if (media.owner && isUserAdmin(media.owner)) {
        addMediaToEvent(eventName, media);
      } else {
        console.error('Permission denied: Only admins can add media to the official gallery');
      }
    },
    setMediaAsFeatured,
    
    // User gallery actions - users can only manage their own galleries
    createUserGallery,
    switchToUserGallery,
    switchToOfficialGallery,
    addUserEvent: (userId: string, event: EventGroup) => {
      // Users can only add events to their own gallery
      if (event.owner === userId) {
        addUserEvent(userId, event);
      } else {
        console.error('Permission denied: Users can only add events to their own gallery');
      }
    },
    addUserMedia: (userId: string, eventId: string, media: MediaItem) => {
      // Users can only add media to their own gallery
      if (media.owner === userId) {
        addUserMedia(userId, eventId, media);
      } else {
        console.error('Permission denied: Users can only add media to their own gallery');
      }
    },
    setUserMediaAsFeatured,
    importMediaFromUrl,
    
    // Helper function to check permissions
    isUserAdmin
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};

// Custom hook to use the gallery context
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};