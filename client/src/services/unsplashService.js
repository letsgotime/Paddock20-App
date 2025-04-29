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

// Direct mapping of specific models to their exact image URLs
// This provides precise image association for known inventory
const PRECISE_IMAGE_MAPPING = {
  // Timepieces
  'Patek Philippe Nautilus 5711/1A-014': 'https://cdn.watchbox.com/watchbox-images/Patek-Philippe-5711-1A-014-139139-1.jpg',
  'Rolex Daytona 116500LN': 'https://cdn.watchbox.com/watchbox-images/Rolex-116500LN-White-Dial-123456-1.jpg',
  'Audemars Piguet Royal Oak 15202ST': 'https://cdn.watchbox.com/watchbox-images/Audemars-Piguet-15202ST-Blue-Dial-123456-1.jpg',
  'F.P. Journe Chronomètre Bleu': 'https://cdn.watchbox.com/watchbox-images/FP-Journe-Chronometre-Bleu-123456-1.jpg',
  'Richard Mille RM 35-02': 'https://cdn.watchbox.com/watchbox-images/Richard-Mille-RM35-02-Rafael-Nadal-123456-1.jpg',
  'Lange Zeitwerk': 'https://cdn.watchbox.com/watchbox-images/Lange-Zeitwerk-140-029-123456-1.jpg',
  
  // Vehicles
  'Lamborghini Gallardo LP570-4': 'https://cdn.motor1.com/images/mgl/nJAvV/s1/2013-lamborghini-gallardo-lp570-4-superleggera.jpg',
  'Ferrari 458 Italia': 'https://www.topgear.com/sites/default/files/cars-car/image/2015/01/ferrari_458_italia_001.jpg',
  'Lamborghini Aventador SVJ': 'https://cdn.motor1.com/images/mgl/NGXeq/s1/lamborghini-aventador-svj.jpg',
  'Porsche 911 GT3': 'https://cdn.motor1.com/images/mgl/BRbkp/s1/2022-porsche-911-gt3.jpg',
  'McLaren 765LT': 'https://cdn.motor1.com/images/mgl/lbP6M/s1/mclaren-765lt.jpg',
  'Mercedes-AMG GT Black Series': 'https://cdn.motor1.com/images/mgl/xOop9/s1/mercedes-amg-gt-black-series.jpg',
  'Bugatti Chiron': 'https://cdn.motor1.com/images/mgl/xmRX7/s1/bugatti-chiron.jpg'
};

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

    try {
      // Execute searches in parallel, but limit to 3 at a time to avoid rate limits
      const batchSize = 3;
      for (let i = 0; i < commonSearches.length; i += batchSize) {
        const batch = commonSearches.slice(i, i + batchSize);
        await Promise.all(batch.map(term => searchImage(term, true)));
        
        // Small delay to avoid overwhelming the API
        if (i + batchSize < commonSearches.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.warn('Image prefetching partially failed:', error.message);
    }

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
    // Enhanced query parameters for better results:
    // - orientation=landscape for vehicle images (better aspect ratio)
    // - content_filter=high to ensure appropriate images
    // - per_page=3 to get more variety
    // - order_by=relevant for better matching
    const orientation = query.includes('car') || query.includes('vehicle') ? 'landscape' : 'squarish';
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=${orientation}&content_filter=high&order_by=relevant`,
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
      // Use some randomness to get variety in the images
      const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 3));
      const imageUrl = data.results[randomIndex].urls.regular;
      
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
 * @returns {string|null} - Image URL or null
 */
export const getImageForItem = (type, brand, model) => {
  // First check our precise mapping for exact models
  // Try various combinations of the brand and model to increase match chances
  const fullName = `${brand} ${model}`;
  const matchKeys = [
    fullName,
    brand + ' ' + model.split(' ')[0], // Just the first word of model
    model
  ];
  
  // Try each possible match pattern
  for (const key of matchKeys) {
    for (const [mappingKey, url] of Object.entries(PRECISE_IMAGE_MAPPING)) {
      if (key.includes(mappingKey) || mappingKey.includes(key)) {
        return url;
      }
    }
  }
  
  // If no exact match found, try the cached Unsplash API results
  const cacheKey = `${brand} ${model} ${type === 'vehicle' ? 'car' : 'watch'}`;
  return imageCache.get(cacheKey) || null;
};

/**
 * Get fallback images for different types
 * @param {string} type - Item type ('vehicle' or 'timepiece')
 * @returns {string} - Fallback image URL
 */
export const getFallbackImage = (type) => {
  return type === 'vehicle' ? ferrariImg : patekImg;
};