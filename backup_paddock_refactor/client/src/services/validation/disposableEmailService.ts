/**
 * Disposable Email Detection API Service
 * 
 * Implements the APILayer Disposable Email Detection API with:
 * - Strong caching for repeat email checks
 * - Request counting and limiting
 * - Email validation utilities
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const DISPOSABLE_EMAIL_BASE_URL = 'https://api.apilayer.com/disposable_email';
const DISPOSABLE_EMAIL_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration
const CACHE_TTL_DAYS = 90; // 90 days cache (disposable email domains rarely change)
const DISPOSABLE_EMAIL_CACHE_KEY = 'disposable_email_cache';
const USAGE_STATS_KEY = 'disposable_email_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'disposable_email_last_request_timestamp';

// Request limits (conservative)
const DAILY_REQUEST_LIMIT = 100;

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interface for API responses
export interface DisposableEmailCheckResponse {
  disposable: boolean;
  format_valid: boolean;
  did_you_mean: string | null;
  mx_found: boolean;
  score: number;
  message?: string;
  success?: boolean;
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    email: string;
    cacheHit: boolean;
    result: boolean;
  }[];
}

/**
 * DisposableEmailService class for email validation
 */
class DisposableEmailService {
  private cache: Map<string, { data: DisposableEmailCheckResponse; timestamp: number }> = new Map();
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
    
    this.loadCacheFromStorage();
    
    // Get last request time from storage
    const lastRequestTime = localStorage.getItem<number>(LAST_REQUEST_TIMESTAMP_KEY);
    if (lastRequestTime) {
      this.lastRequestTime = lastRequestTime;
    }
  }
  
  /**
   * Load cache from persistent storage
   */
  private async loadCacheFromStorage(): Promise<void> {
    if (this.isLoadingCache) return;
    this.isLoadingCache = true;
    
    try {
      const cachedData = localStorage.getItem(DISPOSABLE_EMAIL_CACHE_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        
        // Reset the in-memory cache
        this.cache = new Map();
        
        // Populate the cache from storage
        Object.keys(parsedData).forEach(key => {
          this.cache.set(key, parsedData[key]);
        });
        
        console.log(`Loaded ${this.cache.size} Disposable Email cache entries`);
      }
    } catch (error) {
      console.error('Failed to load Disposable Email cache from storage:', error);
    } finally {
      this.isLoadingCache = false;
    }
  }
  
  /**
   * Save current cache to persistent storage
   */
  private saveCache(): void {
    try {
      const cacheObject: Record<string, any> = {};
      this.cache.forEach((value, key) => {
        cacheObject[key] = value;
      });
      
      localStorage.setItem(DISPOSABLE_EMAIL_CACHE_KEY, JSON.stringify(cacheObject), 
        CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to save Disposable Email cache to storage:', error);
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
    console.log('Resetting Disposable Email daily API counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(email: string, cacheHit: boolean, result: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      email,
      cacheHit,
      result
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
   * Check if an email address is disposable (throwaway)
   * @param email Email address to check
   */
  async isDisposable(email: string): Promise<DisposableEmailCheckResponse> {
    if (!email || !email.trim() || !this.isValidEmailFormat(email)) {
      return {
        disposable: false,
        format_valid: false,
        did_you_mean: null,
        mx_found: false,
        score: 0,
        message: 'Invalid email format'
      };
    }
    
    // Normalize the email
    email = email.trim().toLowerCase();
    
    // If we've exceeded our quota and don't have cached data, limit request
    if (this.hasExceededQuota()) {
      console.warn('Disposable Email daily API quota exceeded, refusing to make new requests');
      
      // Still try to return cached data if available
      const cachedData = this.cache.get(email);
      
      if (cachedData) {
        this.recordApiCall(email, true, cachedData.data.disposable);
        return cachedData.data;
      }
      
      // For this service, we'll do a basic check if no API call is possible
      // This checks for some common disposable email domains
      const domain = email.split('@')[1];
      const commonDisposableResult = this.checkCommonDisposableDomains(domain);
      
      return {
        disposable: commonDisposableResult,
        format_valid: true,
        did_you_mean: null,
        mx_found: true, // Assuming valid since we can't check
        score: commonDisposableResult ? 1 : 0,
        message: 'Basic check performed due to API quota limits'
      };
    }
    
    // Check cache first
    const cachedData = this.cache.get(email);
    if (cachedData) {
      const cacheAge = Date.now() - cachedData.timestamp;
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);
      
      // Disposable email domains don't change frequently
      if (cacheAgeDays < CACHE_TTL_DAYS) {
        console.log(`Using cached Disposable Email data (${cacheAgeDays.toFixed(1)} days old) for ${email}`);
        this.recordApiCall(email, true, cachedData.data.disposable);
        return cachedData.data;
      }
    }
    
    // Update the last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const url = `${DISPOSABLE_EMAIL_BASE_URL}/check/${encodeURIComponent(email)}`;
      
      // Make the API request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': DISPOSABLE_EMAIL_API_KEY
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Check for API errors (non-success responses)
      if (!response.data.success && response.data.error) {
        throw new Error(response.data.error.message || 'Unknown API error');
      }
      
      // Cache successful response
      this.cache.set(email, {
        data: response.data,
        timestamp: Date.now()
      });
      this.saveCache();
      
      // Record API call
      this.recordApiCall(email, false, response.data.disposable);
      return response.data;
    } catch (error) {
      console.error('Error with Disposable Email API request:', error);
      
      // Try to return cached data if we have it, even if expired
      if (cachedData) {
        console.log(`Using expired cached data after error for ${email}`);
        return cachedData.data;
      }
      
      // If no cached data, do a basic check
      const domain = email.split('@')[1];
      const commonDisposableResult = this.checkCommonDisposableDomains(domain);
      
      const result = {
        disposable: commonDisposableResult,
        format_valid: this.isValidEmailFormat(email),
        did_you_mean: null,
        mx_found: true, // Assuming valid
        score: commonDisposableResult ? 1 : 0,
        message: 'API error occurred, using basic check instead'
      };
      
      // Cache this result for a shorter period
      this.cache.set(email, {
        data: result,
        timestamp: Date.now()
      });
      this.saveCache();
      
      return result;
    }
  }
  
  /**
   * Basic email format validation (simple regex check)
   */
  isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Simple check for common disposable email domains
   * This is a fallback when the API is unavailable
   */
  private checkCommonDisposableDomains(domain: string): boolean {
    // List of common disposable email domains
    const commonDisposableDomains = [
      'mailinator.com', 'guerrillamail.com', 'temp-mail.org', 'tempmail.com',
      'fakeinbox.com', '10minutemail.com', 'yopmail.com', 'getairmail.com',
      'sharklasers.com', 'dispostable.com', 'mailnesia.com', 'getnada.com',
      'trashmail.com', 'maildrop.cc', 'tempr.email', 'temporary-mail.net',
      'throwawaymail.com', 'tempinbox.com', 'spamgourmet.com', 'linshiyouxiang.net',
      'mvrht.net', 'tempr.email', 'temporary-mail.net', 'mohmal.com',
      'fghmail.net', 'tempemails.io', 'harakirimail.com', 'chacuo.net',
      'divismail.ru', 'dropmail.me', 'mailtemp.net', 'mails.kharkov.com',
      'minuteinbox.com', 'zaelmo.com', 'incognitomail.com', 'burnermail.io'
    ];
    
    return commonDisposableDomains.includes(domain);
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
    dayStart: Date;
    recentCalls: {
      timestamp: Date;
      email: string;
      cacheHit: boolean;
      result: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      email: call.email,
      cacheHit: call.cacheHit,
      result: call.result
    })).reverse();
    
    return {
      requestsToday: this.usageStats.requestsToday,
      dailyQuota: this.usageStats.dailyQuota,
      remainingRequests: Math.max(0, this.usageStats.dailyQuota - this.usageStats.requestsToday),
      percentageUsed: (this.usageStats.requestsToday / this.usageStats.dailyQuota) * 100,
      lastResetDate: new Date(this.usageStats.lastResetTimestamp),
      dayStart: new Date(this.usageStats.dayStartTimestamp),
      recentCalls
    };
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;
    let entries = 0;
    
    this.cache.forEach(entry => {
      entries++;
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    });
    
    const now = Date.now();
    const oldestDays = Math.floor((now - oldestTimestamp) / (1000 * 60 * 60 * 24));
    const newestDays = Math.floor((now - newestTimestamp) / (1000 * 60 * 60 * 24));
    
    return {
      entries,
      oldestEntryDays: oldestDays || 0,
      newestEntryDays: newestDays || 0,
      sizeKB: Math.round(JSON.stringify(Object.fromEntries(this.cache)).length / 1024)
    };
  }
  
  /**
   * Get the API attribution
   */
  getAttribution(): string {
    return '© Disposable Email Detection API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(DISPOSABLE_EMAIL_CACHE_KEY);
    console.log('Disposable Email cache cleared');
  }
}

// Export singleton instance
export const disposableEmailService = new DisposableEmailService();