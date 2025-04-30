import React, { useState } from 'react';
import { 
  Battery, 
  Car, 
  Cpu, 
  Droplet, 
  Fuel, 
  HelpCircle, 
  MapPin, 
  Utensils, 
  Store, 
  Wrench, 
  TreePine, 
  User, 
  Users, 
  Fish,
  Tent,
  Route,
  Mountain,
  Bath,
  Camera,
  Palmtree,
  Trees,
  Dog,
  Sunset,
  Sunrise,
  Pizza,
  Beef,
  Cookie,
  Home,
  Trash,
  Recycle
} from 'lucide-react';

// POI Categories
export type POICategory = 
  'gas' | 'air' | 'oil' | 'roadside' | 'clubs' | 'dealers' | 'tires' | 
  'food' | 'drives' | 'hikes' | 'camping' | 'fishing' | 'restrooms' |
  'driving_schools' | 'body_shops' | 'photo_spots' | 'lakes' | 'parks' |
  'dog_parks' | 'sunset_spots' | 'sunrise_spots' | 'beaches' |
  'tacos' | 'pizza' | 'bbq' | 'rv_stations' | 'rv_dump_stations' | 'waste_services' |
  'detailing_supplies' | 'performance_shops' | 'dyno_tuners' | 'exhaust_shops' |
  'vinyl_wraps' | 'car_washes' | 'ceramic_coating' | 'race_tracks' | 'car_shows' |
  'car_museums' | 'motorcycles' | 'exotic_rentals' | 'drag_strips' | 'drift_parks';

interface POI {
  id: string;
  name: string;
  category: POICategory;
  description: string;
  address?: string;
  lat: number;
  lon: number;
  rating?: number;
  website?: string;
  phone?: string;
  hours?: string;
  amenities?: string[];
  images?: string[];
  reviews?: {
    username: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  distance?: number; // Distance from current location
}

interface POICategoryDetails {
  id: POICategory;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

// POI Category Definitions with icons and colors
const POI_CATEGORIES: POICategoryDetails[] = [
  { 
    id: 'gas', 
    name: 'Gas Stations', 
    icon: <Fuel className="w-5 h-5" />, 
    description: 'Premium & regular fuel stations with convenience stores',
    color: 'text-red-500'
  },
  { 
    id: 'air', 
    name: 'Air Filling Stations', 
    icon: <Droplet className="w-5 h-5" />, 
    description: 'Air pumps for tires with pressure gauges',
    color: 'text-blue-400'
  },
  { 
    id: 'oil', 
    name: 'Oil Change Centers', 
    icon: <Cpu className="w-5 h-5" />, 
    description: 'Quick and full-service oil change services',
    color: 'text-yellow-500'
  },
  { 
    id: 'roadside', 
    name: 'Roadside Assistance', 
    icon: <HelpCircle className="w-5 h-5" />, 
    description: 'Towing services and emergency repairs',
    color: 'text-orange-500'
  },
  { 
    id: 'clubs', 
    name: 'Car Clubs', 
    icon: <Users className="w-5 h-5" />, 
    description: 'Local automotive enthusiast groups and meetups',
    color: 'text-indigo-400'
  },
  { 
    id: 'dealers', 
    name: 'Dealerships', 
    icon: <Store className="w-5 h-5" />, 
    description: 'Authorized dealerships for maintenance and repairs',
    color: 'text-green-500'
  },
  { 
    id: 'tires', 
    name: 'Tire Centers', 
    icon: <Wrench className="w-5 h-5" />, 
    description: 'Tire replacement, rotation, and repair shops',
    color: 'text-gray-400'
  },
  { 
    id: 'food', 
    name: 'Food Spots', 
    icon: <Utensils className="w-5 h-5" />, 
    description: 'Top-rated restaurants and eateries near routes',
    color: 'text-pink-500'
  },
  { 
    id: 'drives', 
    name: 'Top Drives', 
    icon: <Route className="w-5 h-5" />, 
    description: 'Scenic and thrilling driving routes for car lovers',
    color: 'text-blue-500'
  },
  { 
    id: 'hikes', 
    name: 'Hiking Trails', 
    icon: <Mountain className="w-5 h-5" />, 
    description: 'Beautiful hiking trails with parking for your vehicle',
    color: 'text-emerald-500'
  },
  { 
    id: 'camping', 
    name: 'Camping Sites', 
    icon: <Tent className="w-5 h-5" />, 
    description: 'Vehicle-accessible camping locations',
    color: 'text-green-600'
  },
  { 
    id: 'fishing', 
    name: 'Fishing Spots', 
    icon: <Fish className="w-5 h-5" />, 
    description: 'Prime fishing locations with vehicle access',
    color: 'text-cyan-500'
  },
  { 
    id: 'restrooms', 
    name: 'Clean Restrooms', 
    icon: <Bath className="w-5 h-5" />, 
    description: 'Well-maintained rest stops and facilities',
    color: 'text-violet-400'
  },
  { 
    id: 'rv_stations', 
    name: 'RV Stations', 
    icon: <Home className="w-5 h-5" />, 
    description: 'Full-service RV parks with hookups and amenities',
    color: 'text-blue-600'
  },
  { 
    id: 'rv_dump_stations', 
    name: 'RV Dump Stations', 
    icon: <Droplet className="w-5 h-5" />, 
    description: 'Designated stations for RV waste disposal',
    color: 'text-green-700'
  },
  { 
    id: 'waste_services', 
    name: 'Waste Services', 
    icon: <Trash className="w-5 h-5" />, 
    description: 'Waste disposal and recycling centers',
    color: 'text-amber-600'
  },
  { 
    id: 'photo_spots', 
    name: 'Photo Spots', 
    icon: <Camera className="w-5 h-5" />, 
    description: 'Scenic locations perfect for vehicle photography',
    color: 'text-pink-600'
  },
  { 
    id: 'lakes', 
    name: 'Lakes', 
    icon: <Droplet className="w-5 h-5" />, 
    description: 'Scenic lakes with shoreline drives and parking',
    color: 'text-blue-500'
  },
  { 
    id: 'parks', 
    name: 'Parks', 
    icon: <Trees className="w-5 h-5" />, 
    description: 'Public parks with vehicle-accessible roads and parking',
    color: 'text-emerald-600'
  },
  { 
    id: 'dog_parks', 
    name: 'Dog Parks', 
    icon: <Dog className="w-5 h-5" />, 
    description: 'Pet-friendly parks for you and your four-legged co-pilots',
    color: 'text-yellow-600'
  },
  { 
    id: 'sunset_spots', 
    name: 'Sunset Viewing', 
    icon: <Sunset className="w-5 h-5" />, 
    description: 'Perfect spots to watch the sunset from your vehicle',
    color: 'text-orange-500'
  },
  { 
    id: 'sunrise_spots', 
    name: 'Sunrise Viewing', 
    icon: <Sunrise className="w-5 h-5" />, 
    description: 'Ideal locations to catch the sunrise from your car',
    color: 'text-amber-400'
  },
  { 
    id: 'beaches', 
    name: 'Beaches', 
    icon: <Palmtree className="w-5 h-5" />, 
    description: 'Beaches with nearby parking or vehicle access',
    color: 'text-blue-300'
  },
  { 
    id: 'pizza', 
    name: 'Pizza Spots', 
    icon: <Pizza className="w-5 h-5" />, 
    description: 'Best pizza restaurants along your route',
    color: 'text-red-600'
  },
  { 
    id: 'bbq', 
    name: 'BBQ Joints', 
    icon: <Beef className="w-5 h-5" />, 
    description: 'Top-rated BBQ restaurants with parking',
    color: 'text-red-700'
  },
  { 
    id: 'tacos', 
    name: 'Taco Spots', 
    icon: <Utensils className="w-5 h-5" />, 
    description: 'Best taco restaurants and food trucks',
    color: 'text-yellow-500'
  },
  { 
    id: 'detailing_supplies', 
    name: 'Detailing Supplies', 
    icon: <Droplet className="w-5 h-5" />, 
    description: 'Auto detailing supplies and specialty products',
    color: 'text-blue-500'
  },
  { 
    id: 'performance_shops', 
    name: 'Performance Shops', 
    icon: <Cpu className="w-5 h-5" />, 
    description: 'Performance parts, upgrades, and tuning shops',
    color: 'text-red-600'
  },
  { 
    id: 'dyno_tuners', 
    name: 'Dyno Tuners', 
    icon: <Wrench className="w-5 h-5" />, 
    description: 'Professional dyno tuning and ECU calibration',
    color: 'text-purple-500'
  },
  { 
    id: 'exhaust_shops', 
    name: 'Exhaust Specialists', 
    icon: <Wrench className="w-5 h-5" />, 
    description: 'Custom exhaust fabrication and installation',
    color: 'text-orange-600'
  },
  { 
    id: 'vinyl_wraps', 
    name: 'Vinyl Wrap Shops', 
    icon: <Wrench className="w-5 h-5" />, 
    description: 'Professional vinyl wrapping services',
    color: 'text-green-500'
  },
  { 
    id: 'body_shops', 
    name: 'Body Shops', 
    icon: <Wrench className="w-5 h-5" />, 
    description: 'High-end body work and paint specialists',
    color: 'text-pink-500'
  },
  { 
    id: 'ceramic_coating', 
    name: 'Ceramic Coating', 
    icon: <Droplet className="w-5 h-5" />, 
    description: 'Professional ceramic coating application',
    color: 'text-sky-400'
  },
  { 
    id: 'race_tracks', 
    name: 'Race Tracks', 
    icon: <Route className="w-5 h-5" />, 
    description: 'Local race tracks and track day venues',
    color: 'text-red-500'
  },
  { 
    id: 'car_shows', 
    name: 'Car Shows', 
    icon: <Car className="w-5 h-5" />, 
    description: 'Upcoming car shows and automotive events',
    color: 'text-amber-500'
  },
  { 
    id: 'car_museums', 
    name: 'Automotive Museums', 
    icon: <Store className="w-5 h-5" />, 
    description: 'Automotive history and collections on display',
    color: 'text-blue-700'
  },
  { 
    id: 'exotic_rentals', 
    name: 'Exotic Rentals', 
    icon: <Car className="w-5 h-5" />, 
    description: 'Luxury and exotic vehicle rentals',
    color: 'text-yellow-400'
  },
  { 
    id: 'driving_schools', 
    name: 'Driving Schools', 
    icon: <Car className="w-5 h-5" />, 
    description: 'Performance driving schools and instruction',
    color: 'text-indigo-500'
  }
];

// Sample points of interest
const SAMPLE_POIS: POI[] = [
  {
    id: 'gas-1',
    name: 'Shell Premium Station',
    category: 'gas',
    description: 'Full-service station with 93 octane premium fuel, car wash, and convenience store.',
    address: '1234 Main St, Charlotte, NC 28202',
    lat: 35.2271,
    lon: -80.8431,
    rating: 4.5,
    website: 'https://www.shell.com',
    phone: '704-555-1234',
    hours: 'Open 24/7',
    amenities: ['Premium Fuel', 'Car Wash', 'Convenience Store', 'Air Pump', 'EV Charging'],
    images: ['/assets/shell-station.jpg']
  },
  {
    id: 'air-1',
    name: 'QuikTrip Air Station',
    category: 'air',
    description: 'Free digital air pump with accurate pressure gauge.',
    address: '5678 Park Rd, Charlotte, NC 28209',
    lat: 35.1668,
    lon: -80.8578,
    rating: 4.8,
    amenities: ['Digital Pressure Gauge', 'Free Air', '24/7 Access'],
    images: ['/assets/air-station.jpg']
  },
  {
    id: 'oil-1',
    name: 'Valvoline Instant Oil Change',
    category: 'oil',
    description: 'Quick, professional oil changes with premium synthetic options.',
    address: '9012 Prosperity Church Rd, Charlotte, NC 28269',
    lat: 35.3429,
    lon: -80.7673,
    rating: 4.2,
    website: 'https://www.vioc.com',
    phone: '704-555-5678',
    hours: 'Mon-Sat: 8AM-7PM, Sun: 9AM-5PM',
    amenities: ['Synthetic Oil', 'Filter Replacement', 'Fluid Checks', 'No Appointment Needed'],
    images: ['/assets/valvoline.jpg']
  },
  {
    id: 'roadside-1',
    name: 'AAA Roadside Assistance',
    category: 'roadside',
    description: 'Premium roadside assistance with fast response times.',
    lat: 35.2729,
    lon: -80.8433,
    rating: 4.7,
    website: 'https://www.aaa.com',
    phone: '704-555-9012',
    hours: 'Available 24/7',
    amenities: ['Towing', 'Battery Service', 'Flat Tire Service', 'Lockout Service'],
    images: ['/assets/aaa-roadside.jpg']
  },
  {
    id: 'clubs-1',
    name: 'Charlotte Exotic Car Club',
    category: 'clubs',
    description: 'Exclusive club for exotic car owners with regular meets and drives.',
    address: 'Charlotte Motor Speedway Area',
    lat: 35.3523,
    lon: -80.6818,
    rating: 4.9,
    website: 'https://www.charlotteexotics.com',
    phone: '704-555-3456',
    amenities: ['Monthly Meets', 'Track Days', 'Group Drives', 'Annual Show'],
    images: ['/assets/exotic-club.jpg']
  },
  {
    id: 'dealers-1',
    name: 'Hendrick Porsche',
    category: 'dealers',
    description: 'Authorized Porsche dealership with certified maintenance and parts.',
    address: '4400 Hendrick Auto Plaza, Charlotte, NC 28212',
    lat: 35.1869,
    lon: -80.7340,
    rating: 4.6,
    website: 'https://www.hendrickporsche.com',
    phone: '704-555-7890',
    hours: 'Mon-Fri: 9AM-8PM, Sat: 9AM-6PM, Sun: Closed',
    amenities: ['Certified Technicians', 'Genuine Parts', 'Loaner Cars', 'Detailing'],
    images: ['/assets/porsche-dealer.jpg']
  },
  {
    id: 'tires-1',
    name: 'Discount Tire',
    category: 'tires',
    description: 'Wide selection of performance and all-season tires with expert installation.',
    address: '8900 J M Keynes Dr, Charlotte, NC 28262',
    lat: 35.3034,
    lon: -80.7452,
    rating: 4.4,
    website: 'https://www.discounttire.com',
    phone: '704-555-2345',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 8AM-5PM, Sun: Closed',
    amenities: ['Performance Tires', 'Free Rotations', 'Tire Warranty', 'TPMS Service'],
    images: ['/assets/discount-tire.jpg']
  },
  {
    id: 'food-1',
    name: 'The Pit Stop Grill',
    category: 'food',
    description: 'Car-themed restaurant with gourmet burgers and outdoor seating for car viewing.',
    address: '5000 Performance Drive, Charlotte, NC 28269',
    lat: 35.3026,
    lon: -80.6937,
    rating: 4.8,
    website: 'https://www.pitstopgrill.com',
    phone: '704-555-6789',
    hours: 'Mon-Sun: 11AM-10PM',
    amenities: ['Car-Themed Decor', 'Outdoor Seating', 'Weekend Car Shows', 'Full Bar'],
    images: ['/assets/pit-stop-grill.jpg']
  },
  {
    id: 'drives-1',
    name: 'Blue Ridge Parkway',
    category: 'drives',
    description: 'America\'s longest linear park running through Virginia and North Carolina.',
    lat: 35.5653,
    lon: -82.4889,
    rating: 4.9,
    website: 'https://www.nps.gov/blri',
    amenities: ['Scenic Overlooks', 'Hiking Trails', 'Camping', 'Visitor Centers'],
    images: ['/assets/blue-ridge.jpg']
  },
  {
    id: 'hikes-1',
    name: 'Crowders Mountain Trail',
    category: 'hikes',
    description: 'Popular hiking area with vehicle parking and panoramic views from the summit.',
    address: 'Crowders Mountain State Park, Kings Mountain, NC',
    lat: 35.2131,
    lon: -81.2947,
    rating: 4.7,
    website: 'https://www.ncparks.gov/crowders-mountain-state-park',
    phone: '704-555-0123',
    hours: 'Daily: 8AM-8PM (Summer), 8AM-6PM (Winter)',
    amenities: ['Parking Lot', 'Trail Maps', 'Restrooms', 'Picnic Areas'],
    images: ['/assets/crowders-mountain.jpg']
  },
  {
    id: 'camping-1',
    name: 'Lake Norman State Park',
    category: 'camping',
    description: 'Vehicle-accessible camping with lakefront views and boat launch.',
    address: '759 State Park Road, Troutman, NC 28166',
    lat: 35.6726,
    lon: -80.9382,
    rating: 4.5,
    website: 'https://www.ncparks.gov/lake-norman-state-park',
    phone: '704-555-9876',
    hours: 'Open Year-Round',
    amenities: ['RV Sites', 'Tent Sites', 'Boat Ramp', 'Showers', 'Fire Rings'],
    images: ['/assets/lake-norman.jpg']
  },
  {
    id: 'fishing-1',
    name: 'Mountain Island Lake',
    category: 'fishing',
    description: 'Popular fishing spot with parking for vehicles and boat launch.',
    address: 'Mountain Island Lake, Charlotte, NC',
    lat: 35.3593,
    lon: -80.9414,
    rating: 4.4,
    website: 'https://www.charlottenc.gov/Parks-Recreation',
    amenities: ['Parking', 'Boat Ramp', 'Fishing Pier', 'Picnic Tables'],
    images: ['/assets/mountain-island-lake.jpg']
  },
  {
    id: 'restrooms-1',
    name: 'QT Clean Restrooms',
    category: 'restrooms',
    description: 'Well-maintained, clean restrooms with spacious parking for all vehicles.',
    address: '123 Highway 73, Concord, NC 28027',
    lat: 35.3906,
    lon: -80.7086,
    rating: 4.8,
    hours: 'Open 24/7',
    amenities: ['Clean Facilities', 'Large Parking Area', 'Security', 'Well-Lit'],
    images: ['/assets/qt-restrooms.jpg']
  },
  {
    id: 'rv_stations-1',
    name: 'Whispering Pines RV Resort',
    category: 'rv_stations',
    description: 'Premium RV resort with full hookups, luxury amenities, and scenic views.',
    address: '2345 Pine Road, Mooresville, NC 28117',
    lat: 35.5846,
    lon: -80.8201,
    rating: 4.8,
    website: 'https://www.whisperingpinesrv.com',
    phone: '704-555-8765',
    hours: 'Office: 8AM-8PM daily, Gates open 24/7 for registered guests',
    amenities: ['50/30/20 Amp Service', 'Full Water & Sewer', 'Wi-Fi', 'Cable TV', 'Laundry', 'Showers', 'Pool', 'Dog Park'],
    images: ['/assets/rv-resort.jpg']
  },
  {
    id: 'rv_dump_stations-1',
    name: 'Charlotte Motor Speedway Dump Station',
    category: 'rv_dump_stations',
    description: 'Clean dump station with easy access for RVs of all sizes.',
    address: '5555 Concord Parkway South, Concord, NC 28027',
    lat: 35.3506,
    lon: -80.6826,
    rating: 4.5,
    website: 'https://www.charlottemotorspeedway.com',
    phone: '704-555-1212',
    hours: '7AM-9PM daily',
    amenities: ['Fresh Water Available', 'Easy Pull-Through Access', 'Non-Potable Water Rinse', 'Dump Fee: $10'],
    images: ['/assets/dump-station.jpg']
  },
  {
    id: 'waste_services-1',
    name: 'EcoWaste Recycling Center',
    category: 'waste_services',
    description: 'Environmentally friendly waste disposal and recycling center that accepts all types of RV and automotive waste.',
    address: '8765 Green Valley Road, Charlotte, NC 28214',
    lat: 35.2417,
    lon: -80.9656,
    rating: 4.6,
    website: 'https://www.ecowastecharlotte.com',
    phone: '704-555-3434',
    hours: 'Mon-Sat: 7AM-7PM, Sun: 9AM-5PM',
    amenities: ['Free Recycling', 'Oil Disposal', 'Battery Recycling', 'Tire Disposal', 'Hazardous Waste Acceptance', 'Large Vehicle Access'],
    images: ['/assets/recycling-center.jpg']
  }
];

interface PointsOfInterestExplorerProps {
  latitude?: number;
  longitude?: number;
  onSelectPOI?: (poi: POI) => void;
  routeId?: string;
}

const PointsOfInterestExplorer: React.FC<PointsOfInterestExplorerProps> = ({ 
  latitude, 
  longitude, 
  onSelectPOI,
  routeId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<POICategory | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // Filter POIs by category and search text
  const filteredPOIs = SAMPLE_POIS.filter(poi => {
    const matchesCategory = selectedCategory ? poi.category === selectedCategory : true;
    const matchesSearch = searchText ? 
      poi.name.toLowerCase().includes(searchText.toLowerCase()) || 
      poi.description.toLowerCase().includes(searchText.toLowerCase()) :
      true;
    
    return matchesCategory && matchesSearch;
  });
  
  // Calculate distance from current location if provided
  const enrichedPOIs = filteredPOIs.map(poi => {
    if (latitude && longitude) {
      const distance = calculateDistance(latitude, longitude, poi.lat, poi.lon);
      return { ...poi, distance };
    }
    return poi;
  });
  
  // Simple distance calculation using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-4 bg-gray-900/50 border-b border-gray-800">
        <h2 className="text-blue-400 font-orbitron text-lg mb-4">Points of Interest Explorer</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search for landmarks, services, or destinations..."
            className="w-full bg-black text-white p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-10"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === null 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          
          {POI_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                selectedCategory === category.id
                  ? `bg-blue-500 text-white`
                  : `bg-gray-800 text-gray-300 hover:bg-gray-700`
              }`}
            >
              <span className={category.color}>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* POI List */}
      <div className="overflow-y-auto max-h-96 p-4">
        {enrichedPOIs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrichedPOIs.map(poi => {
              const poiCategory = POI_CATEGORIES.find(cat => cat.id === poi.category);
              
              return (
                <div 
                  key={poi.id}
                  onClick={() => onSelectPOI && onSelectPOI(poi)}
                  className="bg-black/30 rounded-lg border border-gray-800 p-4 hover:border-gray-600 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-full bg-gray-800 ${poiCategory?.color}`}>
                      {poiCategory?.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{poi.name}</h3>
                      <p className="text-gray-400 text-sm">{poi.description}</p>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {poi.address && (
                          <div className="flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>{poi.address}</span>
                          </div>
                        )}
                        
                        {poi.distance !== undefined && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Route className="w-3 h-3" />
                            <span>{poi.distance} miles away</span>
                          </div>
                        )}
                        
                        {poi.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.floor(poi.rating!) ? "text-yellow-500" : "text-gray-700"}>★</span>
                              ))}
                            </div>
                            <span className="text-gray-400">{poi.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      {poi.amenities && poi.amenities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {poi.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                          {poi.amenities.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                              +{poi.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No points of interest found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSearchText('');
              }}
              className="mt-2 text-blue-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsOfInterestExplorer;