import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGallery, MediaItem } from '../contexts/GalleryContext';

interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  featured?: boolean;
}

interface MotorsportsGalleryProps {
  maxItems?: number;
  showControls?: boolean;
  className?: string;
}

const MotorsportsGallery: React.FC<MotorsportsGalleryProps> = ({ 
  maxItems = 5, 
  showControls = true,
  className = '' 
}) => {
  const { featuredMedia, loadingGallery, error } = useGallery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [hovering, setHovering] = useState(false);

  // Get a subset of the featured media based on maxItems
  const displayMedia = featuredMedia.slice(0, maxItems);

  // Auto-advance gallery slides
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoplayEnabled && !hovering && displayMedia.length > 1) {
      timer = setTimeout(() => {
        nextSlide();
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, autoplayEnabled, hovering, displayMedia.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === displayMedia.length - 1 ? 0 : prevIndex + 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? displayMedia.length - 1 : prevIndex - 1
      );
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (loadingGallery) {
    return (
      <div className={`relative bg-gray-900/30 rounded-xl overflow-hidden aspect-video ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-t-2 border-l-2 border-blue-500 rounded-full animate-spin"></div>
            <span className="mt-3 text-blue-400 text-sm font-orbitron">Loading Gallery</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || displayMedia.length === 0) {
    return (
      <div className={`relative bg-gray-900/30 rounded-xl overflow-hidden aspect-video ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 mt-2 font-orbitron">No gallery items available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border border-blue-900/20 ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* F1-style telemetry header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm py-1 px-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-green-400 font-orbitron">LIVE FEED</span>
        </div>
        <div className="text-xs text-blue-300 font-orbitron">
          {displayMedia[currentIndex].event || 'GoTime Event'}
        </div>
      </div>

      {/* Gallery slider */}
      <div className="relative w-full aspect-video bg-black">
        {displayMedia.map((item, index) => (
          <div 
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={item.src} 
              alt={item.alt} 
              className="w-full h-full object-cover"
            />
            
            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h4 className="text-white font-orbitron text-lg">{item.title}</h4>
              <p className="text-gray-300 text-sm mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        <div className="flex space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
          {displayMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-blue-500 scale-110' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showControls && displayMedia.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full transition-all"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full transition-all"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </>
      )}

      {/* Autoplay control */}
      {showControls && displayMedia.length > 1 && (
        <button
          onClick={() => setAutoplayEnabled(!autoplayEnabled)}
          className="absolute right-3 top-10 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full transition-all"
          aria-label={autoplayEnabled ? "Pause slideshow" : "Play slideshow"}
        >
          {autoplayEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
      )}

      {/* F1-style data overlay */}
      <div className="absolute bottom-16 right-3 z-20 bg-black/40 backdrop-blur-sm rounded-md border border-blue-900/30 p-1.5 font-orbitron">
        <div className="text-xs text-blue-300">
          <span className="text-green-400">ID:</span> {displayMedia[currentIndex].id}
        </div>
        <div className="text-xs text-blue-300">
          <span className="text-green-400">TYPE:</span> {displayMedia[currentIndex].type.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default MotorsportsGallery;