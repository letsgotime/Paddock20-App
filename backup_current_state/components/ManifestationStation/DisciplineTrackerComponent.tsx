/**
 * @PROTECTED_FILE - DO NOT MODIFY OR OVERWRITE
 * This file contains critical Manifestation Station functionality and must remain intact.
 * Any modifications must be explicitly approved by the owner.
 */
import React, { useState, useEffect } from 'react';
import { Goal } from '../../types/manifestation';
import { 
  ListChecks, 
  Calendar, 
  CalendarDays,
  CheckCircle, 
  BrainCircuit,
  Dumbbell,
  Heart,
  Camera,
  BookOpen,
  BookMarked,
  Upload,
  PlusCircle,
  ArrowRight,
  FileEdit,
  Save,
  Timer,
  Award,
  Flame
} from 'lucide-react';

interface DisciplineTrackerComponentProps {
  goal: Goal;
  onUpdate: (updatedGoal: Goal) => void;
}

interface DailyLog {
  id: number;
  date: string;
  completed: boolean;
  mindCompleted: boolean;
  bodyCompleted: boolean;
  spiritCompleted: boolean;
  knowledgeCompleted: boolean;
  resourcesCompleted: boolean;
  photoUploaded: boolean;
  notes: string;
  streak: number;
}

const DisciplineTrackerComponent: React.FC<DisciplineTrackerComponentProps> = ({ goal, onUpdate }) => {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [photoUpload, setPhotoUpload] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  
  // Initialize logs on component mount
  useEffect(() => {
    // In a real app, these would be loaded from database
    const logs: DailyLog[] = [];
    
    // Generate some past logs
    const today = new Date();
    
    // Populate logs for the past 10 days
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Create more completed logs for the past, with some random variation
      const completed = i > 3 || Math.random() > 0.3;
      
      logs.push({
        id: Date.now() - i,
        date: date.toISOString().split('T')[0],
        completed: completed,
        mindCompleted: completed && (Math.random() > 0.1),
        bodyCompleted: completed && (Math.random() > 0.2),
        spiritCompleted: completed && (Math.random() > 0.15),
        knowledgeCompleted: completed && (Math.random() > 0.3),
        resourcesCompleted: completed && (Math.random() > 0.25),
        photoUploaded: i % 3 === 0 && completed, // Every 3rd day has a photo
        notes: i % 2 === 0 ? 'Made good progress today on my manifestation journey.' : '',
        streak: i < 7 ? 7 - i : 0 // For demo purposes
      });
    }
    
    setDailyLogs(logs);
    
    // Initialize today's log
    const todayDateStr = today.toISOString().split('T')[0];
    const existingTodayLog = logs.find(log => log.date === todayDateStr);
    
    if (existingTodayLog) {
      setTodayLog(existingTodayLog);
      setNotes(existingTodayLog.notes);
      
      // Set current streak
      const todayIndex = logs.findIndex(log => log.date === todayDateStr);
      if (todayIndex >= 0 && logs[todayIndex].completed) {
        setCurrentStreak(logs[todayIndex].streak);
      } else if (todayIndex > 0 && logs[todayIndex - 1].completed) {
        setCurrentStreak(logs[todayIndex - 1].streak);
      }
    } else {
      // Create a new log for today
      const lastLog = logs[logs.length - 1];
      const newStreak = lastLog && lastLog.completed ? lastLog.streak + 1 : 1;
      
      const newTodayLog: DailyLog = {
        id: Date.now(),
        date: todayDateStr,
        completed: false,
        mindCompleted: false,
        bodyCompleted: false,
        spiritCompleted: false,
        knowledgeCompleted: false,
        resourcesCompleted: false,
        photoUploaded: false,
        notes: '',
        streak: newStreak
      };
      
      setTodayLog(newTodayLog);
      setDailyLogs([...logs, newTodayLog]);
      
      // Set current streak based on yesterday's log
      if (lastLog && lastLog.completed) {
        setCurrentStreak(lastLog.streak);
      }
    }
  }, []);
  
  // Update the combined completed status for today
  const updateCompletedStatus = (newLog: DailyLog) => {
    const completed = 
      newLog.mindCompleted && 
      newLog.bodyCompleted && 
      newLog.spiritCompleted;
    
    // For this to count as fully complete, we need core disciplines
    return {
      ...newLog,
      completed
    };
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field: string, value: boolean) => {
    if (!todayLog) return;
    
    const updatedLog = {
      ...todayLog,
      [field]: value
    };
    
    // Update the completed status
    const finalUpdatedLog = updateCompletedStatus(updatedLog);
    
    // Update the streak counter if the status changed to completed
    let newStreak = finalUpdatedLog.streak;
    if (!todayLog.completed && finalUpdatedLog.completed) {
      // If changing from incomplete to complete, increment the streak
      newStreak += 1;
      setCurrentStreak(newStreak);
    } else if (todayLog.completed && !finalUpdatedLog.completed) {
      // If changing from complete to incomplete, decrement the streak (but not below 0)
      newStreak = Math.max(0, newStreak - 1);
      setCurrentStreak(newStreak);
    }
    
    // Set the updated streak value
    finalUpdatedLog.streak = newStreak;
    
    // Update today's log
    setTodayLog(finalUpdatedLog);
    
    // Update the logs array
    const updatedLogs = dailyLogs.map(log => 
      log.id === todayLog.id ? finalUpdatedLog : log
    );
    setDailyLogs(updatedLogs);
  };
  
  // Handle notes save
  const saveNotes = () => {
    if (!todayLog) return;
    
    const updatedLog = {
      ...todayLog,
      notes
    };
    
    // Update today's log
    setTodayLog(updatedLog);
    
    // Update the logs array
    const updatedLogs = dailyLogs.map(log => 
      log.id === todayLog.id ? updatedLog : log
    );
    setDailyLogs(updatedLogs);
    
    setIsEditingNotes(false);
  };
  
  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // For demo, we'll just create a URL to the file
    const photoUrl = URL.createObjectURL(file);
    setPhotoUpload(photoUrl);
    
    if (!todayLog) return;
    
    const updatedLog = {
      ...todayLog,
      photoUploaded: true
    };
    
    // Update today's log
    setTodayLog(updatedLog);
    
    // Update the logs array
    const updatedLogs = dailyLogs.map(log => 
      log.id === todayLog.id ? updatedLog : log
    );
    setDailyLogs(updatedLogs);
  };
  
  // Calculate completed days percentage
  const calculateCompletionPercentage = () => {
    if (dailyLogs.length === 0) return 0;
    
    const completedCount = dailyLogs.filter(log => log.completed).length;
    return (completedCount / dailyLogs.length) * 100;
  };
  
  // Format date to display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if date is today
  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  // Render activity streak indicators for the week view
  const renderActivityIndicator = (day: DailyLog, type: string) => {
    let isCompleted = false;
    
    switch (type) {
      case 'mind':
        isCompleted = day.mindCompleted;
        break;
      case 'body': 
        isCompleted = day.bodyCompleted;
        break;
      case 'spirit':
        isCompleted = day.spiritCompleted;
        break;
      case 'knowledge':
        isCompleted = day.knowledgeCompleted;
        break;
      case 'resources':
        isCompleted = day.resourcesCompleted;
        break;
      case 'photo':
        isCompleted = day.photoUploaded;
        break;
    }
    
    let bgColor = 'bg-gray-800';
    
    if (isCompleted) {
      switch (type) {
        case 'mind':
          bgColor = 'bg-blue-500';
          break;
        case 'body': 
          bgColor = 'bg-green-500';
          break;
        case 'spirit':
          bgColor = 'bg-purple-500';
          break;
        case 'knowledge':
          bgColor = 'bg-yellow-500';
          break;
        case 'resources':
          bgColor = 'bg-indigo-500';
          break;
        case 'photo':
          bgColor = 'bg-pink-500';
          break;
      }
    }
    
    return (
      <div className={`w-full h-1.5 rounded-full ${bgColor}`}></div>
    );
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-amber-400 font-orbitron flex items-center">
          <ListChecks className="mr-2 h-5 w-5" />
          DAILY DISCIPLINE TRACKER
        </h3>
        <button 
          onClick={() => {
            // We'll use the onUpdate function to signal that we want to switch back to dashboard view
            const updatedGoal = { ...goal };
            onUpdate(updatedGoal);
            
            // Store navigation preference for the parent component
            window.localStorage.setItem('manifestation_activeView', 'dashboard');
            
            // Trigger a state update in the parent
            window.dispatchEvent(new CustomEvent('manifestation-navigation', { 
              detail: { view: 'dashboard' } 
            }));
          }}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 border border-green-500 text-white rounded-md flex items-center"
        >
          <span>← Back to Dashboard</span>
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Today's Discipline Trackers */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {todayLog && isToday(todayLog.date) ? (
                <span>Today's Disciplines</span>
              ) : (
                <span>{todayLog ? formatDate(todayLog.date) : "Today"}</span>
              )}
            </h4>
            
            <div className="flex items-center">
              <Flame className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-400 font-semibold">{currentStreak} day streak</span>
            </div>
          </div>
          
          {todayLog && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Core Disciplines */}
              <div>
                <h5 className="text-amber-400 text-sm mb-3">Core Disciplines</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCheckboxChange('mindCompleted', !todayLog.mindCompleted)}
                      className="mr-3"
                    >
                      {todayLog.mindCompleted ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-blue-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <BrainCircuit className="h-4 w-4 text-blue-400 mr-1.5" />
                        <span className="text-white">Mind Focus</span>
                      </div>
                      <p className="text-xs text-gray-400">Visualizations & mental rehearsal</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCheckboxChange('bodyCompleted', !todayLog.bodyCompleted)}
                      className="mr-3"
                    >
                      {todayLog.bodyCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-green-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <Dumbbell className="h-4 w-4 text-green-400 mr-1.5" />
                        <span className="text-white">Body Focus</span>
                      </div>
                      <p className="text-xs text-gray-400">Physical & financial actions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCheckboxChange('spiritCompleted', !todayLog.spiritCompleted)}
                      className="mr-3"
                    >
                      {todayLog.spiritCompleted ? (
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-purple-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-purple-400 mr-1.5" />
                        <span className="text-white">Spirit Focus</span>
                      </div>
                      <p className="text-xs text-gray-400">Gratitude & spiritual alignment</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Disciplines */}
              <div>
                <h5 className="text-amber-400 text-sm mb-3">Additional Practices</h5>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCheckboxChange('knowledgeCompleted', !todayLog.knowledgeCompleted)}
                      className="mr-3"
                    >
                      {todayLog.knowledgeCompleted ? (
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-yellow-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-yellow-400 mr-1.5" />
                        <span className="text-white">Knowledge Expansion</span>
                      </div>
                      <p className="text-xs text-gray-400">Read from your manifestation library</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCheckboxChange('resourcesCompleted', !todayLog.resourcesCompleted)}
                      className="mr-3"
                    >
                      {todayLog.resourcesCompleted ? (
                        <CheckCircle className="h-5 w-5 text-indigo-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-indigo-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center">
                        <BookMarked className="h-4 w-4 text-indigo-400 mr-1.5" />
                        <span className="text-white">Resource Collection</span>
                      </div>
                      <p className="text-xs text-gray-400">Add helpful resources to your library</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      className="mr-3"
                    >
                      {todayLog.photoUploaded ? (
                        <CheckCircle className="h-5 w-5 text-pink-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-pink-400" />
                      )}
                      <input 
                        type="file" 
                        id="photo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </button>
                    <div>
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 text-pink-400 mr-1.5" />
                        <span className="text-white">Daily Progress Photo</span>
                      </div>
                      <p className="text-xs text-gray-400">Document your journey visually</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => {
                    if (todayLog) {
                      // Save all changes by pushing to the parent component
                      onUpdate({
                        ...goal,
                        dailyProgress: {
                          ...goal.dailyProgress,
                          logs: dailyLogs,
                          lastUpdated: new Date().toISOString()
                        }
                      });
                    }
                  }}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Submit Daily Check-in
                </button>
              </div>
            </div>
          )}
          
          {/* Progress status */}
          {todayLog && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-medium mb-1">Today's Status</h5>
                  {todayLog.completed ? (
                    <div className="flex items-center text-green-400">
                      <Award className="h-4 w-4 mr-1.5" />
                      <span>All core disciplines completed! Great work!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-400">
                      <Timer className="h-4 w-4 mr-1.5" />
                      <span>Complete your core disciplines to maintain your streak</span>
                    </div>
                  )}
                </div>
                
                {photoUpload && (
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img
                      src={photoUpload}
                      alt="Today's progress"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Today's Notes */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-medium">Journey Notes</h4>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-gray-400 hover:text-amber-400"
              >
                <FileEdit className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={saveNotes}
                className="text-amber-400 hover:text-amber-300"
              >
                <Save className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your manifestation journey today? Record insights, breakthroughs, and feelings..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm h-24 resize-none"
            />
          ) : (
            <div className="bg-gray-700 rounded p-3 min-h-24">
              {notes ? (
                <p className="text-gray-300 text-sm">{notes}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No notes for today. Click the edit icon to add your thoughts.
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Weekly View */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            Weekly Discipline Log
          </h4>
          
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-7 gap-0 text-center py-2 border-b border-gray-700 bg-gray-800">
              <div className="text-xs text-gray-500">Mind</div>
              <div className="text-xs text-gray-500">Body</div>
              <div className="text-xs text-gray-500">Spirit</div>
              <div className="text-xs text-gray-500">Knowledge</div>
              <div className="text-xs text-gray-500">Resources</div>
              <div className="text-xs text-gray-500">Photo</div>
              <div className="text-xs text-gray-500">Status</div>
            </div>
            
            <div className="divide-y divide-gray-700">
              {dailyLogs.slice(-7).map((log) => (
                <div 
                  key={log.id} 
                  className={`grid grid-cols-7 gap-0 py-3 px-2 ${
                    isToday(log.date) ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'mind')}
                  </div>
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'body')}
                  </div>
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'spirit')}
                  </div>
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'knowledge')}
                  </div>
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'resources')}
                  </div>
                  <div className="flex justify-center items-center px-1">
                    {renderActivityIndicator(log, 'photo')}
                  </div>
                  <div className="flex justify-center items-center">
                    {log.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-4 py-3 bg-gray-750 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <span className="font-medium">{Math.round(calculateCompletionPercentage())}%</span> completion rate
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <span className="text-amber-400">{formatDate(dailyLogs[0]?.date || '')}</span>
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                  <span className="text-amber-400">{formatDate(dailyLogs[dailyLogs.length - 1]?.date || '')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Discipline Tips */}
        <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-800">
          <h4 className="text-amber-400 font-medium mb-2">Consistency Tips</h4>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start">
              <ArrowRight className="h-4 w-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
              <span>Track your disciplines at the same time each day to build a solid routine.</span>
            </li>
            <li className="flex items-start">
              <ArrowRight className="h-4 w-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
              <span>Don't break the chain - your streak is powerful psychological motivation.</span>
            </li>
            <li className="flex items-start">
              <ArrowRight className="h-4 w-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
              <span>Taking daily progress photos helps you see subtle changes you might otherwise miss.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DisciplineTrackerComponent;