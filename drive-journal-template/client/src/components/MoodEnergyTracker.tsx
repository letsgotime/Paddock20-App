import React from 'react';

interface MoodEnergyData {
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
  moodEnergyData: MoodEnergyData;
}

const MoodEnergyTracker: React.FC<MoodEnergyTrackerProps> = ({ moodEnergyData }) => {
  const {
    mood,
    energy,
    focus,
    confidence,
    comfort,
    trackFamiliarity,
    excitementFactor,
    stressLevel,
    timestamps,
    notes
  } = moodEnergyData;

  // Calculate the average mood and energy
  const avgMood = mood;
  const avgEnergy = energy;

  // Format timestamp keys for display
  const formattedTimestamps = timestamps ? 
    Object.entries(timestamps).map(([time, data]) => ({
      time: `${time}%`,
      mood: data.mood,
      energy: data.energy,
      note: data.note
    })).sort((a, b) => Number(a.time.replace('%', '')) - Number(b.time.replace('%', '')))
    : [];

  return (
    <div className="space-y-6">
      {/* Mood & Energy Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Overall Mood</span>
            <span className="text-blue-400 font-medium">{avgMood}/10</span>
          </div>
          <div className="h-3 bg-gray-700 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-green-500" 
              style={{ width: `${avgMood * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Energy Level</span>
            <span className="text-blue-400 font-medium">{avgEnergy}/10</span>
          </div>
          <div className="h-3 bg-gray-700 rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-red-500" 
              style={{ width: `${avgEnergy * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Driver Metrics */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-gray-300 text-sm font-medium mb-4">DRIVER METRICS</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Focus</span>
              <span className="text-blue-300 text-xs">{focus}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${focus * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Confidence</span>
              <span className="text-blue-300 text-xs">{confidence}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${confidence * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Comfort</span>
              <span className="text-blue-300 text-xs">{comfort}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-purple-500" 
                style={{ width: `${comfort * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Route Familiarity</span>
              <span className="text-blue-300 text-xs">{trackFamiliarity}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-yellow-500" 
                style={{ width: `${trackFamiliarity * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Excitement</span>
              <span className="text-blue-300 text-xs">{excitementFactor}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-orange-500" 
                style={{ width: `${excitementFactor * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Stress Level</span>
              <span className="text-blue-300 text-xs">{stressLevel}/10</span>
            </div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div 
                className="h-full bg-red-500" 
                style={{ width: `${stressLevel * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mood & Energy Timeline */}
      {formattedTimestamps.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-4">MOOD & ENERGY TIMELINE</h4>
          
          <div className="relative h-24 mb-6">
            {/* Timeline track */}
            <div className="absolute top-10 left-0 right-0 h-1 bg-gray-700"></div>
            
            {/* Timestamp markers */}
            {formattedTimestamps.map((timestamp, index) => (
              <div 
                key={index}
                className="absolute transform -translate-x-1/2"
                style={{ left: timestamp.time }}
              >
                {/* Mood indicator (circle above timeline) */}
                {timestamp.mood && (
                  <div 
                    className="absolute bottom-1 w-3 h-3 rounded-full bg-blue-500 transform translate-x-1/2" 
                    style={{ 
                      bottom: `${(timestamp.mood || 0) * 4}px`
                    }}
                  ></div>
                )}
                
                {/* Energy indicator (circle below timeline) */}
                {timestamp.energy && (
                  <div 
                    className="absolute top-1 w-3 h-3 rounded-full bg-yellow-500 transform translate-x-1/2" 
                    style={{ 
                      top: `${(timestamp.energy || 0) * 4}px`
                    }}
                  ></div>
                )}
                
                {/* Time marker */}
                <div className="absolute top-0 w-1 h-3 bg-gray-500"></div>
                <div className="absolute top-4 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                  {timestamp.time}
                </div>
              </div>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-0 right-0 flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-gray-400 mr-3">Mood</span>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-gray-400">Energy</span>
            </div>
          </div>
          
          {/* Timestamp notes */}
          <div className="space-y-2 mt-8">
            {formattedTimestamps.map((timestamp, index) => (
              timestamp.note && (
                <div key={index} className="flex">
                  <div className="text-blue-400 text-xs font-medium w-12">
                    {timestamp.time}
                  </div>
                  <div className="text-gray-300 text-xs ml-2">
                    {timestamp.note}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* Notes */}
      {notes && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-gray-300 text-sm font-medium mb-2">MOOD & ENERGY NOTES</h4>
          <p className="text-gray-400 text-sm whitespace-pre-line">{notes}</p>
        </div>
      )}
    </div>
  );
};

export default MoodEnergyTracker;