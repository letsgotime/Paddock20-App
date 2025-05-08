import { BaseProvider, ProviderResponse } from '../core/provider';
import { ApiRequestConfig } from '../core/types';

/**
 * Image transformation and optimization options
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto';
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  effect?: string;
  background?: string;
  overlay?: string;
  angle?: number;
  radius?: number | string;
  border?: string;
  dpr?: number | 'auto';
  fetchFormat?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  defaultImage?: string;
  colorSpace?: string;
  secure?: boolean;
}

/**
 * Represents media asset metadata
 */
export interface MediaAsset {
  id: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  type?: string;
  createdAt?: Date;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  tags?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Cloudinary provider for media transformation and optimization
 */
export class CloudinaryProvider extends BaseProvider {
  private cloudName: string;
  private apiKey?: string;
  private apiSecret?: string;
  private secureDomain: string;
  private uploadDomain: string;
  
  constructor() {
    super('cloudinary', 'media', 7); // Higher priority as reliable service
    
    // Extract credentials from CLOUDINARY_URL
    const cloudinaryUrl = process.env.CLOUDINARY_URL || '';
    
    // Format is cloudinary://api_key:api_secret@cloud_name
    if (cloudinaryUrl) {
      try {
        const url = new URL(cloudinaryUrl.replace('cloudinary://', 'https://'));
        this.cloudName = url.hostname;
        this.apiKey = url.username;
        this.apiSecret = url.password;
      } catch (error) {
        console.error('Invalid CLOUDINARY_URL format:', error);
        this.cloudName = '';
      }
    } else {
      this.cloudName = ''; // Will be treated as non-configured
    }
    
    this.secureDomain = `https://res.cloudinary.com/${this.cloudName}`;
    this.uploadDomain = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    
    if (!this.cloudName) {
      console.warn('Cloudinary provider not configured. Media optimization will be limited.');
    }
  }
  
  /**
   * Checks if the provider is properly configured
   */
  isConfigured(): boolean {
    return !!this.cloudName && !!this.apiKey && !!this.apiSecret;
  }
  
  /**
   * Builds a URL for optimized image delivery
   */
  buildImageUrl(publicId: string, options: ImageTransformOptions = {}): string {
    if (!this.cloudName) {
      // If not configured, return the original URL if it's a full URL
      if (publicId.startsWith('http')) {
        return publicId;
      }
      return '';
    }
    
    const transformations: string[] = [];
    
    // Add width and height if specified
    const dimensions: string[] = [];
    if (options.width) dimensions.push(`w_${options.width}`);
    if (options.height) dimensions.push(`h_${options.height}`);
    if (options.crop && dimensions.length > 0) dimensions.push(`c_${options.crop}`);
    if (dimensions.length > 0) transformations.push(dimensions.join(','));
    
    // Add quality
    if (options.quality) transformations.push(`q_${options.quality}`);
    
    // Add format
    if (options.format) transformations.push(`f_${options.format}`);
    
    // Add gravity
    if (options.gravity) transformations.push(`g_${options.gravity}`);
    
    // Add effect
    if (options.effect) transformations.push(`e_${options.effect}`);
    
    // Add background
    if (options.background) transformations.push(`b_${options.background}`);
    
    // Add overlay
    if (options.overlay) transformations.push(`l_${options.overlay}`);
    
    // Add angle
    if (options.angle) transformations.push(`a_${options.angle}`);
    
    // Add radius
    if (options.radius) transformations.push(`r_${options.radius}`);
    
    // Add border
    if (options.border) transformations.push(`bo_${options.border}`);
    
    // Add DPR
    if (options.dpr) transformations.push(`dpr_${options.dpr}`);
    
    // Add fetch format
    if (options.fetchFormat) transformations.push(`f_${options.fetchFormat}`);
    
    // Add default image
    if (options.defaultImage) transformations.push(`d_${options.defaultImage}`);
    
    // Add color space
    if (options.colorSpace) transformations.push(`cs_${options.colorSpace}`);
    
    // Build the URL
    const transformationString = transformations.length > 0 
      ? transformations.join('/') + '/' 
      : '';
    
    // Handle different types of publicIds
    let finalPublicId = publicId;
    
    // If it's an external URL, use fetch
    if (publicId.startsWith('http')) {
      finalPublicId = `fetch/${encodeURIComponent(publicId)}`;
    } 
    // If it's already a Cloudinary URL, extract the publicId
    else if (publicId.includes('cloudinary.com')) {
      try {
        const url = new URL(publicId);
        const pathParts = url.pathname.split('/');
        // Extract publicId from path
        const idx = pathParts.findIndex(part => part === 'image' || part === 'video');
        if (idx >= 0 && idx < pathParts.length - 2) {
          // Skip resource_type and delivery_type
          finalPublicId = pathParts.slice(idx + 2).join('/');
        }
      } catch (e) {
        // Keep original if parsing fails
      }
    }
    
    return `${this.secureDomain}/image/upload/${transformationString}${finalPublicId}`;
  }
  
  /**
   * Optimizes an image URL for specific dimensions and quality
   */
  async optimizeImage(
    imageUrl: string, 
    options: ImageTransformOptions = {}
  ): Promise<ProviderResponse<string>> {
    try {
      if (!this.cloudName) {
        return {
          success: false,
          error: 'Cloudinary provider not configured',
          data: imageUrl, // Return original as fallback
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      // Set defaults for responsive images if not specified
      if (!options.format) options.format = 'auto';
      if (!options.quality) options.quality = 'auto';
      
      const optimizedUrl = this.buildImageUrl(imageUrl, options);
      
      return {
        success: true,
        data: optimizedUrl,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<string>(error, 'Failed to optimize image');
    }
  }
  
  /**
   * Creates a responsive set of images at different breakpoints
   */
  async createResponsiveImageSet(
    imageUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1600],
    options: ImageTransformOptions = {}
  ): Promise<ProviderResponse<Record<number, string>>> {
    try {
      if (!this.cloudName) {
        return {
          success: false,
          error: 'Cloudinary provider not configured',
          data: breakpoints.reduce((acc, breakpoint) => {
            acc[breakpoint] = imageUrl;
            return acc;
          }, {} as Record<number, string>),
          provider: this.name,
          timestamp: Date.now(),
        };
      }
      
      // Set quality and format defaults for responsive images
      if (!options.format) options.format = 'auto';
      if (!options.quality) options.quality = 'auto';
      
      const responsiveUrls: Record<number, string> = {};
      
      // Generate optimized URLs for each breakpoint
      for (const width of breakpoints) {
        responsiveUrls[width] = this.buildImageUrl(imageUrl, {
          ...options,
          width,
        });
      }
      
      return {
        success: true,
        data: responsiveUrls,
        provider: this.name,
        timestamp: Date.now(),
      };
    } catch (error) {
      return this.handleError<Record<number, string>>(
        error, 
        'Failed to create responsive image set'
      );
    }
  }
  
  /**
   * Helper to create srcset attribute value for responsive images
   */
  createSrcset(responsiveUrls: Record<number, string>): string {
    return Object.entries(responsiveUrls)
      .map(([width, url]) => `${url} ${width}w`)
      .join(', ');
  }
  
  /**
   * Applies a preset transformation to an image
   */
  applyPreset(
    imageUrl: string, 
    preset: 'avatar' | 'thumbnail' | 'card' | 'banner' | 'background'
  ): string {
    // Define preset transformations
    const presets: Record<string, ImageTransformOptions> = {
      avatar: {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'face',
        format: 'auto',
        quality: 'auto',
      },
      thumbnail: {
        width: 300,
        height: 300,
        crop: 'fit',
        format: 'auto',
        quality: 'auto',
      },
      card: {
        width: 600,
        crop: 'fill',
        format: 'auto',
        quality: 'auto',
      },
      banner: {
        width: 1200,
        height: 630,
        crop: 'fill',
        gravity: 'auto',
        format: 'auto',
        quality: 'auto',
      },
      background: {
        width: 1920,
        crop: 'fill',
        gravity: 'auto',
        format: 'auto',
        quality: 'auto',
        effect: 'blur:300',
      },
    };
    
    return this.buildImageUrl(imageUrl, presets[preset]);
  }
}

/**
 * Factory function to create a Cloudinary provider
 */
export function createCloudinaryProvider(): CloudinaryProvider {
  return new CloudinaryProvider();
}

/**
 * Factory function to create all media providers
 */
export function createMediaProviders(): BaseProvider[] {
  return [createCloudinaryProvider()];
}