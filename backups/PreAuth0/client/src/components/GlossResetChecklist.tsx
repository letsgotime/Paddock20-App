import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';

interface ResetTask {
  day: number;
  title: string;
  tasks: string[];
}

function GlossResetChecklist() {
  const [resetSteps, setResetSteps] = useState<ResetTask[]>([]);
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
            {day.tasks.map((task, taskIndex) => (
              <li key={taskIndex}>
                <ChecklistItem
                  checklistName={`GlossReset_Day${day.day}`}
                  itemName={task}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default GlossResetChecklist;