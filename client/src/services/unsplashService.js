/**
 * Unsplash service for searching and retrieving images
 */

// Default key from environment variable
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;

/**
 * Search for an image on Unsplash
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.perPage - Results per page (default: 10)
 * @param {string} options.orientation - Image orientation (landscape, portrait, squarish)
 * @returns {Promise<Object>} - Search results
 */
export const searchImage = async (query, options = {}) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash access key is not set. Using local images.');
      // Return empty array to encourage local image usage
      return { results: [] };
    }
    
    const {
      page = 1,
      perPage = 10,
      orientation = 'landscape'
    } = options;
    
    const params = new URLSearchParams({
      query,
      page,
      per_page: perPage,
      orientation,
      content_filter: 'high'
    });
    
    const response = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return { results: [] };
  }
};

/**
 * Get a random image from Unsplash
 * @param {Object} options - Options
 * @param {string} options.query - Search query
 * @param {string} options.username - Limit to a specific Unsplash user
 * @param {string} options.collections - Collection ID(s)
 * @param {string} options.orientation - Image orientation (landscape, portrait, squarish)
 * @returns {Promise<Object>} - Random image
 */
export const getRandomImage = async (options = {}) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash access key is not set. Using local images.');
      // Return null to encourage local image usage
      return null;
    }
    
    const params = new URLSearchParams();
    
    if (options.query) params.append('query', options.query);
    if (options.username) params.append('username', options.username);
    if (options.collections) params.append('collections', options.collections);
    if (options.orientation) params.append('orientation', options.orientation);
    
    const response = await fetch(`https://api.unsplash.com/photos/random?${params}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting random image from Unsplash:', error);
    return null;
  }
};

/**
 * Get car-related images for different makes
 * @returns {Promise<Object>} - Collection of car images by make
 */
export const getCarImages = async () => {
  try {
    // First check if we should use local images
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash access key is not set. Using local images.');
      // Return null to encourage local image usage
      return null;
    }
    
    // Popular car makes to search for
    const makes = ['porsche', 'ferrari', 'lamborghini', 'mercedes', 'bmw', 'audi', 'tesla'];
    
    const results = {};
    
    // Fetch images for each make in parallel
    await Promise.all(
      makes.map(async (make) => {
        const data = await searchImage(make + ' car', { perPage: 5 });
        
        if (data && data.results && data.results.length > 0) {
          results[make] = data.results.map(img => ({
            id: img.id,
            url: img.urls.regular,
            thumb: img.urls.thumb,
            alt: img.alt_description || `${make} car`,
            user: {
              name: img.user.name,
              link: img.user.links.html
            }
          }));
        }
      })
    );
    
    return results;
  } catch (error) {
    console.error('Error fetching car images:', error);
    return null;
  }
};

/**
 * Get a specific image by ID
 * @param {string} id - Unsplash image ID
 * @returns {Promise<Object>} - Image details
 */
export const getImage = async (id) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Unsplash access key is not set. Using local images.');
      return null;
    }
    
    const response = await fetch(`https://api.unsplash.com/photos/${id}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error getting image ${id} from Unsplash:`, error);
    return null;
  }
};

// Export all functions
export default {
  searchImage,
  getRandomImage,
  getCarImages,
  getImage
};