/**
 * Adaptive Image Loading Optimization Service
 * 
 * This service implements advanced techniques for optimizing image loading:
 * 1. Progressive loading - load low-quality placeholders first, then high quality
 * 2. Priority loading - load images in viewport first
 * 3. Caching - store loaded images with expiration policies
 * 4. Automatic resolution adjustment based on device and connection
 */

import { useEffect, useState, useRef } from 'react';
import { searchImage } from './unsplashService';

// Global image cache with metadata
const imageCache = new Map();

// Connection quality detection
const getConnectionQuality = () => {
  if (navigator.connection) {
    const { effectiveType, downlink, saveData } = navigator.connection;
    
    // Define quality based on connection information
    if (saveData) return 'low'; // User has requested data saving
    
    if (effectiveType === '4g' && downlink >= 5) return 'high';
    if (effectiveType === '4g') return 'medium';
    if (effectiveType === '3g') return 'low';
    return 'very-low';
  }
  
  // Default to medium if Network Information API is not available
  return 'medium';
};

// Device pixel density detection
const getDevicePixelDensity = () => {
  return window.devicePixelRatio || 1;
};

/**
 * Get optimized image dimensions based on screen size, element size and connection
 * @param {number} containerWidth - Width of container element 
 * @param {number} containerHeight - Height of container element
 * @returns {Object} Optimized dimensions for image loading
 */
export const getOptimizedDimensions = (containerWidth, containerHeight) => {
  const quality = getConnectionQuality();
  const pixelDensity = getDevicePixelDensity();
  
  // Factor in the pixel density for high-DPI screens
  const baseWidth = containerWidth * pixelDensity;
  const baseHeight = containerHeight * pixelDensity;
  
  // Scale dimensions based on connection quality
  const scaleFactor = 
    quality === 'high' ? 1 :
    quality === 'medium' ? 0.75 :
    quality === 'low' ? 0.5 : 0.3;
  
  return {
    width: Math.round(baseWidth * scaleFactor),
    height: Math.round(baseHeight * scaleFactor),
    quality: quality
  };
};

/**
 * Hook for adaptively loading an image with optimizations
 * @param {string} query - Search query for the image
 * @param {Object} options - Configuration options
 * @returns {Object} Image loading state and metadata
 */
export const useAdaptiveImage = (query, options = {}) => {
  const { 
    priority = 'medium', 
    width = 400, 
    height = 300,
    fallbackUrl = null,
  } = options;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [quality, setQuality] = useState('low');
  const elementRef = useRef(null);
  
  // Check if the image is in the viewport
  const checkIfVisible = () => {
    if (!elementRef.current) return false;
    
    const rect = elementRef.current.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };
  
  // Load the image progressively
  const loadImage = async () => {
    if (query === null || query === undefined) {
      setLoading(false);
      return;
    }
    
    try {
      // Check if image is already in cache
      if (imageCache.has(query)) {
        const cachedData = imageCache.get(query);
        setImageUrl(cachedData.url);
        setLoaded(true);
        setLoading(false);
        return;
      }
      
      // Determine connection quality
      const connectionQuality = getConnectionQuality();
      setQuality(connectionQuality);
      
      // Get appropriate image URL
      let url = null;
      if (connectionQuality === 'very-low' && fallbackUrl) {
        // Use fallback for very poor connections
        url = fallbackUrl;
      } else {
        // Search for the real image
        url = await searchImage(query, true);
        
        if (!url && fallbackUrl) {
          url = fallbackUrl;
        }
      }
      
      if (url) {
        // Cache the result with timestamp for expiration checks
        imageCache.set(query, { 
          url, 
          timestamp: Date.now(),
          quality: connectionQuality
        });
        
        setImageUrl(url);
        setLoaded(true);
      } else {
        setError(new Error('Failed to load image'));
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load the image based on priority and visibility
  useEffect(() => {
    if (priority === 'high') {
      // High priority images load immediately
      loadImage();
    } else {
      // Create an intersection observer for other priorities
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage();
            observer.disconnect();
          }
        });
      }, { threshold: 0.1 }); // 10% visible triggers load
      
      if (elementRef.current) {
        observer.observe(elementRef.current);
      }
      
      return () => {
        observer.disconnect();
      };
    }
  }, [query, priority]);
  
  return {
    imageUrl,
    loading,
    error,
    loaded,
    quality,
    elementRef
  };
};

/**
 * Preload a set of images for future use
 * @param {Array} queries - Array of search queries
 * @param {Object} options - Configuration options
 * @returns {Promise} Resolves when preloading is complete
 */
export const preloadImages = async (queries, options = {}) => {
  const { priority = 'low', concurrent = 3 } = options;
  
  // High priority = load all concurrently
  // Medium/Low priority = load in batches
  if (priority === 'high') {
    return Promise.all(queries.map(query => 
      searchImage(query, true).then(url => {
        if (url) {
          imageCache.set(query, { 
            url, 
            timestamp: Date.now(),
            quality: getConnectionQuality()
          });
        }
        return url;
      })
    ));
  } else {
    // Load in batches
    const results = [];
    for (let i = 0; i < queries.length; i += concurrent) {
      const batch = queries.slice(i, i + concurrent);
      const batchResults = await Promise.all(batch.map(query => 
        searchImage(query, true).then(url => {
          if (url) {
            imageCache.set(query, { 
              url, 
              timestamp: Date.now(),
              quality: getConnectionQuality()
            });
          }
          return url;
        })
      ));
      results.push(...batchResults);
      
      // Add a small delay between batches for low priority
      if (priority === 'low' && i + concurrent < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    return results;
  }
};

/**
 * Clean up expired images from the cache
 * @param {number} maxAge - Maximum age in milliseconds
 */
export const cleanImageCache = (maxAge = 24 * 60 * 60 * 1000) => { // Default: 24 hours
  const now = Date.now();
  imageCache.forEach((data, key) => {
    if (now - data.timestamp > maxAge) {
      imageCache.delete(key);
    }
  });
};

/**
 * Get image loading statistics
 * @returns {Object} Cache statistics
 */
export const getImageStats = () => {
  return {
    cacheSize: imageCache.size,
    connectionQuality: getConnectionQuality(),
    devicePixelDensity: getDevicePixelDensity()
  };
};

// Initialize cache cleanup interval
if (typeof window !== 'undefined') {
  // Run cache cleanup every hour
  setInterval(() => cleanImageCache(), 60 * 60 * 1000);
}