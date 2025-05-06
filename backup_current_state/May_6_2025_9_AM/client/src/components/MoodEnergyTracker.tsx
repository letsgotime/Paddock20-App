import React, { useState } from 'react';

interface MoodEnergy {
  mood: number;
  energy: number;
  focus: number;
  confidence: number;
  comfort: number;
  trackFamiliarity: number;
  excitementFactor: number;
  stressLevel: number;
  timestamps?: {
    [key: string]: {
      mood?: number;
      energy?: number;
      note?: string;
    }
  };
  notes?: string;
}

interface MoodEnergyTrackerProps {
  moodEnergyData: MoodEnergy;
  onChange: (data: MoodEnergy) => void;
  isEditing: boolean;
  distanceMiles?: number;
}

const MoodEnergyTracker: React.FC<MoodEnergyTrackerProps> = ({ 
  moodEnergyData, 
  onChange, 
  isEditing,
  distanceMiles = 100
}) => {
  const [showAddTimestamp, setShowAddTimestamp] = useState(false);
  const [newTimestampData, setNewTimestampData] = useState({
    position: "0",
    mood: 8,
    energy: 8,
    note: ""
  });
  
  // F1 color scheme for charts
  const colors = {
    mood: "#00FFFF", // Cyan
    energy: "#FF00FF", // Magenta
    focus: "#FFFF00", // Yellow
    confidence: "#7CFC00", // Lawn Green
    comfort: "#FF4500", // OrangeRed
    familiarity: "#1E90FF", // DodgerBlue
    excitement: "#FF1493", // DeepPink
    stress: "#FF0000", // Red
    background: "#121212",
    gridLines: "#333333",
    text: "#FFFFFF"
  };
  
  const handleMoodEnergyChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof MoodEnergy) => {
    const value = parseInt(e.target.value);
    onChange({
      ...moodEnergyData,
      [field]: value
    });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...moodEnergyData,
      notes: e.target.value
    });
  };
  
  const handleNewTimestampChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTimestampData({
      ...newTimestampData,
      [name]: name === 'note' ? value : parseInt(value)
    });
  };
  
  const addNewTimestamp = () => {
    const timestamps = {...(moodEnergyData.timestamps || {})};
    timestamps[newTimestampData.position] = {
      mood: newTimestampData.mood,
      energy: newTimestampData.energy,
      note: newTimestampData.note
    };
    
    onChange({
      ...moodEnergyData,
      timestamps
    });
    
    setShowAddTimestamp(false);
    setNewTimestampData({
      position: "0",
      mood: 8,
      energy: 8,
      note: ""
    });
  };
  
  const removeTimestamp = (key: string) => {
    const timestamps = {...(moodEnergyData.timestamps || {})};
    delete timestamps[key];
    
    onChange({
      ...moodEnergyData,
      timestamps
    });
  };
  
  // Convert timestamps to graph data points
  const getGraphData = () => {
    if (!moodEnergyData.timestamps) return { moodPoints: [], energyPoints: [] };
    
    const timestamps = moodEnergyData.timestamps;
    const keys = Object.keys(timestamps).sort((a, b) => parseInt(a) - parseInt(b));
    
    const moodPoints: [number, number][] = keys.map(key => [parseInt(key), timestamps[key].mood || 0]);
    const energyPoints: [number, number][] = keys.map(key => [parseInt(key), timestamps[key].energy || 0]);
    
    // Add current mood/energy at the 100% mark if not already present
    if (!keys.includes(distanceMiles.toString())) {
      moodPoints.push([distanceMiles, moodEnergyData.mood]);
      energyPoints.push([distanceMiles, moodEnergyData.energy]);
    }
    
    return { moodPoints, energyPoints };
  };
  
  const renderMoodEnergyGraph = () => {
    const graphHeight = 180;
    const graphWidth = 500;
    const { moodPoints, energyPoints } = getGraphData();
    
    // Normalize positions to graph width
    const normalizeX = (x: number) => (x / distanceMiles) * graphWidth;
    // Normalize values (1-10) to graph height (inverted, top is 10)
    const normalizeY = (y: number) => graphHeight - ((y - 1) / 9) * graphHeight;
    
    // Create SVG path data strings
    const createPathData = (points: [number, number][]) => {
      if (points.length === 0) return '';
      
      return points
        .map((point, i) => {
          const [x, y] = point;
          const nx = normalizeX(x);
          const ny = normalizeY(y);
          return i === 0 ? `M ${nx},${ny}` : `L ${nx},${ny}`;
        })
        .join(' ');
    };
    
    const moodPathData = createPathData(moodPoints);
    const energyPathData = createPathData(energyPoints);
    
    return (
      <div className="bg-black p-2 rounded-lg border border-gray-800">
        <h4 className="text-blue-400 font-medium mb-2 text-center">Driver Metrics Telemetry</h4>
        <svg 
          width={graphWidth} 
          height={graphHeight} 
          viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pos => (
            <line 
              key={`vline-${pos}`}
              x1={normalizeX(pos * distanceMiles)} 
              y1="0" 
              x2={normalizeX(pos * distanceMiles)} 
              y2={graphHeight} 
              stroke={colors.gridLines}
              strokeDasharray="4 4"
            />
          ))}
          {[1, 3, 5, 7, 9].map(value => (
            <line 
              key={`hline-${value}`}
              x1="0" 
              y1={normalizeY(value)} 
              x2={graphWidth} 
              y2={normalizeY(value)} 
              stroke={colors.gridLines}
              strokeDasharray="4 4"
            />
          ))}
          
          {/* Distance markers */}
          {[0, 0.25, 0.5, 0.75, 1].map(pos => (
            <text 
              key={`dist-${pos}`}
              x={normalizeX(pos * distanceMiles)} 
              y={graphHeight + 15} 
              textAnchor="middle" 
              fill={colors.text}
              fontSize="10"
            >
              {Math.round(pos * distanceMiles)}
            </text>
          ))}
          
          {/* Value markers */}
          {[1, 3, 5, 7, 9].map(value => (
            <text 
              key={`val-${value}`}
              x="-5" 
              y={normalizeY(value)} 
              textAnchor="end" 
              fill={colors.text}
              fontSize="10"
              dominantBaseline="middle"
            >
              {value}
            </text>
          ))}
          
          {/* Data lines */}
          <path d={moodPathData} fill="none" stroke={colors.mood} strokeWidth="2" />
          <path d={energyPathData} fill="none" stroke={colors.energy} strokeWidth="2" />
          
          {/* Data points */}
          {moodPoints.map(([x, y], i) => (
            <circle 
              key={`mood-${i}`}
              cx={normalizeX(x)} 
              cy={normalizeY(y)} 
              r="4" 
              fill={colors.mood} 
            />
          ))}
          {energyPoints.map(([x, y], i) => (
            <circle 
              key={`energy-${i}`}
              cx={normalizeX(x)} 
              cy={normalizeY(y)} 
              r="4" 
              fill={colors.energy} 
            />
          ))}
          
          {/* Legend */}
          <circle cx="380" cy="15" r="4" fill={colors.mood} />
          <text x="390" y="15" fill={colors.mood} fontSize="10" dominantBaseline="middle">Mood</text>
          <circle cx="380" cy="30" r="4" fill={colors.energy} />
          <text x="390" y="30" fill={colors.energy} fontSize="10" dominantBaseline="middle">Energy</text>
          
          {/* X and Y axis labels */}
          <text x={graphWidth / 2} y={graphHeight + 30} textAnchor="middle" fill={colors.text} fontSize="10">Distance (miles)</text>
          <text x="-30" y={graphHeight / 2} textAnchor="middle" fill={colors.text} fontSize="10" transform={`rotate(270, -30, ${graphHeight / 2})`}>Rating (1-10)</text>
        </svg>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h3 className="text-blue-400 font-semibold mb-3">Driver Mood & Energy Tracker</h3>
        
        {/* Mood & Energy values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Mood</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.mood}
                onChange={(e) => handleMoodEnergyChange(e, 'mood')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${(moodEnergyData.mood / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.mood}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Energy</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.energy}
                onChange={(e) => handleMoodEnergyChange(e, 'energy')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-fuchsia-500"
                    style={{ width: `${(moodEnergyData.energy / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.energy}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Focus</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.focus}
                onChange={(e) => handleMoodEnergyChange(e, 'focus')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(moodEnergyData.focus / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.focus}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Confidence</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.confidence}
                onChange={(e) => handleMoodEnergyChange(e, 'confidence')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-lime-500"
                    style={{ width: `${(moodEnergyData.confidence / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.confidence}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Comfort</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.comfort}
                onChange={(e) => handleMoodEnergyChange(e, 'comfort')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${(moodEnergyData.comfort / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.comfort}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Route Familiarity</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.trackFamiliarity}
                onChange={(e) => handleMoodEnergyChange(e, 'trackFamiliarity')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(moodEnergyData.trackFamiliarity / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.trackFamiliarity}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Excitement</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.excitementFactor}
                onChange={(e) => handleMoodEnergyChange(e, 'excitementFactor')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-pink-500"
                    style={{ width: `${(moodEnergyData.excitementFactor / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.excitementFactor}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Stress Level</label>
            {isEditing ? (
              <input 
                type="range"
                min="1"
                max="10"
                value={moodEnergyData.stressLevel}
                onChange={(e) => handleMoodEnergyChange(e, 'stressLevel')}
                className="w-full"
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="h-2 w-full bg-gray-700 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(moodEnergyData.stressLevel / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-white font-medium">{moodEnergyData.stressLevel}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Notes */}
        <div className="mt-4">
          <label className="block text-gray-400 text-sm mb-1">Driver Notes</label>
          {isEditing ? (
            <textarea
              value={moodEnergyData.notes || ''}
              onChange={handleNotesChange}
              className="w-full h-20 bg-gray-800 text-white rounded border border-gray-700 p-2"
              placeholder="Add notes about your mental state during the drive..."
            />
          ) : (
            <div className="bg-gray-800 text-white rounded border border-gray-700 p-2 min-h-[5rem]">
              {moodEnergyData.notes || <span className="text-gray-500 italic">No notes added</span>}
            </div>
          )}
        </div>
        
        {/* Telemetry Graph */}
        <div className="mt-6 flex justify-center">
          {renderMoodEnergyGraph()}
        </div>
        
        {/* Mood and Energy Timestamps */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-medium">Mood & Energy Log</h4>
            {isEditing && (
              <button
                onClick={() => setShowAddTimestamp(true)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Log Point
              </button>
            )}
          </div>
          
          {showAddTimestamp && (
            <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-700">
              <h5 className="text-white text-sm font-medium mb-2">Add New Telemetry Point</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Distance (miles)</label>
                  <input
                    type="number"
                    name="position"
                    min="0"
                    max={distanceMiles}
                    step="0.1"
                    value={newTimestampData.position}
                    onChange={handleNewTimestampChange}
                    className="w-full p-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Mood (1-10)</label>
                  <input
                    type="number"
                    name="mood"
                    min="1"
                    max="10"
                    value={newTimestampData.mood}
                    onChange={handleNewTimestampChange}
                    className="w-full p-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Energy (1-10)</label>
                  <input
                    type="number"
                    name="energy"
                    min="1"
                    max="10"
                    value={newTimestampData.energy}
                    onChange={handleNewTimestampChange}
                    className="w-full p-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-gray-400 text-xs mb-1">Note</label>
                <input
                  type="text"
                  name="note"
                  value={newTimestampData.note}
                  onChange={handleNewTimestampChange}
                  className="w-full p-1 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  placeholder="Optional note about this point in the drive..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddTimestamp(false)}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewTimestamp}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          
          {moodEnergyData.timestamps && Object.keys(moodEnergyData.timestamps).length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(moodEnergyData.timestamps)
                .sort(([posA], [posB]) => parseInt(posA) - parseInt(posB))
                .map(([position, data]) => (
                  <div key={position} className="p-2 bg-gray-800 rounded border border-gray-700 flex justify-between">
                    <div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-400 text-sm">{position} miles</span>
                        <div className="flex items-center">
                          <span className="text-cyan-500 text-sm font-medium mr-1">M: {data.mood}</span>
                          <div className="h-2 w-10 bg-gray-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-cyan-500"
                              style={{ width: `${((data.mood || 1) / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-fuchsia-500 text-sm font-medium mr-1">E: {data.energy}</span>
                          <div className="h-2 w-10 bg-gray-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-fuchsia-500"
                              style={{ width: `${((data.energy || 1) / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {data.note && (
                        <p className="text-white text-sm mt-1">{data.note}</p>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeTimestamp(position)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-800 rounded border border-gray-700">
              <p className="text-gray-400 text-sm">No mood/energy log points added</p>
              {isEditing && (
                <button
                  onClick={() => setShowAddTimestamp(true)}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Add your first log point
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodEnergyTracker;