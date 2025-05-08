import React from 'react';

function PreDriveChecklist() {
  const checklist = [
    "Tire Pressure - Front/Rear Match",
    "Tire Tread Depth Visual Check",
    "Torque Spec Glance",
    "Oil Level Dipstick Check",
    "Coolant Visual Inspection",
    "Brake Pad Depth Check",
    "Brake Fluid Level Check",
    "Battery Health Scan",
    "Lights & Signals Function Test",
    "Wiper Blade + Washer Fluid Check",
    "Fuel Range Match",
    "Garage Floor Leak Visual Check",
    "Weather Condition Check",
    "Final Pre-Drive Walkaround"
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-green-400 font-orbitron text-xl uppercase mb-6 text-center">
        Pre-Drive Readiness Checklist
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

export default PreDriveChecklist;