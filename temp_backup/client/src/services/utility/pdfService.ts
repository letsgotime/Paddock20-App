/**
 * Web page to PDF API Service
 * 
 * This service provides functionality to convert any web page URL to PDF.
 * Uses APILayer's Web page to PDF API with:
 * - Print mode for vector PDFs with selectable text
 * - Screenshot mode for pixel-perfect PDFs of complex pages
 * - Various customization options (grayscale, page size, etc.)
 * - Aggressive caching to stay within API limits
 */

import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const PDF_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const PDF_API_BASE_URL = 'https://api.apilayer.com/url_to_pdf';

// Cache configuration
const CACHE_TTL_DAYS = 7; // 7 days for URL cache (PDFs don't change often)
const USAGE_STATS_KEY = 'pdf_api_usage_stats';
const URL_CACHE_KEY = 'pdf_url_cache';
const LAST_REQUEST_TIMESTAMP_KEY = 'pdf_last_request_timestamp';

// Request limits (conservative for free tier)
const DAILY_REQUEST_LIMIT = 5; // Be very conservative with API usage

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for PDF conversion options
export interface PdfConversionOptions {
  url: string;               // URL to convert to PDF (required)
  print?: boolean;           // Print mode (default: true) or screenshot mode (false)
  grayscale?: boolean;       // Grayscale printing in print mode (default: false)
  pagesize?: 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid' | 'Ledger'; // Page size (default: A4)
  timeout?: number;          // Timeout in seconds for screenshot mode (max: 15)
  username?: string;         // HTTP Basic Auth username
  password?: string;         // HTTP Basic Auth password
}

// Interface for PDF result
export interface PdfResult {
  pdfBlob: Blob;             // The PDF as a Blob
  source: 'api' | 'cache';   // Where the PDF came from
  timestamp: number;         // When the PDF was generated/fetched
  url: string;               // Original URL
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    url: string;
    cacheHit: boolean;
  }[];
}

/**
 * PdfService class for web page to PDF conversion
 */
class PdfService {
  private urlCache: Map<string, { data: Blob; timestamp: number }> = new Map();
  private isLoadingCache: boolean = false;
  private usageStats: UsageStats;
  private lastRequestTime: number = 0;
  
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
        apiCallLog: []
      };
      this.saveUsageStats();
    }
    
    // We don't load binary blob cache in constructor as it could be large
    // Instead, we'll check for cache hits at runtime
    
    // Get last request time from storage
    const lastRequestTime = localStorage.getItem<number>(LAST_REQUEST_TIMESTAMP_KEY);
    if (lastRequestTime) {
      this.lastRequestTime = lastRequestTime;
    }
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
    console.log('Resetting PDF API daily counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(url: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      url,
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
   * Generate a cache key for the conversion options
   */
  private getCacheKey(options: PdfConversionOptions): string {
    return JSON.stringify(options);
  }
  
  /**
   * Convert a web page to PDF
   * @param options PDF conversion options
   */
  async convertWebPageToPdf(options: PdfConversionOptions): Promise<PdfResult> {
    // Validate URL
    if (!options.url) {
      throw new Error('URL is required');
    }
    
    // Clean up and normalize URL
    if (!options.url.startsWith('http')) {
      options.url = 'https://' + options.url;
    }
    
    const cacheKey = this.getCacheKey(options);
    
    // If we've exceeded our quota and don't have cached data, stop
    if (this.hasExceededQuota()) {
      console.warn('PDF API daily quota exceeded, refusing to make new requests');
      
      // Try to return cached data if we have it
      const cachedData = this.urlCache.get(cacheKey);
      
      if (cachedData) {
        this.recordApiCall(options.url, true);
        return {
          pdfBlob: cachedData.data,
          source: 'cache',
          timestamp: cachedData.timestamp,
          url: options.url
        };
      }
      
      throw new Error('API quota exceeded and no cached data available');
    }
    
    // Check cache first
    const cachedData = this.urlCache.get(cacheKey);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // For PDFs, we can use a longer cache time
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached PDF data (${cacheAgeDays.toFixed(1)} days old) for "${options.url}"`);
        this.recordApiCall(options.url, true);
        return {
          pdfBlob: cachedData.data,
          source: 'cache',
          timestamp: cachedData.timestamp,
          url: options.url
        };
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    // Build the URL with parameters
    const queryParams = new URLSearchParams();
    queryParams.append('url', options.url);
    
    if (options.print !== undefined) {
      queryParams.append('print', options.print.toString());
    }
    
    if (options.grayscale) {
      queryParams.append('grayscale', 'true');
    }
    
    if (options.pagesize) {
      queryParams.append('pagesize', options.pagesize);
    }
    
    if (options.timeout && options.timeout > 0 && options.timeout <= 15) {
      queryParams.append('timeout', options.timeout.toString());
    }
    
    if (options.username && options.password) {
      queryParams.append('username', options.username);
      queryParams.append('password', options.password);
    }
    
    const url = `${PDF_API_BASE_URL}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': PDF_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const pdfBlob = await response.blob();
      
      // Cache successful response
      this.urlCache.set(cacheKey, {
        data: pdfBlob,
        timestamp: Date.now()
      });
      
      // Record API call
      this.recordApiCall(options.url, false);
      
      return {
        pdfBlob,
        source: 'api',
        timestamp: Date.now(),
        url: options.url
      };
    } catch (error) {
      console.error(`Error with PDF API request for "${options.url}":`, error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for "${options.url}"`);
        return {
          pdfBlob: cachedData.data,
          source: 'cache',
          timestamp: cachedData.timestamp,
          url: options.url
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Generate a PDF download URL from a Blob
   * @param blob PDF blob
   * @param filename Filename for the download
   */
  createDownloadUrl(blob: Blob, filename: string = 'download.pdf'): string {
    // Create a blob URL for the PDF
    const url = URL.createObjectURL(blob);
    
    // Download the PDF when the link is clicked
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    return url;
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats(): {
    requestsToday: number;
    dailyQuota: number;
    remainingRequests: number;
    percentageUsed: number;
    lastResetDate: Date;
    recentCalls: {
      timestamp: Date;
      url: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      url: call.url,
      cacheHit: call.cacheHit
    })).reverse();
    
    return {
      requestsToday: this.usageStats.requestsToday,
      dailyQuota: this.usageStats.dailyQuota,
      remainingRequests: Math.max(0, this.usageStats.dailyQuota - this.usageStats.requestsToday),
      percentageUsed: (this.usageStats.requestsToday / this.usageStats.dailyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      recentCalls
    };
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    let entries = 0;
    let totalSizeBytes = 0;
    
    this.urlCache.forEach((entry) => {
      entries++;
      totalSizeBytes += entry.data.size;
    });
    
    return {
      entries,
      totalSizeMB: Math.round(totalSizeBytes / (1024 * 1024) * 100) / 100
    };
  }
  
  /**
   * Check if we've reached limit
   */
  hasReachedLimit(): boolean {
    return this.hasExceededQuota();
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.urlCache.clear();
    console.log('PDF URL cache cleared');
  }
}

// Export singleton instance
export const pdfService = new PdfService();

// Export a simpler function for component use
export async function convertToPdf(
  url: string, 
  printMode: boolean = true, 
  grayscale: boolean = false
): Promise<Blob> {
  try {
    const result = await pdfService.convertWebPageToPdf({
      url,
      print: printMode,
      grayscale
    });
    return result.pdfBlob;
  } catch (error) {
    console.error('Error in convertToPdf:', error);
    throw error;
  }
}