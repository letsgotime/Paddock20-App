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

  // F1-style terminology for mood levels
  const getMoodTerm = (value) => {
    if (value <= 2) return 'Pit Stop Needed';
    if (value <= 4) return 'Out of the Racing Line';
    if (value <= 6) return 'On the Grid';
    if (value <= 8) return 'Flying Lap';
    return 'Pole Position';
  };

  // F1-style terminology for energy levels
  const getEnergyTerm = (value) => {
    if (value <= 2) return 'Empty Tank';
    if (value <= 4) return 'Fuel Conservation';
    if (value <= 6) return 'Standard Mode';
    if (value <= 8) return 'Power Mode';
    return 'Maximum Attack';
  };

  // Get appropriate icon based on mood level
  const getMoodIcon = (value) => {
    if (value <= 3) return <Minus className="h-5 w-5 text-red-500" />;
    if (value <= 5) return <Activity className="h-5 w-5 text-yellow-500" />;
    if (value <= 7) return <Smile className="h-5 w-5 text-blue-400" />;
    return <Flame className="h-5 w-5 text-green-500" />;
  };

  // Get appropriate icon based on energy level
  const getEnergyIcon = (value) => {
    if (value <= 3) return <Battery className="h-5 w-5 text-red-500" />;
    if (value <= 5) return <Gauge className="h-5 w-5 text-yellow-500" />;
    if (value <= 7) return <Zap className="h-5 w-5 text-blue-400" />;
    return <Wind className="h-5 w-5 text-green-500" />;
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
  
  // Get background gradient for the mood/energy bars
  const getMoodGradient = (value) => {
    if (value <= 3) return 'bg-gradient-to-r from-red-900/30 to-red-500/30';
    if (value <= 5) return 'bg-gradient-to-r from-yellow-900/30 to-yellow-500/30';
    if (value <= 7) return 'bg-gradient-to-r from-blue-900/30 to-blue-500/30';
    return 'bg-gradient-to-r from-green-900/30 to-green-500/30';
  };
  
  const getEnergyGradient = (value) => {
    if (value <= 3) return 'bg-gradient-to-r from-red-900/30 to-red-500/30';
    if (value <= 5) return 'bg-gradient-to-r from-yellow-900/30 to-yellow-500/30';
    if (value <= 7) return 'bg-gradient-to-r from-blue-900/30 to-blue-500/30';
    return 'bg-gradient-to-r from-green-900/30 to-green-500/30';
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-5 animate-fadeIn shadow-lg">
      <div className="border-b border-blue-900/40 pb-3 mb-5">
        <h3 className="text-lg font-orbitron text-blue-400 flex items-center">
          <Gauge className="mr-2 h-5 w-5 text-blue-400" />
          Driver Telemetry
        </h3>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Clock className="h-3 w-3 mr-1" />
          <span>Session: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Current Mood & Energy Input with F1 Telemetry Style */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Mood Telemetry */}
        <div className={`${getMoodGradient(mood)} rounded-lg p-4 border border-gray-800`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {getMoodIcon(mood)}
              <span className="text-white font-orbitron ml-2">DRIVER MOOD</span>
            </div>
            <div className="flex items-center">
              <span className={`font-bold font-orbitron text-lg ${getMoodColor(mood)}`}>{mood} / 10</span>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="font-orbitron text-sm text-gray-400 mb-1">Racing Condition</div>
            <div className={`font-orbitron text-lg ${getMoodColor(mood)}`}>{getMoodTerm(mood)}</div>
          </div>
          
          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={handleMoodChange}
              className="w-full h-3 bg-gray-700/70 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            
            <div className="grid grid-cols-5 text-xs text-gray-500">
              <span>Pit Lane</span>
              <span className="text-center">Sector 1</span>
              <span className="text-center">Sector 2</span>
              <span className="text-center">Sector 3</span>
              <span className="text-right">Checkered Flag</span>
            </div>
          </div>
        </div>
        
        {/* Energy Telemetry */}
        <div className={`${getEnergyGradient(energy)} rounded-lg p-4 border border-gray-800`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {getEnergyIcon(energy)}
              <span className="text-white font-orbitron ml-2">POWER UNIT</span>
            </div>
            <div className="flex items-center">
              <span className={`font-bold font-orbitron text-lg ${getEnergyColor(energy)}`}>{energy} / 10</span>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="font-orbitron text-sm text-gray-400 mb-1">Engine Mode</div>
            <div className={`font-orbitron text-lg ${getEnergyColor(energy)}`}>{getEnergyTerm(energy)}</div>
          </div>
          
          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={handleEnergyChange}
              className="w-full h-3 bg-gray-700/70 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            
            <div className="grid grid-cols-5 text-xs text-gray-500">
              <span>Critical</span>
              <span className="text-center">Conservative</span>
              <span className="text-center">Balanced</span>
              <span className="text-center">Aggressive</span>
              <span className="text-right">Qualifying</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Race Engineer Notes */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Activity className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm font-orbitron text-white">RACE ENGINEER NOTES</span>
        </div>
        <textarea
          className="w-full p-3 rounded bg-black text-white border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-sm"
          rows="2"
          placeholder="Add notes about current conditions or feelings..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>
      
      <div className="flex justify-end mb-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-black font-bold font-orbitron rounded-md hover:bg-blue-500 transition-all duration-200 flex items-center"
        >
          <span>RECORD LAP</span>
          <TrendingUp className="ml-2 h-4 w-4" />
        </button>
      </div>
      
      {/* Telemetry History Section */}
      {showHistory && chartData.length > 0 && (
        <div className="mt-6 border-t border-blue-900/30 pt-5">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setShowFullHistory(!showFullHistory)}
          >
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              <h4 className="text-md font-orbitron text-blue-400">HISTORICAL TELEMETRY</h4>
            </div>
            <div className="flex items-center bg-blue-900/20 px-3 py-1 rounded-md">
              <span className="text-xs text-gray-300 mr-2 font-orbitron">SESSION DATA</span>
              <ChevronDown className={`h-4 w-4 text-blue-400 transition-transform ${showFullHistory ? 'transform rotate-180' : ''}`} />
            </div>
          </div>
          
          {showFullHistory && (
            <div className="animate-fadeIn space-y-6">
              {/* F1-style telemetry charts */}
              <div className="bg-black border border-gray-800 rounded-lg p-4">
                <h5 className="text-sm font-orbitron text-blue-400 mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Driver Performance Trends
                </h5>
                
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#666"
                        tick={{fill: '#999', fontSize: 10}}
                        axisLine={{ stroke: '#333' }}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        stroke="#666" 
                        tick={{fill: '#999', fontSize: 10}}
                        axisLine={{ stroke: '#333' }}
                        tickLine={{ stroke: '#333' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid #333',
                          borderRadius: '4px',
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}
                        formatter={(value, name) => {
                          const label = name === 'mood' ? 'Driver Mood' : 'Power Unit';
                          return [value, label];
                        }}
                        labelFormatter={(time) => `Lap Time: ${time}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mood" 
                        name="Mood"
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorMood)"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="energy" 
                        name="Energy"
                        stroke="#22c55e" 
                        fillOpacity={1}
                        fill="url(#colorEnergy)"
                        strokeWidth={2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Session data log */}
              <div className="space-y-3">
                <h5 className="text-sm font-orbitron text-blue-400 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Previous Sessions Data
                </h5>
                <div className="max-h-80 overflow-y-auto pr-2 styled-scrollbar space-y-3">
                  {chartData.slice().reverse().map((entry, index) => (
                    <div key={index} className="bg-black border border-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs font-orbitron text-gray-400">SESSION: {entry.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="text-xs font-orbitron text-gray-400">LAP TIME: {entry.time}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className={`${getMoodGradient(entry.mood)} p-2 rounded border border-gray-800`}>
                          <div className="text-xs text-gray-400 font-orbitron">DRIVER MOOD</div>
                          <div className="flex items-center justify-between">
                            {getMoodIcon(entry.mood)}
                            <span className={`text-sm font-orbitron ${getMoodColor(entry.mood)}`}>
                              {entry.mood}/10
                            </span>
                          </div>
                          <div className="text-xs mt-1 font-orbitron">{getMoodTerm(entry.mood)}</div>
                        </div>
                        
                        <div className={`${getEnergyGradient(entry.energy)} p-2 rounded border border-gray-800`}>
                          <div className="text-xs text-gray-400 font-orbitron">POWER UNIT</div>
                          <div className="flex items-center justify-between">
                            {getEnergyIcon(entry.energy)}
                            <span className={`text-sm font-orbitron ${getEnergyColor(entry.energy)}`}>
                              {entry.energy}/10
                            </span>
                          </div>
                          <div className="text-xs mt-1 font-orbitron">{getEnergyTerm(entry.energy)}</div>
                        </div>
                      </div>
                      
                      {entry.note && (
                        <div className="mt-2 text-xs text-gray-300 bg-black p-2 rounded border border-gray-800 font-mono">
                          <div className="text-xs text-blue-400 mb-1 font-orbitron">ENGINEER NOTES:</div>
                          {entry.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodEnergyTracker;