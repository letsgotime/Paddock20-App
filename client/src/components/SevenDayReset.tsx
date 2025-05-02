import React, { useState, useEffect } from 'react';

interface DaySchedule {
  day: number;
  title: string;
  tasks: string[];
}

interface CompletedDay {
  day: number;
  completedAt: string;
  tasks: string[];
  completedTasks: boolean[];
  imageUrl?: string;
  notes?: string;
}

interface SevenDayResetProps {
  schedule: DaySchedule[];
}

function SevenDayReset({ schedule }: SevenDayResetProps) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<CompletedDay[]>(() => {
    const saved = localStorage.getItem('sevenDayResetProgress');
    return saved ? JSON.parse(saved) : [];
  });
  const [taskCompletion, setTaskCompletion] = useState<boolean[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  
  // Initialize task completion state when active day changes
  useEffect(() => {
    const completedDay = completedDays.find(cd => cd.day === activeDay);
    if (completedDay) {
      setTaskCompletion(completedDay.completedTasks);
      setImageUrl(completedDay.imageUrl || "");
      setNotes(completedDay.notes || "");
    } else {
      const currentSchedule = schedule.find(s => s.day === activeDay);
      setTaskCompletion(currentSchedule ? new Array(currentSchedule.tasks.length).fill(false) : []);
      setImageUrl("");
      setNotes("");
    }
    setShowSubmitForm(false);
    setSubmitSuccess(false);
  }, [activeDay, completedDays, schedule]);
  
  const handleSetDay = (day: number) => {
    setActiveDay(day);
    setShowIntro(false);
  };
  
  const handleTaskToggle = (index: number) => {
    const updatedCompletion = [...taskCompletion];
    updatedCompletion[index] = !updatedCompletion[index];
    setTaskCompletion(updatedCompletion);
  };
  
  const isDayCompleted = (day: number) => {
    return completedDays.some(cd => cd.day === day);
  };
  
  const getCompletionPercentage = () => {
    if (completedDays.length === 0) return 0;
    const completedTasksCount = completedDays.reduce((total, day) => {
      return total + day.completedTasks.filter(Boolean).length;
    }, 0);
    
    const totalTasksCount = schedule.reduce((total, day) => {
      return total + day.tasks.length;
    }, 0);
    
    return Math.round((completedTasksCount / totalTasksCount) * 100);
  };
  
  const handleSubmitCompletion = () => {
    const currentSchedule = schedule.find(s => s.day === activeDay);
    if (!currentSchedule) return;
    
    // Create a completion record
    const completionRecord: CompletedDay = {
      day: activeDay,
      completedAt: new Date().toISOString(),
      tasks: currentSchedule.tasks,
      completedTasks: taskCompletion,
      imageUrl: imageUrl || undefined,
      notes: notes || undefined
    };
    
    // Update or add the completion record
    const updatedCompletions = completedDays.filter(cd => cd.day !== activeDay);
    updatedCompletions.push(completionRecord);
    
    // Save to state and localStorage
    setCompletedDays(updatedCompletions);
    localStorage.setItem('sevenDayResetProgress', JSON.stringify(updatedCompletions));
    
    // Show success message and reset form
    setSubmitSuccess(true);
    setShowSubmitForm(false);
    
    // Announce completion for screen readers
    const announcer = document.getElementById('juiceBoxAnnouncer');
    if (announcer) {
      announcer.textContent = `Day ${activeDay} completed successfully!`;
    }
  };
  
  const resetAllProgress = () => {
    if (window.confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      setCompletedDays([]);
      localStorage.removeItem('sevenDayResetProgress');
      setActiveDay(1);
      setShowIntro(true);
      const currentSchedule = schedule.find(s => s.day === 1);
      setTaskCompletion(currentSchedule ? new Array(currentSchedule.tasks.length).fill(false) : []);
    }
  };

  const activeSchedule = schedule.find(s => s.day === activeDay);
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-8 mb-8">
      <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-green-900">
        <h2 className="text-3xl font-orbitron text-green-400 mb-6 text-center">7-Day Gloss Reset™ Protocol</h2>
        
        {/* Progress Overview */}
        <div className="mb-8 bg-black/60 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Your Reset Protocol Progress</span>
            <span className="text-green-400">{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {schedule.map((day) => {
              const isCompleted = isDayCompleted(day.day);
              return (
                <div
                  key={day.day}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
                    ${isCompleted 
                      ? 'bg-green-500 text-black' 
                      : 'bg-gray-800 text-white'}`}
                >
                  {day.day}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Day Selection Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <button
            onClick={() => setShowIntro(true)}
            className={`px-4 py-2 rounded-lg font-orbitron text-sm
              ${showIntro 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            About the System
          </button>
          {schedule.map((day) => {
            const isCompleted = isDayCompleted(day.day);
            return (
              <button
                key={day.day}
                onClick={() => handleSetDay(day.day)}
                className={`px-4 py-2 rounded-lg font-orbitron text-sm flex items-center
                  ${(activeDay === day.day && !showIntro)
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'} 
                  ${isCompleted ? 'border-2 border-green-400' : ''}`}
              >
                {isCompleted && <span className="text-green-400 mr-1">✓</span>}
                Day {day.day}
              </button>
            );
          })}
        </div>
        
        {/* Success message when day is marked complete */}
        {submitSuccess && (
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6 text-center">
            <div className="text-green-400 text-xl font-orbitron mb-2">Day {activeDay} Completed!</div>
            <p className="text-gray-200">Your progress has been saved. Great work on your detailing journey!</p>
          </div>
        )}

        {/* Introduction Content */}
        {showIntro && (
          <div className="bg-black p-5 rounded-lg">
            <div className="mb-8">
              <h3 className="text-xl font-orbitron text-blue-400 mb-4">Why You Need a Reset System</h3>
              <p className="text-gray-300 mb-2">Not every car needs a full correction.</p>
              <p className="text-gray-300 mb-2">Not every flip gets weeks of prep.</p>
              <p className="text-gray-300 mb-4">But every finish needs a way back from:</p>
              
              <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                <li className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span> Missed maintenance
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span> Road grime
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span> Gloss loss
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span> Seasonal shifts
                </li>
                <li className="flex items-center">
                  <span className="text-red-400 mr-2">❌</span> Quick-sale urgency
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-orbitron text-blue-400 mb-4">The GoTime 7-Day Gloss Reset™</h3>
            <p className="text-white mb-4">Use this for:</p>
            <ul className="text-white grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Flip cars
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Client preps
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Post-vacation daily drivers
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Cars that "used to pop"
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✅</span> Vehicles going back to lease
              </li>
            </ul>

            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-orbitron text-blue-400 mb-2">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.map((day, index) => (
                  <div key={index} className="bg-gray-900/80 p-3 rounded-lg">
                    <h4 className="text-md font-orbitron text-green-400 mb-2">
                      Day {day.day}: {day.title}
                    </h4>
                    <div className="text-xs text-gray-400">{day.tasks.length} tasks</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-white italic mb-6">
                This system isn't about rushing gloss.<br/>
                It's about respecting it enough to bring it back right.
              </p>
              <button
                onClick={() => handleSetDay(1)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-orbitron"
              >
                Start My 7-Day Protocol
              </button>
            </div>
          </div>
        )}
        
        {/* Day Content */}
        {!showIntro && activeSchedule && (
          <div className="bg-black p-5 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-400 font-orbitron text-xl">
                Day {activeSchedule.day}: {activeSchedule.title}
              </h3>
              {isDayCompleted(activeDay) && (
                <div className="bg-green-500 text-black px-3 py-1 rounded-md text-sm font-orbitron">
                  Completed
                </div>
              )}
            </div>
            
            <ul className="space-y-3 mb-6">
              {activeSchedule.tasks.map((task, index) => (
                <li key={index} className="flex items-start">
                  <div 
                    className={`flex items-center justify-center w-5 h-5 mt-0.5 mr-3 rounded border cursor-pointer
                      ${taskCompletion[index] 
                        ? 'bg-green-500 border-green-600' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                    onClick={() => handleTaskToggle(index)}
                    role="checkbox"
                    aria-checked={taskCompletion[index]}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleTaskToggle(index);
                      }
                    }}
                  >
                    {taskCompletion[index] && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <span className={`text-white ${taskCompletion[index] ? 'line-through opacity-70' : ''}`}>{task}</span>
                </li>
              ))}
            </ul>
            
            {/* Progress & Navigation */}
            <div className="bg-gray-900/40 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white">
                  <span className="text-sm text-gray-400">Task completion:</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">
                    {taskCompletion.filter(Boolean).length} of {taskCompletion.length} tasks
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${taskCompletion.filter(Boolean).length / taskCompletion.length * 100}%` }}
                ></div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-between">
                {activeDay > 1 && (
                  <button
                    onClick={() => handleSetDay(activeDay - 1)}
                    className="text-gray-400 hover:text-white text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Previous Day
                  </button>
                )}
                
                {activeDay < 7 && (
                  <button
                    onClick={() => handleSetDay(activeDay + 1)}
                    className="text-gray-400 hover:text-white text-sm flex items-center ml-auto"
                  >
                    Next Day
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              {!showSubmitForm ? (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-orbitron"
                    disabled={!taskCompletion.some(t => t)}
                  >
                    {isDayCompleted(activeDay) ? 'Update Day Completion' : 'Mark Day as Complete'}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
                  <h4 className="text-blue-400 font-orbitron mb-4">Submit Day {activeDay} Completion</h4>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      Add Image URL (Optional)
                    </label>
                    <input 
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/my-detailing-image.jpg"
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Include an image of your completed work for verification and reference.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What went well? Any challenges? Special techniques used?"
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 h-24"
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowSubmitForm(false)}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitCompletion}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-orbitron"
                      disabled={!taskCompletion.some(t => t)}
                    >
                      {isDayCompleted(activeDay) ? 'Update Progress' : 'Submit Completion'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Reset All Progress Button (hidden if no progress) */}
        {completedDays.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={resetAllProgress}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Reset All Progress
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SevenDayReset;