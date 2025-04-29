import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Luxury timepiece and vehicle listings - this would be connected to a real database in production
const initialListings = [
  // Premium Luxury Timepieces
  {
    id: 'watch-1',
    type: 'timepiece',
    brand: 'Patek Philippe',
    model: 'Nautilus',
    reference: '5711/1A-014',
    year: 2021,
    price: 175000,
    currency: 'USD',
    condition: 'New',
    description: 'Olive green dial, stainless steel case and bracelet, extremely rare and highly sought after. Final production year model of the iconic 5711 line.',
    serialNumber: 'PP78224591',
    movement: 'Caliber 26-330 S C',
    materials: 'Stainless Steel',
    diameter: '40mm',
    thickness: '8.3mm',
    waterResistance: '120m',
    boxPapers: true,
    location: 'New York, NY',
    seller: 'Authorized Dealer',
    sellerRating: 4.9,
    images: ['nautilus-green.jpg'],
    featured: true,
    dateAdded: '2025-04-15',
    sold: false,
    rarity: 'Ultra Rare'
  },
  {
    id: 'watch-2',
    type: 'timepiece',
    brand: 'Rolex',
    model: 'Daytona',
    reference: '116500LN',
    year: 2024,
    price: 45000,
    currency: 'USD',
    condition: 'New',
    description: 'White dial, Cerachrom bezel, stainless steel case and Oyster bracelet. Includes full box and papers with warranty card.',
    serialNumber: 'RLX287661234',
    movement: 'Caliber 4130',
    materials: 'Oystersteel',
    diameter: '40mm',
    thickness: '12.5mm',
    waterResistance: '100m',
    boxPapers: true,
    location: 'Miami, FL',
    seller: 'GoTime Brokerage',
    sellerRating: 5.0,
    images: ['daytona-white.jpg'],
    featured: true,
    dateAdded: '2025-04-20',
    sold: false,
    rarity: 'Rare'
  },
  {
    id: 'watch-3',
    type: 'timepiece',
    brand: 'Audemars Piguet',
    model: 'Royal Oak',
    reference: '15202ST',
    year: 2023,
    price: 112000,
    currency: 'USD',
    condition: 'New',
    description: 'Blue dial, stainless steel case and bracelet. The iconic "Jumbo" Royal Oak with the ultra-thin movement and perfect proportions.',
    serialNumber: 'AP20231254',
    movement: 'Caliber 7121',
    materials: 'Stainless Steel',
    diameter: '39mm',
    thickness: '8.1mm',
    waterResistance: '50m',
    boxPapers: true,
    location: 'Beverly Hills, CA',
    seller: 'Paddock20 Premium',
    sellerRating: 4.9,
    images: ['royal-oak-blue.jpg'],
    featured: true,
    dateAdded: '2025-04-12',
    sold: false,
    rarity: 'Very Rare'
  },
  {
    id: 'watch-4',
    type: 'timepiece',
    brand: 'F.P. Journe',
    model: 'Chronomètre Bleu',
    reference: 'CB',
    year: 2022,
    price: 95000,
    currency: 'USD',
    condition: 'Excellent',
    description: 'Tantalum case with stunning blue dial. In-house movement with 18k rose gold plates and bridges. One of the most desirable independent watchmaker pieces.',
    serialNumber: 'FPJ-324-BL',
    movement: 'Caliber 1304',
    materials: 'Tantalum',
    diameter: '39mm',
    thickness: '8.6mm',
    waterResistance: '30m',
    boxPapers: true,
    location: 'Chicago, IL',
    seller: 'Private Collection',
    sellerRating: 4.7,
    images: ['fpj-bleu.jpg'],
    featured: false,
    dateAdded: '2025-03-22',
    sold: false,
    rarity: 'Extremely Rare'
  },
  {
    id: 'watch-5',
    type: 'timepiece',
    brand: 'Richard Mille',
    model: 'RM 35-02 Rafael Nadal',
    reference: 'RM35-02',
    year: 2021,
    price: 365000,
    currency: 'USD',
    condition: 'Excellent',
    description: 'NTPT Carbon case with vibrant red accents. Automatic winding movement with red baseplate. Extremely lightweight and comfortable wear.',
    serialNumber: 'RM2134557',
    movement: 'RMAL1',
    materials: 'NTPT Carbon, Titanium',
    diameter: '44.5mm',
    thickness: '13.15mm',
    waterResistance: '50m',
    boxPapers: true,
    location: 'Dallas, TX',
    seller: 'Elite Timepieces',
    sellerRating: 4.9,
    images: ['rm-nadal.jpg'],
    featured: true,
    dateAdded: '2025-03-05',
    sold: false,
    rarity: 'Ultra Rare'
  },
  {
    id: 'watch-6',
    type: 'timepiece',
    brand: 'A. Lange & Söhne',
    model: 'Zeitwerk',
    reference: '140.029',
    year: 2024,
    price: 88000,
    currency: 'USD',
    condition: 'New',
    description: 'Platinum case with digital hour and minute display. Patented constant-force escapement. Mechanical masterpiece with perfect legibility.',
    serialNumber: 'AL240365',
    movement: 'Caliber L043.1',
    materials: 'Platinum',
    diameter: '41.9mm',
    thickness: '12.6mm',
    waterResistance: '30m',
    boxPapers: true,
    location: 'Aspen, CO',
    seller: 'Paddock20 Premium',
    sellerRating: 5.0,
    images: ['lange-zeitwerk.jpg'],
    featured: false,
    dateAdded: '2025-01-15',
    sold: false,
    rarity: 'Rare'
  },
  
  // Exotic Luxury Vehicles
  {
    id: 'car-1',
    type: 'vehicle',
    brand: 'Lamborghini',
    model: 'Gallardo LP570-4 Superleggera',
    year: 2013,
    price: 182995,
    currency: 'USD',
    mileage: 9780,
    condition: 'Excellent',
    description: 'Superleggera Bianco Monocerus exterior with Rosso Red/Nero Black Alcantara interior. Carbon fiber interior package, E-gear transmission, carbon-ceramic brakes, Superleggera rear wing, and front lift system. Transparent engine cover displays the immaculate V10 engine. Factory sport sound system. Complete service history including recent major service.',
    vin: 'ZHWGU22T78LA07255',
    engineType: '5.2L V10',
    displacement: 5204, // cc
    engineLayout: 'Mid-engine',
    cylinderConfig: 'V10 at 90°',
    valvetrain: 'DOHC, 4 valves per cylinder',
    fuelDelivery: 'Multi-point fuel injection',
    horsePower: 570,
    peakPowerRPM: 8000,
    torque: 398,
    peakTorqueRPM: 6500,
    compression: '12.5:1',
    redline: 8500, // RPM
    topSpeed: 202, // mph
    acceleration: 3.4, // 0-60 mph in seconds
    transmission: '6-speed E-Gear automated manual',
    transmissionDetails: 'Electronically controlled with paddle shifters',
    numberOfGears: 6,
    drivetrain: 'All-wheel drive (AWD)',
    powerDistribution: '30/70 front/rear bias',
    exteriorColor: 'Bianco Monocerus',
    interiorColor: 'Rosso Red/Nero Black Alcantara',
    weight: 2954, // lbs - Superleggera was 220 lbs lighter than standard Gallardo
    weightDistribution: '43/57', // front/rear
    wheels: '19" forged aluminum alloy',
    frontWheels: '19 x 8.5J',
    rearWheels: '19 x 11J',
    tires: 'Pirelli P Zero Corsa',
    frontTires: '235/35 ZR19',
    rearTires: '295/30 ZR19',
    brakes: 'Carbon Ceramic',
    fuelEconomy: '12/20', // city/highway
    productionCount: 618, // Superleggera production total
    valueHistory: [
      { year: 2018, value: 140000 },
      { year: 2019, value: 145000 },
      { year: 2020, value: 149000 },
      { year: 2021, value: 156000 },
      { year: 2022, value: 162000 },
      { year: 2023, value: 165000 },
      { year: 2024, value: 168000 },
      { year: 2025, value: 169500 }
    ],
    marketTrend: 'Rising',
    marketDemand: 'High',
    appreciationRate: 3.2, // annual percentage
    rarity: 'Rare - Limited Production',
    collectorInterest: 'Very High',
    maintenanceRecords: [
      { date: '2019-02-15', service: 'Major service', mileage: 9650, cost: 4500 },
      { date: '2021-03-22', service: 'Timing belt replacement', mileage: 11200, cost: 5800 },
      { date: '2023-04-10', service: 'E-gear clutch service', mileage: 12500, cost: 3900 }
    ],
    trackData: {
      lapTimes: [
        { track: 'Laguna Seca', time: '1:40.2' },
        { track: 'Road America', time: '2:28.5' },
        { track: 'Willow Springs', time: '1:25.8' }
      ],
      performance: {
        corneringG: 1.05,
        braking60to0: 110, // feet
        quarterMile: { time: 11.7, speed: 120 } // seconds, mph
      }
    },
    aerodynamics: {
      dragCoefficient: 0.36,
      downforce: 'Medium',
      activeAero: false,
      frontSplitter: true,
      rearDiffuser: true,
      rearWing: 'Fixed carbon fiber wing',
      underfloorAero: 'Smooth underbody with rear venturi tunnels',
      cooling: 'Enhanced cooling for engine and brakes',
      airIntakes: ['Front brake cooling ducts', 'Side engine intakes', 'Roof scoop']
    },
    chassis: {
      type: 'Aluminum space frame with carbon fiber components',
      frontSuspension: 'Double wishbone with aluminum arms',
      rearSuspension: 'Double wishbone with aluminum arms',
      adjustableDampers: true,
      antiRollBars: 'Front and rear, adjustable',
      steeringSystem: 'Hydraulic power-assisted rack and pinion',
      steeringRatio: 16.1
    },
    dimensions: {
      length: 4386, // mm
      width: 1900, // mm
      height: 1165, // mm
      wheelbase: 2560, // mm
      frontTrack: 1632, // mm
      rearTrack: 1597, // mm
      groundClearance: 108, // mm
      fuelCapacity: 90, // liters
      cargoSpace: 110 // liters
    },
    location: 'San Diego, CA',
    seller: 'Paddock20 Premium',
    sellerRating: 4.9,
    images: ['gallardo-superleggera.jpg'],
    featured: true,
    dateAdded: '2025-04-18',
    sold: false
  },
  {
    id: 'car-2',
    type: 'vehicle',
    brand: 'Ferrari',
    model: '458 Italia',
    year: 2014,
    price: 219000,
    currency: 'USD',
    mileage: 8750,
    condition: 'Excellent',
    description: 'Rosso Corsa, tan interior, carbon fiber accents, recently serviced, 1 owner, complete service history. Clean CarFax report available.',
    vin: 'ZFF67NFA4E0198495',
    engineType: '4.5L V8',
    horsePower: 562,
    torque: 398,
    compression: '12.5:1',
    topSpeed: 202,
    acceleration: 3.0, // 0-60 mph in seconds
    transmission: 'Dual-clutch automatic',
    drivetrain: 'RWD',
    exteriorColor: 'Rosso Corsa',
    interiorColor: 'Tan Leather',
    weight: 3450, // lbs
    weightDistribution: '42/58', // front/rear
    wheels: '20" forged',
    tires: 'Pirelli P Zero',
    brakes: 'Carbon Ceramic',
    fuelEconomy: '13/17', // city/highway
    productionCount: 15000,
    valueHistory: [
      { year: 2020, value: 175000 },
      { year: 2021, value: 190000 },
      { year: 2022, value: 198000 },
      { year: 2023, value: 210000 },
      { year: 2024, value: 215000 },
      { year: 2025, value: 219000 }
    ],
    marketTrend: 'Rising',
    marketDemand: 'High',
    appreciationRate: 4.6, // annual percentage
    rarity: 'Modern Classic',
    collectorInterest: 'Very High',
    maintenanceRecords: [
      { date: '2022-05-12', service: 'Annual maintenance', mileage: 7200, cost: 2800 },
      { date: '2023-06-18', service: 'Brake fluid flush', mileage: 7900, cost: 950 },
      { date: '2024-04-30', service: 'Full service', mileage: 8600, cost: 3200 }
    ],
    trackData: {
      lapTimes: [
        { track: 'Laguna Seca', time: '1:38.9' },
        { track: 'Circuit of the Americas', time: '2:06.3' },
        { track: 'Nürburgring', time: '7:32.9' }
      ],
      performance: {
        corneringG: 1.1,
        braking60to0: 105, // feet
        quarterMile: { time: 11.2, speed: 125 } // seconds, mph
      }
    },
    location: 'Los Angeles, CA',
    seller: 'Paddock20 Premium',
    sellerRating: 4.8,
    images: ['ferrari-458.jpg'],
    featured: true,
    dateAdded: '2025-04-10',
    sold: false
  },
  {
    id: 'car-2',
    type: 'vehicle',
    brand: 'Lamborghini',
    model: 'Aventador SVJ',
    year: 2020,
    price: 695000,
    currency: 'USD',
    mileage: 2100,
    condition: 'Mint',
    description: 'Verde Mantis, black alcantara interior with contrast stitching, front lift system, carbon ceramic brakes, Lamborghini telemetry system. 1 of 900 produced worldwide.',
    vin: 'ZHWUN4ZD9LLA14358',
    engineType: '6.5L V12',
    horsePower: 770,
    torque: 531,
    compression: '11.8:1',
    topSpeed: 217,
    acceleration: 2.8, // 0-60 mph in seconds
    transmission: '7-speed automated manual',
    drivetrain: 'AWD',
    exteriorColor: 'Verde Mantis',
    interiorColor: 'Black Alcantara',
    weight: 3472, // lbs
    weightDistribution: '43/57', // front/rear
    wheels: '20" front, 21" rear forged',
    tires: 'Pirelli P Zero Corsa',
    brakes: 'Carbon Ceramic',
    fuelEconomy: '8/13', // city/highway
    productionCount: 900,
    valueHistory: [
      { year: 2020, value: 625000 },
      { year: 2021, value: 650000 },
      { year: 2022, value: 670000 },
      { year: 2023, value: 685000 },
      { year: 2024, value: 690000 },
      { year: 2025, value: 695000 }
    ],
    marketTrend: 'Stable',
    marketDemand: 'Very High',
    appreciationRate: 2.3, // annual percentage
    rarity: 'Ultra Rare',
    collectorInterest: 'Extremely High',
    maintenanceRecords: [
      { date: '2021-03-15', service: 'First annual service', mileage: 890, cost: 4500 },
      { date: '2022-04-22', service: 'Second annual service', mileage: 1450, cost: 3800 },
      { date: '2023-05-10', service: 'Third annual service', mileage: 1900, cost: 4200 }
    ],
    trackData: {
      lapTimes: [
        { track: 'Nürburgring', time: '6:44.97' },
        { track: 'Laguna Seca', time: '1:28.6' },
        { track: 'Spa-Francorchamps', time: '2:23.2' }
      ],
      performance: {
        corneringG: 1.4,
        braking60to0: 98, // feet
        quarterMile: { time: 10.3, speed: 136 } // seconds, mph
      }
    },
    aerodynamics: {
      dragCoefficient: 0.39,
      downforce: 'High',
      activeAero: true
    },
    location: 'Miami, FL',
    seller: 'Elite Exotics',
    sellerRating: 4.9,
    images: ['lamborghini-svj.jpg'],
    featured: true,
    dateAdded: '2025-04-05',
    sold: false
  },
  {
    id: 'car-3',
    type: 'vehicle',
    brand: 'Porsche',
    model: '911 GT3',
    year: 2022,
    price: 245000,
    currency: 'USD',
    mileage: 5600,
    condition: 'Excellent',
    description: 'Shark Blue with Black/Shark Blue interior, Weissach package, carbon fiber roof, magnesium wheels, front axle lift, full PPF protection, ceramic coating.',
    vin: 'WP0AF2A97NS229531',
    engineType: '4.0L Flat-6',
    horsePower: 502,
    transmission: '6-speed manual',
    drivetrain: 'RWD',
    exteriorColor: 'Shark Blue',
    interiorColor: 'Black/Blue Leather',
    location: 'Scottsdale, AZ',
    seller: 'Paddock20 Premium',
    sellerRating: 5.0,
    images: ['porsche-gt3.jpg'],
    featured: true,
    dateAdded: '2025-03-20',
    sold: false
  },
  {
    id: 'car-4',
    type: 'vehicle',
    brand: 'McLaren',
    model: '765LT',
    year: 2021,
    price: 410000,
    currency: 'USD',
    mileage: 3250,
    condition: 'Excellent',
    description: 'Volcano Orange with Black Alcantara interior, MSO Defined carbon fiber exterior package, Senna seats, McLaren Track Telemetry with cameras, Bower & Wilkins audio system.',
    vin: 'SBM13PAC4MW836125',
    engineType: '4.0L Twin-Turbo V8',
    horsePower: 755,
    transmission: '7-speed dual-clutch',
    drivetrain: 'RWD',
    exteriorColor: 'Volcano Orange',
    interiorColor: 'Black Alcantara',
    location: 'Greenwich, CT',
    seller: 'Exclusive Motoring',
    sellerRating: 4.8,
    images: ['mclaren-765lt.jpg'],
    featured: false,
    dateAdded: '2025-02-15',
    sold: false
  },
  {
    id: 'car-5',
    type: 'vehicle',
    brand: 'Mercedes-Benz',
    model: 'AMG GT Black Series',
    year: 2023,
    price: 525000,
    currency: 'USD',
    mileage: 1200,
    condition: 'New',
    description: 'AMG Magma Beam with black interior, AMG Track Package, ceramic composite brakes, 9-stage traction control, aerodynamics package, AMG Performance seats.',
    vin: 'WDDYJ7KA4NA012458',
    engineType: '4.0L Flat-plane V8',
    horsePower: 720,
    transmission: '7-speed dual-clutch',
    drivetrain: 'RWD',
    exteriorColor: 'AMG Magma Beam',
    interiorColor: 'Black Nappa/Microfiber',
    location: 'Newport Beach, CA',
    seller: 'Paddock20 Premium',
    sellerRating: 5.0,
    images: ['mercedes-gt-black.jpg'],
    featured: true,
    dateAdded: '2025-04-01',
    sold: false
  },
  {
    id: 'car-6',
    type: 'vehicle',
    brand: 'Bugatti',
    model: 'Chiron',
    year: 2019,
    price: 3250000,
    currency: 'USD',
    mileage: 760,
    condition: 'Mint',
    description: 'French Racing Blue with cream interior, carbon fiber exterior package, Sky View glass roof, comfort seats, Bugatti telemetry system, full service history.',
    vin: 'VF9SP3V3XKM795012',
    engineType: '8.0L Quad-Turbo W16',
    horsePower: 1479,
    transmission: '7-speed dual-clutch',
    drivetrain: 'AWD',
    exteriorColor: 'French Racing Blue',
    interiorColor: 'Cream Leather',
    location: 'Beverly Hills, CA',
    seller: 'Ultra Exotics',
    sellerRating: 4.9,
    images: ['bugatti-chiron.jpg'],
    featured: true,
    dateAdded: '2024-12-15',
    sold: false
  }
];

// Create a store for marketplace listings
export const useMarketplaceStore = create(
  persist(
    (set, get) => ({
      listings: initialListings,
      isAdmin: false, // By default, users are not admins
      
      // Set admin status (in a real app, this would be determined by authentication)
      setAdminStatus: (status) => set({ isAdmin: status }),
      
      // Add a new listing (admin only)
      addListing: (listing) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can add listings");
          return false;
        }
        
        const newListing = {
          ...listing,
          id: `${listing.type}-${Date.now()}`,
          dateAdded: new Date().toISOString().split('T')[0],
          sold: false
        };
        
        set((state) => ({
          listings: [...state.listings, newListing]
        }));
        
        return true;
      },
      
      // Update a listing (admin only)
      updateListing: (id, updatedData) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can update listings");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.map(listing => 
            listing.id === id ? { ...listing, ...updatedData } : listing
          )
        }));
        
        return true;
      },
      
      // Remove a listing (admin only)
      removeListing: (id) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can remove listings");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.filter(listing => listing.id !== id)
        }));
        
        return true;
      },
      
      // Mark a listing as sold (admin only)
      markAsSold: (id) => {
        if (!get().isAdmin) {
          console.error("Permission denied: Only admins can mark listings as sold");
          return false;
        }
        
        set((state) => ({
          listings: state.listings.map(listing => 
            listing.id === id ? { ...listing, sold: true } : listing
          )
        }));
        
        return true;
      },
      
      // Get listings filtered by type
      getListingsByType: (type) => {
        return get().listings.filter(listing => listing.type === type && !listing.sold);
      },
      
      // Get a single listing by ID
      getListingById: (id) => {
        return get().listings.find(listing => listing.id === id);
      },
      
      // Get featured listings
      getFeaturedListings: () => {
        return get().listings.filter(listing => listing.featured && !listing.sold);
      }
    }),
    {
      name: 'marketplace-storage', // Name for localStorage
      getStorage: () => localStorage // Use localStorage for persistence
    }
  )
);

export default {
  useMarketplaceStore
};