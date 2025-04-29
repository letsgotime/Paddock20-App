import React, { useState } from 'react';
import { Goal } from '../../types/manifestation';
import { 
  Dumbbell, 
  CheckCircle, 
  PlusCircle, 
  Edit, 
  Save, 
  Trash2, 
  ClipboardList,
  Calendar,
  Clock,
  RepeatIcon,
  ArrowRight,
  Activity,
  BarChart
} from 'lucide-react';

interface BodyFocusComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface PhysicalActivity {
  id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  duration: number; // minutes
  description: string;
  isActive: boolean;
  lastUpdated: string;
}

const BodyFocusComponent: React.FC<BodyFocusComponentProps> = ({ goal, onUpdate }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [bodyFocus, setBodyFocus] = useState<string>(goal.bodyFocus || '');
  const [activities, setActivities] = useState<PhysicalActivity[]>([
    {
      id: 1,
      name: 'Cardio Training',
      frequency: 'weekly',
      duration: 30,
      description: 'Maintain cardiovascular health and endurance for long drives and high-intensity situations.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Core Strength',
      frequency: 'weekly',
      duration: 20,
      description: 'Build core stability for better posture and control during driving.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Flexibility Session',
      frequency: 'weekly',
      duration: 15,
      description: 'Maintain flexibility to comfortably operate controls and prevent stiffness on long drives.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    }
  ]);
  
  const [newActivity, setNewActivity] = useState<Omit<PhysicalActivity, 'id' | 'isActive' | 'lastUpdated'>>({
    name: '',
    frequency: 'weekly',
    duration: 30,
    description: ''
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
      duration: newActivity.duration,
      description: newActivity.description,
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
    
    setActivities([...activities, newActivityEntry]);
    
    // Reset form
    setNewActivity({
      name: '',
      frequency: 'weekly',
      duration: 30,
      description: ''
    });
  };
  
  // Toggle activity active status
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
  
  // Remove activity
  const removeActivity = (id: number) => {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get frequency display text
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'once':
        return 'Once';
      default:
        return frequency;
    }
  };
  
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
                placeholder="e.g., Track day fitness training 3x weekly to improve driving stamina and reflexes"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the physical activities or changes you'll implement to support your dream.
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
      
      {/* Physical Activity Routine */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Physical Activity Routine
        </h4>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h5 className="text-green-400 font-medium">Your Physical Plan</h5>
              <p className="text-gray-400 text-sm">Activities to support your goal</p>
            </div>
            <div className="bg-green-900/50 text-green-300 py-1 px-3 rounded-full flex items-center">
              <BarChart className="h-3.5 w-3.5 mr-1.5" />
              <span>{activities.filter(a => a.isActive).length} Activities</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-300">
            Your body's condition directly impacts your ability to manifest your dreams. These physical activities will ensure you're in optimal condition to achieve your goals.
          </p>
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
                      <RepeatIcon className="h-3 w-3 mr-1" />
                      <span>{getFrequencyText(activity.frequency)}</span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{activity.duration} minutes</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
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
            </div>
          ))}
        </div>
      </div>
      
      {/* Add new activity */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Physical Activity
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Activity Name</label>
            <input
              type="text"
              placeholder="e.g., Track Day Training"
              value={newActivity.name}
              onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Frequency</label>
              <select
                value={newActivity.frequency}
                onChange={(e) => setNewActivity({ 
                  ...newActivity, 
                  frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'once'
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="once">Once</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duration (minutes)</label>
              <div className="flex items-center">
                <button
                  onClick={() => setNewActivity({ ...newActivity, duration: Math.max(5, newActivity.duration - 5) })}
                  className="bg-gray-700 text-gray-300 px-3 py-2 rounded-l-md border border-gray-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="5"
                  value={newActivity.duration}
                  onChange={(e) => setNewActivity({ ...newActivity, duration: parseInt(e.target.value) || 5 })}
                  className="w-16 text-center bg-gray-700 border-t border-b border-gray-600 text-white py-2"
                />
                <button
                  onClick={() => setNewActivity({ ...newActivity, duration: newActivity.duration + 5 })}
                  className="bg-gray-700 text-gray-300 px-3 py-2 rounded-r-md border border-gray-600"
                >
                  +
                </button>
                <span className="text-gray-400 ml-2">min</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
            <textarea
              placeholder="How does this activity support your goal?"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <button
            onClick={addActivity}
            disabled={!newActivity.name.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newActivity.name.trim()
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>
      
      {/* Physical Optimization Tips */}
      <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-md">
        <h5 className="text-green-400 font-medium mb-2">Physical Optimization Tips</h5>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Choose activities that directly support your goal's physical requirements.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Track your progress and gradually increase intensity as you improve.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Recovery is as important as activity. Ensure proper rest between sessions.</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Consider working with a professional trainer to optimize your routine.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BodyFocusComponent;