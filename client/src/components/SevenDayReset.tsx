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
  };
  
  const handleTaskToggle = (index: number) => {
    const updatedCompletion = [...taskCompletion];
    updatedCompletion[index] = !updatedCompletion[index];
    setTaskCompletion(updatedCompletion);
  };
  
  const isDayCompleted = (day: number) => {
    return completedDays.some(cd => cd.day === day);
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

  const activeSchedule = schedule.find(s => s.day === activeDay);

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">7-Day Gloss Reset™ Protocol</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {schedule.map((day) => {
          const isCompleted = isDayCompleted(day.day);
          return (
            <button
              key={day.day}
              onClick={() => handleSetDay(day.day)}
              className={`px-4 py-2 rounded-lg font-orbitron text-sm flex items-center
                ${activeDay === day.day 
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
      
      {activeSchedule && (
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
          
          <ul className="space-y-3">
            {activeSchedule.tasks.map((task, index) => (
              <li key={index} className="flex items-start">
                <div 
                  className={`flex items-center justify-center w-5 h-5 mt-0.5 mr-3 rounded border
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
          
          <div className="mt-8 space-y-4">
            {!showSubmitForm ? (
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => handleSetDay(activeDay < 7 ? activeDay + 1 : 1)}
                  className="apex-button inline-block"
                >
                  {activeDay < 7 ? 'Next Day' : 'Start Over'}
                </button>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-orbitron"
                >
                  Mark Day as Complete
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
                    Submit Completion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SevenDayReset;