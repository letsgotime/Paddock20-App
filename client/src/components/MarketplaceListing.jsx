import React, { useState, useEffect } from 'react';
import { 
  Tag, Clock, Shield, ChevronDown, MapPin, 
  Star, ExternalLink, Activity, Zap, Image as ImageIcon
} from 'lucide-react';
import { getImageForItem, searchImage } from '../services/unsplashService';

// Local high-quality images for fallbacks
import ferrariImg from '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg';
import patekImg from '@assets/5711_1A_014_1@2x.jpg';

const MarketplaceListing = ({ listing, isAdmin, onEdit, onDelete, onViewTelemetry, expandedByDefault = false }) => {
  const [expanded, setExpanded] = useState(expandedByDefault);
  const [showActions, setShowActions] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Fetch images from Unsplash when component mounts
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setImageLoading(true);
        
        // Try to get image from our precise mapping first (uses enhanced matching logic)
        let url = getImageForItem(listing.type, listing.brand, listing.model);
        
        // If not in our precise mapping, fetch from Unsplash as a backup
        if (!url) {
          const searchQuery = `${listing.brand} ${listing.model} ${listing.type === 'vehicle' ? 'car' : 'watch'}`;
          url = await searchImage(searchQuery);
        }
        
        // If still no image, use our local image assets as final fallback
        if (!url) {
          // Use local fallback images based on type
          url = listing.type === 'vehicle' ? ferrariImg : patekImg;
        }
        
        setImageUrl(url);
        setImageError(false);
      } catch (err) {
        console.error('Error fetching image:', err);
        setImageError(true);
        // Use local fallback images
        setImageUrl(listing.type === 'vehicle' ? ferrariImg : patekImg);
      } finally {
        setImageLoading(false);
      }
    };
    
    fetchImage();
  }, [listing.brand, listing.model, listing.type]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency, 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getConditionColor = (condition) => {
    switch(condition?.toLowerCase()) {
      case 'new':
      case 'mint':
      case 'excellent':
        return 'text-green-400';
      case 'very good':
      case 'good':
        return 'text-blue-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderListingImage = () => {
    if (imageLoading) {
      return (
        <div className="flex-shrink-0 relative w-28 h-28 md:w-36 md:h-36 rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (imageError || !imageUrl) {
      return (
        <div className="flex-shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center">
          <div className="text-gray-700 text-center p-2">
            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
            <span className="text-xs">{listing.brand} {listing.model}</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex-shrink-0 relative w-28 h-28 md:w-36 md:h-36 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
        <img 
          src={imageUrl} 
          alt={`${listing.brand} ${listing.model}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={() => {
            setImageError(true);
            setImageUrl(listing.type === 'vehicle' ? ferrariImg : patekImg);
          }}
        />
      </div>
    );
  };

  return (
    <div 
      className={`relative bg-gradient-to-br from-gray-900 to-black border ${listing.featured ? 'border-blue-800' : 'border-gray-800'} rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 transform hover:-translate-y-1 ${listing.sold ? 'opacity-70' : ''}`}
      onMouseEnter={() => {
        isAdmin && setShowActions(true);
      }}
      onMouseLeave={() => {
        isAdmin && setShowActions(false);
      }}
    >
      {listing.featured && (
        <div className="absolute top-0 right-0 bg-blue-700 text-xs text-white px-2 py-1 rounded-bl-lg z-10">
          Featured
        </div>
      )}
      
      {listing.sold && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-red-900/80 text-white px-4 py-2 rounded-lg transform rotate-12 font-bold border border-red-700">
            SOLD
          </div>
        </div>
      )}
      
      {isAdmin && showActions && !listing.sold && (
        <div className="absolute top-2 right-2 flex space-x-2 z-30">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(listing);
            }}
            className="p-1 bg-blue-900/80 text-blue-100 rounded hover:bg-blue-800"
          >
            Edit
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(listing.id);
            }}
            className="p-1 bg-red-900/80 text-red-100 rounded hover:bg-red-800"
          >
            Remove
          </button>
        </div>
      )}
      
      <div className="p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex gap-4">
          {renderListingImage()}
          
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-medium text-white">
                {listing.brand} {listing.model}
              </h3>
              <span className="text-lg font-semibold text-blue-400">
                {formatCurrency(listing.price, listing.currency)}
              </span>
            </div>
            
            <div className="flex items-center text-sm mb-2">
              <span className="inline-block px-2 py-0.5 bg-gray-800 rounded-full text-xs mr-2">
                {listing.type === 'timepiece' ? 'Watch' : 'Vehicle'}
              </span>
              <span className="text-gray-400 mr-2">
                {listing.year}
              </span>
              <span className={`${getConditionColor(listing.condition)}`}>
                {listing.condition}
              </span>
            </div>
            
            <div className="text-gray-400 text-sm line-clamp-2 mb-2">
              {listing.description}
            </div>
            
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1">
              {listing.serialNumber && (
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>SN: {listing.serialNumber.substring(0, 4)}...</span>
                </div>
              )}
              
              {listing.reference && (
                <div className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  <span>Ref: {listing.reference}</span>
                </div>
              )}
              
              {listing.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{listing.location}</span>
                </div>
              )}
              
              {listing.dateAdded && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Listed: {listing.dateAdded}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-800 p-4 bg-black/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Details</h4>
              <div className="space-y-2">
                {listing.type === 'timepiece' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reference</span>
                      <span className="text-white">{listing.reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Box & Papers</span>
                      <span className="text-white">{listing.boxPapers ? 'Yes' : 'No'}</span>
                    </div>
                  </>
                )}
                
                {listing.type === 'vehicle' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mileage</span>
                      <span className="text-white">{listing.mileage?.toLocaleString()} mi</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Engine</span>
                      <span className="text-white">{listing.engineType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Transmission</span>
                      <span className="text-white">{listing.transmission}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Condition</span>
                  <span className={getConditionColor(listing.condition)}>{listing.condition}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Year</span>
                  <span className="text-white">{listing.year}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Seller Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seller</span>
                  <span className="text-white">{listing.seller}</span>
                </div>
                
                {listing.sellerRating && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rating</span>
                    <span className="flex items-center text-amber-400">
                      {listing.sellerRating.toFixed(1)}
                      <Star className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white">{listing.location}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="text-sm px-4 py-2 bg-blue-900 text-blue-100 rounded-lg hover:bg-blue-800 transition-all duration-300 flex items-center hover:shadow-md hover:shadow-blue-900/30 transform hover:-translate-y-0.5">
                  <span>Contact Seller</span>
                  <ExternalLink className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Key Performance Indicators for Vehicles */}
          {expanded && listing.type === 'vehicle' && (listing.horsePower || listing.topSpeed || listing.acceleration) && (
            <div className="mt-6 border-t border-gray-800 pt-6">
              <h4 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-green-500" />
                Performance Metrics
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.horsePower && (
                  <div className="bg-gray-900/50 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800/60 hover:shadow-md hover:shadow-amber-900/20 transform hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-amber-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-400">HORSEPOWER</div>
                      <Zap className="h-3 w-3 text-amber-500" />
                    </div>
                    <div className="text-xl font-bold text-white">{listing.horsePower}</div>
                    <div className="text-xs text-gray-500">HP</div>
                  </div>
                )}
                
                {listing.torque && (
                  <div className="bg-gray-900/50 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800/60 hover:shadow-md hover:shadow-blue-900/20 transform hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-blue-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-400">TORQUE</div>
                      <Activity className="h-3 w-3 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold text-white">{listing.torque}</div>
                    <div className="text-xs text-gray-500">LB-FT</div>
                  </div>
                )}
                
                {listing.topSpeed && (
                  <div className="bg-gray-900/50 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800/60 hover:shadow-md hover:shadow-rose-900/20 transform hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-rose-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-400">TOP SPEED</div>
                      <Gauge className="h-3 w-3 text-rose-500" />
                    </div>
                    <div className="text-xl font-bold text-white">{listing.topSpeed}</div>
                    <div className="text-xs text-gray-500">MPH</div>
                  </div>
                )}
                
                {listing.acceleration && (
                  <div className="bg-gray-900/50 p-3 rounded-lg transition-all duration-300 hover:bg-gray-800/60 hover:shadow-md hover:shadow-green-900/20 transform hover:-translate-y-0.5 cursor-pointer border border-transparent hover:border-green-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-gray-400">0-60 MPH</div>
                      <BarChart3 className="h-3 w-3 text-green-500" />
                    </div>
                    <div className="text-xl font-bold text-white">{listing.acceleration}</div>
                    <div className="text-xs text-gray-500">SECONDS</div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Call the onViewTelemetry function passed as a prop
                    if (onViewTelemetry) {
                      onViewTelemetry(listing.id);
                    }
                  }}
                  className="group text-sm px-4 py-2 bg-gradient-to-br from-green-900 to-green-800 text-green-100 rounded-lg hover:from-green-800 hover:to-green-700 transition-all duration-300 flex items-center border border-green-700 shadow-md hover:shadow-lg hover:shadow-green-900/30 transform hover:-translate-y-0.5"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  <span>View F1-Style Telemetry</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Full Description</h4>
            <p className="text-gray-300 text-sm">{listing.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceListing;