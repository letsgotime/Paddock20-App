import React, { useState } from 'react';

const SeasonalAdaptationChecklist = () => {
  const [season, setSeason] = useState<'winter' | 'spring' | 'summer' | 'fall'>('summer');
  
  const winterTasks = [
    { id: 1, text: 'Switch to winter tires', checked: false },
    { id: 2, text: 'Apply paint protection film', checked: false },
    { id: 3, text: 'Undercarriage protection coating', checked: false },
    { id: 4, text: 'Winter wiper fluid', checked: false },
    { id: 5, text: 'Check battery health', checked: false },
    { id: 6, text: 'Add winter emergency kit', checked: false }
  ];
  
  const springTasks = [
    { id: 1, text: 'Full decontamination wash', checked: false },
    { id: 2, text: 'Switch to summer tires', checked: false },
    { id: 3, text: 'Check cooling system', checked: false },
    { id: 4, text: 'Remove winter protection', checked: false },
    { id: 5, text: 'Apply paint correction', checked: false },
    { id: 6, text: 'Refresh ceramic coating', checked: false }
  ];
  
  const summerTasks = [
    { id: 1, text: 'Apply UV protectant', checked: false },
    { id: 2, text: 'Check A/C system', checked: false },
    { id: 3, text: 'Verify cooling function', checked: false },
    { id: 4, text: 'Replace cabin filter', checked: false },
    { id: 5, text: 'Check tire pressure in heat', checked: false },
    { id: 6, text: 'Apply ceramic coating boost', checked: false }
  ];
  
  const fallTasks = [
    { id: 1, text: 'Check all lighting', checked: false },
    { id: 2, text: 'Apply hydrophobic coating', checked: false },
    { id: 3, text: 'Deep clean interior', checked: false },
    { id: 4, text: 'Inspect weather stripping', checked: false },
    { id: 5, text: 'Prepare for winter storage', checked: false },
    { id: 6, text: 'Full fluid check', checked: false }
  ];
  
  const seasonalTasks = {
    winter: winterTasks,
    spring: springTasks,
    summer: summerTasks,
    fall: fallTasks
  };
  
  const [checklistItems, setChecklistItems] = useState(seasonalTasks[season]);
  
  const toggleChecked = (id: number) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const resetChecklist = () => {
    setChecklistItems(items => 
      items.map(item => ({ ...item, checked: false }))
    );
  };
  
  const handleSeasonChange = (selectedSeason: 'winter' | 'spring' | 'summer' | 'fall') => {
    setSeason(selectedSeason);
    setChecklistItems(seasonalTasks[selectedSeason]);
  };
  
  const percentComplete = Math.round(
    (checklistItems.filter(item => item.checked).length / checklistItems.length) * 100
  );
  
  return (
    <div className="apex-card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="apex-header-green">Seasonal Adaptation</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-green-400 font-bold">{percentComplete}%</span> Complete
          </div>
          <button 
            onClick={resetChecklist}
            className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-500"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        {(['winter', 'spring', 'summer', 'fall'] as const).map((s) => (
          <button
            key={s}
            onClick={() => handleSeasonChange(s)}
            className={`px-4 py-2 rounded-md ${season === s ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-3">Current Season Tasks</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklistItems.map(item => (
            <li 
              key={item.id} 
              className={`flex items-center p-4 rounded-lg cursor-pointer transition ${item.checked ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
              onClick={() => toggleChecked(item.id)}
            >
              <div className={`w-5 h-5 flex-shrink-0 border-2 rounded mr-3 ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                {item.checked && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`${item.checked ? 'line-through text-gray-400' : 'text-white'}`}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-blue-400 font-orbitron text-sm uppercase mb-3">Seasonal Products Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Sealant/Coating</label>
            <input 
              type="text" 
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Tire Type</label>
            <input 
              type="text" 
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-400 text-sm mb-1">Notes</label>
          <textarea 
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
            placeholder="Document seasonal products and adaptations..."
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button className="apex-button">
          Schedule Seasonal Change
        </button>
      </div>
    </div>
  );
};

export default SeasonalAdaptationChecklist;