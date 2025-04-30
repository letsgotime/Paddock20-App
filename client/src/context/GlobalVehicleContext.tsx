import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Vehicle, 
  Modification, 
  MaintenanceRecord, 
  TireSetup, 
  DetailingSession, 
  VehicleDocument,
  DriveJournalEntry
} from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define the shape of our global vehicle context
interface GlobalVehicleContextType {
  // Vehicles
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  setActiveVehicle: (vehicle: Vehicle | null) => void;
  loadingVehicles: boolean;
  vehicleError: string | null;
  refreshVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  updateVehicle: (id: number, updates: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<void>;
  
  // Modifications
  modificationsByVehicle: Record<number, Modification[]>;
  loadingModifications: boolean;
  modificationError: string | null;
  refreshModifications: (vehicleId: number) => Promise<void>;
  addModification: (modification: Omit<Modification, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Modification>;
  updateModification: (id: number, updates: Partial<Modification>) => Promise<Modification>;
  deleteModification: (id: number) => Promise<void>;
  
  // Maintenance Records
  maintenanceRecordsByVehicle: Record<number, MaintenanceRecord[]>;
  loadingMaintenanceRecords: boolean;
  maintenanceRecordError: string | null;
  refreshMaintenanceRecords: (vehicleId: number) => Promise<void>;
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MaintenanceRecord>;
  updateMaintenanceRecord: (id: number, updates: Partial<MaintenanceRecord>) => Promise<MaintenanceRecord>;
  deleteMaintenanceRecord: (id: number) => Promise<void>;
  
  // Tire Setups
  tireSetupsByVehicle: Record<number, TireSetup[]>;
  loadingTireSetups: boolean;
  tireSetupError: string | null;
  refreshTireSetups: (vehicleId: number) => Promise<void>;
  addTireSetup: (tireSetup: Omit<TireSetup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TireSetup>;
  updateTireSetup: (id: number, updates: Partial<TireSetup>) => Promise<TireSetup>;
  deleteTireSetup: (id: number) => Promise<void>;
  
  // Detailing Sessions
  detailingSessionsByVehicle: Record<number, DetailingSession[]>;
  loadingDetailingSessions: boolean;
  detailingSessionError: string | null;
  refreshDetailingSessions: (vehicleId: number) => Promise<void>;
  addDetailingSession: (session: Omit<DetailingSession, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DetailingSession>;
  updateDetailingSession: (id: number, updates: Partial<DetailingSession>) => Promise<DetailingSession>;
  deleteDetailingSession: (id: number) => Promise<void>;
  
  // Vehicle Documents
  documentsByVehicle: Record<number, VehicleDocument[]>;
  loadingDocuments: boolean;
  documentError: string | null;
  refreshDocuments: (vehicleId: number) => Promise<void>;
  addDocument: (document: Omit<VehicleDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<VehicleDocument>;
  updateDocument: (id: number, updates: Partial<VehicleDocument>) => Promise<VehicleDocument>;
  deleteDocument: (id: number) => Promise<void>;
  
  // Drive Journal Entries
  driveJournalsByVehicle: Record<number, DriveJournalEntry[]>;
  loadingDriveJournals: boolean;
  driveJournalError: string | null;
  refreshDriveJournals: (vehicleId: number) => Promise<void>;
  addDriveJournal: (entry: Omit<DriveJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DriveJournalEntry>;
  updateDriveJournal: (id: number, updates: Partial<DriveJournalEntry>) => Promise<DriveJournalEntry>;
  deleteDriveJournal: (id: number) => Promise<void>;
  
  // Utilities
  getLatestDetailingSession: (vehicleId: number) => DetailingSession | undefined;
  getActiveTireSetup: (vehicleId: number) => TireSetup | undefined;
  getUpcomingMaintenanceItems: (vehicleId: number) => MaintenanceRecord[];
  calculateGlossIndex: (vehicleId: number) => number;
  getTotalPointsEarned: (vehicleId: number) => number;
}

// Create the context with undefined as default value
const GlobalVehicleContext = createContext<GlobalVehicleContextType | undefined>(undefined);

// Define the provider props
interface GlobalVehicleProviderProps {
  children: ReactNode;
}

// Create the provider component
export const GlobalVehicleProvider: React.FC<GlobalVehicleProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // State for vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState<boolean>(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  
  // State for modifications
  const [modificationsByVehicle, setModificationsByVehicle] = useState<Record<number, Modification[]>>({});
  const [loadingModifications, setLoadingModifications] = useState<boolean>(false);
  const [modificationError, setModificationError] = useState<string | null>(null);
  
  // State for maintenance records
  const [maintenanceRecordsByVehicle, setMaintenanceRecordsByVehicle] = useState<Record<number, MaintenanceRecord[]>>({});
  const [loadingMaintenanceRecords, setLoadingMaintenanceRecords] = useState<boolean>(false);
  const [maintenanceRecordError, setMaintenanceRecordError] = useState<string | null>(null);
  
  // State for tire setups
  const [tireSetupsByVehicle, setTireSetupsByVehicle] = useState<Record<number, TireSetup[]>>({});
  const [loadingTireSetups, setLoadingTireSetups] = useState<boolean>(false);
  const [tireSetupError, setTireSetupError] = useState<string | null>(null);
  
  // State for detailing sessions
  const [detailingSessionsByVehicle, setDetailingSessionsByVehicle] = useState<Record<number, DetailingSession[]>>({});
  const [loadingDetailingSessions, setLoadingDetailingSessions] = useState<boolean>(false);
  const [detailingSessionError, setDetailingSessionError] = useState<string | null>(null);
  
  // State for vehicle documents
  const [documentsByVehicle, setDocumentsByVehicle] = useState<Record<number, VehicleDocument[]>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // State for drive journal entries
  const [driveJournalsByVehicle, setDriveJournalsByVehicle] = useState<Record<number, DriveJournalEntry[]>>({});
  const [loadingDriveJournals, setLoadingDriveJournals] = useState<boolean>(false);
  const [driveJournalError, setDriveJournalError] = useState<string | null>(null);
  
  // Load all user's vehicles on component mount
  useEffect(() => {
    refreshVehicles();
  }, []);
  
  // When activeVehicle changes, load all related data
  useEffect(() => {
    if (activeVehicle) {
      const vehicleId = activeVehicle.id;
      refreshModifications(vehicleId);
      refreshMaintenanceRecords(vehicleId);
      refreshTireSetups(vehicleId);
      refreshDetailingSessions(vehicleId);
      refreshDocuments(vehicleId);
      refreshDriveJournals(vehicleId);
    }
  }, [activeVehicle]);
  
  // Vehicles CRUD operations
  const refreshVehicles = async () => {
    setLoadingVehicles(true);
    setVehicleError(null);
    try {
      const response = await apiRequest('GET', '/api/vehicles');
      const data = await response.json();
      setVehicles(data);
      if (data.length > 0 && !activeVehicle) {
        setActiveVehicle(data[0]);
      }
    } catch (error) {
      setVehicleError('Failed to load vehicles');
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        variant: 'destructive',
      });
    } finally {
      setLoadingVehicles(false);
    }
  };
  
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/vehicles', vehicle);
      if (!response.ok) {
        throw new Error('Failed to add vehicle');
      }
      const newVehicle = await response.json();
      setVehicles(prev => [...prev, newVehicle]);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle added successfully',
      });
      return newVehicle;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add vehicle',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateVehicle = async (id: number, updates: Partial<Vehicle>) => {
    try {
      const response = await apiRequest('PATCH', `/api/vehicles/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }
      const updatedVehicle = await response.json();
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      if (activeVehicle?.id === id) {
        setActiveVehicle(updatedVehicle);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle updated successfully',
      });
      return updatedVehicle;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vehicle',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteVehicle = async (id: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/vehicles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }
      setVehicles(prev => prev.filter(v => v.id !== id));
      if (activeVehicle?.id === id) {
        setActiveVehicle(vehicles.length > 1 ? vehicles.find(v => v.id !== id)! : null);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Modifications CRUD operations
  const refreshModifications = async (vehicleId: number) => {
    setLoadingModifications(true);
    setModificationError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/modifications`);
      const data = await response.json();
      setModificationsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setModificationError('Failed to load modifications');
      toast({
        title: 'Error',
        description: 'Failed to load modifications',
        variant: 'destructive',
      });
    } finally {
      setLoadingModifications(false);
    }
  };
  
  const addModification = async (modification: Omit<Modification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/modifications', modification);
      if (!response.ok) {
        throw new Error('Failed to add modification');
      }
      const newModification = await response.json();
      const vehicleId = newModification.vehicleId;
      setModificationsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newModification]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/modifications`] });
      toast({
        title: 'Success',
        description: 'Modification added successfully',
      });
      return newModification;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add modification',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateModification = async (id: number, updates: Partial<Modification>) => {
    try {
      const response = await apiRequest('PATCH', `/api/modifications/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update modification');
      }
      const updatedModification = await response.json();
      const vehicleId = updatedModification.vehicleId;
      setModificationsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(m => m.id === id ? updatedModification : m) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/modifications`] });
      toast({
        title: 'Success',
        description: 'Modification updated successfully',
      });
      return updatedModification;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update modification',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteModification = async (id: number) => {
    try {
      // Need to know which vehicle this modification belongs to before deleting
      let vehicleId = -1;
      Object.entries(modificationsByVehicle).forEach(([vId, mods]) => {
        if (mods.some(m => m.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Modification not found');
      }
      
      const response = await apiRequest('DELETE', `/api/modifications/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete modification');
      }
      
      setModificationsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(m => m.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/modifications`] });
      toast({
        title: 'Success',
        description: 'Modification deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete modification',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Maintenance Records CRUD operations
  const refreshMaintenanceRecords = async (vehicleId: number) => {
    setLoadingMaintenanceRecords(true);
    setMaintenanceRecordError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/maintenance-records`);
      const data = await response.json();
      setMaintenanceRecordsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setMaintenanceRecordError('Failed to load maintenance records');
      toast({
        title: 'Error',
        description: 'Failed to load maintenance records',
        variant: 'destructive',
      });
    } finally {
      setLoadingMaintenanceRecords(false);
    }
  };
  
  const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/maintenance-records', record);
      if (!response.ok) {
        throw new Error('Failed to add maintenance record');
      }
      const newRecord = await response.json();
      const vehicleId = newRecord.vehicleId;
      setMaintenanceRecordsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newRecord]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/maintenance-records`] });
      toast({
        title: 'Success',
        description: 'Maintenance record added successfully',
      });
      return newRecord;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add maintenance record',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateMaintenanceRecord = async (id: number, updates: Partial<MaintenanceRecord>) => {
    try {
      const response = await apiRequest('PATCH', `/api/maintenance-records/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update maintenance record');
      }
      const updatedRecord = await response.json();
      const vehicleId = updatedRecord.vehicleId;
      setMaintenanceRecordsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(r => r.id === id ? updatedRecord : r) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/maintenance-records`] });
      toast({
        title: 'Success',
        description: 'Maintenance record updated successfully',
      });
      return updatedRecord;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update maintenance record',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteMaintenanceRecord = async (id: number) => {
    try {
      // Need to know which vehicle this record belongs to before deleting
      let vehicleId = -1;
      Object.entries(maintenanceRecordsByVehicle).forEach(([vId, records]) => {
        if (records.some(r => r.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Maintenance record not found');
      }
      
      const response = await apiRequest('DELETE', `/api/maintenance-records/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete maintenance record');
      }
      
      setMaintenanceRecordsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(r => r.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/maintenance-records`] });
      toast({
        title: 'Success',
        description: 'Maintenance record deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete maintenance record',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Tire Setups CRUD operations
  const refreshTireSetups = async (vehicleId: number) => {
    setLoadingTireSetups(true);
    setTireSetupError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/tire-setups`);
      const data = await response.json();
      setTireSetupsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setTireSetupError('Failed to load tire setups');
      toast({
        title: 'Error',
        description: 'Failed to load tire setups',
        variant: 'destructive',
      });
    } finally {
      setLoadingTireSetups(false);
    }
  };
  
  const addTireSetup = async (tireSetup: Omit<TireSetup, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/tire-setups', tireSetup);
      if (!response.ok) {
        throw new Error('Failed to add tire setup');
      }
      const newTireSetup = await response.json();
      const vehicleId = newTireSetup.vehicleId;
      setTireSetupsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newTireSetup]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/tire-setups`] });
      toast({
        title: 'Success',
        description: 'Tire setup added successfully',
      });
      return newTireSetup;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add tire setup',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateTireSetup = async (id: number, updates: Partial<TireSetup>) => {
    try {
      const response = await apiRequest('PATCH', `/api/tire-setups/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update tire setup');
      }
      const updatedTireSetup = await response.json();
      const vehicleId = updatedTireSetup.vehicleId;
      setTireSetupsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(t => t.id === id ? updatedTireSetup : t) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/tire-setups`] });
      toast({
        title: 'Success',
        description: 'Tire setup updated successfully',
      });
      return updatedTireSetup;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tire setup',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteTireSetup = async (id: number) => {
    try {
      // Need to know which vehicle this tire setup belongs to before deleting
      let vehicleId = -1;
      Object.entries(tireSetupsByVehicle).forEach(([vId, setups]) => {
        if (setups.some(s => s.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Tire setup not found');
      }
      
      const response = await apiRequest('DELETE', `/api/tire-setups/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete tire setup');
      }
      
      setTireSetupsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(s => s.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/tire-setups`] });
      toast({
        title: 'Success',
        description: 'Tire setup deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tire setup',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Detailing Sessions CRUD operations
  const refreshDetailingSessions = async (vehicleId: number) => {
    setLoadingDetailingSessions(true);
    setDetailingSessionError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/detailing-sessions`);
      const data = await response.json();
      setDetailingSessionsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setDetailingSessionError('Failed to load detailing sessions');
      toast({
        title: 'Error',
        description: 'Failed to load detailing sessions',
        variant: 'destructive',
      });
    } finally {
      setLoadingDetailingSessions(false);
    }
  };
  
  const addDetailingSession = async (session: Omit<DetailingSession, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/detailing-sessions', session);
      if (!response.ok) {
        throw new Error('Failed to add detailing session');
      }
      const newSession = await response.json();
      const vehicleId = newSession.vehicleId;
      setDetailingSessionsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newSession]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/detailing-sessions`] });
      toast({
        title: 'Success',
        description: 'Detailing session added successfully',
      });
      return newSession;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add detailing session',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateDetailingSession = async (id: number, updates: Partial<DetailingSession>) => {
    try {
      const response = await apiRequest('PATCH', `/api/detailing-sessions/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update detailing session');
      }
      const updatedSession = await response.json();
      const vehicleId = updatedSession.vehicleId;
      setDetailingSessionsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(s => s.id === id ? updatedSession : s) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/detailing-sessions`] });
      toast({
        title: 'Success',
        description: 'Detailing session updated successfully',
      });
      return updatedSession;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update detailing session',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteDetailingSession = async (id: number) => {
    try {
      // Need to know which vehicle this session belongs to before deleting
      let vehicleId = -1;
      Object.entries(detailingSessionsByVehicle).forEach(([vId, sessions]) => {
        if (sessions.some(s => s.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Detailing session not found');
      }
      
      const response = await apiRequest('DELETE', `/api/detailing-sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete detailing session');
      }
      
      setDetailingSessionsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(s => s.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/detailing-sessions`] });
      toast({
        title: 'Success',
        description: 'Detailing session deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete detailing session',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Vehicle Documents CRUD operations
  const refreshDocuments = async (vehicleId: number) => {
    setLoadingDocuments(true);
    setDocumentError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/documents`);
      const data = await response.json();
      setDocumentsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setDocumentError('Failed to load documents');
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  const addDocument = async (document: Omit<VehicleDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/vehicle-documents', document);
      if (!response.ok) {
        throw new Error('Failed to add document');
      }
      const newDocument = await response.json();
      const vehicleId = newDocument.vehicleId;
      setDocumentsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newDocument]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/documents`] });
      toast({
        title: 'Success',
        description: 'Document added successfully',
      });
      return newDocument;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add document',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateDocument = async (id: number, updates: Partial<VehicleDocument>) => {
    try {
      const response = await apiRequest('PATCH', `/api/vehicle-documents/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      const updatedDocument = await response.json();
      const vehicleId = updatedDocument.vehicleId;
      setDocumentsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(d => d.id === id ? updatedDocument : d) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/documents`] });
      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
      return updatedDocument;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update document',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteDocument = async (id: number) => {
    try {
      // Need to know which vehicle this document belongs to before deleting
      let vehicleId = -1;
      Object.entries(documentsByVehicle).forEach(([vId, docs]) => {
        if (docs.some(d => d.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Document not found');
      }
      
      const response = await apiRequest('DELETE', `/api/vehicle-documents/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      setDocumentsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(d => d.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/documents`] });
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Drive Journal Entries CRUD operations
  const refreshDriveJournals = async (vehicleId: number) => {
    setLoadingDriveJournals(true);
    setDriveJournalError(null);
    try {
      const response = await apiRequest('GET', `/api/vehicles/${vehicleId}/drive-journals`);
      const data = await response.json();
      setDriveJournalsByVehicle(prev => ({
        ...prev,
        [vehicleId]: data
      }));
    } catch (error) {
      setDriveJournalError('Failed to load drive journals');
      toast({
        title: 'Error',
        description: 'Failed to load drive journals',
        variant: 'destructive',
      });
    } finally {
      setLoadingDriveJournals(false);
    }
  };
  
  const addDriveJournal = async (entry: Omit<DriveJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiRequest('POST', '/api/drive-journals', entry);
      if (!response.ok) {
        throw new Error('Failed to add drive journal entry');
      }
      const newEntry = await response.json();
      const vehicleId = newEntry.vehicleId;
      setDriveJournalsByVehicle(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), newEntry]
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/drive-journals`] });
      toast({
        title: 'Success',
        description: 'Drive journal entry added successfully',
      });
      return newEntry;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add drive journal entry',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const updateDriveJournal = async (id: number, updates: Partial<DriveJournalEntry>) => {
    try {
      const response = await apiRequest('PATCH', `/api/drive-journals/${id}`, updates);
      if (!response.ok) {
        throw new Error('Failed to update drive journal entry');
      }
      const updatedEntry = await response.json();
      const vehicleId = updatedEntry.vehicleId;
      setDriveJournalsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.map(e => e.id === id ? updatedEntry : e) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/drive-journals`] });
      toast({
        title: 'Success',
        description: 'Drive journal entry updated successfully',
      });
      return updatedEntry;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update drive journal entry',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteDriveJournal = async (id: number) => {
    try {
      // Need to know which vehicle this entry belongs to before deleting
      let vehicleId = -1;
      Object.entries(driveJournalsByVehicle).forEach(([vId, entries]) => {
        if (entries.some(e => e.id === id)) {
          vehicleId = parseInt(vId);
        }
      });
      
      if (vehicleId === -1) {
        throw new Error('Drive journal entry not found');
      }
      
      const response = await apiRequest('DELETE', `/api/drive-journals/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete drive journal entry');
      }
      
      setDriveJournalsByVehicle(prev => ({
        ...prev,
        [vehicleId]: prev[vehicleId]?.filter(e => e.id !== id) || []
      }));
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/drive-journals`] });
      toast({
        title: 'Success',
        description: 'Drive journal entry deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete drive journal entry',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Utility functions
  const getLatestDetailingSession = (vehicleId: number): DetailingSession | undefined => {
    const sessions = detailingSessionsByVehicle[vehicleId] || [];
    if (sessions.length === 0) return undefined;
    
    return sessions.reduce((latest, current) => {
      const latestDate = new Date(latest.date);
      const currentDate = new Date(current.date);
      return currentDate > latestDate ? current : latest;
    }, sessions[0]);
  };
  
  const getActiveTireSetup = (vehicleId: number): TireSetup | undefined => {
    const setups = tireSetupsByVehicle[vehicleId] || [];
    return setups.find(setup => setup.isActive);
  };
  
  const getUpcomingMaintenanceItems = (vehicleId: number): MaintenanceRecord[] => {
    const records = maintenanceRecordsByVehicle[vehicleId] || [];
    const today = new Date();
    
    // Filter for scheduled maintenance or maintenance with a due date in the future
    return records.filter(record => {
      if (record.status === 'Scheduled') return true;
      if (record.nextDueDate) {
        const dueDate = new Date(record.nextDueDate);
        return dueDate > today;
      }
      return false;
    });
  };
  
  const calculateGlossIndex = (vehicleId: number): number => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 0;
    
    // Start with the vehicle's base gloss index or default to 70
    let glossIndex = vehicle.glossIndex || 70;
    
    // Get the latest detailing session
    const latestSession = getLatestDetailingSession(vehicleId);
    if (latestSession) {
      // If there's a gloss meter reading, use that directly
      if (latestSession.glossMeterReading) {
        return Math.min(100, Math.max(0, latestSession.glossMeterReading));
      }
      
      // Otherwise calculate based on type of detail and time elapsed
      const detailDate = new Date(latestSession.date);
      const today = new Date();
      const daysSinceDetail = Math.floor((today.getTime() - detailDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Adjust gloss index based on type of detail
      switch (latestSession.type) {
        case 'ceramic':
          glossIndex = Math.min(100, glossIndex + 15);
          // Ceramic coating degrades very slowly
          glossIndex -= Math.min(15, daysSinceDetail / 30);
          break;
        case 'polish':
          glossIndex = Math.min(100, glossIndex + 20);
          // Polish effect degrades faster
          glossIndex -= Math.min(20, daysSinceDetail / 15);
          break;
        case 'wax':
          glossIndex = Math.min(100, glossIndex + 10);
          // Wax degrades relatively quickly
          glossIndex -= Math.min(10, daysSinceDetail / 7);
          break;
        case 'wash':
          glossIndex = Math.min(100, glossIndex + 5);
          // Wash effect is temporary
          glossIndex -= Math.min(5, daysSinceDetail / 3);
          break;
        default:
          // Minimal effect for other types
          glossIndex = Math.min(100, glossIndex + 2);
          glossIndex -= Math.min(2, daysSinceDetail / 2);
      }
    } else {
      // If no detailing history, gradually decay from base value
      glossIndex = Math.max(50, glossIndex - 10);
    }
    
    return Math.min(100, Math.max(0, Math.round(glossIndex)));
  };
  
  const getTotalPointsEarned = (vehicleId: number): number => {
    // Calculate points from modifications
    const modPoints = (modificationsByVehicle[vehicleId] || [])
      .reduce((total, mod) => total + (mod.pointsEarned || 0), 0);
    
    // Calculate points from maintenance records
    const maintenancePoints = (maintenanceRecordsByVehicle[vehicleId] || [])
      .reduce((total, record) => total + (record.pointsEarned || 0), 0);
    
    // Calculate points from tire setups
    const tirePoints = (tireSetupsByVehicle[vehicleId] || [])
      .reduce((total, setup) => total + (setup.pointsEarned || 0), 0);
    
    // Calculate points from detailing sessions
    const detailingPoints = (detailingSessionsByVehicle[vehicleId] || [])
      .reduce((total, session) => total + (session.pointsEarned || 0), 0);
    
    // Calculate points from drive journals
    const drivePoints = (driveJournalsByVehicle[vehicleId] || [])
      .reduce((total, entry) => total + (entry.pointsEarned || 0), 0);
    
    // Sum all points
    return modPoints + maintenancePoints + tirePoints + detailingPoints + drivePoints;
  };
  
  // Combine all functions and state into the context value
  const contextValue: GlobalVehicleContextType = {
    // Vehicles
    vehicles,
    activeVehicle,
    setActiveVehicle,
    loadingVehicles,
    vehicleError,
    refreshVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Modifications
    modificationsByVehicle,
    loadingModifications,
    modificationError,
    refreshModifications,
    addModification,
    updateModification,
    deleteModification,
    
    // Maintenance Records
    maintenanceRecordsByVehicle,
    loadingMaintenanceRecords,
    maintenanceRecordError,
    refreshMaintenanceRecords,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    
    // Tire Setups
    tireSetupsByVehicle,
    loadingTireSetups,
    tireSetupError,
    refreshTireSetups,
    addTireSetup,
    updateTireSetup,
    deleteTireSetup,
    
    // Detailing Sessions
    detailingSessionsByVehicle,
    loadingDetailingSessions,
    detailingSessionError,
    refreshDetailingSessions,
    addDetailingSession,
    updateDetailingSession,
    deleteDetailingSession,
    
    // Vehicle Documents
    documentsByVehicle,
    loadingDocuments,
    documentError,
    refreshDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    
    // Drive Journal Entries
    driveJournalsByVehicle,
    loadingDriveJournals,
    driveJournalError,
    refreshDriveJournals,
    addDriveJournal,
    updateDriveJournal,
    deleteDriveJournal,
    
    // Utilities
    getLatestDetailingSession,
    getActiveTireSetup,
    getUpcomingMaintenanceItems,
    calculateGlossIndex,
    getTotalPointsEarned,
  };
  
  return (
    <GlobalVehicleContext.Provider value={contextValue}>
      {children}
    </GlobalVehicleContext.Provider>
  );
};

// Custom hook to use the vehicle context
export const useGlobalVehicles = () => {
  const context = useContext(GlobalVehicleContext);
  
  if (context === undefined) {
    throw new Error('useGlobalVehicles must be used within a GlobalVehicleProvider');
  }
  
  return context;
};

export default GlobalVehicleContext;