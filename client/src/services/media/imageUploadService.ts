/**
 * Image Upload API Service
 * 
 * Implements the APILayer Image Upload API with:
 * - Image uploading and storage
 * - Image optimization and resizing
 * - Image retrieval and management
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const IMAGE_UPLOAD_BASE_URL = 'https://api.apilayer.com/image_upload';
const IMAGE_UPLOAD_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration
const CACHE_TTL_DAYS = 30; // 30 days cache for image metadata
const IMAGE_METADATA_CACHE_KEY = 'image_upload_metadata_cache';
const USAGE_STATS_KEY = 'image_upload_usage_stats';
const UPLOADED_IMAGES_KEY = 'uploaded_images_list';

// Request limits (free tier is typically limited)
const DAILY_REQUEST_LIMIT = 50;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API responses
export interface ImageUploadResponse {
  success: boolean;
  message?: string;
  error?: string;
  url?: string;
  filename?: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  id?: string;
  created_at?: string;
}

export interface OptimizedImageOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'jpg' | 'png' | 'webp' | 'auto';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  blur?: number; // 0.3-1000
  sharpen?: number; // 0.1-10
  grayscale?: boolean;
  flip?: boolean;
  flop?: boolean;
  rotate?: number; // 0-360
}

// Interface for image metadata
export interface ImageMetadata {
  id: string;
  url: string;
  filename: string;
  format: string;
  width: number;
  height: number;
  size: number;
  created_at: string;
  tags?: string[];
  description?: string;
  uploadedAt: number; // Timestamp when image was uploaded by this client
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  totalUploaded: number;
  totalSize: number;
  apiCallLog: {
    timestamp: number;
    endpoint: string;
    operation: string;
    cacheHit: boolean;
  }[];
}

/**
 * ImageUploadService class for image management
 */
class ImageUploadService {
  private metadataCache: Map<string, ImageMetadata> = new Map();
  private isLoadingCache: boolean = false;
  private usageStats: UsageStats;
  private uploadedImages: string[] = [];
  
  constructor() {
    // Initialize usage stats
    const savedStats = localStorage.getItem<UsageStats>(USAGE_STATS_KEY);
    
    if (savedStats) {
      this.usageStats = savedStats;
      
      // Check if we need to reset the daily counter
      if (this.shouldResetDailyCounter()) {
        this.resetDailyCounter();
      }
    } else {
      // Initialize new usage stats
      this.usageStats = {
        requestsToday: 0,
        dailyQuota: DAILY_REQUEST_LIMIT,
        dayStartTimestamp: this.getCurrentDayStart(),
        lastResetTimestamp: Date.now(),
        totalUploaded: 0,
        totalSize: 0,
        apiCallLog: []
      };
      this.saveUsageStats();
    }
    
    // Load uploaded images list
    const savedImages = localStorage.getItem<string[]>(UPLOADED_IMAGES_KEY);
    if (savedImages) {
      this.uploadedImages = savedImages;
    }
    
    this.loadCacheFromStorage();
  }
  
  /**
   * Load cache from persistent storage
   */
  private async loadCacheFromStorage(): Promise<void> {
    if (this.isLoadingCache) return;
    this.isLoadingCache = true;
    
    try {
      const cachedData = localStorage.getItem(IMAGE_METADATA_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.metadataCache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.metadataCache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.metadataCache.size} image metadata cache entries`);
      }
    } catch (error) {
      console.error('Failed to load image metadata cache from storage:', error);
    } finally {
      this.isLoadingCache = false;
    }
  }
  
  /**
   * Save current cache to persistent storage
   */
  private saveCache(): void {
    try {
      const cacheObject: Record<string, ImageMetadata> = {};
      this.metadataCache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem(IMAGE_METADATA_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save image metadata cache to storage:', error);
    }
  }
  
  /**
   * Save uploaded images list to storage
   */
  private saveUploadedImagesList(): void {
    localStorage.setItem(UPLOADED_IMAGES_KEY, this.uploadedImages);
  }
  
  /**
   * Save usage statistics to storage
   */
  private saveUsageStats(): void {
    localStorage.setItem(USAGE_STATS_KEY, this.usageStats);
  }
  
  /**
   * Get the start timestamp of the current day
   */
  private getCurrentDayStart(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  
  /**
   * Check if the daily counter should be reset
   */
  private shouldResetDailyCounter(): boolean {
    const currentDayStart = this.getCurrentDayStart();
    return currentDayStart > this.usageStats.dayStartTimestamp;
  }
  
  /**
   * Reset the daily API call counter
   */
  private resetDailyCounter(): void {
    console.log('Resetting Image Upload API daily counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(endpoint: string, operation: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      endpoint,
      operation,
      cacheHit
    });
    
    // Trim the log if it gets too large
    if (this.usageStats.apiCallLog.length > 100) {
      this.usageStats.apiCallLog = this.usageStats.apiCallLog.slice(-100);
    }
    
    this.saveUsageStats();
  }
  
  /**
   * Check if we've exceeded our daily API call quota
   */
  private hasExceededQuota(): boolean {
    // Check if we need to reset first
    if (this.shouldResetDailyCounter()) {
      this.resetDailyCounter();
      return false;
    }
    return this.usageStats.requestsToday >= this.usageStats.dailyQuota;
  }
  
  /**
   * Upload an image to the service
   * @param file Image file to upload
   * @param options Upload options
   * @returns Upload response with image URL and metadata
   */
  async uploadImage(
    file: File, 
    options?: { 
      tags?: string[], 
      description?: string,
      optimize?: boolean
    }
  ): Promise<ImageUploadResponse> {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check file size (5MB limit for most image upload APIs)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }
    
    // If we've exceeded our quota, stop
    if (this.hasExceededQuota()) {
      console.warn('Image Upload API daily quota exceeded, refusing to make new requests');
      throw new Error('API quota exceeded');
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options?.optimize) {
        formData.append('optimize', 'true');
      }
      
      const response = await axios.post(`${IMAGE_UPLOAD_BASE_URL}/upload`, formData, {
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': IMAGE_UPLOAD_API_KEY,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout for uploads
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Extract image metadata
      const metadata: ImageMetadata = {
        id: response.data.id || crypto.randomUUID(),
        url: response.data.url,
        filename: response.data.filename || file.name,
        format: response.data.format || file.type.split('/')[1],
        width: response.data.width || 0,
        height: response.data.height || 0,
        size: response.data.size || file.size,
        created_at: response.data.created_at || new Date().toISOString(),
        tags: options?.tags || [],
        description: options?.description || '',
        uploadedAt: Date.now()
      };
      
      // Add to uploaded images list
      this.uploadedImages.push(metadata.id);
      this.saveUploadedImagesList();
      
      // Update usage stats
      this.usageStats.totalUploaded++;
      this.usageStats.totalSize += file.size;
      this.recordApiCall('/upload', 'uploadImage', false);
      
      // Cache metadata
      this.metadataCache.set(metadata.id, metadata);
      this.saveCache();
      
      return {
        success: true,
        ...metadata
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  /**
   * Get a URL for an optimized version of an uploaded image
   * @param imageId The ID of the uploaded image
   * @param options Optimization options
   */
  getOptimizedImageUrl(imageId: string, options: OptimizedImageOptions): string | null {
    const metadata = this.metadataCache.get(imageId);
    if (!metadata || !metadata.url) {
      console.error(`No image found with ID ${imageId}`);
      return null;
    }
    
    // Record this operation
    this.recordApiCall('/optimize', 'getOptimizedImageUrl', true);
    
    // If the service provides a way to transform images via URL parameters
    let url = metadata.url;
    const params: string[] = [];
    
    if (options.width) params.push(`width=${options.width}`);
    if (options.height) params.push(`height=${options.height}`);
    if (options.quality) params.push(`quality=${options.quality}`);
    if (options.format) params.push(`format=${options.format}`);
    if (options.fit) params.push(`fit=${options.fit}`);
    if (options.blur) params.push(`blur=${options.blur}`);
    if (options.sharpen) params.push(`sharpen=${options.sharpen}`);
    if (options.grayscale) params.push(`grayscale=true`);
    if (options.flip) params.push(`flip=true`);
    if (options.flop) params.push(`flop=true`);
    if (options.rotate) params.push(`rotate=${options.rotate}`);
    
    // Add parameters to URL if there are any
    if (params.length > 0) {
      url += url.includes('?') ? '&' : '?';
      url += params.join('&');
    }
    
    return url;
  }
  
  /**
   * Get metadata for an uploaded image
   * @param imageId The ID of the uploaded image
   */
  getImageMetadata(imageId: string): ImageMetadata | null {
    const metadata = this.metadataCache.get(imageId);
    
    if (!metadata) {
      console.error(`No image found with ID ${imageId}`);
      return null;
    }
    
    // Record this operation
    this.recordApiCall('/metadata', 'getImageMetadata', true);
    
    return metadata;
  }
  
  /**
   * Update metadata for an uploaded image
   * @param imageId The ID of the uploaded image
   * @param updates The metadata updates
   */
  updateImageMetadata(
    imageId: string, 
    updates: { tags?: string[], description?: string }
  ): ImageMetadata | null {
    const metadata = this.metadataCache.get(imageId);
    
    if (!metadata) {
      console.error(`No image found with ID ${imageId}`);
      return null;
    }
    
    // Apply updates
    if (updates.tags) {
      metadata.tags = updates.tags;
    }
    
    if (updates.description !== undefined) {
      metadata.description = updates.description;
    }
    
    // Save updated metadata
    this.metadataCache.set(imageId, metadata);
    this.saveCache();
    
    // Record this operation
    this.recordApiCall('/metadata', 'updateImageMetadata', true);
    
    return metadata;
  }
  
  /**
   * Get all uploaded images
   */
  getAllUploadedImages(): ImageMetadata[] {
    const images: ImageMetadata[] = [];
    
    for (const id of this.uploadedImages) {
      const metadata = this.metadataCache.get(id);
      if (metadata) {
        images.push(metadata);
      }
    }
    
    // Sort by upload date (newest first)
    return images.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }
  
  /**
   * Search uploaded images by tags or description
   * @param query Search query
   */
  searchImages(query: string): ImageMetadata[] {
    const queryLower = query.toLowerCase();
    const results: ImageMetadata[] = [];
    
    this.metadataCache.forEach(metadata => {
      const descriptionMatch = metadata.description?.toLowerCase().includes(queryLower);
      const tagMatch = metadata.tags?.some(tag => tag.toLowerCase().includes(queryLower));
      const filenameMatch = metadata.filename.toLowerCase().includes(queryLower);
      
      if (descriptionMatch || tagMatch || filenameMatch) {
        results.push(metadata);
      }
    });
    
    // Sort by relevance (tags match first, then description)
    return results.sort((a, b) => {
      const aTagMatch = a.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ? 1 : 0;
      const bTagMatch = b.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ? 1 : 0;
      
      if (aTagMatch !== bTagMatch) {
        return bTagMatch - aTagMatch;
      }
      
      // Sort by upload date as secondary criteria
      return b.uploadedAt - a.uploadedAt;
    });
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats() {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      endpoint: call.endpoint,
      operation: call.operation,
      cacheHit: call.cacheHit
    })).reverse();
    
    return {
      requestsToday: this.usageStats.requestsToday,
      dailyQuota: this.usageStats.dailyQuota,
      remainingRequests: Math.max(0, this.usageStats.dailyQuota - this.usageStats.requestsToday),
      percentageUsed: (this.usageStats.requestsToday / this.usageStats.dailyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      totalImagesUploaded: this.usageStats.totalUploaded,
      totalStorageUsed: this.formatBytes(this.usageStats.totalSize),
      recentCalls
    };
  }
  
  /**
   * Format bytes to a human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Clear the cache and uploaded images list
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.uploadedImages = [];
    localStorage.removeItem(IMAGE_METADATA_CACHE_KEY);
    localStorage.removeItem(UPLOADED_IMAGES_KEY);
    console.log('Image metadata cache cleared');
  }
  
  /**
   * Get the API attribution
   */
  getAttribution(): string {
    return '© Image Upload API by APILayer';
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();