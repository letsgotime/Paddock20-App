import React, { useState, useEffect } from 'react';
import { 
  Snowflake, Sun, CloudSnow, Leaf, 
  Check, ArrowDown, Calendar, Download, 
  Printer, Clock, CheckCircle, Thermometer, 
  ToggleRight, Droplet, Wind, Tool, Car, ShieldAlert
} from 'lucide-react';

// Import example images
import winterImg from '@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg';
import summerImg from '@assets/Copy of IMG_4475.jpg';
import springImg from '@assets/AAFuWkQu2jM_1741439529758.jpg';
import fallImg from '@assets/AdobeStock_1212056636.jpeg';

// Sample seasonal checklists
const seasonalChecklists = {
  winter: {
    name: 'Winter Preparation',
    icon: <Snowflake className="h-5 w-5 text-blue-400" />,
    image: winterImg,
    description: 'Prepare your vehicle for winter conditions with this comprehensive checklist',
    sections: [
      {
        title: 'Exterior Protection',
        items: [
          { name: 'Apply ceramic coating or durable sealant', completed: false },
          { name: 'Treat all exterior trim with UV protectant', completed: false },
          { name: 'Apply rain repellent to all windows', completed: false },
          { name: 'Check and replace wiper blades if needed', completed: false },
          { name: 'Seal all exterior rubber and weatherstripping', completed: false },
          { name: 'Apply tire dressing with winter protection', completed: false },
          { name: 'Protect wheels with wheel-specific coating', completed: false }
        ]
      },
      {
        title: 'Mechanical Checks',
        items: [
          { name: 'Check antifreeze/coolant levels and condition', completed: false },
          { name: 'Switch to winter-grade oil if necessary', completed: false },
          { name: 'Test battery and charging system', completed: false },
          { name: 'Inspect tire tread depth and pressure', completed: false },
          { name: 'Check and replace cabin air filter', completed: false },
          { name: 'Verify all lights are working properly', completed: false },
          { name: 'Check brake condition and fluid level', completed: false },
          { name: 'Inspect and test heating system', completed: false }
        ]
      },
      {
        title: 'Interior Preparation',
        items: [
          { name: 'Apply anti-fog treatment to interior glass', completed: false },
          { name: 'Treat interior leather with conditioner', completed: false },
          { name: 'Add absorbent mats for snow/water', completed: false },
          { name: 'Apply fabric guard to upholstery and carpets', completed: false },
          { name: 'Create winter emergency kit', completed: false },
          { name: 'Clean and treat door jambs and seals', completed: false }
        ]
      }
    ]
  },
  summer: {
    name: 'Summer Readiness',
    icon: <Sun className="h-5 w-5 text-yellow-400" />,
    image: summerImg,
    description: 'Prepare your vehicle for hot summer conditions with this detailed checklist',
    sections: [
      {
        title: 'Cooling System',
        items: [
          { name: 'Check coolant level and condition', completed: false },
          { name: 'Inspect radiator and hoses for leaks', completed: false },
          { name: 'Test A/C system performance', completed: false },
          { name: 'Clean radiator fins and A/C condenser', completed: false },
          { name: 'Replace cabin air filter', completed: false }
        ]
      },
      {
        title: 'Exterior Protection',
        items: [
          { name: 'Apply high-quality UV-resistant wax or sealant', completed: false },
          { name: 'Treat all plastic and rubber with UV protectant', completed: false },
          { name: 'Apply tire dressing with UV protection', completed: false },
          { name: 'Clean and protect convertible top (if applicable)', completed: false },
          { name: 'Apply quality glass treatment for rain repellency', completed: false },
          { name: 'Treat leather with UV conditioner', completed: false }
        ]
      },
      {
        title: 'Maintenance Checks',
        items: [
          { name: 'Check tire pressure and condition', completed: false },
          { name: 'Inspect brake system', completed: false },
          { name: 'Check battery condition', completed: false },
          { name: 'Replace wiper blades if streaking', completed: false },
          { name: 'Check all exterior and interior lights', completed: false },
          { name: 'Top off all fluids', completed: false }
        ]
      }
    ]
  },
  spring: {
    name: 'Spring Revival',
    icon: <Leaf className="h-5 w-5 text-green-400" />,
    image: springImg,
    description: 'Refresh your vehicle after winter with this spring preparation checklist',
    sections: [
      {
        title: 'Post-Winter Cleaning',
        items: [
          { name: 'Complete underbody wash to remove salt/chemicals', completed: false },
          { name: 'Deep clean wheel wells and suspension components', completed: false },
          { name: 'Clean and treat weatherstripping and seals', completed: false },
          { name: 'Full exterior decontamination (iron remover, clay bar)', completed: false },
          { name: 'Deep clean interior fabrics and carpets', completed: false },
          { name: 'Clean and condition leather surfaces', completed: false }
        ]
      },
      {
        title: 'Paint Correction',
        items: [
          { name: 'Assess winter paint damage', completed: false },
          { name: 'Polish to remove light swirls and scratches', completed: false },
          { name: 'Apply fresh coating of wax, sealant, or ceramic', completed: false },
          { name: 'Treat trim and plastic with restorer', completed: false },
          { name: 'Clean and polish all glass surfaces', completed: false }
        ]
      },
      {
        title: 'Maintenance',
        items: [
          { name: 'Check for winter-related damage or leaks', completed: false },
          { name: 'Inspect suspension components', completed: false },
          { name: 'Rotate tires and check alignment', completed: false },
          { name: 'Check battery performance', completed: false },
          { name: 'Inspect brake system', completed: false },
          { name: 'Verify A/C system is functioning properly', completed: false }
        ]
      }
    ]
  },
  fall: {
    name: 'Fall Preparation',
    icon: <CloudSnow className="h-5 w-5 text-orange-400" />,
    image: fallImg,
    description: 'Get your vehicle ready for falling temperatures with this autumn checklist',
    sections: [
      {
        title: 'Exterior Preparation',
        items: [
          { name: 'Apply durable sealant or protection before winter', completed: false },
          { name: 'Protect trim from UV damage', completed: false },
          { name: 'Treat weatherstripping with silicone protectant', completed: false },
          { name: 'Apply rain repellent to all glass', completed: false },
          { name: 'Check and replace wiper blades', completed: false }
        ]
      },
      {
        title: 'Mechanical Readiness',
        items: [
          { name: 'Check heater and defrost system', completed: false },
          { name: 'Test battery and charging system', completed: false },
          { name: 'Inspect tire tread depth for winter readiness', completed: false },
          { name: 'Check all lights and bulbs', completed: false },
          { name: 'Check brake system', completed: false },
          { name: 'Check coolant freeze protection level', completed: false }
        ]
      },
      {
        title: 'Interior Preparation',
        items: [
          { name: 'Clean and protect interior surfaces', completed: false },
          { name: 'Apply leather conditioner before dry winter air', completed: false },
          { name: 'Clean carpets and apply protectant', completed: false },
          { name: 'Check for and seal any water leaks', completed: false },
          { name: 'Verify trunk emergency supplies are ready', completed: false }
        ]
      }
    ]
  }
};

const SeasonalChecklists = ({ vehicle, onSave, onExport }) => {
  const [activeSeason, setActiveSeason] = useState('winter');
  const [checklist, setChecklist] = useState(seasonalChecklists.winter);
  const [totalItems, setTotalItems] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Determine current season for default selection
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    
    // Default to current season
    if (month >= 0 && month < 3) {
      // Winter: Jan-Mar
      setActiveSeason('winter');
      setChecklist(seasonalChecklists.winter);
    } else if (month >= 3 && month < 6) {
      // Spring: Apr-Jun
      setActiveSeason('spring');
      setChecklist(seasonalChecklists.spring);
    } else if (month >= 6 && month < 9) {
      // Summer: Jul-Sep
      setActiveSeason('summer');
      setChecklist(seasonalChecklists.summer);
    } else {
      // Fall: Oct-Dec
      setActiveSeason('fall');
      setChecklist(seasonalChecklists.fall);
    }
  }, []);
  
  // Calculate progress
  useEffect(() => {
    let total = 0;
    let completed = 0;
    
    checklist.sections.forEach(section => {
      total += section.items.length;
      completed += section.items.filter(item => item.completed).length;
    });
    
    setTotalItems(total);
    setCompletedItems(completed);
  }, [checklist]);
  
  const handleSeasonChange = (season) => {
    setActiveSeason(season);
    setChecklist(seasonalChecklists[season]);
  };
  
  const toggleItemCompletion = (sectionIndex, itemIndex) => {
    const updatedChecklist = { ...checklist };
    updatedChecklist.sections[sectionIndex].items[itemIndex].completed = 
      !updatedChecklist.sections[sectionIndex].items[itemIndex].completed;
    
    setChecklist(updatedChecklist);
    
    // In a real app, we would call onSave() to persist changes
  };
  
  const handleSchedule = () => {
    // For demo purposes, just toggle the calendar
    setShowCalendar(!showCalendar);
  };
  
  const handleExport = () => {
    // In a real app, this would trigger the export function
    if (onExport) {
      onExport(checklist, activeSeason);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  return (
    <div className="seasonal-checklists">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-blue-400 font-orbitron text-2xl mb-2">{checklist.name}</h2>
            <p className="text-gray-400">{checklist.description}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center text-sm"
              onClick={handleSchedule}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </button>
            
            <button 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center text-sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            <button 
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center text-sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>
        
        {/* Season Selector */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => handleSeasonChange('winter')}
            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
              activeSeason === 'winter' 
                ? 'bg-blue-900 text-white font-medium' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Snowflake className={`h-4 w-4 mr-2 ${activeSeason === 'winter' ? 'text-blue-400' : 'text-gray-400'}`} />
            Winter
          </button>
          
          <button 
            onClick={() => handleSeasonChange('spring')}
            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
              activeSeason === 'spring' 
                ? 'bg-green-900 text-white font-medium' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Leaf className={`h-4 w-4 mr-2 ${activeSeason === 'spring' ? 'text-green-400' : 'text-gray-400'}`} />
            Spring
          </button>
          
          <button 
            onClick={() => handleSeasonChange('summer')}
            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
              activeSeason === 'summer' 
                ? 'bg-yellow-900 text-white font-medium' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Sun className={`h-4 w-4 mr-2 ${activeSeason === 'summer' ? 'text-yellow-400' : 'text-gray-400'}`} />
            Summer
          </button>
          
          <button 
            onClick={() => handleSeasonChange('fall')}
            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
              activeSeason === 'fall' 
                ? 'bg-orange-900 text-white font-medium' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <CloudSnow className={`h-4 w-4 mr-2 ${activeSeason === 'fall' ? 'text-orange-400' : 'text-gray-400'}`} />
            Fall
          </button>
        </div>
        
        {/* Featured Checklist Image */}
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
          <img 
            src={checklist.image} 
            alt={`${checklist.name} preparation`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <div className="flex items-center mb-2">
              {checklist.icon}
              <span className="ml-2 text-white font-medium">{checklist.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                {completedItems}/{totalItems} completed
              </div>
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Clock className="h-3 w-3 text-blue-500 mr-1" />
                Seasonal task
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1.5">
            <div className="bg-gray-800 h-full">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checklist Items */}
      <div className="space-y-6">
        {checklist.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl border border-blue-500/20">
            <h3 className="text-blue-400 mb-4 font-medium text-lg">{section.title}</h3>
            
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className={`p-3 rounded-lg flex items-center ${
                    item.completed 
                      ? 'bg-green-900/20 border border-green-800/30' 
                      : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => toggleItemCompletion(sectionIndex, itemIndex)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mr-3 ${
                      item.completed 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {item.completed && <Check className="h-4 w-4" />}
                  </button>
                  <span className={`text-sm ${item.completed ? 'text-gray-300 line-through' : 'text-white'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Tips Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-900 to-black p-4 rounded-xl border border-blue-500/20">
        <h3 className="text-blue-400 mb-4 font-medium text-lg flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2" />
          {activeSeason.charAt(0).toUpperCase() + activeSeason.slice(1)} Vehicle Tips
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSeason === 'winter' && (
            <>
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Thermometer className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Cold Weather Battery Care</h4>
                  <p className="text-gray-400 text-xs">Battery performance drops significantly in cold weather. Keep your battery terminals clean and consider a trickle charger for vehicles stored outside.</p>
                </div>
              </div>
              
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Droplet className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Winter Fluid Management</h4>
                  <p className="text-gray-400 text-xs">Make sure all fluids are winter-ready. Use winter-grade washer fluid and check that your coolant has proper antifreeze protection for your climate.</p>
                </div>
              </div>
            </>
          )}
          
          {activeSeason === 'summer' && (
            <>
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Thermometer className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Heat Protection</h4>
                  <p className="text-gray-400 text-xs">Use a quality sunshade when parked. Consider ceramic window tint to reduce interior heat buildup and protect your dashboard and interior from UV damage.</p>
                </div>
              </div>
              
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Wind className="h-5 w-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Cooling System Maintenance</h4>
                  <p className="text-gray-400 text-xs">Your vehicle's cooling system works harder in summer. Ensure the radiator is clean and free of debris, and that coolant is at proper levels and concentration.</p>
                </div>
              </div>
            </>
          )}
          
          {activeSeason === 'spring' && (
            <>
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Droplet className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Underbody Cleaning</h4>
                  <p className="text-gray-400 text-xs">Road salt and chemicals can damage your vehicle's undercarriage. Get a thorough underbody wash to remove all winter contaminants and prevent corrosion.</p>
                </div>
              </div>
              
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Tool className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Post-Winter Inspection</h4>
                  <p className="text-gray-400 text-xs">Winter can be hard on your vehicle. Check for suspension damage, exhaust system issues, and worn wiper blades that need replacement.</p>
                </div>
              </div>
            </>
          )}
          
          {activeSeason === 'fall' && (
            <>
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <Car className="h-5 w-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Lighting Check</h4>
                  <p className="text-gray-400 text-xs">With shorter days and longer nights, proper lighting is critical. Check all exterior lights, including fog lights and turn signals, and replace any bulbs as needed.</p>
                </div>
              </div>
              
              <div className="p-3 bg-black/30 rounded-lg flex items-start">
                <ToggleRight className="h-5 w-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-medium mb-1">Heater System Preparation</h4>
                  <p className="text-gray-400 text-xs">Test your heating system before cold weather arrives. Check that all vents are functioning properly and that the defrosters work effectively.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
            <h3 className="text-blue-400 font-orbitron text-lg mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Schedule {checklist.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Select Date</label>
              <input 
                type="date" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Reminder</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white">
                <option value="day">1 day before</option>
                <option value="week">1 week before</option>
                <option value="none">No reminder</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 mb-2 text-sm">Notes</label>
              <textarea 
                rows="3"
                placeholder="Add notes for this service..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowCalendar(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // In a real app, this would save the schedule
                  setShowCalendar(false);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalChecklists;