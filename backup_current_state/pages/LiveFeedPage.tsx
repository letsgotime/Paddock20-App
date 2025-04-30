import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Car, Award, Calendar, Heart, Clock, MapPin, MessageSquare, UserCircle, Share2, ThumbsUp, Bookmark, AlertCircle, Calendar as CalendarIcon } from "lucide-react";

interface FeedItem {
  id: string;
  type: 'drive' | 'achievement' | 'event' | 'charity' | 'maintenance' | 'goal' | 'community' | 'announcement';
  title: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    level: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  images?: string[];
  tags?: string[];
  location?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  vehicle?: {
    id: string;
    name: string;
    image: string;
  };
  achievement?: {
    id: string;
    name: string;
    icon: string;
    points: number;
  };
  event?: {
    id: string;
    name: string;
    date: string;
    location: string;
    attendees: number;
  };
  goal?: {
    id: string;
    name: string;
    progress: number;
    targetDate: string;
  };
}

const LiveFeedPage: React.FC = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [visibleItems, setVisibleItems] = useState(10);

  // Simulated API call to fetch feed items
  useEffect(() => {
    // In production, this would be a real API call
    const fetchFeedItems = async () => {
      try {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock feed items - in production, these would come from your backend
        const mockFeedItems: FeedItem[] = generateMockFeedItems(30);
        setFeedItems(mockFeedItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feed items:', error);
        setLoading(false);
      }
    };

    fetchFeedItems();
  }, []);

  // Filter feed items based on selected tab
  const filteredItems = feedItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  }).slice(0, visibleItems);

  // Load more feed items
  const loadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  // Handle like action
  const handleLike = (id: string) => {
    setFeedItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? 
          { 
            ...item, 
            likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            isLiked: !item.isLiked
          } : 
          item
      )
    );
  };

  // Handle bookmark action
  const handleBookmark = (id: string) => {
    setFeedItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-4">Live Activity Feed</h1>
      <p className="text-gray-400 mb-8">
        Stay updated with the latest activities, achievements, and events from the community.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Feed */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="bg-gray-900 border border-gray-800 mb-4 w-full overflow-x-auto flex-nowrap whitespace-nowrap">
              <TabsTrigger 
                value="all" 
                onClick={() => setFilter('all')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                All Activity
              </TabsTrigger>
              <TabsTrigger 
                value="drive" 
                onClick={() => setFilter('drive')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Drives
              </TabsTrigger>
              <TabsTrigger 
                value="achievement" 
                onClick={() => setFilter('achievement')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger 
                value="event" 
                onClick={() => setFilter('event')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="charity" 
                onClick={() => setFilter('charity')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Charitable Actions
              </TabsTrigger>
              <TabsTrigger 
                value="goal" 
                onClick={() => setFilter('goal')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Goals
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                onClick={() => setFilter('community')}
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white"
              >
                Community
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="drive" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="achievement" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="event" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="charity" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="goal" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
            <TabsContent value="community" className="mt-0">
              <FeedItemsList 
                items={filteredItems} 
                loading={loading} 
                onLike={handleLike} 
                onBookmark={handleBookmark}
              />
            </TabsContent>
          </Tabs>

          {visibleItems < feedItems.length && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                onClick={loadMore}
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              >
                Load More
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Trending Tags */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-4">
            <h3 className="font-bold text-lg text-blue-400 mb-4">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#F1Monaco</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#TrackDay</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#PorscheFamily</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#WeekendDrive</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#CarbonFiber</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#DetailingDay</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#DreamCar</Badge>
              <Badge className="bg-blue-900/30 hover:bg-blue-800 text-blue-400 cursor-pointer">#JuiceBox</Badge>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-4">
            <h3 className="font-bold text-lg text-blue-400 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              <UpcomingEvent 
                title="Monaco Grand Prix Watch Party"
                date="May 26, 2024"
                location="Austin, TX"
                attendees={42}
              />
              <Separator className="bg-gray-800" />
              <UpcomingEvent 
                title="Summer Detailing Workshop"
                date="June 15, 2024"
                location="Nashville, TN"
                attendees={24}
              />
              <Separator className="bg-gray-800" />
              <UpcomingEvent 
                title="Mountain Drive & Brunch"
                date="July 8, 2024"
                location="Denver, CO"
                attendees={18}
              />
            </div>
            <Button variant="link" className="text-blue-400 mt-2 p-0">
              View All Events
            </Button>
          </div>

          {/* Top Contributors */}
          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-4">
            <h3 className="font-bold text-lg text-blue-400 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              <Contributor 
                name="Alex Morgan"
                level="Apex Legend"
                avatar="https://randomuser.me/api/portraits/men/32.jpg"
                contributions={247}
              />
              <Separator className="bg-gray-800" />
              <Contributor 
                name="Sophia Chen"
                level="Grid King"
                avatar="https://randomuser.me/api/portraits/women/44.jpg"
                contributions={189}
              />
              <Separator className="bg-gray-800" />
              <Contributor 
                name="James Wilson"
                level="Redline Racer"
                avatar="https://randomuser.me/api/portraits/men/62.jpg"
                contributions={156}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for displaying feed items
const FeedItemsList = ({ 
  items, 
  loading, 
  onLike, 
  onBookmark 
}: { 
  items: FeedItem[];
  loading: boolean;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-8 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No activity found</h3>
        <p className="text-gray-400">There are no activities matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map(item => (
        <FeedItem key={item.id} item={item} onLike={onLike} onBookmark={onBookmark} />
      ))}
    </div>
  );
};

// Individual feed item component
const FeedItem = ({ 
  item, 
  onLike, 
  onBookmark 
}: { 
  item: FeedItem;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
}) => {
  // Get icon based on feed item type
  const getTypeIcon = () => {
    switch (item.type) {
      case 'drive':
        return <Car className="h-5 w-5 text-green-400" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-400" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-orange-400" />;
      case 'charity':
        return <Heart className="h-5 w-5 text-red-400" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-400" />;
      case 'goal':
        return <Award className="h-5 w-5 text-purple-400" />;
      case 'community':
        return <MessageSquare className="h-5 w-5 text-cyan-400" />;
      case 'announcement':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0a0a] to-[#080808] rounded-lg border border-gray-800 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={item.user.avatar} alt={item.user.name} />
            <AvatarFallback>{item.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-white">{item.user.name}</span>
              <Badge className="ml-2 text-xs bg-blue-900/30 text-blue-400">{item.user.level}</Badge>
            </div>
            <div className="text-xs text-gray-400 flex items-center mt-1">
              {getTypeIcon()}
              <span className="ml-1 capitalize">{item.type}</span>
              {item.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3" />
                  <span className="ml-1">{item.location}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">{item.title}</h3>
        <p className="text-gray-300">{item.content}</p>
      </div>

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <div className={`grid ${item.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-4`}>
          {item.images.map((img, index) => (
            <div 
              key={index} 
              className={`h-48 rounded-lg overflow-hidden ${
                item.images?.length === 1 ? 'col-span-2' : ''
              }`}
            >
              <img 
                src={img} 
                alt={`${item.title} - image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Info */}
      {item.vehicle && (
        <div className="bg-gray-900/50 rounded-lg p-3 mb-4 flex items-center">
          <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
            <img 
              src={item.vehicle.image} 
              alt={item.vehicle.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm text-gray-400">Vehicle</span>
            <h4 className="text-white font-medium">{item.vehicle.name}</h4>
          </div>
        </div>
      )}

      {/* Achievement Info */}
      {item.achievement && (
        <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3 mb-4 flex items-center">
          <div className="h-12 w-12 rounded-full bg-yellow-900/30 flex items-center justify-center mr-3">
            <Award className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <span className="text-sm text-gray-400">Achievement Unlocked</span>
            <h4 className="text-yellow-400 font-medium">{item.achievement.name}</h4>
            <span className="text-xs text-gray-400">+{item.achievement.points} points</span>
          </div>
        </div>
      )}

      {/* Event Info */}
      {item.event && (
        <div className="bg-orange-900/20 border border-orange-800/30 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-orange-400 mr-2" />
            <h4 className="text-orange-400 font-medium">{item.event.name}</h4>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="mr-3">{item.event.date}</span>
            <MapPin className="h-4 w-4 mr-1" />
            <span>{item.event.location}</span>
            <span className="mx-2">•</span>
            <UserCircle className="h-4 w-4 mr-1" />
            <span>{item.event.attendees} attendees</span>
          </div>
        </div>
      )}

      {/* Goal Info */}
      {item.goal && (
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-purple-400 font-medium">{item.goal.name}</h4>
            <span className="text-xs text-gray-400">Target: {item.goal.targetDate}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ width: `${item.goal.progress}%` }}
            ></div>
          </div>
          <div className="text-right text-xs text-gray-400">{item.goal.progress}% complete</div>
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.map((tag, index) => (
            <Badge 
              key={index} 
              className="bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center ${item.isLiked ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => onLike(item.id)}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{item.likes}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-gray-400 hover:text-white"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{item.comments}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center ${item.isBookmarked ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => onBookmark(item.id)}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Upcoming event component for sidebar
const UpcomingEvent = ({ 
  title, 
  date, 
  location, 
  attendees 
}: { 
  title: string;
  date: string;
  location: string;
  attendees: number;
}) => {
  return (
    <div className="flex items-start">
      <div className="h-10 w-10 bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-400 mr-3">
        <Calendar className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <div className="text-xs text-gray-400 mt-1">
          <div className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center mt-0.5">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location}</span>
            <span className="mx-1">•</span>
            <UserCircle className="h-3 w-3 mr-1" />
            <span>{attendees} attending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contributor component for sidebar
const Contributor = ({ 
  name, 
  level, 
  avatar, 
  contributions 
}: { 
  name: string;
  level: string;
  avatar: string;
  contributions: number;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-white">{name}</h4>
          <span className="text-xs text-gray-400">{level}</span>
        </div>
      </div>
      <div className="text-right">
        <Badge className="bg-blue-900/30 text-blue-400">{contributions}</Badge>
      </div>
    </div>
  );
};

// Helper function to generate mock feed items
const generateMockFeedItems = (count: number): FeedItem[] => {
  const types: FeedItem['type'][] = ['drive', 'achievement', 'event', 'charity', 'maintenance', 'goal', 'community', 'announcement'];
  const userLevels = ['New Driver', 'Road Warrior', 'Redline Racer', 'Grid King', 'Apex Legend'];
  const locations = ['Austin, TX', 'Nashville, TN', 'Los Angeles, CA', 'Miami, FL', 'Seattle, WA'];
  
  const items: FeedItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const userId = `user-${Math.floor(Math.random() * 100)}`;
    const item: FeedItem = {
      id: `feed-${i}`,
      type,
      title: getRandomTitle(type),
      content: getRandomContent(type),
      user: {
        id: userId,
        name: getRandomName(),
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.7 ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
        level: userLevels[Math.floor(Math.random() * userLevels.length)]
      },
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      likes: Math.floor(Math.random() * 120),
      comments: Math.floor(Math.random() * 30),
      isLiked: Math.random() > 0.7,
      isBookmarked: Math.random() > 0.8,
    };
    
    // Add random location to some items
    if (Math.random() > 0.3) {
      item.location = locations[Math.floor(Math.random() * locations.length)];
    }
    
    // Add tags to some items
    if (Math.random() > 0.4) {
      item.tags = getRandomTags(type);
    }
    
    // Add images to some items
    if (Math.random() > 0.5) {
      const imageCount = Math.random() > 0.7 ? 2 : 1;
      item.images = Array(imageCount).fill(0).map((_, i) => 
        `https://source.unsplash.com/random/800x600?${getImageQuery(type)}&sig=${i + Math.floor(Math.random() * 1000)}`
      );
    }
    
    // Add type-specific data
    switch (type) {
      case 'drive':
        item.vehicle = {
          id: `vehicle-${Math.floor(Math.random() * 10)}`,
          name: getRandomVehicleName(),
          image: `https://source.unsplash.com/random/200x200?car&sig=${Math.floor(Math.random() * 1000)}`
        };
        break;
      case 'achievement':
        item.achievement = {
          id: `achievement-${Math.floor(Math.random() * 20)}`,
          name: getRandomAchievementName(),
          icon: 'award',
          points: Math.floor(Math.random() * 90) + 10
        };
        break;
      case 'event':
        item.event = {
          id: `event-${Math.floor(Math.random() * 15)}`,
          name: getRandomEventName(),
          date: getRandomFutureDate(),
          location: locations[Math.floor(Math.random() * locations.length)],
          attendees: Math.floor(Math.random() * 100) + 5
        };
        break;
      case 'goal':
        item.goal = {
          id: `goal-${Math.floor(Math.random() * 25)}`,
          name: getRandomGoalName(),
          progress: Math.floor(Math.random() * 100),
          targetDate: getRandomFutureDate()
        };
        break;
    }
    
    items.push(item);
  }
  
  // Sort by timestamp (newest first)
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Helper functions for generating random content
const getRandomTitle = (type: FeedItem['type']): string => {
  const titles: Record<FeedItem['type'], string[]> = {
    drive: [
      'Epic Mountain Drive in the Smokies',
      'Sunday Morning Canyon Cruise',
      'Track Day at Circuit of the Americas',
      'Pacific Coast Highway Adventure',
      'Autumn Colors Mountain Drive'
    ],
    achievement: [
      'Earned the Road Warrior Badge',
      'Reached Redline Racer Level',
      'Completed 50 Drive Logs',
      'First Track Day Achievement',
      'Detailing Master Badge Unlocked'
    ],
    event: [
      'Joined Monaco GP Watch Party',
      'Registered for Summer Detailing Workshop',
      'RSVP\'d to Cars & Coffee Austin',
      'Attending Monterey Car Week',
      'Signed up for Mountain Drive Meetup'
    ],
    charity: [
      'Donated to Driving for a Cause',
      'Volunteered at Youth Racing Program',
      'Participated in Charity Rally',
      'Sponsored Local Track Event',
      'Joined Community Cleanup Initiative'
    ],
    maintenance: [
      'Completed 30k Service',
      'Installed New Performance Upgrades',
      'Winter Prep Maintenance Complete',
      'Track Day Preparation Checklist',
      'Detailing Session Complete'
    ],
    goal: [
      'Set Target for Track Personal Best',
      'Created Modification Roadmap',
      'Established Savings Plan for Dream Car',
      'Added Road Trip Bucket List',
      'Created Driving Skills Development Plan'
    ],
    community: [
      'Joined Vehicle Showcase Discussion',
      'Started a Thread on Detailing Tips',
      'Shared Route Planning Advice',
      'Asked About Performance Upgrades',
      'Welcomed New Members to the Community'
    ],
    announcement: [
      'New App Features Released',
      'Upcoming Platform Maintenance',
      'Important Community Guidelines Update',
      'New Partnership Announcement',
      'Special Offer for Members'
    ]
  };
  
  const typeOptions = titles[type];
  return typeOptions[Math.floor(Math.random() * typeOptions.length)];
};

const getRandomContent = (type: FeedItem['type']): string => {
  const contents: Record<FeedItem['type'], string[]> = {
    drive: [
      'Had an amazing drive through the mountains today. Perfect weather, empty roads, and the car performed flawlessly. Couldn\'t ask for a better driving day!',
      'Finally got to test the new suspension setup on some proper corners. The difference is night and day - so much more confidence in the corners now.',
      'Early morning cruise before the traffic hits - nothing beats the sound of the engine echoing through empty streets as the sun comes up.',
      'Took the scenic route home and discovered some incredible new roads. Already planning to go back next weekend with the driving group.',
      'Track day complete! Set a new personal best and the car held up perfectly through 6 sessions. Cooling upgrades definitely paying off.'
    ],
    achievement: [
      'Really excited to have earned this badge after months of consistent logging and participation. The journey has been as rewarding as the destination.',
      'Leveled up! Thanks to everyone in the community who\'s shared tips and encouragement along the way. Looking forward to the next challenge.',
      'Milestone achieved! This represents hundreds of hours of passion and dedication to the craft. Grateful for this community.',
      'Didn\'t think I\'d reach this level so quickly, but the structured system made it easy to stay consistent and keep pushing forward.',
      'Honored to join the ranks of those who\'ve achieved this. The detailed tracking in the app made it possible to see my progress every step of the way.'
    ],
    event: [
      'Looking forward to connecting with fellow enthusiasts at this event. If you\'re attending too, let\'s meet up!',
      'Can\'t wait for this workshop. I\'ve been wanting to learn these techniques for ages. Anyone else going?',
      'This will be my first time at this venue - excited to experience it and meet the community in person.',
      'Counting down the days! This has been on my calendar for months and it\'s finally happening.',
      'Just secured my spot for this exclusive event. Limited spaces available, so don\'t wait if you\'re interested!'
    ],
    charity: [
      'Proud to support this great cause that combines our passion for cars with making a difference in the community.',
      'It was rewarding to use my automotive skills to help teach the next generation. These kids have amazing potential!',
      'Every mile driven raised money for this important cause. Thanks to everyone who pledged support!',
      'Using our love for cars to give back to the community is what makes this more than just a hobby - it\'s a positive force.',
      'Small actions multiply when we come together. Grateful to be part of a community that values giving back.'
    ],
    maintenance: [
      'Preventative maintenance complete - peace of mind for the driving season ahead. Found a couple of issues early that could have been problems later.',
      'Finally installed those upgrades I\'ve been researching for months. Can\'t wait to feel the difference on my next drive!',
      'Getting the car ready for winter with fresh fluids, new wipers, and a proper detailing to protect against the elements.',
      'Pre-track day inspection all done. Safety first - everything checked, torqued, and ready for the stress of high-speed driving.',
      'Spent the weekend getting every detail perfect. There\'s something therapeutic about a thorough detailing session.'
    ],
    goal: [
      'Setting this goal to push myself further. Having it documented here will help keep me accountable.',
      'Breaking down this big dream into actionable steps makes it feel achievable. The Manifestation Station structure is perfect for this.',
      'This represents years of planning and saving, but with this structured approach, I can see the path forward clearly.',
      'Adding this to my bucket list - the route planning tools will help make this dream road trip a reality.',
      'Sometimes progress comes in small steps. This plan will help ensure I\'m developing skills consistently.'
    ],
    community: [
      'Sharing some photos from our recent drive. The community requested more details about the route, so I\'ve included them in the comments.',
      'After all the help I\'ve received here, I wanted to create this resource for others. Hope it helps those just starting their journey!',
      'Looking for suggestions on this potential route. Any local insights about road conditions or hidden gems along the way?',
      'After researching extensively, I wanted to share my findings before making these significant modifications to my vehicle.',
      'This community has been so welcoming since I joined. Excited to be part of such a passionate and knowledgeable group!'
    ],
    announcement: [
      'We\'re excited to announce these new features based on your feedback. Update your app to access them!',
      'The platform will be undergoing maintenance to improve performance. Please check the schedule for details.',
      'Based on community growth, we\'ve updated our guidelines to ensure the best experience for all members.',
      'Thrilled to announce our new partnership that will bring exclusive benefits to our members starting next month.',
      'As a thank you to our community, we\'re offering this special promotion. Limited time only!'
    ]
  };
  
  const typeOptions = contents[type];
  return typeOptions[Math.floor(Math.random() * typeOptions.length)];
};

const getRandomTags = (type: FeedItem['type']): string[] => {
  const allTags = {
    drive: ['SundayDrive', 'MountainRoads', 'CanyonRun', 'RoadTrip', 'TrackDay', 'ScenicRoute', 'DriverParadise', 'PerfectCorners'],
    achievement: ['LevelUp', 'Milestone', 'Progress', 'Achievement', 'BadgeUnlocked', 'NewLevel', 'Dedication'],
    event: ['CarMeet', 'Meetup', 'CarShow', 'RacingEvent', 'WatchParty', 'Workshop', 'DriversEvent'],
    charity: ['GivingBack', 'Community', 'Charity', 'Volunteer', 'CarsForCause', 'DriveForChange'],
    maintenance: ['Detailing', 'Maintenance', 'ServiceTime', 'Upgrade', 'Modification', 'DIY', 'CarCare'],
    goal: ['Goals', 'DreamCar', 'Manifestation', 'Progress', 'BucketList', 'CarGoals', 'RoadToSuccess'],
    community: ['Community', 'Discussion', 'CarTalk', 'AdviceSought', 'FeedbackWanted', 'CommunityHelp'],
    announcement: ['Announcement', 'Update', 'NewFeature', 'AppNews', 'MemberUpdate', 'ImportantInfo']
  };
  
  const commonTags = ['Paddock20', 'GoTime', 'CarEnthusiast', 'DriverLifestyle', 'Automotive'];
  const typeTags = allTags[type] || [];
  
  // Select 1-3 type-specific tags
  const selectedTypeTags = typeTags
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 1);
  
  // Select 0-2 common tags
  const selectedCommonTags = commonTags
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2));
  
  return [...selectedTypeTags, ...selectedCommonTags];
};

const getImageQuery = (type: FeedItem['type']): string => {
  const queries: Record<FeedItem['type'], string[]> = {
    drive: ['car,road', 'driving,mountains', 'sports,car', 'scenic,drive', 'car,sunset'],
    achievement: ['trophy', 'achievement', 'success', 'award', 'celebration'],
    event: ['car,event', 'car,show', 'racing', 'car,meetup', 'automotive,event'],
    charity: ['charity,event', 'volunteer', 'community,service', 'donation', 'charity'],
    maintenance: ['car,maintenance', 'car,detailing', 'mechanic', 'car,repair', 'car,wash'],
    goal: ['goal', 'vision,board', 'dream,car', 'luxury,car', 'achievement'],
    community: ['community', 'group,people', 'discussion', 'meeting', 'social,event'],
    announcement: ['announcement', 'news', 'update', 'notification', 'important']
  };
  
  const typeQueries = queries[type];
  return typeQueries[Math.floor(Math.random() * typeQueries.length)];
};

const getRandomName = (): string => {
  const firstNames = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Jamie', 'Riley', 'Avery', 'Kendall', 'Parker', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Sophia', 'Robert', 'Olivia', 'John', 'Isabella'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const getRandomVehicleName = (): string => {
  const makes = ['Porsche', 'BMW', 'Audi', 'Mercedes', 'Ferrari', 'Lamborghini', 'McLaren', 'Aston Martin', 'Maserati', 'Jaguar'];
  const models = ['911 GT3', 'M4 Competition', 'RS6 Avant', 'AMG GT', '488 Pista', 'Huracán EVO', '720S', 'Vantage', 'MC20', 'F-Type R'];
  
  return `${makes[Math.floor(Math.random() * makes.length)]} ${models[Math.floor(Math.random() * models.length)]}`;
};

const getRandomAchievementName = (): string => {
  const achievements = [
    'Road Warrior Badge', 
    'Track Day Master', 
    'Detailing Perfectionist', 
    'Mountain Pass Explorer', 
    '100 Drives Recorded', 
    'Maintenance Guru', 
    'Community Contributor', 
    'Manifestation Milestone', 
    'Collection Curator', 
    'Event Ambassador'
  ];
  
  return achievements[Math.floor(Math.random() * achievements.length)];
};

const getRandomEventName = (): string => {
  const events = [
    'Monaco GP Watch Party',
    'Summer Detailing Workshop',
    'Cars & Coffee Austin',
    'Mountain Drive Meetup',
    'Track Day Experience',
    'Luxury Car Showcase',
    'Automotive Photography Workshop',
    'Drive for Charity Rally',
    'Performance Driving Clinic',
    'Paddock20 Member Meetup'
  ];
  
  return events[Math.floor(Math.random() * events.length)];
};

const getRandomGoalName = (): string => {
  const goals = [
    'Complete Nürburgring Lap',
    'Restore Classic Porsche',
    'Attend Monterey Car Week',
    'Build Custom Track Car',
    'Master Heel-Toe Downshifting',
    'Complete Detailing Certification',
    'Drive Pacific Coast Highway',
    'Acquire Dream Car',
    'Complete Advanced Driving Course',
    'Build Ultimate Home Garage'
  ];
  
  return goals[Math.floor(Math.random() * goals.length)];
};

const getRandomFutureDate = (): string => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);
  return futureDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Format date helper
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  } else if (diffHrs < 24) {
    return diffHrs === 1 ? '1 hour ago' : `${diffHrs} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

export default LiveFeedPage;