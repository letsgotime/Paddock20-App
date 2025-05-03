import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, useVehicle } from './VehicleContext';

// Define activity interfaces
export interface VehicleActivity {
  id: string;
  vehicleId: string;
  type: 'fun_drive' | 'detailing' | 'maintenance' | 'modification' | 'journal';
  title: string;
  description?: string;
  date: string;
  pointsEarned?: number;
  completed: boolean;
  mediaIds: string[]; // References to related media items
  metadata: Record<string, any>; // Type-specific data
}

// Define media item interfaces
export interface MediaItem {
  id: string;
  vehicleId: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  thumbnail?: string;
  name: string;
  description?: string;
  tags: string[];
  category: string;
  createdAt: string;
  size?: number;
  duration?: number; // For videos/audio
  fileType?: string; // For documents
}

// Define document interfaces
export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: 'manual' | 'service_record' | 'receipt' | 'insurance' | 'registration' | 'other';
  name: string;
  url: string;
  fileType: string;
  size?: number;
  uploadDate: string;
  description?: string;
  tags: string[];
}

// Activity summary for quick display
export interface ActivitySummary {
  funDrives: number;
  modifications: number;
  detailingActivities: number;
  maintenanceLogs: number;
  journalEntries: number;
  totalPoints: number;
  lastActivity?: string;
}

// Main context interface
interface VehicleDataContextType {
  // Activities
  vehicleActivities: VehicleActivity[];
  getVehicleActivities: (vehicleId: string) => VehicleActivity[];
  addActivity: (activity: Omit<VehicleActivity, 'id'>) => void;
  updateActivity: (id: string, data: Partial<VehicleActivity>) => void;
  deleteActivity: (id: string) => void;
  
  // Media
  mediaItems: MediaItem[];
  getVehicleMedia: (vehicleId: string, category?: string) => MediaItem[];
  addMedia: (media: Omit<MediaItem, 'id'>) => void;
  updateMedia: (id: string, data: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
  
  // Documents
  documents: VehicleDocument[];
  getVehicleDocuments: (vehicleId: string, type?: string) => VehicleDocument[];
  addDocument: (document: Omit<VehicleDocument, 'id'>) => void;
  updateDocument: (id: string, data: Partial<VehicleDocument>) => void;
  deleteDocument: (id: string) => void;
  
  // Activity Summaries
  getActivitySummary: (vehicleId: string) => ActivitySummary;
  
  // Loading state
  loading: boolean;
}

// Create the context
const VehicleDataContext = createContext<VehicleDataContextType | undefined>(undefined);

// Mock data generator helpers (for demonstration purposes)
const generateMockVehicleActivities = (vehicleId: string): VehicleActivity[] => {
  // Generate based on a consistent hash from the vehicle ID to ensure
  // the same vehicle always gets the same mock data
  const hash = vehicleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const activities: VehicleActivity[] = [];
  
  // Fun drives (2-7)
  const numFunDrives = 2 + (hash % 6);
  for (let i = 0; i < numFunDrives; i++) {
    activities.push({
      id: `drive_${vehicleId}_${i}`,
      vehicleId,
      type: 'fun_drive',
      title: `Mountain Drive ${i + 1}`,
      description: 'Scenic drive through mountain roads',
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 20 + (i * 5),
      completed: true,
      mediaIds: [`img_${vehicleId}_${i}`],
      metadata: {
        distance: 45 + (i * 10),
        duration: 120 + (i * 30),
        route: 'Blue Ridge Parkway',
        weather: 'Sunny'
      }
    });
  }
  
  // Detailing activities (3-8)
  const numDetailing = 3 + (hash % 6);
  for (let i = 0; i < numDetailing; i++) {
    activities.push({
      id: `detail_${vehicleId}_${i}`,
      vehicleId,
      type: 'detailing',
      title: i % 3 === 0 ? 'Full Detail' : i % 3 === 1 ? 'Quick Wash' : 'Ceramic Coating',
      description: 'Regular maintenance detailing',
      date: new Date(Date.now() - (i + 1) * 14 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: i % 3 === 0 ? 50 : i % 3 === 1 ? 15 : 100,
      completed: true,
      mediaIds: [`det_${vehicleId}_${i}`],
      metadata: {
        products: ['Soap', 'Wax', 'Microfiber Towels'],
        duration: 90 + (i * 30),
        steps: ['Wash', 'Clay', 'Polish', 'Seal']
      }
    });
  }
  
  // Maintenance logs (2-5)
  const numMaintenance = 2 + (hash % 4);
  for (let i = 0; i < numMaintenance; i++) {
    activities.push({
      id: `maint_${vehicleId}_${i}`,
      vehicleId,
      type: 'maintenance',
      title: i % 2 === 0 ? 'Oil Change' : 'Tire Rotation',
      description: 'Regular maintenance service',
      date: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 10,
      completed: true,
      mediaIds: [],
      metadata: {
        cost: 50 + (i * 20),
        provider: 'DIY Garage',
        parts: ['Oil Filter', 'Synthetic Oil'],
        mileage: 35000 + (i * 5000)
      }
    });
  }
  
  // Modifications (1-4)
  const numMods = 1 + (hash % 4);
  for (let i = 0; i < numMods; i++) {
    activities.push({
      id: `mod_${vehicleId}_${i}`,
      vehicleId,
      type: 'modification',
      title: i % 3 === 0 ? 'Exhaust Upgrade' : i % 3 === 1 ? 'Suspension Lowering' : 'Window Tint',
      description: 'Performance and appearance upgrades',
      date: new Date(Date.now() - (i + 1) * 60 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 30,
      completed: true,
      mediaIds: [`mod_${vehicleId}_${i}`],
      metadata: {
        cost: 250 + (i * 300),
        provider: 'Custom Shop',
        parts: ['Brand X Exhaust System'],
        before_after_pics: true
      }
    });
  }
  
  // Journal entries (3-10)
  const numJournals = 3 + (hash % 8);
  for (let i = 0; i < numJournals; i++) {
    activities.push({
      id: `journal_${vehicleId}_${i}`,
      vehicleId,
      type: 'journal',
      title: `Drive Journal Entry ${i + 1}`,
      description: 'Notes about the driving experience',
      date: new Date(Date.now() - (i + 1) * 5 * 24 * 60 * 60 * 1000).toISOString(),
      pointsEarned: 5,
      completed: true,
      mediaIds: [],
      metadata: {
        mood: i % 3 === 0 ? 'Excited' : i % 3 === 1 ? 'Relaxed' : 'Focused',
        weather: i % 4 === 0 ? 'Sunny' : i % 4 === 1 ? 'Rainy' : i % 4 === 2 ? 'Cloudy' : 'Snowy',
        notes: 'Great handling on the mountain curves.'
      }
    });
  }
  
  return activities;
};

// Generate mock media
const generateMockMedia = (vehicleId: string): MediaItem[] => {
  const hash = vehicleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const media: MediaItem[] = [];
  
  // Add some images (5-12)
  const numImages = 5 + (hash % 8);
  for (let i = 0; i < numImages; i++) {
    media.push({
      id: `img_${vehicleId}_${i}`,
      vehicleId,
      type: 'image',
      url: `/assets/vehicle-images/sample-${(i % 5) + 1}.jpg`,
      thumbnail: `/assets/vehicle-images/sample-${(i % 5) + 1}-thumb.jpg`,
      name: `Vehicle Photo ${i + 1}`,
      description: i % 3 === 0 ? 'Front angle shot' : i % 3 === 1 ? 'Side profile' : 'Interior detail',
      tags: ['exterior', i % 3 === 0 ? 'front' : i % 3 === 1 ? 'side' : 'interior'],
      category: i % 4 === 0 ? 'detailing' : i % 4 === 1 ? 'general' : i % 4 === 2 ? 'drives' : 'modifications',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      size: 1200000 + (i * 100000)
    });
  }
  
  // Add videos (1-3)
  const numVideos = 1 + (hash % 3);
  for (let i = 0; i < numVideos; i++) {
    media.push({
      id: `vid_${vehicleId}_${i}`,
      vehicleId,
      type: 'video',
      url: `/assets/videos/drive-clip-${(i % 2) + 1}.mp4`,
      thumbnail: `/assets/videos/drive-clip-${(i % 2) + 1}-thumb.jpg`,
      name: i % 2 === 0 ? 'Mountain Drive Footage' : 'Engine Sound After Mod',
      description: i % 2 === 0 ? 'Scenic drive through the mountains' : 'Capturing the sound after exhaust modification',
      tags: i % 2 === 0 ? ['driving', 'scenic', 'mountains'] : ['engine', 'sound', 'exhaust', 'modifications'],
      category: i % 2 === 0 ? 'drives' : 'modifications',
      createdAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
      size: 25000000 - (i * 7000000),
      duration: 145 - (i * 80)
    });
  }
  
  // Add documents (2-4)
  const numDocs = 2 + (hash % 3);
  for (let i = 0; i < numDocs; i++) {
    media.push({
      id: `doc_${vehicleId}_${i}`,
      vehicleId,
      type: 'document',
      url: `/assets/documents/${i % 2 === 0 ? 'maintenance-log' : 'mod-specs'}.pdf`,
      name: i % 2 === 0 ? 'Maintenance Records' : 'Modification Specifications',
      description: i % 2 === 0 ? 'Complete maintenance history' : 'Technical details of installed mods',
      tags: i % 2 === 0 ? ['maintenance', 'service', 'records'] : ['modifications', 'specs', 'technical'],
      category: i % 2 === 0 ? 'maintenance' : 'modifications',
      createdAt: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
      size: 2500000 - (i * 700000),
      fileType: 'pdf'
    });
  }
  
  return media;
};

// Generate mock documents
const generateMockDocuments = (vehicleId: string): VehicleDocument[] => {
  const hash = vehicleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const documents: VehicleDocument[] = [];
  
  // Owner's manual
  documents.push({
    id: `manual_${vehicleId}`,
    vehicleId,
    type: 'manual',
    name: 'Owner\'s Manual',
    url: '/assets/documents/owners-manual.pdf',
    fileType: 'pdf',
    size: 5800000,
    uploadDate: new Date(Date.now() - 180 * 86400000).toISOString(),
    description: 'Complete owner\'s manual for the vehicle',
    tags: ['manual', 'official', 'manufacturer']
  });
  
  // Service records
  const numServiceRecords = 2 + (hash % 3);
  for (let i = 0; i < numServiceRecords; i++) {
    documents.push({
      id: `service_${vehicleId}_${i}`,
      vehicleId,
      type: 'service_record',
      name: `Service Record #${i + 1}`,
      url: '/assets/documents/service-record.pdf',
      fileType: 'pdf',
      size: 850000 + (i * 100000),
      uploadDate: new Date(Date.now() - (i + 1) * 90 * 86400000).toISOString(),
      description: `Record of ${i % 2 === 0 ? 'routine maintenance' : 'repair work'}`,
      tags: ['service', 'maintenance', i % 2 === 0 ? 'scheduled' : 'repair']
    });
  }
  
  // Receipts
  const numReceipts = 2 + (hash % 4);
  for (let i = 0; i < numReceipts; i++) {
    documents.push({
      id: `receipt_${vehicleId}_${i}`,
      vehicleId,
      type: 'receipt',
      name: `Receipt - ${i % 3 === 0 ? 'Parts Purchase' : i % 3 === 1 ? 'Service Work' : 'Accessories'}`,
      url: '/assets/documents/receipt.pdf',
      fileType: 'pdf',
      size: 450000 + (i * 50000),
      uploadDate: new Date(Date.now() - (i + 1) * 45 * 86400000).toISOString(),
      description: `Receipt for ${i % 3 === 0 ? 'replacement parts' : i % 3 === 1 ? 'service work' : 'accessories'}`,
      tags: ['receipt', 'purchase', i % 3 === 0 ? 'parts' : i % 3 === 1 ? 'service' : 'accessories']
    });
  }
  
  // Insurance document
  documents.push({
    id: `insurance_${vehicleId}`,
    vehicleId,
    type: 'insurance',
    name: 'Insurance Policy',
    url: '/assets/documents/insurance.pdf',
    fileType: 'pdf',
    size: 1200000,
    uploadDate: new Date(Date.now() - 30 * 86400000).toISOString(),
    description: 'Current insurance policy document',
    tags: ['insurance', 'policy', 'legal']
  });
  
  // Registration
  documents.push({
    id: `registration_${vehicleId}`,
    vehicleId,
    type: 'registration',
    name: 'Vehicle Registration',
    url: '/assets/documents/registration.pdf',
    fileType: 'pdf',
    size: 750000,
    uploadDate: new Date(Date.now() - 60 * 86400000).toISOString(),
    description: 'Current vehicle registration document',
    tags: ['registration', 'dmv', 'legal']
  });
  
  return documents;
};

// Provider component
export const VehicleDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const vehicleContext = useVehicle();
  const [vehicleActivities, setVehicleActivities] = useState<VehicleActivity[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize or update data when vehicles change
  useEffect(() => {
    if (vehicleContext.vehicles.length > 0) {
      setLoading(true);
      
      // Initialize activities, media, and documents for all vehicles
      const allActivities: VehicleActivity[] = [];
      const allMedia: MediaItem[] = [];
      const allDocuments: VehicleDocument[] = [];
      
      vehicleContext.vehicles.forEach(vehicle => {
        // Generate mock data based on vehicle ID
        const vehicleActivities = generateMockVehicleActivities(vehicle.id);
        const vehicleMedia = generateMockMedia(vehicle.id);
        const vehicleDocuments = generateMockDocuments(vehicle.id);
        
        allActivities.push(...vehicleActivities);
        allMedia.push(...vehicleMedia);
        allDocuments.push(...vehicleDocuments);
      });
      
      setVehicleActivities(allActivities);
      setMediaItems(allMedia);
      setDocuments(allDocuments);
      setLoading(false);
    }
  }, [vehicleContext.vehicles]);

  // Activity management functions
  const getVehicleActivities = (vehicleId: string): VehicleActivity[] => {
    return vehicleActivities.filter(activity => activity.vehicleId === vehicleId);
  };

  const addActivity = (activity: Omit<VehicleActivity, 'id'>): void => {
    const newActivity: VehicleActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setVehicleActivities(prev => [...prev, newActivity]);
  };

  const updateActivity = (id: string, data: Partial<VehicleActivity>): void => {
    setVehicleActivities(prev => 
      prev.map(activity => activity.id === id ? { ...activity, ...data } : activity)
    );
  };

  const deleteActivity = (id: string): void => {
    setVehicleActivities(prev => prev.filter(activity => activity.id !== id));
  };

  // Media management functions
  const getVehicleMedia = (vehicleId: string, category?: string): MediaItem[] => {
    return mediaItems.filter(item => 
      item.vehicleId === vehicleId && 
      (category ? item.category === category : true)
    );
  };

  const addMedia = (media: Omit<MediaItem, 'id'>): void => {
    const newMedia: MediaItem = {
      ...media,
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setMediaItems(prev => [...prev, newMedia]);
  };

  const updateMedia = (id: string, data: Partial<MediaItem>): void => {
    setMediaItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...data } : item)
    );
  };

  const deleteMedia = (id: string): void => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  // Document management functions
  const getVehicleDocuments = (vehicleId: string, type?: string): VehicleDocument[] => {
    return documents.filter(doc => 
      doc.vehicleId === vehicleId && 
      (type ? doc.type === type : true)
    );
  };

  const addDocument = (document: Omit<VehicleDocument, 'id'>): void => {
    const newDocument: VehicleDocument = {
      ...document,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setDocuments(prev => [...prev, newDocument]);
  };

  const updateDocument = (id: string, data: Partial<VehicleDocument>): void => {
    setDocuments(prev => 
      prev.map(doc => doc.id === id ? { ...doc, ...data } : doc)
    );
  };

  const deleteDocument = (id: string): void => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  // Calculate activity summary
  const getActivitySummary = (vehicleId: string): ActivitySummary => {
    const activities = getVehicleActivities(vehicleId);
    
    // Count activities by type
    const funDrives = activities.filter(a => a.type === 'fun_drive').length;
    const detailingActivities = activities.filter(a => a.type === 'detailing').length;
    const maintenanceLogs = activities.filter(a => a.type === 'maintenance').length;
    const modifications = activities.filter(a => a.type === 'modification').length;
    const journalEntries = activities.filter(a => a.type === 'journal').length;
    
    // Calculate total points
    const totalPoints = activities.reduce((sum, activity) => sum + (activity.pointsEarned || 0), 0);
    
    // Find the most recent activity
    const sortedActivities = [...activities].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastActivity = sortedActivities.length > 0 ? sortedActivities[0].date : undefined;
    
    return {
      funDrives,
      detailingActivities,
      maintenanceLogs,
      modifications,
      journalEntries,
      totalPoints,
      lastActivity
    };
  };

  // Context value
  const value: VehicleDataContextType = {
    vehicleActivities,
    getVehicleActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    
    mediaItems,
    getVehicleMedia,
    addMedia,
    updateMedia,
    deleteMedia,
    
    documents,
    getVehicleDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    
    getActivitySummary,
    
    loading
  };

  return (
    <VehicleDataContext.Provider value={value}>
      {children}
    </VehicleDataContext.Provider>
  );
};

// Custom hook for using the context
export const useVehicleData = (): VehicleDataContextType => {
  const context = useContext(VehicleDataContext);
  if (context === undefined) {
    throw new Error('useVehicleData must be used within a VehicleDataProvider');
  }
  return context;
};