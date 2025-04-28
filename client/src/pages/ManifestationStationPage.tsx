import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRandomAffirmation } from "../services/affirmationsService";
import { searchHighResImages, createMediaItemFromSearch } from "../services/imageSearchService";
import PhotoUploadModal from "../components/PhotoUploadModal";
import GoalDetailsModal from "../components/GoalDetailsModal";
import SocialShareButtons from "@/components/ui/SocialShareButtons";
import { Goal, GoalMedia, Milestone, BudgetEntry, DailyCheckin } from "../types/manifestation";

const ManifestationStationPage = () => {
  // State for goals with example data
  const [goals, setGoals] = useState<Goal[]>([
    // Example goal data - this would come from an API or database in a real app
    {
      id: 1,
      goalName: "Ferrari 458 Italia",
      goalType: "Car",
      targetAsset: "Ferrari 458 Italia Spider",
      targetDate: "2026-09-30",
      fundingPlan: "Save",
      mindFocus: "Visualize driving through Monaco daily",
      bodyFocus: "Track day fitness training 3x weekly",
      spiritFocus: "Gratitude for current achievements",
      milestones: [
        {
          id: 101,
          name: "Meet with Ferrari specialist",
          targetDate: "2025-06-15",
          notes: "Discuss specs and options",
          completed: false
        },
        {
          id: 102,
          name: "Test drive similar model",
          targetDate: "2025-07-30",
          notes: "Schedule at Atlanta dealership",
          completed: false
        }
      ],
      completedMilestones: [
        {
          id: 103,
          name: "Financial consultation",
          targetDate: "2025-05-01",
          notes: "Reviewed savings strategy",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 35,
      description: "The ultimate driving machine that represents true craftsmanship and passion for performance.",
      targetAmount: 275000,
      currentAmount: 96250,
      budgetEntries: [
        {
          id: 201,
          date: "2025-01-15",
          amount: 50000,
          type: 'deposit',
          description: "Annual bonus"
        },
        {
          id: 202,
          date: "2025-02-10",
          amount: 25000,
          type: 'deposit',
          description: "Investment returns"
        },
        {
          id: 203,
          date: "2025-03-05",
          amount: 15000,
          type: 'deposit',
          description: "Stock sale"
        },
        {
          id: 204,
          date: "2025-04-01",
          amount: 6250,
          type: 'deposit',
          description: "Monthly savings plan"
        }
      ],
      mediaGallery: [
        {
          id: 301,
          type: 'image',
          name: 'Ferrari 458 Spider - Red',
          url: 'https://purepng.com/public/uploads/large/purepng.com-ferrari-458-italia-redcarferrarivehicleluxury-carsports-car-1701527409983pmymv.png',
          thumbnail: 'https://purepng.com/public/uploads/large/purepng.com-ferrari-458-italia-redcarferrarivehicleluxury-carsports-car-1701527409983pmymv.png',
          description: 'Dream configuration - Rosso Corsa with black interior and carbon fiber details',
          dateAdded: '2025-01-15'
        },
        {
          id: 302,
          type: 'link',
          name: 'Ferrari Official Configurator',
          url: 'https://www.ferrari.com/en-US/auto/car-configurator',
          description: 'Official configurator to build my dream specs',
          dateAdded: '2025-02-01'
        }
      ]
    },
    // Titanium Ryft exhaust for Ferrari 458
    {
      id: 2,
      goalName: "Titanium Ryft Exhaust",
      goalType: "Modification",
      targetAsset: "Titanium Ryft Exhaust for Ferrari 458",
      targetDate: "2025-06-30",
      fundingPlan: "Monthly Payments",
      mindFocus: "Study sound comparisons and engineering weekly",
      bodyFocus: "Garage organization and preparation",
      spiritFocus: "Appreciation for craftsmanship",
      milestones: [],
      completedMilestones: [
        {
          id: 201,
          name: "Research options",
          targetDate: "2024-03-01",
          notes: "Compared VividRacing and other alternatives",
          completed: true
        },
        {
          id: 202,
          name: "Confirm fitment with my vehicle",
          targetDate: "2024-03-15",
          notes: "Called Ryft support to verify compatibility",
          completed: true
        },
        {
          id: 203,
          name: "Book installation appointment",
          targetDate: "2025-06-01",
          notes: "Reserved with specialist shop",
          completed: true
        }
      ],
      manifestStatus: 'complete',
      progressPercentage: 100,
      description: "The Ryft titanium performance exhaust offers improved sound, reduced weight, and enhanced performance for the Ferrari 458. This precision-engineered exhaust provides ~15 hp gain and weighs significantly less than the factory system.",
      targetAmount: 5275,
      currentAmount: 5275,
      budgetEntries: [
        {
          id: 301,
          date: "2024-12-15",
          amount: 2000,
          type: 'deposit',
          description: "Performance parts fund"
        },
        {
          id: 302,
          date: "2025-01-10",
          amount: 1000,
          type: 'deposit',
          description: "Year-end bonus allocation"
        },
        {
          id: 303,
          date: "2025-02-05",
          amount: 2275,
          type: 'deposit',
          description: "Final payment from savings"
        }
      ],
      mediaGallery: [
        {
          id: 401,
          type: 'image',
          name: 'Ryft Titanium Exhaust',
          url: 'https://blacklinespeed.com/wp-content/uploads/2022/06/ferrari-458-ryft-exhaust-black-3.jpg',
          thumbnail: 'https://blacklinespeed.com/wp-content/uploads/2022/06/ferrari-458-ryft-exhaust-black-3.jpg',
          description: 'Titanium Ryft exhaust system for Ferrari 458',
          dateAdded: '2025-01-15'
        },
        {
          id: 402,
          type: 'link',
          name: 'Ryft Exhaust Product Page',
          url: 'https://www.vividracing.com/titanium-performance-exhaust-ferrari-458-italia-spider-20112015-p-154762309.html',
          description: 'Official product page with specs and details',
          dateAdded: '2025-01-20'
        }
      ]
    },
    // HRE Wheels for Ferrari 458
    {
      id: 3,
      goalName: "HRE P101 Wheels",
      goalType: "Modification",
      targetAsset: "HRE P101 Wheels for Ferrari 458",
      targetDate: "2025-08-15",
      fundingPlan: "Monthly Savings",
      mindFocus: "Research wheel fitment and engineering weekly",
      bodyFocus: "Detailing practice to maintain finish",
      spiritFocus: "Patience in craftsmanship",
      milestones: [
        {
          id: 301,
          name: "Choose final finish and color",
          targetDate: "2025-05-15",
          notes: "Deciding between brushed dark clear and satin bronze",
          completed: false
        },
        {
          id: 302,
          name: "Select tire compound and brand",
          targetDate: "2025-06-20",
          notes: "Research Michelin PS4S vs Pirelli P Zero",
          completed: false
        }
      ],
      completedMilestones: [
        {
          id: 303,
          name: "Confirm fitment specifications",
          targetDate: "2025-03-01",
          notes: "Contacted HRE for exact measurements",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 65,
      description: "HRE P101 forged wheels are the perfect complement to the Ferrari 458, offering reduced unsprung weight, improved handling, and a stunning visual upgrade. The wheel design balances performance, strength, and aesthetics.",
      targetAmount: 12500,
      currentAmount: 8125,
      budgetEntries: [
        {
          id: 401,
          date: "2025-01-15",
          amount: 4000,
          type: 'deposit',
          description: "Initial wheel fund"
        },
        {
          id: 402,
          date: "2025-02-10",
          amount: 2500,
          type: 'deposit',
          description: "Project bonus allocation"
        },
        {
          id: 403,
          date: "2025-03-05",
          amount: 1625,
          type: 'deposit',
          description: "Monthly savings"
        }
      ],
      mediaGallery: [
        {
          id: 501,
          type: 'image',
          name: 'HRE P101 Wheels - Ferrari 458',
          url: 'https://i.pinimg.com/originals/27/a0/72/27a072e85254820a4fb9cfde182b18f0.jpg',
          thumbnail: 'https://i.pinimg.com/originals/27/a0/72/27a072e85254820a4fb9cfde182b18f0.jpg',
          description: 'HRE P101 wheels on a Ferrari 458 - inspiration for my configuration',
          dateAdded: '2025-02-05'
        },
        {
          id: 502,
          type: 'link',
          name: 'HRE Wheels Official Site',
          url: 'https://www.hrewheels.com',
          description: 'HRE website for custom wheel configurations',
          dateAdded: '2025-02-15'
        }
      ]
    },
    // Patek Philippe Nautilus 5711
    {
      id: 4,
      goalName: "Patek Philippe Nautilus",
      goalType: "Watch",
      targetAsset: "Patek Philippe Nautilus 5711/1A-010",
      targetDate: "2025-12-31",
      fundingPlan: "Investment",
      mindFocus: "Studying horology and craftsmanship",
      bodyFocus: "Precision dexterity exercises",
      spiritFocus: "Patience and appreciation for art",
      milestones: [],
      completedMilestones: [
        {
          id: 401,
          name: "Meet with authorized dealer",
          targetDate: "2024-10-15",
          notes: "Established relationship with Patek AD",
          completed: true
        },
        {
          id: 402,
          name: "Secure allocation",
          targetDate: "2025-01-20",
          notes: "Received confirmation of purchase opportunity",
          completed: true
        },
        {
          id: 403,
          name: "Complete purchase",
          targetDate: "2025-03-15",
          notes: "Finalized acquisition of timepiece",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 32,
      description: "The Patek Philippe Nautilus 5711/1A-010 with blue dial represents the pinnacle of luxury sports watches. Designed by Gerald Genta in 1976, it combines elegant design with extraordinary craftsmanship and has become one of the most sought-after timepieces in the world.",
      targetAmount: 140000,
      currentAmount: 44800,
      budgetEntries: [
        {
          id: 501,
          date: "2024-11-15",
          amount: 20000,
          type: 'deposit',
          description: "Investment returns"
        },
        {
          id: 502,
          date: "2025-01-10",
          amount: 24800,
          type: 'deposit',
          description: "Bonus allocation"
        }
      ],
      mediaGallery: [
        {
          id: 601,
          type: 'image',
          name: 'Patek Philippe Nautilus 5711',
          url: 'https://i.pinimg.com/originals/8c/cf/ec/8ccfec1d87d00f871c6f6a60f3f575f7.jpg',
          thumbnail: 'https://i.pinimg.com/originals/8c/cf/ec/8ccfec1d87d00f871c6f6a60f3f575f7.jpg',
          description: 'The iconic Nautilus 5711 with blue dial',
          dateAdded: '2025-03-20'
        },
        {
          id: 602,
          type: 'link',
          name: 'Patek Philippe Official Site',
          url: 'https://www.patek.com',
          description: 'Official Patek Philippe website',
          dateAdded: '2025-01-05'
        }
      ]
    },
    // Beach House
    {
      id: 5,
      goalName: "Coastal Beach House",
      goalType: "Real Estate",
      targetAsset: "Waterfront Property in Malibu",
      targetDate: "2027-05-30",
      fundingPlan: "Investment Portfolio",
      mindFocus: "Visualize morning ocean views daily",
      bodyFocus: "Swimming training for ocean enjoyment",
      spiritFocus: "Gratitude for natural beauty",
      milestones: [],
      completedMilestones: [
        {
          id: 501,
          name: "Initial consultation with realtor",
          targetDate: "2024-09-01",
          notes: "Discussed requirements and budget",
          completed: true
        },
        {
          id: 502,
          name: "Mortgage pre-approval",
          targetDate: "2024-10-15",
          notes: "Secured financing options",
          completed: true
        },
        {
          id: 503,
          name: "Property viewing tour",
          targetDate: "2024-11-30",
          notes: "Viewed potential properties",
          completed: true
        },
        {
          id: 504,
          name: "Offer acceptance",
          targetDate: "2025-01-15",
          notes: "Offer on dream property accepted",
          completed: true
        },
        {
          id: 505,
          name: "Closing completed",
          targetDate: "2025-02-28",
          notes: "Finalized purchase and received keys",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 3,
      description: "A stunning oceanfront property in Malibu featuring 4 bedrooms, 5 bathrooms, and breathtaking panoramic views of the Pacific. The modern architecture blends seamlessly with the natural surroundings, featuring floor-to-ceiling windows, a private beach access path, and an infinity pool overlooking the ocean.",
      targetAmount: 8500000,
      currentAmount: 255000,
      budgetEntries: [
        {
          id: 601,
          date: "2024-12-15",
          amount: 150000,
          type: 'deposit',
          description: "Initial investment allocation"
        },
        {
          id: 602,
          date: "2025-01-10",
          amount: 105000,
          type: 'deposit',
          description: "Year-end portfolio gains"
        }
      ],
      mediaGallery: [
        {
          id: 701,
          type: 'image',
          name: 'Malibu Beach House',
          url: 'https://i.pinimg.com/originals/29/9e/91/299e91b3c44e56e7ffde73cb8e025082.jpg',
          thumbnail: 'https://i.pinimg.com/originals/29/9e/91/299e91b3c44e56e7ffde73cb8e025082.jpg',
          description: 'Modern oceanfront Malibu property',
          dateAdded: '2025-03-01'
        },
        {
          id: 702,
          type: 'link',
          name: 'Architectural Digest Feature',
          url: 'https://www.architecturaldigest.com',
          description: 'Similar properties featured in Architectural Digest',
          dateAdded: '2025-01-15'
        }
      ]
    },
    // 2014 Audi R8 V10
    {
      id: 6,
      goalName: "2014 Audi R8 V10",
      goalType: "Car",
      targetAsset: "2014 Audi R8 V10 Coupe",
      targetDate: "2024-08-30",
      fundingPlan: "Financing + Trade-in",
      mindFocus: "Research Audi maintenance schedules",
      bodyFocus: "Track day preparation",
      spiritFocus: "Enjoy the journey of ownership",
      milestones: [],
      completedMilestones: [
        {
          id: 601,
          name: "Initial research",
          targetDate: "2023-10-01",
          notes: "Researched year range, options, and common issues",
          completed: true
        },
        {
          id: 602,
          name: "Test drive",
          targetDate: "2023-11-15",
          notes: "Test drove R8 V10 at Atlanta dealership",
          completed: true
        },
        {
          id: 603,
          name: "Locate specific model",
          targetDate: "2024-01-05",
          notes: "Found Ibis White model with red interior",
          completed: true
        },
        {
          id: 604,
          name: "Pre-purchase inspection",
          targetDate: "2024-01-20",
          notes: "Completed thorough inspection with Audi specialist",
          completed: true
        },
        {
          id: 605,
          name: "Purchase completion",
          targetDate: "2024-02-15",
          notes: "Finalized purchase and delivery",
          completed: true
        }
      ],
      manifestStatus: 'complete',
      progressPercentage: 100,
      description: "The 2014 Audi R8 V10 represents the perfect balance of performance, handling, and everyday usability. With its naturally-aspirated 5.2L V10 engine producing 525hp, carbon fiber side blades, and timeless design, it delivers a driving experience like no other while maintaining Audi's renowned reliability.",
      targetAmount: 128000,
      currentAmount: 128000,
      budgetEntries: [
        {
          id: 701,
          date: "2023-12-15",
          amount: 65000,
          type: 'deposit',
          description: "Down payment"
        },
        {
          id: 702,
          date: "2024-01-10",
          amount: 35000,
          type: 'deposit',
          description: "Trade-in value"
        },
        {
          id: 703,
          date: "2024-02-05",
          amount: 10000,
          type: 'deposit',
          description: "Final payment"
        }
      ],
      mediaGallery: [
        {
          id: 801,
          type: 'image',
          name: 'Audi R8 V10',
          url: 'https://images.hgmsites.net/hug/2014-audi-r8_100454657_h.jpg',
          thumbnail: 'https://images.hgmsites.net/hug/2014-audi-r8_100454657_h.jpg',
          description: '2014 Audi R8 V10 - Ibis White with red interior',
          dateAdded: '2024-02-20'
        },
        {
          id: 802,
          type: 'link',
          name: 'Audi R8 Owners Forum',
          url: 'https://www.r8talk.com/',
          description: 'Online community for R8 owners',
          dateAdded: '2024-02-25'
        }
      ]
    },
    // 2021 BMW G80 M3 Competition
    {
      id: 7,
      goalName: "2021 BMW G80 M3 Competition",
      goalType: "Car",
      targetAsset: "2021 BMW G80 M3 Competition",
      targetDate: "2024-05-15",
      fundingPlan: "Financing",
      mindFocus: "Study BMW M technology",
      bodyFocus: "Precision driving techniques",
      spiritFocus: "Appreciation for engineering excellence",
      milestones: [],
      completedMilestones: [
        {
          id: 701,
          name: "Test drive new G80 platform",
          targetDate: "2023-08-10",
          notes: "Test drove at BMW of Charlotte",
          completed: true
        },
        {
          id: 702,
          name: "Compare packages and options",
          targetDate: "2023-09-05",
          notes: "Decided on Competition package with carbon package",
          completed: true
        },
        {
          id: 703,
          name: "Color selection",
          targetDate: "2023-09-20",
          notes: "Chose Isle of Man Green with Kyalami Orange interior",
          completed: true
        },
        {
          id: 704,
          name: "Secure financing approval",
          targetDate: "2023-11-15",
          notes: "Secured financing at 3.2% APR",
          completed: true
        },
        {
          id: 705,
          name: "Place order",
          targetDate: "2023-12-01",
          notes: "Order placed with BMW of Charlotte",
          completed: true
        },
        {
          id: 706,
          name: "Delivery day",
          targetDate: "2024-04-10",
          notes: "Vehicle delivery and orientation completed",
          completed: true
        }
      ],
      manifestStatus: 'complete',
      progressPercentage: 100,
      description: "The 2021 BMW G80 M3 Competition represents BMW's latest evolution of the iconic M3 lineage. With 503 horsepower from its twin-turbocharged S58 engine, advanced all-wheel drive system, and cutting-edge technology, it delivers extraordinary performance while maintaining daily usability. The carbon fiber accents and M-specific features create a driving experience that honors BMW's motorsport heritage.",
      targetAmount: 93000,
      currentAmount: 93000,
      budgetEntries: [
        {
          id: 801,
          date: "2023-12-15",
          amount: 20000,
          type: 'deposit',
          description: "Down payment"
        },
        {
          id: 802,
          date: "2024-04-10",
          amount: 65000,
          type: 'deposit',
          description: "Financing"
        }
      ],
      mediaGallery: [
        {
          id: 901,
          type: 'image',
          name: 'BMW G80 M3 Competition',
          url: 'https://i.pinimg.com/originals/3a/05/7e/3a057e3fa8d4cb2986b2d9fa006c1798.jpg',
          thumbnail: 'https://i.pinimg.com/originals/3a/05/7e/3a057e3fa8d4cb2986b2d9fa006c1798.jpg',
          description: '2021 BMW G80 M3 Competition in Isle of Man Green',
          dateAdded: '2024-04-15'
        },
        {
          id: 902,
          type: 'link',
          name: 'BMW M Owner\'s Manual',
          url: 'https://www.bmwusa.com/owners-manual.html',
          description: 'Official BMW owner resources',
          dateAdded: '2024-04-20'
        }
      ]
    },
    // 2009 BMW E93 M3
    {
      id: 8,
      goalName: "2009 BMW E93 M3",
      goalType: "Car",
      targetAsset: "2009 BMW E93 M3 Convertible",
      targetDate: "2023-09-30",
      fundingPlan: "Cash Purchase",
      mindFocus: "Study E9x M3 ownership forums",
      bodyFocus: "Weekend drive planning",
      spiritFocus: "Enjoy the open-air driving experience",
      milestones: [],
      completedMilestones: [
        {
          id: 801,
          name: "Initial market research",
          targetDate: "2023-05-01",
          notes: "Researched prices, common issues, and ownership costs",
          completed: true
        },
        {
          id: 802,
          name: "Locate specific models",
          targetDate: "2023-06-15",
          notes: "Found several well-maintained examples",
          completed: true
        },
        {
          id: 803,
          name: "Inspection of top candidate",
          targetDate: "2023-07-10",
          notes: "Completed PPI on Jerez Black model with extended warranty",
          completed: true
        },
        {
          id: 804,
          name: "Negotiate purchase",
          targetDate: "2023-07-25",
          notes: "Finalized price and terms",
          completed: true
        },
        {
          id: 805,
          name: "Complete purchase",
          targetDate: "2023-08-15",
          notes: "Finalized purchase and took delivery",
          completed: true
        }
      ],
      manifestStatus: 'complete',
      progressPercentage: 100,
      description: "The 2009 BMW E93 M3 Convertible represents one of BMW's most celebrated M cars. With its naturally-aspirated 4.0L V8 engine producing 414hp, retractable hardtop, and legendary handling dynamics, it delivers an exhilarating open-air driving experience. The last of the naturally-aspirated M3s, this model has become increasingly collectible while still offering tremendous performance value.",
      targetAmount: 35000,
      currentAmount: 35000,
      budgetEntries: [
        {
          id: 901,
          date: "2023-07-01",
          amount: 35000,
          type: 'deposit',
          description: "Full payment"
        }
      ],
      mediaGallery: [
        {
          id: 1001,
          type: 'image',
          name: 'BMW E93 M3 Convertible',
          url: 'https://i.pinimg.com/originals/2c/af/bd/2cafbd4a51081918ab4931ddc22c37d6.jpg',
          thumbnail: 'https://i.pinimg.com/originals/2c/af/bd/2cafbd4a51081918ab4931ddc22c37d6.jpg',
          description: '2009 BMW E93 M3 Convertible in Jerez Black',
          dateAdded: '2023-08-20'
        },
        {
          id: 1002,
          type: 'link',
          name: 'E9x M3 Maintenance Guide',
          url: 'https://www.m3post.com',
          description: 'Comprehensive maintenance and ownership guide',
          dateAdded: '2023-08-25'
        }
      ]
    }
  ]);

  // State for selected goal and modals
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    goalName: "",
    goalType: "Car",
    targetAsset: "",
    targetDate: new Date().toISOString().slice(0, 10),
    fundingPlan: "Save",
    mindFocus: "",
    bodyFocus: "",
    spiritFocus: "",
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'new',
    progressPercentage: 0,
    targetAmount: 0,
    currentAmount: 0,
    budgetEntries: [],
    mediaGallery: []
  });
  
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showGoalDetailsModal, setShowGoalDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMilestone, setNewMilestone] = useState<Omit<Milestone, 'id'>>({
    name: "",
    targetDate: new Date().toISOString().slice(0, 10),
    notes: "",
    completed: false
  });

  // State for daily check-ins
  const [checkIns, setCheckIns] = useState<DailyCheckin[]>([]);
  const [newCheckIn, setNewCheckIn] = useState<DailyCheckin>({
    id: Date.now(),
    goalId: selectedGoal?.id || 0,
    date: new Date().toISOString().slice(0, 10),
    mindCompleted: false,
    bodyCompleted: false,
    spiritCompleted: false,
    mindMinutes: 0,
    bodyMinutes: 0,
    spiritMinutes: 0,
    mindNotes: "",
    bodyNotes: "",
    spiritNotes: ""
  });

  // State for budget entries
  const [newBudgetEntry, setNewBudgetEntry] = useState<BudgetEntry>({
    id: Date.now(),
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    type: 'deposit',
    description: ""
  });

  // State for photo upload modal
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [affirmation, setAffirmation] = useState<string>("");

  // Load random affirmation on component mount
  useEffect(() => {
    const randomAffirmation = getRandomAffirmation();
    setAffirmation(randomAffirmation);
  }, []);

  // Helper function to calculate goal progress
  const calculateGoalProgress = (goal: Goal): number => {
    // Calculate progress based on multiple factors
    
    // 1. Financial progress (40% weight)
    const financialProgress = goal.targetAmount > 0 
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
      : 0;
    
    // 2. Milestone progress (30% weight)
    const totalMilestones = goal.milestones.length + goal.completedMilestones.length;
    const milestoneProgress = totalMilestones > 0 
      ? Math.round((goal.completedMilestones.length / totalMilestones) * 100) 
      : 0;
    
    // 3. Time progress (20% weight)
    const startDate = new Date('2025-01-01').getTime(); // Example start date
    const targetDate = new Date(goal.targetDate).getTime();
    const currentDate = new Date().getTime();
    
    let timeProgress = 0;
    if (currentDate >= targetDate) {
      timeProgress = 100;
    } else if (currentDate > startDate) {
      timeProgress = Math.round(((currentDate - startDate) / (targetDate - startDate)) * 100);
    }
    
    // 4. Daily disciplines (10% weight)
    const disciplineProgress = 50; // Placeholder - would be calculated from check-ins
    
    // Calculate weighted average
    const weightedProgress = (financialProgress * 0.4) + 
                            (milestoneProgress * 0.3) + 
                            (timeProgress * 0.2) + 
                            (disciplineProgress * 0.1);
    
    return Math.round(weightedProgress);
  };

  // Function to add a new goal
  const handleAddGoal = () => {
    const goalWithDefaults: Goal = {
      id: Date.now(),
      goalName: newGoal.goalName || "Unnamed Goal",
      goalType: newGoal.goalType || "Car",
      targetAsset: newGoal.targetAsset || "Unknown Asset",
      targetDate: newGoal.targetDate || new Date().toISOString().slice(0, 10),
      fundingPlan: newGoal.fundingPlan || "Save",
      mindFocus: newGoal.mindFocus || "Daily visualization",
      bodyFocus: newGoal.bodyFocus || "Regular exercise",
      spiritFocus: newGoal.spiritFocus || "Gratitude practice",
      milestones: newGoal.milestones || [],
      completedMilestones: newGoal.completedMilestones || [],
      manifestStatus: newGoal.manifestStatus || 'new',
      description: newGoal.description || "",
      progressPercentage: 0,
      targetAmount: newGoal.targetAmount || 0,
      currentAmount: newGoal.currentAmount || 0,
      budgetEntries: newGoal.budgetEntries || [],
      mediaGallery: newGoal.mediaGallery || []
    };
    
    // Calculate initial progress
    goalWithDefaults.progressPercentage = calculateGoalProgress(goalWithDefaults);
    
    // Add to goals array
    setGoals([...goals, goalWithDefaults]);
    
    // Reset form and close modal
    setNewGoal({
      goalName: "",
      goalType: "Car",
      targetAsset: "",
      targetDate: new Date().toISOString().slice(0, 10),
      fundingPlan: "Save",
      mindFocus: "",
      bodyFocus: "",
      spiritFocus: "",
      milestones: [],
      completedMilestones: [],
      manifestStatus: 'new',
      progressPercentage: 0,
      targetAmount: 0,
      currentAmount: 0,
      budgetEntries: [],
      mediaGallery: []
    });
    setShowAddGoalModal(false);
  };

  // Function to add a milestone to a new goal
  const handleAddMilestone = () => {
    const milestone: Milestone = {
      id: Date.now(),
      name: newMilestone.name,
      targetDate: newMilestone.targetDate,
      notes: newMilestone.notes,
      completed: false
    };
    
    setNewGoal({
      ...newGoal,
      milestones: [...(newGoal.milestones || []), milestone]
    });
    
    // Reset milestone form
    setNewMilestone({
      name: "",
      targetDate: new Date().toISOString().slice(0, 10),
      notes: "",
      completed: false
    });
  };

  // Function to add a budget entry
  const handleAddBudgetEntry = () => {
    if (!selectedGoal) return;
    
    const entry: BudgetEntry = {
      id: Date.now(),
      date: newBudgetEntry.date,
      amount: newBudgetEntry.amount,
      type: newBudgetEntry.type,
      description: newBudgetEntry.description
    };
    
    // Update the current amount based on the type of entry
    const amountChange = entry.type === 'deposit' ? entry.amount : -entry.amount;
    const updatedCurrentAmount = selectedGoal.currentAmount + amountChange;
    
    // Create a copy of the selected goal with the updated values
    const updatedGoal = {
      ...selectedGoal,
      currentAmount: updatedCurrentAmount,
      budgetEntries: [...selectedGoal.budgetEntries, entry]
    };
    
    // Recalculate progress
    updatedGoal.progressPercentage = calculateGoalProgress(updatedGoal);
    
    // Update the selected goal
    setSelectedGoal(updatedGoal);
    
    // Update the goal in the goals array
    setGoals(goals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    
    // Reset form
    setNewBudgetEntry({
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      type: 'deposit',
      description: ""
    });
  };

  // Function to handle daily check-in
  const handleDailyCheckIn = (goalId: number) => {
    if (!selectedGoal) return;
    
    const checkIn = {
      ...newCheckIn,
      id: Date.now(),
      goalId,
      date: new Date().toISOString().slice(0, 10)
    };
    
    // Add to check-ins
    setCheckIns([...checkIns, checkIn]);
    
    // Reset form
    setNewCheckIn({
      id: Date.now(),
      goalId: selectedGoal.id,
      date: new Date().toISOString().slice(0, 10),
      mindCompleted: false,
      bodyCompleted: false,
      spiritCompleted: false,
      mindMinutes: 0,
      bodyMinutes: 0,
      spiritMinutes: 0,
      mindNotes: "",
      bodyNotes: "",
      spiritNotes: ""
    });
    
    // Recalculate progress for the goal
    const updatedGoal = {
      ...selectedGoal,
      progressPercentage: calculateGoalProgress(selectedGoal)
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(goals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
  };

  // Function to handle goal completion
  const handleMarkManifested = () => {
    if (!selectedGoal) return;
    
    // Update goal status
    const updatedGoal = {
      ...selectedGoal,
      manifestStatus: 'manifested' as const,
      progressPercentage: 100
    };
    
    // Update state
    setSelectedGoal(updatedGoal);
    setGoals(goals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    
    // Close modal
    setShowGoalDetailsModal(false);
  };

  // Function to handle media upload
  const handleAddMedia = (url: string) => {
    if (!selectedGoal) return;
    
    const mediaItem: GoalMedia = {
      id: Date.now(),
      type: 'image',
      name: 'Dream Photo',
      url,
      thumbnail: url,
      description: 'Visualization of my dream',
      dateAdded: new Date().toISOString().slice(0, 10)
    };
    
    // Update the selected goal with the new media
    const updatedGoal = {
      ...selectedGoal,
      mediaGallery: [...selectedGoal.mediaGallery, mediaItem]
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(goals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
  };

  // Function to handle image search
  const handleImageSearch = async () => {
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const results = await searchHighResImages(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for images:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to select an image from search results
  const handleSelectSearchImage = (result: any) => {
    if (!selectedGoal) return;
    
    const mediaItem = createMediaItemFromSearch(result);
    
    // Update the selected goal with the new media
    const updatedGoal = {
      ...selectedGoal,
      mediaGallery: [...selectedGoal.mediaGallery, mediaItem]
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(goals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    
    // Close modal
    setShowImageSearchModal(false);
  };

  // Function to view goal details
  const handleViewGoalDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setActiveTab('overview');
    setShowGoalDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-blue-400 mb-2">🚀 Manifestation Station</h1>
        <p className="text-gray-400">Track and manifest your automotive dreams and goals</p>
      </div>
      
      {/* Why You're Here */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
        <div className="flex items-center mb-4">
          <div className="h-6 w-1 bg-yellow-500 rounded-full mr-3"></div>
          <h2 className="text-yellow-400 font-orbitron text-xl">Why You're Here</h2>
        </div>
        <div className="space-y-3 mb-4">
          <p className="text-white font-medium">Manifestation Station™ isn't about "wishing."</p>
          <p className="text-white font-medium">It's about <span className="text-green-400">working</span>.</p>
          <p className="text-white">Every goal you log here — every car, watch, home, or milestone — comes with a plan built the way real winners build:</p>
          <p className="text-white font-medium">Daily movement. Daily mindset. Daily gratitude.</p>
          <p className="text-white italic">Because real manifestation isn't magic—it's momentum.</p>
        </div>
      </div>
      
      {/* What You Do, What You Get Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <div className="h-6 w-1 bg-green-500 rounded-full mr-3"></div>
            <h2 className="text-green-400 font-orbitron text-xl">What You Do</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Set Goals: Add dream assets or experiences</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Link Daily Disciplines: Choose mind, body, spirit focuses</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Track Progress: Update as you advance</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Celebrate Completions: Archive manifested goals</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Level Up: After each goal, raise your standards</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <div className="h-6 w-1 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-blue-400 font-orbitron text-xl">What You Get</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Dream Vault: Log your cars, watches, experiences</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Goal Telemetry: Set targets, funding path, and timeline</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Milestone Tracking: Break down dreams into steps</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Daily Discipline Tracker: Mind, Body, Spirit</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Proof of Progress System: See your manifestation rate</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Manifesto Statement */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
        <p className="text-blue-400 font-orbitron text-center text-xl mb-4">Manifestation Station™ isn't about posting dreams.</p>
        <p className="text-white text-center text-lg mb-6">It's about <span className="text-green-400 font-medium">engineering victories</span> — one daily choice at a time.</p>
        <div className="flex flex-col items-center mt-6 space-y-3">
          <p className="text-white font-medium text-lg py-1">Dream bigger.</p>
          <p className="text-white font-medium text-lg py-1">Work sharper.</p>
          <p className="text-white font-medium text-lg py-1">Drive harder.</p>
          <p className="text-white font-medium text-lg py-1">Live better.</p>
        </div>
      </div>
      
      {/* Affirmation Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <div className="flex items-center mb-4">
          <div className="h-6 w-1 bg-yellow-500 rounded-full mr-3"></div>
          <h2 className="text-yellow-400 font-orbitron text-xl">Daily Affirmation</h2>
        </div>
        <p className="text-white text-lg italic">"{affirmation}"</p>
        <div className="flex justify-end mt-4">
          <SocialShareButtons text={`Today's affirmation: ${affirmation} #Paddock20 #GoTimeManifest`} />
        </div>
      </div>
      
      {/* Goals Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron text-blue-400">My Dreams</h2>
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-lg flex items-center"
          >
            <span className="mr-2">+</span>
            <span>New Dream</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <div
              key={goal.id}
              className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 transition-transform hover:scale-102 hover:shadow-xl cursor-pointer"
              onClick={() => handleViewGoalDetails(goal)}
            >
              {/* Card Header with image */}
              <div className="relative h-48">
                <img
                  src={goal.mediaGallery[0]?.url || "https://via.placeholder.com/400x200"}
                  alt={goal.goalName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                  <div className={`px-2 py-1 rounded text-xs inline-flex items-center ${getStatusBadgeColor(goal.manifestStatus)}`}>
                    <span className="h-2 w-2 rounded-full bg-current mr-1"></span>
                    {getStatusText(goal.manifestStatus)}
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5">
                <h3 className="text-xl font-orbitron text-blue-400 mb-2">{goal.goalName}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2">{goal.description || `${goal.targetAsset} - ${goal.goalType}`}</p>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{goal.progressPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div 
                      style={{ width: `${goal.progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    ></div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="flex justify-between items-center text-sm mt-4">
                  <div className="text-gray-400">Target: {goal.targetDate}</div>
                  <div className="text-green-400 font-mono">${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Goal Card */}
          <div
            className="bg-gray-900 bg-opacity-50 rounded-lg overflow-hidden border border-gray-700 border-dashed flex items-center justify-center h-96 cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setShowAddGoalModal(true)}
          >
            <div className="text-center p-6">
              <div className="bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 text-3xl">+</span>
              </div>
              <h3 className="text-xl font-orbitron text-blue-400 mb-2">Add New Dream</h3>
              <p className="text-gray-400">Start tracking your next automotive goal</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <Dialog open={showAddGoalModal} onOpenChange={setShowAddGoalModal}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
            <div className="bg-gray-900 rounded-lg shadow-lg max-w-4xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-blue-400 font-orbitron text-2xl">🌟 Create New Dream</h2>
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="text-white hover:text-red-400 text-2xl"
                >
                  ✖
                </button>
              </div>
              
              {/* Add Goal Form */}
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-black bg-opacity-30 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-blue-400 font-orbitron text-xl mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Goal Name
                      </label>
                      <input
                        type="text"
                        value={newGoal.goalName}
                        onChange={(e) => setNewGoal({...newGoal, goalName: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., Ferrari 458 Italia"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Asset Type
                      </label>
                      <Select 
                        value={newGoal.goalType} 
                        onValueChange={(value) => setNewGoal({...newGoal, goalType: value})}
                      >
                        <SelectTrigger className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Car">Car</SelectItem>
                          <SelectItem value="Watch">Watch</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Target Asset
                      </label>
                      <input
                        type="text"
                        value={newGoal.targetAsset}
                        onChange={(e) => setNewGoal({...newGoal, targetAsset: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., Ferrari 458 Spider"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Target Amount ($)
                      </label>
                      <input
                        type="number"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value) || 0})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., 250000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Funding Plan
                      </label>
                      <Select 
                        value={newGoal.fundingPlan} 
                        onValueChange={(value) => setNewGoal({...newGoal, fundingPlan: value})}
                      >
                        <SelectTrigger className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full">
                          <SelectValue placeholder="Select funding plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Save">Save</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Investment">Investment Returns</SelectItem>
                          <SelectItem value="Business">Business Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={newGoal.description || ""}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full h-24 resize-none"
                      placeholder="Describe your dream in detail..."
                    ></textarea>
                  </div>
                </div>
                
                {/* Manifestation Disciplines */}
                <div className="bg-black bg-opacity-30 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-blue-400 font-orbitron text-xl mb-4">Manifestation Disciplines</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Mind Focus (Daily visualization practice)
                      </label>
                      <input
                        type="text"
                        value={newGoal.mindFocus}
                        onChange={(e) => setNewGoal({...newGoal, mindFocus: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., Visualize driving through Monaco daily"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Body Focus (Physical actions to take)
                      </label>
                      <input
                        type="text"
                        value={newGoal.bodyFocus}
                        onChange={(e) => setNewGoal({...newGoal, bodyFocus: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., Track day fitness training 3x weekly"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Spirit Focus (Gratitude/alignment practice)
                      </label>
                      <input
                        type="text"
                        value={newGoal.spiritFocus}
                        onChange={(e) => setNewGoal({...newGoal, spiritFocus: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-3 rounded border border-gray-700 w-full"
                        placeholder="e.g., Daily gratitude for current achievements"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Milestones Section */}
                <div className="bg-black bg-opacity-30 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-blue-400 font-orbitron text-xl mb-4">Key Milestones</h3>
                  
                  {/* Milestone List */}
                  {newGoal.milestones && newGoal.milestones.length > 0 ? (
                    <div className="mb-6">
                      <div className="bg-gray-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-gray-900 text-gray-300 text-sm">
                            <tr>
                              <th className="py-3 px-4">Milestone</th>
                              <th className="py-3 px-4">Target Date</th>
                              <th className="py-3 px-4">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {newGoal.milestones.map((milestone) => (
                              <tr key={milestone.id} className="text-gray-300 hover:bg-gray-700">
                                <td className="py-3 px-4">{milestone.name}</td>
                                <td className="py-3 px-4">{milestone.targetDate}</td>
                                <td className="py-3 px-4">{milestone.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 text-center py-4 bg-gray-800 rounded-lg">
                      <p className="text-gray-400">No milestones yet. Add your first key milestone below.</p>
                    </div>
                  )}
                  
                  {/* Add Milestone Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Milestone Name
                      </label>
                      <input
                        type="text"
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                        placeholder="e.g., Meet with dealer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={newMilestone.targetDate}
                        onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">
                        Notes
                      </label>
                      <input
                        type="text"
                        value={newMilestone.notes}
                        onChange={(e) => setNewMilestone({...newMilestone, notes: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                        placeholder="e.g., Schedule appointment"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddMilestone}
                      disabled={!newMilestone.name}
                      className={`px-4 py-2 rounded-md ${
                        newMilestone.name
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Add Milestone
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-lg"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
      
      {/* Goal Details Modal */}
      {showGoalDetailsModal && selectedGoal && (
        <GoalDetailsModal 
          isOpen={showGoalDetailsModal}
          setIsOpen={setShowGoalDetailsModal}
          goal={selectedGoal}
          setGoal={setSelectedGoal}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          newCheckIn={newCheckIn}
          setNewCheckIn={setNewCheckIn}
          newBudgetEntry={newBudgetEntry}
          setNewBudgetEntry={setNewBudgetEntry}
          handleDailyCheckIn={handleDailyCheckIn}
          handleAddBudgetEntry={handleAddBudgetEntry}
          setShowPhotoUploadModal={setShowPhotoUploadModal}
        />
      )}
      
      {/* Photo Upload Modal */}
      {showPhotoUploadModal && selectedGoal && (
        <PhotoUploadModal
          onClose={() => setShowPhotoUploadModal(false)}
          onSave={(photoUrl) => {
            // Add the new photo to the goal's media gallery
            const newMedia: GoalMedia = {
              id: Date.now(),
              type: 'image',
              name: 'Dream Photo',
              url: photoUrl,
              thumbnail: photoUrl,
              description: 'Visualization of my dream',
              dateAdded: new Date().toISOString().slice(0, 10)
            };
            
            setSelectedGoal({
              ...selectedGoal,
              mediaGallery: [...selectedGoal.mediaGallery, newMedia]
            });
            
            setShowPhotoUploadModal(false);
          }}
        />
      )}
    </div>
  );
};

// Helper function to get status badge color
const getStatusBadgeColor = (status: 'new' | 'in_progress' | 'manifested' | 'complete') => {
  switch (status) {
    case 'new':
      return 'bg-blue-900/20 text-blue-400';
    case 'in_progress':
      return 'bg-yellow-900/20 text-yellow-400';
    case 'manifested':
      return 'bg-green-900/20 text-green-400';
    case 'complete':
      return 'bg-purple-900/20 text-purple-400';
    default:
      return 'bg-gray-900/20 text-gray-400';
  }
};

// Helper function to get status text
const getStatusText = (status: 'new' | 'in_progress' | 'manifested' | 'complete') => {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'manifested':
      return 'Manifested';
    case 'complete':
      return 'Complete';
    default:
      return 'Unknown';
  }
};

export default ManifestationStationPage;