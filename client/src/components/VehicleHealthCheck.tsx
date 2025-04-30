import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Gauge, Thermometer, Droplets, Calendar, Clock, 
  Car, Battery, RotateCcw, Wrench, Camera, 
  AlertTriangle, CheckCircle, XCircle, Bluetooth, 
  ThermometerSun, Fan, Smartphone, CloudSun, Waves, Fingerprint, Badge
} from 'lucide-react';
// Import mock Supabase client
import supabase from '../services/supabaseClient';

interface HealthCheckProps {
  vehicleId: string;
  isPaddock20Member?: boolean;
  lastHealthCheck?: {
    date: string;
    mileage: number;
    items: {
      name: string;
      status: 'good' | 'warning' | 'critical' | 'unknown';
      value?: string | number;
      notes?: string;
    }[];
  };
  hasOBD2?: boolean;
}

interface DetailingConditions {
  insideTemp?: number;
  outsideTemp?: number;
  surfaceTemp?: number;
  humidity?: number;
  uvIndex?: number;
  isIdealForWashing?: boolean;
  isIdealForWaxing?: boolean;
  isIdealForCoating?: boolean;
  detailingNotes?: string;
  recommendations?: string[];
}

interface HealthCheckItem {
  id: string;
  name: string;
  status: 'good' | 'warning' | 'critical' | 'unknown';
  category: 'fluids' | 'electrical' | 'mechanical' | 'tires' | 'brakes' | 'exterior' | 'interior' | 'other';
  value?: string | number;
  unit?: string;
  threshold?: {
    good: number;
    warning: number;
    critical: number;
  };
  notes?: string;
  lastChecked?: string;
  nextCheckDue?: string;
  checkMethod: 'visual' | 'manual' | 'obd2' | 'sound' | 'feel';
  images?: string[];
  videos?: string[];
  voice_notes?: string[];
  recommended_action?: string;
  performed_action?: string;
  needsAttention: boolean;
}

const VehicleHealthCheck: React.FC<HealthCheckProps> = ({ 
  vehicleId, 
  isPaddock20Member = false, 
  lastHealthCheck, 
  hasOBD2 = false 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkItems, setCheckItems] = useState<HealthCheckItem[]>([]);
  const [lastCheck, setLastCheck] = useState(lastHealthCheck);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [detailingConditions, setDetailingConditions] = useState<DetailingConditions>({});
  const [infraredReading, setInfraredReading] = useState<number | null>(null);
  const [showMemberBadge, setShowMemberBadge] = useState(isPaddock20Member);
  const [checkDate, setCheckDate] = useState(new Date());
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Fetch the vehicle's health check data on component mount
  useEffect(() => {
    const fetchHealthCheckData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the latest health check data from Supabase
        const { data, error } = await supabase
          .from('vehicle_health_checks')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Parse the items from JSON if needed
          const items = typeof data[0].items === 'string' 
            ? JSON.parse(data[0].items) 
            : data[0].items;
          
          setLastCheck({
            date: data[0].created_at,
            mileage: data[0].mileage,
            items
          });
          
          // Initialize check items based on previous check
          const initialItems: HealthCheckItem[] = items.map((item: any) => ({
            ...item,
            status: 'unknown' // Reset status for new check
          }));
          
          setCheckItems(initialItems);
        } else {
          // If no previous check, initialize with default check items
          setCheckItems(getDefaultCheckItems());
        }
        
        // Fetch real-time weather data for detailing conditions
        fetchWeatherData();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching health check data:', err);
        setIsLoading(false);
        setAlertMessage({
          type: 'error',
          message: 'Failed to load health check data'
        });
      }
    };
    
    fetchHealthCheckData();
  }, [vehicleId]);
  
  // Fetch weather data for detailing conditions
  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather');
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      // Calculate detailing conditions based on weather
      calculateDetailingConditions(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
    }
  };
  
  // Calculate conditions for detailing based on weather
  const calculateDetailingConditions = (weatherData: any) => {
    if (!weatherData) return;
    
    const outsideTemp = weatherData.current.temp_c;
    const humidity = weatherData.current.humidity;
    const uvIndex = weatherData.current.uv;
    const isRaining = weatherData.current.precip_mm > 0;
    const windSpeed = weatherData.current.wind_kph;
    
    // Estimate surface temp based on outside temp and sun exposure
    // This is a simple model and would be better with actual readings
    const sunExposure = weatherData.current.cloud < 50 ? 'high' : 'low';
    const surfaceTempOffset = sunExposure === 'high' ? 10 : 3;
    const estimatedSurfaceTemp = outsideTemp + surfaceTempOffset;
    
    // Washing conditions: avoid freezing temps, heavy rain, high wind
    const isIdealForWashing = outsideTemp > 5 && !isRaining && windSpeed < 30;
    
    // Waxing conditions: moderate temp, low humidity, no direct sun, no rain
    const isIdealForWaxing = 
      outsideTemp > 10 && 
      outsideTemp < 30 && 
      humidity < 80 && 
      sunExposure === 'low' && 
      !isRaining;
    
    // Coating conditions: controlled environment, specific temp range
    const isIdealForCoating = 
      outsideTemp > 15 && 
      outsideTemp < 25 && 
      humidity < 60 && 
      sunExposure === 'low' && 
      !isRaining;
    
    // Generate recommendations based on conditions
    const recommendations: string[] = [];
    
    if (outsideTemp < 5) {
      recommendations.push('Temperature too low for most detailing work');
    }
    
    if (outsideTemp > 30) {
      recommendations.push('Work in shade or early morning/evening due to high temperature');
    }
    
    if (humidity > 80) {
      recommendations.push('High humidity may affect drying times and product performance');
    }
    
    if (uvIndex > 7) {
      recommendations.push('High UV index: products may dry too quickly');
    }
    
    if (isRaining) {
      recommendations.push('Rain detected: delay detailing work if possible');
    }
    
    if (windSpeed > 20) {
      recommendations.push('Windy conditions may introduce dust/debris during detailing');
    }
    
    setDetailingConditions({
      outsideTemp,
      surfaceTemp: estimatedSurfaceTemp,
      // Estimate inside temp (adjust as needed)
      insideTemp: outsideTemp - 3,
      humidity,
      uvIndex,
      isIdealForWashing,
      isIdealForWaxing,
      isIdealForCoating,
      recommendations
    });
  };
  
  // Start the health check process
  const startHealthCheck = async () => {
    setIsChecking(true);
    setAlertMessage({
      type: 'info',
      message: hasOBD2 
        ? 'Connecting to OBD2 for vehicle diagnostics...' 
        : 'Starting manual vehicle health check'
    });
    
    if (hasOBD2) {
      // If OBD2 is available, try to connect
      await connectToOBD2();
    } else {
      // If no OBD2, just prepare the form for manual checks
      setAlertMessage({
        type: 'info',
        message: 'Please complete the health check items below'
      });
    }
  };
  
  // Connect to OBD2 for automatic checks
  const connectToOBD2 = async () => {
    try {
      // Attempt to connect to OBD via API
      const obdApiEndpoint = `/api/obd/vehicle/${vehicleId}/diagnostics`;
      const response = await fetch(obdApiEndpoint);
      
      if (response.ok) {
        const diagnostics = await response.json();
        updateCheckItemsFromOBD(diagnostics);
        
        setAlertMessage({
          type: 'success',
          message: 'Successfully connected to OBD2 and retrieved diagnostics'
        });
      } else {
        // If API fails, attempt direct WebBluetooth connection
        if (navigator.bluetooth) {
          setAlertMessage({
            type: 'info',
            message: 'Attempting to connect via Bluetooth...'
          });
          
          // Request device with OBD2 service UUID
          const device = await navigator.bluetooth.requestDevice({
            filters: [
              { services: ['1234'] }, // OBD service UUID - replace with actual OBD2 service UUID
              { namePrefix: 'OBD' }
            ],
            optionalServices: ['battery_service']
          });
          
          // Connect to GATT server
          const server = await device.gatt?.connect();
          if (!server) {
            throw new Error('Failed to connect to GATT server');
          }
          
          // Further OBD2 communication would go here
          // This is a simplified example
          
          setAlertMessage({
            type: 'success',
            message: 'Connected to OBD2 via Bluetooth'
          });
        } else {
          throw new Error('Bluetooth connectivity not available');
        }
      }
    } catch (err) {
      console.error('Error connecting to OBD2:', err);
      setAlertMessage({
        type: 'error',
        message: 'Could not connect to OBD2. Proceeding with manual check.'
      });
    }
  };
  
  // Update check items from OBD2 data
  const updateCheckItemsFromOBD = (diagnostics: any) => {
    // Map OBD2 diagnostic data to health check items
    const updatedItems = checkItems.map(item => {
      if (item.checkMethod !== 'obd2') {
        return item; // Skip items that aren't checked via OBD2
      }
      
      // Find matching diagnostic data
      const diagnostic = diagnostics.find((d: any) => 
        d.name.toLowerCase() === item.name.toLowerCase() ||
        d.pid === item.id
      );
      
      if (!diagnostic) {
        return item;
      }
      
      // Determine status based on thresholds if available
      let status: 'good' | 'warning' | 'critical' | 'unknown' = 'unknown';
      
      if (item.threshold && typeof diagnostic.value === 'number') {
        if (diagnostic.value >= item.threshold.critical) {
          status = 'critical';
        } else if (diagnostic.value >= item.threshold.warning) {
          status = 'warning';
        } else if (diagnostic.value >= item.threshold.good) {
          status = 'good';
        }
      } else if (diagnostic.status) {
        // If OBD2 provides a status directly
        status = diagnostic.status;
      }
      
      return {
        ...item,
        value: diagnostic.value,
        status,
        lastChecked: new Date().toISOString(),
        needsAttention: status === 'warning' || status === 'critical'
      };
    });
    
    setCheckItems(updatedItems);
  };
  
  // Save the health check results
  const saveHealthCheck = async () => {
    try {
      setIsSaving(true);
      
      const checkData = {
        vehicle_id: vehicleId,
        mileage: 0, // This would be input by user or from OBD2
        items: checkItems,
        created_at: new Date().toISOString(),
        created_by: 'current-user', // This would be the actual user ID
        detailing_conditions: detailingConditions
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('vehicle_health_checks')
        .insert([checkData])
        .select();
      
      if (error) throw error;
      
      setLastCheck({
        date: checkData.created_at,
        mileage: checkData.mileage,
        items: checkItems
      });
      
      setIsChecking(false);
      setIsSaving(false);
      
      setAlertMessage({
        type: 'success',
        message: 'Health check saved successfully'
      });
    } catch (err) {
      console.error('Error saving health check:', err);
      setIsSaving(false);
      setAlertMessage({
        type: 'error',
        message: 'Failed to save health check'
      });
    }
  };
  
  // Cancel the health check process
  const cancelHealthCheck = () => {
    setIsChecking(false);
    setCheckItems(getDefaultCheckItems());
    setAlertMessage(null);
  };
  
  // Update a check item
  const updateCheckItem = (index: number, updates: Partial<HealthCheckItem>) => {
    const updatedItems = [...checkItems];
    updatedItems[index] = {
      ...updatedItems[index],
      ...updates,
      lastChecked: new Date().toISOString()
    };
    setCheckItems(updatedItems);
  };
  
  // Add image to a check item
  const addImageToCheckItem = async (index: number, file: File) => {
    try {
      // Upload the image to Supabase Storage
      const filePath = `health_checks/${vehicleId}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('vehicle-files')
        .upload(filePath, file, {
          cacheControl: '3600'
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('vehicle-files')
        .getPublicUrl(filePath);
      
      // Update the check item
      const updatedItems = [...checkItems];
      const images = updatedItems[index].images || [];
      
      updatedItems[index] = {
        ...updatedItems[index],
        images: [...images, urlData.publicUrl]
      };
      
      setCheckItems(updatedItems);
    } catch (err) {
      console.error('Error uploading image:', err);
      setAlertMessage({
        type: 'error',
        message: 'Failed to upload image'
      });
    }
  };
  
  // Handle infrared temperature reading
  const handleInfraredReading = (temp: number, itemIndex?: number) => {
    setInfraredReading(temp);
    
    // If we're updating a specific item with this reading
    if (typeof itemIndex === 'number') {
      updateCheckItem(itemIndex, {
        value: temp,
        unit: '°C',
        status: 'good' // This would be determined by thresholds
      });
    }
    
    // Update detailing conditions with surface temp
    setDetailingConditions(prev => ({
      ...prev,
      surfaceTemp: temp
    }));
  };
  
  // Capture image for a check item
  const captureImage = (itemIndex: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          addImageToCheckItem(itemIndex, target.files[0]);
        }
      };
    }
  };
  
  // Get default check items
  const getDefaultCheckItems = (): HealthCheckItem[] => {
    return [
      {
        id: 'oil_level',
        name: 'Engine Oil Level',
        status: 'unknown',
        category: 'fluids',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'coolant_level',
        name: 'Coolant Level',
        status: 'unknown',
        category: 'fluids',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'brake_fluid',
        name: 'Brake Fluid Level',
        status: 'unknown',
        category: 'fluids',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'battery_voltage',
        name: 'Battery Voltage',
        status: 'unknown',
        category: 'electrical',
        checkMethod: 'obd2',
        threshold: {
          good: 12.6,
          warning: 12.2,
          critical: 11.8
        },
        unit: 'V',
        needsAttention: false
      },
      {
        id: 'tire_pressure_fl',
        name: 'Tire Pressure (Front Left)',
        status: 'unknown',
        category: 'tires',
        checkMethod: 'manual',
        needsAttention: false
      },
      {
        id: 'tire_pressure_fr',
        name: 'Tire Pressure (Front Right)',
        status: 'unknown',
        category: 'tires',
        checkMethod: 'manual',
        needsAttention: false
      },
      {
        id: 'tire_pressure_rl',
        name: 'Tire Pressure (Rear Left)',
        status: 'unknown',
        category: 'tires',
        checkMethod: 'manual',
        needsAttention: false
      },
      {
        id: 'tire_pressure_rr',
        name: 'Tire Pressure (Rear Right)',
        status: 'unknown',
        category: 'tires',
        checkMethod: 'manual',
        needsAttention: false
      },
      {
        id: 'brake_pads_front',
        name: 'Brake Pads (Front)',
        status: 'unknown',
        category: 'brakes',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'brake_pads_rear',
        name: 'Brake Pads (Rear)',
        status: 'unknown',
        category: 'brakes',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'exterior_damage',
        name: 'Exterior Damage Check',
        status: 'unknown',
        category: 'exterior',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'windshield_wipers',
        name: 'Windshield Wipers',
        status: 'unknown',
        category: 'exterior',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'all_lights',
        name: 'All Lights Functioning',
        status: 'unknown',
        category: 'electrical',
        checkMethod: 'visual',
        needsAttention: false
      },
      {
        id: 'check_engine_light',
        name: 'Check Engine Light',
        status: 'unknown',
        category: 'electrical',
        checkMethod: 'obd2',
        needsAttention: false
      },
      {
        id: 'air_filter',
        name: 'Air Filter',
        status: 'unknown',
        category: 'mechanical',
        checkMethod: 'visual',
        needsAttention: false
      }
    ];
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <RotateCcw className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render the component
  return (
    <div className={`bg-gray-900/40 rounded-xl p-5 border ${
      isPaddock20Member 
        ? 'border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-900/80'
        : 'border-gray-800'
    }`}>
      {/* Header with member badge if applicable */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-full ${
            isPaddock20Member ? 'bg-amber-900/30' : 'bg-blue-900/30'
          } mr-3`}>
            <ShieldCheck className={`h-6 w-6 ${
              isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
            }`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Vehicle Health Check</h3>
            {lastCheck && (
              <div className="text-xs text-gray-400 mt-0.5">
                Last check: {new Date(lastCheck.date).toLocaleDateString()}
                {lastCheck.mileage > 0 && ` • ${lastCheck.mileage.toLocaleString()} miles`}
              </div>
            )}
          </div>
        </div>
        
        {isPaddock20Member && (
          <div className="flex items-center bg-amber-900/20 px-3 py-1 rounded-full border border-amber-500/30">
            <Badge className="h-4 w-4 text-amber-400 mr-1.5" />
            <span className="text-xs font-medium text-amber-400">PADDOCK20 MEMBER</span>
          </div>
        )}
      </div>
      
      {/* Alert message */}
      {alertMessage && (
        <div className={`mb-4 p-3 rounded-lg border ${
          alertMessage.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' :
          alertMessage.type === 'error' ? 'bg-red-900/20 border-red-800 text-red-400' :
          'bg-blue-900/20 border-blue-800 text-blue-400'
        }`}>
          {alertMessage.message}
        </div>
      )}
      
      {isLoading ? (
        <div className="py-10 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-400">Loading health check data...</p>
        </div>
      ) : isChecking ? (
        /* Health check in progress */
        <div>
          {/* Detailing conditions panel */}
          <div className="mb-6 bg-gray-900/60 rounded-lg p-4 border border-gray-800">
            <h4 className="text-md font-medium text-gray-300 mb-3 flex items-center">
              <ThermometerSun className="h-4 w-4 mr-2 text-blue-400" />
              Detailing Conditions
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Outside Temp</div>
                <div className="text-lg font-semibold text-white flex items-center">
                  <Thermometer className="h-4 w-4 mr-1 text-blue-400" />
                  {detailingConditions.outsideTemp !== undefined 
                    ? `${detailingConditions.outsideTemp}°C` 
                    : 'N/A'}
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Surface Temp</div>
                <div className="text-lg font-semibold text-white flex items-center">
                  <ThermometerSun className="h-4 w-4 mr-1 text-amber-400" />
                  {detailingConditions.surfaceTemp !== undefined 
                    ? `${detailingConditions.surfaceTemp}°C` 
                    : infraredReading !== null
                      ? `${infraredReading}°C`
                      : 'N/A'}
                  
                  {/* IR temperature input button */}
                  <button 
                    className="ml-2 p-1 bg-gray-700 rounded-md text-xs text-gray-300"
                    onClick={() => {
                      // In a real app, this would activate an infrared thermometer
                      // or prompt the user to input a reading
                      const reading = prompt('Enter surface temperature reading (°C):');
                      if (reading && !isNaN(parseFloat(reading))) {
                        handleInfraredReading(parseFloat(reading));
                      }
                    }}
                  >
                    IR Reading
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Inside Temp</div>
                <div className="text-lg font-semibold text-white flex items-center">
                  <Fan className="h-4 w-4 mr-1 text-gray-400" />
                  {detailingConditions.insideTemp !== undefined 
                    ? `${detailingConditions.insideTemp}°C` 
                    : 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Detailing Suitability</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Washing</span>
                    <span className={`text-sm ${detailingConditions.isIdealForWashing ? 'text-green-500' : 'text-amber-500'}`}>
                      {detailingConditions.isIdealForWashing ? 'Ideal' : 'Suboptimal'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Waxing</span>
                    <span className={`text-sm ${detailingConditions.isIdealForWaxing ? 'text-green-500' : 'text-amber-500'}`}>
                      {detailingConditions.isIdealForWaxing ? 'Ideal' : 'Suboptimal'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Coating</span>
                    <span className={`text-sm ${detailingConditions.isIdealForCoating ? 'text-green-500' : 'text-amber-500'}`}>
                      {detailingConditions.isIdealForCoating ? 'Ideal' : 'Suboptimal'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Recommendations</div>
                {detailingConditions.recommendations && detailingConditions.recommendations.length > 0 ? (
                  <ul className="space-y-1">
                    {detailingConditions.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-start">
                        <span className="inline-block w-4 h-4 mr-1 mt-0.5 flex-shrink-0">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No specific recommendations</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Check items list */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-300 mb-3">Health Check Items</h4>
            
            <div className="space-y-3">
              {checkItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-gray-900/60 p-3 rounded-lg border ${
                    item.needsAttention ? 'border-amber-800/50' : 'border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="p-1.5 rounded-full bg-gray-800 mr-2">
                        {item.category === 'fluids' ? <Droplets className="h-4 w-4 text-blue-400" /> :
                         item.category === 'electrical' ? <Battery className="h-4 w-4 text-amber-400" /> :
                         item.category === 'mechanical' ? <Wrench className="h-4 w-4 text-gray-400" /> :
                         item.category === 'tires' ? <Car className="h-4 w-4 text-green-400" /> :
                         item.category === 'brakes' ? <Gauge className="h-4 w-4 text-red-400" /> :
                         <ShieldCheck className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div className="font-medium text-gray-300">{item.name}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {hasOBD2 && item.checkMethod === 'obd2' ? (
                        <div className="flex items-center text-sm">
                          <Bluetooth className="h-3.5 w-3.5 text-blue-400 mr-1" />
                          <span className="text-gray-400">OBD</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-400">{item.checkMethod}</span>
                        </div>
                      )}
                      
                      <select
                        value={item.status}
                        onChange={(e) => updateCheckItem(index, { 
                          status: e.target.value as any,
                          needsAttention: e.target.value === 'warning' || e.target.value === 'critical'
                        })}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                      >
                        <option value="unknown">Status</option>
                        <option value="good">Good</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  {(item.value !== undefined || item.notes) && (
                    <div className="mb-2">
                      {item.value !== undefined && (
                        <div className="text-sm text-gray-300">
                          Value: {item.value} {item.unit}
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="text-sm text-gray-400 mt-1">
                          {item.notes}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => captureImage(index)}
                      className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs flex items-center"
                    >
                      <Camera className="h-3.5 w-3.5 mr-1" />
                      Photo
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const notes = prompt('Enter notes for this check item:');
                        if (notes) {
                          updateCheckItem(index, { notes });
                        }
                      }}
                      className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs flex items-center"
                    >
                      <Fingerprint className="h-3.5 w-3.5 mr-1" />
                      Add Notes
                    </button>
                  </div>
                  
                  {/* Show images if available */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.images.map((img, imgIndex) => (
                        <div 
                          key={imgIndex} 
                          className="w-16 h-16 rounded overflow-hidden bg-gray-800"
                        >
                          <img 
                            src={img} 
                            alt={`${item.name} check`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelHealthCheck}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={saveHealthCheck}
              disabled={isSaving}
              className={`px-4 py-2 ${
                isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md flex items-center`}
            >
              {isSaving ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Health Check'
              )}
            </button>
          </div>
          
          {/* Hidden file input for image upload */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        /* Health check summary or start button */
        <div>
          {lastCheck ? (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-1">Date & Time</div>
                  <div className="text-lg font-medium text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
                    {new Date(lastCheck.date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-1">Mileage</div>
                  <div className="text-lg font-medium text-white flex items-center">
                    <Gauge className="h-4 w-4 mr-1.5 text-blue-400" />
                    {lastCheck.mileage.toLocaleString()} mi
                  </div>
                </div>
                
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="text-lg font-medium text-white flex items-center">
                    {lastCheck.items.some((i: any) => i.status === 'critical') ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1.5 text-red-500" />
                        <span className="text-red-500">Needs Attention</span>
                      </>
                    ) : lastCheck.items.some((i: any) => i.status === 'warning') ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                        <span className="text-amber-500">Minor Issues</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                        <span className="text-green-500">All Good</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                <h4 className="text-md font-medium text-gray-300 mb-3">Last Check Summary</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lastCheck.items.filter((item: any) => 
                    item.status === 'warning' || item.status === 'critical'
                  ).slice(0, 6).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start">
                      {item.status === 'critical' ? (
                        <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-300">{item.name}</div>
                        {item.notes && (
                          <div className="text-xs text-gray-400">{item.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* If no issues were found */}
                  {!lastCheck.items.some((item: any) => 
                    item.status === 'warning' || item.status === 'critical'
                  ) && (
                    <div className="col-span-2 text-center py-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                      <p className="text-green-400">No issues found in the last health check</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-4">
              <Car className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No previous health checks found</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Regular health checks help maintain your vehicle in optimal condition and prevent costly repairs
              </p>
            </div>
          )}
          
          <div className="text-center">
            <button
              type="button"
              onClick={startHealthCheck}
              className={`px-6 py-3 ${
                isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md inline-flex items-center`}
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              Start New Health Check
            </button>
            
            {hasOBD2 && (
              <div className="mt-2 text-sm text-gray-400 flex items-center justify-center">
                <Bluetooth className="h-4 w-4 mr-1.5 text-blue-400" />
                OBD2 connectivity available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleHealthCheck;