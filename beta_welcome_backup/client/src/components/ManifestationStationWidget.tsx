/**
 * @PROTECTED_FILE - DO NOT MODIFY OR OVERWRITE
 * This file contains critical Manifestation Station functionality and must remain intact.
 * Any modifications must be explicitly approved by the owner.
 */
import React, { useState } from 'react';
import { Compass, Star, Clock, Target, Calendar, ArrowRight, PlayCircle, BarChart2, Zap } from 'lucide-react';

interface ManifestationGoal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
  energyLevel: 'high' | 'medium' | 'low';
  category: 'drive' | 'vehicle' | 'experience' | 'achievement';
  steps: string[];
}

const demoGoals: ManifestationGoal[] = [
  {
    id: 'g1',
    title: 'Mountain Pass Driving Journey',
    targetDate: '2025-07-15',
    progress: 25,
    energyLevel: 'high',
    category: 'drive',
    steps: [
      'Research top 3 mountain routes',
      'Schedule vehicle preparation',
      'Book accommodations',
      'Create driving playlist'
    ]
  },
  {
    id: 'g2',
    title: 'Perfect Vehicle Detail',
    targetDate: '2025-06-10',
    progress: 40,
    energyLevel: 'medium',
    category: 'vehicle',
    steps: [
      'Order premium detailing products',
      'Schedule full day for detail work',
      'Research ceramic coating techniques',
      'Document before/after results'
    ]
  },
  {
    id: 'g3',
    title: 'Track Day Performance Target',
    targetDate: '2025-08-22',
    progress: 15,
    energyLevel: 'high',
    category: 'experience',
    steps: [
      'Book track day session',
      'Complete vehicle safety inspection',
      'Practice performance driving techniques',
      'Set specific lap time goals'
    ]
  }
];

interface ManifestationStationWidgetProps {
  className?: string;
}

const ManifestationStationWidget: React.FC<ManifestationStationWidgetProps> = ({ className = '' }) => {
  const [selectedGoal, setSelectedGoal] = useState<ManifestationGoal | null>(null);
  
  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Get appropriate icon for goal category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'drive': return <Compass className="h-5 w-5 text-blue-400" />;
      case 'vehicle': return <Calendar className="h-5 w-5 text-green-400" />;
      case 'experience': return <Star className="h-5 w-5 text-yellow-400" />;
      case 'achievement': return <Target className="h-5 w-5 text-red-400" />;
      default: return <Star className="h-5 w-5 text-blue-400" />;
    }
  };
  
  // Get energy level indicator color
  const getEnergyColor = (level: string) => {
    switch(level) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  // Handle clicking on a goal
  const handleGoalClick = (goal: ManifestationGoal) => {
    setSelectedGoal(goal);
  };
  
  // Reset selected goal
  const handleCloseDetails = () => {
    setSelectedGoal(null);
  };
  
  return (
    <div className={`rounded-lg p-4 ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-purple-500" />
          <h3 className="text-lg font-semibold text-white">Manifestation Station</h3>
        </div>
        <div className="text-xs text-gray-400">Powering your automotive journey</div>
      </div>
      
      {selectedGoal ? (
        // Goal Details View
        <div className="bg-black/30 rounded-lg p-4 border border-blue-900/30 relative">
          <button 
            onClick={handleCloseDetails}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
            aria-label="Close goal details"
          >
            ✕
          </button>
          
          <div className="flex items-center mb-3">
            {getCategoryIcon(selectedGoal.category)}
            <h4 className="text-blue-400 font-bold ml-2">{selectedGoal.title}</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-black/20 p-2 rounded">
              <div className="text-xs text-gray-500">Target Date</div>
              <div className="text-white font-mono">{new Date(selectedGoal.targetDate).toLocaleDateString()}</div>
            </div>
            <div className="bg-black/20 p-2 rounded">
              <div className="text-xs text-gray-500">Days Left</div>
              <div className="text-white font-mono">{getDaysRemaining(selectedGoal.targetDate)}</div>
            </div>
            <div className="bg-black/20 p-2 rounded">
              <div className="text-xs text-gray-500">Energy</div>
              <div className={`font-mono ${getEnergyColor(selectedGoal.energyLevel)}`}>{selectedGoal.energyLevel.toUpperCase()}</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-1">Progress: {selectedGoal.progress}%</div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600" 
                style={{ width: `${selectedGoal.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2">Manifestation Steps:</div>
            <ul className="space-y-2">
              {selectedGoal.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 bg-black/20 p-2 rounded text-sm">
                  <div className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-blue-900/30 text-xs">
                    {index + 1}
                  </div>
                  <span className="text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center mt-4">
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded text-white text-sm transition">
              <PlayCircle className="h-4 w-4" />
              <span>Begin Manifestation Journey</span>
            </button>
          </div>
        </div>
      ) : (
        // Goal List View
        <div className="space-y-3">
          {demoGoals.map(goal => (
            <div 
              key={goal.id}
              className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-blue-900/20 hover:border-blue-900/50 cursor-pointer group transition-all"
              onClick={() => handleGoalClick(goal)}
            >
              <div className="flex-shrink-0">
                {getCategoryIcon(goal.category)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-blue-300 truncate">{goal.title}</h4>
                  <span className={`text-xs ${getEnergyColor(goal.energyLevel)}`}>
                    {goal.energyLevel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{getDaysRemaining(goal.targetDate)} days left</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden flex-grow">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400">{goal.progress}%</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
          ))}
          
          <button className="flex items-center justify-center gap-2 w-full p-2 rounded-lg border border-dashed border-gray-700 hover:border-blue-500 text-gray-400 hover:text-blue-400 transition-colors text-sm">
            <BarChart2 className="h-4 w-4" />
            <span>Add New Driving Goal</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ManifestationStationWidget;