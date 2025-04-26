import React from 'react';

function MonthlyChecklist() {
  const checklist = [
    "Full Paint Surface Decontamination",
    "Iron Fallout Removal (Barrels + Panels)",
    "Clay Mitt Light Glide (Spot Correction)",
    "Sealant Layer Refresh (Reload/Frothe Boost)",
    "Full Interior Leather/Plastic Recondition",
    "Underbody Rinse (Climate Dependent)",
    "Engine Bay Dustout and Detail",
    "OBD-II Quick Scan (Error Codes)",
    "TPMS Data Health Check",
    "Door Hinge Lubrication",
    "Battery Float Charge Health Check",
    "Journal Gloss Tracker Entry"
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-green-400 font-orbitron text-xl uppercase mb-6 text-center">
        Monthly Deep Maintenance
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

export default MonthlyChecklist;