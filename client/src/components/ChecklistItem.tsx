import React, { useState, useEffect } from 'react';

interface ChecklistItemProps {
  checklistName: string;
  itemName: string;
}

function ChecklistItem({ checklistName, itemName }: ChecklistItemProps) {
  const [isComplete, setIsComplete] = useState(false);

  // Use local storage exclusively for the demo version
  useEffect(() => {
    try {
      // Store checklist items in local storage for the demo
      const storageKey = `checklist_${checklistName}_${itemName}`;
      const savedStatus = localStorage.getItem(storageKey);
      
      if (savedStatus !== null) {
        setIsComplete(savedStatus === 'true');
      }
    } catch (err) {
      console.info('Local storage not available, using defaults');
    }
  }, [checklistName, itemName]);

  const toggleComplete = () => {
    try {
      // Update local storage
      const storageKey = `checklist_${checklistName}_${itemName}`;
      const newStatus = !isComplete;
      localStorage.setItem(storageKey, String(newStatus));
      setIsComplete(newStatus);
      console.info(`Checklist item "${itemName}" ${newStatus ? 'completed' : 'uncompleted'}`);
    } catch (error) {
      // Fallback if localStorage is not available
      setIsComplete(!isComplete);
      console.info('Demo mode: State updated in-memory only');
    }
  };

  return (
    <div className="flex items-center space-x-4 mb-4">
      <input
        type="checkbox"
        checked={isComplete}
        onChange={toggleComplete}
        className="w-5 h-5"
      />
      <p className={`text-white ${isComplete ? 'line-through' : ''}`}>
        {itemName}
      </p>
    </div>
  );
}

export default ChecklistItem;