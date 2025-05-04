import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import WeatherStation from '../components/WeatherStation';
import WorldClockPanel from '../components/WorldClockPanel';
import APIDebugger from '../components/APIDebugger';
import supabase from '../services/supabaseClient';
import { 
  Calendar, BarChart3, Car, Map, Settings, Bell, Shield, ChevronRight, 
  MessageSquare, HeartHandshake, Star, EyeOff, Gauge, ClipboardCheck, 
  Wrench, Award, Trophy, FileText, Activity, Clock, User, 
  Cloud, Brain, BookMarked, SprayCan, Check, CheckCircle
} from 'lucide-react';

interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: 'drive' | 'maintenance' | 'event' | 'track';
  description?: string;
}

interface RecentDrive {
  id: number;
  date: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  vehicle?: string;
}

interface MaintenanceAlert {
  id: number;
  vehicle: string;
  serviceDue: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  mileage?: number;
}

interface UserPreference {
  key: string;
  value: any;
}

function DashboardPage() {
  const [userName, setUserName] = useState<string>('gavingotime');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('2020 BMW 330i xDrive');
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentDrives, setRecentDrives] = useState<RecentDrive[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<string[]>([
    'weather', 'world_clock', 'vehicles', 'drives', 'events', 'maintenance'
  ]);
  
  // Add uniform section data
  const [uniformData, setUniformData] = useState({
    helmetSize: 'Medium (58-59cm)',
    gloveSize: 'Large',
    shoeSize: '10.5 US'
  });
  
  // Paddock20 membership data
  const [membershipData, setMembershipData] = useState({
    level: 'Platinum',
    since: '2024-02-15',
    points: 2350,
    nextTier: 'Diamond',
    pointsToNextTier: 650,
    exclusiveEvents: 8,
    trackDaysRemaining: 4,
    benefits: [
      'Unlimited Access to Paddock20 Venues',
      'Priority Registration for Race Experiences',
      'Complimentary Vehicle Transport',
      'Exclusive Driving Coach Sessions',
      'VIP Garage Access at Motorsport Events'
    ]
  });
  
  // Dreams and preferences data
  const [dreamData, setDreamData] = useState({
    favoriteRacetracks: ['Laguna Seca', 'Nürburgring', 'Circuit of the Americas'],
    dreamDrives: ['Pacific Coast Highway', 'Stelvio Pass', 'Tail of the Dragon'],
    dreamCar: 'Ferrari 488 Pista',
    dreamMotorcycle: 'Ducati Panigale V4',
    dreamTruck: 'Ford F-150 Raptor',
    dreamHouse: 'Modern mountain home with 6-car garage',
    dreamRetirementLocation: 'Lake Como, Italy',
    dreamGarageSetup: 'Climate-controlled 10+ car showroom with lift and detailing bay',
    dreamExperience: 'Drive a Formula 1 car at Monaco Grand Prix',
    dreamVacation: 'Supercar tour through the Alps with track days',
    dreamRacetrackToOwn: 'Private 2-mile track with elevation changes and technical sections',
    favoriteCarPart: 'The engine - heart and soul of the driving experience',
    favoriteCarActivity: 'Track days with data analysis and driver coaching',
    favoriteCarTVShow: 'Top Gear (Classic era with Clarkson, Hammond, and May)',
    // Top 5 lists
    topYouTubeChannels: [
      'Hagerty',
      'TheSmokingTire',
      'DriveTribe',
      'SavageGeese',
      'Engineering Explained'
    ],
    topIGEnthusiasts: [
      'Larry Chen (@larry_chen_foto)',
      'Amy Shore (@amyshorephotography)',
      'Magnus Walker (@magnuswalker)',
      'Alex Choi (@alexchoi)',
      'DDE (@dailydrivenexotics)'
    ],
    topCarPodcasts: [
      'The Smoking Tire',
      'Car Talk',
      'The Drive',
      'Spike\'s Car Radio',
      'Everyday Driver'
    ],
    topCarAudiobooks: [
      'Go Like Hell: Ford, Ferrari, and Their Battle for Speed and Glory at Le Mans',
      'Faster: How a Jewish Driver, an American Heiress, and a Legendary Car Beat Hitler\'s Best',
      'Drive: The Surprising Truth About What Motivates Us',
      'The Art of Racing in the Rain',
      'Ford GT: How Ford Silenced the Critics'
    ],
    topSports: [
      'Formula 1',
      'Rally racing',
      'Endurance racing'
    ],
    topRaceCarEventClasses: [
      'GT3',
      'LMP2/LMDh',
      'Formula 4/3/2'
    ],
    favoritePlaylists: [
      'Track Day Intensity',
      'Sunday Cruising',
      'Garage Time',
      'Night Drives',
      'German Engineering Appreciation'
    ],
    favoriteCarBrands: [
      'BMW',
      'Porsche',
      'Ferrari',
      'Aston Martin',
      'McLaren'
    ],
    favoriteModBrands: [
      'Dinan',
      'APR',
      'Akrapovič',
      'KW Suspension',
      'HRE Wheels'
    ],
    favoriteTireBrands: [
      'Michelin',
      'Pirelli',
      'Bridgestone',
      'Continental',
      'Yokohama'
    ],
    favoriteWheelBrands: [
      'HRE',
      'BBS',
      'Vossen'
    ],
    favoriteApparelBrands: [
      'Sparco',
      'Alpine Stars',
      'OMP',
      'Puma Motorsport',
      'McLaren F1 Team Store'
    ],
    dreamCarBuilds: [
      {
        title: 'Ultimate E30 M3 Resto-Mod',
        description: 'Full restoration with modern S55 engine swap, carbon fiber body panels, and custom interior',
        budget: 85000,
        timelineMonths: 18,
        mainImage: '/assets/media/dream-builds/e30-m3.jpg',
        parts: ['S55 engine', 'KW Suspension', 'BBS wheels', 'AP Racing brakes', 'Custom roll cage'],
        progress: 0
      },
      {
        title: 'Porsche 911 Safari Build',
        description: 'Off-road ready 911 with lifted suspension, all-terrain tires, and underbody protection',
        budget: 120000,
        timelineMonths: 12,
        mainImage: '/assets/media/dream-builds/911-safari.jpg',
        parts: ['Custom lift kit', 'BFGoodrich KO2 tires', 'Skid plates', 'Integrated winch', 'LED light bars'],
        progress: 0
      },
      {
        title: 'Carbon Fiber Track-Focused GT350R',
        description: 'Fully stripped and caged Shelby GT350R with extensive aero enhancements',
        budget: 95000,
        timelineMonths: 9,
        mainImage: '/assets/media/dream-builds/gt350r-track.jpg',
        parts: ['Aftermarket supercharger', 'Full aero kit', 'Carbon ceramic brakes', 'Sequential transmission', 'Data logging system'],
        progress: 0
      },
      {
        title: 'Classic Land Rover Defender EV Conversion',
        description: 'Vintage Defender rebuilt with modern Tesla powertrain and luxury interior',
        budget: 150000,
        timelineMonths: 24,
        mainImage: '/assets/media/dream-builds/defender-ev.jpg',
        parts: ['Tesla motors and batteries', 'Upgraded cooling system', 'Custom wiring harness', 'Modern dashboard displays', 'Heated leather seats'],
        progress: 0
      },
      {
        title: 'Ferrari F355 Challenge Car',
        description: 'Road-legal F355 Challenge spec with modern reliability upgrades',
        budget: 175000,
        timelineMonths: 30,
        mainImage: '/assets/media/dream-builds/f355-challenge.jpg',
        parts: ['Full engine rebuild', 'Challenge-spec aero kit', 'Roll cage', 'Racing harnesses', 'Modern electronics'],
        progress: 0
      }
    ],
    favoriteHistoricRaces: [
      '1955 Mille Miglia - Stirling Moss & Denis Jenkinson',
      '1966 24 Hours of Le Mans - Ford vs Ferrari',
      '1976 Formula 1 Japanese Grand Prix - Hunt vs Lauda',
      '1992 Monaco Grand Prix - Senna vs Mansell',
      '1998 Belgian Grand Prix - First lap chaos in the rain'
    ],
    favoriteCars: [
      'BMW E46 M3 CSL',
      'Porsche 911 GT3 (991.2)',
      'Ferrari 458 Speciale',
      'McLaren 675LT',
      'Aston Martin V12 Vantage S'
    ],
    favoriteTrucks: [
      'Ford F-150 Raptor',
      'Land Rover Defender 110',
      'Mercedes G63 AMG 6x6',
      'Toyota Land Cruiser FJ40',
      'Rivian R1T'
    ],
    vehicleExperiences: {
      biggestVehicleDriven: 'Mercedes-Benz Actros Heavy-Duty Semi Truck',
      biggestPlanePiloted: 'Cessna 172 Skyhawk (4-seater single-engine)',
      biggestBoatOperated: '42-foot Sea Ray Sundancer yacht',
      snowmobilingExperience: true,
      snowmobilingDetails: 'Guided tour in Yellowstone National Park, 2024',
      jetSkiingExperience: true,
      jetSkiingDetails: 'Sea-Doo GTX Limited 300 in Miami, Summer 2023',
      offRoadExperience: true,
      trackExperience: true,
      trackDays: 26,
      drivingSchools: ['BMW Performance Center', 'Skip Barber Racing School'],
      totalUniqueVehiclesDriven: 87
    },
    drivingPreferences: {
      transmissionPreference: "Manual",
      transmissionThoughts: "There's nothing like the pure engagement and connection of a proper manual transmission on the right car. The ritual of heel-toe downshifting, perfectly matching revs, and being in complete control creates a driving experience that can't be replicated. While DCTs are technically faster and more efficient, the tactile sensation and driver involvement of rowing through gears will always deliver a more rewarding and emotional driving experience, especially on canyon roads or track days.",
      manualMustHaveCars: [
        "Porsche 911 GT3 (6MT)",
        "BMW M2 Competition",
        "Honda Civic Type R",
        "Mazda MX-5 Miata",
        "Aston Martin Vantage AMR"
      ],
      acceptableDCTCars: [
        "Ferrari 458 Speciale",
        "Lamborghini Huracan Performante",
        "Porsche 911 Turbo S",
        "Audi R8 V10 Plus",
        "McLaren 720S"
      ],
      drivetrainPreference: "RWD",
      drivetrainThoughts: "Rear-wheel drive delivers the purest driving experience with perfect balance, superior weight distribution, and the most natural steering feel. While AWD has its merits in adverse conditions or for maximum traction in high-horsepower applications, a well-sorted RWD platform with proper weight distribution and limited-slip differential provides the most engaging and rewarding driver experience. Front-wheel drive, while practical and economical, simply can't match the driving dynamics of a proper rear-drive setup.",
      drivetrainRankings: [
        {
          type: "RWD",
          rating: 9.8,
          bestFor: ["Driver engagement", "Balance", "Natural steering", "Drifting", "Track use"],
          compromises: ["Winter driving", "Wet weather traction"],
          idealExamples: ["BMW M3", "Porsche 911", "Toyota GR86", "Mazda MX-5"]
        },
        {
          type: "AWD",
          rating: 8.4,
          bestFor: ["All-weather capability", "Launch performance", "High-power applications"],
          compromises: ["Added weight", "Understeer tendency", "Fuel economy", "Steering feel"],
          idealExamples: ["Audi RS6", "Porsche 911 Turbo", "BMW M5", "Mercedes-AMG E63 S"]
        },
        {
          type: "FWD",
          rating: 6.5,
          bestFor: ["Packaging efficiency", "Cost effectiveness", "Winter traction"],
          compromises: ["Torque steer", "Handling balance", "Power delivery"],
          idealExamples: ["Honda Civic Type R", "Hyundai Veloster N", "VW Golf GTI"]
        }
      ]
    },
    modificationPhilosophy: {
      preferredApproach: "OEM+",
      philosophyExplanation: "The OEM+ approach respects the manufacturer's engineering while tastefully enhancing the vehicle's character. Factory engineers spend thousands of hours perfecting a car's dynamics and character; wholesale changes rarely improve the overall package. The sweet spot is selecting the best factory-engineered parts from higher trim levels or special editions, adding subtle performance improvements that maintain reliability, and focusing on driver connection enhancements that preserve the original character while addressing specific weaknesses.",
      acceptableMods: [
        "Quality suspension components that maintain proper geometry",
        "Wheels with proper offset and weight considerations", 
        "Exhaust systems that enhance sound without being obnoxious",
        "ECU tunes from reputable sources with proper development",
        "Upgraded braking components from higher trim models",
        "Subtle aesthetic enhancements that complement factory design"
      ],
      unacceptableMods: [
        "Extreme stance or non-functional camber",
        "Suspension setups that compromise handling for aesthetics",
        "Generic eBay performance parts",
        "Overly aggressive engine modifications that sacrifice reliability",
        "Aggressive visual mods that disrupt the original design language"
      ],
      boltOnPhilosophy: "Selective bolt-on modifications can enhance the driving experience without compromising reliability. The key is choosing components that work harmoniously with factory systems, maintaining proper engineering tolerances, and focusing on holistic improvements rather than chasing dyno numbers. Quality intake and exhaust modifications, properly developed ECU tunes, and well-engineered suspension components can elevate a car's character while preserving its fundamental integrity.",
      enginePreference: "Naturally Aspirated",
      enginePhilosophy: "There's a mechanical purity and linear character to naturally aspirated engines that forced induction simply can't replicate. The immediate throttle response, progressive power delivery, and authentic engine sound create a more intimate connection between driver and machine. While turbocharging and supercharging deliver impressive performance metrics, they introduce a layer of complexity and character-altering boost that diminishes the raw, analog driving experience that defines the most engaging sports cars. A high-revving naturally aspirated engine that builds power progressively to a crescendo near redline represents the most rewarding and emotionally satisfying powertrain configuration.",
      idealEngineSoundtrack: "Porsche 911 GT3 (4.0L flat-six at 9,000 RPM)",
      aspirationPreferences: [
        {
          type: "Naturally Aspirated",
          rating: 9.8,
          favoriteExamples: [
            "Porsche 911 GT3 (4.0L flat-six)",
            "Ferrari 458 Speciale (4.5L V8)",
            "Lexus LFA (4.8L V10)",
            "BMW E92 M3 (4.0L V8)",
            "Honda S2000 (2.0L inline-four)"
          ],
          bestQualities: [
            "Linear power delivery",
            "Instantaneous throttle response",
            "Pure mechanical sound",
            "Driving engagement",
            "Mechanical simplicity and reliability"
          ]
        },
        {
          type: "Supercharged",
          rating: 8.2,
          favoriteExamples: [
            "Jaguar F-Type R (5.0L V8)",
            "Ford Mustang Shelby GT500 (5.2L V8)",
            "Chevrolet Corvette ZR1 (6.2L V8)",
            "Range Rover Sport SVR (5.0L V8)"
          ],
          bestQualities: [
            "Immediate boost response",
            "Linear power increase",
            "Preservation of engine character",
            "Distinctive supercharger whine"
          ]
        },
        {
          type: "Turbocharged",
          rating: 7.5,
          favoriteExamples: [
            "McLaren 720S (4.0L V8)",
            "BMW M5 (4.4L V8)",
            "Porsche 911 Turbo S (3.8L flat-six)",
            "Audi RS6 Avant (4.0L V8)"
          ],
          bestQualities: [
            "Mid-range torque",
            "Fuel efficiency potential",
            "Tuning headroom",
            "Exciting boost sensation"
          ],
          compromises: [
            "Throttle response lag",
            "Less linear power delivery",
            "Artificial sound character",
            "Added complexity"
          ]
        }
      ]
    },
    vehicleOpinions: {
      cigaretteBoats: {
        rating: 9.5,
        comments: "Cigarette boats represent the ultimate in marine performance and style. The legendary Miami-built speedboats deliver an unmatched combination of craftsmanship, engineering, and pure adrenaline. The 41' AMG Carbon Edition with twin Mercury Racing engines is my dream boat - that sound and acceleration is incomparable to anything else on water.",
        dreamModel: "Cigarette Racing 41' AMG Carbon Edition",
        ownedBefore: false,
        bucketList: true,
        favoriteBrands: ["Cigarette Racing", "Fountain", "Donzi", "Outerlimits", "MTI"]
      },
      privateJets: {
        rating: 9.8,
        comments: "Nothing compares to the freedom, luxury and efficiency of private aviation. The Gulfstream G650 represents the pinnacle of aircraft engineering with its incredible 7,000+ mile range, 0.925 Mach cruising speed, and magnificent cabin experience. The avionics technology in modern jets is as impressive as the comfort and convenience they provide.",
        dreamModel: "Gulfstream G650ER",
        ownedBefore: false,
        bucketList: true,
        favoriteBrands: ["Gulfstream", "Bombardier", "Dassault Falcon", "Cessna Citation", "Embraer"]
      },
      dailyDrivenTrackCars: {
        rating: 8.7,
        comments: "Daily driving a track-focused car creates an unmatched connection between driver and machine. The compromise is real - stiff suspension on city streets, higher maintenance costs, and cabin noise - but the reward is the smile every time you hit an on-ramp or find an empty backroad. The key is finding the right balance of performance and livability, like a Porsche 911 GT3 Touring or BMW M2 Competition that can deliver thrilling performance on the weekend while still functioning as reliable transportation during the week.",
        currentDaily: "BMW M2 Competition",
        idealBalance: "Porsche 911 GT3 Touring",
        challenges: ["Ride comfort", "Ground clearance", "Fuel economy", "Maintenance costs", "Limited cargo space"],
        benefits: ["Constant engagement", "Performance always available", "Driver skill development", "Appreciation of engineering", "Enthusiast community"]
      }
    },
    dreamVehicleRotation: {
      title: "Perfect 3-Car Rotation Between Residences",
      mainResidence: "Atlanta Metropolitan Area",
      secondaryResidence: "Miami Beach Waterfront Condo",
      vehicles: [
        {
          make: "Porsche",
          model: "911 GT3 Touring",
          year: 2024,
          color: "Gentian Blue Metallic",
          purpose: "Daily driver with track capability",
          modifications: ["Lightweight exhaust", "Custom suspension tune", "Clear PPF protection"],
          notes: "Perfect balance of performance and everyday usability. The analog driving experience with the 6-speed manual transmission connects you to the road in a way that modern automated systems can't replicate."
        },
        {
          make: "Aston Martin",
          model: "DBS Superleggera Volante",
          year: 2023,
          color: "Magnetic Silver",
          purpose: "Grand touring and special occasions",
          modifications: ["Upgraded audio system", "Bespoke interior", "Ceramic coating"],
          notes: "The ultimate grand tourer for long drives along the coast. The combination of a twin-turbo V12, convertible top, and British luxury creates an experience that engages all senses."
        },
        {
          make: "Range Rover",
          model: "Sport Autobiography Dynamic",
          year: 2024,
          color: "Santorini Black",
          purpose: "Winter vehicle and utility",
          modifications: ["Advanced off-road package", "Heated steering wheel", "Premium sound system"],
          notes: "Luxury, capability, and presence in a refined package. Perfect for ski trips to Aspen or navigating through inclement weather with absolute confidence and comfort."
        }
      ],
      rotationStrategy: "Seasonal with the Range Rover in Atlanta during winter months, the DBS primarily in Miami for coastal drives, and the GT3 Touring moving between locations based on track events and driving opportunities."
    },
    carCareAndDetailing: {
      favoriteProducts: [
        {
          name: "Gyeon Q² Ceramic Coating",
          type: "Ceramic coating",
          rating: 10,
          comments: "Revolutionary product that transformed my detailing experience. Nothing compares to the depth, gloss and protection it provides, plus the hydrophobic properties are incredible even after months of use."
        },
        {
          name: "Sonax Perfect Finish",
          type: "Compound/Polish",
          rating: 9.8,
          comments: "The perfect one-step solution that cuts aggressively but finishes down incredibly well, saving hours of work."
        },
        {
          name: "P&S Bead Maker",
          type: "Spray sealant",
          rating: 9.5,
          comments: "Unbelievable gloss enhancement and so easy to apply. The slickness it adds is something you have to feel to believe."
        },
        {
          name: "CarPro IronX",
          type: "Iron decontamination",
          rating: 9.7,
          comments: "Game-changing when it comes to deep cleaning before any paint correction work."
        },
        {
          name: "Optimum No Rinse",
          type: "Rinseless wash",
          rating: 9.6,
          comments: "Revolutionary product that changed how I wash cars, especially in areas with water restrictions."
        }
      ],
      favoriteTools: [
        "Rupes BigFoot LHR15 Mark III Polisher",
        "Metro Vac Air Force Blaster",
        "Scangrip Multimatch 3",
        "Gyeon Smoothie Wash Mitt",
        "The Rag Company Eagle Edgeless Towels"
      ],
      detailingFrequency: "Weekly maintenance, full detail monthly",
      annualCareExpenditures: 3200,
      preferredTechniques: [
        "Two-bucket wash method",
        "Paint decontamination before coating",
        "Section-by-section polishing",
        "Blower drying to avoid water spots",
        "Ceramic coating maintenance with compatible products"
      ]
    },
    gamingPreferences: {
      preferredPlatform: "PlayStation",
      platformHistory: ["PS1", "PS2", "PS3", "PS4", "PS5"],
      favoriteRacingGames: [
        {
          title: "Gran Turismo 7",
          platform: "PlayStation 5",
          yearReleased: 2022,
          hoursPlayed: 342,
          currentlyPlaying: true,
          favoriteAspects: [
            "Physics realism",
            "Car variety",
            "Dynamic weather",
            "Tuning options",
            "Photo mode"
          ],
          comments: "The pinnacle of racing simulation with impressive attention to detail. The physics model is exceptional and the car selection is unmatched. I especially love the dynamic time and weather effects on tracks like the Nürburgring, which make every lap a unique challenge."
        },
        {
          title: "Forza Horizon 5",
          platform: "PC (Windows)",
          yearReleased: 2021,
          hoursPlayed: 208,
          currentlyPlaying: true,
          favoriteAspects: [
            "Open world freedom",
            "Visual fidelity",
            "Car customization",
            "Seasonal changes",
            "Social features"
          ],
          comments: "The perfect balance between arcade fun and simulation elements in an incredible open world. The Mexico map is breathtaking and the freedom to explore while enjoying incredible car physics makes this the ultimate automotive playground."
        },
        {
          title: "Assetto Corsa Competizione",
          platform: "PC (Windows)",
          yearReleased: 2019,
          hoursPlayed: 187,
          currentlyPlaying: true,
          favoriteAspects: [
            "GT3/GT4 realism",
            "Tire model",
            "Force feedback",
            "Audio design",
            "Competitive multiplayer"
          ],
          comments: "The most authentic GT racing experience available. The tire model and force feedback are unmatched, making every corner a technical challenge that rewards precision and consistency. The night racing and rain effects create an immersive experience that truly tests your skills."
        }
      ],
      gamingSetup: {
        display: "Samsung Odyssey G9 49-inch Curved Gaming Monitor",
        controller: "Fanatec GT DD Pro Wheel Base with McLaren GT3 V2 wheel",
        additionalHardware: [
          "Fanatec ClubSport V3 Pedals with performance kit",
          "Fanatec Shifter SQ V1.5",
          "NextLevel Racing GT Track Cockpit",
          "Buttkicker Gamer 2",
          "PlayStation 5 Console",
          "High-end gaming PC (RTX 4080, i9 processor)"
        ],
        totalInvestment: 7500
      }
    }
  });
  
  // Media section data 
  const [mediaLibrary, setMediaLibrary] = useState({
    totalItems: 187,
    categories: [
      {
        name: 'Photos',
        count: 142,
        recentItems: [
          { id: 'p1', title: 'Track day at Road Atlanta', date: '2025-04-15', type: 'image', path: '/assets/media/track-day-1.jpg' },
          { id: 'p2', title: 'Tail of the Dragon run', date: '2025-03-22', type: 'image', path: '/assets/media/dragon-run.jpg' },
          { id: 'p3', title: 'Cars & Coffee meetup', date: '2025-04-02', type: 'image', path: '/assets/media/cars-coffee.jpg' }
        ]
      },
      {
        name: 'Videos',
        count: 28,
        recentItems: [
          { id: 'v1', title: 'Mountain Drive POV', date: '2025-04-18', type: 'video', duration: '12:48', path: '/assets/media/mountain-drive.mp4' },
          { id: 'v2', title: 'Nürburgring Lap', date: '2024-08-10', type: 'video', duration: '9:32', path: '/assets/media/ring-lap.mp4' }
        ]
      },
      {
        name: 'Documents',
        count: 14,
        recentItems: [
          { id: 'd1', title: 'BMW 330i Service Records', date: '2025-04-01', type: 'pdf', path: '/assets/media/service-records.pdf' },
          { id: 'd2', title: 'Track Day Waiver', date: '2025-03-15', type: 'pdf', path: '/assets/media/track-waiver.pdf' }
        ]
      },
      {
        name: 'Voice Notes',
        count: 3,
        recentItems: [
          { id: 'a1', title: 'Track Day Debrief', date: '2025-04-15', type: 'audio', duration: '3:44', path: '/assets/media/track-debrief.mp3' },
          { id: 'a2', title: 'Car Setup Ideas', date: '2025-03-10', type: 'audio', duration: '2:17', path: '/assets/media/car-setup.mp3' }
        ]
      }
    ],
    recentUploads: [
      { id: 'ru1', title: 'BMW at sunset', date: '2025-05-02', type: 'image', path: '/assets/media/bmw-sunset.jpg' },
      { id: 'ru2', title: 'Engine sound sample', date: '2025-05-01', type: 'audio', duration: '0:58', path: '/assets/media/engine-sound.mp3' },
      { id: 'ru3', title: 'Mountain Roads Map', date: '2025-04-29', type: 'pdf', path: '/assets/media/mountain-map.pdf' }
    ],
    favorites: [
      { id: 'f1', title: 'First Track Day', date: '2024-06-12', type: 'video', duration: '15:22', path: '/assets/media/first-track-day.mp4' },
      { id: 'f2', title: 'My Dream Garage', date: '2024-08-05', type: 'image', path: '/assets/media/dream-garage.jpg' }
    ]
  });
  
  // User engagement statistics
  const [engagementData, setEngagementData] = useState({
    totalInputs: 248,
    inputsThisMonth: 42,
    currentStreak: 8,
    longestStreak: 14,
    sections: [
      { 
        name: 'Drive Journal', 
        entries: 37,
        lastUpdated: '2025-05-01',
        percentComplete: 92,
        streakDays: 8
      },
      { 
        name: 'Weather Reports', 
        entries: 64,
        lastUpdated: '2025-05-03',
        percentComplete: 100,
        streakDays: 12
      },
      { 
        name: 'Vehicle Logs', 
        entries: 28,
        lastUpdated: '2025-04-28',
        percentComplete: 75,
        streakDays: 0
      },
      { 
        name: 'Maintenance Records', 
        entries: 19,
        lastUpdated: '2025-04-30',
        percentComplete: 80,
        streakDays: 5
      },
      { 
        name: 'Route Planning', 
        entries: 41,
        lastUpdated: '2025-05-02',
        percentComplete: 88,
        streakDays: 7
      },
      { 
        name: 'Dreams & Goals', 
        entries: 14,
        lastUpdated: '2025-05-03',
        percentComplete: 95,
        streakDays: 9
      },
      { 
        name: 'Profile Completion', 
        entries: 45,
        lastUpdated: '2025-05-03',
        percentComplete: 98,
        streakDays: 14
      }
    ]
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [driveStats, setDriveStats] = useState({
    totalDrives: 12,
    totalDistance: 986,
    averageSpeed: 62,
    favoriteRoute: 'Mountain Curves'
  });
  const [achievementPoints, setAchievementPoints] = useState<number>(785);
  const [notifications, setNotifications] = useState<number>(3);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState<boolean>(true);
  
  // User vehicles
  const userVehicles = [
    { id: 1, name: '2020 BMW 330i xDrive', year: 2020, image: '/assets/bmw-330i.jpg', lastDriven: '1 day ago' },
    { id: 2, name: 'BMW M5 Competition', year: 2023, image: '/assets/bmw-m5.jpg', lastDriven: '2 weeks ago' },
    { id: 3, name: 'Mercedes AMG GT', year: 2022, image: '/assets/amg-gt.jpg', lastDriven: '1 month ago' }
  ];

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      setUpcomingEvents([
        { id: 1, title: 'Mountain Drive', date: '2025-04-30T09:00:00', type: 'drive', description: 'Scenic route through Blue Ridge Mountains' },
        { id: 2, title: 'Track Day at Atlanta Motor Speedway', date: '2025-05-12T10:00:00', type: 'track', description: 'Private event with 10 laps' },
        { id: 3, title: 'Oil Change', date: '2025-05-05T14:00:00', type: 'maintenance', description: 'Audi RS6 Avant' }
      ]);
      
      setRecentDrives([
        { id: 1, date: '2025-04-26', startLocation: 'Roswell, GA', endLocation: 'Asheville, NC', distance: 124.5, duration: 120, vehicle: 'Audi RS6 Avant' },
        { id: 2, date: '2025-04-20', startLocation: 'Roswell, GA', endLocation: 'Savannah, GA', distance: 209.3, duration: 180, vehicle: 'BMW M5 Competition' },
        { id: 3, date: '2025-04-15', startLocation: 'Roswell, GA', endLocation: 'Atlanta, GA', distance: 30.2, duration: 45, vehicle: 'Mercedes AMG GT' }
      ]);
      
      setMaintenanceAlerts([
        { id: 1, vehicle: 'Audi RS6 Avant', serviceDue: 'Oil Change', dueDate: '2025-05-05', priority: 'medium', mileage: 3500 },
        { id: 2, vehicle: 'BMW M5 Competition', serviceDue: 'Brake Fluid Flush', dueDate: '2025-05-10', priority: 'high', mileage: 5000 },
        { id: 3, vehicle: 'Mercedes AMG GT', serviceDue: 'Annual Service', dueDate: '2025-06-15', priority: 'low', mileage: 12000 }
      ]);
    }, 500);
    
    // Get user preferences from localStorage or default values
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      setDashboardLayout(JSON.parse(savedLayout));
    }
  }, []);
  
  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout));
    setIsEditMode(false);
  };
  
  const movePanel = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === dashboardLayout.length - 1)) {
      return;
    }
    
    const newLayout = [...dashboardLayout];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];
    setDashboardLayout(newLayout);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderDashboardPanel = (panelType: string) => {
    switch(panelType) {
      case 'membership':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header flex items-center">
                <Shield className="mr-2 text-green-500" size={20} />
                PADDOCK20 Membership
              </h2>
              <Link to="/member-benefits" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Benefits <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Membership overview card */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-blue-900/40 p-4 relative overflow-hidden">
                {/* F1-style decorative element */}
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-blue-400">{membershipData.level}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-full">
                        Member since {new Date(membershipData.since).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 mb-3">
                      <span className="text-sm text-gray-400">
                        {membershipData.pointsToNextTier} points away from {membershipData.nextTier}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center bg-blue-900/30 px-3 py-1 rounded-md border border-blue-900/50">
                    <Trophy className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-lg font-mono font-bold text-white">{membershipData.points}</span>
                    <span className="ml-1 text-xs text-gray-400">pts</span>
                  </div>
                </div>
                
                <div className="mt-2 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.round((membershipData.points / (membershipData.points + membershipData.pointsToNextTier)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Membership perks grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Exclusive Events
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center mr-3">
                      <span className="text-xl font-bold text-blue-400">{membershipData.exclusiveEvents}</span>
                    </div>
                    <p className="text-gray-300">Invitations to members-only track days, cars & coffee meetups, and pit lane experiences</p>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center">
                    <Map className="h-4 w-4 mr-2" />
                    Track Days
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center mr-3">
                      <span className="text-xl font-bold text-blue-400">{membershipData.trackDaysRemaining}</span>
                    </div>
                    <p className="text-gray-300">Complimentary track days remaining this season. Includes full-day access and instructor time.</p>
                  </div>
                </div>
              </div>
              
              {/* Membership benefits list */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-blue-400 font-bold mb-3">Member Benefits</h3>
                <ul className="space-y-2">
                  {membershipData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="text-green-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'dreams':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Automotive Dreams</h2>
              <Link to="/dreams" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                Edit Dreams <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-blue-400 font-bold mb-2">Favorite Racetracks</h3>
                <div className="flex flex-wrap gap-2">
                  {dreamData.favoriteRacetracks.map((track, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-800 rounded-md text-sm text-gray-200">
                      {track}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                <h3 className="text-blue-400 font-bold mb-2">Dream Drives</h3>
                <div className="flex flex-wrap gap-2">
                  {dreamData.dreamDrives.map((drive, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-800 rounded-md text-sm text-gray-200">
                      {drive}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2">Dream Car</h3>
                  <p className="text-gray-200">{dreamData.dreamCar}</p>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2">Dream Motorcycle</h3>
                  <p className="text-gray-200">{dreamData.dreamMotorcycle}</p>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2">Dream Truck</h3>
                  <p className="text-gray-200">{dreamData.dreamTruck}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2">Dream House</h3>
                  <p className="text-gray-200">{dreamData.dreamHouse}</p>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-blue-400 font-bold mb-2">Dream Retirement Location</h3>
                  <p className="text-gray-200">{dreamData.dreamRetirementLocation}</p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 mt-2">
                <h3 className="text-blue-400 font-bold mb-2">Dream Garage Vault Setup</h3>
                <p className="text-gray-200">{dreamData.dreamGarageSetup}</p>
              </div>
            </div>
          </div>
        );
      
      case 'uniform':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Racing Uniform Sizes</h2>
              <Link to="/driver-equipment" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-all group">
                <div className="h-12 w-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-center text-blue-400 font-bold">Helmet Size</h3>
                <p className="text-center text-gray-200 text-xl mt-2">Medium (58-59cm)</p>
                <p className="text-center text-xs text-gray-500 mt-2">Last updated: Feb 2025</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-all group">
                <div className="h-12 w-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a2.5 2.5 0 115 0v6a2.5 2.5 0 11-5 0zm-4 4h8" />
                  </svg>
                </div>
                <h3 className="text-center text-blue-400 font-bold">Glove Size</h3>
                <p className="text-center text-gray-200 text-xl mt-2">Large</p>
                <p className="text-center text-xs text-gray-500 mt-2">Last updated: Feb 2025</p>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-all group">
                <div className="h-12 w-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-3 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-center text-blue-400 font-bold">Shoe Size</h3>
                <p className="text-center text-gray-200 text-xl mt-2">10.5 US</p>
                <p className="text-center text-xs text-gray-500 mt-2">Last updated: Feb 2025</p>
              </div>
            </div>
          </div>
        );
      
      case 'weather':
        return (
          <div className="block mb-6">
            <WeatherStation />
          </div>
        );
        
      case 'world_clock':
        return (
          <div className="block mb-6">
            <WorldClockPanel />
          </div>
        );
        
      case 'vehicles':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">My Vehicles</h2>
              <Link to="/garage-vault" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userVehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-blue-500 transition-all group">
                  <div className="h-32 bg-gray-800 rounded-md mb-3 overflow-hidden">
                    {/* Placeholder for vehicle image */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <Car size={48} className="text-gray-700" />
                    </div>
                  </div>
                  <h3 className="text-blue-400 font-bold">{vehicle.name}</h3>
                  <p className="text-gray-400 text-sm">{vehicle.year}</p>
                  <p className="text-xs text-gray-500 mt-2">Last driven: {vehicle.lastDriven}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'drives':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Recent Drives</h2>
              <Link to="/drive-journal" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Journal <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-blue-900/30 p-2 mr-3">
                    <Activity size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Drives</p>
                    <p className="text-xl text-white font-bold">{driveStats.totalDrives}</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-green-900/30 p-2 mr-3">
                    <Map size={20} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Miles</p>
                    <p className="text-xl text-white font-bold">{driveStats.totalDistance}</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-orange-900/30 p-2 mr-3">
                    <Gauge size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Avg. Speed</p>
                    <p className="text-xl text-white font-bold">{driveStats.averageSpeed} mph</p>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg flex items-center">
                  <div className="rounded-full bg-purple-900/30 p-2 mr-3">
                    <Trophy size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Favorite Route</p>
                    <p className="text-md text-white font-bold">{driveStats.favoriteRoute}</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-800">
                {recentDrives.map(drive => (
                  <div key={drive.id} className="py-3 hover:bg-gray-900/50 px-3 rounded-lg transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{drive.startLocation} to {drive.endLocation}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar size={12} className="mr-1" />
                          <span className="mr-3">{new Date(drive.date).toLocaleDateString()}</span>
                          <Car size={12} className="mr-1" />
                          <span>{drive.vehicle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-400 font-bold">{drive.distance.toFixed(1)} mi</span>
                        <p className="text-xs text-gray-400">{Math.floor(drive.duration / 60)}h {drive.duration % 60}m</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link to="/route-planner" className="apex-button bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2">
                <Map size={16} />
                <span>Plan New Drive</span>
              </Link>
            </div>
          </div>
        );
        
      case 'events':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Upcoming Events</h2>
              <Link to="/events-page" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View Calendar <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-800">
              {upcomingEvents.map(event => (
                <div key={event.id} className="py-3 px-2 hover:bg-gray-900/50 rounded-lg transition-colors flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 
                    ${event.type === 'drive' ? 'bg-green-900/30' : 
                      event.type === 'maintenance' ? 'bg-orange-900/30' : 
                      event.type === 'track' ? 'bg-red-900/30' : 'bg-blue-900/30'}`}>
                    {event.type === 'drive' && <Map size={18} className="text-green-400" />}
                    {event.type === 'maintenance' && <Wrench size={18} className="text-orange-400" />}
                    {event.type === 'track' && <Activity size={18} className="text-red-400" />}
                    {event.type === 'event' && <Calendar size={18} className="text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{event.title}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">{new Date(event.date).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500">{event.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Link to="/add-event" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Add Event</span>
              </Link>
            </div>
          </div>
        );
        
      case 'maintenance':
        return (
          <div className="apex-card rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="apex-header">Maintenance Alerts</h2>
              <Link to="/maintenance-hub" className="text-green-500 hover:text-green-400 transition-colors flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-800">
              {maintenanceAlerts.map(alert => (
                <div key={alert.id} className="py-3 hover:bg-gray-900/50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className={`w-2 h-full min-h-[40px] rounded-full mr-3
                      ${alert.priority === 'high' ? 'bg-red-500' : 
                        alert.priority === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'}`}>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-white font-medium">{alert.serviceDue}</p>
                        <p className="text-xs text-gray-400">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-400">{alert.vehicle}</p>
                        {alert.mileage && (
                          <p className="text-xs text-gray-500">{alert.mileage.toLocaleString()} miles</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {maintenanceAlerts.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-gray-500">No maintenance alerts</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prevState => !prevState);
  }, []);
  
  const toggleWelcomeMessage = useCallback(() => {
    setShowWelcomeMessage(prevState => !prevState);
  }, []);
  
  const handleVehicleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVehicle(e.target.value);
  }, []);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      {/* F1-inspired carbon fiber background with telemetry grid */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] bg-fixed bg-[size:20px_20px]"></div>
      </div>
      
      {/* Main Dashboard Container */}
      <div className="relative z-10">
        {/* Top Command Bar - Fixed Position */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-black/95 via-gray-900/90 to-black/95 border-b border-blue-500/30 backdrop-blur-md">
          <div className="mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Left: Logo & Branding */}
              <div className="flex items-center">
                <div className="relative mr-3 flex items-center">
                  <img 
                    src="/assets/GTM Logo - Green-White.png" 
                    alt="GoTime Motorsports" 
                    className="h-12 w-auto drop-shadow-[0_0_8px_rgba(8,197,25,0.6)]"
                  />
                  <div className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <h1 className="text-blue-400 font-orbitron text-2xl uppercase font-bold tracking-widest border-b border-blue-500/30 pb-0.5">PADDOCK20</h1>
                    <div className="ml-2 px-1.5 py-0.5 bg-green-500/20 border border-green-500 rounded text-[10px] text-green-400 font-mono tracking-tight">
                      VER 2027.4
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                    <p className="text-xs text-gray-400">
                      <span className="text-green-400 font-medium">gavingotime</span>
                      <span className="mx-1.5 text-gray-600">|</span>
                      <span className="uppercase font-mono tracking-tight">{new Date().toLocaleTimeString('en-US', {hour12: false})}</span>
                      <span className="mx-1.5 text-gray-600">|</span>
                      <span className="text-blue-400">ELITE DRIVER</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right: Controls */}
              <div className="flex items-center gap-3">
                {/* Vehicle Selector */}
                <div className="bg-black/60 border border-gray-800 rounded-lg px-3 py-1.5 hidden md:flex items-center">
                  <Car size={14} className="text-blue-400 mr-2" />
                  <select 
                    value={selectedVehicle}
                    onChange={handleVehicleChange}
                    className="bg-transparent border-none text-white text-sm focus:ring-0 focus:outline-none pr-8 py-0"
                  >
                    <option value="Audi RS6 Avant">Audi RS6 Avant</option>
                    <option value="BMW M5 Competition">BMW M5 Competition</option>
                    <option value="Mercedes AMG GT">Mercedes AMG GT</option>
                  </select>
                </div>
                
                {/* Notifications */}
                <div className="relative group">
                  <button className="relative bg-black/60 border border-gray-800 hover:border-blue-500 p-2 rounded-lg transition-all">
                    <Bell size={18} className="text-blue-400" />
                    {notifications > 0 && (
                      <div className="absolute -top-1 -right-1 flex">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 items-center justify-center text-[8px] text-white font-bold">{notifications}</span>
                        </span>
                      </div>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  <div className="absolute top-full right-0 mt-1 w-80 bg-black/90 border border-blue-500/30 rounded-lg p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-blue-400 font-orbitron text-xs uppercase">System Notifications</h3>
                      <span className="text-xs text-gray-500">Today</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-900/50 rounded border-l-2 border-red-500 hover:bg-gray-900/80 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <Wrench size={14} className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-white font-medium">Maintenance Alert</p>
                              <p className="text-xs text-gray-400">Audi RS6 Avant: Oil Change Due</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500">2h ago</span>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-900/50 rounded border-l-2 border-yellow-500 hover:bg-gray-900/80 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <Cloud size={14} className="text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-white font-medium">Weather Warning</p>
                              <p className="text-xs text-gray-400">Rain expected on planned route</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500">5h ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Edit Mode Toggle */}
                <button 
                  onClick={toggleEditMode} 
                  className={`bg-black/60 border ${isEditMode ? 'border-green-500' : 'border-gray-800 hover:border-blue-500'} p-2 rounded-lg transition-all group`}
                  title={isEditMode ? "Save Layout" : "Edit Dashboard"}
                >
                  <Settings size={18} className={`${isEditMode ? 'text-green-400' : 'text-blue-400'} group-hover:rotate-90 transition-transform duration-300`} />
                </button>
                
                {/* Command Center Menu */}
                <div className="relative group z-50">
                  <button className="bg-black/60 border border-gray-800 hover:border-blue-500 p-2 rounded-lg transition-all">
                    <ChevronRight size={18} className="text-blue-400" />
                  </button>
                  
                  {/* Command Center Dropdown */}
                  <div className="absolute top-full right-0 mt-1 w-72 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-800">
                      <h3 className="text-blue-400 font-orbitron text-xs uppercase mb-1 flex items-center">
                        <Shield className="h-3 w-3 mr-1.5" /> Command Center
                      </h3>
                      <p className="text-[11px] text-gray-400">Access your complete Paddock20 ecosystem</p>
                    </div>
                    
                    <div className="grid grid-cols-2 p-2 gap-1.5">
                      <Link to="/garage-vault" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Car size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Garage Vault</p>
                          <p className="text-[10px] text-gray-500">3 Vehicles</p>
                        </div>
                      </Link>
                      <Link to="/maintenance-hub" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Wrench size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Maintenance</p>
                          <p className="text-[10px] text-gray-500">2 Alerts</p>
                        </div>
                      </Link>
                      <Link to="/" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <SprayCan size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Juice Box</p>
                          <p className="text-[10px] text-gray-500">Detailing</p>
                        </div>
                      </Link>
                      <Link to="/" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Brain size={14} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Manifest</p>
                          <p className="text-[10px] text-gray-500">Build Assistant</p>
                        </div>
                      </Link>
                      <Link to="/drive-journal" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-yellow-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Clock size={14} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Drive Journal</p>
                          <p className="text-[10px] text-gray-500">{driveStats.totalDrives} Drives</p>
                        </div>
                      </Link>
                      <Link to="/playlists" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-yellow-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <MessageSquare size={14} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Playlists</p>
                          <p className="text-[10px] text-gray-500">Media</p>
                        </div>
                      </Link>
                      <Link to="/podium-pursuit" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-purple-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <Trophy size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Podium Pursuit</p>
                          <p className="text-[10px] text-gray-500">{achievementPoints} Points</p>
                        </div>
                      </Link>
                      <Link to="/gallery" className="flex items-center p-2 hover:bg-blue-900/20 rounded group">
                        <div className="w-8 h-8 rounded-full bg-purple-900/20 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                          <BookMarked size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-white">Media Gallery</p>
                          <p className="text-[10px] text-gray-500">Photos & Docs</p>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Account Management */}
                    <div className="border-t border-gray-800 p-2">
                      <div className="p-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-2">
                            <User size={14} className="text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-400">Account Settings</p>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* F1 Telemetry HUD - Top Stats Bar */}
          <div className="bg-black/80 border border-blue-500/20 rounded-lg backdrop-blur-sm p-4 mb-6 relative overflow-hidden">
            {/* F1-style scanline animation */}
            <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-px bg-blue-500/30"></div>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-500/30"></div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-blue-500/30"></div>
              <div className="absolute right-0 top-0 bottom-0 w-px bg-blue-500/30"></div>
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-transparent opacity-30"></div>
            </div>
            
            {/* Telemetry Active Status */}
            {showWelcomeMessage ? (
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-1 bg-blue-500 rounded-full mr-4 animate-pulse"></div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-blue-400 font-orbitron text-lg uppercase tracking-wider">TELEMETRY ACTIVE</h2>
                      <button 
                        onClick={() => setShowWelcomeMessage(false)} 
                        className="ml-3 text-gray-400 hover:text-white"
                        title="Minimize Telemetry"
                      >
                        <EyeOff size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 max-w-2xl">
                      Full system integration active. Driver data synchronized across all Paddock20 modules. Activate individual command modules below or use quick access commands.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500 uppercase">SESSION</div>
                    <div className="font-orbitron text-green-400 text-lg">ACTIVE</div>
                  </div>
                  
                  <Link to="/route-planner" className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center">
                    <Map size={16} className="mr-2" />
                    Start New Drive
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-10 w-1 bg-blue-500 rounded-full mr-4"></div>
                  <div>
                    <h2 className="text-blue-400 font-orbitron text-md uppercase tracking-wider flex items-center">
                      <Trophy size={16} className="mr-2 text-yellow-400" />
                      Driver Performance Dashboard
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowWelcomeMessage(true)}
                    className="bg-blue-900/30 border border-blue-500/40 hover:bg-blue-900/50 text-blue-400 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                  >
                    <Gauge size={14} className="mr-1.5" />
                    Show Telemetry
                  </button>
                  
                  <Link to="/route-planner" className="bg-green-900/30 border border-green-500/40 hover:bg-green-900/50 text-green-400 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center">
                    <Map size={14} className="mr-1.5" />
                    Plan Drive
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Dashboard Layout Edit Mode */}
          {isEditMode && (
            <div className="mb-6 bg-black/60 p-4 rounded-lg border border-blue-500/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-blue-400 font-orbitron text-sm uppercase">Command Center Layout</h2>
                <div>
                  <button 
                    onClick={saveLayout} 
                    className="bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-lg mr-2 text-xs"
                  >
                    Save Layout
                  </button>
                  <button 
                    onClick={() => setIsEditMode(false)} 
                    className="bg-gray-900/80 border border-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {dashboardLayout.map((panel, index) => (
                  <div key={index} className="flex items-center bg-black/70 p-3 rounded-lg border border-gray-800">
                    <div className="mr-3 text-gray-500 font-mono text-xs">
                      {index + 1}.
                    </div>
                    <div className="flex-1 capitalize text-white">
                      {panel.replace('_', ' ')} Module
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => movePanel(index, 'up')} 
                        disabled={index === 0}
                        className={`p-1 rounded-full ${index === 0 ? 'text-gray-700' : 'text-blue-400 hover:bg-blue-900/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => movePanel(index, 'down')} 
                        disabled={index === dashboardLayout.length - 1}
                        className={`p-1 rounded-full ${index === dashboardLayout.length - 1 ? 'text-gray-700' : 'text-blue-400 hover:bg-blue-900/20'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Render dashboard panels according to user's layout preference */}
          {dashboardLayout.map((panel, index) => (
            <div key={index} className="mb-6">
              {renderDashboardPanel(panel)}
            </div>
          ))}
          
          {/* Quick Action Grid */}
          <div className="mt-8 mb-10">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-green-500 mr-3"></div>
              <h2 className="text-green-400 font-orbitron text-lg uppercase tracking-wider">Quick Navigation</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link to="/route-planner" className="bg-black/60 border border-blue-500/20 hover:border-blue-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Map size={24} className="text-blue-400" />
                </div>
                <p className="text-sm text-white font-medium">Route Planner</p>
                <p className="text-xs text-gray-500">Plan your next drive</p>
              </Link>
              
              <Link to="/drive-journal" className="bg-black/60 border border-green-500/20 hover:border-green-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={24} className="text-green-400" />
                </div>
                <p className="text-sm text-white font-medium">Drive Journal</p>
                <p className="text-xs text-gray-500">Log your experiences</p>
              </Link>
              
              <Link to="/garage-vault" className="bg-black/60 border border-purple-500/20 hover:border-purple-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Car size={24} className="text-purple-400" />
                </div>
                <p className="text-sm text-white font-medium">Garage Vault</p>
                <p className="text-xs text-gray-500">Manage your vehicles</p>
              </Link>
              
              <Link to="/weather-paddock" className="bg-black/60 border border-cyan-500/20 hover:border-cyan-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Cloud size={24} className="text-cyan-400" />
                </div>
                <p className="text-sm text-white font-medium">Weather</p>
                <p className="text-xs text-gray-500">Check conditions</p>
              </Link>
              
              <Link to="/juice-box" className="bg-black/60 border border-amber-500/20 hover:border-amber-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <SprayCan size={24} className="text-amber-400" />
                </div>
                <p className="text-sm text-white font-medium">Juice Box™</p>
                <p className="text-xs text-gray-500">Detailing expertise</p>
              </Link>
              
              <Link to="/manifest-station" className="bg-black/60 border border-rose-500/20 hover:border-rose-500/50 p-4 rounded-lg text-center transition-all duration-300 group">
                <div className="w-12 h-12 bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Brain size={24} className="text-rose-400" />
                </div>
                <p className="text-sm text-white font-medium">Manifest</p>
                <p className="text-xs text-gray-500">Build assistant</p>
              </Link>
            </div>
          </div>
          
          {/* API Debugger Component - Developer Tool (hidden in production) */}
          <div className="mt-12 mb-6">
            <APIDebugger />
          </div>
          
          {/* Footer */}
          <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
            <p>Paddock20 Portal © {new Date().getFullYear()} GoTime Motorsports</p>
            <p className="mt-1">Designed for true automotive enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;