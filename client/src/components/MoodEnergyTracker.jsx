import React, { useState, useEffect } from 'react';
import { 
  Smile, Frown, Battery, Gauge, Sparkles, 
  TrendingUp, Calendar, Clock, ChevronDown, Activity,
  Zap, Flame, Minus, BarChart3, Wind
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MoodEnergyTracker = ({ 
  entries = [], 
  onSave, 
  currentMood = 5, 
  currentEnergy = 5,
  showHistory = true 
}) => {
  const [mood, setMood] = useState(currentMood);
  const [energy, setEnergy] = useState(currentEnergy);
  const [note, setNote] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Process entries for chart display whenever entries change
  useEffect(() => {
    if (!entries?.length) return;
    
    // Format data for chart display
    const formattedData = entries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString(),
      time: new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: entry.mood,
      energy: entry.energy,
      note: entry.note || ""
    }));
    
    setChartData(formattedData);
  }, [entries]);

  const handleMoodChange = (e) => {
    setMood(parseInt(e.target.value, 10));
  };

  const handleEnergyChange = (e) => {
    setEnergy(parseInt(e.target.value, 10));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        mood,
        energy,
        note,
        date: new Date().toISOString()
      });
      setNote("");
    }
  };

  const getMoodEmoji = (value) => {
    if (value <= 3) return '😞';
    if (value <= 5) return '😐';
    if (value <= 7) return '🙂';
    return '😄';
  };

  const getEnergyEmoji = (value) => {
    if (value <= 3) return '🔋';
    if (value <= 5) return '🔋🔋';
    if (value <= 7) return '🔋🔋🔋';
    return '⚡';
  };

  const getMoodColor = (value) => {
    if (value <= 3) return 'text-red-500';
    if (value <= 5) return 'text-yellow-500';
    if (value <= 7) return 'text-blue-400';
    return 'text-green-500';
  };

  const getEnergyColor = (value) => {
    if (value <= 3) return 'text-red-500';
    if (value <= 5) return 'text-yellow-500';
    if (value <= 7) return 'text-blue-400';
    return 'text-green-500';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-fadeIn shadow-lg">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-blue-400" />
        Dynamic Mood & Energy Tracker
      </h3>
      
      {/* Current Mood & Energy Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Smile className={`h-5 w-5 mr-2 ${getMoodColor(mood)}`} />
              <span className="text-white">Mood</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">{getMoodEmoji(mood)}</span>
              <span className={`font-bold ${getMoodColor(mood)}`}>{mood}/10</span>
            </div>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={handleMoodChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Low</span>
            <span>Neutral</span>
            <span>High</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Battery className={`h-5 w-5 mr-2 ${getEnergyColor(energy)}`} />
              <span className="text-white">Energy</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl mr-2">{getEnergyEmoji(energy)}</span>
              <span className={`font-bold ${getEnergyColor(energy)}`}>{energy}/10</span>
            </div>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={handleEnergyChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Drained</span>
            <span>Steady</span>
            <span>Energized</span>
          </div>
        </div>
      </div>
      
      {/* Optional Note */}
      <div className="mb-4">
        <textarea
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          rows="2"
          placeholder="Add a note about how you're feeling... (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
      
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center"
        >
          <span>Save</span>
          <TrendingUp className="ml-2 h-4 w-4" />
        </button>
      </div>
      
      {/* History Section */}
      {showHistory && chartData.length > 0 && (
        <div className="mt-6 border-t border-gray-800 pt-4">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setShowFullHistory(!showFullHistory)}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              <h4 className="text-md font-medium text-white">Mood & Energy History</h4>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showFullHistory ? 'transform rotate-180' : ''}`} />
          </div>
          
          {showFullHistory && (
            <div className="animate-fadeIn">
              <div className="w-full h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#999"
                      tick={{fill: '#999'}}
                    />
                    <YAxis domain={[0, 10]} stroke="#999" tick={{fill: '#999'}} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#111',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 styled-scrollbar">
                {chartData.slice().reverse().map((entry, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-400">{entry.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-400">{entry.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <Smile className={`h-4 w-4 mr-1 ${getMoodColor(entry.mood)}`} />
                        <span className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                          Mood: {entry.mood}/10
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Battery className={`h-4 w-4 mr-1 ${getEnergyColor(entry.energy)}`} />
                        <span className={`text-sm font-medium ${getEnergyColor(entry.energy)}`}>
                          Energy: {entry.energy}/10
                        </span>
                      </div>
                    </div>
                    
                    {entry.note && (
                      <div className="mt-2 text-sm text-gray-300 bg-gray-700/50 p-2 rounded">
                        {entry.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodEnergyTracker;