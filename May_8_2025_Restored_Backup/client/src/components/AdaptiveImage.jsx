import React, { useState, memo, useEffect } from 'react';
import { useAdaptiveImage } from '../services/adaptiveImageService';
import { Loader, ImageOff } from 'lucide-react';

/**
 * Adaptive Image Component
 * A smart image component that optimizes loading based on device capabilities and viewport
 * 
 * Features:
 * - Progressive loading with blur-up technique
 * - Lazy loading for off-screen images
 * - Priority-based loading (critical vs non-critical)
 * - Fallback handling with customizable placeholder
 * - Size optimization based on container and network
 * - Loading & error states with customizable indicators
 */
const AdaptiveImage = memo(({
  query,
  alt = 'Image',
  fallbackUrl = null,
  className = '',
  width = 400,
  height = 300,
  priority = 'medium', // 'high', 'medium', 'low'
  showPlaceholder = true,
  style,
  onLoad,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const { 
    imageUrl, 
    loading, 
    error, 
    quality, 
    elementRef 
  } = useAdaptiveImage(query, {
    priority,
    width,
    height,
    fallbackUrl
  });

  // Handle successful load
  const handleImageLoad = (e) => {
    setLoaded(true);
    if (onLoad) onLoad(e);
  };
  
  // Combine styles for positioning and progressive loading
  const combinedStyle = {
    ...style,
    objectFit: 'cover',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };
  
  // Calculate placeholder shade based on loading state
  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    opacity: loaded ? 0 : 0.7,
    transition: 'opacity 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: loaded ? -1 : 1
  };
  
  // Debug information
  useEffect(() => {
    if (priority === 'high' && loading) {
      console.log(`[AdaptiveImage] High priority image loading: ${query}`);
    }
  }, [priority, loading, query]);

  return (
    <div 
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || 'auto' }}
      {...props}
    >
      {/* Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          style={combinedStyle}
          onLoad={handleImageLoad}
          className={`w-full h-full ${className}`}
        />
      )}
      
      {/* Placeholder/Loading/Error State */}
      {showPlaceholder && !loaded && (
        <div style={placeholderStyle}>
          {error ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <ImageOff size={24} />
              <span className="text-xs mt-1">Failed to load</span>
            </div>
          ) : (
            loading && (
              <Loader size={24} className="text-blue-500 animate-spin" />
            )
          )}
        </div>
      )}
      
      {/* Quality Indicator (for development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="absolute top-0 right-0 p-1 text-xs bg-black/70 text-white"
          style={{ opacity: 0.7 }}
        >
          {quality}
        </div>
      )}
    </div>
  );
});

/**
 * Image Grid Component
 * Displays a responsive grid of adaptive images
 */
export const AdaptiveImageGrid = memo(({
  queries,
  columns = 3,
  gap = 4,
  height = 180,
  priority = 'medium',
  className = '',
  onImageClick,
  ...props
}) => {
  return (
    <div 
      className={`grid gap-${gap} ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, 1fr)` 
      }}
      {...props}
    >
      {queries.map((query, index) => (
        <AdaptiveImage
          key={index}
          query={query}
          height={height}
          priority={index < 3 ? 'high' : priority}
          alt={`Image ${index + 1}`}
          className={onImageClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
          onClick={onImageClick ? () => onImageClick(query, index) : undefined}
        />
      ))}
    </div>
  );
});

/**
 * Hero Image Component with Adaptive Loading
 */
export const AdaptiveHeroImage = memo(({
  query,
  title,
  subtitle,
  height = 400,
  priority = 'high',
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ height }}
      {...props}
    >
      <AdaptiveImage
        query={query}
        priority={priority}
        width="100%"
        height={height}
        className="w-full h-full"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      
      {/* Content */}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 p-6">
          {title && <h2 className="text-white font-orbitron text-2xl">{title}</h2>}
          {subtitle && <p className="text-gray-300">{subtitle}</p>}
        </div>
      )}
    </div>
  );
});

export default AdaptiveImage;