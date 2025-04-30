/**
 * ModificationDataService
 * 
 * A comprehensive centralized service for managing vehicle modification data across the entire application
 * Provides a unified API for accessing and managing modification data including:
 * - Installed modifications
 * - Planned modifications
 * - Before/after galleries
 * - Modification specifications and details
 */

import { create } from 'zustand';

// Initial modifications data (would come from backend/API in production)
const initialModifications = [
  {
    id: "hre-p101",
    name: "HRE P101 Wheels",
    manufacturer: "HRE",
    type: "Wheels",
    fitment: "Ferrari 458",
    status: "dream", // "installed", "planned", "dream"
    cost: 7500,
    description: "Forged 3-piece wheels with brushed aluminum finish, custom sized for Ferrari application",
    installDate: null,
    installedBy: null,
    purchaseDate: null,
    vendor: null,
    notes: "Want the black chrome finish with red accents to match car",
    image: "/assets/ferrari-458-hre-p101.jpg",
    progressToGoal: 65, // percentage complete toward purchase
    vehicleId: "ferrari-458"
  },
  {
    id: "ryft-exhaust",
    name: "RYFT Titanium Exhaust",
    manufacturer: "RYFT",
    type: "Exhaust",
    fitment: "Ferrari 458",
    status: "dream", // "installed", "planned", "dream"
    cost: 9000,
    description: "Handcrafted titanium exhaust system with blue anodized finish, providing improved flow and distinctive sound",
    installDate: null,
    installedBy: null,
    purchaseDate: null,
    vendor: null,
    notes: "Exclusive blue titanium finish is worth the extra cost over standard titanium",
    image: "/assets/ryft-exhaust-459.jpg",
    progressToGoal: 40, // percentage complete toward purchase
    vehicleId: "ferrari-458"
  },
  {
    id: "kw-v4-coilovers",
    name: "KW V4 Coilovers",
    manufacturer: "KW Suspensions",
    type: "Suspension",
    fitment: "BMW G80 M3",
    status: "installed",
    cost: 4500,
    description: "3-way adjustable competition-grade coilover system",
    installDate: "2023-05-10",
    installedBy: "Bavarian Auto Engineering",
    purchaseDate: "2023-04-15",
    vendor: "Turner Motorsport",
    notes: "Settings currently at 12 clicks rebound, 8 clicks compression, perfect for street/track balance",
    image: "/assets/kw-v4-coilovers.jpg",
    beforeImages: [
      { id: 1, url: "/assets/bmw-g80-before-coilovers.jpg", caption: "Stock suspension" }
    ],
    afterImages: [
      { id: 1, url: "/assets/bmw-g80-after-coilovers-1.jpg", caption: "With KW V4 installed" },
      { id: 2, url: "/assets/bmw-g80-after-coilovers-2.jpg", caption: "Lowered stance comparison" }
    ],
    vehicleId: "bmw-g80-m3"
  }
];

// Create a store for modification data using Zustand
const useModificationStore = create((set, get) => ({
  // State
  modifications: initialModifications,
  activeModificationId: null,
  isLoading: false,
  error: null,
  
  // Actions
  setActiveModification: (modificationId) => {
    set({ activeModificationId: modificationId });
  },
  
  // Get active modification data
  getActiveModification: () => {
    const { modifications, activeModificationId } = get();
    return modifications.find(mod => mod.id === activeModificationId) || null;
  },
  
  // Get modification by ID
  getModificationById: (id) => {
    const { modifications } = get();
    return modifications.find(mod => mod.id === id) || null;
  },
  
  // Get all modifications for a specific vehicle
  getVehicleModifications: (vehicleId) => {
    const { modifications } = get();
    return modifications.filter(mod => mod.vehicleId === vehicleId);
  },
  
  // Get installed modifications for a vehicle
  getInstalledModifications: (vehicleId) => {
    const { modifications } = get();
    return modifications.filter(mod => mod.vehicleId === vehicleId && mod.status === "installed");
  },
  
  // Get planned modifications for a vehicle
  getPlannedModifications: (vehicleId) => {
    const { modifications } = get();
    return modifications.filter(mod => mod.vehicleId === vehicleId && mod.status === "planned");
  },
  
  // Get dream modifications for a vehicle
  getDreamModifications: (vehicleId) => {
    const { modifications } = get();
    return modifications.filter(mod => mod.vehicleId === vehicleId && mod.status === "dream");
  },
  
  // Add a new modification
  addModification: (newModification) => {
    set(state => ({ 
      modifications: [...state.modifications, newModification]
    }));
  },
  
  // Update an existing modification
  updateModification: (id, updatedData) => {
    set(state => ({ 
      modifications: state.modifications.map(mod => 
        mod.id === id ? { ...mod, ...updatedData } : mod
      )
    }));
  },
  
  // Remove a modification
  removeModification: (id) => {
    set(state => ({ 
      modifications: state.modifications.filter(mod => mod.id !== id)
    }));
  },
  
  // Update progress toward goal for dream modifications
  updateModificationProgress: (id, progressPercentage) => {
    set(state => ({
      modifications: state.modifications.map(mod => 
        mod.id === id ? { ...mod, progressToGoal: progressPercentage } : mod
      )
    }));
  },
  
  // Update modification status (e.g., from "planned" to "installed")
  updateModificationStatus: (id, newStatus, installDetails = {}) => {
    set(state => ({
      modifications: state.modifications.map(mod => {
        if (mod.id === id) {
          // If changing to installed, add installation details
          if (newStatus === "installed") {
            return { 
              ...mod, 
              status: newStatus,
              installDate: installDetails.installDate || new Date().toISOString().split('T')[0],
              installedBy: installDetails.installedBy || mod.installedBy,
              purchaseDate: installDetails.purchaseDate || mod.purchaseDate,
              vendor: installDetails.vendor || mod.vendor,
              notes: installDetails.notes || mod.notes
            };
          }
          
          return { ...mod, status: newStatus };
        }
        return mod;
      })
    }));
  },
  
  // Add before/after images to a modification
  addModificationImages: (modificationId, imageType, images) => {
    set(state => ({
      modifications: state.modifications.map(mod => {
        if (mod.id === modificationId) {
          // Determine which image collection to update
          const imageCollectionKey = imageType === 'before' ? 'beforeImages' : 'afterImages';
          
          // Create or append to the image collection
          const currentImages = mod[imageCollectionKey] || [];
          
          return {
            ...mod,
            [imageCollectionKey]: [...currentImages, ...images]
          };
        }
        return mod;
      })
    }));
  },
  
  // Remove image from before/after gallery
  removeModificationImage: (modificationId, imageType, imageId) => {
    set(state => ({
      modifications: state.modifications.map(mod => {
        if (mod.id === modificationId) {
          // Determine which image collection to update
          const imageCollectionKey = imageType === 'before' ? 'beforeImages' : 'afterImages';
          
          // Skip if the collection doesn't exist
          if (!mod[imageCollectionKey]) return mod;
          
          // Filter out the image to remove
          const updatedImages = mod[imageCollectionKey].filter(img => img.id !== imageId);
          
          return {
            ...mod,
            [imageCollectionKey]: updatedImages
          };
        }
        return mod;
      })
    }));
  },
  
  // Fetch all modification data from backend/API
  fetchModifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In the real implementation, you would fetch from your API
      // const response = await fetch('/api/modifications');
      // const data = await response.json();
      
      set({ 
        modifications: initialModifications,
        isLoading: false 
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

// Export a singleton instance of the modification service
const modificationDataService = {
  useModificationStore,
  
  // Additional utility methods
  getModificationFullName: (modification) => {
    if (!modification) return '';
    return `${modification.manufacturer} ${modification.name}`;
  },
  
  // Calculate days since installation
  getDaysSinceInstallation: (modification) => {
    if (!modification || !modification.installDate) {
      return null;
    }
    
    const installDate = new Date(modification.installDate);
    const today = new Date();
    const diffTime = Math.abs(today - installDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  // Check if modification is compatible with a specific vehicle
  isCompatibleWithVehicle: (modification, vehicleId) => {
    if (!modification || !vehicleId) return false;
    
    // Direct match on vehicleId
    if (modification.vehicleId === vehicleId) return true;
    
    // Check fitment description (would need more sophisticated logic in real app)
    // For now, just a simple keyword check
    return modification.fitment && modification.fitment.includes(vehicleId);
  },
  
  // Group modifications by type
  groupModificationsByType: (modifications) => {
    if (!modifications || !Array.isArray(modifications)) return {};
    
    return modifications.reduce((grouped, mod) => {
      const type = mod.type || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(mod);
      return grouped;
    }, {});
  }
};

export default modificationDataService;