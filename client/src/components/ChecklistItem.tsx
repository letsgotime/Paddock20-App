import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

interface ChecklistItemProps {
  checklistName: string;
  itemName: string;
}

function ChecklistItem({ checklistName, itemName }: ChecklistItemProps) {
  const [isComplete, setIsComplete] = useState(false);

  // Fetch status from Supabase, fallback to localStorage if needed
  useEffect(() => {
    async function fetchStatus() {
      try {
        // Try to get status from Supabase first
        const { data, error } = await supabase
          .from('UserChecklists')
          .select('is_complete')
          .match({ checklist_name: checklistName, item_name: itemName })
          .single();

        if (data) {
          setIsComplete(data.is_complete);
        } else {
          // Fallback to localStorage if no data in Supabase or error
          const storageKey = `checklist_${checklistName}_${itemName}`;
          const savedStatus = localStorage.getItem(storageKey);
          
          if (savedStatus !== null) {
            setIsComplete(savedStatus === 'true');
          }
        }
      } catch (err) {
        // Fallback to localStorage on error
        console.info('Error accessing Supabase, using localStorage');
        try {
          const storageKey = `checklist_${checklistName}_${itemName}`;
          const savedStatus = localStorage.getItem(storageKey);
          
          if (savedStatus !== null) {
            setIsComplete(savedStatus === 'true');
          }
        } catch (localErr) {
          console.info('Local storage not available, using defaults');
        }
      }
    }
    
    fetchStatus();
  }, [checklistName, itemName]);

  const toggleComplete = async () => {
    const newStatus = !isComplete;
    
    try {
      // Try to update in Supabase first
      const { data, error } = await supabase
        .from('UserChecklists')
        .upsert({
          checklist_name: checklistName,
          item_name: itemName,
          is_complete: newStatus
        }, {
          onConflict: 'checklist_name,item_name'
        });
        
      if (error) {
        throw new Error(error.message);
      }
      
      // Also update in localStorage as backup
      const storageKey = `checklist_${checklistName}_${itemName}`;
      localStorage.setItem(storageKey, String(newStatus));
      
      // Update UI state
      setIsComplete(newStatus);
      console.info(`Checklist item "${itemName}" ${newStatus ? 'completed' : 'uncompleted'}`);
    } catch (error) {
      // Fallback to just localStorage if Supabase fails
      try {
        const storageKey = `checklist_${checklistName}_${itemName}`;
        localStorage.setItem(storageKey, String(newStatus));
        setIsComplete(newStatus);
        console.info(`Fallback to localStorage: Checklist item "${itemName}" ${newStatus ? 'completed' : 'uncompleted'}`);
      } catch (localError) {
        // Last resort - just update the state in memory
        setIsComplete(newStatus);
        console.info('Demo mode: State updated in-memory only');
      }
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