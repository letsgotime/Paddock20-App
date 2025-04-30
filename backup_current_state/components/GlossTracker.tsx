import React, { useState, useEffect } from 'react';
import { vehicleProfile } from '../data/vehicles'; // Ensure gloss data is imported

interface GlossLog {
  date: string;
  action: string;
  notes: string;
}

const GlossTracker: React.FC = () => {
  // Default logs as fallback if profile data is missing
  const defaultLogs: GlossLog[] = [
    {
      date: '2024-04-15',
      action: 'Ceramic Coating Applied',
      notes: 'Full vehicle ceramic coating with Gyeon Q² Mohs+ (3-year protection).'
    },
    {
      date: '2024-03-20',
      action: 'Paint Correction',
      notes: 'Two-stage paint correction to remove swirl marks and minor scratches.'
    }
  ];

  const [newEntry, setNewEntry] = useState<GlossLog>({
    date: '',
    action: '',
    notes: ''
  });

  // Safely initialize logs
  const [glossHistory, setGlossHistory] = useState<GlossLog[]>([]);
  
  // Using useEffect to safely access and initialize data
  useEffect(() => {
    try {
      if (vehicleProfile && vehicleProfile.glossTracking && Array.isArray(vehicleProfile.glossTracking.glossGrowthLog)) {
        setGlossHistory(vehicleProfile.glossTracking.glossGrowthLog);
      } else {
        console.warn("Using default gloss history because vehicle profile data was missing");
        setGlossHistory(defaultLogs);
        
        // Initialize the vehicle profile data structure if missing
        if (vehicleProfile && !vehicleProfile.glossTracking) {
          vehicleProfile.glossTracking = {
            lastGlossBoost: "2024-04-15",
            lastFullDecon: "2024-03-20",
            lastSealantRefresh: "2024-03-10",
            lastPaintCorrection: "2023-11-15",
            lastCeramicTopCoat: "2022-09-01",
            glossGrowthLog: defaultLogs
          };
        }
      }
    } catch (error) {
      console.error("Error initializing gloss history:", error);
      setGlossHistory(defaultLogs);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.date && newEntry.action) {
      const updatedHistory = [newEntry, ...glossHistory];
      setGlossHistory(updatedHistory);
      
      // Safely update the vehicle profile
      if (vehicleProfile && vehicleProfile.glossTracking) {
        vehicleProfile.glossTracking.glossGrowthLog = updatedHistory;
      }
      
      setNewEntry({ date: '', action: '', notes: '' });
    }
  };

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Gloss Evolution Tracker</h2>
      
      {/* New Entry Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="date"
            value={newEntry.date}
            onChange={handleChange}
            className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
            required
          />
          <input
            type="text"
            name="action"
            placeholder="Action (e.g., Frothe Boost)"
            value={newEntry.action}
            onChange={handleChange}
            className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
            required
          />
          <input
            type="text"
            name="notes"
            placeholder="Optional Notes"
            value={newEntry.notes}
            onChange={handleChange}
            className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
          />
        </div>
        <button type="submit" className="apex-button w-full mt-6">
          Add Gloss Update
        </button>
      </form>
      
      {/* Gloss History Timeline */}
      <div className="space-y-4">
        {glossHistory && glossHistory.length > 0 ? (
          glossHistory.map((entry, index) => (
            <div key={index} className="bg-black p-4 rounded-lg">
              <h3 className="text-blue-400 font-orbitron text-md">{entry.date}</h3>
              <p className="text-white">{entry.action}</p>
              {entry.notes && <p className="text-gray-400 text-sm">{entry.notes}</p>}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No gloss entries yet. Add your first above!</p>
        )}
      </div>
    </div>
  );
};

export default GlossTracker;