import React, { useState, useEffect } from 'react';

function SeasonalAdaptationChecklist() {
  const [season, setSeason] = useState('summer'); // Default to summer
  
  useEffect(() => {
    // Determine season based on current month in Northern Hemisphere
    const currentMonth = new Date().getMonth();
    
    if (currentMonth >= 2 && currentMonth <= 4) {
      setSeason('spring');
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      setSeason('summer');
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      setSeason('fall');
    } else {
      setSeason('winter');
    }
  }, []);
  
  const seasonalChecklists = {
    spring: [
      "Full Underbody Wash and Inspection",
      "Pollen Protection Wipe Down (Daily)",
      "Light Rain Driving Technique Review",
      "Tire Pressure Adjustment for Spring Temps",
      "Suspension Check After Winter Road Damage",
      "HVAC Filter Reset",
      "Wiper Blade Replacement",
      "First Detail (Post-Winter Recovery)",
      "Window Residue Removal",
      "Paint Correction for Winter Damage",
      "UV Protection Coating",
      "Convertible Top Treatment (If Applicable)"
    ],
    summer: [
      "Heat Soak Management Protocol",
      "Coolant Level and Quality Check",
      "Radiator/Intercooler Bug Cleanup",
      "High-Temp Brake Fluid Assessment",
      "Tire Pressure Check (Weekly, Heat Adjusted)",
      "Battery Heat Tolerance Check",
      "A/C Performance Optimization",
      "Sunshade Installation When Parked",
      "Ceramic Coating Integrity Check",
      "Interior UV Damage Prevention",
      "Track Day Heat Preparation",
      "Fuel Quality Management (Anti-Heat Soak)"
    ],
    fall: [
      "Falling Leaf Removal Protocol (All Intakes)",
      "Underbody Pre-Winter Protection",
      "Tire Pressure Adjustment for Cooling Temps",
      "Pre-Winter Coating Protection",
      "Fog Light and Visibility Check",
      "HVAC System Winterization",
      "Door/Lock Seal Conditioning",
      "Battery Cold-Start Test",
      "Anti-Freeze Level Verification",
      "Trunk Winter Emergency Kit Preparation",
      "Wheel Well Cleanup Before Snow/Salt",
      "Glass Coating for Winter Visibility"
    ],
    winter: [
      "Weekly Salt Removal Wash",
      "Underbody Salt Neutralization",
      "Door Lock De-Icing Protocol",
      "Snow Removal Safe Practices",
      "Tire Pressure Adjustment for Cold",
      "Wiper Fluid Anti-Freeze Verification",
      "Cold Start Procedure Review",
      "Battery Maintenance in Extreme Cold",
      "Proper Engine Warm-Up Protocol",
      "Interior Humidity Management",
      "Snow/Ice Traction Management",
      "Winter Garage Storage Optimization"
    ]
  };
  
  const seasonColors = {
    spring: 'text-green-400',
    summer: 'text-yellow-400',
    fall: 'text-orange-400',
    winter: 'text-blue-300'
  };
  
  const checklist = seasonalChecklists[season] || seasonalChecklists.summer;

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className={`${seasonColors[season]} font-orbitron text-xl uppercase mb-6 text-center`}>
        {season.charAt(0).toUpperCase() + season.slice(1)} Adaptation Checklist
      </h2>
      <ul className="grid grid-cols-1 gap-4">
        {checklist.map((item, index) => (
          <li key={index} className="flex items-center space-x-4">
            <div className={`w-5 h-5 bg-${season === 'winter' ? 'blue-500' : season === 'fall' ? 'orange-500' : season === 'spring' ? 'green-500' : 'yellow-500'} rounded-full`}></div>
            <p className="text-white">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SeasonalAdaptationChecklist;