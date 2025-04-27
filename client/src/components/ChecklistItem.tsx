import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

interface ChecklistItemProps {
  checklistName: string;
  itemName: string;
}

function ChecklistItem({ checklistName, itemName }: ChecklistItemProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      const { data, error } = await supabase
        .from('UserChecklists')
        .select('is_complete')
        .eq('checklist_name', checklistName)
        .eq('item_name', itemName)
        .single();
      if (data) {
        setIsComplete(data.is_complete);
      }
    }
    fetchStatus();
  }, [checklistName, itemName]);

  const toggleComplete = async () => {
    const userResponse = await supabase.auth.getUser();
    
    const { data } = userResponse;
    if (!data || !data.user) {
      console.error('User not authenticated');
      return;
    }
    
    const { error } = await supabase
      .from('UserChecklists')
      .upsert({
        user_id: data.user.id,
        checklist_name: checklistName,
        item_name: itemName,
        is_complete: !isComplete
      });
    
    if (!error) {
      setIsComplete(!isComplete);
    } else {
      console.error('Error toggling checklist item:', error);
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