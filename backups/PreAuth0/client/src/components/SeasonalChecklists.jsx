import React, { useState } from 'react';
import { Sun, Leaf, Wind, CloudSnow, CheckCircle, Circle, AlertTriangle, Calendar, Download, FileDown } from 'lucide-react';

/**
 * SeasonalChecklists Component
 * Seasonal specific maintenance checklists for optimal vehicle care based on time of year
 */
const SeasonalChecklists = ({ vehicle, onExport, onSave }) => {
  // State management
  const [selectedSeason, setSelectedSeason] = useState('spring');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Seasonal checklist data (empty placeholders to encourage interaction)
  const seasonalChecklists = {
    spring: {
      name: 'Spring Maintenance',
      icon: <Leaf className="h-5 w-5 text-green-500" />,
      color: 'green',
      description: 'Essential maintenance after winter to prepare for warmer weather',
      tasks: [
        { id: 'sp1', description: 'Inspect for winter damage', completed: false, critical: true },
        { id: 'sp2', description: 'Check and replace wiper blades if needed', completed: false, critical: false },
        { id: 'sp3', description: 'Full underbody cleaning to remove salt', completed: false, critical: true },
        { id: 'sp4', description: 'Professional paint inspection', completed: false, critical: false },
        { id: 'sp5', description: 'Tire rotation and pressure check', completed: false, critical: true },
        { id: 'sp6', description: 'Check tire tread depth', completed: false, critical: true },
        { id: 'sp7', description: 'A/C system inspection', completed: false, critical: false },
        { id: 'sp8', description: 'Cooling system check', completed: false, critical: true },
        { id: 'sp9', description: 'Apply new wax protection', completed: false, critical: false },
        { id: 'sp10', description: 'Replace cabin air filter', completed: false, critical: false },
        { id: 'sp11', description: 'Wheel alignment check', completed: false, critical: false },
        { id: 'sp12', description: 'Deep clean interior', completed: false, critical: false }
      ]
    },
    summer: {
      name: 'Summer Protection',
      icon: <Sun className="h-5 w-5 text-yellow-500" />,
      color: 'yellow',
      description: 'Heat and UV protection measures for the hottest months',
      tasks: [
        { id: 'su1', description: 'Apply UV protectant to interior surfaces', completed: false, critical: true },
        { id: 'su2', description: 'Check A/C performance', completed: false, critical: true },
        { id: 'su3', description: 'Apply ceramic coating or high-quality wax', completed: false, critical: false },
        { id: 'su4', description: 'Inspect cooling system', completed: false, critical: true },
        { id: 'su5', description: 'Check battery condition (heat affects batteries)', completed: false, critical: true },
        { id: 'su6', description: 'Verify tire pressures (heat increases pressure)', completed: false, critical: true },
        { id: 'su7', description: 'Apply hydrophobic glass coating', completed: false, critical: false },
        { id: 'su8', description: 'Clean radiator and A/C condenser fins', completed: false, critical: true },
        { id: 'su9', description: 'Inspect brake fluid (heat can boil old fluid)', completed: false, critical: true },
        { id: 'su10', description: 'Check window tint for bubbling/peeling', completed: false, critical: false },
        { id: 'su11', description: 'Inspect all drive belts', completed: false, critical: false },
        { id: 'su12', description: 'Apply tire/trim UV protectant', completed: false, critical: false }
      ]
    },
    fall: {
      name: 'Fall Preparation',
      icon: <Wind className="h-5 w-5 text-orange-500" />,
      color: 'orange',
      description: 'Pre-winter preparation and summer damage repair',
      tasks: [
        { id: 'fa1', description: 'Check heater and defrost systems', completed: false, critical: true },
        { id: 'fa2', description: 'Inspect wiper blades', completed: false, critical: true },
        { id: 'fa3', description: 'Check all exterior lights', completed: false, critical: true },
        { id: 'fa4', description: 'Apply paint sealant/protection before winter', completed: false, critical: true },
        { id: 'fa5', description: 'Lubricate door seals and locks', completed: false, critical: false },
        { id: 'fa6', description: 'Check battery condition before cold weather', completed: false, critical: true },
        { id: 'fa7', description: 'Replace cabin air filter', completed: false, critical: false },
        { id: 'fa8', description: 'Check coolant/antifreeze level and quality', completed: false, critical: true },
        { id: 'fa9', description: 'Inspect belts and hoses', completed: false, critical: true },
        { id: 'fa10', description: 'Apply rain repellent to all glass', completed: false, critical: false },
        { id: 'fa11', description: 'Clean and protect underbody', completed: false, critical: false },
        { id: 'fa12', description: 'Check for summer paint damage', completed: false, critical: false }
      ]
    },
    winter: {
      name: 'Winter Protection',
      icon: <CloudSnow className="h-5 w-5 text-blue-500" />,
      color: 'blue',
      description: 'Essential protection against harsh winter conditions',
      tasks: [
        { id: 'wi1', description: 'Apply protective wax or ceramic coating', completed: false, critical: true },
        { id: 'wi2', description: 'Check tire pressure and tread depth', completed: false, critical: true },
        { id: 'wi3', description: 'Apply glass water repellent coating', completed: false, critical: true },
        { id: 'wi4', description: 'Check battery condition (cold affects performance)', completed: false, critical: true },
        { id: 'wi5', description: 'Replace wiper blades with winter-grade blades', completed: false, critical: false },
        { id: 'wi6', description: 'Apply underbody protection/coating', completed: false, critical: true },
        { id: 'wi7', description: 'Check door & window seals', completed: false, critical: false },
        { id: 'wi8', description: 'Lubricate locks and latches', completed: false, critical: false },
        { id: 'wi9', description: 'Check coolant/antifreeze levels', completed: false, critical: true },
        { id: 'wi10', description: 'Test heater and defrost system', completed: false, critical: true },
        { id: 'wi11', description: 'Apply rubber/trim protectant', completed: false, critical: false },
        { id: 'wi12', description: 'Check all lights and electrical systems', completed: false, critical: true }
      ]
    }
  };
  
  // Calculated values
  const selectedChecklist = seasonalChecklists[selectedSeason];
  const completedTasks = selectedChecklist.tasks.filter(task => task.completed).length;
  const completionPercentage = Math.round((completedTasks / selectedChecklist.tasks.length) * 100);
  const criticalTasks = selectedChecklist.tasks.filter(task => task.critical).length;
  const completedCriticalTasks = selectedChecklist.tasks.filter(task => task.critical && task.completed).length;
  
  // Color classes based on season
  const getSeasonColorClasses = (season) => {
    switch (season) {
      case 'spring':
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-500',
          hover: 'hover:bg-green-500/20'
        };
      case 'summer':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          text: 'text-yellow-500',
          hover: 'hover:bg-yellow-500/20'
        };
      case 'fall':
        return {
          bg: 'bg-orange-500',
          bgLight: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          text: 'text-orange-500',
          hover: 'hover:bg-orange-500/20'
        };
      case 'winter':
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-500',
          hover: 'hover:bg-blue-500/20'
        };
      default:
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-500/10',
          border: 'border-green-500/30',
          text: 'text-green-500',
          hover: 'hover:bg-green-500/20'
        };
    }
  };
  
  const seasonColors = getSeasonColorClasses(selectedSeason);
  
  // Functions for interacting with checklist
  const handleTaskToggle = (taskId) => {
    // In a real implementation, this would update a database
    console.log(`Toggling task completion: ${taskId}`);
  };
  
  const handleExport = (format) => {
    if (onExport) {
      onExport({
        format,
        checklist: selectedChecklist
      });
    }
    setShowExportOptions(false);
  };
  
  const handleSaveChecklist = () => {
    if (onSave) {
      onSave({
        season: selectedSeason,
        checklist: selectedChecklist,
        completionPercentage
      });
    }
  };
  
  return (
    <div className="seasonal-checklists">
      {/* Season Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron text-blue-400">Seasonal Maintenance Plan</h2>
        
        <div className="flex border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setSelectedSeason('spring')}
            className={`p-2 ${selectedSeason === 'spring' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Leaf className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSelectedSeason('summer')}
            className={`p-2 ${selectedSeason === 'summer' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Sun className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSelectedSeason('fall')}
            className={`p-2 ${selectedSeason === 'fall' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <Wind className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSelectedSeason('winter')}
            className={`p-2 ${selectedSeason === 'winter' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            <CloudSnow className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Checklist Header */}
      <div className={`rounded-xl ${seasonColors.bgLight} ${seasonColors.border} border p-5 mb-6`}>
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <div className="flex items-center mb-2">
              {selectedChecklist.icon}
              <h3 className={`text-xl font-semibold ml-2 ${seasonColors.text}`}>{selectedChecklist.name}</h3>
            </div>
            <p className="text-gray-300 mb-4">{selectedChecklist.description}</p>
          </div>
          
          <div className="flex flex-col md:items-end mt-4 md:mt-0">
            <div className="flex items-center mb-2">
              <span className="text-gray-400 text-sm mr-3">Completion:</span>
              <div className="flex items-center">
                <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full ${seasonColors.bg} rounded-full`} 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium">{completionPercentage}%</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-400 text-sm mr-3">Critical Tasks:</span>
              <span className="text-white font-medium">{completedCriticalTasks}/{criticalTasks}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checklist Tasks */}
      <div className="grid gap-3 mb-6">
        {selectedChecklist.tasks.map(task => (
          <div 
            key={task.id} 
            className={`p-4 rounded-lg border ${
              task.completed 
                ? 'bg-gray-800/30 border-gray-700'
                : task.critical 
                  ? `${seasonColors.bgLight} ${seasonColors.border}`
                  : 'bg-gray-900/50 border-gray-800'
            }`}
          >
            <div className="flex items-start">
              <div 
                className="flex-shrink-0 cursor-pointer"
                onClick={() => handleTaskToggle(task.id)}
              >
                {task.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-500" />
                )}
              </div>
              
              <div className="ml-3 flex-grow">
                <div className={`${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {task.description}
                  {task.critical && (
                    <span className="ml-2 inline-flex items-center text-xs font-medium text-yellow-500">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Critical
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="flex gap-2">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
            onClick={handleSaveChecklist}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Progress
          </button>
          
          <div className="relative">
            <button 
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 px-4 rounded-md flex items-center"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </button>
            
            {showExportOptions && (
              <div className="absolute left-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    onClick={() => handleExport('pdf')}
                  >
                    Export as PDF
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    onClick={() => handleExport('csv')}
                  >
                    Export as CSV
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    onClick={() => handleExport('print')}
                  >
                    Print Checklist
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-start sm:justify-end gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Last updated: Never</span>
        </div>
      </div>
    </div>
  );
};

export default SeasonalChecklists;