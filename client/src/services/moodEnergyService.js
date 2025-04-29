/**
 * Service for handling mood and energy tracking data
 */

// In-memory storage for mood/energy entries (replace with API calls in production)
let moodEnergyEntries = [
  {
    id: 1,
    mood: 8,
    energy: 7,
    note: "Great drive today! The car felt very responsive.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    vehicleId: 1
  },
  {
    id: 2,
    mood: 6,
    energy: 4,
    note: "Traffic was heavy, slightly frustrated.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    vehicleId: 1
  },
  {
    id: 3,
    mood: 9,
    energy: 9,
    note: "Early morning drive, perfect weather!",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    vehicleId: 2
  }
];

/**
 * Get all mood and energy entries, optionally filtered by vehicle
 * 
 * @param {number} vehicleId - Optional vehicle ID to filter entries
 * @returns {Promise<Array>} - Promise resolving to array of entries
 */
export const getMoodEnergyEntries = (vehicleId = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (vehicleId === null) {
        resolve([...moodEnergyEntries].sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        resolve(
          [...moodEnergyEntries]
            .filter(entry => entry.vehicleId === vehicleId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
    }, 300); // Simulate network delay
  });
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
export const addMoodEnergyEntry = (entry) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newEntry = {
        id: moodEnergyEntries.length + 1,
        ...entry,
        date: entry.date || new Date().toISOString()
      };
      
      moodEnergyEntries.push(newEntry);
      resolve(newEntry);
    }, 300); // Simulate network delay
  });
};

/**
 * Get mood/energy statistics for a vehicle or overall
 * 
 * @param {number} vehicleId - Optional vehicle ID to get stats for
 * @returns {Promise<Object>} - Promise resolving to statistics object
 */
export const getMoodEnergyStats = (vehicleId = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let entries;
      
      if (vehicleId === null) {
        entries = [...moodEnergyEntries];
      } else {
        entries = [...moodEnergyEntries].filter(entry => entry.vehicleId === vehicleId);
      }
      
      // No entries case
      if (entries.length === 0) {
        resolve({
          avgMood: 0,
          avgEnergy: 0,
          totalEntries: 0,
          trend: 'neutral'
        });
        return;
      }
      
      // Calculate average mood and energy
      const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
      const avgEnergy = entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length;
      
      // Calculate trend (improving, declining, or steady)
      let trend = 'neutral';
      if (entries.length >= 2) {
        // Sort by date, oldest first
        const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Take first and last few entries to determine trend
        const firstFew = sortedEntries.slice(0, Math.min(3, Math.floor(sortedEntries.length / 2)));
        const lastFew = sortedEntries.slice(-Math.min(3, Math.floor(sortedEntries.length / 2)));
        
        const firstFewAvgMood = firstFew.reduce((sum, entry) => sum + entry.mood, 0) / firstFew.length;
        const lastFewAvgMood = lastFew.reduce((sum, entry) => sum + entry.mood, 0) / lastFew.length;
        
        const moodDiff = lastFewAvgMood - firstFewAvgMood;
        
        if (moodDiff > 0.5) trend = 'improving';
        else if (moodDiff < -0.5) trend = 'declining';
        else trend = 'steady';
      }
      
      resolve({
        avgMood: parseFloat(avgMood.toFixed(1)),
        avgEnergy: parseFloat(avgEnergy.toFixed(1)),
        totalEntries: entries.length,
        trend
      });
    }, 300); // Simulate network delay
  });
};

/**
 * Delete a mood/energy entry by ID
 * 
 * @param {number} entryId - ID of the entry to delete
 * @returns {Promise<boolean>} - Promise resolving to success status
 */
export const deleteMoodEnergyEntry = (entryId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialLength = moodEnergyEntries.length;
      moodEnergyEntries = moodEnergyEntries.filter(entry => entry.id !== entryId);
      
      resolve(moodEnergyEntries.length < initialLength);
    }, 300); // Simulate network delay
  });
};