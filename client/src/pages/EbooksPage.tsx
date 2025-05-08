import React, { useState } from 'react';
import { Book, Search, Download, Star, Clock, Tag, Eye, BookOpen, ChevronDown } from 'lucide-react';

interface Ebook {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  category: string;
  rating: number;
  downloadCount: number;
  dateAdded: string;
  fileSize: string;
  premium: boolean;
}

// Sample ebooks data
const ebooksData: Ebook[] = [
  {
    id: 1,
    title: "Vehicle Telemetry: The Complete Guide",
    author: "Dr. Sarah Johnson",
    coverImage: "/assets/Stock Photos/F1/f1-pitwall-telemetry.png",
    description: "An in-depth exploration of vehicle telemetry systems, data acquisition, and performance analytics for modern performance vehicles.",
    category: "Technical",
    rating: 4.9,
    downloadCount: 2547,
    dateAdded: "Jan 15, 2025",
    fileSize: "12.8 MB",
    premium: true
  },
  {
    id: 2,
    title: "Restoration Fundamentals",
    author: "Michael Rodriguez",
    coverImage: "/assets/Stock Photos/F1/classic-f1-paddock.png",
    description: "Learn the essentials of classic car restoration, from body work to mechanical rebuilding and authentic detailing.",
    category: "Maintenance",
    rating: 4.7,
    downloadCount: 1875,
    dateAdded: "Feb 3, 2025",
    fileSize: "10.2 MB",
    premium: false
  },
  {
    id: 3,
    title: "High-Performance Driving Techniques",
    author: "James Miller",
    coverImage: "/assets/Stock Photos/F1/f1-track-turn.png",
    description: "Master the art of performance driving with this comprehensive guide to advanced techniques, track etiquette, and vehicle control.",
    category: "Performance",
    rating: 4.8,
    downloadCount: 3210,
    dateAdded: "Mar 7, 2025",
    fileSize: "15.5 MB",
    premium: true
  },
  {
    id: 4,
    title: "Car Photography Masterclass",
    author: "Alexandra Chen",
    coverImage: "/assets/Stock Photos/F1/ferrari-mountains-sunset.png",
    description: "Learn professional techniques for automotive photography, from equipment selection to post-processing for magazine-quality results.",
    category: "Photography",
    rating: 4.6,
    downloadCount: 1328,
    dateAdded: "Jan 23, 2025",
    fileSize: "18.7 MB",
    premium: false
  },
  {
    id: 5,
    title: "Advanced Detailing Secrets",
    author: "Thomas Wright",
    coverImage: "/assets/Stock Photos/F1/detailing-car-close.png",
    description: "Discover professional-grade detailing techniques, products, and workflows used by top automotive detailers worldwide.",
    category: "Detailing",
    rating: 4.9,
    downloadCount: 2140,
    dateAdded: "Feb 18, 2025",
    fileSize: "14.3 MB",
    premium: true
  },
  {
    id: 6,
    title: "Collecting & Investment Guide",
    author: "Robert Chen",
    coverImage: "/assets/Stock Photos/F1/classic-supercar-lineup.png",
    description: "The definitive guide to automotive collecting, valuation, market trends, and investment strategies for enthusiasts and investors.",
    category: "Collecting",
    rating: 4.8,
    downloadCount: 1560,
    dateAdded: "Mar 2, 2025",
    fileSize: "11.9 MB",
    premium: true
  }
];

const EbooksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Get unique categories for filter
  const categories = [...new Set(ebooksData.map(ebook => ebook.category))];
  
  // Filter and sort ebooks
  const filteredEbooks = ebooksData.filter(ebook => {
    // Filter by search term
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ebook.description.toLowerCase().includes(searchTerm.toLowerCase());
                         
    // Filter by category
    const matchesCategory = activeCategory ? ebook.category === activeCategory : true;
    
    // Filter by premium status
    const matchesPremium = showPremiumOnly ? ebook.premium : true;
    
    return matchesSearch && matchesCategory && matchesPremium;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    } else if (sortBy === 'popular') {
      return b.downloadCount - a.downloadCount;
    } else if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });
  
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${star <= rating ? 'text-amber-400' : 'text-gray-600'} fill-current`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-blue-500 mb-4 font-orbitron flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            P20 Ebooks Vault
          </h1>
          <p className="text-gray-300 max-w-3xl mb-8">
            Access our exclusive library of automotive knowledge, from technical manuals and performance 
            guides to restoration references and collecting insights. Download resources for your journey 
            to automotive excellence.
          </p>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
            <div className="md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author or keyword..."
                  className="bg-gray-800 text-white rounded-md py-2 pl-10 pr-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 md:w-2/3">
              <div className="relative sm:w-1/3">
                <select
                  className="appearance-none bg-gray-800 text-white rounded-md py-2 px-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                  value={activeCategory || ''}
                  onChange={(e) => setActiveCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative sm:w-1/3">
                <select
                  className="appearance-none bg-gray-800 text-white rounded-md py-2 px-4 w-full border border-gray-700 focus:border-blue-500 focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="sm:w-1/3 flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-700 focus:ring-0"
                    checked={showPremiumOnly}
                    onChange={() => setShowPremiumOnly(!showPremiumOnly)}
                  />
                  <span className="ml-2 text-gray-300">Premium Content Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ebooks Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredEbooks.length === 0 ? (
          <div className="text-center py-16">
            <Book className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No ebooks found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEbooks.map((ebook) => (
              <div 
                key={ebook.id} 
                className="bg-gradient-to-r from-gray-900 to-black rounded-lg overflow-hidden border border-gray-800 hover:border-blue-500 transition-all shadow-lg"
              >
                <div className="relative h-48">
                  <img 
                    src={ebook.coverImage} 
                    alt={ebook.title}
                    className="w-full h-full object-cover" 
                  />
                  {ebook.premium && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-sm font-bold m-2 rounded">
                      PREMIUM
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <Tag size={14} className="mr-1 text-blue-400" />
                      <span>{ebook.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{ebook.title}</h3>
                  <p className="text-blue-400 text-sm mb-3">by {ebook.author}</p>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {ebook.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      {renderStars(ebook.rating)}
                      <span className="ml-1 text-sm text-gray-400">({ebook.rating})</span>
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      <Eye size={14} className="mr-1" />
                      <span>{ebook.downloadCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock size={14} className="mr-1" />
                      <span>{ebook.dateAdded}</span>
                      <span className="mx-2">•</span>
                      <span>{ebook.fileSize}</span>
                    </div>
                    
                    <button className={`flex items-center px-3 py-1.5 rounded ${ebook.premium ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'} text-white text-sm`}>
                      <Download size={14} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Premium Membership CTA */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-8 shadow-lg border border-blue-700">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-white mb-3">Unlock Premium Content</h3>
              <p className="text-blue-200 mb-4">
                Gain unlimited access to our exclusive collection of premium technical guides, 
                performance tutorials, and automotive investment insights. Level up your automotive 
                expertise with P20's most advanced resources.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Unlimited downloads of all premium ebooks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Early access to new publications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Exclusive technical support for implementation</span>
                </li>
              </ul>
              <button className="apex-button">Upgrade Membership</button>
            </div>
            <div className="md:w-1/3">
              <div className="bg-gradient-to-r from-gray-900 to-black p-5 rounded-lg border border-gray-800">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-amber-500 mb-2">Premium Stats</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-gray-400 text-sm">Total Premium Guides</div>
                      <div className="text-white text-2xl font-bold">138</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">New Guides This Month</div>
                      <div className="text-white text-2xl font-bold">12</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Member Satisfaction</div>
                      <div className="text-white text-2xl font-bold">97%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbooksPage;