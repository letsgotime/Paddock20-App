import React from 'react';

function WeeklyChecklist() {
  const checklist = [
    "Full Foam Pre-Soak",
    "Two-Bucket Contact Wash (Upper + Lower)",
    "Wheel Barrel + Brake Caliper Clean",
    "Tire Decontaminate + Deep Scrub",
    "Re-torque Wheels if Needed",
    "Interior High-Touch Zone Reset",
    "Mat and Carpet Vacuum + Brush",
    "Glass Clean + Interior Mirror Check",
    "Frothe Body Wipe (Quick Reset)",
    "Door Seal Wipe Down",
    "Water Behavior Journal Entry",
    "Battery Terminal Visual Check"
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-green-400 font-orbitron text-xl uppercase mb-6 text-center">
        Weekly Quick Maintenance
      </h2>
      <ul className="grid grid-cols-1 gap-4">
        {checklist.map((item, index) => (
          <li key={index} className="flex items-center space-x-4">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <p className="text-white">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WeeklyChecklist;