import React, { useState, useEffect } from 'react';
import { Line } from 'recharts';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Frown, 
  Smile, 
  Meh, 
  Zap, 
  BatteryLow, 
  BatteryMedium, 
  BatteryFull, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns';

const MoodEnergyTracker = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [mood, setMood] = useState(3); // 1-5 scale
  const [energy, setEnergy] = useState(3); // 1-5 scale
  const [notes, setNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [view, setView] = useState('week'); // 'week', 'month', 'year'
  
  // Initialize or load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('moodEnergyData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setHistoryData(parsedData);
        
        // Check if there's an entry for today
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayEntry = parsedData.find(entry => entry.date === today);
        
        if (todayEntry) {
          setMood(todayEntry.mood);
          setEnergy(todayEntry.energy);
          setNotes(todayEntry.notes || '');
        }
      } catch (err) {
        console.error('Error parsing saved mood/energy data:', err);
      }
    }
  }, []);

  // Save data to localStorage whenever historyData changes
  useEffect(() => {
    if (historyData.length > 0) {
      localStorage.setItem('moodEnergyData', JSON.stringify(historyData));
    }
  }, [historyData]);

  const handleSaveEntry = () => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingEntryIndex = historyData.findIndex(entry => entry.date === formattedDate);
    
    const newEntry = {
      date: formattedDate,
      displayDate: format(date, 'MMM d'),
      mood,
      energy,
      notes,
      timestamp: new Date().toISOString()
    };
    
    let newHistoryData;
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      newHistoryData = [...historyData];
      newHistoryData[existingEntryIndex] = newEntry;
    } else {
      // Add new entry and sort by date
      newHistoryData = [...historyData, newEntry].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
    }
    
    setHistoryData(newHistoryData);
    
    toast({
      title: existingEntryIndex >= 0 ? "Entry Updated" : "Entry Added",
      description: `Your mood and energy levels for ${format(date, 'MMMM d, yyyy')} have been saved.`,
      variant: "success",
    });
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate;
    
    switch(view) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return historyData.filter(entry => new Date(entry.date) >= startDate);
  };

  // Calculate average mood and energy for the selected time period
  const getAverages = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) return { avgMood: 0, avgEnergy: 0 };
    
    const moodSum = filteredData.reduce((sum, entry) => sum + entry.mood, 0);
    const energySum = filteredData.reduce((sum, entry) => sum + entry.energy, 0);
    
    return {
      avgMood: (moodSum / filteredData.length).toFixed(1),
      avgEnergy: (energySum / filteredData.length).toFixed(1)
    };
  };

  // Mood emoji based on the value
  const getMoodEmoji = (value) => {
    switch (value) {
      case 1: return <Frown className="text-red-500" size={24} />;
      case 2: return <Meh className="text-yellow-500" size={24} />;
      case 3: return <Meh className="text-blue-400" size={24} />;
      case 4: return <Smile className="text-green-400" size={24} />;
      case 5: return <ThumbsUp className="text-green-500" size={24} />;
      default: return <Meh className="text-gray-400" size={24} />;
    }
  };

  // Energy icon based on the value
  const getEnergyIcon = (value) => {
    switch (value) {
      case 1: return <BatteryLow className="text-red-500" size={24} />;
      case 2: return <BatteryLow className="text-yellow-500" size={24} />;
      case 3: return <BatteryMedium className="text-blue-400" size={24} />;
      case 4: return <BatteryMedium className="text-green-400" size={24} />;
      case 5: return <BatteryFull className="text-green-500" size={24} />;
      default: return <BatteryMedium className="text-gray-400" size={24} />;
    }
  };

  const { avgMood, avgEnergy } = getAverages();
  const filteredData = getFilteredData();

  return (
    <div className="bg-black/30 rounded-lg border border-gray-800 p-4">
      <h2 className="bts-header-green mb-4">Mood & Energy Tracker</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Today's Entry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-orbitron text-blue-400">
              {format(date, 'MMMM d, yyyy')}
            </h3>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-green-500 text-green-500 hover:bg-green-900/20"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" /> Change Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black border border-gray-700">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    if (date) {
                      setDate(date);
                      
                      // Look for existing entry for this date
                      const formattedDate = format(date, 'yyyy-MM-dd');
                      const existingEntry = historyData.find(entry => entry.date === formattedDate);
                      
                      if (existingEntry) {
                        setMood(existingEntry.mood);
                        setEnergy(existingEntry.energy);
                        setNotes(existingEntry.notes || '');
                      } else {
                        // Reset to defaults for new date
                        setMood(3);
                        setEnergy(3);
                        setNotes('');
                      }
                      
                      setShowCalendar(false);
                    }
                  }}
                  className="bg-black"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Mood Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-gray-300">Mood</label>
              <div>{getMoodEmoji(mood)}</div>
            </div>
            <Slider 
              value={[mood]} 
              min={1} 
              max={5} 
              step={1} 
              onValueChange={(value) => setMood(value[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          {/* Energy Slider */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <label className="text-gray-300">Energy</label>
              <div>{getEnergyIcon(energy)}</div>
            </div>
            <Slider 
              value={[energy]} 
              min={1} 
              max={5} 
              step={1} 
              onValueChange={(value) => setEnergy(value[0])}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2 mt-4">
            <label className="text-gray-300">Notes</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-black/50 border border-gray-700 rounded-md p-2 text-white"
              placeholder="Add any notes about your day..."
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSaveEntry}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Save Entry
          </Button>
        </div>
        
        {/* Right column: History Graph */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-orbitron text-blue-400">Trends</h3>
            <div className="flex space-x-2">
              <Button 
                variant={view === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setView('week')}
                className={view === 'week' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-500'}
              >
                Week
              </Button>
              <Button 
                variant={view === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setView('month')}
                className={view === 'month' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-500'}
              >
                Month
              </Button>
              <Button 
                variant={view === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setView('year')}
                className={view === 'year' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500 text-green-500'}
              >
                Year
              </Button>
            </div>
          </div>
          
          {/* Average Indicators */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-400">Average Mood</div>
              <div className="flex items-center mt-1">
                <div className="text-2xl font-bold mr-2">{avgMood}</div>
                {getMoodEmoji(Math.round(avgMood))}
              </div>
            </div>
            <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-400">Average Energy</div>
              <div className="flex items-center mt-1">
                <div className="text-2xl font-bold mr-2">{avgEnergy}</div>
                {getEnergyIcon(Math.round(avgEnergy))}
              </div>
            </div>
          </div>
          
          {/* Chart */}
          {filteredData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#666" 
                    tick={{ fill: '#999' }}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    stroke="#666" 
                    tick={{ fill: '#999' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111', 
                      borderColor: '#333',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="mood" 
                    fill="rgba(34, 197, 94, 0.2)" 
                    stroke="#22c55e" 
                    activeDot={{ r: 8 }}
                    name="Mood"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }}
                    name="Energy"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-black/20 rounded-lg border border-gray-800">
              <AlertCircle className="text-yellow-500 mb-2" size={32} />
              <p className="text-gray-400">No data for this period</p>
              <p className="text-xs text-gray-500">Add entries to see your trends</p>
            </div>
          )}
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
              <span className="text-gray-400">Entries:</span> {filteredData.length}
            </div>
            <div className="bg-black/40 p-2 rounded-lg border border-gray-800">
              <span className="text-gray-400">Period:</span> {view.charAt(0).toUpperCase() + view.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodEnergyTracker;