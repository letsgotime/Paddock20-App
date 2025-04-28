import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Droplet, 
  Gauge, 
  Battery, 
  Lightbulb, 
  Shield, 
  ShieldAlert, 
  Umbrella, 
  Sun, 
  Thermometer, 
  Wrench, 
  Car, 
  Smartphone, 
  Fuel, 
  Waves, 
  Eye,
  Map,
  Shirt,
  Oil,
  Spray
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  category: 'mechanical' | 'safety' | 'comfort' | 'emergency' | 'documents' | 'weather' | 'enthusiast';
  name: string;
  description: string;
  icon: React.ReactNode;
  critical: boolean;
}

interface PreDriveChecklistProps {
  vehicleId?: number;
  vehicleType?: 'sports' | 'sedan' | 'suv' | 'truck' | 'exotic';
  weatherCondition?: string;
  temperature?: number;
  precipitation?: boolean;
  driveType?: 'casual' | 'performance' | 'offroad' | 'track';
  distance?: number;
  onChecklistComplete?: (completedItems: string[], missingCriticalItems: string[]) => void;
}

const PreDriveChecklist: React.FC<PreDriveChecklistProps> = ({
  vehicleId,
  vehicleType = 'sports',
  weatherCondition = 'clear',
  temperature = 75,
  precipitation = false,
  driveType = 'casual',
  distance = 0,
  onChecklistComplete
}) => {
  // Default checklist items that apply to all drives
  const defaultChecklistItems: ChecklistItem[] = [
    {
      id: 'fluid-levels',
      category: 'mechanical',
      name: 'Fluid Levels',
      description: 'Check oil, coolant, brake fluid, and washer fluid',
      icon: <Droplet className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'tire-pressure',
      category: 'mechanical',
      name: 'Tire Pressure',
      description: 'Verify all tires at recommended PSI',
      icon: <Gauge className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'battery',
      category: 'mechanical',
      name: 'Battery',
      description: 'Battery is charged and connections are secure',
      icon: <Battery className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'lights',
      category: 'safety',
      name: 'Lights',
      description: 'Check headlights, taillights, turn signals, and brake lights',
      icon: <Lightbulb className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'brakes',
      category: 'safety',
      name: 'Brakes',
      description: 'Brake pedal feels firm and responsive',
      icon: <ShieldAlert className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'documents',
      category: 'documents',
      name: 'Documents',
      description: 'Insurance, registration, and driver\'s license',
      icon: <Shield className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'first-aid',
      category: 'emergency',
      name: 'First Aid Kit',
      description: 'Check first aid kit is stocked and accessible',
      icon: <Shield className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'phone-charger',
      category: 'comfort',
      name: 'Phone Charger',
      description: 'Mobile phone charger and mount',
      icon: <Smartphone className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'fuel',
      category: 'mechanical',
      name: 'Fuel Level',
      description: 'Adequate fuel for journey plus reserve',
      icon: <Fuel className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'windshield-wipers',
      category: 'mechanical',
      name: 'Windshield Wipers',
      description: 'Wipers functioning properly with no streaking',
      icon: <Waves className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'visibility',
      category: 'safety',
      name: 'Clear Visibility',
      description: 'All windows and mirrors clean and unobstructed',
      icon: <Eye className="w-5 h-5" />,
      critical: true
    },
    {
      id: 'navigation',
      category: 'comfort',
      name: 'Navigation Set',
      description: 'Route programmed in navigation system',
      icon: <Map className="w-5 h-5" />,
      critical: false
    }
  ];

  // Enthusiast-specific items
  const enthusiastItems: ChecklistItem[] = [
    {
      id: 'driving-gloves',
      category: 'enthusiast',
      name: 'Driving Gloves',
      description: 'Premium driving gloves for enhanced grip and control',
      icon: <Shirt className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'detail-spray',
      category: 'enthusiast',
      name: 'Detail Spray',
      description: 'Quick detailer spray for touch-ups at stops',
      icon: <Spray className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'extra-oil',
      category: 'enthusiast',
      name: 'Extra Oil',
      description: 'Spare quart of manufacturer-recommended oil',
      icon: <Oil className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'tire-gauge',
      category: 'enthusiast',
      name: 'Tire Pressure Gauge',
      description: 'Precise tire pressure gauge for performance driving',
      icon: <Gauge className="w-5 h-5" />,
      critical: false
    },
    {
      id: 'microfiber-towels',
      category: 'enthusiast',
      name: 'Microfiber Towels',
      description: 'Clean microfiber cloths for window cleaning and detailing',
      icon: <Spray className="w-5 h-5" />,
      critical: false
    }
  ];

  // Performance driving items
  const performanceItems: ChecklistItem[] = [
    {
      id: 'tire-temp',
      category: 'mechanical',
      name: 'Tire Temperature',
      description: 'Check for even temperature across tire surface',
      icon: <Thermometer className="w-5 h-5" />,
      critical: driveType === 'performance' || driveType === 'track'
    },
    {
      id: 'brake-pads',
      category: 'mechanical',
      name: 'Brake Pad Condition',
      description: 'Verify brake pads have adequate material for spirited driving',
      icon: <Wrench className="w-5 h-5" />,
      critical: driveType === 'performance' || driveType === 'track'
    },
    {
      id: 'performance-tires',
      category: 'mechanical',
      name: 'Performance Tire Check',
      description: 'Inspect tires for optimal tread pattern and no damage',
      icon: <Car className="w-5 h-5" />,
      critical: driveType === 'performance' || driveType === 'track'
    }
  ];

  // Weather-specific items
  const weatherItems: ChecklistItem[] = [];
  
  if (precipitation || weatherCondition.includes('rain') || weatherCondition.includes('snow')) {
    weatherItems.push({
      id: 'rain-gear',
      category: 'weather',
      name: 'Rain/Snow Gear',
      description: 'Umbrella, rain jacket, or snow equipment',
      icon: <Umbrella className="w-5 h-5" />,
      critical: false
    });
  }
  
  if (temperature > 85) {
    weatherItems.push({
      id: 'sun-protection',
      category: 'weather',
      name: 'Sun Protection',
      description: 'Sunglasses, sunscreen, and window shades',
      icon: <Sun className="w-5 h-5" />,
      critical: false
    });
  }
  
  if (temperature < 40) {
    weatherItems.push({
      id: 'cold-weather-gear',
      category: 'weather',
      name: 'Cold Weather Gear',
      description: 'Gloves, hat, blanket, and ice scraper',
      icon: <Thermometer className="w-5 h-5" />,
      critical: false
    });
  }

  // Long distance items
  const longDistanceItems: ChecklistItem[] = [];
  
  if (distance > 100) {
    longDistanceItems.push({
      id: 'snacks-water',
      category: 'comfort',
      name: 'Snacks & Water',
      description: 'Adequate food and hydration for the journey',
      icon: <Droplet className="w-5 h-5" />,
      critical: false
    });
    
    longDistanceItems.push({
      id: 'emergency-kit',
      category: 'emergency',
      name: 'Emergency Kit',
      description: 'Flashlight, basic tools, jumper cables, and warning triangle',
      icon: <ShieldAlert className="w-5 h-5" />,
      critical: false
    });
  }

  // Combine all applicable checklist items based on props
  const allChecklistItems = [
    ...defaultChecklistItems,
    ...enthusiastItems,
    ...(driveType === 'performance' || driveType === 'track' ? performanceItems : []),
    ...weatherItems,
    ...(distance > 100 ? longDistanceItems : [])
  ];

  // State to track checked items
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Handle item toggle
  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculate completion status
  const calculateCompletion = () => {
    const completedItems = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([id, _]) => id);
    
    const missingCriticalItems = allChecklistItems
      .filter(item => item.critical && !checkedItems[item.id])
      .map(item => item.id);
    
    return {
      completedItems,
      missingCriticalItems,
      isComplete: missingCriticalItems.length === 0
    };
  };

  // Handle checklist completion
  const handleComplete = () => {
    const { completedItems, missingCriticalItems } = calculateCompletion();
    if (onChecklistComplete) {
      onChecklistComplete(completedItems, missingCriticalItems);
    }
  };

  const { isComplete } = calculateCompletion();

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg border border-gray-800 overflow-hidden p-4">
      <h2 className="text-blue-400 font-orbitron text-lg mb-4">
        Pre-Drive Safety Checklist
        {vehicleType === 'exotic' && <span className="ml-2 text-amber-500">(Exotic Car Edition)</span>}
        {driveType === 'performance' && <span className="ml-2 text-red-500">(Performance Drive)</span>}
        {driveType === 'track' && <span className="ml-2 text-purple-500">(Track Day Ready)</span>}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allChecklistItems.map(item => (
          <div 
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-md border ${
              item.critical 
                ? (checkedItems[item.id] ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/10') 
                : (checkedItems[item.id] ? 'border-blue-700 bg-blue-900/20' : 'border-gray-700 bg-gray-900/10')
            } transition-colors`}
            onClick={() => toggleItem(item.id)}
          >
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              checkedItems[item.id] 
                ? 'bg-green-500 text-black' 
                : (item.critical ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400')
            }`}>
              {checkedItems[item.id] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`${
                  item.critical ? 'text-white' : 'text-gray-300'
                } font-medium`}>{item.name}</span>
                {item.critical && (
                  <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
                {item.category === 'enthusiast' && (
                  <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">
                    Enthusiast
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
            </div>
            
            <div className="flex-shrink-0 text-gray-400">
              {item.icon}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          {isComplete 
            ? <span className="text-green-400">✓ All critical items checked</span>
            : <span className="text-red-400">! Critical items missing</span>
          }
        </div>
        
        <button
          onClick={handleComplete}
          disabled={!isComplete}
          className={`px-4 py-2 rounded font-medium ${
            isComplete 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          Confirm Ready to Drive
        </button>
      </div>
    </div>
  );
};

export default PreDriveChecklist;