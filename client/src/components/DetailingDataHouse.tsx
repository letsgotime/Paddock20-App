import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Calendar, Clock, CheckSquare, UploadCloud, 
  Thermometer, Camera, Cloud, Sun, Wind, ThermometerSun, 
  ChevronDown, ChevronUp, Eye, BarChart2, Tag, Filter,
  Plus, X, Edit2, Trash2, Gauge, RefreshCw, Zap,
  Activity, Smile, Frown, DownloadCloud, Share2, Search
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';

interface DetailingSession {
  id: string;
  vehicle_id: string;
  date: string;
  type: 'wash' | 'wax' | 'polish' | 'ceramic' | 'interior' | 'full_detail' | 'maintenance_wash' | 'other';
  title: string;
  description?: string;
  
  // Environmental conditions
  outdoor_temp?: number;
  indoor_temp?: number;
  surface_temp?: number;
  humidity?: number;
  weather_condition?: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy' | 'indoor';
  uv_index?: number;
  
  // Products used
  products_used?: {
    id: string;
    name: string;
    category: string;
    amount_used?: string;
    notes?: string;
  }[];
  
  // Process details
  duration_minutes?: number;
  used_pressure_washer?: boolean;
  used_foam_cannon?: boolean;
  used_buckets?: number;
  water_used_gallons?: number;
  
  // Results tracking
  before_photos?: string[];
  after_photos?: string[];
  satisfaction_rating?: number; // 1-5
  gloss_meter_reading?: number;
  paint_thickness_readings?: {
    position: string;
    reading: number;
    unit: 'mil' | 'µm';
  }[];
  
  // Notes and documentation
  notes?: string;
  issues_found?: string[];
  follow_up_needed?: string;
  next_scheduled_date?: string;
  
  // Metadata
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

interface DetailingProduct {
  id: string;
  name: string;
  brand: string;
  category: 'wash' | 'wax' | 'sealant' | 'ceramic' | 'polish' | 'compound' | 'interior' | 'glass' | 'wheel' | 'tire' | 'other';
  size: string;
  size_unit: 'oz' | 'ml' | 'g' | 'lb';
  dilution_ratio?: string;
  application_method?: string;
  notes?: string;
  purchase_date?: string;
  expiration_date?: string;
  in_juicebox: boolean;
  favorite: boolean;
  image_url?: string;
}

interface DetailingDataHouseProps {
  vehicleId: string;
  isPaddock20Member?: boolean;
  juiceBoxIntegration?: boolean;
}

const DetailingDataHouse: React.FC<DetailingDataHouseProps> = ({
  vehicleId,
  isPaddock20Member = false,
  juiceBoxIntegration = true
}) => {
  const { vehicles, activeVehicle } = useVehicles();
  const [detailingSessions, setDetailingSessions] = useState<DetailingSession[]>([]);
  const [detailingProducts, setDetailingProducts] = useState<DetailingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'products' | 'analytics'>('sessions');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [viewingSession, setViewingSession] = useState<DetailingSession | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New session form state
  const [newSession, setNewSession] = useState<Partial<DetailingSession>>({
    vehicle_id: vehicleId,
    date: new Date().toISOString().split('T')[0],
    type: 'wash',
    title: 'Regular Wash',
    weather_condition: 'sunny',
    products_used: []
  });
  
  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<DetailingProduct>>({
    name: '',
    brand: '',
    category: 'wash',
    size: '',
    size_unit: 'oz',
    in_juicebox: false,
    favorite: false
  });
  
  // Live temp readings
  const [liveTemps, setLiveTemps] = useState({
    outdoor: null as number | null,
    indoor: null as number | null,
    surface: null as number | null
  });
  
  // Fetch detailing sessions and products on component mount
  useEffect(() => {
    const fetchDetailingData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be fetched from an API
        // For this example, we'll use demo data
        setDetailingSessions(getDemoSessions());
        setDetailingProducts(getDemoProducts());
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching detailing data:', err);
        setLoading(false);
      }
    };
    
    fetchDetailingData();
  }, [vehicleId]);
  
  // Get demo sessions
  const getDemoSessions = (): DetailingSession[] => {
    return [
      {
        id: '1',
        vehicle_id: vehicleId,
        date: '2023-12-15',
        type: 'wash',
        title: 'Weekly Maintenance Wash',
        description: 'Regular maintenance wash using two-bucket method',
        outdoor_temp: 68,
        surface_temp: 72,
        humidity: 45,
        weather_condition: 'sunny',
        uv_index: 6,
        products_used: [
          {
            id: '101',
            name: 'Gold Class Car Wash',
            category: 'wash',
            amount_used: '2 oz',
            notes: 'Diluted 1:128'
          },
          {
            id: '102',
            name: 'Ultimate Quik Wax',
            category: 'wax',
            amount_used: '1 spray per panel',
            notes: 'Used as drying aid'
          }
        ],
        duration_minutes: 45,
        used_buckets: 2,
        water_used_gallons: 10,
        before_photos: [
          'https://images.unsplash.com/photo-1605618325508-12bde5b426b4?q=80&w=1000&auto=format&fit=crop'
        ],
        after_photos: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop'
        ],
        satisfaction_rating: 4,
        notes: 'Car was moderately dirty. Water spots from previous rain cleaned up nicely.',
        tags: ['weekly', 'maintenance', 'winter'],
        created_at: '2023-12-15T15:30:00Z'
      },
      {
        id: '2',
        vehicle_id: vehicleId,
        date: '2023-12-02',
        type: 'full_detail',
        title: 'Full Detail Before Winter',
        description: 'Complete interior and exterior detail with ceramic coating application',
        indoor_temp: 72,
        surface_temp: 70,
        humidity: 35,
        weather_condition: 'indoor',
        products_used: [
          {
            id: '103',
            name: 'Iron-X',
            category: 'wash',
            amount_used: '4 oz',
            notes: 'Used for iron decontamination'
          },
          {
            id: '104',
            name: 'Clay Bar Medium',
            category: 'polish',
            notes: 'Full vehicle clay bar treatment'
          },
          {
            id: '105',
            name: 'Ceramic Coating Pro',
            category: 'ceramic',
            amount_used: '30ml',
            notes: '2 layers applied'
          }
        ],
        duration_minutes: 480,
        used_pressure_washer: true,
        used_foam_cannon: true,
        used_buckets: 4,
        water_used_gallons: 40,
        before_photos: [
          'https://images.unsplash.com/photo-1594148596893-3920be269f28?q=80&w=1000&auto=format&fit=crop'
        ],
        after_photos: [
          'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1000&auto=format&fit=crop'
        ],
        satisfaction_rating: 5,
        gloss_meter_reading: 92,
        paint_thickness_readings: [
          {
            position: 'Hood',
            reading: 125,
            unit: 'µm'
          },
          {
            position: 'Driver Door',
            reading: 132,
            unit: 'µm'
          }
        ],
        notes: 'Full paint correction, including wet sanding of deep scratches on hood. Applied ceramic coating with 2-year durability.',
        next_scheduled_date: '2024-03-02',
        tags: ['ceramic', 'paint-correction', 'winter-prep'],
        created_at: '2023-12-02T09:00:00Z'
      }
    ];
  };
  
  // Get demo products
  const getDemoProducts = (): DetailingProduct[] => {
    return [
      {
        id: '101',
        name: 'Gold Class Car Wash',
        brand: 'Meguiar\'s',
        category: 'wash',
        size: '64',
        size_unit: 'oz',
        dilution_ratio: '1:128',
        application_method: 'Foam cannon, bucket wash',
        notes: 'Good for regular maintenance washes',
        purchase_date: '2023-06-15',
        in_juicebox: true,
        favorite: true,
        image_url: 'https://m.media-amazon.com/images/I/71NR5oZPpBL.jpg'
      },
      {
        id: '102',
        name: 'Ultimate Quik Wax',
        brand: 'Meguiar\'s',
        category: 'wax',
        size: '26',
        size_unit: 'oz',
        application_method: 'Spray and wipe',
        notes: 'Great as a drying aid or quick top-up',
        purchase_date: '2023-07-22',
        in_juicebox: true,
        favorite: true,
        image_url: 'https://m.media-amazon.com/images/I/71R8Vz7MusL.jpg'
      },
      {
        id: '103',
        name: 'Iron-X',
        brand: 'CarPro',
        category: 'wash',
        size: '500',
        size_unit: 'ml',
        application_method: 'Spray directly on surface',
        notes: 'Use in well-ventilated area',
        purchase_date: '2023-05-10',
        expiration_date: '2025-05-10',
        in_juicebox: false,
        favorite: false,
        image_url: 'https://m.media-amazon.com/images/I/71fjDAbey0L.jpg'
      },
      {
        id: '105',
        name: 'Ceramic Coating Pro',
        brand: 'Gtechniq',
        category: 'ceramic',
        size: '50',
        size_unit: 'ml',
        application_method: 'Apply with applicator pad',
        notes: 'Professional grade ceramic coating',
        purchase_date: '2023-11-01',
        expiration_date: '2024-11-01',
        in_juicebox: true,
        favorite: true,
        image_url: 'https://m.media-amazon.com/images/I/61Mbu7HrfIL.jpg'
      }
    ];
  };
  
  // Calculate wash frequency
  const calculateWashFrequency = () => {
    if (detailingSessions.length < 2) return 'Not enough data';
    
    const washSessions = detailingSessions.filter(
      session => session.type === 'wash' || session.type === 'maintenance_wash' || session.type === 'full_detail'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (washSessions.length < 2) return 'Not enough data';
    
    const intervals: number[] = [];
    for (let i = 0; i < washSessions.length - 1; i++) {
      const current = new Date(washSessions[i].date);
      const next = new Date(washSessions[i + 1].date);
      const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);
    }
    
    const averageDays = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (averageDays < 1) return 'Less than daily';
    if (averageDays < 7) return `Every ${Math.round(averageDays)} days`;
    if (averageDays < 14) return 'Weekly';
    if (averageDays < 30) return 'Bi-weekly';
    if (averageDays < 60) return 'Monthly';
    return 'Less than monthly';
  };
  
  // Calculate days since last wash
  const calculateDaysSinceLastWash = () => {
    const washSessions = detailingSessions.filter(
      session => session.type === 'wash' || session.type === 'maintenance_wash' || session.type === 'full_detail'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (washSessions.length === 0) return 'No wash records';
    
    const lastWashDate = new Date(washSessions[0].date);
    const today = new Date();
    const diffDays = Math.round((today.getTime() - lastWashDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  };
  
  // Calculate next recommended wash date
  const calculateNextWashDate = () => {
    const washSessions = detailingSessions.filter(
      session => session.type === 'wash' || session.type === 'maintenance_wash' || session.type === 'full_detail'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (washSessions.length === 0) return 'No wash history';
    
    const lastWashDate = new Date(washSessions[0].date);
    
    // Get average interval
    if (washSessions.length < 2) {
      // If only one wash, assume weekly
      const nextDate = new Date(lastWashDate);
      nextDate.setDate(nextDate.getDate() + 7);
      return formatDate(nextDate.toISOString());
    }
    
    const intervals: number[] = [];
    for (let i = 0; i < washSessions.length - 1; i++) {
      const current = new Date(washSessions[i].date);
      const next = new Date(washSessions[i + 1].date);
      const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      intervals.push(diffDays);
    }
    
    const averageDays = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const nextDate = new Date(lastWashDate);
    nextDate.setDate(nextDate.getDate() + Math.round(averageDays));
    
    // If next date is in the past, suggest today
    if (nextDate < new Date()) {
      return 'Today';
    }
    
    return formatDate(nextDate.toISOString());
  };
  
  // Calculate product usage
  const calculateProductUsage = (productId: string) => {
    const sessionsUsingProduct = detailingSessions.filter(
      session => session.products_used?.some(p => p.id === productId)
    );
    
    return sessionsUsingProduct.length;
  };
  
  // Filter sessions
  const getFilteredSessions = () => {
    let filtered = [...detailingSessions];
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(session => session.type === filterType);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.description?.toLowerCase().includes(query) ||
        session.notes?.toLowerCase().includes(query) ||
        session.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'duration':
        filtered.sort((a, b) => (b.duration_minutes || 0) - (a.duration_minutes || 0));
        break;
      case 'satisfaction':
        filtered.sort((a, b) => (b.satisfaction_rating || 0) - (a.satisfaction_rating || 0));
        break;
    }
    
    return filtered;
  };
  
  // Handle input change for new session form
  const handleSessionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSession(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input change for new product form
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add a product to the new session
  const addProductToSession = (productId: string) => {
    const product = detailingProducts.find(p => p.id === productId);
    if (!product) return;
    
    const productToAdd = {
      id: product.id,
      name: product.name,
      category: product.category,
      notes: ''
    };
    
    setNewSession(prev => ({
      ...prev,
      products_used: [...(prev.products_used || []), productToAdd]
    }));
  };
  
  // Remove a product from the new session
  const removeProductFromSession = (productId: string) => {
    setNewSession(prev => ({
      ...prev,
      products_used: prev.products_used?.filter(p => p.id !== productId)
    }));
  };
  
  // Handle file upload for session photos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, these would be uploaded to a server
    // For this example, we'll create data URLs
    const photoUrls: string[] = [];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        photoUrls.push(reader.result as string);
        
        // Once all files are processed, update the state
        if (photoUrls.length === files.length) {
          if (type === 'before') {
            setNewSession(prev => ({
              ...prev,
              before_photos: [...(prev.before_photos || []), ...photoUrls]
            }));
          } else {
            setNewSession(prev => ({
              ...prev,
              after_photos: [...(prev.after_photos || []), ...photoUrls]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Save the new session
  const saveSession = () => {
    if (!newSession.title || !newSession.date || !newSession.type) {
      alert('Please fill in all required fields (title, date, type)');
      return;
    }
    
    const session: DetailingSession = {
      id: Date.now().toString(),
      vehicle_id: vehicleId,
      date: newSession.date || new Date().toISOString().split('T')[0],
      type: newSession.type as any,
      title: newSession.title,
      description: newSession.description,
      outdoor_temp: newSession.outdoor_temp || liveTemps.outdoor || undefined,
      indoor_temp: newSession.indoor_temp || liveTemps.indoor || undefined,
      surface_temp: newSession.surface_temp || liveTemps.surface || undefined,
      humidity: newSession.humidity,
      weather_condition: newSession.weather_condition as any,
      uv_index: newSession.uv_index,
      products_used: newSession.products_used,
      duration_minutes: newSession.duration_minutes,
      used_pressure_washer: newSession.used_pressure_washer,
      used_foam_cannon: newSession.used_foam_cannon,
      used_buckets: newSession.used_buckets,
      water_used_gallons: newSession.water_used_gallons,
      before_photos: newSession.before_photos,
      after_photos: newSession.after_photos,
      satisfaction_rating: newSession.satisfaction_rating,
      gloss_meter_reading: newSession.gloss_meter_reading,
      paint_thickness_readings: newSession.paint_thickness_readings,
      notes: newSession.notes,
      issues_found: newSession.issues_found,
      follow_up_needed: newSession.follow_up_needed,
      next_scheduled_date: newSession.next_scheduled_date,
      tags: newSession.tags,
      created_at: new Date().toISOString()
    };
    
    setDetailingSessions(prev => [session, ...prev]);
    
    // Reset form
    setNewSession({
      vehicle_id: vehicleId,
      date: new Date().toISOString().split('T')[0],
      type: 'wash',
      title: 'Regular Wash',
      weather_condition: 'sunny',
      products_used: []
    });
    
    setShowNewSessionForm(false);
  };
  
  // Save the new product
  const saveProduct = () => {
    if (!newProduct.name || !newProduct.brand || !newProduct.category) {
      alert('Please fill in all required fields (name, brand, category)');
      return;
    }
    
    const product: DetailingProduct = {
      id: Date.now().toString(),
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category as any,
      size: newProduct.size || '0',
      size_unit: newProduct.size_unit as any,
      dilution_ratio: newProduct.dilution_ratio,
      application_method: newProduct.application_method,
      notes: newProduct.notes,
      purchase_date: newProduct.purchase_date,
      expiration_date: newProduct.expiration_date,
      in_juicebox: newProduct.in_juicebox || false,
      favorite: newProduct.favorite || false,
      image_url: newProduct.image_url
    };
    
    setDetailingProducts(prev => [product, ...prev]);
    
    // Reset form
    setNewProduct({
      name: '',
      brand: '',
      category: 'wash',
      size: '',
      size_unit: 'oz',
      in_juicebox: false,
      favorite: false
    });
    
    setShowNewProductForm(false);
  };
  
  // Record a live temperature reading
  const recordTemperature = (type: 'outdoor' | 'indoor' | 'surface', value: number) => {
    setLiveTemps(prev => ({
      ...prev,
      [type]: value
    }));
    
    // Also update the new session form if it's open
    if (showNewSessionForm) {
      setNewSession(prev => ({
        ...prev,
        [`${type}_temp`]: value
      }));
    }
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time (for duration)
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };
  
  // Get weather icon
  const getWeatherIcon = (condition?: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-amber-400" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-400" />;
      case 'rainy':
        return <Droplets className="h-5 w-5 text-blue-400" />;
      case 'windy':
        return <Wind className="h-5 w-5 text-blue-400" />;
      case 'indoor':
        return <Thermometer className="h-5 w-5 text-amber-400" />;
      default:
        return <Sun className="h-5 w-5 text-amber-400" />;
    }
  };
  
  // Render satisfaction rating
  const renderSatisfactionRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full mx-0.5 ${
            i < rating ? 'bg-green-500' : 'bg-gray-700'
          }`}></div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`bg-gray-900/40 rounded-xl p-5 border ${
      isPaddock20Member 
        ? 'border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-900/80'
        : 'border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Droplets className={`h-6 w-6 mr-2 ${
            isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
          }`} />
          Detailing Data House
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === 'sessions' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Sessions
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === 'products' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Products
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Live Readings Section */}
      <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium text-white flex items-center">
            <Activity className="h-5 w-5 mr-1.5 text-blue-400" />
            Live Readings
          </h3>
          
          <button
            onClick={() => {
              // In a real app, this would connect to sensors or prompt for input
              // For this example, we'll generate random values
              recordTemperature('outdoor', Math.round(60 + Math.random() * 30));
              recordTemperature('indoor', Math.round(65 + Math.random() * 15));
              recordTemperature('surface', Math.round(70 + Math.random() * 40));
            }}
            className="text-xs px-2 py-1 bg-blue-600 text-white rounded flex items-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Update
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/70 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Outdoor Temp</div>
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-1.5 text-blue-400" />
              <span className="text-lg font-semibold text-white">
                {liveTemps.outdoor !== null ? `${liveTemps.outdoor}°F` : '--'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/70 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Indoor Temp</div>
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 mr-1.5 text-amber-400" />
              <span className="text-lg font-semibold text-white">
                {liveTemps.indoor !== null ? `${liveTemps.indoor}°F` : '--'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/70 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">Surface Temp</div>
            <div className="flex items-center">
              <ThermometerSun className="h-4 w-4 mr-1.5 text-red-400" />
              <span className="text-lg font-semibold text-white">
                {liveTemps.surface !== null ? `${liveTemps.surface}°F` : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
              >
                <option value="all">All Types</option>
                <option value="wash">Wash</option>
                <option value="wax">Wax</option>
                <option value="polish">Polish</option>
                <option value="ceramic">Ceramic</option>
                <option value="interior">Interior</option>
                <option value="full_detail">Full Detail</option>
                <option value="maintenance_wash">Maintenance Wash</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="duration">Duration</option>
                <option value="satisfaction">Satisfaction</option>
              </select>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-1.5 text-sm text-white w-full"
                />
                <Search className="h-4 w-4 text-gray-500 absolute left-2.5 top-2" />
              </div>
            </div>
            
            <button
              onClick={() => setShowNewSessionForm(true)}
              className={`px-3 py-1.5 ${
                isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md flex items-center`}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Record Detailing Session
            </button>
          </div>
          
          {/* Wash Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Last Wash</div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-1.5 text-blue-400" />
                  {calculateDaysSinceLastWash()}
                </div>
                <div className="text-xs text-gray-400">
                  {detailingSessions.length > 0 && 
                    formatDate(detailingSessions.sort((a, b) => 
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0].date)
                  }
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Wash Frequency</div>
              <div className="text-lg font-semibold text-white flex items-center">
                <Clock className="h-5 w-5 mr-1.5 text-blue-400" />
                {calculateWashFrequency()}
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Next Recommended Wash</div>
              <div className="text-lg font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-1.5 text-green-400" />
                {calculateNextWashDate()}
              </div>
            </div>
          </div>
          
          {/* Sessions List */}
          {getFilteredSessions().length > 0 ? (
            <div className="space-y-4">
              {getFilteredSessions().map(session => (
                <div 
                  key={session.id}
                  className="bg-gray-900/60 rounded-lg border border-gray-800 overflow-hidden"
                >
                  <div 
                    className="p-4 flex flex-col md:flex-row justify-between md:items-center cursor-pointer"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div>
                      <div className="flex items-center mb-2">
                        <div className={`px-2 py-0.5 text-xs rounded-full mr-2 ${
                          session.type === 'wash' ? 'bg-blue-900/30 text-blue-400' :
                          session.type === 'wax' ? 'bg-green-900/30 text-green-400' :
                          session.type === 'polish' ? 'bg-purple-900/30 text-purple-400' :
                          session.type === 'ceramic' ? 'bg-amber-900/30 text-amber-400' :
                          session.type === 'interior' ? 'bg-indigo-900/30 text-indigo-400' :
                          session.type === 'full_detail' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {session.type.replace('_', ' ')}
                        </div>
                        <h3 className="text-md font-medium text-white">{session.title}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <div className="text-gray-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(session.date)}
                        </div>
                        
                        {session.duration_minutes && (
                          <div className="text-gray-400 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDuration(session.duration_minutes)}
                          </div>
                        )}
                        
                        {session.weather_condition && (
                          <div className="text-gray-400 flex items-center">
                            {getWeatherIcon(session.weather_condition)}
                            <span className="ml-1 capitalize">{session.weather_condition}</span>
                          </div>
                        )}
                        
                        {session.products_used && (
                          <div className="text-gray-400 flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {session.products_used.length} products
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3 md:mt-0">
                      {session.satisfaction_rating && (
                        <div className="mr-4">
                          {renderSatisfactionRating(session.satisfaction_rating)}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingSession(session);
                          }}
                          className="p-1.5 bg-blue-900/30 rounded text-blue-400 hover:bg-blue-900/50 mr-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit would go here
                          }}
                          className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-gray-700 mr-1"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete would go here
                            if (confirm('Are you sure you want to delete this session?')) {
                              setDetailingSessions(prev => 
                                prev.filter(s => s.id !== session.id)
                              );
                            }
                          }}
                          className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSession(expandedSession === session.id ? null : session.id);
                          }}
                          className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-gray-700 ml-1"
                        >
                          {expandedSession === session.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSession === session.id && (
                    <div className="border-t border-gray-800 p-4">
                      {session.description && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
                          <p className="text-sm text-gray-400">{session.description}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Environmental Conditions */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Environmental Conditions</h4>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2">
                              {session.outdoor_temp !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Outdoor Temp</div>
                                  <div className="text-sm text-white">{session.outdoor_temp}°F</div>
                                </div>
                              )}
                              
                              {session.indoor_temp !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Indoor Temp</div>
                                  <div className="text-sm text-white">{session.indoor_temp}°F</div>
                                </div>
                              )}
                              
                              {session.surface_temp !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Surface Temp</div>
                                  <div className="text-sm text-white">{session.surface_temp}°F</div>
                                </div>
                              )}
                              
                              {session.humidity !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Humidity</div>
                                  <div className="text-sm text-white">{session.humidity}%</div>
                                </div>
                              )}
                              
                              {session.uv_index !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">UV Index</div>
                                  <div className="text-sm text-white">{session.uv_index}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Process Details */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Process Details</h4>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2">
                              {session.duration_minutes !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Duration</div>
                                  <div className="text-sm text-white">{formatDuration(session.duration_minutes)}</div>
                                </div>
                              )}
                              
                              {session.used_pressure_washer !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Pressure Washer</div>
                                  <div className="text-sm text-white">{session.used_pressure_washer ? 'Yes' : 'No'}</div>
                                </div>
                              )}
                              
                              {session.used_foam_cannon !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Foam Cannon</div>
                                  <div className="text-sm text-white">{session.used_foam_cannon ? 'Yes' : 'No'}</div>
                                </div>
                              )}
                              
                              {session.used_buckets !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Buckets Used</div>
                                  <div className="text-sm text-white">{session.used_buckets}</div>
                                </div>
                              )}
                              
                              {session.water_used_gallons !== undefined && (
                                <div>
                                  <div className="text-xs text-gray-500">Water Used</div>
                                  <div className="text-sm text-white">{session.water_used_gallons} gal</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Products Used */}
                      {session.products_used && session.products_used.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Products Used</h4>
                          <div className="space-y-2">
                            {session.products_used.map(product => (
                              <div 
                                key={product.id}
                                className={`p-2 rounded-lg flex items-center justify-between ${
                                  product.category === 'wash' ? 'bg-blue-900/20 border border-blue-900/30' :
                                  product.category === 'wax' ? 'bg-green-900/20 border border-green-900/30' :
                                  product.category === 'polish' ? 'bg-purple-900/20 border border-purple-900/30' :
                                  product.category === 'ceramic' ? 'bg-amber-900/20 border border-amber-900/30' :
                                  'bg-gray-800/70 border border-gray-700'
                                }`}
                              >
                                <div>
                                  <div className="text-sm text-white">{product.name}</div>
                                  {product.amount_used && (
                                    <div className="text-xs text-gray-400">Amount: {product.amount_used}</div>
                                  )}
                                  {product.notes && (
                                    <div className="text-xs text-gray-400">{product.notes}</div>
                                  )}
                                </div>
                                
                                <div className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-gray-300">
                                  {product.category}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Before & After Photos */}
                      {(session.before_photos?.length || session.after_photos?.length) && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Before & After</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {session.before_photos && session.before_photos.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Before</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {session.before_photos.map((photo, index) => (
                                    <div 
                                      key={index}
                                      className="aspect-video bg-gray-800 rounded overflow-hidden"
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`Before ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {session.after_photos && session.after_photos.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">After</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {session.after_photos.map((photo, index) => (
                                    <div 
                                      key={index}
                                      className="aspect-video bg-gray-800 rounded overflow-hidden"
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`After ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes and Results */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {session.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Notes</h4>
                            <div className="bg-gray-800/50 p-2 rounded-lg text-sm text-gray-300">
                              {session.notes}
                            </div>
                          </div>
                        )}
                        
                        {session.gloss_meter_reading && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Gloss Meter Reading</h4>
                            <div className="bg-gray-800/50 p-2 rounded-lg">
                              <div className="text-lg font-semibold text-white">{session.gloss_meter_reading}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {session.tags && session.tags.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {session.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/60 p-6 rounded-lg border border-gray-800 text-center">
              <Droplets className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Detailing Sessions Yet</h3>
              <p className="text-gray-400 mb-4">
                Record your first detailing session to start tracking your vehicle's care history.
              </p>
              <button
                onClick={() => setShowNewSessionForm(true)}
                className={`px-4 py-2 ${
                  isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md inline-flex items-center`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Record First Session
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Products Tab */}
      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-1.5 text-sm text-white w-full"
                />
                <Search className="h-4 w-4 text-gray-500 absolute left-2.5 top-2" />
              </div>
              
              <select
                className="ml-2 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white"
              >
                <option value="all">All Categories</option>
                <option value="wash">Wash</option>
                <option value="wax">Wax</option>
                <option value="polish">Polish</option>
                <option value="ceramic">Ceramic</option>
                <option value="interior">Interior</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowNewProductForm(true)}
              className={`px-3 py-1.5 ${
                isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md flex items-center`}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </button>
          </div>
          
          {/* JuiceBox Integration Banner */}
          {juiceBoxIntegration && (
            <div className={`p-3 rounded-lg mb-4 flex items-center ${
              isPaddock20Member 
                ? 'bg-amber-900/20 border border-amber-800/30'
                : 'bg-blue-900/20 border border-blue-800/30'
            }`}>
              <Zap className={`h-5 w-5 mr-2 ${
                isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
              }`} />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white">JuiceBox™ Integration Active</h4>
                <p className="text-xs text-gray-400">
                  Your detailing products are synced with your JuiceBox™. Changes here will reflect in your JuiceBox inventory.
                </p>
              </div>
              <button className="text-xs text-gray-400 hover:text-white">
                Configure
              </button>
            </div>
          )}
          
          {/* Products Grid */}
          {detailingProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {detailingProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-gray-900/60 rounded-lg border border-gray-800 overflow-hidden"
                >
                  <div className="aspect-square bg-gray-800 relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Droplets className="h-12 w-12 text-gray-700" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {product.in_juicebox && (
                        <div className="p-1 bg-amber-900/70 rounded-md" title="In JuiceBox">
                          <Zap className="h-4 w-4 text-amber-400" />
                        </div>
                      )}
                      
                      {product.favorite && (
                        <div className="p-1 bg-red-900/70 rounded-md" title="Favorite">
                          <Smile className="h-4 w-4 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-md font-medium text-white">{product.name}</h3>
                      <div className={`px-1.5 py-0.5 text-xs rounded-full ${
                        product.category === 'wash' ? 'bg-blue-900/30 text-blue-400' :
                        product.category === 'wax' ? 'bg-green-900/30 text-green-400' :
                        product.category === 'polish' ? 'bg-purple-900/30 text-purple-400' :
                        product.category === 'ceramic' ? 'bg-amber-900/30 text-amber-400' :
                        product.category === 'interior' ? 'bg-indigo-900/30 text-indigo-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {product.category}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-2">{product.brand}</div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <div>Size: {product.size} {product.size_unit}</div>
                      <div>Uses: {calculateProductUsage(product.id)}</div>
                    </div>
                    
                    <div className="flex justify-between mt-3">
                      <div className="flex">
                        <button
                          className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-gray-700 mr-1"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        <button
                          className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                          title="Delete"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              setDetailingProducts(prev => 
                                prev.filter(p => p.id !== product.id)
                              );
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {product.in_juicebox ? (
                        <button
                          className="text-xs px-2 py-1 bg-amber-900/30 text-amber-400 border border-amber-800/30 rounded"
                        >
                          In JuiceBox
                        </button>
                      ) : (
                        <button
                          className="text-xs px-2 py-1 bg-gray-800 text-gray-400 hover:bg-amber-900/30 hover:text-amber-400 rounded"
                          onClick={() => {
                            setDetailingProducts(prev => 
                              prev.map(p => p.id === product.id ? { ...p, in_juicebox: true } : p)
                            );
                          }}
                        >
                          Add to JuiceBox
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/60 p-6 rounded-lg border border-gray-800 text-center">
              <Droplets className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Detailing Products Yet</h3>
              <p className="text-gray-400 mb-4">
                Add your first detailing product to start building your inventory.
              </p>
              <button
                onClick={() => setShowNewProductForm(true)}
                className={`px-4 py-2 ${
                  isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md inline-flex items-center`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Product
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wash Frequency Chart */}
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <h3 className="text-md font-medium text-white mb-3">Detailing Frequency</h3>
              
              <div className="aspect-video bg-gray-800/70 rounded-lg p-4 flex items-center justify-center">
                <div className="text-gray-400 flex flex-col items-center">
                  <BarChart2 className="h-10 w-10 mb-2 text-gray-500" />
                  <span>Analytics charts would display here</span>
                  <span className="text-xs mt-1">Showing wash frequency over time</span>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-gray-800/70 p-2 rounded">
                  <div className="text-xs text-gray-500 mb-1">Average Frequency</div>
                  <div className="text-sm text-white">{calculateWashFrequency()}</div>
                </div>
                
                <div className="bg-gray-800/70 p-2 rounded">
                  <div className="text-xs text-gray-500 mb-1">Annual Washes</div>
                  <div className="text-sm text-white">
                    {detailingSessions.filter(s => 
                      (s.type === 'wash' || s.type === 'maintenance_wash' || s.type === 'full_detail') && 
                      new Date(s.date).getFullYear() === new Date().getFullYear()
                    ).length}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Usage Chart */}
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <h3 className="text-md font-medium text-white mb-3">Product Usage</h3>
              
              <div className="aspect-video bg-gray-800/70 rounded-lg p-4 flex items-center justify-center">
                <div className="text-gray-400 flex flex-col items-center">
                  <BarChart2 className="h-10 w-10 mb-2 text-gray-500" />
                  <span>Analytics charts would display here</span>
                  <span className="text-xs mt-1">Showing product usage frequency</span>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Most Used Products</h4>
                
                {detailingProducts.length > 0 ? (
                  <div className="space-y-2">
                    {detailingProducts
                      .map(product => ({
                        ...product,
                        usage: calculateProductUsage(product.id)
                      }))
                      .sort((a, b) => b.usage - a.usage)
                      .slice(0, 3)
                      .map(product => (
                        <div 
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-gray-800/70 rounded"
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-full mr-2 ${
                              product.category === 'wash' ? 'bg-blue-500' :
                              product.category === 'wax' ? 'bg-green-500' :
                              product.category === 'polish' ? 'bg-purple-500' :
                              product.category === 'ceramic' ? 'bg-amber-500' :
                              'bg-gray-500'
                            }`}></div>
                            <div>
                              <div className="text-sm text-white">{product.name}</div>
                              <div className="text-xs text-gray-400">{product.brand}</div>
                            </div>
                          </div>
                          <div className="text-sm text-white">{product.usage} uses</div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 text-center py-2">
                    No product usage data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Detailing Stats */}
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <h3 className="text-md font-medium text-white mb-3">Detailing Stats</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Total Sessions</div>
                  <div className="text-xl font-semibold text-white">{detailingSessions.length}</div>
                </div>
                
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Total Time</div>
                  <div className="text-xl font-semibold text-white">
                    {formatDuration(detailingSessions.reduce((total, session) => total + (session.duration_minutes || 0), 0))}
                  </div>
                </div>
                
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Avg. Satisfaction</div>
                  <div className="text-xl font-semibold text-white">
                    {detailingSessions.some(s => s.satisfaction_rating !== undefined) 
                      ? (detailingSessions.reduce((total, session) => total + (session.satisfaction_rating || 0), 0) / 
                         detailingSessions.filter(s => s.satisfaction_rating !== undefined).length).toFixed(1)
                      : 'N/A'
                    }
                  </div>
                </div>
                
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Products Used</div>
                  <div className="text-xl font-semibold text-white">{detailingProducts.length}</div>
                </div>
                
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Water Used (Est.)</div>
                  <div className="text-xl font-semibold text-white">
                    {detailingSessions.reduce((total, session) => total + (session.water_used_gallons || 0), 0)} gal
                  </div>
                </div>
                
                <div className="bg-gray-800/70 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">Days Since Last</div>
                  <div className="text-xl font-semibold text-white">{calculateDaysSinceLastWash()}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Session Types</h4>
                
                <div className="space-y-2">
                  {['wash', 'wax', 'polish', 'ceramic', 'full_detail', 'interior', 'maintenance_wash'].map(type => {
                    const count = detailingSessions.filter(s => s.type === type).length;
                    const percentage = detailingSessions.length > 0 
                      ? Math.round((count / detailingSessions.length) * 100) 
                      : 0;
                    
                    return count > 0 ? (
                      <div key={type} className="bg-gray-800/50 rounded-lg overflow-hidden">
                        <div className="flex justify-between px-3 py-1 text-xs text-gray-300">
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1.5">
                          <div 
                            className={
                              type === 'wash' ? 'bg-blue-500' :
                              type === 'wax' ? 'bg-green-500' :
                              type === 'polish' ? 'bg-purple-500' :
                              type === 'ceramic' ? 'bg-amber-500' :
                              type === 'full_detail' ? 'bg-red-500' :
                              type === 'interior' ? 'bg-indigo-500' :
                              'bg-gray-500'
                            }
                            style={{ width: `${percentage}%` }}
                            className="h-full"
                          ></div>
                        </div>
                      </div>
                    ) : null;
                  }).filter(Boolean)}
                </div>
              </div>
            </div>
            
            {/* Export and Reports */}
            <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <h3 className="text-md font-medium text-white mb-3">Reports & Export</h3>
              
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center">
                  <DownloadCloud className="h-5 w-5 text-blue-400 mr-2" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">Export Detailing History</div>
                    <div className="text-xs text-gray-400">Download full history as CSV/PDF</div>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center">
                  <BarChart2 className="h-5 w-5 text-blue-400 mr-2" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">Detailing Analytics Report</div>
                    <div className="text-xs text-gray-400">Generate comprehensive analytics</div>
                  </div>
                </button>
                
                {isPaddock20Member && (
                  <button className="w-full p-3 bg-amber-900/20 border border-amber-800/30 rounded-lg hover:bg-amber-900/30 flex items-center">
                    <Share2 className="h-5 w-5 text-amber-400 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">Share with Paddock20 Community</div>
                      <div className="text-xs text-gray-400">Share your detailing methods with the community</div>
                    </div>
                  </button>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Integration</h4>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-amber-400 mr-2" />
                      <span className="text-sm text-white">JuiceBox™ Integration</span>
                    </div>
                    <div className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full">Active</div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Your detailing data is synced with JuiceBox™, providing enhanced product recommendations and usage tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* New Session Form Modal */}
      {showNewSessionForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h3 className="text-xl font-semibold text-white">Record Detailing Session</h3>
              <button 
                onClick={() => setShowNewSessionForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  {/* Basic Information */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Session Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newSession.title || ''}
                      onChange={handleSessionInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Weekly Maintenance Wash"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={newSession.date || ''}
                      onChange={handleSessionInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Session Type
                    </label>
                    <select
                      name="type"
                      value={newSession.type || 'wash'}
                      onChange={handleSessionInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="wash">Wash</option>
                      <option value="wax">Wax</option>
                      <option value="polish">Polish</option>
                      <option value="ceramic">Ceramic Coating</option>
                      <option value="interior">Interior Detailing</option>
                      <option value="full_detail">Full Detail</option>
                      <option value="maintenance_wash">Maintenance Wash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={newSession.description || ''}
                      onChange={handleSessionInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe what you did in this detailing session..."
                    ></textarea>
                  </div>
                  
                  {/* Process Details */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-white mb-2">Process Details</h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          name="duration_minutes"
                          value={newSession.duration_minutes || ''}
                          onChange={handleSessionInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="60"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Water Used (gallons)
                        </label>
                        <input
                          type="number"
                          name="water_used_gallons"
                          value={newSession.water_used_gallons || ''}
                          onChange={handleSessionInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="used_pressure_washer"
                          checked={newSession.used_pressure_washer || false}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            used_pressure_washer: e.target.checked
                          }))}
                          className="rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-gray-800"
                        />
                        <span className="ml-2 text-sm text-gray-300">Used Pressure Washer</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="used_foam_cannon"
                          checked={newSession.used_foam_cannon || false}
                          onChange={(e) => setNewSession(prev => ({
                            ...prev,
                            used_foam_cannon: e.target.checked
                          }))}
                          className="rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-gray-800"
                        />
                        <span className="ml-2 text-sm text-gray-300">Used Foam Cannon</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* Environmental Conditions */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-white mb-2">Environmental Conditions</h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Outdoor Temp (°F)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            name="outdoor_temp"
                            value={newSession.outdoor_temp || liveTemps.outdoor || ''}
                            onChange={handleSessionInputChange}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="68"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (liveTemps.outdoor !== null) {
                                setNewSession(prev => ({
                                  ...prev,
                                  outdoor_temp: liveTemps.outdoor
                                }));
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg"
                            disabled={liveTemps.outdoor === null}
                            title="Use live reading"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Indoor Temp (°F)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            name="indoor_temp"
                            value={newSession.indoor_temp || liveTemps.indoor || ''}
                            onChange={handleSessionInputChange}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="72"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (liveTemps.indoor !== null) {
                                setNewSession(prev => ({
                                  ...prev,
                                  indoor_temp: liveTemps.indoor
                                }));
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg"
                            disabled={liveTemps.indoor === null}
                            title="Use live reading"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Surface Temp (°F)
                        </label>
                        <div className="flex">
                          <input
                            type="number"
                            name="surface_temp"
                            value={newSession.surface_temp || liveTemps.surface || ''}
                            onChange={handleSessionInputChange}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="70"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (liveTemps.surface !== null) {
                                setNewSession(prev => ({
                                  ...prev,
                                  surface_temp: liveTemps.surface
                                }));
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg"
                            disabled={liveTemps.surface === null}
                            title="Use live reading"
                          >
                            <Zap className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Humidity (%)
                        </label>
                        <input
                          type="number"
                          name="humidity"
                          value={newSession.humidity || ''}
                          onChange={handleSessionInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="45"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Weather Condition
                      </label>
                      <select
                        name="weather_condition"
                        value={newSession.weather_condition || 'sunny'}
                        onChange={handleSessionInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="sunny">Sunny</option>
                        <option value="cloudy">Cloudy</option>
                        <option value="rainy">Rainy</option>
                        <option value="snowy">Snowy</option>
                        <option value="windy">Windy</option>
                        <option value="indoor">Indoor (Garage/Shop)</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Products Used */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-white mb-2">Products Used</h4>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Select Products
                      </label>
                      <select
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.value) {
                            addProductToSession(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">-- Select Products --</option>
                        {detailingProducts
                          .filter(product => 
                            !newSession.products_used?.some(p => p.id === product.id)
                          )
                          .map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} ({product.brand})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    {newSession.products_used && newSession.products_used.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {newSession.products_used.map(product => (
                          <div 
                            key={product.id}
                            className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                          >
                            <div>
                              <div className="text-sm text-white">{product.name}</div>
                              <div className="text-xs text-gray-400">{product.category}</div>
                            </div>
                            
                            <button
                              onClick={() => removeProductFromSession(product.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-3">
                        No products selected yet
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setShowNewProductForm(true)}
                      className="text-sm text-blue-400 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Product
                    </button>
                  </div>
                  
                  {/* Satisfaction Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Satisfaction Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewSession(prev => ({
                            ...prev,
                            satisfaction_rating: rating
                          }))}
                          className={`w-8 h-8 rounded-full ${
                            (newSession.satisfaction_rating || 0) >= rating
                              ? 'bg-green-500'
                              : 'bg-gray-700'
                          }`}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Photos Section */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-white mb-3">Before & After Photos</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Before Photos
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                      {newSession.before_photos && newSession.before_photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {newSession.before_photos.map((photo, index) => (
                            <div key={index} className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                              <img 
                                src={photo} 
                                alt={`Before ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                className="absolute top-1 right-1 p-1 bg-red-600 rounded-full"
                                onClick={() => setNewSession(prev => ({
                                  ...prev,
                                  before_photos: prev.before_photos?.filter((_, i) => i !== index)
                                }))}
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))}
                          <div 
                            className="aspect-video bg-gray-800 rounded flex items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="h-8 w-8 text-gray-600" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Camera className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 mb-3">
                            Upload photos of your vehicle before detailing
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            ref={fileInputRef}
                            onChange={(e) => handlePhotoUpload(e, 'before')}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Photos
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      After Photos
                    </label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                      {newSession.after_photos && newSession.after_photos.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {newSession.after_photos.map((photo, index) => (
                            <div key={index} className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                              <img 
                                src={photo} 
                                alt={`After ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                className="absolute top-1 right-1 p-1 bg-red-600 rounded-full"
                                onClick={() => setNewSession(prev => ({
                                  ...prev,
                                  after_photos: prev.after_photos?.filter((_, i) => i !== index)
                                }))}
                              >
                                <X className="h-3 w-3 text-white" />
                              </button>
                            </div>
                          ))}
                          <div 
                            className="aspect-video bg-gray-800 rounded flex items-center justify-center cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className="h-8 w-8 text-gray-600" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Camera className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 mb-3">
                            Upload photos of your vehicle after detailing
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoUpload(e, 'after')}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Select Photos
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={newSession.notes || ''}
                  onChange={handleSessionInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional notes, observations, or lessons learned..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewSessionForm(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={saveSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* New Product Form Modal */}
      {showNewProductForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h3 className="text-xl font-semibold text-white">Add Detailing Product</h3>
              <button 
                onClick={() => setShowNewProductForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name || ''}
                    onChange={handleProductInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Gold Class Car Wash"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={newProduct.brand || ''}
                    onChange={handleProductInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Meguiar's"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newProduct.category || 'wash'}
                    onChange={handleProductInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wash">Wash</option>
                    <option value="wax">Wax</option>
                    <option value="sealant">Sealant</option>
                    <option value="ceramic">Ceramic Coating</option>
                    <option value="polish">Polish</option>
                    <option value="compound">Compound</option>
                    <option value="interior">Interior</option>
                    <option value="glass">Glass</option>
                    <option value="wheel">Wheel</option>
                    <option value="tire">Tire</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Size
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={newProduct.size || ''}
                      onChange={handleProductInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 16"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Unit
                    </label>
                    <select
                      name="size_unit"
                      value={newProduct.size_unit || 'oz'}
                      onChange={handleProductInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="oz">Ounces (oz)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Application Method (Optional)
                  </label>
                  <input
                    type="text"
                    name="application_method"
                    value={newProduct.application_method || ''}
                    onChange={handleProductInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Apply with microfiber pad"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={newProduct.notes || ''}
                    onChange={handleProductInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any notes about this product..."
                  ></textarea>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Purchase Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={newProduct.purchase_date || ''}
                      onChange={handleProductInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="expiration_date"
                      value={newProduct.expiration_date || ''}
                      onChange={handleProductInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="in_juicebox"
                      checked={newProduct.in_juicebox || false}
                      onChange={handleProductInputChange}
                      className="rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-300">Add to JuiceBox™</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="favorite"
                      checked={newProduct.favorite || false}
                      onChange={handleProductInputChange}
                      className="rounded border-gray-700 text-blue-500 focus:ring-blue-500 bg-gray-800"
                    />
                    <span className="ml-2 text-sm text-gray-300">Mark as Favorite</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewProductForm(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={saveProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Session Details Modal */}
      {viewingSession && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h3 className="text-xl font-semibold text-white">{viewingSession.title}</h3>
              <button 
                onClick={() => setViewingSession(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-5">
              {/* Detailed view of session would go here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Date</div>
                  <div className="text-lg font-medium text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-1.5 text-blue-400" />
                    {formatDate(viewingSession.date)}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Type</div>
                  <div className="text-lg font-medium text-white flex items-center">
                    <div className={`p-1 rounded mr-1.5 ${
                      viewingSession.type === 'wash' ? 'bg-blue-900/30 text-blue-400' :
                      viewingSession.type === 'wax' ? 'bg-green-900/30 text-green-400' :
                      viewingSession.type === 'polish' ? 'bg-purple-900/30 text-purple-400' :
                      viewingSession.type === 'ceramic' ? 'bg-amber-900/30 text-amber-400' :
                      viewingSession.type === 'interior' ? 'bg-indigo-900/30 text-indigo-400' :
                      viewingSession.type === 'full_detail' ? 'bg-red-900/30 text-red-400' :
                      'bg-gray-900/30 text-gray-400'
                    }`}>
                      <Droplets className="h-5 w-5" />
                    </div>
                    <span className="capitalize">
                      {viewingSession.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                {viewingSession.duration_minutes && (
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="text-lg font-medium text-white flex items-center">
                      <Clock className="h-5 w-5 mr-1.5 text-blue-400" />
                      {formatDuration(viewingSession.duration_minutes)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Session details would be shown here in a more detailed format */}
              <div className="space-y-4">
                {/* Before & After Section */}
                {(viewingSession.before_photos?.length || viewingSession.after_photos?.length) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-3">Before & After</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {viewingSession.before_photos && viewingSession.before_photos.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-300 mb-2">Before</div>
                          <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video">
                            <img 
                              src={viewingSession.before_photos[0]} 
                              alt="Before"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {viewingSession.before_photos.length > 1 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
                              {viewingSession.before_photos.slice(1).map((photo, index) => (
                                <div 
                                  key={index}
                                  className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden"
                                >
                                  <img 
                                    src={photo} 
                                    alt={`Before ${index + 2}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {viewingSession.after_photos && viewingSession.after_photos.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-300 mb-2">After</div>
                          <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video">
                            <img 
                              src={viewingSession.after_photos[0]} 
                              alt="After"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {viewingSession.after_photos.length > 1 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
                              {viewingSession.after_photos.slice(1).map((photo, index) => (
                                <div 
                                  key={index}
                                  className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden"
                                >
                                  <img 
                                    src={photo} 
                                    alt={`After ${index + 2}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Environmental Conditions */}
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-white mb-3">Environmental Conditions</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {viewingSession.weather_condition && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Weather</div>
                        <div className="text-md text-white flex items-center">
                          {getWeatherIcon(viewingSession.weather_condition)}
                          <span className="ml-1.5 capitalize">{viewingSession.weather_condition}</span>
                        </div>
                      </div>
                    )}
                    
                    {viewingSession.outdoor_temp !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Outdoor Temp</div>
                        <div className="text-md text-white flex items-center">
                          <Thermometer className="h-4 w-4 mr-1 text-blue-400" />
                          {viewingSession.outdoor_temp}°F
                        </div>
                      </div>
                    )}
                    
                    {viewingSession.surface_temp !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Surface Temp</div>
                        <div className="text-md text-white flex items-center">
                          <ThermometerSun className="h-4 w-4 mr-1 text-red-400" />
                          {viewingSession.surface_temp}°F
                        </div>
                      </div>
                    )}
                    
                    {viewingSession.humidity !== undefined && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Humidity</div>
                        <div className="text-md text-white flex items-center">
                          <Droplets className="h-4 w-4 mr-1 text-blue-400" />
                          {viewingSession.humidity}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Products Used */}
                {viewingSession.products_used && viewingSession.products_used.length > 0 && (
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-white mb-3">Products Used</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {viewingSession.products_used.map(product => (
                        <div 
                          key={product.id}
                          className={`p-3 rounded-lg ${
                            product.category === 'wash' ? 'bg-blue-900/20 border border-blue-900/30' :
                            product.category === 'wax' ? 'bg-green-900/20 border border-green-900/30' :
                            product.category === 'polish' ? 'bg-purple-900/20 border border-purple-900/30' :
                            product.category === 'ceramic' ? 'bg-amber-900/20 border border-amber-900/30' :
                            'bg-gray-800/70 border border-gray-700'
                          }`}
                        >
                          <div className="text-sm font-medium text-white mb-1">{product.name}</div>
                          {product.amount_used && (
                            <div className="text-xs text-gray-400">Amount: {product.amount_used}</div>
                          )}
                          {product.notes && (
                            <div className="text-xs text-gray-400">{product.notes}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Notes */}
                {viewingSession.notes && (
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-white mb-2">Notes</h4>
                    <p className="text-gray-300">{viewingSession.notes}</p>
                  </div>
                )}
                
                {/* Tags */}
                {viewingSession.tags && viewingSession.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {viewingSession.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingSession(null)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailingDataHouse;