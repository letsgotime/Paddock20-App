import React, { useState, useEffect } from 'react';
import ChecklistItem from './ChecklistItem';

function SeasonalChecklist() {
  const [season, setSeason] = useState('');

  useEffect(() => {
    const month = new Date().getMonth(); // January = 0, December = 11

    if (month === 11 || month <= 1) {
      setSeason('Winter');
    } else if (month >= 2 && month <= 4) {
      setSeason('Spring');
    } else if (month >= 5 && month <= 7) {
      setSeason('Summer');
    } else {
      setSeason('Fall');
    }
  }, []);

  const seasonalTasks: Record<string, string[]> = {
    Winter: [
      "Warm Water Washes Only",
      "Tire Pressure Adjustment",
      "Frothe-Only Wash if Freezing",
      "Battery Check Before Drives"
    ],
    Spring: [
      "Pollen Removal Routines",
      "Vent System Refresh",
      "Cabin Filter Change"
    ],
    Summer: [
      "Shade Washes Preferred",
      "Early AM Drive Scheduling",
      "UV Topper Reapplication"
    ],
    Fall: [
      "Leaf Decon in Gutter Seams",
      "Trim and Weather Strip Inspection",
      "Garage Ventilation Check"
    ]
  };

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Seasonal Adaptation Checklist</h2>

      <h3 className="text-blue-400 font-orbitron text-lg uppercase mb-4 text-center">
        Current Season: {season}
      </h3>

      <ul className="grid grid-cols-1 gap-4">
        {season && seasonalTasks[season]?.map((task, index) => (
          <li key={index}>
            <ChecklistItem 
              checklistName={`Seasonal_${season}`} 
              itemName={task} 
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeasonalChecklist;