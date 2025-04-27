import React, { useState, useEffect } from 'react';

interface ResetTask {
  day: number;
  title: string;
  tasks: string[];
}

function GlossResetChecklist() {
  const [resetSteps, setResetSteps] = useState<ResetTask[]>([]);
  const [completedSteps, setCompletedSteps] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGlossReset() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/GlossReset7Day.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch Gloss Reset data: ${response.status}`);
        }
        const data = await response.json();
        setResetSteps(data);
        setError(null);
      } catch (err) {
        console.error('Error loading Gloss Reset data:', err);
        setError('Could not load the Gloss Reset Checklist. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGlossReset();
  }, []);

  const toggleTask = (dayIndex: number, taskIndex: number) => {
    const key = `${dayIndex}-${taskIndex}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">7-Day Gloss Reset Checklist</h2>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading Gloss Reset Steps...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 mt-2">
            The checklist will be available soon. In the meantime, you can browse our other sections.
          </p>
        </div>
      )}

      {!isLoading && !error && resetSteps.length > 0 && resetSteps.map((day, dayIndex) => (
        <div key={dayIndex} className="mb-10">
          <h3 className="text-blue-400 font-orbitron text-lg uppercase mb-4">
            Day {day.day}: {day.title}
          </h3>
          <ul className="grid grid-cols-1 gap-4">
            {day.tasks.map((task, taskIndex) => {
              const taskKey = `${dayIndex}-${taskIndex}`;
              return (
                <li key={taskKey} className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={completedSteps[taskKey] || false}
                    onChange={() => toggleTask(dayIndex, taskIndex)}
                    className="w-5 h-5 accent-green-500 cursor-pointer"
                  />
                  <p className={`${completedSteps[taskKey] ? 'text-green-500 line-through' : 'text-white'}`}>
                    {task}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default GlossResetChecklist;