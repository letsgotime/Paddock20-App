import React, { useState } from 'react';

const MonthlyChecklist = () => {
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: 'Full decontamination wash', checked: false },
    { id: 2, text: 'Iron remover treatment', checked: false },
    { id: 3, text: 'Clay bar surface', checked: false },
    { id: 4, text: 'Apply sealant/wax', checked: false },
    { id: 5, text: 'Refresh ceramic coating', checked: false },
    { id: 6, text: 'Deep clean interior', checked: false },
    { id: 7, text: 'Apply leather treatment', checked: false },
    { id: 8, text: 'Clean engine bay', checked: false }
  ]);

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

  const percentComplete = Math.round(
    (checklistItems.filter(item => item.checked).length / checklistItems.length) * 100
  );

  return (
    <div className="apex-card mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="apex-header-green">Monthly Detailing</h2>
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
      
      <div className="mt-8 bg-gray-800 rounded-lg p-4">
        <h3 className="text-green-400 font-orbitron text-sm uppercase mb-2">Monthly Detailing Notes</h3>
        <textarea 
          className="w-full bg-gray-700 text-white rounded p-3 h-24"
          placeholder="Add any notes on sealant used, treatment details, etc..."
        ></textarea>
      </div>
    </div>
  );
};

export default MonthlyChecklist;