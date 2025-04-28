// client/src/components/CarCultureSpotsExplorer.tsx
import React, { useState, useEffect } from 'react';
import { findCarCultureSpotsAlongRoute, CarCultureSpot } from '@/services/speedhuntersAPI';
import { Star, MapPin, Clock, DollarSign, Link, Camera, ChevronRight, ChevronDown, Check, Car, Coffee, Users } from 'lucide-react';

interface CarCultureSpotsExplorerProps {
  waypoints: Array<{lat: number, lng: number}>;
  radius?: number;
  showTitle?: boolean;
  maxSpots?: number;
  onSelectSpot?: (spot: CarCultureSpot) => void;
}

const CarCultureSpotsExplorer: React.FC<CarCultureSpotsExplorerProps> = ({
  waypoints,
  radius = 15,
  showTitle = true,
  maxSpots = 5,
  onSelectSpot
}) => {
  const [spots, setSpots] = useState<CarCultureSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(maxSpots);
  
  useEffect(() => {
    if (waypoints.length === 0) return;
    
    const fetchSpots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await findCarCultureSpotsAlongRoute(
          waypoints,
          radius,
          [], // No category filtering initially
          [] // No tag filtering initially
        );
        
        setSpots(result);
      } catch (err) {
        console.error('Error fetching car culture spots:', err);
        setError('Failed to load car culture spots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpots();
  }, [waypoints, radius]);
  
  // Function to filter spots
  const filteredSpots = spots.filter(spot => {
    if (filter === 'all') return true;
    return spot.category === filter || spot.tags.includes(filter);
  }).slice(0, displayCount);
  
  // Get unique categories and tags for filtering
  const categories = Array.from(new Set(spots.map(spot => spot.category)));
  const tags = Array.from(new Set(spots.flatMap(spot => spot.tags)));
  
  // Function to format pricing
  const formatPricing = (spot: CarCultureSpot) => {
    if (spot.pricing?.entryFee !== undefined) {
      return spot.pricing.entryFee > 0 ? `$${spot.pricing.entryFee}` : 'Free';
    }
    return spot.pricing?.typical || 'Price info N/A';
  };
  
  // Function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'landmark':
        return <MapPin className="h-4 w-4" />;
      case 'shop':
        return <DollarSign className="h-4 w-4" />;
      case 'museum':
        return <Car className="h-4 w-4" />;
      case 'garage':
        return <Car className="h-4 w-4" />;
      case 'dealership':
        return <Car className="h-4 w-4" />;
      case 'photographer_spot':
        return <Camera className="h-4 w-4" />;
      case 'meetup_location':
        return <Users className="h-4 w-4" />;
      case 'restaurant':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };
  
  if (loading && spots.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Culture Spots</h2>}
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }
  
  if (error && spots.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Culture Spots</h2>}
        <div className="text-red-400 text-center py-4">{error}</div>
      </div>
    );
  }
  
  if (spots.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg w-full">
        {showTitle && <h2 className="text-blue-400 font-orbitron text-xl mb-3">Car Culture Spots</h2>}
        <div className="text-gray-400 text-center py-4">No car culture spots found along this route. Try increasing the search radius.</div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg w-full shadow-lg border border-gray-700">
      {showTitle && (
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-blue-400 font-orbitron text-xl flex items-center">
            <Star className="mr-2 h-5 w-5" />
            Car Culture Destinations
          </h2>
          <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full">
            Via Speedhunters
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-green-500 text-black font-medium' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Spots
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap capitalize flex items-center ${
                filter === category 
                  ? 'bg-green-500 text-black font-medium' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="mr-1">{getCategoryIcon(category)}</span>
              {category.replace('_', ' ')}
            </button>
          ))}
          
          {tags.slice(0, 5).map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap capitalize ${
                filter === tag 
                  ? 'bg-green-500 text-black font-medium' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredSpots.map(spot => (
          <div 
            key={spot.id}
            className="bg-black/30 rounded-lg p-3 border border-gray-700 hover:border-blue-700 transition-colors cursor-pointer"
            onClick={() => expandedSpotId === spot.id 
              ? setExpandedSpotId(null) 
              : setExpandedSpotId(spot.id)
            }
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="text-white font-medium">{spot.name}</h3>
                  {spot.verified && (
                    <span className="ml-2 bg-blue-900/40 p-0.5 rounded-full" title="Verified">
                      <Check className="h-3 w-3 text-blue-400" />
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-400 text-sm mt-1">
                  <span className="capitalize text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{spot.category.replace('_', ' ')}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    <span>{spot.rating.toFixed(1)}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span>{formatPricing(spot)}</span>
                </div>
              </div>
              <div>
                {expandedSpotId === spot.id ? (
                  <ChevronDown className="h-5 w-5 text-blue-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>
            
            {/* Preview data visible when collapsed */}
            <div className="mt-2 flex flex-wrap gap-1">
              {spot.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {spot.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs">
                  +{spot.tags.length - 3} more
                </span>
              )}
            </div>
            
            {/* Expanded details */}
            {expandedSpotId === spot.id && (
              <div className="mt-3 border-t border-gray-700 pt-3 space-y-3">
                <p className="text-gray-300 text-sm">{spot.description}</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-400 mr-1 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <div>{spot.location.address || spot.location.city}</div>
                      {spot.location.city && spot.location.state && (
                        <div>{spot.location.city}, {spot.location.state}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-400 mr-1" />
                    <span className="text-sm text-gray-300">
                      {spot.openHours?.monday && `Mon: ${spot.openHours.monday}`}
                    </span>
                  </div>
                </div>
                
                {spot.featuredCars.length > 0 && (
                  <div>
                    <h4 className="text-sm text-blue-400 mb-1">Famous Cars:</h4>
                    <div className="flex flex-wrap gap-1">
                      {spot.featuredCars.map(car => (
                        <span 
                          key={car} 
                          className="px-2 py-0.5 bg-gray-700 text-white rounded-full text-xs"
                        >
                          {car}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {spot.amenities.length > 0 && (
                  <div>
                    <h4 className="text-sm text-blue-400 mb-1">Amenities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {spot.amenities.map(amenity => (
                        <span 
                          key={amenity} 
                          className="px-2 py-0.5 bg-gray-700 text-white rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {spot.socialProfiles?.website && (
                    <a 
                      href={spot.socialProfiles.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link className="h-3 w-3 mr-1" /> 
                      Website
                    </a>
                  )}
                  
                  {spot.socialProfiles?.instagram && (
                    <a 
                      href={`https://instagram.com/${spot.socialProfiles.instagram.replace('@', '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center px-3 py-1 bg-pink-600 text-white rounded-full text-xs hover:bg-pink-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Camera className="h-3 w-3 mr-1" /> 
                      Instagram
                    </a>
                  )}
                  
                  <button
                    className="flex items-center px-3 py-1 bg-gray-700 text-white rounded-full text-xs hover:bg-gray-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSpot && onSelectSpot(spot);
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" /> 
                    Add to Route
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {spots.length > displayCount && (
        <button 
          className="w-full mt-3 py-2 text-center text-blue-400 hover:text-blue-300 text-sm"
          onClick={() => setDisplayCount(prev => prev + 5)}
        >
          Show More Spots
        </button>
      )}
    </div>
  );
};

export default CarCultureSpotsExplorer;