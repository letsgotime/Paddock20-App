import React, { useState } from 'react';
import { vehicleProfile } from '../data/vehicles'; // Ensure gloss data is imported

interface GlossLog {
  date: string;
  action: string;
  notes: string;
}

const GlossTracker: React.FC = () => {
  const [newEntry, setNewEntry] = useState<GlossLog>({
    date: '',
    action: '',
    notes: ''
  });

  const [glossHistory, setGlossHistory] = useState<GlossLog[]>(vehicleProfile.glossTracking.glossGrowthLog);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.date && newEntry.action) {
      const updatedHistory = [newEntry, ...glossHistory];
      setGlossHistory(updatedHistory);
      vehicleProfile.glossTracking.glossGrowthLog = updatedHistory;
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
        {glossHistory.length > 0 ? glossHistory.map((entry, index) => (
          <div key={index} className="bg-black p-4 rounded-lg">
            <h3 className="text-blue-400 font-orbitron text-md">{entry.date}</h3>
            <p className="text-white">{entry.action}</p>
            {entry.notes && <p className="text-gray-400 text-sm">{entry.notes}</p>}
          </div>
        )) : (
          <p className="text-gray-400">No gloss entries yet. Add your first above!</p>
        )}
      </div>
    </div>
  );
};

export default GlossTracker;