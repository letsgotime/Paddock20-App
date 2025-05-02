import React, { useState, useEffect } from 'react';

interface DetailingActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  timestamp: number;
  points: number;
  tags: string[];
  imageUrls?: string[];
  notes?: string;
  products?: string[];
  duration?: number;
}

// Placeholder sample data - in a real app, this would come from a database or API
const sampleActivities: DetailingActivity[] = [
  {
    id: '1',
    type: 'detail',
    title: 'Full Exterior Detail',
    date: '2 days ago',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    points: 35,
    tags: ['Wash', 'Polish', 'Wax'],
    imageUrls: ['/assets/images/detailing1.jpg', '/assets/images/detailing2.jpg', '/assets/images/detailing3.jpg'],
    notes: 'Used the two-bucket method, followed by clay bar treatment. Machine polished with medium cut compound, then finished with carnauba wax.',
    products: ['Meguiar\'s Gold Class Shampoo', 'Clay Magic Clay Bar', 'Menzerna Medium Cut 2200', 'P21S Carnauba Wax'],
    duration: 4.5
  },
  {
    id: '2',
    type: 'product',
    title: 'Added Ceramic Coating Kit',
    date: '5 days ago',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    points: 10,
    tags: ['New Product', 'Coating'],
    notes: 'Purchased Gyeon Q² Pure ceramic coating kit for next month\'s full paint correction.',
    products: ['Gyeon Q² Pure']
  },
  {
    id: '3',
    type: 'detail',
    title: 'Maintenance Wash',
    date: '1 week ago',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    points: 15,
    tags: ['2-Bucket Wash', 'Quick Detailer'],
    imageUrls: ['/assets/images/wash1.jpg'],
    notes: 'Basic maintenance wash with foam cannon pre-rinse. Used quick detailer as drying aid.',
    products: ['Chemical Guys Honeydew Snow Foam', 'Adam\'s Car Wash Shampoo', 'Optimum No Rinse Wash & Shine'],
    duration: 1.5
  },
  {
    id: '4',
    type: 'detail',
    title: 'Interior Cleaning',
    date: '2 weeks ago',
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    points: 25,
    tags: ['Vacuuming', 'Leather Care'],
    imageUrls: ['/assets/images/interior1.jpg', '/assets/images/interior2.jpg', '/assets/images/interior3.jpg', '/assets/images/interior4.jpg', '/assets/images/interior5.jpg'],
    notes: 'Deep cleaned all interior surfaces. Conditioned leather seats and treated dashboard with UV protectant.',
    products: ['Meguiar\'s APC', 'Leather Honey Conditioner', 'Chemical Guys Inner Clean', 'Aerospace 303 Protectant'],
    duration: 3
  },
  {
    id: '5',
    type: 'product',
    title: 'Added Wheel Cleaning Kit',
    date: '3 weeks ago',
    timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
    points: 5,
    tags: ['New Product', 'Wheels'],
    notes: 'Purchased dedicated wheel cleaning supplies to replace my all-purpose cleaners.',
    products: ['P&S Brake Buster', 'EZ Detail Brush', 'Mothers Wheel Brush']
  },
  {
    id: '6',
    type: 'detail',
    title: 'Paint Correction - Driver Side',
    date: '1 month ago',
    timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    points: 40,
    tags: ['Polish', 'Compound', 'Correction'],
    imageUrls: ['/assets/images/correction1.jpg', '/assets/images/correction2.jpg'],
    notes: 'Multi-stage correction on driver side panels. Heavy cut followed by medium polish and finishing polish.',
    products: ['Meguiar\'s M105', 'Meguiar\'s M205', 'Menzerna 3500', 'Lake Country Pads'],
    duration: 6
  },
  {
    id: '7',
    type: 'detail',
    title: 'Engine Bay Detailing',
    date: '6 weeks ago',
    timestamp: Date.now() - 42 * 24 * 60 * 60 * 1000,
    points: 30,
    tags: ['Engine', 'Deep Clean'],
    imageUrls: ['/assets/images/engine1.jpg'],
    notes: 'First time cleaning the engine bay. Used gentle APC and detail brushes. Dressed with 303 Aerospace.',
    products: ['Meguiar\'s APC', 'Detail Factory Brushes', 'Compressed Air', '303 Aerospace Protectant'],
    duration: 2.5
  },
  {
    id: '8',
    type: 'product',
    title: 'Added Pressure Washer',
    date: '2 months ago',
    timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
    points: 20,
    tags: ['Equipment', 'Tools'],
    notes: 'Upgraded to an electric pressure washer with foam cannon attachment.',
    products: ['Sun Joe SPX3000', 'MTM Hydro PF22 Foam Cannon']
  },
  {
    id: '9',
    type: 'detail',
    title: 'Complete Paint Correction',
    date: '3 months ago',
    timestamp: Date.now() - 90 * 24 * 60 * 60 * 1000,
    points: 50,
    tags: ['Polish', 'Correction', 'Wax'],
    imageUrls: ['/assets/images/correction-full1.jpg', '/assets/images/correction-full2.jpg'],
    notes: 'Full vehicle paint correction. Removed swirls and light scratches. Applied two coats of premium carnauba wax.',
    products: ['Meguiar\'s Ultimate Compound', 'Meguiar\'s Ultimate Polish', 'Collinite 845', 'Meguiar\'s Microfiber Pads'],
    duration: 12
  },
  {
    id: '10',
    type: 'service',
    title: 'Professional Ceramic Coating',
    date: '6 months ago',
    timestamp: Date.now() - 180 * 24 * 60 * 60 * 1000,
    points: 100,
    tags: ['Professional', 'Ceramic', 'Protection'],
    imageUrls: ['/assets/images/ceramic1.jpg', '/assets/images/ceramic2.jpg', '/assets/images/ceramic3.jpg'],
    notes: 'Professional ceramic coating application at Elite Detailing. 5-year warranty on coating. Full paint correction performed before application.',
    duration: 24
  }
];

function GlossHistory() {
  const [activities, setActivities] = useState<DetailingActivity[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [timeFrame, setTimeFrame] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalPoints: 0,
    totalHours: 0,
    detailsCount: 0,
    productsCount: 0,
    servicesCount: 0,
    favoriteTags: [] as {tag: string, count: number}[]
  });

  // Initialize with sample data (in a real app, you'd fetch from an API)
  useEffect(() => {
    // Simulating API fetch with setTimeout
    setTimeout(() => {
      setActivities(sampleActivities);
    }, 500);
  }, []);

  // Calculate statistics whenever activities change
  useEffect(() => {
    if (activities.length === 0) return;

    const stats = {
      totalPoints: activities.reduce((sum, act) => sum + act.points, 0),
      totalHours: activities.reduce((sum, act) => sum + (act.duration || 0), 0),
      detailsCount: activities.filter(act => act.type === 'detail').length,
      productsCount: activities.filter(act => act.type === 'product').length,
      servicesCount: activities.filter(act => act.type === 'service').length,
      favoriteTags: [] as {tag: string, count: number}[]
    };

    // Calculate favorite tags
    const tagCounts = new Map<string, number>();
    activities.forEach(activity => {
      activity.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    stats.favoriteTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 tags

    setStatistics(stats);
  }, [activities]);

  // Get filtered and sorted activities
  const getFilteredActivities = () => {
    let filteredList = [...activities];
    
    // Apply type filter
    if (filterType !== 'all') {
      filteredList = filteredList.filter(activity => activity.type === filterType);
    }
    
    // Apply time frame filter
    if (timeFrame !== 'all') {
      const now = Date.now();
      let cutoffTime: number;
      
      switch (timeFrame) {
        case 'month':
          cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          cutoffTime = now - (90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffTime = now - (365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffTime = 0;
      }
      
      filteredList = filteredList.filter(activity => activity.timestamp > cutoffTime);
    }
    
    // Apply sorting
    filteredList.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'points':
          comparison = a.points - b.points;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredList;
  };

  // Toggle expanded view for an activity
  const toggleExpandActivity = (id: string) => {
    if (expandedActivity === id) {
      setExpandedActivity(null);
    } else {
      setExpandedActivity(id);
    }
  };

  // Get CSS class for activity card based on type
  const getActivityTypeClass = (type: string) => {
    switch (type) {
      case 'detail':
        return 'border-blue-500';
      case 'product':
        return 'border-green-500';
      case 'service':
        return 'border-purple-500';
      default:
        return 'border-gray-500';
    }
  };

  // Get icon for activity type
  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'detail':
        return '🧽';
      case 'product':
        return '🧴';
      case 'service':
        return '👨‍🔧';
      default:
        return '📝';
    }
  };

  // Helper function to calculate gloss score from points
  const calculateGlossScore = (totalPoints: number): number => {
    // Basic algorithm: points translate to a score between 70-100
    return Math.min(100, Math.max(70, 70 + (totalPoints / 10)));
  };

  const currentGlossScore = calculateGlossScore(statistics.totalPoints);

  // Get the current filtered activities
  const filteredActivities = getFilteredActivities();

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Gloss History™ Timeline</h2>
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-black/60 p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-lg mb-3">Gloss Performance</h3>
          <div className="text-center py-4">
            <div className="inline-block relative w-40 h-40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-white">{currentGlossScore.toFixed(1)}</div>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a1a" strokeWidth="10" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="10" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 * (1 - ((currentGlossScore - 70) / 30))} 
                  transform="rotate(-90 50 50)" 
                />
              </svg>
              <div className="absolute bottom-0 left-0 right-0 text-center text-blue-300 text-sm">Gloss Score</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center bg-blue-900/30 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{statistics.totalPoints}</div>
              <div className="text-xs text-blue-300">Total Points</div>
            </div>
            <div className="text-center bg-green-900/30 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{statistics.totalHours.toFixed(1)}</div>
              <div className="text-xs text-green-300">Hours Invested</div>
            </div>
          </div>
        </div>
        
        <div className="bg-black/60 p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-lg mb-3">Activity Summary</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-blue-900/30 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{statistics.detailsCount}</div>
              <div className="text-xs text-blue-300">Details</div>
            </div>
            <div className="text-center bg-green-900/30 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{statistics.productsCount}</div>
              <div className="text-xs text-green-300">Products</div>
            </div>
            <div className="text-center bg-purple-900/30 rounded-lg p-2">
              <div className="text-xl font-bold text-white">{statistics.servicesCount}</div>
              <div className="text-xs text-purple-300">Services</div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm text-gray-300 mb-2">Most Used Tags</h4>
            <div className="flex flex-wrap gap-2">
              {statistics.favoriteTags.map((item, index) => (
                <div key={index} className="bg-blue-900/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                  {item.tag} ({item.count})
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-black/60 p-4 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-lg mb-3">Filters & Sort</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-gray-300 text-xs mb-1">Activity Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              >
                <option value="all">All Activities</option>
                <option value="detail">Details Only</option>
                <option value="product">Products Only</option>
                <option value="service">Services Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Time Frame</label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              >
                <option value="all">All Time</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-300 text-xs mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="points">Points</option>
                <option value="type">Type</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-xs mb-1">Sort Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline History */}
      <div className="bg-black/60 p-4 rounded-lg mb-6">
        <h3 className="text-blue-400 font-orbitron text-lg mb-4">Gloss Timeline</h3>
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No activities found. Adjust your filters or add some activities.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div 
              key={activity.id} 
              className={`bg-gray-900/60 p-4 rounded-lg border-l-4 ${getActivityTypeClass(activity.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="text-xl mr-3">{getActivityTypeIcon(activity.type)}</div>
                  <div>
                    <h4 className="text-white font-medium">{activity.title}</h4>
                    <p className="text-gray-400 text-xs">{activity.date}</p>
                  </div>
                </div>
                <div className="bg-blue-900/20 text-blue-400 text-xs px-2 py-1 rounded">
                  +{activity.points} pts
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {activity.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {activity.duration && (
                  <span className="bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded">
                    {activity.duration} hours
                  </span>
                )}
              </div>
              
              <div className="mt-3">
                <button
                  onClick={() => toggleExpandActivity(activity.id)}
                  className="text-blue-400 text-xs hover:text-blue-300 flex items-center"
                >
                  {expandedActivity === activity.id ? 'Show Less' : 'Show Details'}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform duration-200 ${expandedActivity === activity.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Expanded content */}
              {expandedActivity === activity.id && (
                <div className="mt-4 space-y-4">
                  {activity.notes && (
                    <div>
                      <h5 className="text-gray-300 text-sm font-medium mb-1">Notes</h5>
                      <p className="text-gray-400 text-sm">{activity.notes}</p>
                    </div>
                  )}
                  
                  {activity.products && activity.products.length > 0 && (
                    <div>
                      <h5 className="text-gray-300 text-sm font-medium mb-1">Products Used</h5>
                      <ul className="list-disc list-inside text-gray-400 text-sm">
                        {activity.products.map((product, productIndex) => (
                          <li key={productIndex}>{product}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {activity.imageUrls && activity.imageUrls.length > 0 && (
                    <div>
                      <h5 className="text-gray-300 text-sm font-medium mb-1">Photos</h5>
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {activity.imageUrls.map((url, urlIndex) => (
                          <div key={urlIndex} className="h-24 w-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-700">
                            <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                              <span className="text-xl">🖼️</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Export Options */}
      <div className="flex justify-end gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          Export to PDF
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
          Export to CSV
        </button>
      </div>
    </div>
  );
}

export default GlossHistory;