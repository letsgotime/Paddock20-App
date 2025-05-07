import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Info, Camera, Calendar, MapPin, Clock, Upload } from 'lucide-react';

// Gallery types
const GALLERY_TYPES = {
  DELIVERY: 'Delivery Day',
  MODS: 'Modifications',
  EVENTS: 'Events & Shows',
  BEFORE_AFTER: 'Before & After',
  SALE: 'Sale/Trade Day',
};

function VehicleGallery({ 
  vehicle, 
  initialFilter = null,
  onClose = () => {},
  isFullscreen = false 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [showInfo, setShowInfo] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  
  // Filter photos based on the active category
  useEffect(() => {
    if (!vehicle) return;
    
    // Get all vehicle photos from vehicle object
    // In a real app, these would be fetched from the database
    let photosSource = vehicle.photos || [];
    
    // If mock data isn't available, create some sample data
    if (!photosSource || photosSource.length === 0) {
      photosSource = [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1050',
          caption: 'Front view of the car on delivery day',
          date: '2023-06-15',
          location: 'Dealership',
          type: GALLERY_TYPES.DELIVERY,
          photographer: 'Owner'
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1560251180-1a0b9cb16ebd?q=80&w=1050',
          caption: 'Interior detail photo',
          date: '2023-06-15',
          location: 'Dealership',
          type: GALLERY_TYPES.DELIVERY,
          photographer: 'Owner'
        },
        {
          id: 3, 
          url: 'https://images.unsplash.com/photo-1581465525139-35a567956b10?q=80&w=1050',
          caption: 'First engine upgrade - before',
          date: '2023-08-10',
          location: 'Performance Shop',
          type: GALLERY_TYPES.BEFORE_AFTER,
          photographer: 'Technician'
        },
        {
          id: 4,
          url: 'https://images.unsplash.com/photo-1627176389834-fe1e18832484?q=80&w=1050',
          caption: 'First engine upgrade - after',
          date: '2023-08-11', 
          location: 'Performance Shop',
          type: GALLERY_TYPES.BEFORE_AFTER,
          photographer: 'Technician'
        },
        {
          id: 5,
          url: 'https://images.unsplash.com/photo-1477417686303-22a89e17721c?q=80&w=1050',
          caption: 'Mountain drive after performance upgrades',
          date: '2023-09-05',
          location: 'Blue Ridge Mountains',
          type: GALLERY_TYPES.EVENTS,
          photographer: 'Owner'
        },
        {
          id: 6,
          url: 'https://images.unsplash.com/photo-1575642578804-45e8dfa87359?q=80&w=1050',
          caption: 'New wheel installation - before',
          date: '2023-10-20',
          location: 'Specialty Wheel Shop',
          type: GALLERY_TYPES.BEFORE_AFTER,
          photographer: 'Technician'
        },
        {
          id: 7,
          url: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=1050',
          caption: 'New wheel installation - after',
          date: '2023-10-20',
          location: 'Specialty Wheel Shop',
          type: GALLERY_TYPES.BEFORE_AFTER,
          photographer: 'Technician'
        }
      ];
    }
    
    if (activeFilter) {
      setAllPhotos(photosSource.filter(photo => photo.type === activeFilter));
    } else {
      setAllPhotos(photosSource);
    }
    
    setCurrentIndex(0);
  }, [vehicle, activeFilter]);
  
  const handleNext = () => {
    if (transitioning || allPhotos.length === 0) return;
    
    setTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex + 1) % allPhotos.length);
    
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };
  
  const handlePrevious = () => {
    if (transitioning || allPhotos.length === 0) return;
    
    setTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex - 1 + allPhotos.length) % allPhotos.length);
    
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(prev => prev === filter ? null : filter);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'i') {
      setShowInfo(!showInfo);
    }
  };
  
  // Set up keyboard navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  if (!vehicle || allPhotos.length === 0) {
    return (
      <div className={`bg-black/95 text-white p-8 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 flex items-center justify-center' : ''}`}>
        <div className="text-center">
          <h3 className="text-xl font-orbitron text-blue-400 mb-4">No Photos Available</h3>
          <p className="text-gray-400 mb-6">This vehicle doesn't have any photos yet. Add some to showcase your ride!</p>
          <button className="apex-button flex items-center mx-auto">
            <Camera size={16} className="mr-2" /> Add Photos
          </button>
          {isFullscreen && (
            <button 
              onClick={onClose}
              className="mt-4 text-gray-400 hover:text-white"
              aria-label="Close gallery"
            >
              Close Gallery
            </button>
          )}
        </div>
      </div>
    );
  }
  
  const currentPhoto = allPhotos[currentIndex];
  
  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/95' : 'relative bg-gray-900'} 
      flex flex-col rounded-lg overflow-hidden`}
      role="dialog"
      aria-label="Vehicle photo gallery"
    >
      {/* Gallery header */}
      <div className="px-4 py-3 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div>
          <h3 className="text-lg font-orbitron text-blue-400">
            {vehicle.make} {vehicle.model} Gallery
          </h3>
          <p className="text-sm text-gray-400">
            {currentIndex + 1} of {allPhotos.length} photos
            {activeFilter ? ` • ${activeFilter}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full ${showInfo ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            aria-label={showInfo ? "Hide photo information" : "Show photo information"}
            aria-pressed={showInfo}
          >
            <Info size={16} />
          </button>
          
          {isFullscreen && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
              aria-label="Close gallery"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="px-4 py-2 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 flex items-center overflow-x-auto scrollbar-hide">
        <span className="text-gray-400 text-sm mr-3 shrink-0">Filter:</span>
        <div className="flex gap-2 scrollbar-hide">
          {Object.values(GALLERY_TYPES).map(type => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                activeFilter === type 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              aria-pressed={activeFilter === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main gallery content */}
      <div className="relative flex-grow">
        {/* Main image */}
        <div 
          className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black"
          style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : '400px' }}
        >
          <img 
            src={currentPhoto.url} 
            alt={currentPhoto.caption || `Photo ${currentIndex + 1} of ${allPhotos.length}`}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              transitioning ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          {/* Photo information overlay */}
          {showInfo && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              <h4 className="text-white font-medium text-lg mb-2">{currentPhoto.caption}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center text-gray-300">
                  <Calendar size={14} className="mr-2 text-blue-400" />
                  {currentPhoto.date}
                </div>
                {currentPhoto.location && (
                  <div className="flex items-center text-gray-300">
                    <MapPin size={14} className="mr-2 text-blue-400" />
                    {currentPhoto.location}
                  </div>
                )}
                {currentPhoto.photographer && (
                  <div className="flex items-center text-gray-300">
                    <Camera size={14} className="mr-2 text-blue-400" />
                    {currentPhoto.photographer}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Previous photo"
          disabled={allPhotos.length <= 1}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Next photo"
          disabled={allPhotos.length <= 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Thumbnails */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {allPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                index === currentIndex ? 'border-green-500' : 'border-transparent hover:border-gray-600'
              }`}
              aria-label={`View photo ${index + 1}: ${photo.caption || ''}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            >
              <img 
                src={photo.url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          
          <button className="shrink-0 w-16 h-16 rounded overflow-hidden border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-400">
            <Camera size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicleGallery;