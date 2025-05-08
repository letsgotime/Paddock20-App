import React, { useState, useEffect } from 'react';
import { 
  Activity, Battery, BatteryMedium, BatteryLow, BarChart, Calendar, 
  Clock, Zap, Flame, ThumbsUp, ThumbsDown, Award, AlertCircle
} from 'lucide-react';

const DynamicMoodEnergyTracker = ({ driveData, onUpdate }) => {
  const [moodRating, setMoodRating] = useState(driveData?.mood || 7);
  const [energyLevel, setEnergyLevel] = useState(driveData?.energy || 8);
  const [focusLevel, setFocusLevel] = useState(driveData?.focus || 8);
  const [timestamp, setTimestamp] = useState(driveData?.timestamp || new Date().toISOString());
  const [notes, setNotes] = useState(driveData?.moodNotes || '');
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [editMode, setEditMode] = useState(!driveData);

  useEffect(() => {
    if (driveData) {
      setMoodRating(driveData.mood || 7);
      setEnergyLevel(driveData.energy || 8);
      setFocusLevel(driveData.focus || 8);
      setTimestamp(driveData.timestamp || new Date().toISOString());
      setNotes(driveData.moodNotes || '');
    }
  }, [driveData]);

  const handleSave = () => {
    const updatedData = {
      ...(driveData || {}),
      mood: moodRating,
      energy: energyLevel,
      focus: focusLevel,
      timestamp,
      moodNotes: notes
    };
    
    onUpdate(updatedData);
    setEditMode(false);
  };

  const getMoodLabel = (rating) => {
    if (rating >= 9) return 'Optimal Zone (Flying Lap)';
    if (rating >= 7) return 'Green Sector';
    if (rating >= 5) return 'Yellow Sector';
    if (rating >= 3) return 'Red Sector';
    return 'Black Flag';
  };

  const getEnergyLabel = (level) => {
    if (level >= 9) return 'Full Power (DRS Enabled)';
    if (level >= 7) return 'Push Mode';
    if (level >= 5) return 'Standard Mode';
    if (level >= 3) return 'Fuel Saving';
    return 'Box This Lap';
  };

  const getFocusLabel = (level) => {
    if (level >= 9) return 'Qualifying Mode';
    if (level >= 7) return 'Race Focus';
    if (level >= 5) return 'Midfield Battle';
    if (level >= 3) return 'Losing Grip';
    return 'Off Track';
  };

  const getMoodColor = (rating) => {
    if (rating >= 9) return 'text-purple-400';
    if (rating >= 7) return 'text-green-400';
    if (rating >= 5) return 'text-yellow-400';
    if (rating >= 3) return 'text-orange-400';
    return 'text-red-500';
  };

  const getEnergyColor = (level) => {
    if (level >= 9) return 'text-blue-400';
    if (level >= 7) return 'text-green-400';
    if (level >= 5) return 'text-yellow-400';
    if (level >= 3) return 'text-orange-400';
    return 'text-red-500';
  };

  const getFocusColor = (level) => {
    if (level >= 9) return 'text-purple-400';
    if (level >= 7) return 'text-green-400';
    if (level >= 5) return 'text-yellow-400';
    if (level >= 3) return 'text-orange-400';
    return 'text-red-500';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-blue-400 font-orbitron text-lg flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Dynamic Mood & Energy Telemetry
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowTelemetry(!showTelemetry)}
            className="bg-gray-800 text-gray-300 p-2 rounded hover:bg-gray-700"
          >
            <BarChart size={16} />
          </button>
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
            >
              Log Telemetry
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="bg-green-600 text-white p-2 rounded hover:bg-green-500"
            >
              Save Telemetry
            </button>
          )}
        </div>
      </div>

      {showTelemetry && (
        <div className="space-y-4">
          {/* Telemetry Visualization */}
          <div className="grid grid-cols-3 gap-4">
            {/* Mood Rating */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-300 font-medium">Driver Mood</div>
                <ThumbsUp className={`h-5 w-5 ${getMoodColor(moodRating)}`} />
              </div>
              <div className={`text-2xl font-bold ${getMoodColor(moodRating)}`}>
                {moodRating}/10
              </div>
              <div className="text-xs text-gray-400">{getMoodLabel(moodRating)}</div>
              
              {editMode && (
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={moodRating} 
                  onChange={(e) => setMoodRating(parseInt(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
              )}
            </div>

            {/* Energy Level */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-300 font-medium">Energy Level</div>
                <Battery className={`h-5 w-5 ${getEnergyColor(energyLevel)}`} />
              </div>
              <div className={`text-2xl font-bold ${getEnergyColor(energyLevel)}`}>
                {energyLevel}/10
              </div>
              <div className="text-xs text-gray-400">{getEnergyLabel(energyLevel)}</div>
              
              {editMode && (
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={energyLevel} 
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
              )}
            </div>

            {/* Focus Level */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-300 font-medium">Focus Level</div>
                <Zap className={`h-5 w-5 ${getFocusColor(focusLevel)}`} />
              </div>
              <div className={`text-2xl font-bold ${getFocusColor(focusLevel)}`}>
                {focusLevel}/10
              </div>
              <div className="text-xs text-gray-400">{getFocusLabel(focusLevel)}</div>
              
              {editMode && (
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={focusLevel} 
                  onChange={(e) => setFocusLevel(parseInt(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
              )}
            </div>
          </div>

          {/* Visual Telemetry Bars */}
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="grid grid-cols-10 gap-1 mb-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={`mood-${i}`}
                  className={`h-1.5 rounded-full ${i < moodRating ? getMoodColor(moodRating) : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-1 mb-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={`energy-${i}`}
                  className={`h-1.5 rounded-full ${i < energyLevel ? getEnergyColor(energyLevel) : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={`focus-${i}`}
                  className={`h-1.5 rounded-full ${i < focusLevel ? getFocusColor(focusLevel) : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
          </div>
          
          {/* Notes Section */}
          {editMode ? (
            <div className="bg-gray-800 p-3 rounded-lg">
              <label className="block text-gray-300 mb-2">Driver Notes</label>
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about current mood, energy levels, focus..."
              ></textarea>
            </div>
          ) : notes ? (
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-gray-300 font-medium mb-1">Driver Notes</div>
              <div className="text-gray-400 text-sm">{notes}</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DynamicMoodEnergyTracker;