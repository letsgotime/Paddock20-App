import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, Droplet, Sun, 
  Snowflake, Activity, CheckSquare, Play, Loader, Shield, 
  Star, Award, Zap, Tool, AlignLeft, ListChecks
} from 'lucide-react';

// Sample curated checklist data - actual data would come from a real API
const checklistCategories = [
  {
    id: 'wash',
    name: 'Wash Process',
    icon: <Droplet className="h-4 w-4 text-blue-400" />,
    checklists: [
      {
        id: 'wash-basic',
        title: 'Basic Wash Process',
        description: 'Standard 2-bucket wash method for weekly maintenance',
        steps: [
          'Rinse vehicle thoroughly to remove loose dirt',
          'Apply foam cannon pre-wash and let dwell for 3-5 minutes',
          'Rinse foam completely',
          'Use two-bucket method with grit guards to wash panels',
          'Wash from top to bottom in straight lines',
          'Rinse completely',
          'Dry with premium microfiber towel or blower'
        ],
        image: '@assets/AdobeStock_1212056636.jpeg',
        difficulty: 'Beginner',
        time: '45 minutes'
      },
      {
        id: 'wash-advanced',
        title: 'Advanced Strip Wash',
        description: 'Deep cleaning process to prep for paint protection',
        steps: [
          'Pre-rinse vehicle to remove loose contaminants',
          'Apply iron remover to entire vehicle and let dwell',
          'Rinse thoroughly',
          'Perform clay bar treatment on all painted surfaces',
          'Wash with pH neutral soap using two-bucket method',
          'Rinse thoroughly',
          'Perform IPA wipedown to remove any remaining residue',
          'Dry completely with microfiber or forced air'
        ],
        image: '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg',
        difficulty: 'Advanced',
        time: '2 hours'
      },
      {
        id: 'wash-maintenance',
        title: 'Maintenance Wash',
        description: 'Quick wash for protected vehicles',
        steps: [
          'Pre-rinse to remove loose debris',
          'Apply pH-neutral soap with foam cannon',
          'Rinse thoroughly',
          'Apply detail spray while drying with premium microfiber',
          'Inspect for any missed spots'
        ],
        image: '@assets/AdobeStock_1212056636.jpeg',
        difficulty: 'Beginner',
        time: '20 minutes'
      }
    ]
  },
  {
    id: 'polish',
    name: 'Polish & Correction',
    icon: <Sun className="h-4 w-4 text-yellow-400" />,
    checklists: [
      {
        id: 'polish-basic',
        title: 'One-Step Polish',
        description: 'Basic paint enhancement for light swirls and minor defects',
        steps: [
          'Wash and decontaminate paint surface',
          'Ensure vehicle is completely dry',
          'Mask off all trim, rubber and plastic',
          'Apply one-step polish with medium-cut pad',
          'Work in 2x2 sections with 50% overlap',
          'Buff residue with premium microfiber',
          'Inspect with proper lighting for defects'
        ],
        image: '@assets/AAFuWkQu2jM_1742366729990.jpg',
        difficulty: 'Intermediate',
        time: '3-4 hours'
      },
      {
        id: 'polish-full',
        title: 'Full Paint Correction',
        description: 'Three-stage correction for severe defects',
        steps: [
          'Wash and fully decontaminate paint surface',
          'Clay bar entire vehicle',
          'Measure paint thickness with gauge',
          'Map out severe defect areas',
          'Apply heavy compound with cutting pad',
          'Follow with medium polish on polishing pad',
          'Finish with fine polish on finishing pad',
          'Wipe with IPA solution',
          'Apply ceramic coating or sealant'
        ],
        image: '@assets/AAFuWkQu2jM_1742366729990.jpg',
        difficulty: 'Expert',
        time: '8-12 hours'
      }
    ]
  },
  {
    id: 'coating',
    name: 'Ceramic & Protection',
    icon: <Shield className="h-4 w-4 text-purple-400" />,
    checklists: [
      {
        id: 'ceramic-basic',
        title: 'Ceramic Coating Application',
        description: 'Professional-grade ceramic coating process',
        steps: [
          'Fully wash and decontaminate paint',
          'Complete paint correction as needed',
          'Perform IPA wipedown to remove oils and residue',
          'Ensure temperature and humidity are within range',
          'Apply ceramic coating in cross-hatch pattern',
          'Allow to flash for manufacturer-specified time',
          'Level and buff with microfiber suede cloth',
          'Allow 24 hours minimum before exposure to elements'
        ],
        image: '@assets/Copy of IMG_4475.jpg',
        difficulty: 'Advanced',
        time: '2-3 hours (application only)'
      },
      {
        id: 'wax-basic',
        title: 'Wax Application',
        description: 'Traditional carnauba wax protection',
        steps: [
          'Fully wash vehicle',
          'Apply wax with foam applicator in circular motion',
          'Work in small sections',
          'Allow to haze for 5-10 minutes',
          'Buff with clean, soft microfiber',
          'Perform second coat for maximum protection'
        ],
        image: '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg',
        difficulty: 'Beginner',
        time: '1 hour'
      }
    ]
  },
  {
    id: 'interior',
    name: 'Interior Detailing',
    icon: <CheckSquare className="h-4 w-4 text-orange-400" />,
    checklists: [
      {
        id: 'interior-detail',
        title: 'Full Interior Detail',
        description: 'Complete interior cleaning and protection',
        steps: [
          'Remove all personal items and floor mats',
          'Vacuum entire interior thoroughly',
          'Clean air vents with detailing brush',
          'Wipe all surfaces with appropriate cleaner',
          'Clean and condition leather surfaces',
          'Clean glass with automotive glass cleaner',
          'Apply protectant to dashboard and trim',
          'Vacuum and shampoo carpets and floor mats',
          'Apply fabric protectant if needed'
        ],
        image: '@assets/AAFuWkQu2jM_1741439529758.jpg',
        difficulty: 'Intermediate',
        time: '3-4 hours'
      },
      {
        id: 'leather-care',
        title: 'Leather Care Routine',
        description: 'Proper maintenance for leather interiors',
        steps: [
          'Vacuum seats and crevices',
          'Clean with pH-neutral leather cleaner',
          'Use soft brush for perforated sections',
          'Wipe clean with microfiber',
          'Apply leather conditioner with applicator',
          'Allow to absorb for 1 hour',
          'Buff with clean microfiber'
        ],
        image: '@assets/AAFuWkQu2jM_1741439529758.jpg',
        difficulty: 'Beginner',
        time: '1 hour'
      }
    ]
  },
  {
    id: 'seasonal',
    name: 'Seasonal Protection',
    icon: <Snowflake className="h-4 w-4 text-cyan-400" />,
    checklists: [
      {
        id: 'winter-prep',
        title: 'Winter Protection Routine',
        description: 'Prepare vehicle for winter conditions',
        steps: [
          'Complete full decontamination wash',
          'Apply durable sealant or ceramic coating',
          'Seal wheels with wheel-specific coating',
          'Apply rain repellent to all glass',
          'Treat rubber seals with silicone protectant',
          'Apply tire dressing for winter protection',
          'Clean and treat interior with anti-static protectant',
          'Apply fabric guard to carpets and mats'
        ],
        image: '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg',
        difficulty: 'Intermediate',
        time: '4-5 hours'
      },
      {
        id: 'summer-prep',
        title: 'Summer Protection Routine',
        description: 'Prepare vehicle for summer conditions',
        steps: [
          'Full wash and decontamination',
          'Clay bar treatment',
          'One-step polish to refresh gloss',
          'Apply high-gloss wax or sealant',
          'Dress tires with UV protectant',
          'Apply UV protectant to interior surfaces',
          'Clean and treat convertible tops if applicable',
          'Clean and polish glass'
        ],
        image: '@assets/Copy of IMG_4475.jpg',
        difficulty: 'Intermediate',
        time: '3-4 hours'
      }
    ]
  }
];

const JuiceBoxChecklists = ({ vehicle }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategory = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const openChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setMenuOpen(false);
  };

  // Find a specific checklist by ID
  const getChecklistById = (id) => {
    for (const category of checklistCategories) {
      const found = category.checklists.find(c => c.id === id);
      if (found) return found;
    }
    return null;
  };

  return (
    <div className="juice-box-checklists">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Checklist Navigation */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-blue-500/20 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-blue-400 font-orbitron flex items-center">
                <ListChecks className="h-5 w-5 mr-2" />
                JuiceBox™ Checklists
              </h3>
            </div>
            
            <div className="p-4 bg-gray-900/50">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-black/60 hover:bg-black/80 rounded border border-gray-800"
                >
                  <span className="text-white">
                    {selectedChecklist ? selectedChecklist.title : "Select a Checklist"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {menuOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-900 border border-gray-800 shadow-lg">
                    <div className="py-1 max-h-96 overflow-y-auto">
                      {checklistCategories.map((category) => (
                        <div key={category.id} className="category-item">
                          <button 
                            className="w-full flex items-center justify-between px-4 py-2 text-white hover:bg-gray-800"
                            onClick={() => toggleCategory(category.id)}
                          >
                            <div className="flex items-center">
                              {category.icon}
                              <span className="ml-2">{category.name}</span>
                            </div>
                            {expandedCategory === category.id ? 
                              <ChevronDown className="h-4 w-4 text-gray-400" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            }
                          </button>
                          
                          {expandedCategory === category.id && (
                            <div className="pl-8 bg-black/30">
                              {category.checklists.map((checklist) => (
                                <button 
                                  key={checklist.id}
                                  className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                                  onClick={() => openChecklist(checklist)}
                                >
                                  {checklist.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="text-gray-300 font-medium mb-2">Popular Checklists</h4>
                <div className="space-y-2">
                  {['wash-basic', 'winter-prep', 'ceramic-basic'].map((id) => {
                    const checklist = getChecklistById(id);
                    return checklist && (
                      <button 
                        key={id}
                        onClick={() => openChecklist(checklist)}
                        className="w-full flex items-center p-2 rounded bg-black/30 hover:bg-black/50 text-left"
                      >
                        <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-white text-sm">{checklist.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-gray-300 font-medium mb-2">Recent Checklists</h4>
                <div className="text-gray-500 text-sm p-3 bg-black/30 rounded border border-dashed border-gray-800 text-center">
                  <p>Complete a checklist to see it here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Checklist Content */}
        <div className="md:col-span-2">
          {selectedChecklist ? (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-blue-500/20 overflow-hidden">
              <div className="h-48 bg-gray-800 relative">
                <img 
                  src={selectedChecklist.image} 
                  alt={selectedChecklist.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h2 className="text-white font-orbitron text-xl">{selectedChecklist.title}</h2>
                  <p className="text-gray-300">{selectedChecklist.description}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="px-3 py-1 bg-black/50 rounded-full text-xs text-gray-300 flex items-center">
                    <Activity className="h-3 w-3 mr-1 text-blue-400" />
                    Difficulty: {selectedChecklist.difficulty}
                  </div>
                  <div className="px-3 py-1 bg-black/50 rounded-full text-xs text-gray-300 flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-blue-400" />
                    Time: {selectedChecklist.time}
                  </div>
                </div>
                
                <h3 className="text-blue-400 font-medium mb-3 flex items-center">
                  <ListChecks className="h-5 w-5 mr-2" />
                  Step-by-Step Instructions
                </h3>
                
                <div className="space-y-3 mb-6">
                  {selectedChecklist.steps.map((step, index) => (
                    <div 
                      key={index} 
                      className="flex items-start p-3 bg-black/30 rounded border border-gray-800"
                    >
                      <div className="w-7 h-7 bg-blue-900/50 rounded-full flex-shrink-0 flex items-center justify-center mr-3 text-blue-400 font-medium text-sm">
                        {index + 1}
                      </div>
                      <p className="text-white">{step}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Start Checklist
                  </button>
                  
                  <button className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-md flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Mark as Favorite
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-blue-500/20 flex flex-col items-center justify-center p-8 h-full">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <ListChecks className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-xl text-white mb-2">Select a Checklist</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Choose a detailing checklist from the menu to view step-by-step instructions and tips.
              </p>
              <button 
                onClick={() => setMenuOpen(true)}
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-white rounded-md flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Checklists
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fix missing import
const Clock = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
};

const Search = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
};

export default JuiceBoxChecklists;