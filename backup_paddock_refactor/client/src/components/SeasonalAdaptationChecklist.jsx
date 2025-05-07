import React, { useState } from 'react';
import { Calendar, Thermometer, Droplets, Fan, CloudSnow, Sun, Wind, Umbrella, Snowflake, Check, X } from 'lucide-react';

function SeasonalAdaptationChecklist() {
  const [selectedSeason, setSelectedSeason] = useState(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  });
  
  const [completed, setCompleted] = useState({});
  
  const seasons = {
    spring: {
      name: 'Spring',
      icon: <Droplets className="h-5 w-5 text-blue-400" />,
      color: 'from-blue-600 to-green-500',
      checklist: [
        { id: 'spring-1', task: 'Replace winter tires with all-season or summer tires' },
        { id: 'spring-2', task: 'Inspect suspension for winter damage' },
        { id: 'spring-3', task: 'Check brake system after winter conditions' },
        { id: 'spring-4', task: 'Clean undercarriage from winter salt/debris' },
        { id: 'spring-5', task: 'Test A/C system before summer heat' },
        { id: 'spring-6', task: 'Replace wiper blades if streaking' },
        { id: 'spring-7', task: 'Deep clean interior fabrics from winter grime' },
        { id: 'spring-8', task: 'Apply UV protectant to dashboard/trim' },
        { id: 'spring-9', task: 'Check for water leaks after winter freeze/thaw cycles' },
        { id: 'spring-10', task: 'Apply fresh coat of wax for spring weather' }
      ]
    },
    summer: {
      name: 'Summer',
      icon: <Sun className="h-5 w-5 text-yellow-400" />,
      color: 'from-yellow-500 to-orange-500',
      checklist: [
        { id: 'summer-1', task: 'Check coolant level and condition' },
        { id: 'summer-2', task: 'Ensure A/C is functioning optimally' },
        { id: 'summer-3', task: 'Check tire pressure in hot weather' },
        { id: 'summer-4', task: 'Test battery (heat accelerates failure)' },
        { id: 'summer-5', task: 'Replace cabin air filter for max A/C efficiency' },
        { id: 'summer-6', task: 'Apply UV protection to interior surfaces' },
        { id: 'summer-7', task: 'Check brake fluid (heat can cause boiling)' },
        { id: 'summer-8', task: 'Inspect belts/hoses for heat-related cracks' },
        { id: 'summer-9', task: 'Check wheel alignment for summer road trips' },
        { id: 'summer-10', task: 'Apply heat-resistant wax protection' }
      ]
    },
    fall: {
      name: 'Fall',
      icon: <Wind className="h-5 w-5 text-orange-400" />,
      color: 'from-orange-500 to-red-600',
      checklist: [
        { id: 'fall-1', task: 'Check heater and defrost functions' },
        { id: 'fall-2', task: 'Test battery before cold weather arrives' },
        { id: 'fall-3', task: 'Check tire tread depth for winter conditions' },
        { id: 'fall-4', task: 'Replace wiper blades for winter visibility' },
        { id: 'fall-5', task: 'Check all exterior lights' },
        { id: 'fall-6', task: 'Apply paint sealant before winter weather' },
        { id: 'fall-7', task: 'Inspect exhaust system for leaks (critical for winter)' },
        { id: 'fall-8', task: 'Switch to winter-grade oil if needed' },
        { id: 'fall-9', task: 'Stock emergency kit for winter weather' },
        { id: 'fall-10', task: 'Apply rain repellent treatment to windows' }
      ]
    },
    winter: {
      name: 'Winter',
      icon: <Snowflake className="h-5 w-5 text-blue-300" />,
      color: 'from-blue-400 to-indigo-600',
      checklist: [
        { id: 'winter-1', task: 'Install winter/snow tires if applicable' },
        { id: 'winter-2', task: 'Check antifreeze/coolant level and protection rating' },
        { id: 'winter-3', task: 'Apply undercarriage protection against salt/chemicals' },
        { id: 'winter-4', task: 'Test battery (cold weather reduces capacity)' },
        { id: 'winter-5', task: 'Check door/trunk seals (prevent freezing shut)' },
        { id: 'winter-6', task: 'Replace to winter-grade wiper fluid' },
        { id: 'winter-7', task: 'Check all exterior lights for visibility' },
        { id: 'winter-8', task: 'Inspect heating system functionality' },
        { id: 'winter-9', task: 'Apply silicone spray to weatherstripping' },
        { id: 'winter-10', task: 'Prep emergency kit with winter essentials' }
      ]
    }
  };
  
  const handleCheckItem = (itemId) => {
    setCompleted(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const currentSeason = seasons[selectedSeason];
  const completedCount = currentSeason.checklist.filter(item => completed[item.id]).length;
  const totalCount = currentSeason.checklist.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <h2 className="text-blue-400 font-orbitron text-xl mb-2 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Seasonal Adaptation Checklist
        </h2>
        <p className="text-gray-400 text-sm">
          Keep your vehicle performing optimally in changing weather conditions.
        </p>
      </div>
      
      {/* Season Selector */}
      <div className="grid grid-cols-4 bg-black">
        {Object.entries(seasons).map(([key, season]) => (
          <button
            key={key}
            onClick={() => setSelectedSeason(key)}
            className={`flex flex-col items-center justify-center p-3 border-b-2 transition-all ${
              selectedSeason === key 
                ? `border-blue-500 bg-gradient-to-b ${season.color} bg-opacity-10` 
                : 'border-transparent hover:bg-gray-900'
            }`}
            aria-pressed={selectedSeason === key}
          >
            {season.icon}
            <span className={`mt-1 text-sm ${selectedSeason === key ? 'text-blue-400' : 'text-gray-400'}`}>
              {season.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="p-4 bg-black border-b border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Completion:</span>
          <span className="text-white text-sm font-bold">{completedCount}/{totalCount} ({completionPercentage}%)</span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              completionPercentage > 75 ? 'bg-green-500' :
              completionPercentage > 50 ? 'bg-blue-500' :
              completionPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {/* Season-specific Checklist */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <ul className="space-y-3">
          {currentSeason.checklist.map((item) => (
            <li 
              key={item.id}
              className={`flex items-start p-3 rounded-lg ${
                completed[item.id] ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800 border border-gray-700'
              }`}
            >
              <button
                onClick={() => handleCheckItem(item.id)}
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                  completed[item.id] ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                aria-label={completed[item.id] ? `Mark ${item.task} as incomplete` : `Mark ${item.task} as complete`}
              >
                {completed[item.id] ? <Check size={14} className="text-black" /> : null}
              </button>
              <div>
                <p className={`text-sm ${completed[item.id] ? 'text-green-400 line-through' : 'text-white'}`}>
                  {item.task}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800 flex justify-between">
        <button
          onClick={() => setCompleted({})}
          className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors flex items-center"
        >
          <X size={14} className="mr-1" /> Reset
        </button>
        <a
          href="/seasonal-checklist"
          className="px-4 py-2 text-sm bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors flex items-center"
        >
          Open Detailed View
        </a>
      </div>
    </div>
  );
}

export default SeasonalAdaptationChecklist;