import React, { useState } from 'react';

interface DaySchedule {
  day: number;
  title: string;
  tasks: string[];
}

interface SevenDayResetProps {
  schedule: DaySchedule[];
}

function SevenDayReset({ schedule }: SevenDayResetProps) {
  const [activeDay, setActiveDay] = useState<number>(1);

  const handleSetDay = (day: number) => {
    setActiveDay(day);
  };

  const activeSchedule = schedule.find(s => s.day === activeDay);

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">7-Day Gloss Reset™ Protocol</h2>
      
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {schedule.map((day) => (
          <button
            key={day.day}
            onClick={() => handleSetDay(day.day)}
            className={`px-4 py-2 rounded-lg font-orbitron text-sm 
              ${activeDay === day.day 
                ? 'bg-green-500 text-black' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            Day {day.day}
          </button>
        ))}
      </div>
      
      {activeSchedule && (
        <div className="bg-black p-5 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-xl mb-4">
            Day {activeSchedule.day}: {activeSchedule.title}
          </h3>
          
          <ul className="space-y-2">
            {activeSchedule.tasks.map((task, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span className="text-white">{task}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => handleSetDay(activeDay < 7 ? activeDay + 1 : 1)}
              className="apex-button inline-block"
            >
              {activeDay < 7 ? 'Next Day' : 'Start Over'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SevenDayReset;