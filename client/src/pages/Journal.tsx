import React, { useState, useEffect } from 'react';
import { fetchDriveJournal, DriveEntry } from '../services/driveJournalService';

function Journal() {
  const [entries, setEntries] = useState<DriveEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const data = await fetchDriveJournal();
        setEntries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Drive Journal entries:', error);
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  return (
    <div className="p-10 bg-black min-h-screen">
      <h2 className="apex-header-green mb-8 text-center">Drive Journal Logs</h2>

      {loading ? (
        <p className="text-gray-400 text-center">Loading drive logs...</p>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry, index) => (
            <div key={index} className="apex-card p-6">
              <h3 className="text-blue-400 font-orbitron text-lg mb-2">{entry.date} | {entry.location}</h3>
              <p className="text-white">Car: {entry.car}</p>
              <p className="text-white">Mileage: {entry.mileage} miles</p>
              <p className="text-white">Tread Depth: {entry.treadDepth} mm</p>
              <p className="text-white">Weather: {entry.weather}</p>
              {entry.mood && <p className="text-white">Mood: {entry.mood}</p>}
              <p className="text-gray-400 mt-2">{entry.notes}</p>
              {entry.photoUrl && (
                <img src={entry.photoUrl} alt="Drive" className="rounded-lg mt-4" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No drives logged yet. Start logging your rides!</p>
      )}
    </div>
  );
}

export default Journal;