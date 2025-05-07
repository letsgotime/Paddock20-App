/**
 * TimepieceDataService
 * 
 * A comprehensive centralized service for managing timepiece data across the entire application
 * Provides a unified API for accessing and manipulating timepiece data
 * Enables real-time updates when modifications or services are made
 * Ensures data synchronization across components
 */

import { create } from 'zustand';

// Initial timepieces data 
// In a real implementation, this would come from an API or database
const initialTimepieces = [
  {
    id: "patek-5711",
    brand: "Patek Philippe",
    model: "Nautilus",
    reference: "5711/1A-014",
    year: 2021,
    type: "Automatic",
    caseMaterial: "Stainless Steel",
    dialColor: "Olive Green",
    braceletMaterial: "Stainless Steel",
    caseSize: "40mm",
    movement: "Caliber 26‑330 S C",
    waterResistance: "120m",
    powerReserve: "35-45 hours",
    purchaseDate: null,
    lastService: null,
    nextService: null,
    isOwned: false,
    serviceHistory: [],
    image: "/assets/patek-philippe-5711.jpg",
    status: "dream",
    progressToGoal: 32, // percentage complete toward purchase
  },
  {
    id: "rolex-daytona",
    brand: "Rolex",
    model: "Cosmograph Daytona",
    reference: "116500LN",
    year: 2022,
    type: "Automatic Chronograph",
    caseMaterial: "Stainless Steel",
    dialColor: "Black",
    braceletMaterial: "Stainless Steel",
    caseSize: "40mm",
    movement: "Caliber 4130",
    waterResistance: "100m",
    powerReserve: "72 hours",
    purchaseDate: null,
    lastService: null,
    nextService: null,
    isOwned: false,
    serviceHistory: [],
    image: "/assets/rolex-daytona.jpg",
    status: "dream",
    progressToGoal: 15, // percentage complete toward purchase
  }
];

// Create a store for timepiece data using Zustand
const useTimepieceStore = create((set, get) => ({
  // State
  timepieces: initialTimepieces,
  activeTimepieceId: initialTimepieces.length > 0 ? initialTimepieces[0].id : null,
  isLoading: false,
  error: null,
  
  // Image Collections for each timepiece
  timepieceImages: {}, // { timepieceId: { acquisition: [], servicing: [], events: [], details: [] } }
  
  // Actions
  setActiveTimepiece: (timepieceId) => {
    set({ activeTimepieceId: timepieceId });
  },
  
  // Get active timepiece data
  getActiveTimepiece: () => {
    const { timepieces, activeTimepieceId } = get();
    return timepieces.find(timepiece => timepiece.id === activeTimepieceId) || null;
  },
  
  // Get timepiece by ID
  getTimepieceById: (id) => {
    const { timepieces } = get();
    return timepieces.find(timepiece => timepiece.id === id) || null;
  },
  
  // Get all owned timepieces
  getOwnedTimepieces: () => {
    const { timepieces } = get();
    return timepieces.filter(timepiece => timepiece.isOwned === true);
  },
  
  // Get dream timepieces (not owned yet)
  getDreamTimepieces: () => {
    const { timepieces } = get();
    return timepieces.filter(timepiece => !timepiece.isOwned);
  },
  
  // Add a new timepiece
  addTimepiece: (newTimepiece) => {
    set(state => ({ 
      timepieces: [...state.timepieces, newTimepiece]
    }));
  },
  
  // Update an existing timepiece
  updateTimepiece: (id, updatedData) => {
    set(state => ({ 
      timepieces: state.timepieces.map(timepiece => 
        timepiece.id === id ? { ...timepiece, ...updatedData } : timepiece
      )
    }));
  },
  
  // Remove a timepiece
  removeTimepiece: (id) => {
    set(state => ({ 
      timepieces: state.timepieces.filter(timepiece => timepiece.id !== id)
    }));
  },
  
  // Update progress toward goal for dream timepieces
  updateTimepieceProgress: (id, progressPercentage) => {
    set(state => ({
      timepieces: state.timepieces.map(timepiece => 
        timepiece.id === id ? { ...timepiece, progressToGoal: progressPercentage } : timepiece
      )
    }));
  },
  
  // Add a service record to a timepiece
  addServiceRecord: (timepieceId, serviceRecord) => {
    set(state => ({
      timepieces: state.timepieces.map(timepiece => {
        if (timepiece.id === timepieceId) {
          const updatedTimepiece = { 
            ...timepiece,
            serviceHistory: [...(timepiece.serviceHistory || []), serviceRecord],
            lastService: serviceRecord.date
          };
          
          // If next service date is specified in the record
          if (serviceRecord.nextServiceDate) {
            updatedTimepiece.nextService = serviceRecord.nextServiceDate;
          }
          
          return updatedTimepiece;
        }
        return timepiece;
      })
    }));
  },
  
  // Add a timepiece image to a specific collection (acquisition, servicing, events, details)
  addTimepieceImage: (timepieceId, collection, imageData) => {
    set(state => {
      // Get existing images for this timepiece or initialize
      const timepieceImagesCollection = state.timepieceImages[timepieceId] || {
        acquisition: [],
        servicing: [],
        events: [],
        details: []
      };
      
      // Add the new image to the specified collection
      const updatedCollection = [...timepieceImagesCollection[collection], imageData];
      
      return {
        timepieceImages: {
          ...state.timepieceImages,
          [timepieceId]: {
            ...timepieceImagesCollection,
            [collection]: updatedCollection
          }
        }
      };
    });
  },
  
  // Remove a timepiece image from a collection
  removeTimepieceImage: (timepieceId, collection, imageId) => {
    set(state => {
      // Get existing images for this timepiece
      const timepieceImagesCollection = state.timepieceImages[timepieceId];
      if (!timepieceImagesCollection) return state;
      
      // Filter out the image to remove
      const updatedCollection = timepieceImagesCollection[collection].filter(
        img => img.id !== imageId
      );
      
      return {
        timepieceImages: {
          ...state.timepieceImages,
          [timepieceId]: {
            ...timepieceImagesCollection,
            [collection]: updatedCollection
          }
        }
      };
    });
  },
  
  // Get all images for a specific timepiece
  getTimepieceImages: (timepieceId) => {
    const { timepieceImages } = get();
    return timepieceImages[timepieceId] || {
      acquisition: [],
      servicing: [],
      events: [],
      details: []
    };
  },
  
  // Get images for a specific collection
  getTimepieceImageCollection: (timepieceId, collection) => {
    const { timepieceImages } = get();
    const timepieceImagesCollection = timepieceImages[timepieceId];
    if (!timepieceImagesCollection) return [];
    return timepieceImagesCollection[collection] || [];
  },
  
  // Fetch all timepiece data from backend/API (would be implemented with actual API calls)
  fetchTimepieces: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the real implementation, you would fetch from your API
      // const response = await fetch('/api/timepieces');
      // const data = await response.json();
      
      set({ 
        timepieces: initialTimepieces,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Export a singleton instance of the timepiece service
const timepieceDataService = {
  useTimepieceStore,
  
  // Additional utility methods
  getTimepieceFullName: (timepiece) => {
    if (!timepiece) return '';
    return `${timepiece.brand} ${timepiece.model} ${timepiece.reference}`;
  },
  
  // Calculate days since last service
  getDaysSinceLastService: (timepiece) => {
    if (!timepiece || !timepiece.lastService) {
      return null;
    }
    
    const lastServiceDate = new Date(timepiece.lastService);
    const today = new Date();
    const diffTime = Math.abs(today - lastServiceDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  // Calculate days until next recommended service
  getDaysUntilNextService: (timepiece) => {
    if (!timepiece || !timepiece.nextService) {
      return null;
    }
    
    const nextServiceDate = new Date(timepiece.nextService);
    const today = new Date();
    const diffTime = nextServiceDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  // Get service status
  getServiceStatus: (timepiece) => {
    if (!timepiece || !timepiece.lastService) {
      return 'unknown';
    }
    
    const daysSinceService = timepieceDataService.getDaysSinceLastService(timepiece);
    
    // General recommendation: 5-7 years between services for modern automatic watches
    if (daysSinceService < 365 * 2) return 'excellent';
    if (daysSinceService < 365 * 4) return 'good';
    if (daysSinceService < 365 * 6) return 'due soon';
    return 'overdue';
  }
};

export default timepieceDataService;