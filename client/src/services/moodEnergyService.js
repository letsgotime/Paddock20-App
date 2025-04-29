import supabase from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// In-memory fallback for demo or development
let localMoodEnergyEntries = [
  {
    id: '1',
    date: new Date().toISOString(),
    mood: 8,
    energy: 7,
    focus: 9, // New focus field
    note: 'Excellent drive on the mountain pass today. Car felt responsive and handling was precise.',
    vehicleId: 1
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    mood: 5,
    energy: 6,
    focus: 7, // New focus field
    note: 'Moderate traffic conditions, but still enjoyed the coastal route.',
    vehicleId: 1
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    mood: 9,
    energy: 8,
    focus: 8, // New focus field
    note: 'Perfect weather for track day! Set a new personal best lap time.',
    vehicleId: 2
  }
];

/**
 * Get all mood and energy entries, optionally filtered by vehicle
 * 
 * @param {number} vehicleId - Optional vehicle ID to filter entries
 * @returns {Promise<Array>} - Promise resolving to array of entries
 */
export const getMoodEnergyEntries = async (vehicleId = null) => {
  try {
    // Try to fetch from Supabase first
    let query = supabase.from('mood_energy_entries').select('*');
    
    if (vehicleId) {
      query = query.eq('vehicleId', vehicleId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      console.warn('Supabase fetch failed, using local data:', error.message);
      // Return filtered local data as fallback
      return vehicleId 
        ? localMoodEnergyEntries.filter(entry => entry.vehicleId === vehicleId)
        : localMoodEnergyEntries;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting mood/energy entries:', error);
    
    // Return filtered local data as fallback
    return vehicleId 
      ? localMoodEnergyEntries.filter(entry => entry.vehicleId === vehicleId)
      : localMoodEnergyEntries;
  }
};

/**
 * Add a new mood and energy entry
 * 
 * @param {Object} entry - New entry to add
 * @param {number} entry.mood - Mood value (1-10)
 * @param {number} entry.energy - Energy value (1-10)
 * @param {string} entry.note - Optional note about the entry
 * @param {number} entry.vehicleId - Associated vehicle ID
 * @returns {Promise<Object>} - Promise resolving to the added entry
 */
export const addMoodEnergyEntry = async (entry) => {
  try {
    const newEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      ...entry
    };
    
    // Try to save to Supabase first
    const { data, error } = await supabase
      .from('mood_energy_entries')
      .insert([newEntry])
      .select();
    
    if (error) {
      console.warn('Supabase insert failed, saving locally:', error.message);
      // Save to local data as fallback
      localMoodEnergyEntries.unshift(newEntry);
      return newEntry;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error adding mood/energy entry:', error);
    
    // Save to local data as fallback
    const newEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      ...entry
    };
    
    localMoodEnergyEntries.unshift(newEntry);
    return newEntry;
  }
};

/**
 * Get mood/energy statistics for a vehicle or overall
 * 
 * @param {number} vehicleId - Optional vehicle ID to get stats for
 * @returns {Promise<Object>} - Promise resolving to statistics object
 */
export const getMoodEnergyStats = async (vehicleId = null) => {
  try {
    const entries = await getMoodEnergyEntries(vehicleId);
    
    if (!entries || entries.length === 0) {
      return {
        avgMood: 0,
        avgEnergy: 0,
        avgFocus: 0,
        moodTrend: 'neutral',
        energyTrend: 'neutral',
        focusTrend: 'neutral',
        entryCount: 0
      };
    }
    
    // Calculate average mood, energy, and focus
    const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
    const avgEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length;
    const avgFocus = entries.reduce((sum, entry) => sum + (entry.focus || 5), 0) / entries.length;
    
    // Calculate trends (if we have at least 2 entries)
    let moodTrend = 'neutral';
    let energyTrend = 'neutral';
    let focusTrend = 'neutral';
    
    if (entries.length >= 2) {
      // Sort entries by date, newest first
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Compare recent entries to determine trend
      const recentMoodAvg = sortedEntries.slice(0, Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + entry.mood, 0) / Math.min(3, sortedEntries.length);
      
      const olderMoodAvg = sortedEntries.slice(Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + entry.mood, 0) / Math.max(1, sortedEntries.length - Math.min(3, sortedEntries.length));
      
      const recentEnergyAvg = sortedEntries.slice(0, Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + entry.energy, 0) / Math.min(3, sortedEntries.length);
      
      const olderEnergyAvg = sortedEntries.slice(Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + entry.energy, 0) / Math.max(1, sortedEntries.length - Math.min(3, sortedEntries.length));
      
      const recentFocusAvg = sortedEntries.slice(0, Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + (entry.focus || 5), 0) / Math.min(3, sortedEntries.length);
      
      const olderFocusAvg = sortedEntries.slice(Math.min(3, sortedEntries.length))
        .reduce((sum, entry) => sum + (entry.focus || 5), 0) / Math.max(1, sortedEntries.length - Math.min(3, sortedEntries.length));
      
      // Determine trend direction
      if (recentMoodAvg > olderMoodAvg + 0.5) moodTrend = 'improving';
      else if (recentMoodAvg < olderMoodAvg - 0.5) moodTrend = 'declining';
      
      if (recentEnergyAvg > olderEnergyAvg + 0.5) energyTrend = 'improving';
      else if (recentEnergyAvg < olderEnergyAvg - 0.5) energyTrend = 'declining';
      
      if (recentFocusAvg > olderFocusAvg + 0.5) focusTrend = 'improving';
      else if (recentFocusAvg < olderFocusAvg - 0.5) focusTrend = 'declining';
    }
    
    return {
      avgMood: parseFloat(avgMood.toFixed(1)),
      avgEnergy: parseFloat(avgEnergy.toFixed(1)),
      avgFocus: parseFloat(avgFocus.toFixed(1)),
      moodTrend,
      energyTrend,
      focusTrend,
      entryCount: entries.length,
      recentEntries: entries.slice(0, 5) // Last 5 entries
    };
  } catch (error) {
    console.error('Error calculating mood/energy stats:', error);
    return {
      avgMood: 0,
      avgEnergy: 0,
      avgFocus: 0,
      moodTrend: 'neutral',
      energyTrend: 'neutral',
      focusTrend: 'neutral',
      entryCount: 0
    };
  }
};

/**
 * Delete a mood/energy entry by ID
 * 
 * @param {number} entryId - ID of the entry to delete
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
export const deleteMoodEnergyEntry = async (entryId) => {
  try {
    // Try to delete from Supabase first
    const { error } = await supabase
      .from('mood_energy_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) {
      console.warn('Supabase delete failed, removing from local data:', error.message);
      // Remove from local data as fallback
      localMoodEnergyEntries = localMoodEnergyEntries.filter(entry => entry.id !== entryId);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting mood/energy entry:', error);
    
    // Remove from local data as fallback
    try {
      localMoodEnergyEntries = localMoodEnergyEntries.filter(entry => entry.id !== entryId);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Get formatted telemetry data for charts
 * 
 * @param {number} vehicleId - Optional vehicle ID to filter data
 * @returns {Promise<Array>} - Promise resolving to formatted chart data
 */
export const getTelemetryChartData = async (vehicleId = null) => {
  try {
    const entries = await getMoodEnergyEntries(vehicleId);
    
    if (!entries || entries.length === 0) {
      return [];
    }
    
    // Format data for charts
    return entries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(entry => ({
        date: new Date(entry.date).toLocaleDateString(),
        time: new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: entry.mood,
        energy: entry.energy,
        focus: entry.focus || 5, // Include focus with a default value of 5
        note: entry.note || ""
      }));
    
  } catch (error) {
    console.error('Error getting telemetry chart data:', error);
    return [];
  }
};