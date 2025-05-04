import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Image, Link, ExternalLink, Camera, Filter, Calendar, ChevronDown, ChevronLeft, ChevronRight, Maximize2, Download, Share2, Heart, Play, Grid, LayoutGrid, Columns, Clock, X } from "lucide-react";
import { getUserDisplayName } from "../utils/DataIntegrityVerifier";

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  eventId?: string;
  eventName?: string;
  collection?: string;
  date: string;
  location?: string;
  photographer?: string;
  tags: string[];
  link?: string;
  featured?: boolean;
  likes?: number;
  views?: number;
  isLiked?: boolean;
  downloadable?: boolean;
  metadata?: {
    camera?: string;
    lens?: string;
    settings?: string;
    dimensions?: string;
  };
  relatedItems?: string[];
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  imageCount: number;
  featuredImage?: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  imageCount: number;
  coverImage: string;
}

// Categories with advanced data for rich filtering and visualization
const categories = [
  { 
    id: "all", 
    name: "All Media",
    icon: <Grid className="w-4 h-4 mr-2" />,
    description: "All media in the gallery"
  },
  { 
    id: "events", 
    name: "Events",
    icon: <Calendar className="w-4 h-4 mr-2" />,
    description: "Official GoTime events and community meetups",
    filterOptions: [
      { type: "date", label: "Year" },
      { type: "location", label: "Location" },
      { type: "tag", label: "Event Type" }
    ]
  },
  { 
    id: "cars", 
    name: "Vehicles",
    icon: <Image className="w-4 h-4 mr-2" />,
    description: "Stunning automotive photography",
    filterOptions: [
      { type: "make", label: "Make" },
      { type: "model", label: "Model" },
      { type: "color", label: "Color" }
    ]
  },
  { 
    id: "lifestyle", 
    name: "Lifestyle",
    icon: <Heart className="w-4 h-4 mr-2" />,
    description: "The GoTime automotive lifestyle",
    filterOptions: [
      { type: "tag", label: "Theme" },
      { type: "location", label: "Location" }
    ]
  },
  { 
    id: "products", 
    name: "Products",
    icon: <Image className="w-4 h-4 mr-2" />,
    description: "GoTime products and merchandise",
    filterOptions: [
      { type: "tag", label: "Product Type" },
      { type: "tag", label: "Collection" }
    ]
  },
  { 
    id: "feedback", 
    name: "Testimonials",
    icon: <Heart className="w-4 h-4 mr-2" />,
    description: "Member testimonials and success stories",
    filterOptions: [
      { type: "tag", label: "Category" },
      { type: "date", label: "Year" }
    ]
  }
];

const views = [
  {
    id: "grid",
    name: "Grid",
    icon: <LayoutGrid className="w-4 h-4" />
  },
  {
    id: "masonry",
    name: "Masonry",
    icon: <Columns className="w-4 h-4" />
  },
  {
    id: "timeline",
    name: "Timeline",
    icon: <Clock className="w-4 h-4" />
  },
  {
    id: "carousel",
    name: "Carousel",
    icon: <Play className="w-4 h-4" />
  }
];

const GoTimeGalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "masonry" | "timeline" | "carousel">("grid");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "popular" | "alphabetical">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // This would normally fetch from a real API that connects to Google Drive
  useEffect(() => {
    // Simulating API call to get content from Google Drive
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        
        // In production, this would be an actual API call to fetch from Google Drive
        // For now, we'll use enhanced mockup data to represent the F1-quality gallery
        
        // Generate events (sorted by date descending - newest first)
        const mockEvents: Event[] = [
          {
            id: "event-1",
            name: "Monaco Grand Prix Weekend",
            date: "2023-05-26",
            location: "Monte Carlo, Monaco",
            description: "An unforgettable weekend at the most prestigious race in the Formula 1 calendar.",
            imageCount: 24,
            featuredImage: "https://images.unsplash.com/photo-1581866327034-c4579a25609a?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "event-2",
            name: "F1 Austin Weekend",
            date: "2023-10-22",
            location: "Austin, TX",
            description: "Experience at the Circuit of the Americas for the United States Grand Prix.",
            imageCount: 18,
            featuredImage: "https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "event-3",
            name: "Summer Detailing Workshop",
            date: "2023-07-15",
            location: "Nashville, TN",
            description: "Professional detailing techniques workshop for GoTime members.",
            imageCount: 12,
            featuredImage: "https://images.unsplash.com/photo-1636458938604-996bf32268d4?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "event-4",
            name: "Cars & Coffee Prestige",
            date: "2023-09-10",
            location: "Beverly Hills, CA",
            description: "Premium cars and coffee meet featuring exotic and luxury vehicles.",
            imageCount: 30,
            featuredImage: "https://images.unsplash.com/photo-1607326957431-29d25d2b386f?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "event-5",
            name: "Italian Grand Prix Experience",
            date: "2023-09-03",
            location: "Monza, Italy",
            description: "The Temple of Speed - experiencing the fastest race on the F1 calendar.",
            imageCount: 22,
            featuredImage: "https://images.unsplash.com/photo-1541443458363-1a98b2bacd98?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "event-6",
            name: "Mountain Drive Rally",
            date: "2023-08-05",
            location: "Aspen, CO",
            description: "A spectacular drive through the Rocky Mountains with the GoTime community.",
            imageCount: 16,
            featuredImage: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&q=80&w=1000"
          }
        ];
        
        // Sort events by date (newest first)
        mockEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Generate collections
        const mockCollections: Collection[] = [
          {
            id: "collection-1",
            name: "Formula 1 Experiences",
            description: "Our community's journey through the pinnacle of motorsport",
            imageCount: 64,
            coverImage: "https://images.unsplash.com/photo-1541443458363-1a98b2bacd98?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "collection-2",
            name: "Porsche Perfection",
            description: "Celebrating the precision engineering of Porsche",
            imageCount: 28,
            coverImage: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&q=80&w=1000"
          },
          {
            id: "collection-3",
            name: "Member Achievements",
            description: "Celebrating our members' automotive accomplishments",
            imageCount: 42,
            coverImage: "https://images.unsplash.com/photo-1553739558-4ef8e399143a?auto=format&fit=crop&q=80&w=1000"
          }
        ];
        
        // Generate enhanced gallery items
        const mockGalleryItems: GalleryItem[] = [
          // Monaco Event
          {
            id: "img-1",
            title: "Monaco Harbor Sunset",
            description: "Beautiful sunset over Monaco harbor during race weekend. The prestigious yachts and historic circuit create an iconic atmosphere unlike any other race.",
            imageUrl: "https://images.unsplash.com/photo-1581866327034-c4579a25609a?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-1",
            eventName: "Monaco Grand Prix Weekend",
            collection: "Formula 1 Experiences",
            date: "2023-05-28",
            location: "Monte Carlo, Monaco",
            photographer: getUserDisplayName(),
            tags: ["F1", "Monaco", "Racing", "Sunset", "Harbor"],
            featured: true,
            likes: 342,
            views: 12540,
            downloadable: true,
            metadata: {
              camera: "Sony A7R IV",
              lens: "24-70mm f/2.8",
              settings: "1/250s, f/5.6, ISO 200",
              dimensions: "6000 x 4000"
            }
          },
          {
            id: "img-2",
            title: "Casino Square",
            description: "The iconic Casino Square turn during Monaco practice sessions.",
            imageUrl: "https://images.unsplash.com/photo-1505739648877-67343d9c2b7b?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-1",
            eventName: "Monaco Grand Prix Weekend",
            collection: "Formula 1 Experiences",
            date: "2023-05-27",
            location: "Monte Carlo, Monaco",
            photographer: "Sarah Wilson",
            tags: ["F1", "Monaco", "Casino Square", "Racing"],
            likes: 287,
            views: 10320
          },
          {
            id: "img-3",
            title: "Monaco Paddock Access",
            description: "Exclusive access to the F1 paddock during Monaco Grand Prix weekend.",
            imageUrl: "https://images.unsplash.com/photo-1518247183771-59b6d3d3bdf4?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-1",
            eventName: "Monaco Grand Prix Weekend",
            collection: "Formula 1 Experiences",
            date: "2023-05-26",
            location: "Monte Carlo, Monaco",
            photographer: "Michael Chen",
            tags: ["F1", "Monaco", "Paddock", "VIP"],
            likes: 215,
            views: 8750
          },
          
          // Porsche
          {
            id: "img-4",
            title: "Porsche 911 GT3",
            description: "The iconic Porsche 911 GT3 at sunset. Pinnacle of engineering excellence and driving precision.",
            imageUrl: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&q=80&w=1000",
            category: "cars",
            date: "2023-06-15",
            location: "Pacific Coast Highway, CA",
            photographer: "James Rodriguez",
            tags: ["Porsche", "911", "GT3", "Sports Car", "Sunset"],
            collection: "Porsche Perfection",
            likes: 412,
            views: 15230,
            downloadable: true,
            metadata: {
              camera: "Canon EOS R5",
              lens: "70-200mm f/2.8",
              settings: "1/500s, f/4, ISO 100",
              dimensions: "8192 x 5464"
            }
          },
          {
            id: "img-5",
            title: "Porsche 911 GT3 RS",
            description: "The track-focused Porsche 911 GT3 RS with its distinctive aerodynamic features.",
            imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000",
            category: "cars",
            date: "2023-04-20",
            location: "Road Atlanta, GA",
            photographer: "Emma Taylor",
            tags: ["Porsche", "911", "GT3 RS", "Track", "Racing"],
            collection: "Porsche Perfection",
            likes: 376,
            views: 13980
          },
          
          // GoTime Event - Workshop
          {
            id: "img-6",
            title: "Detailing Masterclass",
            description: "Exclusive workshop teaching advanced detailing techniques. Expert-led demonstration on paint correction.",
            imageUrl: "https://images.unsplash.com/photo-1636458938604-996bf32268d4?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-3",
            eventName: "Summer Detailing Workshop",
            date: "2023-07-22",
            location: "Nashville, TN",
            photographer: "Robert Black",
            tags: ["Detailing", "Workshop", "Learning", "Paint Correction"],
            likes: 156,
            views: 6840
          },
          {
            id: "img-7",
            title: "Detailing Workshop Group",
            description: "Group photo from our Summer Detailing Workshop in Nashville.",
            imageUrl: "https://images.unsplash.com/photo-1600320254374-ce2d293c324e?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-3",
            eventName: "Summer Detailing Workshop",
            date: "2023-07-22",
            location: "Nashville, TN",
            photographer: "Robert Black",
            tags: ["Detailing", "Workshop", "Group Photo", "Community"],
            likes: 98,
            views: 4250
          },
          
          // McLaren
          {
            id: "img-8",
            title: "McLaren 720S",
            description: "McLaren 720S in signature Papaya Orange. A true masterpiece of British engineering and design.",
            imageUrl: "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?auto=format&fit=crop&q=80&w=1000", 
            category: "cars",
            date: "2023-08-10",
            location: "Miami, FL",
            photographer: "Carlos Vega",
            tags: ["McLaren", "720S", "Supercar", "Exotic", "Orange"],
            likes: 387,
            views: 14320,
            downloadable: true
          },
          
          // Austin F1
          {
            id: "img-9",
            title: "Circuit of the Americas",
            description: "The iconic Turn 1 at Circuit of the Americas during the United States Grand Prix weekend.",
            imageUrl: "https://images.unsplash.com/photo-1520208422220-d12a3c588e6c?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-2",
            eventName: "F1 Austin Weekend",
            collection: "Formula 1 Experiences",
            date: "2023-10-22",
            location: "Austin, TX",
            photographer: "Daniel Washington",
            tags: ["F1", "COTA", "Austin", "Racing", "Turn 1"],
            likes: 276,
            views: 9850
          },
          {
            id: "img-10",
            title: "F1 Paddock Club Austin",
            description: "Exclusive Paddock Club experience at the United States Grand Prix.",
            imageUrl: "https://images.unsplash.com/photo-1541443458363-1a98b2bacd98?auto=format&fit=crop&q=80&w=1000",
            category: "events",
            eventId: "event-2",
            eventName: "F1 Austin Weekend",
            collection: "Formula 1 Experiences",
            date: "2023-10-21",
            location: "Austin, TX",
            photographer: "Lisa Johnson",
            tags: ["F1", "Paddock Club", "VIP", "Austin"],
            likes: 205,
            views: 7620
          },
          
          // Paddock Lounge
          {
            id: "img-11",
            title: "Monza Paddock Lounge",
            description: "Exclusive access to the Paddock20 lounge at Monza during the Italian Grand Prix weekend.",
            imageUrl: "https://images.unsplash.com/photo-1540397106260-e24a507a08ea?auto=format&fit=crop&q=80&w=1000",
            category: "lifestyle",
            eventId: "event-5",
            eventName: "Italian Grand Prix Experience",
            date: "2023-09-03",
            location: "Monza, Italy",
            photographer: "Marco Bianchi",
            tags: ["Paddock", "F1", "Monza", "VIP", "Lounge"],
            likes: 189,
            views: 6750
          },
          
          // Products
          {
            id: "img-12",
            title: "Juice Box Pro Kit",
            description: "Our flagship detailing kit for professional results, featuring our complete range of premium products.",
            imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1000",
            category: "products",
            date: "2023-09-15",
            photographer: "Marketing Team",
            tags: ["Detailing", "Products", "Professional", "Juice Box", "Kit"],
            likes: 167,
            views: 8240
          },
          {
            id: "img-13",
            title: "Ceramic Coating Application",
            description: "Professional application of our signature ceramic coating product.",
            imageUrl: "https://images.unsplash.com/photo-1611745179374-d52785c26961?auto=format&fit=crop&q=80&w=1000",
            category: "products",
            date: "2023-08-25",
            photographer: "Marketing Team",
            tags: ["Ceramic Coating", "Products", "Professional", "Application"],
            likes: 142,
            views: 6150
          },
          
          // Feedback/Testimonials
          {
            id: "img-14",
            title: "Member Success Story: Concours Win",
            description: "GoTime member John's 1967 Ferrari 275 GTB after winning Best in Class at Pebble Beach Concours d'Elegance using our detailing system.",
            imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1000",
            category: "feedback",
            date: "2023-08-20",
            location: "Pebble Beach, CA",
            photographer: "Event Photographer",
            tags: ["Testimonial", "Success Story", "Concours", "Ferrari", "Award"],
            collection: "Member Achievements",
            likes: 312,
            views: 11230
          },
          {
            id: "img-15",
            title: "Track Day Transformation",
            description: "Member testimonial showcasing the before and after of their track car preparation using our system.",
            imageUrl: "https://images.unsplash.com/photo-1526550517342-e086b387edda?auto=format&fit=crop&q=80&w=1000",
            category: "feedback",
            date: "2023-07-30",
            location: "Laguna Seca, CA",
            photographer: "Member Submission",
            tags: ["Testimonial", "Track Day", "Before And After", "Preparation"],
            collection: "Member Achievements",
            likes: 178,
            views: 7840
          }
        ];
        
        setEvents(mockEvents);
        setCollections(mockCollections);
        setGalleryItems(mockGalleryItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching gallery items:", error);
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  // Filter and sort items
  const processItems = () => {
    // Start with basic category filtering
    let processed = [...galleryItems];
    
    // Filter by category
    if (filter !== "all") {
      processed = processed.filter(item => item.category === filter);
    }
    
    // Filter by event if one is selected
    if (selectedEvent) {
      processed = processed.filter(item => item.eventId === selectedEvent);
    }
    
    // Filter by year if selected
    if (yearFilter) {
      processed = processed.filter(item => {
        const itemYear = new Date(item.date).getFullYear().toString();
        return itemYear === yearFilter;
      });
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (item.location && item.location.toLowerCase().includes(query)) ||
        (item.eventName && item.eventName.toLowerCase().includes(query))
      );
    }
    
    // Sort the items
    processed.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return sortOrder === "desc" 
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        case "popular":
          const aPopularity = (a.likes || 0) + (a.views || 0) * 0.01;
          const bPopularity = (b.likes || 0) + (b.views || 0) * 0.01;
          return sortOrder === "desc" ? bPopularity - aPopularity : aPopularity - bPopularity;
        case "alphabetical":
          return sortOrder === "desc" 
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return processed;
  };

  const filteredItems = processItems();

  // Handle carousel navigation
  const navigateCarousel = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentCarouselIndex(prev => 
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else {
      setCurrentCarouselIndex(prev => 
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    }
  };

  // Group items by event for timeline view
  const getEventGroups = () => {
    // First, get unique events present in the filtered items
    const eventIds = [...new Set(filteredItems
      .filter(item => item.eventId)
      .map(item => item.eventId))];
    
    // Map to events with their items
    return events
      .filter(event => eventIds.includes(event.id))
      .map(event => ({
        ...event,
        items: filteredItems.filter(item => item.eventId === event.id)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get available years for filter
  const getYears = () => {
    const years = [...new Set(galleryItems.map(item => 
      new Date(item.date).getFullYear().toString()
    ))];
    return years.sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  const handleImageClick = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Handle clicking on an event in the timeline
  const handleEventClick = (eventId: string) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null); // Deselect if already selected
    } else {
      setSelectedEvent(eventId);
      
      // If there's a timeline scroll ref, scroll to this event
      if (timelineScrollRef.current && filter === "events") {
        const eventElement = document.getElementById(`event-${eventId}`);
        if (eventElement) {
          timelineScrollRef.current.scrollTop = eventElement.offsetTop - 100;
        }
      }
    }
  };

  // Determine if the event is the currently selected event
  const isEventSelected = (eventId: string) => {
    return selectedEvent === eventId;
  };

  // Handle like action
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent image modal from opening
    
    setGalleryItems(prev => prev.map(item => 
      item.id === id ? {
        ...item,
        isLiked: !item.isLiked,
        likes: (item.likes || 0) + (item.isLiked ? -1 : 1)
      } : item
    ));
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with F1-style design */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="font-orbitron text-blue-400 text-4xl mb-2">GoTime Gallery</h1>
            <p className="text-gray-400 max-w-2xl">
              Explore our curated collection of automotive excellence, events, and community moments.
              From prestigious F1 experiences to member achievements, our gallery showcases the GoTime lifestyle.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 pr-10 w-full md:w-64 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Events slider with F1-style design */}
        {filter === "events" && events.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Events Timeline
            </h2>
            <div className="relative">
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className={`flex-none w-64 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        isEventSelected(event.id) 
                          ? 'ring-2 ring-blue-500 transform scale-[1.02]' 
                          : 'border border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="h-36 relative">
                        <img 
                          src={event.featuredImage} 
                          alt={event.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-10 pb-2 px-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-blue-900/70 text-blue-100">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Badge>
                            <Badge className="bg-gray-900/70 text-gray-100">
                              {event.imageCount} photos
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-900">
                        <h3 className="font-bold text-white text-sm">{event.name}</h3>
                        <p className="text-gray-400 text-xs mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
          {/* Category tabs */}
          <Tabs defaultValue="all" className="w-full md:w-auto">
            <TabsList className="bg-gray-900 border border-gray-800 p-1 overflow-x-auto flex-nowrap whitespace-nowrap">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => {
                    setFilter(category.id);
                    setSelectedEvent(null);
                  }}
                  className="data-[state=active]:bg-blue-900 data-[state=active]:text-white flex items-center"
                >
                  {category.icon}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Layout and filter controls */}
          <div className="flex items-center gap-3">
            {/* View switcher */}
            <Select
              value={currentView}
              onValueChange={(value: any) => setCurrentView(value)}
            >
              <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700">
                <div className="flex items-center">
                  {views.find(v => v.id === currentView)?.icon}
                  <span className="ml-2">{views.find(v => v.id === currentView)?.name} View</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {views.map(view => (
                  <SelectItem key={view.id} value={view.id} className="flex items-center">
                    <div className="flex items-center">
                      {view.icon}
                      <span className="ml-2">{view.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort options */}
            <div className="flex">
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700">
                  <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(order => order === "asc" ? "desc" : "asc")}
                className="bg-gray-800 border border-gray-700 ml-1"
              >
                {sortOrder === "asc" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M19 12l-7-7-7 7"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                )}
              </Button>
            </div>
            
            {/* Filter button */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`bg-gray-800 border border-gray-700 ${showFilters ? 'text-blue-400' : 'text-gray-300'}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
        
        {/* Additional filters - shown when filters button is clicked */}
        {showFilters && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                <Select
                  value={yearFilter || ""}
                  onValueChange={(value) => setYearFilter(value || null)}
                >
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <span>{yearFilter || "All Years"}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">All Years</SelectItem>
                    {getYears().map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Additional filters based on category */}
              {filter !== "all" && categories.find(c => c.id === filter)?.filterOptions?.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{option.label}</label>
                  <Select>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <span>All {option.label}s</span>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="">All {option.label}s</SelectItem>
                      {/* Dynamic options would be populated here in a real app */}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-8 text-center">
          <Camera className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No images found</h3>
          <p className="text-gray-400">There are no images matching your current filters. Try changing your filter criteria or search query.</p>
          <Button 
            className="mt-4 bg-blue-600 hover:bg-blue-500"
            onClick={() => {
              setFilter("all");
              setSelectedEvent(null);
              setYearFilter(null);
              setSearchQuery("");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {currentView === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-700"
                  onClick={() => handleImageClick(item)}
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay with hover actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors m-1">
                        <Maximize2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    {/* Tags at top */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {item.eventName && (
                        <Badge className="bg-blue-600/90 text-white text-xs">
                          {item.eventName}
                        </Badge>
                      )}
                      {item.featured && (
                        <Badge className="bg-yellow-600/90 text-white text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    {/* Info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-300 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button 
                            className="flex items-center text-gray-300 hover:text-red-400 transition-colors"
                            onClick={(e) => handleLike(item.id, e)}
                          >
                            <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span className="ml-1 text-xs">{item.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Masonry View */}
          {currentView === "masonry" && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  className="group bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-700 break-inside-avoid"
                  onClick={() => handleImageClick(item)}
                >
                  <div className="overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay with hover actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors m-1">
                        <Maximize2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    {/* Tags and info */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {item.eventName && (
                        <Badge className="bg-blue-600/90 text-white text-xs">
                          {item.eventName}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-300">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button 
                          className="flex items-center text-gray-300 hover:text-red-400 transition-colors"
                          onClick={(e) => handleLike(item.id, e)}
                        >
                          <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="ml-1 text-xs">{item.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Timeline View */}
          {currentView === "timeline" && (
            <div className="flex flex-col lg:flex-row gap-6" ref={timelineScrollRef}>
              {/* Timeline */}
              <div className="lg:w-1/3 bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg p-4 overflow-y-auto max-h-[80vh]">
                <h2 className="text-xl font-bold text-white mb-4">Timeline</h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>
                  
                  {/* Timeline events */}
                  <div className="space-y-8">
                    {filter === "events" ? (
                      // Group by events for events category
                      events
                        .filter(event => filteredItems.some(item => item.eventId === event.id))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(event => (
                          <div 
                            key={event.id} 
                            id={`event-${event.id}`}
                            className={`relative pl-10 cursor-pointer ${
                              isEventSelected(event.id) ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                            }`}
                            onClick={() => handleEventClick(event.id)}
                          >
                            {/* Timeline dot */}
                            <div className={`absolute left-2 top-1 w-5 h-5 rounded-full ${
                              isEventSelected(event.id) 
                                ? 'bg-blue-500 ring-4 ring-blue-500/20' 
                                : 'bg-gray-700'
                            }`}></div>
                            
                            {/* Event info */}
                            <div className={`p-3 rounded-lg ${
                              isEventSelected(event.id) 
                                ? 'bg-blue-900/20 border border-blue-800/30' 
                                : 'bg-gray-900 border border-gray-800'
                            }`}>
                              <h3 className={`font-bold ${
                                isEventSelected(event.id) ? 'text-blue-400' : 'text-white'
                              }`}>{event.name}</h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {event.location}
                              </p>
                              <div className="mt-2 flex items-center">
                                <Badge className={`${
                                  isEventSelected(event.id) 
                                    ? 'bg-blue-900/50 text-blue-300' 
                                    : 'bg-gray-800 text-gray-300'
                                }`}>{event.imageCount} photos</Badge>
                                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${
                                  isEventSelected(event.id) ? 'rotate-180' : ''
                                }`} />
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      // Group by months for other categories
                      Object.entries(
                        filteredItems.reduce<Record<string, GalleryItem[]>>((acc, item) => {
                          const month = new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'long', year: 'numeric' 
                          });
                          if (!acc[month]) acc[month] = [];
                          acc[month].push(item);
                          return acc;
                        }, {})
                      ).map(([month, items]) => (
                        <div key={month} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-gray-700"></div>
                          
                          {/* Month label */}
                          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                            <h3 className="font-bold text-white">{month}</h3>
                            <p className="text-xs text-gray-400 mt-1">{items.length} items</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Images grid */}
              <div className="lg:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id}
                      className="group bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-700"
                      onClick={() => handleImageClick(item)}
                    >
                      <div className="h-40 sm:h-48 overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-300 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <button 
                                className="flex items-center text-gray-300 hover:text-red-400 transition-colors"
                                onClick={(e) => handleLike(item.id, e)}
                              >
                                <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span className="ml-1 text-xs">{item.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Carousel View */}
          {currentView === "carousel" && filteredItems.length > 0 && (
            <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg" ref={carouselRef}>
              {/* Main carousel */}
              <div className="flex items-center justify-center h-[600px] relative p-2">
                <div className="w-full h-full relative">
                  <img 
                    src={filteredItems[currentCarouselIndex].imageUrl} 
                    alt={filteredItems[currentCarouselIndex].title} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                  
                  {/* Bottom info panel */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                    <div className="flex justify-between items-start">
                      <div className="max-w-3xl">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {filteredItems[currentCarouselIndex].title}
                        </h3>
                        <p className="text-gray-300 mb-2">
                          {filteredItems[currentCarouselIndex].description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {filteredItems[currentCarouselIndex].tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-800/80 text-gray-300 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="mr-4">
                            {new Date(filteredItems[currentCarouselIndex].date).toLocaleDateString('en-US', { 
                              month: 'long', day: 'numeric', year: 'numeric' 
                            })}
                          </span>
                          {filteredItems[currentCarouselIndex].location && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              <span className="mr-4">{filteredItems[currentCarouselIndex].location}</span>
                            </>
                          )}
                          {filteredItems[currentCarouselIndex].photographer && (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                              <span>{filteredItems[currentCarouselIndex].photographer}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          className={`p-2 rounded-full ${
                            filteredItems[currentCarouselIndex].isLiked
                              ? 'bg-red-600/20 text-red-400'
                              : 'bg-gray-800/80 text-gray-400 hover:text-white'
                          }`}
                          onClick={(e) => handleLike(filteredItems[currentCarouselIndex].id, e)}
                        >
                          <Heart className={`h-5 w-5 ${
                            filteredItems[currentCarouselIndex].isLiked ? 'fill-red-500' : ''
                          }`} />
                        </button>
                        <button className="p-2 rounded-full bg-gray-800/80 text-gray-400 hover:text-white">
                          <Share2 className="h-5 w-5" />
                        </button>
                        {filteredItems[currentCarouselIndex].downloadable && (
                          <button className="p-2 rounded-full bg-gray-800/80 text-gray-400 hover:text-white">
                            <Download className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          className="p-2 rounded-full bg-gray-800/80 text-gray-400 hover:text-white"
                          onClick={() => handleImageClick(filteredItems[currentCarouselIndex])}
                        >
                          <Maximize2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 bg-black/60 text-white border-0 hover:bg-black/80 transition-colors rounded-full h-10 w-10"
                  onClick={() => navigateCarousel("prev")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 bg-black/60 text-white border-0 hover:bg-black/80 transition-colors rounded-full h-10 w-10"
                  onClick={() => navigateCarousel("next")}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Thumbnails */}
              <div className="bg-[#080808] border-t border-gray-800 p-2">
                <ScrollArea className="h-24">
                  <div className="flex gap-2 pb-4">
                    {filteredItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className={`flex-shrink-0 w-20 h-20 cursor-pointer rounded-md overflow-hidden ${
                          index === currentCarouselIndex ? 'ring-2 ring-blue-500' : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => setCurrentCarouselIndex(index)}
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image View Modal with enhanced F1-style UI */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
          onClick={closeModal}
        >
          <Button
            className="absolute top-4 right-4 bg-black/60 text-white hover:bg-black/80 z-50"
            onClick={closeModal}
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          
          <div 
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Image container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Bottom panel with details */}
            <div className="bg-gradient-to-t from-black to-transparent p-6 absolute bottom-0 left-0 right-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h2>
                  <p className="text-gray-300 mb-4">{selectedImage.description}</p>
                  
                  <div className="flex items-center flex-wrap gap-y-2">
                    <div className="flex items-center text-gray-400 mr-6">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(selectedImage.date).toLocaleDateString('en-US', { 
                        month: 'long', day: 'numeric', year: 'numeric' 
                      })}</span>
                    </div>
                    
                    {selectedImage.location && (
                      <div className="flex items-center text-gray-400 mr-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>{selectedImage.location}</span>
                      </div>
                    )}
                    
                    {selectedImage.photographer && (
                      <div className="flex items-center text-gray-400 mr-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>{selectedImage.photographer}</span>
                      </div>
                    )}
                    
                    {selectedImage.eventName && (
                      <div className="flex items-center mr-6">
                        <Badge className="bg-blue-900/50 text-blue-300">
                          {selectedImage.eventName}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedImage.tags.map(tag => (
                      <span key={tag} className="text-sm bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex md:flex-col md:items-end justify-between">
                  <div className="flex md:flex-col gap-2">
                    <Button 
                      className={`${
                        selectedImage.isLiked
                          ? 'bg-red-900/20 text-red-400 border-red-800/50'
                          : 'bg-gray-900/50 text-gray-300 border-gray-800'
                      } flex items-center`}
                      variant="outline"
                      onClick={(e) => handleLike(selectedImage.id, e)}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${
                        selectedImage.isLiked ? 'fill-red-500' : ''
                      }`} />
                      {selectedImage.likes || 0} Likes
                    </Button>
                    
                    <Button 
                      className="bg-gray-900/50 text-gray-300 border-gray-800 flex items-center"
                      variant="outline"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    
                    {selectedImage.downloadable && (
                      <Button 
                        className="bg-gray-900/50 text-gray-300 border-gray-800 flex items-center"
                        variant="outline"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-right mt-4 text-gray-400 text-sm">
                    <div className="flex items-center justify-end">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      <span>{selectedImage.views || 0} views</span>
                    </div>
                    
                    {selectedImage.metadata?.camera && (
                      <div className="mt-2">
                        <div className="text-xs opacity-75">Camera</div>
                        <div>{selectedImage.metadata.camera}</div>
                      </div>
                    )}
                    
                    {selectedImage.metadata?.settings && (
                      <div className="mt-1">
                        <div className="text-xs opacity-75">Settings</div>
                        <div>{selectedImage.metadata.settings}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribute section - F1 enhanced */}
      <div className="mt-12 bg-gradient-to-b from-[#0a0a0a] to-[#080808] border border-gray-800 rounded-lg p-8">
        <div className="flex flex-col md:flex-row justify-between gap-8 items-center">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Contribute to Our Gallery</h2>
            <p className="text-gray-300 mb-6">
              Are you a member with amazing automotive content to share? Our F1-quality gallery showcases 
              the very best of our community's experiences, from prestigious events to personal achievements.
              Submit your photos to join our growing collection of automotive excellence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-500">
                Upload Photos
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-900/20">
                Connect Social Media
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                View Guidelines
              </Button>
            </div>
          </div>
          
          {/* Stats visualization */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-900/50 border border-gray-800 rounded-lg p-4 flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-200 mb-4">Gallery Stats</h3>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-black/30 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-blue-400">{galleryItems.length}</div>
                <div className="text-sm text-gray-400">Total Images</div>
              </div>
              <div className="bg-black/30 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-green-400">{events.length}</div>
                <div className="text-sm text-gray-400">Events</div>
              </div>
              <div className="bg-black/30 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-yellow-400">{
                  galleryItems.filter(item => item.featured).length
                }</div>
                <div className="text-sm text-gray-400">Featured</div>
              </div>
              <div className="bg-black/30 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-purple-400">{collections.length}</div>
                <div className="text-sm text-gray-400">Collections</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoTimeGalleryPage;