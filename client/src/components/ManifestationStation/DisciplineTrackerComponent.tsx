import React, { useState } from 'react';
import { Goal, DisciplineStreak } from '../../types/manifestation';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Flame, 
  Clock, 
  BarChart, 
  ArrowUpRight,
  CheckSquare,
  PlusCircle,
  CalendarDays,
  Trophy
} from 'lucide-react';

interface DisciplineTrackerComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

type DisciplineType = 'activity' | 'education' | 'intention';

const DisciplineTrackerComponent: React.FC<DisciplineTrackerComponentProps> = ({ goal, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<DisciplineType>('activity');
  const [minutes, setMinutes] = useState<number>(15);
  const [notes, setNotes] = useState<string>('');
  
  // Initialize discipline streaks if they don't exist
  if (!goal.disciplineStreaks) {
    goal.disciplineStreaks = {
      activity: {
        type: 'activity',
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        history: []
      },
      education: {
        type: 'education',
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        history: []
      },
      intention: {
        type: 'intention',
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        history: []
      }
    };
  }
  
  // Get the active discipline streak
  const activeStreak = goal.disciplineStreaks[activeTab];
  
  // Check if today's activity is already complete
  const today = new Date().toISOString().split('T')[0];
  const isTodayComplete = activeStreak.history.some(
    entry => entry.date.split('T')[0] === today && entry.completed
  );
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Log today's progress
  const logTodayProgress = () => {
    if (isTodayComplete) return;
    
    const updatedGoal = { ...goal };
    const todayEntry = {
      date: new Date().toISOString(),
      completed: true,
      minutes: minutes,
      notes: notes
    };
    
    // Add today's entry to history
    updatedGoal.disciplineStreaks![activeTab].history.unshift(todayEntry);
    
    // Update streak counters
    const currentStreak = updatedGoal.disciplineStreaks![activeTab].currentStreak + 1;
    updatedGoal.disciplineStreaks![activeTab].currentStreak = currentStreak;
    
    // Update longest streak if current streak is longer
    if (currentStreak > updatedGoal.disciplineStreaks![activeTab].longestStreak) {
      updatedGoal.disciplineStreaks![activeTab].longestStreak = currentStreak;
    }
    
    // Update total completed
    updatedGoal.disciplineStreaks![activeTab].totalCompleted += 1;
    
    // Update the goal
    onUpdate(updatedGoal);
    
    // Reset form
    setNotes('');
  };
  
  // Break streak (for testing)
  const breakStreak = () => {
    const updatedGoal = { ...goal };
    updatedGoal.disciplineStreaks![activeTab].currentStreak = 0;
    onUpdate(updatedGoal);
  };
  
  // Calculate streak metrics
  const totalMinutes = activeStreak.history.reduce((sum, entry) => sum + (entry.minutes || 0), 0);
  const averageMinutes = activeStreak.history.length > 0 
    ? Math.round(totalMinutes / activeStreak.history.length) 
    : 0;
  
  // Get last 7 days of history
  const recentHistory = [...activeStreak.history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);
  
  // Get discipline type label
  const getDisciplineLabel = (type: DisciplineType) => {
    switch (type) {
      case 'activity':
        return 'Body Activity';
      case 'education':
        return 'Mind Focus';
      case 'intention':
        return 'Spirit Practice';
      default:
        return '';
    }
  };
  
  // Get discipline description
  const getDisciplineDescription = (type: DisciplineType) => {
    switch (type) {
      case 'activity':
        return goal.bodyFocus || 'Physical actions to take toward your dream.';
      case 'education':
        return goal.mindFocus || 'Daily visualization and mental practice.';
      case 'intention':
        return goal.spiritFocus || 'Gratitude and spiritual alignment.';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl text-blue-400 font-orbitron mb-4">MANIFESTATION DISCIPLINES</h3>
      
      {/* Tab navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'activity' 
            ? 'bg-green-900/70 text-green-400 font-semibold border-b-2 border-green-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <CheckSquare className="h-4 w-4 mr-1" />
            <span>Body</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('education')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'education' 
            ? 'bg-blue-900/70 text-blue-400 font-semibold border-b-2 border-blue-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <CheckSquare className="h-4 w-4 mr-1" />
            <span>Mind</span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('intention')}
          className={`flex-1 py-2 rounded-t-lg ${activeTab === 'intention' 
            ? 'bg-purple-900/70 text-purple-400 font-semibold border-b-2 border-purple-400' 
            : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
        >
          <div className="flex items-center justify-center">
            <CheckSquare className="h-4 w-4 mr-1" />
            <span>Spirit</span>
          </div>
        </button>
      </div>
      
      {/* Discipline description */}
      <div className={`
        mb-5 p-3 rounded-md
        ${activeTab === 'activity' ? 'bg-green-900/20 border border-green-800' : 
         activeTab === 'education' ? 'bg-blue-900/20 border border-blue-800' :
         'bg-purple-900/20 border border-purple-800'}
      `}>
        <h4 className={`
          text-sm font-medium mb-1
          ${activeTab === 'activity' ? 'text-green-400' : 
           activeTab === 'education' ? 'text-blue-400' :
           'text-purple-400'}
        `}>
          {getDisciplineLabel(activeTab)}
        </h4>
        <p className="text-gray-300 text-sm">
          {getDisciplineDescription(activeTab)}
        </p>
      </div>
      
      {/* Streak metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Current Streak</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-white">{activeStreak.currentStreak}</span>
            <span className="text-gray-400 ml-1">days</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Longest Streak</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-white">{activeStreak.longestStreak}</span>
            <span className="text-gray-400 ml-1">days</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Total Time</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-white">{totalMinutes}</span>
            <span className="text-gray-400 ml-1">minutes</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Sessions</div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-white">{activeStreak.totalCompleted}</span>
            <span className="text-gray-400 ml-1">total</span>
          </div>
        </div>
      </div>
      
      {/* Today's tracking */}
      <div className={`
        mb-6 p-4 rounded-lg border
        ${isTodayComplete 
          ? 'bg-gray-800/50 border-gray-700' 
          : activeTab === 'activity' 
            ? 'bg-green-900/10 border-green-900/50' 
            : activeTab === 'education' 
              ? 'bg-blue-900/10 border-blue-900/50'
              : 'bg-purple-900/10 border-purple-900/50'
        }
      `}>
        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          {isTodayComplete ? "Today's Practice Completed" : "Log Today's Practice"}
        </h4>
        
        {isTodayComplete ? (
          <div className="bg-gray-900/50 rounded-md p-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-gray-300">Well done! You've completed your {getDisciplineLabel(activeTab).toLowerCase()} practice for today.</p>
              <p className="text-xs text-gray-500 mt-1">Come back tomorrow to continue your streak!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Minutes Spent</label>
              <div className="flex items-center">
                <button
                  onClick={() => setMinutes(Math.max(5, minutes - 5))}
                  className="bg-gray-800 text-gray-300 px-3 py-2 rounded-l-md border border-gray-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value) || 5)}
                  className="w-16 text-center bg-gray-800 border-t border-b border-gray-700 text-white py-2"
                />
                <button
                  onClick={() => setMinutes(minutes + 5)}
                  className="bg-gray-800 text-gray-300 px-3 py-2 rounded-r-md border border-gray-700"
                >
                  +
                </button>
                <span className="text-gray-400 ml-2">minutes</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
              <textarea
                placeholder={`What did you do for your ${getDisciplineLabel(activeTab).toLowerCase()} today?`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-20 resize-none"
              />
            </div>
            
            <button
              onClick={logTodayProgress}
              className={`
                w-full py-2 rounded flex items-center justify-center text-white
                ${activeTab === 'activity' ? 'bg-green-600 hover:bg-green-500' : 
                 activeTab === 'education' ? 'bg-blue-600 hover:bg-blue-500' :
                 'bg-purple-600 hover:bg-purple-500'}
              `}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Complete Today's Practice</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Recent history */}
      <div>
        <h4 className="text-gray-300 text-sm font-medium border-b border-gray-700 pb-1 mb-3 flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          Recent Activity
        </h4>
        
        {recentHistory.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No recent activity recorded.</p>
            <p className="text-xs text-gray-600 mt-1">Start logging your daily practice to build your streak!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentHistory.map((entry, index) => (
              <div 
                key={index} 
                className={`flex items-start p-3 rounded ${
                  entry.completed ? 'bg-gray-800' : 'bg-gray-800/50'
                }`}
              >
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {entry.completed ? (
                    <CheckCircle className={`h-5 w-5 
                      ${activeTab === 'activity' ? 'text-green-500' : 
                       activeTab === 'education' ? 'text-blue-500' :
                       'text-purple-500'}
                    `} />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {formatDate(entry.date)}
                      </p>
                      {entry.minutes && (
                        <p className="text-gray-400 text-xs mt-0.5 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {entry.minutes} minutes
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <p className="text-gray-400 text-sm mt-2">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisciplineTrackerComponent;