/**
 * @PROTECTED_FILE - DO NOT MODIFY OR OVERWRITE
 * This file contains critical Manifestation Station functionality and must remain intact.
 * Any modifications must be explicitly approved by the owner.
 */
import React, { useState } from 'react';
import { Goal } from '../../types/manifestation';
import { 
  Brain, 
  Eye, 
  Save, 
  Edit, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  Trash2,
  CalendarDays,
  ArrowRight
} from 'lucide-react';

interface MindFocusComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface VisualizationRoutine {
  id: number;
  name: string;
  minutes: number;
  description: string;
  isActive: boolean;
  lastUpdated: string;
}

const MindFocusComponent: React.FC<MindFocusComponentProps> = ({ goal, onUpdate }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [mindFocus, setMindFocus] = useState<string>(goal.mindFocus || '');
  const [routines, setRoutines] = useState<VisualizationRoutine[]>([
    {
      id: 1,
      name: 'Daily Success Visualization',
      minutes: 10,
      description: 'Visualize yourself achieving your dream in vivid detail. Picture the location, the exact moment of achievement, your emotions, and the impact on your life.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Mental Rehearsal',
      minutes: 5,
      description: 'Mentally practice the key skills and abilities necessary for your goal. Imagine overcoming obstacles with confidence and skill.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Affirmation Session',
      minutes: 3,
      description: 'Repeat positive affirmations about your capability to achieve this goal. Speak as if you have already achieved it.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    }
  ]);
  
  const [newRoutine, setNewRoutine] = useState<Omit<VisualizationRoutine, 'id' | 'isActive' | 'lastUpdated'>>({
    name: '',
    minutes: 5,
    description: ''
  });
  
  // Save updated mind focus
  const saveMindFocus = () => {
    const updatedGoal = { ...goal, mindFocus };
    onUpdate(updatedGoal);
    setIsEditing(false);
  };
  
  // Add new visualization routine
  const addRoutine = () => {
    if (!newRoutine.name.trim()) return;
    
    const newRoutineEntry: VisualizationRoutine = {
      id: Date.now(),
      name: newRoutine.name,
      minutes: newRoutine.minutes,
      description: newRoutine.description,
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
    
    setRoutines([...routines, newRoutineEntry]);
    
    // Reset form
    setNewRoutine({
      name: '',
      minutes: 5,
      description: ''
    });
  };
  
  // Toggle routine active status
  const toggleRoutineStatus = (id: number) => {
    const updatedRoutines = routines.map(routine => 
      routine.id === id 
        ? { 
            ...routine, 
            isActive: !routine.isActive,
            lastUpdated: new Date().toISOString()
          } 
        : routine
    );
    
    setRoutines(updatedRoutines);
  };
  
  // Remove routine
  const removeRoutine = (id: number) => {
    const updatedRoutines = routines.filter(routine => routine.id !== id);
    setRoutines(updatedRoutines);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate total visualization time
  const totalVisualizationTime = routines
    .filter(r => r.isActive)
    .reduce((sum, routine) => sum + routine.minutes, 0);
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-blue-400 font-orbitron flex items-center mb-4">
        <Brain className="mr-2 h-5 w-5" />
        MIND FOCUS
      </h3>
      
      {/* Mind Focus statement */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-blue-400 mb-1">
                Your Mind Focus Statement
              </label>
              <textarea
                value={mindFocus}
                onChange={(e) => setMindFocus(e.target.value)}
                placeholder="e.g., Visualize driving through Monaco daily, seeing myself confidently navigating each turn"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the mental visualization or practice you'll maintain to achieve your dream.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveMindFocus}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm flex items-center"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span>Save Focus</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h4 className="text-blue-400 font-medium mb-2">Mind Focus Statement</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            {mindFocus ? (
              <p className="text-white">{mindFocus}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No mind focus statement defined yet.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm flex items-center mx-auto"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Define Mind Focus</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Daily Visualization Routine */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Eye className="h-4 w-4 mr-2" />
          Daily Visualization Routine
        </h4>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h5 className="text-blue-400 font-medium">Total Daily Practice</h5>
              <p className="text-gray-400 text-sm">Your complete mind routine</p>
            </div>
            <div className="bg-blue-900/50 text-blue-300 py-1 px-3 rounded-full flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>{totalVisualizationTime} minutes</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-300">
            Consistency is key to manifestation. Complete your visualization routine daily, ideally at the same time each day. Use the discipline tracker to log your progress.
          </p>
        </div>
        
        {/* Routine list */}
        <div className="space-y-3">
          {routines.map(routine => (
            <div 
              key={routine.id}
              className={`border rounded-lg p-3 ${
                routine.isActive 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <button
                    onClick={() => toggleRoutineStatus(routine.id)}
                    className="mt-0.5 mr-3 flex-shrink-0"
                  >
                    {routine.isActive ? (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                  
                  <div>
                    <h5 className={`font-medium ${routine.isActive ? 'text-white' : 'text-gray-500'}`}>
                      {routine.name}
                    </h5>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{routine.minutes} minutes</span>
                      <span className="mx-2">•</span>
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>Updated {formatDate(routine.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeRoutine(routine.id)}
                  className="text-gray-500 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {routine.description && (
                <p className={`text-sm mt-2 ml-8 ${routine.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                  {routine.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Add new routine */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Visualization Practice
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Practice Name</label>
            <input
              type="text"
              placeholder="e.g., Morning Success Visualization"
              value={newRoutine.name}
              onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time (minutes)</label>
            <div className="flex items-center">
              <button
                onClick={() => setNewRoutine({ ...newRoutine, minutes: Math.max(1, newRoutine.minutes - 1) })}
                className="bg-gray-700 text-gray-300 px-3 py-2 rounded-l-md border border-gray-600"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={newRoutine.minutes}
                onChange={(e) => setNewRoutine({ ...newRoutine, minutes: parseInt(e.target.value) || 1 })}
                className="w-16 text-center bg-gray-700 border-t border-b border-gray-600 text-white py-2"
              />
              <button
                onClick={() => setNewRoutine({ ...newRoutine, minutes: newRoutine.minutes + 1 })}
                className="bg-gray-700 text-gray-300 px-3 py-2 rounded-r-md border border-gray-600"
              >
                +
              </button>
              <span className="text-gray-400 ml-2">minutes</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
            <textarea
              placeholder="Describe what you'll visualize and how"
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <button
            onClick={addRoutine}
            disabled={!newRoutine.name.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newRoutine.name.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Add Routine</span>
          </button>
        </div>
      </div>
      
      {/* Visualization tips */}
      <div className="mt-6 bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-3">Visualization Tips</h4>
        
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Engage all your senses - imagine the sights, sounds, smells, and textures of achieving your dream.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Visualize in first person - see through your own eyes, not as an observer.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Experience the emotions - feel the joy, satisfaction, and accomplishment.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Practice consistently - visualization is a skill that improves with repetition.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Visualize giving back - include volunteering and community service in your mental imagery to align success with positive social impact.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MindFocusComponent;