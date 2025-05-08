/**
 * Searches for images on Unsplash API
 * @param query The search term
 * @param count The number of images to return
 * @returns Promise that resolves to an array of image URLs
 */
export function searchImages(query: string, count?: number): Promise<string[]>;

/**
 * Gets a random background image from Unsplash
 * @param query Optional search term to filter images
 * @returns Promise that resolves to a URL string
 */
export function getRandomBackground(query?: string): Promise<string>;

/**
 * Initializes the Unsplash service with API credentials
 * @param accessKey The Unsplash API access key
 */
export function initUnsplashService(accessKey: string): void;