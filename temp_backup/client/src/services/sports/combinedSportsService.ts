/**
 * Combined Sports Data Service
 * 
 * This service integrates multiple sports data APIs:
 * 1. TheRundown API - General sports data and events with more detailed information
 * 2. The Odds API - Betting odds and additional scores
 * 
 * Features:
 * - Ultra-aggressive caching (1 day for most data)
 * - Automatic fallback between services
 * - Data merging for comprehensive results
 * - API usage tracking and throttling
 */

import { createCachedFunction } from '@/utils/storageUtils';

// API configurations
const RUNDOWN_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const RUNDOWN_BASE_URL = 'https://therundown-therundown-v1.p.rapidapi.com';

const ODDS_API_KEY = 'U6R2I4l7d12hSSV3Sj0dz10so4qxaX6D';
const ODDS_BASE_URL = 'https://api.the-odds-api.com/v4';

// Cache durations
const SPORTS_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for sports lists
const EVENTS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours for events
const ODDS_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours for odds
const SCORES_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for scores

// Usage tracking
let rundownApiCallsToday = 0;
let oddsApiCallsToday = 0;
const MAX_DAILY_RUNDOWN_CALLS = 18; // Conservative limit for 20/day
const MAX_DAILY_ODDS_CALLS = 15; // Conservative limit for 500/month

// Reset counters at midnight
const resetCountersIfNeeded = () => {
  const today = new Date().toDateString();
  const lastResetDay = localStorage.getItem('sports_api_counter_reset_day');
  
  if (lastResetDay !== today) {
    rundownApiCallsToday = 0;
    oddsApiCallsToday = 0;
    localStorage.setItem('sports_api_counter_reset_day', today);
  } else {
    // Load cached counters
    rundownApiCallsToday = parseInt(localStorage.getItem('rundown_api_calls_today') || '0', 10);
    oddsApiCallsToday = parseInt(localStorage.getItem('odds_api_calls_today') || '0', 10);
  }
};

// Update counters after API call
const updateApiCounter = (api: 'rundown' | 'odds') => {
  resetCountersIfNeeded();
  
  if (api === 'rundown') {
    rundownApiCallsToday++;
    localStorage.setItem('rundown_api_calls_today', rundownApiCallsToday.toString());
  } else {
    oddsApiCallsToday++;
    localStorage.setItem('odds_api_calls_today', oddsApiCallsToday.toString());
  }
};

// Check if we can call the API
const canCallApi = (api: 'rundown' | 'odds'): boolean => {
  resetCountersIfNeeded();
  return api === 'rundown' 
    ? rundownApiCallsToday < MAX_DAILY_RUNDOWN_CALLS
    : oddsApiCallsToday < MAX_DAILY_ODDS_CALLS;
};

// Sports mapping between APIs
const sportsMappings: Record<string, string> = {
  // Odds API key -> TheRundown key
  'soccer_epl': '1',
  'soccer_spain_la_liga': '1',
  'soccer_germany_bundesliga': '1',
  'basketball_nba': '4',
  'baseball_mlb': '3',
  'americanfootball_nfl': '2',
  'icehockey_nhl': '7',
};

// Convert sports between APIs
const convertSportId = (id: string, from: 'odds' | 'rundown', to: 'odds' | 'rundown'): string => {
  if (from === 'odds' && to === 'rundown') {
    return sportsMappings[id] || id;
  } else if (from === 'rundown' && to === 'odds') {
    const entry = Object.entries(sportsMappings).find(([_, value]) => value === id);
    return entry ? entry[0] : id;
  }
  return id;
};

// Fetch from TheRundown API with error handling
const fetchFromRundown = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  if (!canCallApi('rundown')) {
    throw new Error('TheRundown API daily limit reached');
  }
  
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${RUNDOWN_BASE_URL}${endpoint}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RUNDOWN_API_KEY,
        'X-RapidAPI-Host': 'therundown-therundown-v1.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`TheRundown API error: ${response.status}`);
    }
    
    updateApiCounter('rundown');
    return await response.json();
  } catch (error) {
    console.error('TheRundown API error:', error);
    throw error;
  }
};

// Fetch from The Odds API with error handling
const fetchFromOdds = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  if (!canCallApi('odds')) {
    throw new Error('The Odds API daily limit reached');
  }
  
  try {
    // Add API key to params
    params.apiKey = ODDS_API_KEY;
    
    const queryParams = new URLSearchParams(params).toString();
    const url = `${ODDS_BASE_URL}${endpoint}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`The Odds API error: ${response.status}`);
    }
    
    updateApiCounter('odds');
    return await response.json();
  } catch (error) {
    console.error('The Odds API error:', error);
    throw error;
  }
};

// Get all available sports
export const getSportsList = createCachedFunction(
  async (): Promise<any> => {
    try {
      // Try TheRundown API first
      const rundownData = canCallApi('rundown') 
        ? await fetchFromRundown('/sports') 
        : { sports: [] };
        
      // Also try The Odds API
      const oddsData = canCallApi('odds')
        ? await fetchFromOdds('/sports')
        : [];
      
      // Merge the data with preference for TheRundown
      const combinedSports = [...(rundownData.sports || [])];
      
      // Add unique sports from The Odds API
      oddsData.forEach((oddsSport: any) => {
        const existingSport = combinedSports.find(
          (sport: any) => sport.name.toLowerCase() === oddsSport.group.toLowerCase()
        );
        
        if (!existingSport) {
          combinedSports.push({
            sport_id: oddsSport.key,
            name: oddsSport.title,
            group: oddsSport.group,
            details: oddsSport.description,
            source: 'odds_api'
          });
        }
      });
      
      return { sports: combinedSports };
    } catch (error) {
      console.error('Error fetching sports list:', error);
      
      // Return empty data on error
      return { sports: [] };
    }
  },
  'combined_sports_list',
  SPORTS_CACHE_DURATION
);

// Get events for a specific sport
export const getEvents = createCachedFunction(
  async (sportId: number): Promise<any> => {
    try {
      // Default to TheRundown if available
      if (canCallApi('rundown')) {
        const data = await fetchFromRundown('/sports/' + sportId + '/events');
        return data;
      }
      
      // Fallback to The Odds API with converted sport ID
      if (canCallApi('odds')) {
        const oddsSportId = convertSportId(sportId.toString(), 'rundown', 'odds');
        const oddsEvents = await fetchFromOdds('/sports/' + oddsSportId + '/scores', {
          daysFrom: '3',
          dateFormat: 'iso'
        });
        
        // Convert to TheRundown format
        return {
          events: oddsEvents.map((event: any) => ({
            event_id: event.id,
            event_date: event.commence_time,
            sports: {
              name: event.sport_title
            },
            teams_normalized: [
              { name: event.home_team },
              { name: event.away_team }
            ],
            teams: [
              { team_id: 1, name: event.home_team, is_home: true, is_away: false },
              { team_id: 2, name: event.away_team, is_home: false, is_away: true }
            ],
            score: event.scores ? {
              event_status: event.completed ? 'Completed' : 'In Progress',
              score_home: event.scores[0].score,
              score_away: event.scores[1].score
            } : undefined,
            venue: event.venue ? {
              name: event.venue,
              city: '',
              country: ''
            } : undefined,
            source: 'odds_api'
          }))
        };
      }
      
      throw new Error('Both API daily limits reached');
    } catch (error) {
      console.error(`Error fetching events for sport ID ${sportId}:`, error);
      return { events: [] };
    }
  },
  (sportId) => `combined_events_${sportId}`,
  EVENTS_CACHE_DURATION
);

// Get motorsports events specifically
export const getMotorsportsEvents = createCachedFunction(
  async (): Promise<any> => {
    try {
      // In TheRundown, motorsports may be under specific IDs
      const motorsportIds = [13, 14, 15]; // F1, NASCAR, etc. (adjust as needed)
      let allEvents: any[] = [];
      
      if (canCallApi('rundown')) {
        // Try each motorsport ID
        for (const id of motorsportIds) {
          try {
            const data = await fetchFromRundown('/sports/' + id + '/events');
            if (data && data.events) {
              allEvents = [...allEvents, ...data.events];
            }
          } catch (e) {
            // Skip failed IDs
            console.warn(`No motorsport events found for ID ${id}`);
          }
        }
      }
      
      // Fallback to The Odds API
      if (allEvents.length === 0 && canCallApi('odds')) {
        // Look for motorsports in The Odds API
        const motorsportKeys = ['motorsport', 'f1', 'nascar'];
        
        // Get all sports first
        const allSports = await fetchFromOdds('/sports');
        
        // Filter motorsport-related sports
        const motorsportSports = allSports.filter((sport: any) => 
          motorsportKeys.some(key => 
            sport.key.toLowerCase().includes(key) || 
            sport.title.toLowerCase().includes(key) ||
            sport.description.toLowerCase().includes(key)
          )
        );
        
        // Get events for each motorsport
        for (const sport of motorsportSports) {
          try {
            const events = await fetchFromOdds('/sports/' + sport.key + '/scores', {
              daysFrom: '7', // Look further ahead for motorsports
              dateFormat: 'iso'
            });
            
            // Convert to TheRundown format
            const formattedEvents = events.map((event: any) => ({
              event_id: event.id,
              event_date: event.commence_time,
              sports: {
                name: sport.title
              },
              teams_normalized: [
                { name: event.home_team },
                { name: event.away_team }
              ],
              teams: [
                { team_id: 1, name: event.home_team, is_home: true, is_away: false },
                { team_id: 2, name: event.away_team, is_home: false, is_away: true }
              ],
              score: event.scores ? {
                event_status: event.completed ? 'Completed' : 'In Progress',
                score_home: event.scores[0].score,
                score_away: event.scores[1].score
              } : undefined,
              source: 'odds_api'
            }));
            
            allEvents = [...allEvents, ...formattedEvents];
          } catch (e) {
            console.warn(`Error fetching ${sport.title} events:`, e);
          }
        }
      }
      
      return { events: allEvents };
    } catch (error) {
      console.error('Error fetching motorsport events:', error);
      return { events: [] };
    }
  },
  'combined_motorsports_events',
  EVENTS_CACHE_DURATION
);

// Get odds for events
export const getOdds = createCachedFunction(
  async (sportId: string, regionCode: string = 'us'): Promise<any> => {
    try {
      if (canCallApi('odds')) {
        // The Odds API is better for odds data
        const oddsSportId = convertSportId(sportId.toString(), 'rundown', 'odds');
        
        const data = await fetchFromOdds('/sports/' + oddsSportId + '/odds', {
          regions: regionCode,
          markets: 'h2h,spreads,totals'
        });
        
        return data;
      }
      
      throw new Error('The Odds API daily limit reached');
    } catch (error) {
      console.error(`Error fetching odds for sport ID ${sportId}:`, error);
      return [];
    }
  },
  (sportId, regionCode) => `combined_odds_${sportId}_${regionCode}`,
  ODDS_CACHE_DURATION
);

// Get API usage statistics
export const getApiUsage = (): { rundown: number, odds: number } => {
  resetCountersIfNeeded();
  return {
    rundown: rundownApiCallsToday,
    odds: oddsApiCallsToday
  };
};

// Check if we've reached limits
export const hasReachedDailyLimits = (): { rundown: boolean, odds: boolean } => {
  resetCountersIfNeeded();
  return {
    rundown: rundownApiCallsToday >= MAX_DAILY_RUNDOWN_CALLS,
    odds: oddsApiCallsToday >= MAX_DAILY_ODDS_CALLS
  };
};