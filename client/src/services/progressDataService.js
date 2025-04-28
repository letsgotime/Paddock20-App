/**
 * ProgressDataService
 * 
 * A comprehensive centralized service for tracking and displaying user progress across the application
 * Provides a unified API for accessing and managing progress metrics, history, and goals
 * Enables data visualization and analytics for user achievements and improvements
 */

import { create } from 'zustand';

// Generate mock historical data for progress trends with realistic patterns
const generateHistoricalData = (metric, days = 30, startValue = 0, endValue = 0, volatility = 0.2) => {
  const data = [];
  const now = new Date();
  let currentValue = startValue;
  const targetChange = (endValue - startValue) / days;
  
  for (let i = days; i >= 0; i--) {
    // Create date for this data point
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Calculate value with some randomness for realistic progression
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
    currentValue += targetChange * randomFactor;
    
    // Ensure value never goes below zero
    currentValue = Math.max(0, currentValue);
    
    data.push({
      date: date.toISOString().split('T')[0],
      [metric]: Math.round(currentValue * 100) / 100
    });
  }
  
  return data;
};

// Initial progress metrics
const initialProgressMetrics = {
  // Vehicle Metrics
  vehicleMaintenanceScore: {
    current: 87,
    target: 95,
    history: generateHistoricalData('score', 90, 70, 87, 0.1),
    improvement: 5.2,
    unit: '%',
    growthRate: 'monthly',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  glossRating: {
    current: 8.5,
    target: 10,
    history: generateHistoricalData('rating', 60, 6.8, 8.5, 0.05),
    improvement: 1.3,
    unit: '/10',
    growthRate: 'weekly',
    lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  },
  milesDriven: {
    current: 5280,
    // No target for miles driven
    history: generateHistoricalData('miles', 120, 0, 5280, 0.3),
    improvement: null, // not applicable
    unit: 'mi',
    growthRate: 'daily',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  
  // Dream Asset Progress
  dreamCarProgress: {
    current: 45,
    target: 100,
    history: generateHistoricalData('progress', 180, 10, 45, 0.1),
    improvement: 12,
    unit: '%',
    growthRate: 'monthly',
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  dreamWatchProgress: {
    current: 32,
    target: 100,
    history: generateHistoricalData('progress', 240, 5, 32, 0.08),
    improvement: 7,
    unit: '%',
    growthRate: 'monthly',
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  },
  dreamHomeProgress: {
    current: 3,
    target: 100,
    history: generateHistoricalData('progress', 365, 0, 3, 0.05),
    improvement: 1,
    unit: '%',
    growthRate: 'quarterly',
    lastUpdated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
  },
  
  // User Engagement Metrics
  daysActive: {
    current: 87,
    history: generateHistoricalData('days', 100, 0, 87, 0),
    improvement: null,
    unit: 'days',
    growthRate: 'daily',
    lastUpdated: new Date().toISOString() // today
  },
  journalEntries: {
    current: 42,
    history: generateHistoricalData('entries', 100, 0, 42, 0.4),
    improvement: 8,
    unit: 'entries',
    growthRate: 'weekly',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  
  // Paddock20 Platform Engagement
  eventsAttended: {
    current: 5,
    history: generateHistoricalData('events', 180, 0, 5, 0),
    improvement: 2,
    unit: 'events',
    growthRate: 'monthly',
    lastUpdated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  communityContributions: {
    current: 12,
    history: generateHistoricalData('contributions', 120, 0, 12, 0.3),
    improvement: 4,
    unit: 'contributions',
    growthRate: 'monthly',
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  }
};

// Create a store for progress data using Zustand
const useProgressStore = create((set, get) => ({
  // State
  progressMetrics: initialProgressMetrics,
  isLoading: false,
  error: null,
  
  // Get all progress metrics
  getAllMetrics: () => {
    return get().progressMetrics;
  },
  
  // Get specific progress metric by key
  getMetricByKey: (key) => {
    return get().progressMetrics[key] || null;
  },
  
  // Get all progress metrics in a specific category
  getMetricsByCategory: (category) => {
    const allMetrics = get().progressMetrics;
    const result = {};
    
    switch (category) {
      case 'vehicle':
        ['vehicleMaintenanceScore', 'glossRating', 'milesDriven'].forEach(key => {
          result[key] = allMetrics[key];
        });
        break;
      case 'dreams':
        ['dreamCarProgress', 'dreamWatchProgress', 'dreamHomeProgress'].forEach(key => {
          result[key] = allMetrics[key];
        });
        break;
      case 'engagement':
        ['daysActive', 'journalEntries', 'eventsAttended', 'communityContributions'].forEach(key => {
          result[key] = allMetrics[key];
        });
        break;
      default:
        return {};
    }
    
    return result;
  },
  
  // Update a progress metric with new data
  updateMetric: (key, newData) => {
    set(state => {
      const metric = state.progressMetrics[key];
      
      if (!metric) {
        return state; // No change if metric doesn't exist
      }
      
      // Determine if this is a simple value update or a complete metric update
      if (typeof newData === 'number' || typeof newData === 'string') {
        // It's just a new current value
        const currentValue = parseFloat(newData);
        const previousValue = metric.current;
        
        // Add new data point to history
        const newHistoryPoint = {
          date: new Date().toISOString().split('T')[0],
          [key.includes('Progress') ? 'progress' : key.includes('Rating') ? 'rating' : 'score']: currentValue
        };
        
        return {
          progressMetrics: {
            ...state.progressMetrics,
            [key]: {
              ...metric,
              current: currentValue,
              history: [...metric.history, newHistoryPoint],
              improvement: previousValue !== null ? (currentValue - previousValue) : null,
              lastUpdated: new Date().toISOString()
            }
          }
        };
      } else {
        // It's a complete metric update
        return {
          progressMetrics: {
            ...state.progressMetrics,
            [key]: {
              ...metric,
              ...newData,
              lastUpdated: new Date().toISOString()
            }
          }
        };
      }
    });
  },
  
  // Add a new progress data point to a metric's history
  addProgressDataPoint: (key, value, date = new Date()) => {
    set(state => {
      const metric = state.progressMetrics[key];
      
      if (!metric) {
        return state; // No change if metric doesn't exist
      }
      
      // Format the date to ISO string date portion
      const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      // Create the new data point
      const dataPoint = {
        date: dateString,
        [key.includes('Progress') ? 'progress' : key.includes('Rating') ? 'rating' : key.includes('miles') ? 'miles' : 'score']: value
      };
      
      // Add to history and update current value
      return {
        progressMetrics: {
          ...state.progressMetrics,
          [key]: {
            ...metric,
            current: value,
            history: [...metric.history, dataPoint],
            lastUpdated: new Date().toISOString()
          }
        }
      };
    });
  },
  
  // Create a new progress metric
  createProgressMetric: (key, metricData) => {
    set(state => {
      // Don't overwrite existing metrics
      if (state.progressMetrics[key]) {
        return state;
      }
      
      return {
        progressMetrics: {
          ...state.progressMetrics,
          [key]: {
            current: 0,
            target: 100,
            history: [],
            improvement: null,
            unit: '',
            growthRate: 'monthly',
            lastUpdated: new Date().toISOString(),
            ...metricData
          }
        }
      };
    });
  },
  
  // Delete a progress metric
  deleteProgressMetric: (key) => {
    set(state => {
      const newProgressMetrics = { ...state.progressMetrics };
      delete newProgressMetrics[key];
      
      return {
        progressMetrics: newProgressMetrics
      };
    });
  },
  
  // Calculate progress rate over a specific time period
  calculateProgressRate: (key, timeframeDays = 30) => {
    const metric = get().progressMetrics[key];
    
    if (!metric || !metric.history || metric.history.length < 2) {
      return 0; // Not enough data
    }
    
    // Get current date and date from timeframeDays ago
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - timeframeDays);
    
    // Find data points closest to now and startDate
    const sortedHistory = [...metric.history].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    const currentPoint = sortedHistory[0];
    
    // Find the point closest to but not after the start date
    const startPoint = sortedHistory.find(point => 
      new Date(point.date) <= startDate
    );
    
    if (!startPoint || !currentPoint) {
      return 0; // Not enough data in the specified timeframe
    }
    
    // Calculate the actual number of days between points
    const daysDiff = (new Date(currentPoint.date) - new Date(startPoint.date)) / (1000 * 60 * 60 * 24);
    if (daysDiff === 0) return 0;
    
    // Get the value key from the data point
    const valueKey = Object.keys(currentPoint).find(k => k !== 'date');
    
    // Calculate the rate of change per day
    const changePerDay = (currentPoint[valueKey] - startPoint[valueKey]) / daysDiff;
    
    // Convert to the specified growth rate (e.g., monthly)
    const rateMultiplier = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };
    
    return changePerDay * (rateMultiplier[metric.growthRate] || 1);
  },
  
  // Fetch progress data from backend/API (would be implemented with actual API calls)
  fetchProgressData: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the real implementation, you would fetch from your API
      // const response = await fetch('/api/progress-metrics');
      // const data = await response.json();
      
      set({ 
        progressMetrics: initialProgressMetrics,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Export a singleton instance of the progress service
const progressDataService = {
  useProgressStore,
  
  // Additional utility methods
  formatProgressValue: (value, unit) => {
    // Format based on unit type
    if (unit === '%') {
      return `${Math.round(value)}%`;
    } else if (unit === '/10') {
      return `${value.toFixed(1)}/10`;
    } else if (unit === 'mi') {
      return `${value.toLocaleString()} mi`;
    } else {
      return value.toString();
    }
  },
  
  // Get formatted improvement value with + or - sign
  getFormattedImprovement: (metric) => {
    if (metric.improvement === null) return '';
    
    const prefix = metric.improvement > 0 ? '+' : '';
    return `${prefix}${metric.improvement}${metric.unit}`;
  },
  
  // Get a human-readable last updated string
  getLastUpdatedText: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  },
  
  // Get color based on progress or performance
  getMetricColor: (metric, theme = 'default') => {
    if (!metric.target) return '#3b82f6'; // Carolina blue default
    
    const percentOfTarget = (metric.current / metric.target) * 100;
    
    if (theme === 'default') {
      if (percentOfTarget >= 90) return '#22c55e'; // Green
      if (percentOfTarget >= 60) return '#3b82f6'; // Carolina blue
      if (percentOfTarget >= 30) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    } else if (theme === 'pastel') {
      if (percentOfTarget >= 90) return '#86efac'; // Pastel green
      if (percentOfTarget >= 60) return '#93c5fd'; // Pastel blue
      if (percentOfTarget >= 30) return '#fcd34d'; // Pastel yellow
      return '#fca5a5'; // Pastel red
    } else {
      return '#3b82f6'; // Carolina blue default
    }
  }
};

export default progressDataService;