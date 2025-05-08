import React from 'react';

function QuarterlyChecklist() {
  const checklist = [
    "Full Paint Correction Spot Audit",
    "Full Decon Pass (Iron, Clay, Rinse)",
    "Topcoat Reapplication (Reload, Boost, Elixir)",
    "Door Seal Deep Conditioning",
    "Glass Re-Coat or Forte Reapplication",
    "Wheel Coating Inspection and Reset",
    "Brake Pad and Rotor Health Audit",
    "Alignment + Balance Check",
    "Interior Full Detail + Re-shield",
    "Engine Bay Tightening + Freshen",
    "Gloss Growth Chart Update",
    "New Flip Packet Draft (If Selling Within 180 Days)"
  ];

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-green-400 font-orbitron text-xl uppercase mb-6 text-center">
        Quarterly Full Reset
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

export default QuarterlyChecklist;