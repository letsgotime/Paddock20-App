import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

interface ChecklistItemProps {
  checklistName: string;
  itemName: string;
}

function ChecklistItem({ checklistName, itemName }: ChecklistItemProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      setIsLoading(true);
      try {
        // Check if we're using the mock client (demo mode)
        const isMockClient = (supabase as any)._isMockClient === true;
        
        const response = await supabase
          .from('UserChecklists')
          .select('is_complete')
          .match({ checklist_name: checklistName, item_name: itemName })
          .single();
          
        if (response.data) {
          setIsComplete(response.data.is_complete);
        } else if (response.error && !isMockClient) {
          // Only log error if we're not in demo mode
          console.error('Error fetching checklist item status:', response.error);
        }
      } catch (err) {
        // This is a more severe error (like network issue)
        console.error('Exception fetching checklist item status:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, [checklistName, itemName]);

  const toggleComplete = async () => {
    if (isLoading) return; // Prevent toggling while loading
    
    try {
      // Check if we're using the mock client (demo mode)
      const isMockClient = (supabase as any)._isMockClient === true;
      
      const { error } = await supabase
        .from('UserChecklists')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          checklist_name: checklistName,
          item_name: itemName,
          is_complete: !isComplete
        });
        
      if (!error) {
        setIsComplete(!isComplete);
      } else if (!isMockClient) {
        // Only log error if we're not in demo mode
        console.error('Checklist Toggle Error:', error.message);
      }
    } catch (error) {
      // This is a more severe error (like network issue)
      console.error('Checklist toggle failed:', error);
    }
    
    // In demo mode, just toggle the state directly
    if ((supabase as any)._isMockClient) {
      setIsComplete(!isComplete);
    }
  };

  // Generate a stable, URL-safe ID for the checkbox
  const id = `${checklistName}-${itemName}`.replace(/\s+/g, '-').toLowerCase();

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleComplete();
    }
  };

  return (
    <div 
      className="flex items-center space-x-4 mb-4" 
      role="group" 
      aria-labelledby={`${id}-label`}
    >
      {isLoading ? (
        <div className="w-5 h-5 bg-gray-700 animate-pulse rounded" aria-hidden="true" />
      ) : (
        <>
          <input
            id={id}
            type="checkbox"
            checked={isComplete}
            onChange={toggleComplete}
            className="w-5 h-5 cursor-pointer focus:ring-2 focus:ring-green-500 focus:outline-none"
            aria-labelledby={`${id}-label`}
          />
          
          {/* Visual feedback for screen readers */}
          <span 
            className="sr-only" 
            aria-live="polite"
          >
            Item {itemName} is {isComplete ? 'completed' : 'not completed'}
          </span>
        </>
      )}
      
      <label 
        htmlFor={id} 
        id={`${id}-label`} 
        className={`text-white ${isComplete ? 'line-through' : ''}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {itemName}
      </label>
    </div>
  );
}

export default ChecklistItem;