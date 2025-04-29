import React, { useState } from 'react';
import { Goal, HustlePillar } from '../../types/manifestation';
import { 
  Party, 
  Trophy, 
  Star, 
  Heart, 
  PartyPopper, 
  Crown, 
  Camera, 
  MountainSnow,
  Map,
  Plane,
  Car,
  Home,
  PlusCircle,
  Clock,
  Pencil,
  Edit,
  Save,
  X,
  Calendar
} from 'lucide-react';

interface CelebrationComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface CelebrationDetails {
  location: string;
  activity: string;
  companions: string;
  feelings: string;
  reward: string;
  musicOrSounds: string;
  significance: string;
  visualizationNotes: string;
  celebrationDate?: string;
}

const CelebrationComponent: React.FC<CelebrationComponentProps> = ({ goal, onUpdate }) => {
  const [editing, setEditing] = useState<boolean>(false);
  
  // Find or initialize the celebration pillar
  let celebrationPillar = goal.hustlePillars?.find(pillar => pillar.type === 'celebration');
  
  if (!celebrationPillar) {
    // Create a new celebration pillar if it doesn't exist
    if (!goal.hustlePillars) {
      goal.hustlePillars = [];
    }
    
    celebrationPillar = {
      id: Date.now(),
      type: 'celebration',
      description: 'How will you celebrate achieving this dream?',
      targetValue: 1,
      currentValue: 0,
      unit: 'vision',
      completed: false,
      actions: []
    };
    
    goal.hustlePillars.push(celebrationPillar);
    onUpdate(goal);
  }
  
  // Separate the celebration metadata from the actions
  const getCelebrationDetails = (): CelebrationDetails => {
    // Extract celebration details from the actions
    const details: CelebrationDetails = {
      location: getActionByName('location')?.notes || '',
      activity: getActionByName('activity')?.notes || '',
      companions: getActionByName('companions')?.notes || '',
      feelings: getActionByName('feelings')?.notes || '',
      reward: getActionByName('reward')?.notes || '',
      musicOrSounds: getActionByName('musicOrSounds')?.notes || '',
      significance: getActionByName('significance')?.notes || '',
      visualizationNotes: getActionByName('visualizationNotes')?.notes || '',
      celebrationDate: getActionByName('celebrationDate')?.notes || ''
    };
    
    return details;
  };
  
  // Helper to get an action by name
  const getActionByName = (name: string) => {
    return celebrationPillar?.actions.find(action => action.name === name);
  };
  
  // Current celebration details
  const [celebrationDetails, setCelebrationDetails] = useState<CelebrationDetails>(getCelebrationDetails());
  
  // Save updated celebration details
  const saveCelebrationDetails = () => {
    if (!celebrationPillar) return;
    
    const updatedGoal = { ...goal };
    const pillarIndex = updatedGoal.hustlePillars!.findIndex(p => p.type === 'celebration');
    
    if (pillarIndex === -1) return;
    
    // Update each detail as an "action" for consistent storage
    const details = [
      { name: 'location', notes: celebrationDetails.location },
      { name: 'activity', notes: celebrationDetails.activity },
      { name: 'companions', notes: celebrationDetails.companions },
      { name: 'feelings', notes: celebrationDetails.feelings },
      { name: 'reward', notes: celebrationDetails.reward },
      { name: 'musicOrSounds', notes: celebrationDetails.musicOrSounds },
      { name: 'significance', notes: celebrationDetails.significance },
      { name: 'visualizationNotes', notes: celebrationDetails.visualizationNotes },
      { name: 'celebrationDate', notes: celebrationDetails.celebrationDate }
    ];
    
    // Update or create each action
    details.forEach(detail => {
      const actionIndex = updatedGoal.hustlePillars![pillarIndex].actions.findIndex(a => a.name === detail.name);
      
      if (actionIndex !== -1) {
        // Update existing action
        updatedGoal.hustlePillars![pillarIndex].actions[actionIndex].notes = detail.notes;
      } else {
        // Create new action
        updatedGoal.hustlePillars![pillarIndex].actions.push({
          id: Date.now() + Math.random(),
          name: detail.name,
          notes: detail.notes,
          completed: false
        });
      }
    });
    
    // Mark as completed if all fields have content
    const hasAllDetails = Object.values(celebrationDetails).filter(value => typeof value === 'string').every(value => value.trim() !== '');
    updatedGoal.hustlePillars![pillarIndex].completed = hasAllDetails;
    updatedGoal.hustlePillars![pillarIndex].currentValue = hasAllDetails ? 1 : 0;
    
    onUpdate(updatedGoal);
    setEditing(false);
  };
  
  // Determine how complete the celebration visualization is
  const completionPercentage = Object.values(celebrationDetails)
    .filter(value => typeof value === 'string' && value.trim() !== '')
    .length / 8 * 100;
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-blue-400 font-orbitron flex items-center">
          <PartyPopper className="mr-2 h-5 w-5" />
          CELEBRATION VISION
        </h3>
        
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center text-gray-400 hover:text-blue-400 text-sm py-1 px-3 rounded-full border border-gray-700 hover:border-blue-400"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            <span>Edit Vision</span>
          </button>
        )}
      </div>
      
      {/* Introduction text */}
      <div className="mb-6 p-3 bg-blue-900/20 border border-blue-800 rounded-md">
        <p className="text-gray-300 text-sm">
          Visualize exactly how you'll celebrate when you achieve this dream. The more vividly you can imagine your celebration, the more motivated you'll be to manifest it. This visualization will become your anchor during challenging times.
        </p>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Vision Completion</span>
          <span className={`font-medium ${completionPercentage >= 100 ? 'text-green-400' : 'text-gray-300'}`}>
            {Math.round(completionPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {editing ? (
        // Edit form
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <Map className="inline-block h-3.5 w-3.5 mr-1" />
                Where will you celebrate?
              </label>
              <input
                type="text"
                placeholder="Beach, mountains, favorite restaurant..."
                value={celebrationDetails.location}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  location: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <PartyPopper className="inline-block h-3.5 w-3.5 mr-1" />
                What activity will you do?
              </label>
              <input
                type="text"
                placeholder="Special dinner, trip, adventure..."
                value={celebrationDetails.activity}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  activity: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <Heart className="inline-block h-3.5 w-3.5 mr-1" />
                Who will be with you?
              </label>
              <input
                type="text"
                placeholder="Family, friends, mentor..."
                value={celebrationDetails.companions}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  companions: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <Calendar className="inline-block h-3.5 w-3.5 mr-1" />
                Target Celebration Date (optional)
              </label>
              <input
                type="date"
                value={celebrationDetails.celebrationDate}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  celebrationDate: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <Star className="inline-block h-3.5 w-3.5 mr-1" />
                How will it feel?
              </label>
              <input
                type="text"
                placeholder="Proud, accomplished, free..."
                value={celebrationDetails.feelings}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  feelings: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                <Trophy className="inline-block h-3.5 w-3.5 mr-1" />
                What reward will you give yourself?
              </label>
              <input
                type="text"
                placeholder="Gift, experience, memento..."
                value={celebrationDetails.reward}
                onChange={(e) => setCelebrationDetails({
                  ...celebrationDetails,
                  reward: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              <Party className="inline-block h-3.5 w-3.5 mr-1" />
              What music or sounds will be playing?
            </label>
            <input
              type="text"
              placeholder="Favorite song, nature sounds, cheering..."
              value={celebrationDetails.musicOrSounds}
              onChange={(e) => setCelebrationDetails({
                ...celebrationDetails,
                musicOrSounds: e.target.value
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              <Crown className="inline-block h-3.5 w-3.5 mr-1" />
              Why is achieving this goal significant?
            </label>
            <input
              type="text"
              placeholder="Life milestone, dream achieved, tribute..."
              value={celebrationDetails.significance}
              onChange={(e) => setCelebrationDetails({
                ...celebrationDetails,
                significance: e.target.value
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              <MountainSnow className="inline-block h-3.5 w-3.5 mr-1" />
              Visualization Notes (details that bring it to life)
            </label>
            <textarea
              placeholder="Describe details of this moment - what you see, feel, taste, smell, hear..."
              value={celebrationDetails.visualizationNotes}
              onChange={(e) => setCelebrationDetails({
                ...celebrationDetails,
                visualizationNotes: e.target.value
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={saveCelebrationDetails}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center"
            >
              <Save className="h-4 w-4 mr-1.5" />
              <span>Save Vision</span>
            </button>
          </div>
        </div>
      ) : (
        // Display mode
        <div>
          {Object.values(celebrationDetails).every(value => !value) ? (
            // No celebration details yet
            <div className="text-center py-8">
              <PartyPopper className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h4 className="text-gray-400 font-medium mb-3">Create Your Celebration Vision</h4>
              <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
                Visualize how you'll celebrate achieving this dream. Detailing your celebration helps cement your commitment and makes the goal feel real and attainable.
              </p>
              <button
                onClick={() => setEditing(true)}
                className="py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center mx-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Create Celebration Vision</span>
              </button>
            </div>
          ) : (
            // Display celebration details
            <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {celebrationDetails.location && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Map className="h-3.5 w-3.5 mr-1" />
                      Location
                    </h5>
                    <p className="text-white">{celebrationDetails.location}</p>
                  </div>
                )}
                
                {celebrationDetails.activity && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <PartyPopper className="h-3.5 w-3.5 mr-1" />
                      Activity
                    </h5>
                    <p className="text-white">{celebrationDetails.activity}</p>
                  </div>
                )}
                
                {celebrationDetails.companions && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Heart className="h-3.5 w-3.5 mr-1" />
                      Companions
                    </h5>
                    <p className="text-white">{celebrationDetails.companions}</p>
                  </div>
                )}
                
                {celebrationDetails.feelings && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Feelings
                    </h5>
                    <p className="text-white">{celebrationDetails.feelings}</p>
                  </div>
                )}
                
                {celebrationDetails.reward && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Trophy className="h-3.5 w-3.5 mr-1" />
                      Reward
                    </h5>
                    <p className="text-white">{celebrationDetails.reward}</p>
                  </div>
                )}
                
                {celebrationDetails.musicOrSounds && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Party className="h-3.5 w-3.5 mr-1" />
                      Soundscape
                    </h5>
                    <p className="text-white">{celebrationDetails.musicOrSounds}</p>
                  </div>
                )}
                
                {celebrationDetails.celebrationDate && (
                  <div>
                    <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Target Date
                    </h5>
                    <p className="text-white">{new Date(celebrationDetails.celebrationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {celebrationDetails.significance && (
                <div className="mb-5">
                  <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-1 flex items-center">
                    <Crown className="h-3.5 w-3.5 mr-1" />
                    Significance
                  </h5>
                  <p className="text-white">{celebrationDetails.significance}</p>
                </div>
              )}
              
              {celebrationDetails.visualizationNotes && (
                <div>
                  <h5 className="text-blue-400 text-xs uppercase tracking-wider mb-2 flex items-center">
                    <MountainSnow className="h-3.5 w-3.5 mr-1" />
                    Visualization Details
                  </h5>
                  <div className="bg-gray-800 p-4 rounded border border-gray-700">
                    <p className="text-gray-300 italic text-sm whitespace-pre-line">
                      "{celebrationDetails.visualizationNotes}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Daily visualization reminder */}
      {!editing && !Object.values(celebrationDetails).every(value => !value) && (
        <div className="mt-6 p-3 bg-purple-900/20 border border-purple-800 rounded-md flex items-start">
          <Clock className="h-5 w-5 text-purple-400 flex-shrink-0 mr-3 mt-0.5" />
          <div>
            <h5 className="text-purple-400 font-medium mb-1">Daily Visualization Practice</h5>
            <p className="text-gray-300 text-sm">
              Take 2 minutes each day to close your eyes and vividly imagine this celebration. The more you visualize it, the more real it becomes to your subconscious mind.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelebrationComponent;