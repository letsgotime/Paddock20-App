import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Star, Heart, Car, Truck, Gauge, Map, Home, Clock, Bike, Compass, Edit2, Check, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfileStore } from '@/services/userProfileService';

// Define interfaces for our dreams categories
interface DreamItem {
  id: string;
  name: string;
  note?: string;
  image?: string;
}

interface DreamCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: DreamItem[];
  expanded?: boolean;
}

// Sample dream categories data for fallback
const dreamCategoriesData: DreamCategory[] = [
  {
    id: 'favorite-tires',
    name: 'Favorite Tires',
    icon: <Gauge className="h-4 w-4" />,
    items: [
      { id: 't1', name: 'Michelin Pilot Sport Cup 2' },
      { id: 't2', name: 'Pirelli P Zero Trofeo R' },
      { id: 't3', name: 'Bridgestone Potenza Sport' },
      { id: 't4', name: 'Continental ExtremeContact Sport' },
      { id: 't5', name: 'Yokohama ADVAN A052' }
    ]
  },
  {
    id: 'favorite-car-manufacturers',
    name: 'Favorite Car Manufacturers',
    icon: <Car className="h-4 w-4" />,
    items: [
      { id: 'c1', name: 'Porsche' },
      { id: 'c2', name: 'Ferrari' },
      { id: 'c3', name: 'BMW' },
      { id: 'c4', name: 'Audi' },
      { id: 'c5', name: 'Mercedes-AMG' }
    ]
  },
  {
    id: 'mod-brands',
    name: 'Mod Brands',
    icon: <Car className="h-4 w-4" />,
    items: [
      { id: 'm1', name: 'AKRAPOVIČ' },
      { id: 'm2', name: 'KW Suspension' },
      { id: 'm3', name: 'HRE Wheels' },
      { id: 'm4', name: 'APR Performance' },
      { id: 'm5', name: 'Vorsteiner' }
    ]
  },
  {
    id: 'dream-car',
    name: 'Dream Car',
    icon: <Car className="h-4 w-4" />,
    items: [
      { id: 'dc1', name: 'Porsche 911 GT3 RS' },
      { id: 'dc2', name: 'Ferrari 296 GTB' },
      { id: 'dc3', name: 'Lamborghini Huracán STO' },
      { id: 'dc4', name: 'McLaren 765LT' },
      { id: 'dc5', name: 'Aston Martin Valkyrie' }
    ]
  },
  {
    id: 'dream-car-build',
    name: 'Dream Car Build',
    icon: <Car className="h-4 w-4" />,
    items: [
      { id: 'b1', name: 'Porsche 911 Safari Build' },
      { id: 'b2', name: 'Widebody BMW M3 Competition' },
      { id: 'b3', name: 'Supercharged Audi R8' },
      { id: 'b4', name: 'RWB Porsche 911' },
      { id: 'b5', name: 'Drift-spec Toyota Supra' }
    ]
  },
  {
    id: 'dream-track-day',
    name: 'Dream Track Day Experience',
    icon: <Gauge className="h-4 w-4" />,
    items: [
      { id: 'td1', name: 'Nürburgring Nordschleife' },
      { id: 'td2', name: 'Circuit de Spa-Francorchamps' },
      { id: 'td3', name: 'Laguna Seca' },
      { id: 'td4', name: 'Suzuka Circuit' },
      { id: 'td5', name: 'Circuit de Monaco' }
    ]
  },
  {
    id: 'dream-truck',
    name: 'Dream Truck',
    icon: <Truck className="h-4 w-4" />,
    items: [
      { id: 'dt1', name: 'Ford F-150 Raptor' },
      { id: 'dt2', name: 'RAM 1500 TRX' },
      { id: 'dt3', name: 'GMC Sierra Denali Ultimate' },
      { id: 'dt4', name: 'Rivian R1T' },
      { id: 'dt5', name: 'Toyota Tundra TRD Pro' }
    ]
  },
  {
    id: 'dream-motorcycle',
    name: 'Dream Motorcycle',
    icon: <Bike className="h-4 w-4" />,
    items: [
      { id: 'dm1', name: 'Ducati Panigale V4' },
      { id: 'dm2', name: 'BMW S1000RR' },
      { id: 'dm3', name: 'Triumph Speed Triple 1200 RS' },
      { id: 'dm4', name: 'Aprilia RSV4 Factory' },
      { id: 'dm5', name: 'Kawasaki Ninja H2R' }
    ]
  },
  {
    id: 'dream-rv',
    name: 'Dream RV',
    icon: <Home className="h-4 w-4" />,
    items: [
      { id: 'dr1', name: 'Bowlus Terra Firma' },
      { id: 'dr2', name: 'Airstream Atlas' },
      { id: 'dr3', name: 'EarthRoamer LTi' },
      { id: 'dr4', name: 'Winnebago Revel 4x4' },
      { id: 'dr5', name: 'Newmar King Aire' }
    ]
  },
  {
    id: 'dream-experience',
    name: 'Dream Experience',
    icon: <Star className="h-4 w-4" />,
    items: [
      { id: 'e1', name: 'Drive the Stelvio Pass in Italy' },
      { id: 'e2', name: 'Attend Monaco Grand Prix' },
      { id: 'e3', name: 'Complete Targa Florio historic route' },
      { id: 'e4', name: 'Drive Route 66 in a classic car' },
      { id: 'e5', name: 'Hot lap in an F1 car' }
    ]
  },
  {
    id: 'dream-vacation',
    name: 'Dream Vacation',
    icon: <Map className="h-4 w-4" />,
    items: [
      { id: 'v1', name: 'Amalfi Coast driving tour' },
      { id: 'v2', name: 'German car factory tours' },
      { id: 'v3', name: 'Monaco during F1 week' },
      { id: 'v4', name: 'Monterey Car Week' },
      { id: 'v5', name: 'Tokyo Auto Salon' }
    ]
  },
  {
    id: 'dream-timepiece',
    name: 'Dream Timepiece',
    icon: <Clock className="h-4 w-4" />,
    items: [
      { id: 'tp1', name: 'TAG Heuer Monaco' },
      { id: 'tp2', name: 'Rolex Daytona' },
      { id: 'tp3', name: 'Omega Speedmaster Racing' },
      { id: 'tp4', name: 'IWC Pilot Watch Chronograph TopGun' },
      { id: 'tp5', name: 'Richard Mille RM 11-03 McLaren' }
    ]
  },
  {
    id: 'dream-retirement-city',
    name: 'Dream Retirement City',
    icon: <Home className="h-4 w-4" />,
    items: [
      { id: 'rc1', name: 'Scottsdale, Arizona' },
      { id: 'rc2', name: 'Naples, Florida' },
      { id: 'rc3', name: 'Monaco' },
      { id: 'rc4', name: 'Lake Como, Italy' },
      { id: 'rc5', name: 'Monterey, California' }
    ]
  },
  {
    id: 'dream-home-locations',
    name: 'Dream Home Locations',
    icon: <Compass className="h-4 w-4" />,
    items: [
      { id: 'hl1', name: 'Monaco Penthouse' },
      { id: 'hl2', name: 'Malibu Beach House' },
      { id: 'hl3', name: 'Swiss Alps Chalet' },
      { id: 'hl4', name: 'Lake Como Villa' },
      { id: 'hl5', name: 'Kyoto Traditional Home' }
    ]
  }
];

const DreamGarageWidget: React.FC = () => {
  const [, setLocation] = useLocation();
  const [categories, setCategories] = useState<DreamCategory[]>(dreamCategoriesData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{categoryId: string, itemId: string, name: string} | null>(null);
  
  // Get user data from auth context and user profile store
  const { user } = useAuth();
  const userProfile = useUserProfileStore(state => state.profile);
  
  // Load user preferences from profile when available
  useEffect(() => {
    if (user && userProfile) {
      // If we have user preferences or profile data for dream garage
      // create categories dynamically from the user's preferences
      try {
        // Map user dream garage data to our UI format
        const userDreamCategories: DreamCategory[] = [];
        
        // Favorite car brands category
        if (userProfile?.favoriteCarBrands?.length > 0) {
          userDreamCategories.push({
            id: 'favorite-car-brands',
            name: 'Favorite Car Brands',
            icon: <Car className="h-4 w-4" />,
            items: userProfile.favoriteCarBrands.map((brand, idx) => ({
              id: `fcb-${idx}`,
              name: brand
            }))
          });
        }
        
        // Favorite mod brands category
        if (userProfile?.favoriteModBrands?.length > 0) {
          userDreamCategories.push({
            id: 'favorite-mod-brands',
            name: 'Favorite Mod Brands',
            icon: <Car className="h-4 w-4" />,
            items: userProfile.favoriteModBrands.map((brand, idx) => ({
              id: `fmb-${idx}`,
              name: brand
            }))
          });
        }
        
        // Favorite tire brands category
        if (userProfile?.favoriteTireBrands?.length > 0) {
          userDreamCategories.push({
            id: 'favorite-tire-brands',
            name: 'Favorite Tire Brands',
            icon: <Gauge className="h-4 w-4" />,
            items: userProfile.favoriteTireBrands.map((brand, idx) => ({
              id: `ftb-${idx}`,
              name: brand
            }))
          });
        }
        
        // Favorite wheel brands category
        if (userProfile?.favoriteWheelBrands?.length > 0) {
          userDreamCategories.push({
            id: 'favorite-wheel-brands',
            name: 'Favorite Wheel Brands',
            icon: <Gauge className="h-4 w-4" />,
            items: userProfile.favoriteWheelBrands.map((brand, idx) => ({
              id: `fwb-${idx}`,
              name: brand
            }))
          });
        }
        
        // Dream car builds category
        if (userProfile?.dreamCarBuilds?.length > 0) {
          userDreamCategories.push({
            id: 'dream-car-builds',
            name: 'Dream Car Builds',
            icon: <Car className="h-4 w-4" />,
            items: userProfile.dreamCarBuilds.map((build, idx) => ({
              id: `dcb-${idx}`,
              name: build.title
            }))
          });
        }
        
        // Use fallback data to fill in any missing categories to ensure a complete experience
        const completeCategories = userDreamCategories.length > 0 
          ? [...userDreamCategories, ...dreamCategoriesData.filter(cat => 
              !userDreamCategories.some(userCat => userCat.id === cat.id)
            )] 
          : dreamCategoriesData;
          
        setCategories(completeCategories);
      } catch (error) {
        console.error("Error loading user dream garage data:", error);
        // Fallback to default data on error
        setCategories(dreamCategoriesData);
      }
    }
  }, [user, userProfile]);
  
  // Toggle category expansion
  const toggleCategoryExpand = (categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, expanded: !category.expanded } 
          : category
      )
    );
  };
  
  // Start editing a dream item
  const startEditing = (categoryId: string, itemId: string, currentName: string) => {
    if (isEditing) {
      setEditItem({
        categoryId,
        itemId,
        name: currentName
      });
    }
  };
  
  // Save edited item
  const saveItem = () => {
    if (!editItem) return;
    
    setCategories(prev => 
      prev.map(category => 
        category.id === editItem.categoryId 
          ? {
              ...category,
              items: category.items.map(item => 
                item.id === editItem.itemId
                  ? { ...item, name: editItem.name }
                  : item
              )
            } 
          : category
      )
    );
    
    setEditItem(null);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Widget Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-blue-300 font-orbitron flex items-center">
          <Heart className="h-4 w-4 mr-2 text-blue-400" />
          DREAM GARAGE
        </h3>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
            isEditing
              ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40'
              : 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/40'
          }`}
        >
          {isEditing ? (
            <>
              <Check className="h-3 w-3" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </>
          )}
        </button>
      </div>
      
      {/* Categories List - Scrollable */}
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        <div className="space-y-2">
          {categories.map(category => (
            <div 
              key={category.id}
              className="bg-black/40 border border-blue-900/30 rounded-md overflow-hidden"
            >
              {/* Category Header - Clickable to expand */}
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-950/30"
                onClick={() => toggleCategoryExpand(category.id)}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center mr-2">
                    {category.icon}
                  </div>
                  <h4 className="text-sm font-medium text-blue-300">{category.name}</h4>
                </div>
                <div>
                  {category.expanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Category Items - Only shown when expanded */}
              {category.expanded && (
                <div className="px-3 pb-3">
                  <div className="mt-2 space-y-1.5">
                    {category.items.map((item, index) => (
                      <div key={item.id} className="flex items-center">
                        <div className="w-5 text-xs text-gray-500 flex justify-center">
                          {index + 1}.
                        </div>
                        {editItem && editItem.categoryId === category.id && editItem.itemId === item.id ? (
                          <div className="flex-grow flex items-center">
                            <input
                              type="text"
                              value={editItem.name}
                              onChange={(e) => setEditItem({...editItem, name: e.target.value})}
                              className="flex-grow bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                              autoFocus
                            />
                            <button 
                              onClick={saveItem}
                              className="ml-2 p-1 rounded bg-green-900/30 text-green-400"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className={`flex-grow text-sm ${index === 0 ? 'text-gold-400 font-medium' : 'text-white'}`}
                            onClick={() => startEditing(category.id, item.id, item.name)}
                          >
                            {item.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-blue-900/20">
        <button
          onClick={() => setLocation('/profile/dreams')}
          className="w-full py-2 bg-blue-900/30 hover:bg-blue-800/40 rounded-md flex items-center justify-center text-blue-400 text-sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Edit Dream Garage
        </button>
      </div>
    </div>
  );
};

export default DreamGarageWidget;