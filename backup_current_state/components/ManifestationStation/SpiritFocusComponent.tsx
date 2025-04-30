import React, { useState } from 'react';
import { Goal } from '../../types/manifestation';
import { 
  Heart, 
  Sun, 
  Moon, 
  Save, 
  Edit, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  Trash2,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SpiritFocusComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface GratitudePractice {
  id: number;
  name: string;
  whenToPerform: 'morning' | 'evening' | 'anytime';
  description: string;
  isActive: boolean;
  lastUpdated: string;
}

const SpiritFocusComponent: React.FC<SpiritFocusComponentProps> = ({ goal, onUpdate }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [spiritFocus, setSpiritFocus] = useState<string>(goal.spiritFocus || '');
  const [practices, setPractices] = useState<GratitudePractice[]>([
    {
      id: 1,
      name: 'Morning Gratitude',
      whenToPerform: 'morning',
      description: 'List three things you are grateful for about your current vehicle and driving experience.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Progress Appreciation',
      whenToPerform: 'evening',
      description: 'Reflect on what steps you have taken today toward your dream, however small.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Intention Setting',
      whenToPerform: 'morning',
      description: 'Set an intention for how you will move toward your dream today.',
      isActive: true,
      lastUpdated: new Date().toISOString()
    }
  ]);
  
  const [newPractice, setNewPractice] = useState<Omit<GratitudePractice, 'id' | 'isActive' | 'lastUpdated'>>({
    name: '',
    whenToPerform: 'morning',
    description: ''
  });
  
  // Save updated spirit focus
  const saveSpiritFocus = () => {
    const updatedGoal = { ...goal, spiritFocus };
    onUpdate(updatedGoal);
    setIsEditing(false);
  };
  
  // Add new gratitude practice
  const addPractice = () => {
    if (!newPractice.name.trim()) return;
    
    const newPracticeEntry: GratitudePractice = {
      id: Date.now(),
      name: newPractice.name,
      whenToPerform: newPractice.whenToPerform,
      description: newPractice.description,
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
    
    setPractices([...practices, newPracticeEntry]);
    
    // Reset form
    setNewPractice({
      name: '',
      whenToPerform: 'morning',
      description: ''
    });
  };
  
  // Toggle practice active status
  const togglePracticeStatus = (id: number) => {
    const updatedPractices = practices.map(practice => 
      practice.id === id 
        ? { 
            ...practice, 
            isActive: !practice.isActive,
            lastUpdated: new Date().toISOString()
          } 
        : practice
    );
    
    setPractices(updatedPractices);
  };
  
  // Remove practice
  const removePractice = (id: number) => {
    const updatedPractices = practices.filter(practice => practice.id !== id);
    setPractices(updatedPractices);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get timing icon and label
  const getTimingInfo = (when: string) => {
    switch (when) {
      case 'morning':
        return { icon: <Sun className="h-3 w-3 mr-1" />, label: 'Morning' };
      case 'evening':
        return { icon: <Moon className="h-3 w-3 mr-1" />, label: 'Evening' };
      case 'anytime':
        return { icon: <Clock className="h-3 w-3 mr-1" />, label: 'Anytime' };
      default:
        return { icon: <Clock className="h-3 w-3 mr-1" />, label: when };
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-blue-400 font-orbitron flex items-center mb-4">
        <Heart className="mr-2 h-5 w-5" />
        SPIRIT FOCUS
      </h3>
      
      {/* Spirit Focus statement */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-blue-400 mb-1">
                Your Spirit Focus Statement
              </label>
              <textarea
                value={spiritFocus}
                onChange={(e) => setSpiritFocus(e.target.value)}
                placeholder="e.g., Daily gratitude practice for current achievements and blessings"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the spiritual or gratitude practices that will align your energy with your dream.
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
                onClick={saveSpiritFocus}
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
              <h4 className="text-blue-400 font-medium mb-2">Spirit Focus Statement</h4>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            
            {spiritFocus ? (
              <p className="text-white">{spiritFocus}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No spirit focus statement defined yet.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm flex items-center mx-auto"
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Define Spirit Focus</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Gratitude Practices */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Gratitude & Alignment Practices
        </h4>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h5 className="text-blue-400 font-medium">Your Spiritual Routine</h5>
              <p className="text-gray-400 text-sm">Daily gratitude and alignment</p>
            </div>
            <div className="bg-blue-900/50 text-blue-300 py-1 px-3 rounded-full flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              <span>{practices.filter(p => p.isActive).length} Practices</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-300">
            Gratitude and spiritual alignment are powerful forces in manifestation. These practices will help you maintain the emotional frequency that attracts your dream.
          </p>
        </div>
        
        {/* Practice list */}
        <div className="space-y-3">
          {practices.map(practice => (
            <div 
              key={practice.id}
              className={`border rounded-lg p-3 ${
                practice.isActive 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <button
                    onClick={() => togglePracticeStatus(practice.id)}
                    className="mt-0.5 mr-3 flex-shrink-0"
                  >
                    {practice.isActive ? (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                  
                  <div>
                    <h5 className={`font-medium ${practice.isActive ? 'text-white' : 'text-gray-500'}`}>
                      {practice.name}
                    </h5>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      {getTimingInfo(practice.whenToPerform).icon}
                      <span>{getTimingInfo(practice.whenToPerform).label}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Updated {formatDate(practice.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removePractice(practice.id)}
                  className="text-gray-500 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {practice.description && (
                <p className={`text-sm mt-2 ml-8 ${practice.isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                  {practice.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Add new practice */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Gratitude Practice
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Practice Name</label>
            <input
              type="text"
              placeholder="e.g., Evening Reflection"
              value={newPractice.name}
              onChange={(e) => setNewPractice({ ...newPractice, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">When to Perform</label>
            <select
              value={newPractice.whenToPerform}
              onChange={(e) => setNewPractice({ 
                ...newPractice, 
                whenToPerform: e.target.value as 'morning' | 'evening' | 'anytime'
              })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              placeholder="What will you do in this practice?"
              value={newPractice.description}
              onChange={(e) => setNewPractice({ ...newPractice, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-20 resize-none"
            />
          </div>
          
          <button
            onClick={addPractice}
            disabled={!newPractice.name.trim()}
            className={`w-full py-2 rounded flex items-center justify-center ${
              newPractice.name.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Add Practice</span>
          </button>
        </div>
      </div>
      
      {/* Gratitude tips */}
      <div className="mt-6 bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-3">Gratitude Practice Tips</h4>
        
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Be specific - name exactly what you're grateful for and why it matters to you</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Feel it - let the gratitude sensations fully expand in your body</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Include both material and immaterial blessings in your practice</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Thank the universe in advance for your manifestation as if it has already arrived</span>
          </li>
          <li className="flex items-start">
            <ArrowRight className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>Consider integrating giving back - volunteering time or sharing skills can enhance your gratitude practice</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SpiritFocusComponent;