/**
 * TheRundown API Service
 * 
 * Implements the APILayer TheRundown API with:
 * - Sports data for various leagues including motorsports
 * - Live scores, odds, and statistics
 * - Event schedules and results
 * - Aggressive caching to minimize API usage
 */

import axios from 'axios';
import { createLocalStorageWithExpiry } from '@/utils/storageUtils';

// API Configuration
const THERUNDOWN_BASE_URL = 'https://api.apilayer.com/therundown/';
const THERUNDOWN_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const USER_AGENT = 'Paddock20 - F1 Automotive Lifestyle Platform';

// Cache configuration - more aggressive for lower usage
const CACHE_TTL_MINUTES = {
  EVENTS: 360, // 6 hours cache for events list
  EVENT_DETAILS: 240, // 4 hours cache for event details
  LIVE_SCORES: 5, // 5 minutes cache for live scores
  ODDS: 30, // 30 minutes cache for odds
  SPORTS: 4320, // 3 days cache for sports list (since sports don't change often)
  SCHEDULE: 240, // 4 hours cache for schedules
  ALL_SPORTS_EVENTS: 720, // 12 hours cache for all sports events combined
};

const THERUNDOWN_CACHE_KEY_PREFIX = 'therundown_';
const USAGE_STATS_KEY = 'therundown_usage_stats';
const LAST_REQUEST_TIMESTAMP_KEY = 'therundown_last_request_timestamp';

// Request limits (based on user requirements)
const DAILY_REQUEST_LIMIT = 20; // Maximum 20 requests per day as specified
const REQUEST_INTERVAL_MS = 2000; // 2 seconds between requests for safety

// Local storage with expiry helper
const localStorage = createLocalStorageWithExpiry();

// Interfaces for sports data
export interface Sport {
  sport_id: number;
  sport_name: string;
  has_odds: boolean;
  active: boolean;
  details?: string;
  description?: string;
}

export interface Event {
  event_id: string;
  event_uuid?: string;
  sport_id: number;
  event_date: string;
  rotation_number_away?: string;
  rotation_number_home?: string;
  score?: {
    event_id: string;
    event_status: string;
    score_away: string;
    score_home: string;
    winner_away?: number;
    winner_home?: number;
    display_clock?: string;
    game_period?: string;
    event_status_detail?: string;
  };
  teams: {
    team_id: string;
    team_normalized_id?: number;
    name: string;
    is_away: boolean;
    is_home: boolean;
  }[];
  teams_normalized?: {
    team_id: number;
    name: string;
    mascot: string;
    abbreviation: string;
    is_away: boolean;
    is_home: boolean;
    ranking?: string;
    record?: string;
  }[];
  schedule?: {
    event_id: string;
    season_type: string;
    season_year: string;
    event_name?: string;
    attendance?: string;
    event_location?: string;
    event_location_city?: string;
    event_location_state?: string;
    event_location_country?: string;
    broadcast_network?: string;
  };
  lines?: Record<string, any>;
}

export interface EventDetails extends Event {
  // Add more detailed fields as needed
  venue?: {
    name: string;
    city: string;
    state?: string;
    country: string;
    capacity?: number;
  };
  weather?: {
    temperature?: string;
    condition?: string;
    humidity?: string;
    wind_speed?: string;
  };
}

// Interface for usage statistics
interface UsageStats {
  requestsToday: number;
  dailyQuota: number;
  dayStartTimestamp: number;
  lastResetTimestamp: number;
  apiCallLog: {
    timestamp: number;
    endpoint: string;
    cacheHit: boolean;
  }[];
}

/**
 * TheRundownService class for sports data
 */
class TheRundownService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
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
      // Load all cached items with our prefix
      const keysToLoad = Object.keys(localStorage.getAllKeys())
        .filter(key => key.startsWith(THERUNDOWN_CACHE_KEY_PREFIX));
      
      for (const key of keysToLoad) {
        const item = localStorage.getItem(key);
        if (item && typeof item === 'object' && 'data' in item && 'timestamp' in item && 'ttl' in item) {
          this.cache.set(key, item as any);
        }
      }
      
      console.log(`Loaded ${this.cache.size} TheRundown cache entries`);
    } catch (error) {
      console.error('Failed to load TheRundown cache from storage:', error);
    } finally {
      this.isLoadingCache = false;
    }
  }
  
  /**
   * Save item to cache and persistent storage
   */
  private saveToCache(key: string, data: any, ttlMinutes: number): void {
    const cacheKey = `${THERUNDOWN_CACHE_KEY_PREFIX}${key}`;
    const ttlMs = ttlMinutes * 60 * 1000;
    
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    
    this.cache.set(cacheKey, cacheItem);
    
    try {
      localStorage.setItem(cacheKey, cacheItem, ttlMs);
    } catch (error) {
      console.error('Failed to save to TheRundown cache:', error);
    }
  }
  
  /**
   * Get item from cache
   */
  private getFromCache(key: string): any | null {
    const cacheKey = `${THERUNDOWN_CACHE_KEY_PREFIX}${key}`;
    const cachedItem = this.cache.get(cacheKey);
    
    if (!cachedItem) {
      return null;
    }
    
    const now = Date.now();
    const age = now - cachedItem.timestamp;
    
    // Return null if expired
    if (age > cachedItem.ttl) {
      return null;
    }
    
    return cachedItem.data;
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
    console.log('Resetting TheRundown daily API counter');
    this.usageStats.requestsToday = 0;
    this.usageStats.dayStartTimestamp = this.getCurrentDayStart();
    this.usageStats.lastResetTimestamp = Date.now();
    this.saveUsageStats();
  }
  
  /**
   * Record an API call in the usage statistics
   */
  private recordApiCall(endpoint: string, cacheHit: boolean): void {
    // Only increment the counter for actual API calls (not cache hits)
    if (!cacheHit) {
      this.usageStats.requestsToday++;
    }
    
    // Log the call details
    this.usageStats.apiCallLog.push({
      timestamp: Date.now(),
      endpoint,
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
   * Make a rate-limited API request
   */
  private async makeRequest(endpoint: string, params: Record<string, any> = {}, ttlMinutes: number): Promise<any> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log(`Using cached TheRundown data for ${endpoint}`);
      this.recordApiCall(endpoint, true);
      return cachedData;
    }
    
    // If we've exceeded our quota, throw error
    if (this.hasExceededQuota()) {
      throw new Error('Daily API quota exceeded');
    }
    
    // Rate limiting: ensure at least REQUEST_INTERVAL_MS milliseconds between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_INTERVAL_MS) {
      const delayMs = REQUEST_INTERVAL_MS - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    // Update last request time
    this.lastRequestTime = Date.now();
    localStorage.setItem(LAST_REQUEST_TIMESTAMP_KEY, this.lastRequestTime);
    
    try {
      const url = `${THERUNDOWN_BASE_URL}${endpoint}`;
      const response = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT,
          'apikey': THERUNDOWN_API_KEY
        },
        timeout: 15000 // 15 second timeout
      });
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Save to cache
      this.saveToCache(cacheKey, response.data, ttlMinutes);
      
      // Record API call
      this.recordApiCall(endpoint, false);
      
      return response.data;
    } catch (error) {
      console.error(`Error with TheRundown API request for ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a list of all available sports
   */
  async getSports(): Promise<Sport[]> {
    return this.makeRequest('sports', {}, CACHE_TTL_MINUTES.SPORTS);
  }
  
  /**
   * Get motorsports-related sports
   * Note: We'll look for any sports that might be motorsports related
   */
  async getMotorsports(): Promise<Sport[]> {
    const allSports = await this.getSports();
    
    // Filter to find motorsports-related sports
    // This list of keywords can be extended to match more motorsports
    const motorsportsKeywords = [
      'motorsport', 'racing', 'nascar', 'formula', 'f1', 'indycar', 
      'rally', 'moto', 'motorcycle', 'supercross', 'dirt', 'drag'
    ];
    
    return allSports.filter(sport => {
      const sportName = sport.sport_name.toLowerCase();
      const description = (sport.description || '').toLowerCase();
      const details = (sport.details || '').toLowerCase();
      
      // Check if any motorsports keywords are found in the name, description or details
      return motorsportsKeywords.some(keyword => 
        sportName.includes(keyword) || 
        description.includes(keyword) || 
        details.includes(keyword)
      );
    });
  }
  
  /**
   * Get all events for a specific sport
   * @param sportId The sport ID
   * @param date Optional date in format YYYY-MM-DD
   */
  async getEvents(sportId: number, date?: string): Promise<Event[]> {
    const params: Record<string, any> = { sport_id: sportId };
    
    if (date) {
      params.date = date;
    }
    
    return this.makeRequest('events', params, CACHE_TTL_MINUTES.EVENTS);
  }
  
  /**
   * Get details for a specific event
   * @param eventId The event ID
   */
  async getEventDetails(eventId: string): Promise<EventDetails> {
    return this.makeRequest(`events/${eventId}`, {}, CACHE_TTL_MINUTES.EVENT_DETAILS);
  }
  
  /**
   * Get live scores for events
   * @param sportId Optional sport ID to filter results
   */
  async getLiveScores(sportId?: number): Promise<Event[]> {
    const params: Record<string, any> = {};
    
    if (sportId) {
      params.sport_id = sportId;
    }
    
    return this.makeRequest('scores/live', params, CACHE_TTL_MINUTES.LIVE_SCORES);
  }
  
  /**
   * Get schedule for a specific sport
   * @param sportId The sport ID
   * @param date Optional date in format YYYY-MM-DD
   */
  async getSchedule(sportId: number, date?: string): Promise<Event[]> {
    const params: Record<string, any> = { sport_id: sportId };
    
    if (date) {
      params.date = date;
    }
    
    return this.makeRequest('schedule', params, CACHE_TTL_MINUTES.SCHEDULE);
  }
  
  /**
   * Search for events by team or league name
   * @param query The search query
   */
  async searchEvents(query: string): Promise<Event[]> {
    // This is a client-side search since TheRundown API doesn't have a search endpoint
    // Get all sports first
    const sports = await this.getSports();
    const allEvents: Event[] = [];
    
    // Search through events for each sport (limit to 3 sports to avoid too many requests)
    const searchLimit = Math.min(3, sports.length);
    
    for (let i = 0; i < searchLimit; i++) {
      try {
        const sportEvents = await this.getEvents(sports[i].sport_id);
        allEvents.push(...sportEvents);
      } catch (error) {
        console.error(`Error fetching events for sport ${sports[i].sport_name}:`, error);
      }
    }
    
    // Filter events by the search query
    const lowercaseQuery = query.toLowerCase();
    return allEvents.filter(event => {
      // Check team names
      const teamMatch = event.teams.some(team => 
        team.name.toLowerCase().includes(lowercaseQuery)
      );
      
      // Check normalized team names
      const normalizedMatch = event.teams_normalized?.some(team =>
        team.name.toLowerCase().includes(lowercaseQuery) ||
        team.mascot.toLowerCase().includes(lowercaseQuery)
      );
      
      // Check schedule details
      const scheduleMatch = event.schedule?.event_name?.toLowerCase().includes(lowercaseQuery) ||
        event.schedule?.event_location?.toLowerCase().includes(lowercaseQuery);
      
      return teamMatch || normalizedMatch || scheduleMatch;
    });
  }
  
  /**
   * Get all sports and their events in a single batch operation
   * This is optimized to minimize API calls with aggressive caching
   */
  async getAllSportsAndEvents(): Promise<{
    sports: Sport[];
    events: Event[];
    categorizedEvents: Record<number, Event[]>; // Events organized by sport_id
    sportNameMap: Record<number, string>; // Maps sport_id to sport_name
  }> {
    const cacheKey = 'all_sports_events';
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      console.log('Using cached all sports and events data');
      this.recordApiCall('all_sports_events (cached)', true);
      return cachedData;
    }
    
    try {
      // First get all sports
      console.log('Fetching all sports and their events (this uses multiple API calls but is heavily cached)');
      const sports = await this.getSports();
      
      // Create a sport name map for easy lookup
      const sportNameMap: Record<number, string> = {};
      sports.forEach(sport => {
        sportNameMap[sport.sport_id] = sport.sport_name;
      });
      
      const categorizedEvents: Record<number, Event[]> = {};
      const allEvents: Event[] = [];
      
      // Only get events for 5 most relevant sports to limit API usage
      // This strategy keeps us well under the 20 requests per day limit
      // We'll prioritize motorsports when possible
      const motorsportsKeywords = [
        'motorsport', 'racing', 'nascar', 'formula', 'f1', 'indycar', 
        'rally', 'moto', 'motorcycle', 'supercross', 'dirt', 'drag'
      ];
      
      // Sort sports: first motorsports related, then others
      const sortedSports = [...sports].sort((a, b) => {
        const aName = a.sport_name.toLowerCase();
        const bName = b.sport_name.toLowerCase();
        
        const aIsMotorsport = motorsportsKeywords.some(keyword => aName.includes(keyword));
        const bIsMotorsport = motorsportsKeywords.some(keyword => bName.includes(keyword));
        
        if (aIsMotorsport && !bIsMotorsport) return -1;
        if (!aIsMotorsport && bIsMotorsport) return 1;
        return 0;
      });
      
      // Limit to 5 sports to conserve API calls
      const sportsToFetch = sortedSports.slice(0, 5);
      
      // Get events for each sport with rate limiting
      for (const sport of sportsToFetch) {
        try {
          // Add a delay between requests for rate limiting
          if (allEvents.length > 0) {
            await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
          }
          
          const events = await this.getEvents(sport.sport_id);
          categorizedEvents[sport.sport_id] = events;
          allEvents.push(...events);
          
          console.log(`Fetched ${events.length} events for ${sport.sport_name}`);
        } catch (error) {
          console.error(`Error fetching events for ${sport.sport_name}:`, error);
          categorizedEvents[sport.sport_id] = [];
        }
      }
      
      // Sort events by date (ascending)
      const sortedEvents = allEvents.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Prepare the complete result
      const result = {
        sports,
        events: sortedEvents,
        categorizedEvents,
        sportNameMap
      };
      
      // Save the result with a long cache time
      this.saveToCache(cacheKey, result, CACHE_TTL_MINUTES.ALL_SPORTS_EVENTS);
      
      return result;
    } catch (error) {
      console.error('Error fetching all sports and events:', error);
      throw error;
    }
  }
  
  /**
   * Get the next upcoming motorsports events
   */
  async getUpcomingMotorsportsEvents(): Promise<Event[]> {
    try {
      // Get all sports and events
      const { sports, events } = await this.getAllSportsAndEvents();
      
      // Filter motorsports
      const motorsportsKeywords = [
        'motorsport', 'racing', 'nascar', 'formula', 'f1', 'indycar', 
        'rally', 'moto', 'motorcycle', 'supercross', 'dirt', 'drag'
      ];
      
      const motorsportIds = sports
        .filter(sport => {
          const sportName = sport.sport_name.toLowerCase();
          const description = (sport.description || '').toLowerCase();
          const details = (sport.details || '').toLowerCase();
          
          return motorsportsKeywords.some(keyword => 
            sportName.includes(keyword) || 
            description.includes(keyword) || 
            details.includes(keyword)
          );
        })
        .map(sport => sport.sport_id);
      
      // Filter events for motorsports and sort by date
      const motorsportEvents = events
        .filter(event => motorsportIds.includes(event.sport_id))
        .sort((a, b) => {
          const dateA = new Date(a.event_date);
          const dateB = new Date(b.event_date);
          return dateA.getTime() - dateB.getTime();
        });
      
      return motorsportEvents;
    } catch (error) {
      console.error('Error getting upcoming motorsports events:', error);
      
      // Fallback to the original implementation if necessary
      const motorsports = await this.getMotorsports();
      const allEvents: Event[] = [];
      
      // Get events for each motorsport
      for (const sport of motorsports) {
        try {
          const events = await this.getEvents(sport.sport_id);
          allEvents.push(...events);
        } catch (error) {
          console.error(`Error fetching events for ${sport.sport_name}:`, error);
        }
      }
      
      // Sort by date (ascending)
      return allEvents.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateA.getTime() - dateB.getTime();
      });
    }
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
      endpoint: string;
      cacheHit: boolean;
    }[];
  } {
    // Get the most recent API calls (last 10)
    const recentCalls = this.usageStats.apiCallLog.slice(-10).map(call => ({
      timestamp: new Date(call.timestamp),
      endpoint: call.endpoint,
      cacheHit: call.cacheHit
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
    const oldestMinutes = Math.floor((now - oldestTimestamp) / (1000 * 60));
    const newestMinutes = Math.floor((now - newestTimestamp) / (1000 * 60));
    
    return {
      entries,
      oldestEntryMinutes: oldestMinutes || 0,
      newestEntryMinutes: newestMinutes || 0,
      sizeKB: Math.round(JSON.stringify(Object.fromEntries(this.cache)).length / 1024)
    };
  }
  
  /**
   * Get the API attribution
   */
  getAttribution(): string {
    return '© TheRundown API by APILayer';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    
    // Clear all items with our prefix from localStorage
    const keysToRemove = Object.keys(localStorage.getAllKeys())
      .filter(key => key.startsWith(THERUNDOWN_CACHE_KEY_PREFIX));
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    
    console.log('TheRundown cache cleared');
  }
}

// Export singleton instance
export const theRundownService = new TheRundownService();