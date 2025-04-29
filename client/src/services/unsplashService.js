/**
 * Unsplash API Service
 * Handles image fetching and caching for marketplace listings
 */

// In-memory image cache to avoid excessive API calls
const imageCache = new Map();

// Access key from environment variables (set in .env file)
// We're hard-coding for testing purposes - in a production environment, this would come from environment variables
const accessKey = "2JgRSbUMLc1H5x1-PH_apKjy8jzGF4KLluer_xCO9kk";

// Fallback images for when API fails
import ferrariImg from '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg';
import patekImg from '@assets/5711_1A_014_1@2x.jpg';

/**
 * Initialize cache with common search terms to avoid rate limiting during browsing
 */
export const initializeImageCache = async () => {
  console.log('Unsplash access key available:', !!accessKey);
  console.log('Access key value:', import.meta.env.VITE_UNSPLASH_ACCESS_KEY);
  
  if (!accessKey) {
    console.warn('Unsplash API key not found. Image fetching will use fallback images.');
    return;
  }

  try {
    // Pre-fetch common search terms to populate cache
    const commonSearches = [
      'Ferrari sports car',
      'Porsche 911',
      'BMW M3',
      'Rolex watch',
      'Patek Philippe watch',
      'Audemars Piguet watch'
    ];

    // Execute searches in parallel
    await Promise.all(
      commonSearches.map(term => searchImage(term, true))
    );

    return true;
  } catch (error) {
    console.error('Error initializing image cache:', error);
    return false;
  }
};

/**
 * Search for an image on Unsplash
 * @param {string} query - Search query
 * @param {boolean} silent - Silent mode (no errors)
 * @returns {Promise<string|null>} - Image URL or null
 */
export const searchImage = async (query, silent = false) => {
  if (!accessKey) {
    if (!silent) console.warn('Unsplash API key not found');
    return null;
  }

  // Check cache first
  if (imageCache.has(query)) {
    return imageCache.get(query);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      
      // Cache the result
      imageCache.set(query, imageUrl);
      
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    if (!silent) console.error('Error fetching image from Unsplash:', error);
    return null;
  }
};

/**
 * Get image for a specific listing item type (vehicle or timepiece)
 * @param {string} type - Item type ('vehicle' or 'timepiece')
 * @param {string} brand - Brand name
 * @param {string} model - Model name
 * @returns {string|null} - Cached image URL or null
 */
export const getImageForItem = (type, brand, model) => {
  const key = `${brand} ${model} ${type === 'vehicle' ? 'car' : 'watch'}`;
  return imageCache.get(key) || null;
};

/**
 * Get fallback images for different types
 * @param {string} type - Item type ('vehicle' or 'timepiece')
 * @returns {string} - Fallback image URL
 */
export const getFallbackImage = (type) => {
  return type === 'vehicle' ? ferrariImg : patekImg;
};