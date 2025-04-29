import React, { useState } from 'react';
import { Goal } from '../../types/manifestation';
import { 
  Dumbbell, 
  Calendar, 
  Save, 
  Edit, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  Trash2,
  CalendarDays,
  ArrowRight,
  Heart,
  Timer,
  BarChart2,
  Repeat
} from 'lucide-react';

interface BodyFocusComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface PhysicalActivity {
  id: number;
  name: string;
  frequency: string;
  description: string;
  isActive: boolean;
  lastUpdated: string;
  targetCount: number;
  currentCount: number;
  unit: string;
}

const BodyFocusComponent: React.FC<BodyFocusComponentProps> = ({ goal, onUpdate }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [bodyFocus, setBodyFocus] = useState<string>(goal.bodyFocus || '');
  const [activities, setActivities] = useState<PhysicalActivity[]>([
    {
      id: 1,
      name: 'Morning Exercise Routine',
      frequency: '3x per week',
      description: 'A 20-minute routine focused on building core strength and endurance for better driving posture and stamina.',
      isActive: true,
      lastUpdated: new Date().toISOString(),
      targetCount: 3,
      currentCount: 1,
      unit: 'sessions per week'
    },
    {
      id: 2,
      name: 'Financial Action Steps',
      frequency: 'Daily',
      description: 'Take one concrete action each day toward saving or growing your funds for your dream.',
      isActive: true,
      lastUpdated: new Date().toISOString(),
      targetCount: 7,
      currentCount: 5,
      unit: 'actions per week'
    },
    {
      id: 3,
      name: 'Learning Sessions',
      frequency: '2x per week',
      description: 'Dedicated time to learn about your target asset - study maintenance, history, technology, ownership experience.',
      isActive: true,
      lastUpdated: new Date().toISOString(),
      targetCount: 2,
      currentCount: 1,
      unit: 'sessions per week'
    }
  ]);
  
  const [newActivity, setNewActivity] = useState<Omit<PhysicalActivity, 'id' | 'isActive' | 'lastUpdated' | 'currentCount'>>({
    name: '',
    frequency: '',
    description: '',
    targetCount: 1,
    unit: 'sessions per week'
  });
  
  // Save updated body focus
  const saveBodyFocus = () => {
    const updatedGoal = { ...goal, bodyFocus };
    onUpdate(updatedGoal);
    setIsEditing(false);
  };
  
  // Add new physical activity
  const addActivity = () => {
    if (!newActivity.name.trim()) return;
    
    const newActivityEntry: PhysicalActivity = {
      id: Date.now(),
      name: newActivity.name,
      frequency: newActivity.frequency,
      description: newActivity.description,
      isActive: true,
      lastUpdated: new Date().toISOString(),
      targetCount: newActivity.targetCount,
      currentCount: 0,
      unit: newActivity.unit
    };
    
    setActivities([...activities, newActivityEntry]);
    
    // Reset form
    setNewActivity({
      name: '',
      frequency: '',
      description: '',
      targetCount: 1,
      unit: 'sessions per week'
    });
  };
  
  // Toggle activity status
  const toggleActivityStatus = (id: number) => {
    const updatedActivities = activities.map(activity => 
      activity.id === id 
        ? { 
            ...activity, 
            isActive: !activity.isActive,
            lastUpdated: new Date().toISOString()
          } 
        : activity
    );
    
    setActivities(updatedActivities);
  };
  
  // Update activity progress
  const updateActivityProgress = (id: number, increment: boolean) => {
    const updatedActivities = activities.map(activity => {
      if (activity.id !== id) return activity;
      
      const newCount = increment 
        ? Math.min(activity.currentCount + 1, activity.targetCount) 
        : Math.max(activity.currentCount - 1, 0);
      
      return {
        ...activity,
        currentCount: newCount,
        lastUpdated: new Date().toISOString()
      };
    });
    
    setActivities(updatedActivities);
  };
  
  // Remove activity
  const removeActivity = (id: number) => {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate average progress percentage
  const averageProgress = activities
    .filter(a => a.isActive)
    .reduce((sum, activity) => sum + (activity.currentCount / activity.targetCount * 100), 0) / 
    Math.max(1, activities.filter(a => a.isActive).length);
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-green-400 font-orbitron flex items-center mb-4">
        <Dumbbell className="mr-2 h-5 w-5" />
        BODY FOCUS
      </h3>
      
      {/* Body Focus statement */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-green-400 mb-1">
                Your Body Focus Statement
              </label>
              <textarea
                value={bodyFocus}
                onChange={(e) => setBodyFocus(e.target.value)}
                placeholder="e.g., Daily fitness routine to improve stamina and reflexes for track driving"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the physical actions and routines that will prepare you to achieve your dream.
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
                onClick={saveBodyFocus}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm flex items-center"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span>Save Focus</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h4 className="text-green-400 font-medium mb-2">Body Focus Statement</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-green-400"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            {bodyFocus ? (
              <p className="text-white">{bodyFocus}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No body focus statement defined yet.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm flex items-center mx-auto"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Define Body Focus</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Physical Activities */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Dumbbell className="h-4 w-4 mr-2" />
          Physical Actions & Routines
        </h4>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h5 className="text-green-400 font-medium">Weekly Progress</h5>
              <p className="text-gray-400 text-sm">Your action completion rate</p>
            </div>
            <div className="bg-green-900/50 text-green-300 py-1 px-3 rounded-full flex items-center">
              <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
              <span>{Math.round(averageProgress)}% Complete</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500"
              style={{ width: `${averageProgress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Activity list */}
        <div className="space-y-3">
          {activities.map(activity => (
            <div 
              key={activity.id}
              className={`border rounded-lg p-3 ${
                activity.isActive 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <button
                    onClick={() => toggleActivityStatus(activity.id)}
                    className="mt-0.5 mr-3 flex-shrink-0"
                  >
                    {activity.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                  
                  <div>
                    <h5 className={`font-medium ${activity.isActive ? 'text-white' : 'text-gray-500'}`}>
                      {activity.name}
                    </h5>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      <Repeat className="h-3 w-3 mr-1" />
                      <span>{activity.frequency}</span>
                      <span className="mx-2">•</span>
                      <CalendarDays className="h-3 w-3 mr-1" />
                      <span>Updated {formatDate(activity.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeActivity(activity.id)}
                  className="text-gray-500 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {activity.description && (
                <p className={`text-sm mt-2 ml-8 ${activity.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.description}
                </p>
              )}
              
              {activity.isActive && (
                <div className="ml-8 mt-3 flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-400">
                        {activity.currentCount}/{activity.targetCount} {activity.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-green-500"
                        style={{ width: `${(activity.currentCount / activity.targetCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-3">
                    <button
                      onClick={() => updateActivityProgress(activity.id, false)}
                      disabled={activity.currentCount === 0}
                      className={`p-1 rounded ${
                        activity.currentCount > 0
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => updateActivityProgress(activity.id, true)}
                      disabled={activity.currentCount === activity.targetCount}
                      className={`p-1 rounded ${
                        activity.currentCount < activity.targetCount
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Add new activity */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Physical Action
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Activity Name</label>
            <input
              type="text"
              placeholder="e.g., Financial Saving Routine"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Frequency</label>
            <input
              type="text"
              placeholder="e.g., 3x per week, Daily, etc."
              value={newActivity.frequency}
              onChange={(e) => setNewActivity({ ...newActivity, frequency: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Target Count</label>
              <input
                type="number"
                min="1"
                value={newActivity.targetCount}
                onChange={(e) => setNewActivity({ ...newActivity, targetCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Unit</label>
              <select
                value={newActivity.unit}
                onChange={(e) => setNewActivity({ ...newActivity, unit: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="sessions per week">sessions per week</option>
                <option value="actions per week">actions per week</option>
                <option value="hours per week">hours per week</option>
                <option value="miles per week">miles per week</option>
                <option value="$ saved">$ saved</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
            <textarea
              placeholder="Describe this activity and how it contributes to your dream..."
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <button
            onClick={addActivity}
            disabled={!newActivity.name.trim() || !newActivity.frequency.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newActivity.name.trim() && newActivity.frequency.trim()
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>
      
      {/* Body focus tips */}
      <div className="mt-6 bg-green-900/20 rounded-lg p-4">
        <h4 className="text-green-400 font-medium mb-3">Action Tips</h4>
        
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Consistency beats intensity - small daily actions compound over time.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Include financial actions as part of your body focus plan - steps that build your resources.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Connect physical activities to your dream - seek activities that directly prepare you.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Track your progress daily to maintain momentum and celebrate small wins.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BodyFocusComponent;