import React, { useState } from 'react';
import { HustlePillar, Goal } from '../../types/manifestation';
import { 
  PlusCircle, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Clock, 
  DollarSign, 
  BookOpen, 
  Heart, 
  Activity, 
  Brain,
  Target,
  Dumbbell
} from 'lucide-react';

interface HustlePlannerComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

// Category types for our tabs
type BodyMindSpiritCategory = 'body' | 'mind' | 'spirit';
type ActivityEducationIntentionCategory = 'activity' | 'education' | 'intention';

const HustlePlannerComponent: React.FC<HustlePlannerComponentProps> = ({ goal, onUpdate }) => {
  // Track which main category we're in (Body/Mind/Spirit or Activity/Education/Intention)
  const [mainCategory, setMainCategory] = useState<'physical' | 'approach'>('physical');
  
  // Track which sub-category we're in
  const [physicalTab, setPhysicalTab] = useState<BodyMindSpiritCategory>('body');
  const [approachTab, setApproachTab] = useState<ActivityEducationIntentionCategory>('activity');
  
  // Combine to get the active tab
  const activeTab = mainCategory === 'physical' ? physicalTab : approachTab;
  
  // State for new action form
  const [newAction, setNewAction] = useState({
    name: '',
    notes: '',
  });
  
  // Initialize hustle pillars if they don't exist
  if (!goal.hustlePillars) {
    goal.hustlePillars = [
      // Body/Mind/Spirit pillars
      {
        id: Date.now(),
        type: 'body',
        description: 'Physical changes needed for your dream',
        targetValue: 5,
        currentValue: 0,
        unit: 'changes',
        completed: false,
        actions: []
      },
      {
        id: Date.now() + 1,
        type: 'mind',
        description: 'Mental preparation and focus',
        targetValue: 5,
        currentValue: 0,
        unit: 'practices',
        completed: false,
        actions: []
      },
      {
        id: Date.now() + 2,
        type: 'spirit',
        description: 'Your spiritual connection and values',
        targetValue: 5,
        currentValue: 0,
        unit: 'practices',
        completed: false,
        actions: []
      },
      
      // Activity/Education/Intention pillars
      {
        id: Date.now() + 3,
        type: 'activity',
        description: 'Actions required to manifest your dream',
        targetValue: 10,
        currentValue: 0,
        unit: 'actions',
        completed: false,
        actions: []
      },
      {
        id: Date.now() + 4,
        type: 'education',
        description: 'Knowledge, skills, and education needed',
        targetValue: 5,
        currentValue: 0,
        unit: 'resources',
        completed: false,
        actions: []
      },
      {
        id: Date.now() + 5,
        type: 'intention',
        description: 'Your "why" - the purpose behind this dream',
        targetValue: 3,
        currentValue: 0,
        unit: 'intentions',
        completed: false,
        actions: []
      }
    ];
  }
  
  // Get the currently active hustle pillar
  const activePillar = goal.hustlePillars.find(pillar => pillar.type === activeTab) || goal.hustlePillars[0];
  
  // Calculate completion percentage for the pillar
  const completionPercentage = activePillar.targetValue > 0 
    ? Math.min(100, Math.round((activePillar.currentValue / activePillar.targetValue) * 100)) 
    : 0;
    
  // Function to add a new action to the current pillar
  const handleAddAction = () => {
    if (!newAction.name.trim()) return;
    
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === activeTab);
    
    if (pillarIndex !== -1) {
      updatedGoal.hustlePillars![pillarIndex].actions.push({
        id: Date.now(),
        name: newAction.name,
        notes: newAction.notes,
        completed: false
      });
      
      onUpdate(updatedGoal);
      setNewAction({ name: '', notes: '' });
    }
  };
  
  // Function to toggle action completion status
  const toggleActionComplete = (actionId: number) => {
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === activeTab);
    
    if (pillarIndex !== -1) {
      const actionIndex = updatedGoal.hustlePillars![pillarIndex].actions.findIndex(a => a.id === actionId);
      
      if (actionIndex !== -1) {
        // Toggle completion status
        const isCompleting = !updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].completed;
        updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].completed = isCompleting;
        
        // If completing, set the date
        if (isCompleting) {
          updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].date = new Date().toISOString();
          updatedGoal.hustlePillars![pillarIndex].currentValue += 1; // Increment by 1 for actions
        } else {
          // If un-completing, remove the date and decrement value
          updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].date = undefined;
          updatedGoal.hustlePillars![pillarIndex].currentValue = Math.max(0, updatedGoal.hustlePillars![pillarIndex].currentValue - 1);
        }
        
        // Check if the pillar is now complete
        updatedGoal.hustlePillars![pillarIndex].completed = 
          updatedGoal.hustlePillars![pillarIndex].currentValue >= updatedGoal.hustlePillars![pillarIndex].targetValue;
          
        // Update the overall goal progress based on hustle pillars
        updateGoalProgress(updatedGoal);
        
        onUpdate(updatedGoal);
      }
    }
  };
  
  // Function to remove an action
  const removeAction = (actionId: number) => {
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === activeTab);
    
    if (pillarIndex !== -1) {
      const actionIndex = updatedGoal.hustlePillars![pillarIndex].actions.findIndex(a => a.id === actionId);
      
      if (actionIndex !== -1) {
        // If action was completed, adjust current value
        if (updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].completed) {
          updatedGoal.hustlePillars![pillarIndex].currentValue = Math.max(0, updatedGoal.hustlePillars![pillarIndex].currentValue - 1);
        }
        
        // Remove the action
        updatedGoal.hustlePillars![pillarIndex].actions.splice(actionIndex, 1);
        
        // Check if the pillar is still complete
        updatedGoal.hustlePillars![pillarIndex].completed = 
          updatedGoal.hustlePillars![pillarIndex].currentValue >= updatedGoal.hustlePillars![pillarIndex].targetValue;
          
        // Update the overall goal progress based on hustle pillars
        updateGoalProgress(updatedGoal);
        
        onUpdate(updatedGoal);
      }
    }
  };
  
  // Function to update pillar target
  const updatePillarTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTarget = parseInt(e.target.value) || 0;
    
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === activeTab);
    
    if (pillarIndex !== -1) {
      updatedGoal.hustlePillars![pillarIndex].targetValue = newTarget;
      
      // Check if the pillar is complete based on new target
      updatedGoal.hustlePillars![pillarIndex].completed = 
        updatedGoal.hustlePillars![pillarIndex].currentValue >= newTarget;
        
      // Update the overall goal progress based on hustle pillars
      updateGoalProgress(updatedGoal);
      
      onUpdate(updatedGoal);
    }
  };
  
  // Function to update pillar description
  const updatePillarDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === activeTab);
    
    if (pillarIndex !== -1) {
      updatedGoal.hustlePillars![pillarIndex].description = newDescription;
      onUpdate(updatedGoal);
    }
  };
  
  // Function to update the overall goal progress based on hustle pillars
  const updateGoalProgress = (updatedGoal: Goal) => {
    // Only update if all pillars exist
    if (updatedGoal.hustlePillars?.length === 6) {
      // Financial component (50% of total)
      const financialProgress = updatedGoal.currentAmount / updatedGoal.targetAmount;
      
      // Get all pillars
      const bodyPillar = updatedGoal.hustlePillars.find(p => p.type === 'body');
      const mindPillar = updatedGoal.hustlePillars.find(p => p.type === 'mind');
      const spiritPillar = updatedGoal.hustlePillars.find(p => p.type === 'spirit');
      const activityPillar = updatedGoal.hustlePillars.find(p => p.type === 'activity');
      const educationPillar = updatedGoal.hustlePillars.find(p => p.type === 'education');
      const intentionPillar = updatedGoal.hustlePillars.find(p => p.type === 'intention');
      
      // Calculate progress for each pillar
      const bodyProgress = bodyPillar && bodyPillar.targetValue > 0 
        ? Math.min(1, bodyPillar.currentValue / bodyPillar.targetValue) : 0;
        
      const mindProgress = mindPillar && mindPillar.targetValue > 0 
        ? Math.min(1, mindPillar.currentValue / mindPillar.targetValue) : 0;
        
      const spiritProgress = spiritPillar && spiritPillar.targetValue > 0 
        ? Math.min(1, spiritPillar.currentValue / spiritPillar.targetValue) : 0;
        
      const activityProgress = activityPillar && activityPillar.targetValue > 0 
        ? Math.min(1, activityPillar.currentValue / activityPillar.targetValue) : 0;
        
      const educationProgress = educationPillar && educationPillar.targetValue > 0 
        ? Math.min(1, educationPillar.currentValue / educationPillar.targetValue) : 0;
        
      const intentionProgress = intentionPillar && intentionPillar.targetValue > 0 
        ? Math.min(1, intentionPillar.currentValue / intentionPillar.targetValue) : 0;
      
      // Calculate combined progress
      const physicalProgress = (bodyProgress + mindProgress + spiritProgress) / 3;
      const approachProgress = (activityProgress + educationProgress + intentionProgress) / 3;
      const hustleProgress = (physicalProgress + approachProgress) / 2;
      
      // Calculate the total weighted progress
      const totalProgress = (financialProgress * 0.5) + (hustleProgress * 0.5);
      
      // Update the progress percentage
      updatedGoal.progressPercentage = Math.round(totalProgress * 100);
      
      // Update manifestation status based on progress
      if (updatedGoal.progressPercentage >= 100) {
        updatedGoal.manifestStatus = 'manifested';
      } else if (updatedGoal.progressPercentage > 0) {
        updatedGoal.manifestStatus = 'in_progress';
      }
    }
  };
  
  // Helper function to get icon and color for each pillar type
  const getPillarStyle = (type: string) => {
    switch(type) {
      case 'body':
        return { icon: <Dumbbell className="h-4 w-4 mr-1" />, color: 'green' };
      case 'mind':
        return { icon: <Brain className="h-4 w-4 mr-1" />, color: 'blue' };
      case 'spirit':
        return { icon: <Heart className="h-4 w-4 mr-1" />, color: 'purple' };
      case 'activity':
        return { icon: <Activity className="h-4 w-4 mr-1" />, color: 'yellow' };
      case 'education':
        return { icon: <BookOpen className="h-4 w-4 mr-1" />, color: 'indigo' };
      case 'intention':
        return { icon: <Target className="h-4 w-4 mr-1" />, color: 'red' };
      default:
        return { icon: <Circle className="h-4 w-4 mr-1" />, color: 'gray' };
    }
  };
  
  // Get style for current active tab
  const activeStyle = getPillarStyle(activeTab);
  const getBgColor = (type: string) => {
    const style = getPillarStyle(type);
    switch(style.color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      case 'yellow': return 'bg-yellow-500';
      case 'indigo': return 'bg-indigo-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getHoverBgColor = (type: string) => {
    const style = getPillarStyle(type);
    switch(style.color) {
      case 'green': return 'hover:bg-green-600';
      case 'blue': return 'hover:bg-blue-600';
      case 'purple': return 'hover:bg-purple-600';
      case 'yellow': return 'hover:bg-yellow-600';
      case 'indigo': return 'hover:bg-indigo-600';
      case 'red': return 'hover:bg-red-600';
      default: return 'hover:bg-gray-600';
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-blue-400 font-orbitron">HUSTLE PLANNER: DREAM BUILDER</h3>
        <button 
          onClick={() => {
            // We'll use the onUpdate function to signal that we want to switch back to dashboard view
            const updatedGoal = { ...goal };
            onUpdate(updatedGoal);
            
            // Store navigation preference for the parent component
            window.localStorage.setItem('manifestation_activeView', 'dashboard');
            
            // Trigger a state update in the parent
            window.dispatchEvent(new CustomEvent('manifestation-navigation', { 
              detail: { view: 'dashboard' } 
            }));
          }}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 border border-green-500 text-white rounded-md flex items-center"
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>
      
      {/* Main category switcher */}
      <div className="flex mb-4 border-b border-gray-700">
        <button
          onClick={() => setMainCategory('physical')}
          className={`flex-1 py-2 px-4 rounded-t-lg ${mainCategory === 'physical' 
            ? 'bg-gray-800 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-900 hover:bg-gray-800 text-gray-400'}`}
        >
          Body • Mind • Spirit
        </button>
        
        <button
          onClick={() => setMainCategory('approach')}
          className={`flex-1 py-2 px-4 rounded-t-lg ${mainCategory === 'approach' 
            ? 'bg-gray-800 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-900 hover:bg-gray-800 text-gray-400'}`}
        >
          Activity • Education • Intention
        </button>
      </div>
      
      {/* Sub-category tabs for Body/Mind/Spirit */}
      {mainCategory === 'physical' && (
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setPhysicalTab('body')}
            className={`flex-1 py-2 rounded-t-lg ${physicalTab === 'body' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <Dumbbell className="h-4 w-4 mr-1" />
              <span>Body</span>
            </div>
          </button>
          
          <button
            onClick={() => setPhysicalTab('mind')}
            className={`flex-1 py-2 rounded-t-lg ${physicalTab === 'mind' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <Brain className="h-4 w-4 mr-1" />
              <span>Mind</span>
            </div>
          </button>
          
          <button
            onClick={() => setPhysicalTab('spirit')}
            className={`flex-1 py-2 rounded-t-lg ${physicalTab === 'spirit' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <Heart className="h-4 w-4 mr-1" />
              <span>Spirit</span>
            </div>
          </button>
        </div>
      )}
      
      {/* Sub-category tabs for Activity/Education/Intention */}
      {mainCategory === 'approach' && (
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setApproachTab('activity')}
            className={`flex-1 py-2 rounded-t-lg ${approachTab === 'activity' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <Activity className="h-4 w-4 mr-1" />
              <span>Activity</span>
            </div>
          </button>
          
          <button
            onClick={() => setApproachTab('education')}
            className={`flex-1 py-2 rounded-t-lg ${approachTab === 'education' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Education</span>
            </div>
          </button>
          
          <button
            onClick={() => setApproachTab('intention')}
            className={`flex-1 py-2 rounded-t-lg ${approachTab === 'intention' 
              ? 'bg-blue-900 text-blue-400 font-semibold border-b-2 border-blue-400' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
          >
            <div className="flex items-center justify-center">
              <Target className="h-4 w-4 mr-1" />
              <span>Intention</span>
            </div>
          </button>
        </div>
      )}
      
      {/* Content explainer */}
      <div className="mb-4 p-3 bg-gray-800 rounded-md">
        <h3 className="font-semibold text-sm mb-2 text-white">
          {activeTab === 'body' && "How does your body need to change?"}
          {activeTab === 'mind' && "How does your mindset need to develop?"}
          {activeTab === 'spirit' && "What spiritual aspects matter to your dream?"}
          {activeTab === 'activity' && "What specific actions will manifest your dream?"}
          {activeTab === 'education' && "What do you need to learn to make this happen?"}
          {activeTab === 'intention' && "Why does this dream matter to you?"}
        </h3>
        
        <p className="text-xs text-gray-400">
          {activeTab === 'body' && "List physical changes, improvements or requirements needed for your dream. This could include health improvements, physical skills, appearance, or other bodily preparations."}
          {activeTab === 'mind' && "Define the mental preparation and growth needed. Consider mindset shifts, thought patterns, confidence building, and mental practices that will support your journey."}
          {activeTab === 'spirit' && "Explore your spiritual preparation. Whether religious or personal, outline the values, beliefs, and practices that will ground and guide you toward your dream."}
          {activeTab === 'activity' && "Document specific actions you'll take to reach your goal. Be concrete and measurable - these are the tactical steps that bridge your current state to your dream."}
          {activeTab === 'education' && "Identify the knowledge gaps you need to fill. This could include books, courses, mentorship, mastermind groups, or any other learning resources needed."}
          {activeTab === 'intention' && "Clarify your deepest motivations. Understanding why this dream matters will provide the foundation for persistent action even when challenges arise."}
        </p>
      </div>
      
      {/* Pillar header */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center flex-grow">
            <div className="mr-2 flex-shrink-0">
              {activeStyle.icon}
            </div>
            <input 
              type="text" 
              value={activePillar.description}
              onChange={updatePillarDescription}
              className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-sm w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-gray-300 text-sm">Target:</span>
            <input
              type="number"
              min="1"
              value={activePillar.targetValue}
              onChange={updatePillarTarget}
              className="bg-gray-800 border border-gray-700 text-white rounded w-16 px-2 py-1 text-sm"
            />
            <span className="text-gray-300 text-xs whitespace-nowrap">{activePillar.unit}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-4 mb-2">
          <div 
            className={`h-4 rounded-full ${getBgColor(activeTab)}`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress: {activePillar.currentValue} / {activePillar.targetValue} {activePillar.unit}</span>
          <span className={`font-medium ${completionPercentage >= 100 ? 'text-green-400' : 'text-gray-300'}`}>
            {completionPercentage}%
            {completionPercentage >= 100 && ' (Complete)'}
          </span>
        </div>
      </div>
      
      {/* Actions list */}
      <div className="space-y-2 mb-4">
        <h4 className="text-gray-300 text-sm font-medium border-b border-gray-700 pb-1 mb-2">
          {activeTab === 'body' && "Body Changes & Improvements"}
          {activeTab === 'mind' && "Mental Development Activities"}
          {activeTab === 'spirit' && "Spiritual Practices & Values"}
          {activeTab === 'activity' && "Key Actions & Steps"}
          {activeTab === 'education' && "Learning Resources & Knowledge"}
          {activeTab === 'intention' && "Core Motivations & Purpose"}
        </h4>
        
        {activePillar.actions.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center bg-gray-800/50 rounded-md">
            <p className="mb-2 font-medium">No items added yet</p>
            <p className="text-xs">Use the form below to add your first item for this category.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {activePillar.actions.map(action => (
              <div 
                key={action.id} 
                className={`flex items-start p-3 rounded ${
                  action.completed ? 'bg-gray-800/50' : 'bg-gray-800'
                }`}
              >
                <button 
                  onClick={() => toggleActionComplete(action.id)}
                  className="mt-0.5 mr-2 flex-shrink-0"
                >
                  {action.completed ? (
                    <CheckCircle className={`h-5 w-5 text-${activeStyle.color}-500`} />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                <div className="flex-grow">
                  <p className={`${action.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {action.name}
                  </p>
                  {action.notes && (
                    <p className="text-gray-400 text-sm mt-1">{action.notes}</p>
                  )}
                  {action.date && (
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{new Date(action.date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => removeAction(action.id)}
                  className="text-gray-500 hover:text-red-500 ml-2 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add new action form */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">
          Add New {activeTab === 'body' ? 'Body Change' : 
                  activeTab === 'mind' ? 'Mind Development' : 
                  activeTab === 'spirit' ? 'Spiritual Practice' :
                  activeTab === 'activity' ? 'Action Step' :
                  activeTab === 'education' ? 'Educational Resource' :
                  'Intention'}
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input
              type="text"
              placeholder={
                activeTab === 'body' ? 'e.g., Improve physical stamina for longer drives' : 
                activeTab === 'mind' ? 'e.g., Daily visualization of success' : 
                activeTab === 'spirit' ? 'e.g., Morning gratitude practice' :
                activeTab === 'activity' ? 'e.g., Research best financing options' :
                activeTab === 'education' ? 'e.g., Take advanced driving course' :
                'e.g., To create legacy for my family'
              }
              value={newAction.name}
              onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Additional Notes (optional)</label>
            <textarea
              placeholder="Add details, resources, or any other information..."
              value={newAction.notes}
              onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <button
            onClick={handleAddAction}
            disabled={!newAction.name.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newAction.name.trim()
                ? `${getBgColor(activeTab)} ${getHoverBgColor(activeTab)} text-white`
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HustlePlannerComponent;