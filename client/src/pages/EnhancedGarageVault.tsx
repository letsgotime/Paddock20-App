import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Car, ChevronRight, Gauge, Activity, Wrench, Zap, FileText, PlusCircle,
  Calendar, AlertTriangle, TrendingUp, MoreHorizontal, FileDown, Download,
  Printer, Search, Filter, X, RotateCcw, Upload, Mic, Camera, FileImage,
  Link2, FolderOpen, Layout, CircleDollarSign, Bookmark, MessageSquare,
  BarChart3, ExternalLink, History, ThumbsUp, Package, CircleAlert, Video
} from 'lucide-react';

// Initialize Supabase client - using real credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Type definitions for our data structures
interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  vin: string;
  license_plate: string;
  color: string;
  image_url?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  status: 'Active' | 'Stored' | 'Sold' | 'Project';
  notes?: string;
  created_at: string;
  updated_at: string;
  drivetrain?: string;
  type?: string;
  engine_type?: string;
  transmission?: string;
  mileage?: number;
  tire_specs?: string;
  gallery?: string[];
  docs?: string[];
  delivery_photo_url?: string;
  delivery_date?: string;
  sold_photo_url?: string;
  sold_date?: string;
  voice_notes?: {
    id: string;
    url: string;
    date: string;
    title?: string;
  }[];
  videos?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    thumbnail_url?: string;
  }[];
  monthly_photos?: {
    date: string;
    url: string;
    notes?: string;
  }[];
  detailed_specs?: {
    exterior_color_code?: string;
    interior_color_code?: string;
    factory_options?: string[];
    production_date?: string;
    special_edition?: string;
    engine_number?: string;
    original_msrp?: number;
  };
  purchase_documents?: Document[];
  service_history?: {
    date: string;
    mileage: number;
    description: string;
    performed_by?: string;
    documents?: Document[];
    photos?: string[];
    voice_notes?: string[];
    videos?: string[];
  }[];
}

interface Modification {
  id: string;
  vehicle_id: string;
  name: string;
  type: string;
  description?: string;
  brand?: string;
  model?: string;
  part_number?: string;
  installation_date?: string;
  installation_location?: string;
  cost?: number;
  installer?: string;
  installer_contact?: string;
  warranty_expires?: string;
  warranty_details?: string;
  warranty_provider?: string;
  warranty_contact?: string;
  warranty_policy_url?: string;
  status: 'Planned' | 'In Progress' | 'Installed' | 'Removed';
  affected_systems?: string[];
  image_url?: string;
  link_url?: string;
  link_label?: string;
  notes?: string;
  before_photos?: string[];
  after_photos?: string[];
  progress_photos?: string[];
  category?: string;
  created_at: string;
  updated_at: string;
  voice_notes?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    duration?: number;
  }[];
  videos?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    thumbnail_url?: string;
    duration?: number;
  }[];
  documents?: Document[];
  receipts?: Document[];
  installation_instructions?: Document[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  shop_photos?: string[];
  shop_name?: string;
  shop_contact?: string;
  shop_website?: string;
  rating?: number;
  review_notes?: string;
  price_comparison?: {
    shop_name: string;
    price: number;
    date: string;
    notes?: string;
  }[];
  installation_steps?: {
    step_number: number;
    description: string;
    photos?: string[];
    videos?: string[];
    voice_notes?: string[];
    time_spent?: number;
  }[];
  goals?: {
    description: string;
    achieved: boolean;
    date_achieved?: string;
    before_metrics?: Record<string, number>;
    after_metrics?: Record<string, number>;
    photos?: string[];
  }[];
  part_details?: {
    manufacturer?: string;
    oem_part_number?: string;
    weight?: number;
    dimensions?: string;
    material?: string;
    color?: string;
    country_of_origin?: string;
    purchase_url?: string;
    purchase_date?: string;
    purchase_price?: number;
    retail_price?: number;
    discount_amount?: number;
    discount_percentage?: number;
  };
  technical_specs?: Record<string, any>;
}

interface Maintenance {
  id: string;
  vehicle_id: string;
  type: string;
  title: string;
  description?: string;
  performed_by: string;
  performed_by_type: 'Dealership' | 'Independent Shop' | 'DIY' | 'Friend/Family' | 'Mobile Service' | 'Other';
  shop_name?: string;
  shop_contact?: string;
  shop_address?: string;
  shop_website?: string;
  shop_photos?: string[];
  date: string;
  time_started?: string;
  time_completed?: string;
  duration_hours?: number;
  mileage: number;
  cost: number;
  labor_cost?: number;
  parts_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  parts?: {
    name: string;
    part_number?: string;
    brand?: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    notes?: string;
    image_url?: string;
    replacement_interval?: number;
    replacement_interval_unit?: 'Miles' | 'Months' | 'Years';
  }[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';
  diagnostic_codes?: string[];
  diagnostic_details?: string;
  symptoms?: string[];
  priority: 'Critical' | 'High' | 'Normal' | 'Low' | 'Cosmetic';
  image_url?: string;
  before_photos?: string[];
  after_photos?: string[];
  receipt_url?: string;
  invoice_url?: string;
  estimate_url?: string;
  notes?: string;
  outcome_notes?: string;
  follow_up_needed?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
  voice_notes?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    duration?: number;
  }[];
  videos?: {
    id: string;
    url: string;
    date: string;
    title?: string;
    thumbnail_url?: string;
    duration?: number;
  }[];
  documents?: Document[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  quality_rating?: number;
  service_rating?: number;
  price_rating?: number;
  recommendation_rating?: number;
  would_use_again?: boolean;
  review_notes?: string;
  next_recommended_service_date?: string;
  next_recommended_service_mileage?: number;
  warranty_info?: {
    provider: string;
    contact?: string;
    expiration_date?: string;
    expiration_mileage?: number;
    details?: string;
    document_url?: string;
  };
  maintenance_steps?: {
    step_number: number;
    description: string;
    time_spent?: number;
    photos?: string[];
    videos?: string[];
    voice_notes?: string[];
    notes?: string;
  }[];
  related_maintenance?: string[]; // IDs of related maintenance records
  issues_found?: {
    description: string;
    severity: 'Critical' | 'Major' | 'Minor' | 'Cosmetic';
    photos?: string[];
    fixed?: boolean;
    fix_description?: string;
  }[];
  fluid_levels?: {
    fluid_type: string;
    before_level?: string;
    after_level?: string;
    fluid_added?: number;
    fluid_unit?: 'Quarts' | 'Liters' | 'Ounces' | 'Other';
    fluid_brand?: string;
    fluid_part_number?: string;
  }[];
  tire_data?: {
    tread_depths?: {
      FL?: number;
      FR?: number;
      RL?: number;
      RR?: number;
      spare?: number;
    };
    pressures?: {
      FL?: number;
      FR?: number;
      RL?: number;
      RR?: number;
      spare?: number;
    };
    rotated?: boolean;
    rotation_pattern?: string;
  };
  brake_data?: {
    pad_measurements?: {
      FL?: number;
      FR?: number;
      RL?: number;
      RR?: number;
    };
    rotor_measurements?: {
      FL?: number;
      FR?: number;
      RL?: number;
      RR?: number;
    };
    caliper_condition?: {
      FL?: string;
      FR?: string;
      RL?: string;
      RR?: string;
    };
    fluid_condition?: string;
    fluid_changed?: boolean;
  };
  battery_data?: {
    voltage?: number;
    cold_cranking_amps?: number;
    brand?: string;
    model?: string;
    date_installed?: string;
    replacement_due?: string;
  };
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  category: string;
  created_at: string;
  updated_at: string;
  size?: number;
  thumbnail_url?: string;
}

interface Tire {
  id: string;
  vehicle_id: string;
  position: 'FL' | 'FR' | 'RL' | 'RR' | 'Spare';
  brand: string;
  model: string;
  size: string;
  type: string;
  date_installed: string;
  purchase_price?: number;
  tread_depth: number; // in 32nds of an inch
  pressure: number; // PSI
  mileage_installed?: number;
  rotation_history?: {
    date: string;
    position: string;
    mileage?: number;
    tread_depth?: number;
  }[];
  notes?: string;
  image_url?: string;
  documents?: Document[];
  status: 'Active' | 'Replaced' | 'Damaged';
  warranty_info?: string;
}

interface OBDMetrics {
  mileage: number;
  fuelLevel: number;
  oilLevel: number;
  oilTemp: number;
  coolantTemp: number;
  batteryHealth: number;
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  carStatus: 'Ready' | 'Service Due' | 'Requires Attention';
  lastService: string;
  nextService: string;
  nextOilChange: string;
  glossIndex: number;
  glossHistory: {
    date: string;
    value: number;
  }[];
  recentDrives: {
    date: string;
    distance: number;
    duration: string;
  }[];
  brakeHealth?: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
}

const EnhancedGarageVault: React.FC = () => {
  // State management for vehicles and related data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [tires, setTires] = useState<Tire[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [vehicleMetrics, setVehicleMetrics] = useState<OBDMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for UI controls
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showAddModificationForm, setShowAddModificationForm] = useState(false);
  const [showAddMaintenanceForm, setShowAddMaintenanceForm] = useState(false);
  const [showAddTireForm, setShowAddTireForm] = useState(false);
  const [showAddDocumentForm, setShowAddDocumentForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs for UI elements and media capturing
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Fetch vehicles from Supabase on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Fetch real vehicle data from Supabase
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setVehicles(data);
          setActiveVehicle(data[0]);
          
          // Fetch associated data for the first vehicle
          fetchVehicleData(data[0].id);
        } else {
          setVehicles([]);
          setActiveVehicle(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);
  
  // Fetch vehicle data (modifications, maintenance records, OBD metrics)
  const fetchVehicleData = async (vehicleId: string) => {
    try {
      setLoading(true);
      
      // Fetch modifications from Supabase
      const { data: modData, error: modError } = await supabase
        .from('modifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('installation_date', { ascending: false });
        
      if (modError) throw modError;
      setModifications(modData || []);
      
      // Fetch maintenance records from Supabase
      const { data: maintData, error: maintError } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false });
        
      if (maintError) throw maintError;
      setMaintenanceRecords(maintData || []);
      
      // Fetch tire data from Supabase
      const { data: tireData, error: tireError } = await supabase
        .from('tires')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('date_installed', { ascending: false });
        
      if (tireError) throw tireError;
      setTires(tireData || []);
      
      // Fetch documents from Supabase
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });
        
      if (docError) throw docError;
      setDocuments(docData || []);
      
      // Connect to OBD2 interface to get real-time vehicle data
      try {
        // Attempt to connect to OBD via API
        const obdApiEndpoint = `/api/obd/vehicle/${vehicleId}/telemetry`;
        const response = await fetch(obdApiEndpoint);
        
        if (response.ok) {
          const obdMetrics = await response.json();
          setVehicleMetrics(obdMetrics);
        } else {
          // If API fails, attempt direct WebBluetooth connection
          await connectToOBDDirectly(vehicleId);
        }
      } catch (err) {
        console.error('Error connecting to OBD interface:', err);
        setVehicleMetrics(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      setLoading(false);
    }
  };
  
  // Connect to OBD directly using WebBluetooth API
  const connectToOBDDirectly = async (vehicleId: string) => {
    if (!navigator.bluetooth) {
      console.error('WebBluetooth API is not available on this device/browser');
      setError('Bluetooth connectivity is not available on this device/browser. Please use a Bluetooth-enabled device with Chrome or Edge.');
      return;
    }
    
    try {
      // Request device with OBD2 service UUID
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['1234'] }, // OBD service UUID - replace with actual OBD2 service UUID
          { namePrefix: 'OBD' }
        ],
        optionalServices: ['battery_service']
      });
      
      console.log('Got device:', device.name);
      
      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }
      
      // Get OBD service
      const service = await server.getPrimaryService('1234'); // Replace with actual OBD2 service UUID
      
      // Get characteristics for different OBD parameters
      const mileageChar = await service.getCharacteristic('mileage');
      const fuelLevelChar = await service.getCharacteristic('fuel_level');
      
      // Read values
      const mileageData = await mileageChar.readValue();
      const fuelLevelData = await fuelLevelChar.readValue();
      
      // Parse values
      const mileage = mileageData.getUint32(0, true);
      const fuelLevel = fuelLevelData.getUint8(0);
      
      // Create metrics object from real OBD data
      setVehicleMetrics({
        mileage,
        fuelLevel,
        oilLevel: 0, // Will be populated with real data when available
        oilTemp: 0,
        coolantTemp: 0,
        batteryHealth: 0,
        tirePressure: {
          frontLeft: 0,
          frontRight: 0,
          rearLeft: 0,
          rearRight: 0
        },
        carStatus: 'Ready',
        lastService: '',
        nextService: '',
        nextOilChange: '',
        glossIndex: 0,
        glossHistory: [],
        recentDrives: []
      });
      
    } catch (err) {
      console.error('Error connecting to OBD device via Bluetooth:', err);
      setVehicleMetrics(null);
    }
  };
  
  // Handle adding a new vehicle with user input data
  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Save to Supabase database
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        const newVehicles = [data[0], ...vehicles];
        setVehicles(newVehicles);
        setActiveVehicle(data[0]);
        
        // Fetch real vehicle data for the new vehicle
        fetchVehicleData(data[0].id);
      }
      
      setShowAddVehicleForm(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      setError('Failed to add vehicle. Please try again.');
    }
  };
  
  // Handle adding a new modification with user input data
  const handleAddModification = async (modificationData: Omit<Modification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!activeVehicle) return;
      
      const newMod = {
        ...modificationData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('modifications')
        .insert([newMod])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        setModifications([data[0], ...modifications]);
      }
      
      setShowAddModificationForm(false);
    } catch (error) {
      console.error('Error adding modification:', error);
      setError('Failed to add modification. Please try again.');
    }
  };
  
  // Handle adding a new maintenance record with user input data
  const handleAddMaintenance = async (maintenanceData: Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!activeVehicle) return;
      
      const newMaintenance = {
        ...maintenanceData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('maintenance')
        .insert([newMaintenance])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        setMaintenanceRecords([data[0], ...maintenanceRecords]);
      }
      
      setShowAddMaintenanceForm(false);
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      setError('Failed to add maintenance record. Please try again.');
    }
  };
  
  // Handle adding new tire information
  const handleAddTire = async (tireData: Omit<Tire, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!activeVehicle) return;
      
      const newTire = {
        ...tireData,
        vehicle_id: activeVehicle.id
      };
      
      // Save to Supabase database
      const { data, error } = await supabase
        .from('tires')
        .insert([newTire])
        .select();
        
      if (error) throw error;
      
      // Update state with real API response data
      if (data && data.length > 0) {
        setTires([data[0], ...tires]);
      }
      
      setShowAddTireForm(false);
    } catch (error) {
      console.error('Error adding tire information:', error);
      setError('Failed to add tire information. Please try again.');
    }
  };
  
  // Handle document uploads
  const handleDocumentUpload = async (files: FileList, category: string, relatedItem?: string) => {
    try {
      if (!activeVehicle) return;
      
      // Track upload progress
      setUploadProgress(0);
      
      const uploadPromises = Array.from(files).map(async (file) => {
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `documents/${activeVehicle.id}/${category}/${fileName}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('vehicle-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
            }
          });
        
        if (error) throw error;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('vehicle-documents')
          .getPublicUrl(filePath);
        
        // Create document metadata record
        const documentData = {
          name: file.name,
          type: file.type,
          url: urlData.publicUrl,
          category,
          vehicle_id: activeVehicle.id,
          related_item: relatedItem,
          size: file.size,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert([documentData])
          .select();
          
        if (docError) throw docError;
        
        return docData[0];
      });
      
      const newDocuments = await Promise.all(uploadPromises);
      setDocuments([...newDocuments, ...documents]);
      setUploadProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 2000);
      
      setShowAddDocumentForm(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document. Please try again.');
      setUploadProgress(0);
    }
  };
  
  // Handle voice recording
  const startVoiceRecording = async () => {
    try {
      setIsRecordingVoice(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Upload to Supabase Storage
        if (activeVehicle) {
          const fileName = `voice-note-${Date.now()}.webm`;
          const filePath = `voice-notes/${activeVehicle.id}/${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('vehicle-documents')
            .upload(filePath, audioBlob, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (error) {
            throw error;
          }
          
          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('vehicle-documents')
            .getPublicUrl(filePath);
            
          // Return the URL for further processing
          return urlData.publicUrl;
        }
      };
      
      mediaRecorder.start();
    } catch (err) {
      console.error('Error starting voice recording:', err);
      setIsRecordingVoice(false);
      setError('Failed to start voice recording. Please check microphone permissions.');
    }
  };
  
  const stopVoiceRecording = () => {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state !== 'inactive') {
      voiceRecorderRef.current.stop();
      setIsRecordingVoice(false);
      
      // Stop all audio tracks
      voiceRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Capture current location
  const captureCurrentLocation = () => {
    setIsCapturingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          try {
            // Reverse geocode to get address
            const response = await fetch(`/api/reverse-geocode?lat=${location.latitude}&lng=${location.longitude}`);
            if (response.ok) {
              const addressData = await response.json();
              location.address = addressData.display_name || 'Unknown location';
            }
          } catch (err) {
            console.error('Error reverse geocoding:', err);
          }
          
          setIsCapturingLocation(false);
          return location;
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsCapturingLocation(false);
          setError('Failed to get your location. Please check location permissions.');
        }
      );
    } else {
      setIsCapturingLocation(false);
      setError('Geolocation is not supported by this browser.');
    }
  };
  
  // Handle form submissions from user input
  const handleAddVehicleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract user input data from form
    const vehicleData = {
      user_id: 'current-user-id', // This would be the actual user ID in real app
      make: form.make.value,
      model: form.model.value,
      year: parseInt(form.year.value),
      trim: form.trim.value || '',
      vin: form.vin.value,
      license_plate: form.license_plate.value,
      color: form.color.value,
      purchase_date: form.purchase_date?.value || '',
      purchase_price: parseFloat(form.purchase_price?.value || '0'),
      current_value: parseFloat(form.current_value?.value || '0'),
      status: form.status.value as 'Active' | 'Stored' | 'Sold' | 'Project',
      notes: form.notes?.value || '',
      drivetrain: form.drivetrain?.value || '',
      type: form.type?.value || '',
      engine_type: form.engine_type?.value || '',
      transmission: form.transmission?.value || '',
      mileage: parseInt(form.mileage?.value || '0'),
      tire_specs: form.tire_specs?.value || ''
    };
    
    handleAddVehicle(vehicleData);
  };
  
  const handleAddModificationFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Get location if requested
    let location = null;
    if (form.capture_location.checked) {
      location = await captureCurrentLocation();
    }
    
    // Extract user input data from form
    const modificationData = {
      name: form.name.value,
      type: form.type.value,
      description: form.description?.value || '',
      brand: form.brand?.value || '',
      model: form.model?.value || '',
      part_number: form.part_number?.value || '',
      installation_date: form.installation_date?.value || '',
      installation_location: form.installation_location?.value || '',
      cost: parseFloat(form.cost?.value || '0'),
      installer: form.installer?.value || '',
      warranty_expires: form.warranty_expires?.value || '',
      status: form.status.value as 'Planned' | 'In Progress' | 'Installed' | 'Removed',
      category: form.category?.value || '',
      vehicle_id: activeVehicle?.id || '',
      affected_systems: form.affected_systems?.value ? form.affected_systems.value.split(',') : [],
      notes: form.notes?.value || '',
      link_url: form.link_url?.value || '',
      link_label: form.link_label?.value || '',
      location: location
    };
    
    // Handle file uploads if any
    const imageFiles = form.image_files.files;
    const beforeFiles = form.before_photos.files;
    const afterFiles = form.after_photos.files;
    
    let imageUrl = '';
    let beforePhotos: string[] = [];
    let afterPhotos: string[] = [];
    
    if (imageFiles.length > 0) {
      // Handle primary image upload
      const imageFile = imageFiles[0];
      const imagePath = await uploadFile(imageFile, 'modifications');
      if (imagePath) {
        imageUrl = imagePath;
      }
    }
    
    if (beforeFiles.length > 0) {
      // Handle before photos
      beforePhotos = await Promise.all(
        Array.from(beforeFiles).map(file => uploadFile(file, 'modifications/before'))
      );
      beforePhotos = beforePhotos.filter(Boolean) as string[];
    }
    
    if (afterFiles.length > 0) {
      // Handle after photos
      afterPhotos = await Promise.all(
        Array.from(afterFiles).map(file => uploadFile(file, 'modifications/after'))
      );
      afterPhotos = afterPhotos.filter(Boolean) as string[];
    }
    
    // Add voice note if recorded
    let voiceNoteUrl = '';
    if (form.voice_note && form.voice_note.value) {
      voiceNoteUrl = form.voice_note.value;
    }
    
    const completeModificationData = {
      ...modificationData,
      image_url: imageUrl,
      before_photos: beforePhotos,
      after_photos: afterPhotos,
      voice_note_url: voiceNoteUrl
    };
    
    handleAddModification(completeModificationData);
  };
  
  const handleAddMaintenanceFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Get location if requested
    let location = null;
    if (form.capture_location.checked) {
      location = await captureCurrentLocation();
    }
    
    // Extract user input data from form
    const maintenanceData = {
      type: form.type.value,
      title: form.title.value,
      description: form.description?.value || '',
      performed_by: form.performed_by.value,
      date: form.date.value,
      mileage: parseInt(form.mileage.value),
      cost: parseFloat(form.cost.value),
      parts: form.parts?.value ? form.parts.value.split(',') : [],
      status: form.status.value as 'Scheduled' | 'Completed' | 'Postponed',
      vehicle_id: activeVehicle?.id || '',
      notes: form.notes?.value || '',
      location: location
    };
    
    // Handle receipt image upload if any
    const receiptFiles = form.receipt_files.files;
    let receiptUrl = '';
    
    if (receiptFiles.length > 0) {
      const receiptFile = receiptFiles[0];
      const receiptPath = await uploadFile(receiptFile, 'maintenance/receipts');
      if (receiptPath) {
        receiptUrl = receiptPath;
      }
    }
    
    // Handle general image upload if any
    const imageFiles = form.image_files.files;
    let imageUrl = '';
    
    if (imageFiles.length > 0) {
      const imageFile = imageFiles[0];
      const imagePath = await uploadFile(imageFile, 'maintenance/images');
      if (imagePath) {
        imageUrl = imagePath;
      }
    }
    
    // Add voice note if recorded
    let voiceNoteUrl = '';
    if (form.voice_note && form.voice_note.value) {
      voiceNoteUrl = form.voice_note.value;
    }
    
    const completeMaintenanceData = {
      ...maintenanceData,
      receipt_url: receiptUrl,
      image_url: imageUrl,
      voice_note_url: voiceNoteUrl
    };
    
    handleAddMaintenance(completeMaintenanceData);
  };
  
  const handleAddTireFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Extract user input data from form
    const tireData = {
      vehicle_id: activeVehicle?.id || '',
      position: form.position.value as 'FL' | 'FR' | 'RL' | 'RR' | 'Spare',
      brand: form.brand.value,
      model: form.model.value,
      size: form.size.value,
      type: form.type.value,
      date_installed: form.date_installed.value,
      purchase_price: parseFloat(form.purchase_price?.value || '0'),
      tread_depth: parseFloat(form.tread_depth.value),
      pressure: parseFloat(form.pressure.value),
      mileage_installed: parseInt(form.mileage_installed?.value || '0'),
      notes: form.notes?.value || '',
      warranty_info: form.warranty_info?.value || '',
      status: form.status.value as 'Active' | 'Replaced' | 'Damaged'
    };
    
    // Handle image upload if any
    const imageFiles = form.image_files.files;
    let imageUrl = '';
    
    if (imageFiles.length > 0) {
      const imageFile = imageFiles[0];
      const imagePath = await uploadFile(imageFile, 'tires');
      if (imagePath) {
        imageUrl = imagePath;
      }
    }
    
    const completeTireData = {
      ...tireData,
      image_url: imageUrl
    };
    
    handleAddTire(completeTireData);
  };
  
  // Helper function to upload files to Supabase Storage
  const uploadFile = async (file: File, category: string) => {
    try {
      if (!activeVehicle) return null;
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${category}/${activeVehicle.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('vehicle-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('vehicle-files')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error uploading file:', err);
      return null;
    }
  };
  
  // Calculate real vehicle summary data without mocks
  const getVehicleSummary = () => {
    if (!activeVehicle) return null;
    
    const totalMods = modifications.length;
    const plannedMods = modifications.filter(m => m.status === 'Planned').length;
    const totalMaintenance = maintenanceRecords.length;
    const pendingMaintenance = maintenanceRecords.filter(m => m.status === 'Scheduled').length;
    const totalModsCost = modifications.reduce((sum, mod) => sum + (mod.cost || 0), 0);
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
    const totalTires = tires.filter(t => t.status === 'Active').length;
    const totalDocuments = documents.length;
    
    return {
      totalMods,
      plannedMods,
      totalMaintenance,
      pendingMaintenance,
      totalModsCost,
      totalMaintenanceCost,
      totalInvestment: (activeVehicle.purchase_price || 0) + totalModsCost + totalMaintenanceCost,
      totalTires,
      totalDocuments
    };
  };
  
  // Get vehicle status badge color based on actual status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Stored':
        return 'bg-blue-500';
      case 'Sold':
        return 'bg-gray-500';
      case 'Project':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get categories for documents
  const getDocumentCategories = () => {
    const categories = new Set<string>();
    documents.forEach(doc => categories.add(doc.category));
    return Array.from(categories);
  };
  
  // Group documents by category and date
  const getDocumentsByCategory = () => {
    const docsByCategory: Record<string, Document[]> = {};
    
    documents.forEach(doc => {
      if (!docsByCategory[doc.category]) {
        docsByCategory[doc.category] = [];
      }
      docsByCategory[doc.category].push(doc);
    });
    
    return docsByCategory;
  };
  
  // Group documents by year and month
  const getDocumentsByDate = () => {
    const docsByDate: Record<string, Record<string, Document[]>> = {};
    
    documents.forEach(doc => {
      const date = new Date(doc.created_at);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      if (!docsByDate[year]) {
        docsByDate[year] = {};
      }
      
      if (!docsByDate[year][month]) {
        docsByDate[year][month] = [];
      }
      
      docsByDate[year][month].push(doc);
    });
    
    return docsByDate;
  };
  
  // Get the latest tread depth readings
  const getLatestTreadDepths = () => {
    const activeTires = tires.filter(t => t.status === 'Active');
    
    const positions: ('FL' | 'FR' | 'RL' | 'RR')[] = ['FL', 'FR', 'RL', 'RR'];
    const result: Record<string, number> = {};
    
    positions.forEach(pos => {
      const tire = activeTires.find(t => t.position === pos);
      result[pos] = tire ? tire.tread_depth : 0;
    });
    
    return result;
  };
  
  // Get the latest tire pressures
  const getLatestTirePressures = () => {
    const activeTires = tires.filter(t => t.status === 'Active');
    
    const positions: ('FL' | 'FR' | 'RL' | 'RR')[] = ['FL', 'FR', 'RL', 'RR'];
    const result: Record<string, number> = {};
    
    positions.forEach(pos => {
      const tire = activeTires.find(t => t.position === pos);
      result[pos] = tire ? tire.pressure : 0;
    });
    
    return result;
  };
  
  // Render the OBD data panel - only using real data
  const renderOBDPanel = () => {
    if (!vehicleMetrics) {
      return (
        <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-900/30 mr-3">
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">Vehicle Telemetry</h3>
          </div>
          
          <div className="text-center py-8">
            <div className="mb-4">
              <RotateCcw className="h-12 w-12 text-gray-600 mx-auto animate-pulse" />
            </div>
            <p className="text-gray-400 mb-2">No OBD connection detected</p>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Connect your OBD2 device to your vehicle and pair with this application to see real-time telemetry data
            </p>
            <button className="px-4 py-2 bg-blue-900/50 text-blue-400 rounded-md hover:bg-blue-900/70 transition-colors border border-blue-800/50">
              Connect OBD Device
            </button>
          </div>
        </div>
      );
    }
    
    // Get tire data from OBD or from tire records
    const treadDepths = getLatestTreadDepths();
    const tirePressures = vehicleMetrics.tirePressure || getLatestTirePressures();
    
    return (
      <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-900/30 mr-3">
              <Gauge className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">Live Telemetry</h3>
          </div>
          <div className="flex items-center">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-gray-400 text-sm">Connected</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Fuel Level</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.fuelLevel}%
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${vehicleMetrics.fuelLevel}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Oil Temperature</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.oilTemp}°F
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.oilTemp > 230 ? 'bg-red-500' :
                  vehicleMetrics.oilTemp > 200 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (vehicleMetrics.oilTemp / 300) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Coolant Temp</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.coolantTemp}°F
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.coolantTemp > 220 ? 'bg-red-500' :
                  vehicleMetrics.coolantTemp > 200 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (vehicleMetrics.coolantTemp / 250) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Battery Health</div>
            <div className="text-xl font-semibold text-gray-100">
              {vehicleMetrics.batteryHealth}%
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${
                  vehicleMetrics.batteryHealth < 30 ? 'bg-red-500' :
                  vehicleMetrics.batteryHealth < 60 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${vehicleMetrics.batteryHealth}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-300 font-medium mb-3">Tire Pressure (PSI)</h4>
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Left</div>
                  <div className={`text-lg font-semibold ${
                    tirePressures.frontLeft < 28 || tirePressures.frontLeft > 36 
                      ? 'text-red-400' : 'text-gray-100'
                  }`}>
                    {tirePressures.frontLeft}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Right</div>
                  <div className={`text-lg font-semibold ${
                    tirePressures.frontRight < 28 || tirePressures.frontRight > 36 
                      ? 'text-red-400' : 'text-gray-100'
                  }`}>
                    {tirePressures.frontRight}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Left</div>
                  <div className={`text-lg font-semibold ${
                    tirePressures.rearLeft < 28 || tirePressures.rearLeft > 36 
                      ? 'text-red-400' : 'text-gray-100'
                  }`}>
                    {tirePressures.rearLeft}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Right</div>
                  <div className={`text-lg font-semibold ${
                    tirePressures.rearRight < 28 || tirePressures.rearRight > 36 
                      ? 'text-red-400' : 'text-gray-100'
                  }`}>
                    {tirePressures.rearRight}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-gray-300 font-medium mb-3">Tread Depth (32nds in.)</h4>
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Left</div>
                  <div className={`text-lg font-semibold ${
                    treadDepths.FL < 4 ? 'text-red-400' : 
                    treadDepths.FL < 6 ? 'text-amber-400' : 'text-gray-100'
                  }`}>
                    {treadDepths.FL}/32"
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Right</div>
                  <div className={`text-lg font-semibold ${
                    treadDepths.FR < 4 ? 'text-red-400' : 
                    treadDepths.FR < 6 ? 'text-amber-400' : 'text-gray-100'
                  }`}>
                    {treadDepths.FR}/32"
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Left</div>
                  <div className={`text-lg font-semibold ${
                    treadDepths.RL < 4 ? 'text-red-400' : 
                    treadDepths.RL < 6 ? 'text-amber-400' : 'text-gray-100'
                  }`}>
                    {treadDepths.RL}/32"
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Right</div>
                  <div className={`text-lg font-semibold ${
                    treadDepths.RR < 4 ? 'text-red-400' : 
                    treadDepths.RR < 6 ? 'text-amber-400' : 'text-gray-100'
                  }`}>
                    {treadDepths.RR}/32"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {vehicleMetrics.brakeHealth && (
          <div className="mt-6">
            <h4 className="text-gray-300 font-medium mb-3">Brake Pad Life</h4>
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Left</div>
                  <div className={`text-lg font-semibold ${
                    vehicleMetrics.brakeHealth.frontLeft < 30 ? 'text-red-400' : 
                    vehicleMetrics.brakeHealth.frontLeft < 50 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {vehicleMetrics.brakeHealth.frontLeft}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Front Right</div>
                  <div className={`text-lg font-semibold ${
                    vehicleMetrics.brakeHealth.frontRight < 30 ? 'text-red-400' : 
                    vehicleMetrics.brakeHealth.frontRight < 50 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {vehicleMetrics.brakeHealth.frontRight}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Left</div>
                  <div className={`text-lg font-semibold ${
                    vehicleMetrics.brakeHealth.rearLeft < 30 ? 'text-red-400' : 
                    vehicleMetrics.brakeHealth.rearLeft < 50 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {vehicleMetrics.brakeHealth.rearLeft}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Rear Right</div>
                  <div className={`text-lg font-semibold ${
                    vehicleMetrics.brakeHealth.rearRight < 30 ? 'text-red-400' : 
                    vehicleMetrics.brakeHealth.rearRight < 50 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {vehicleMetrics.brakeHealth.rearRight}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render modifications list
  const renderModifications = () => {
    if (modifications.length === 0) {
      return (
        <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
          <Zap className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 mb-3">No modifications logged yet</p>
          <button
            onClick={() => setShowAddModificationForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Modification
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {modifications.map((mod) => (
          <div key={mod.id} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between mb-3">
              <div>
                <h4 className="text-lg font-medium text-white">{mod.name}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 text-sm">{mod.type}</span>
                  {mod.brand && (
                    <>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-gray-400 text-sm">{mod.brand}</span>
                    </>
                  )}
                  {mod.model && (
                    <>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-gray-400 text-sm">{mod.model}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  mod.status === 'Installed' ? 'bg-green-900/50 text-green-400' :
                  mod.status === 'Planned' ? 'bg-blue-900/50 text-blue-400' :
                  mod.status === 'In Progress' ? 'bg-amber-900/50 text-amber-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {mod.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {mod.image_url && (
                <div className="rounded-lg overflow-hidden bg-gray-950/50 border border-gray-800">
                  <img 
                    src={mod.image_url} 
                    alt={mod.name} 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                {mod.description && (
                  <p className="text-gray-400 text-sm">{mod.description}</p>
                )}
                
                <div className="flex flex-wrap items-center text-sm">
                  {mod.installation_date && (
                    <div className="mr-4 mb-2 flex items-center text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {mod.installation_date}
                    </div>
                  )}
                  
                  {mod.cost !== undefined && (
                    <div className="mr-4 mb-2 flex items-center text-gray-500">
                      <CircleDollarSign className="h-3.5 w-3.5 mr-1" />
                      {mod.cost.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </div>
                  )}
                  
                  {mod.installer && (
                    <div className="mr-4 mb-2 flex items-center text-gray-500">
                      <Wrench className="h-3.5 w-3.5 mr-1" />
                      {mod.installer}
                    </div>
                  )}
                </div>
                
                {mod.link_url && (
                  <a 
                    href={mod.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    {mod.link_label || 'Product Link'}
                  </a>
                )}
              </div>
            </div>
            
            {/* Before/After Photos */}
            {(mod.before_photos?.length > 0 || mod.after_photos?.length > 0) && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Before & After</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    {mod.before_photos && mod.before_photos.length > 0 ? (
                      <img 
                        src={mod.before_photos[0]} 
                        alt="Before" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                        No Before Image
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1 text-center">Before</div>
                  </div>
                  
                  <div>
                    {mod.after_photos && mod.after_photos.length > 0 ? (
                      <img 
                        src={mod.after_photos[0]} 
                        alt="After" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                        No After Image
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1 text-center">After</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Voice Note Player */}
            {mod.voice_note_url && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Voice Note</div>
                <audio controls className="w-full">
                  <source src={mod.voice_note_url} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {/* Related Documents */}
            {mod.documents && mod.documents.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Related Documents</div>
                <div className="space-y-2">
                  {mod.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex-1 truncate text-sm text-gray-300">{doc.name}</div>
                      <Download className="h-4 w-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Location Information */}
            {mod.location && (
              <div className="mt-4 p-2 bg-gray-800/30 rounded-lg text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {mod.location.address || `${mod.location.latitude.toFixed(6)}, ${mod.location.longitude.toFixed(6)}`}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render maintenance records
  const renderMaintenance = () => {
    if (maintenanceRecords.length === 0) {
      return (
        <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
          <Wrench className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 mb-3">No maintenance records logged yet</p>
          <button
            onClick={() => setShowAddMaintenanceForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Your First Maintenance Record
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {maintenanceRecords.map((record) => (
          <div key={record.id} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between mb-3">
              <div>
                <h4 className="text-lg font-medium text-white">{record.title}</h4>
                <div className="flex items-center mt-1">
                  <span className="text-gray-400 text-sm">{record.type}</span>
                  {record.performed_by && (
                    <>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-gray-400 text-sm">By: {record.performed_by}</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  record.status === 'Completed' ? 'bg-green-900/50 text-green-400' :
                  record.status === 'Scheduled' ? 'bg-blue-900/50 text-blue-400' :
                  'bg-amber-900/50 text-amber-400'
                }`}>
                  {record.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              {(record.image_url || record.receipt_url) && (
                <div className="rounded-lg overflow-hidden bg-gray-950/50 border border-gray-800">
                  <img 
                    src={record.image_url || record.receipt_url} 
                    alt={record.title} 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                {record.description && (
                  <p className="text-gray-400 text-sm">{record.description}</p>
                )}
                
                <div className="flex flex-wrap items-center text-sm">
                  {record.date && (
                    <div className="mr-4 mb-2 flex items-center text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {record.date}
                    </div>
                  )}
                  
                  <div className="mr-4 mb-2 flex items-center text-gray-500">
                    <Gauge className="h-3.5 w-3.5 mr-1" />
                    {record.mileage.toLocaleString()} mi
                  </div>
                  
                  <div className="mr-4 mb-2 flex items-center text-gray-500">
                    <CircleDollarSign className="h-3.5 w-3.5 mr-1" />
                    {record.cost.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </div>
                </div>
                
                {record.parts && record.parts.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Parts Used:</div>
                    <div className="flex flex-wrap gap-1">
                      {record.parts.map((part, idx) => (
                        <span 
                          key={idx}
                          className="inline-block px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs"
                        >
                          {part.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Voice Note Player */}
            {record.voice_note_url && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Voice Note</div>
                <audio controls className="w-full">
                  <source src={record.voice_note_url} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {/* Related Documents */}
            {record.documents && record.documents.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-300 mb-2">Related Documents</div>
                <div className="space-y-2">
                  {record.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="flex-1 truncate text-sm text-gray-300">{doc.name}</div>
                      <Download className="h-4 w-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Location Information */}
            {record.location && (
              <div className="mt-4 p-2 bg-gray-800/30 rounded-lg text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {record.location.address || `${record.location.latitude.toFixed(6)}, ${record.location.longitude.toFixed(6)}`}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render tire information
  const renderTires = () => {
    if (tires.length === 0) {
      return (
        <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-gray-400 mb-3">No tire information logged yet</p>
          <button
            onClick={() => setShowAddTireForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Tire Information
          </button>
        </div>
      );
    }
    
    // Group tires by status
    const activeTires = tires.filter(t => t.status === 'Active');
    const replacedTires = tires.filter(t => t.status === 'Replaced');
    
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Current Tires</h3>
          
          {activeTires.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTires.map((tire) => (
                <div key={tire.id} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="bg-blue-900/30 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-200">
                          {getPositionLabel(tire.position)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {tire.brand} {tire.model}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">{tire.size}</div>
                      <div className="text-xs text-gray-500">{tire.type}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Tread Depth</div>
                      <div className={`font-semibold ${
                        tire.tread_depth < 4 ? 'text-red-400' : 
                        tire.tread_depth < 6 ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {tire.tread_depth}/32"
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            tire.tread_depth < 4 ? 'bg-red-500' : 
                            tire.tread_depth < 6 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (tire.tread_depth / 12) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Pressure</div>
                      <div className={`font-semibold ${
                        tire.pressure < 28 || tire.pressure > 36 ? 'text-red-400' : 'text-gray-200'
                      }`}>
                        {tire.pressure} PSI
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1">
                        <div 
                          className={`h-full rounded-full ${
                            tire.pressure < 28 ? 'bg-red-500' : 
                            tire.pressure > 36 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (tire.pressure / 40) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 flex flex-wrap">
                    <div className="mr-3 mb-1">
                      <span className="font-medium">Installed:</span> {tire.date_installed}
                    </div>
                    {tire.mileage_installed && (
                      <div className="mr-3 mb-1">
                        <span className="font-medium">At:</span> {tire.mileage_installed.toLocaleString()} mi
                      </div>
                    )}
                    {tire.purchase_price && (
                      <div className="mr-3 mb-1">
                        <span className="font-medium">Cost:</span> ${tire.purchase_price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {tire.image_url && (
                    <div className="mt-3">
                      <img 
                        src={tire.image_url} 
                        alt={`${tire.brand} ${tire.model}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {tire.notes && (
                    <div className="mt-3 p-2 bg-gray-800/30 rounded-lg text-xs text-gray-400">
                      {tire.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800 text-center">
              <p className="text-gray-400">No active tires recorded</p>
            </div>
          )}
        </div>
        
        {replacedTires.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Tire History</h3>
            <div className="space-y-2">
              {replacedTires.map((tire) => (
                <div key={tire.id} className="bg-gray-900/40 p-3 rounded-lg border border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-300">
                        {getPositionLabel(tire.position)} - {tire.brand} {tire.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tire.size} • Installed: {tire.date_installed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
                        {tire.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowAddTireForm(true)}
            className="px-4 py-2 bg-blue-900/40 text-blue-400 rounded-md hover:bg-blue-900/60 border border-blue-800/50"
          >
            Add New Tire
          </button>
        </div>
      </div>
    );
  };
  
  // Helper function to get position label
  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'FL': return 'Front Left';
      case 'FR': return 'Front Right';
      case 'RL': return 'Rear Left';
      case 'RR': return 'Rear Right';
      case 'Spare': return 'Spare';
      default: return position;
    }
  };
  
  // Render document gallery
  const renderDocuments = () => {
    if (documents.length === 0) {
      return (
        <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 text-center">
          <FileText className="h-10 w-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 mb-3">No documents uploaded yet</p>
          <button
            onClick={() => setShowAddDocumentForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Upload Your First Document
          </button>
        </div>
      );
    }
    
    // Get document organization
    const docsByCategory = getDocumentsByCategory();
    const docsByDate = getDocumentsByDate();
    
    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Document Library</h3>
            <button
              onClick={() => setShowAddDocumentForm(true)}
              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
            >
              Upload Documents
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-300 mb-3">By Category</h4>
          <div className="space-y-4">
            {Object.entries(docsByCategory).map(([category, docs]) => (
              <div key={category} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-md font-medium text-white flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-blue-400" />
                    {category}
                  </h5>
                  <div className="text-sm text-gray-500">{docs.length} files</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {docs.slice(0, 4).map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {getFileIcon(doc.type)}
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-medium text-gray-300 truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(doc.size)} • {formatDate(doc.created_at)}
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-500" />
                    </a>
                  ))}
                </div>
                
                {docs.length > 4 && (
                  <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">
                    View all {docs.length} files...
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-300 mb-3">By Date</h4>
          <div className="space-y-4">
            {Object.entries(docsByDate).map(([year, months]) => (
              <div key={year} className="bg-gray-900/40 rounded-lg p-4 border border-gray-800">
                <h5 className="text-md font-medium text-white mb-3">{year}</h5>
                
                <div className="space-y-3">
                  {Object.entries(months).map(([month, docs]) => (
                    <div key={`${year}-${month}`} className="pl-4 border-l border-gray-800">
                      <div className="text-sm font-medium text-gray-300 mb-2">
                        {getMonthName(month)}
                      </div>
                      
                      <div className="space-y-1.5">
                        {docs.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            {getFileIcon(doc.type)}
                            <div className="ml-2 flex-1">
                              <div className="text-sm font-medium text-gray-300 truncate">{doc.name}</div>
                              <div className="text-xs text-gray-500">
                                {doc.category} • {formatFileSize(doc.size)}
                              </div>
                            </div>
                            <Download className="h-4 w-4 text-gray-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Helper functions for document display
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-blue-400" />;
    } else if (type.startsWith('application/pdf')) {
      return <FileText className="h-5 w-5 text-red-400" />;
    } else if (type.startsWith('video/')) {
      return <Video className="h-5 w-5 text-purple-400" />;
    } else if (type.startsWith('audio/')) {
      return <Mic className="h-5 w-5 text-green-400" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getMonthName = (month: string) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthIndex = parseInt(month) - 1;
    return monthNames[monthIndex];
  };
  
  // Main render method with vehicle data
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Garage Vault</h1>
          <p className="text-gray-400">
            The ultimate management system for your vehicles, modifications, and maintenance
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-6 text-red-300">
            <p>{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 underline text-sm mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {uploadProgress > 0 && (
          <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-lg z-50 w-64">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-gray-300">Uploading...</div>
              <div className="text-sm text-gray-400">{uploadProgress}%</div>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {loading && !activeVehicle ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Vehicle List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border border-blue-500/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-blue-400 font-medium text-lg">Garage Inventory</h3>
                  <button 
                    onClick={() => setShowAddVehicleForm(true)}
                    className="p-1.5 bg-blue-900/30 hover:bg-blue-900/60 rounded-full text-blue-400"
                    title="Add New Vehicle"
                  >
                    <PlusCircle className="h-5 w-5" />
                  </button>
                </div>
                
                {vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => {
                          setActiveVehicle(vehicle);
                          fetchVehicleData(vehicle.id);
                        }}
                        className={`w-full flex items-center p-2 rounded-lg transition-all ${
                          activeVehicle?.id === vehicle.id 
                            ? 'bg-blue-900/40 border border-blue-500/50' 
                            : 'bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800/50'
                        }`}
                      >
                        <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-gray-800 border border-gray-700 mr-3">
                          {vehicle.image_url ? (
                            <img 
                              src={vehicle.image_url} 
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-200 truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className={`${getStatusBadgeColor(vehicle.status)} w-2 h-2 rounded-full mr-1.5`}></span>
                            {vehicle.status}
                            {vehicle.trim && <span className="mx-1">·</span>}
                            {vehicle.trim}
                          </div>
                        </div>
                        
                        <ChevronRight className={`h-5 w-5 ${
                          activeVehicle?.id === vehicle.id ? 'text-blue-400' : 'text-gray-600'
                        }`} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/40 rounded-lg p-4 border border-gray-800 text-center">
                    <Car className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 mb-3">No vehicles in your garage yet</p>
                    <button
                      onClick={() => setShowAddVehicleForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Vehicle
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeVehicle ? (
                <div>
                  {/* Vehicle Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 border border-gray-800 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.trim}
                        </h2>
                        <div className="flex items-center mt-2">
                          <span className={`${getStatusBadgeColor(activeVehicle.status)} px-2 py-1 text-xs rounded-full text-white`}>
                            {activeVehicle.status}
                          </span>
                          {activeVehicle.vin && (
                            <span className="ml-3 text-gray-400 text-sm">
                              VIN: {activeVehicle.vin}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex space-x-3">
                        <div className="relative">
                          <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="px-3 py-2 bg-gray-900 text-gray-300 rounded-md hover:bg-gray-800 transition-colors text-sm border border-gray-800"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          
                          {showExportMenu && (
                            <div 
                              ref={exportMenuRef}
                              className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 z-10"
                            >
                              <div className="py-1">
                                <button 
                                  onClick={() => {/* Export functionality */}}
                                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 w-full text-left"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Data
                                </button>
                                <button 
                                  onClick={() => {/* Print functionality */}}
                                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 w-full text-left"
                                >
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Stats */}
                  {vehicleMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {/* Mileage Card */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
                        <div className="px-4 py-2 border-b border-gray-800 flex items-center">
                          <Gauge className="h-4 w-4 text-blue-400 mr-2" />
                          <div className="text-sm font-medium text-gray-300">Mileage</div>
                        </div>
                        
                        <div className="px-4 py-3">
                          <div className="text-2xl font-semibold text-white">
                            {vehicleMetrics.mileage.toLocaleString()} <span className="text-sm font-normal text-gray-500">mi</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Card */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
                        <div className="px-4 py-2 border-b border-gray-800 flex items-center">
                          <Activity className="h-4 w-4 text-blue-400 mr-2" />
                          <div className="text-sm font-medium text-gray-300">Status</div>
                        </div>
                        
                        <div className="px-4 py-3">
                          <div className="text-xl font-semibold text-white flex items-center">
                            <span className={`${
                              vehicleMetrics.carStatus === 'Ready' ? 'text-green-500' : 
                              vehicleMetrics.carStatus === 'Service Due' ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              {vehicleMetrics.carStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Maintenance Card */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
                        <div className="px-4 py-2 border-b border-gray-800 flex items-center">
                          <Wrench className="h-4 w-4 text-blue-400 mr-2" />
                          <div className="text-sm font-medium text-gray-300">Maintenance</div>
                        </div>
                        
                        <div className="px-4 py-3">
                          <div className="text-2xl font-semibold text-white">
                            {maintenanceRecords.length}
                            <span className="text-sm font-normal text-gray-500 ml-1">records</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Modifications Card */}
                      <div className="bg-gradient-to-br from-gray-900 to-gray-900/40 rounded-xl overflow-hidden border border-gray-800">
                        <div className="px-4 py-2 border-b border-gray-800 flex items-center">
                          <Zap className="h-4 w-4 text-blue-400 mr-2" />
                          <div className="text-sm font-medium text-gray-300">Modifications</div>
                        </div>
                        
                        <div className="px-4 py-3">
                          <div className="text-2xl font-semibold text-white">
                            {modifications.length}
                            <span className="text-sm font-normal text-gray-500 ml-1">installed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* OBD Panel */}
                  {renderOBDPanel()}
                  
                  {/* Tabs for sections */}
                  <div className="mt-6">
                    <div className="border-b border-gray-800">
                      <nav className="flex flex-wrap space-x-6">
                        <button 
                          onClick={() => setActiveTab('modifications')}
                          className={`py-3 ${
                            activeTab === 'modifications' 
                              ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Modifications
                        </button>
                        <button 
                          onClick={() => setActiveTab('maintenance')}
                          className={`py-3 ${
                            activeTab === 'maintenance' 
                              ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Maintenance
                        </button>
                        <button 
                          onClick={() => setActiveTab('tires')}
                          className={`py-3 ${
                            activeTab === 'tires' 
                              ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Tires
                        </button>
                        <button 
                          onClick={() => setActiveTab('documents')}
                          className={`py-3 ${
                            activeTab === 'documents' 
                              ? 'border-b-2 border-blue-500 text-blue-400 font-medium' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          Documents
                        </button>
                      </nav>
                    </div>
                    
                    <div className="mt-6">
                      {/* Tab Content */}
                      {activeTab === 'modifications' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Vehicle Modifications</h3>
                            <button 
                              onClick={() => setShowAddModificationForm(true)}
                              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                            >
                              Add Modification
                            </button>
                          </div>
                          
                          {renderModifications()}
                        </div>
                      )}
                      
                      {activeTab === 'maintenance' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Maintenance History</h3>
                            <button 
                              onClick={() => setShowAddMaintenanceForm(true)}
                              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                            >
                              Log Maintenance
                            </button>
                          </div>
                          
                          {renderMaintenance()}
                        </div>
                      )}
                      
                      {activeTab === 'tires' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Tire Management</h3>
                            <button 
                              onClick={() => setShowAddTireForm(true)}
                              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                            >
                              Add Tire Data
                            </button>
                          </div>
                          
                          {renderTires()}
                        </div>
                      )}
                      
                      {activeTab === 'documents' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Document Library</h3>
                            <button 
                              onClick={() => setShowAddDocumentForm(true)}
                              className="px-3 py-1.5 bg-blue-900/30 text-blue-400 rounded-md hover:bg-blue-900/50 transition-colors text-sm border border-blue-800/30"
                            >
                              Upload Documents
                            </button>
                          </div>
                          
                          {renderDocuments()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/40 rounded-xl p-8 border border-gray-800 text-center">
                  <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Welcome to Your Garage Vault</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    This is the command center for your automotive passion. Add your vehicles, track modifications, log maintenance, and keep all your documents organized in one place.
                  </p>
                  <button
                    onClick={() => setShowAddVehicleForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Various modals for adding data */}
      {/* These would be implemented as separate components in a larger application */}
      {/* Add Vehicle Form Modal */}
      {showAddVehicleForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add New Vehicle</h3>
              <button 
                onClick={() => setShowAddVehicleForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicleFormSubmit}>
              {/* Form fields for vehicle would go here */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Make*
                  </label>
                  <input
                    type="text"
                    name="make"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Model*
                  </label>
                  <input
                    type="text"
                    name="model"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                {/* Additional fields would go here */}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Modification Form Modal - Complex form with multi-media capabilities */}
      {showAddModificationForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
          <div className="bg-gray-900 rounded-xl p-6 max-w-xl w-full border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add Modification</h3>
              <button 
                onClick={() => setShowAddModificationForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddModificationFormSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Modification Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Type*
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Performance">Performance</option>
                    <option value="Aesthetic">Aesthetic</option>
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Engine">Engine</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Wheels/Tires">Wheels/Tires</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Audio/Electronics">Audio/Electronics</option>
                    <option value="Paint/Wrap">Paint/Wrap</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    name="cost"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status*
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Installed">Installed</option>
                    <option value="Removed">Removed</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Product Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="link_url"
                    placeholder="https://example.com/product"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  ></textarea>
                </div>
                
                <div className="col-span-2">
                  <p className="block text-sm font-medium text-gray-400 mb-2">
                    Media
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Main Image
                      </label>
                      <div className="border border-dashed border-gray-700 rounded-md p-3 text-center">
                        <input
                          type="file"
                          name="image_files"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          <FileImage className="h-6 w-6 mx-auto mb-1" />
                          Upload
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Before Photos
                      </label>
                      <div className="border border-dashed border-gray-700 rounded-md p-3 text-center">
                        <input
                          type="file"
                          name="before_photos"
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          <FileImage className="h-6 w-6 mx-auto mb-1" />
                          Before
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        After Photos
                      </label>
                      <div className="border border-dashed border-gray-700 rounded-md p-3 text-center">
                        <input
                          type="file"
                          name="after_photos"
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          <FileImage className="h-6 w-6 mx-auto mb-1" />
                          After
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Documents
                      </label>
                      <div className="border border-dashed border-gray-700 rounded-md p-3 text-center">
                        <input
                          type="file"
                          name="documents"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          <FileText className="h-6 w-6 mx-auto mb-1" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      type="button"
                      onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                        isRecordingVoice 
                          ? 'bg-red-800 text-red-200 animate-pulse' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Mic className="h-4 w-4 mr-1.5" />
                      {isRecordingVoice ? 'Recording...' : 'Record Voice Note'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={captureCurrentLocation}
                      className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                        isCapturingLocation 
                          ? 'bg-blue-800 text-blue-200 animate-pulse' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isCapturingLocation ? 'Getting Location...' : 'Add Location'}
                    </button>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="capture_location"
                      name="capture_location"
                      className="mr-2"
                    />
                    <label htmlFor="capture_location" className="text-sm text-gray-400">
                      Capture location when saving
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModificationForm(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Modification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Other Modals (Add Maintenance, Add Tires, etc.) would be implemented similarly */}
    </div>
  );
};

export default EnhancedGarageVault;