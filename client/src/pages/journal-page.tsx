import React, { useState } from "react";

interface DriveEntry {
  id: number;
  date: string;
  startingMileage: number;
  destination: string;
  driveMood: string;
  surfaceTemp: string;
  weatherConditions: string;
  notes: string;
  photoURLs: string[];
}

function Journal() {
  const [entries, setEntries] = useState<DriveEntry[]>([]);
  const [newEntry, setNewEntry] = useState<DriveEntry>({
    id: Date.now(),
    date: "",
    startingMileage: 0,
    destination: "",
    driveMood: "",
    surfaceTemp: "74°F", // Phase 8.4 upgrade: live pull
    weatherConditions: "Sunny",
    notes: "",
    photoURLs: [],
  });

  const handleSaveEntry = () => {
    if (!newEntry.date || !newEntry.startingMileage || !newEntry.destination) {
      alert("Please complete the required fields.");
      return;
    }
    setEntries([...entries, { ...newEntry, id: Date.now() }]);
    setNewEntry({
      id: Date.now(),
      date: "",
      startingMileage: 0,
      destination: "",
      driveMood: "",
      surfaceTemp: "74°F",
      weatherConditions: "Sunny",
      notes: "",
      photoURLs: [],
    });
  };

  // Mood options with emojis for the select dropdown
  const moodOptions = [
    { value: "exhilarated", label: "🤩 Exhilarated" },
    { value: "focused", label: "🧠 Focused" },
    { value: "relaxed", label: "😌 Relaxed" },
    { value: "refreshed", label: "😊 Refreshed" },
    { value: "tired", label: "😴 Tired" },
    { value: "stressed", label: "😰 Stressed" },
    { value: "frustrated", label: "😤 Frustrated" }
  ];

  return (
    <div className="bg-black min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">📝 Drive Journal</h1>

      {/* Add New Entry Form */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6 mb-8">
        <h2 className="font-orbitron text-green-500 text-2xl mb-6">Log Your Drive</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white text-sm mb-2">Date</label>
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="bg-gray-800 text-white p-3 rounded border border-gray-700 w-full"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">Starting Mileage</label>
            <input
              type="number"
              value={newEntry.startingMileage || ""}
              onChange={(e) => setNewEntry({ ...newEntry, startingMileage: parseInt(e.target.value) || 0 })}
              className="bg-gray-800 text-white p-3 rounded border border-gray-700 w-full"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">Destination</label>
            <input
              type="text"
              placeholder="Where did you drive?"
              value={newEntry.destination}
              onChange={(e) => setNewEntry({ ...newEntry, destination: e.target.value })}
              className="bg-gray-800 text-white p-3 rounded border border-gray-700 w-full"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">Drive Mood</label>
            <select
              value={newEntry.driveMood}
              onChange={(e) => setNewEntry({ ...newEntry, driveMood: e.target.value })}
              className="bg-gray-800 text-white p-3 rounded border border-gray-700 w-full"
            >
              <option value="">Select your mood</option>
              {moodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weather Summary */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-white text-sm mb-2">Surface Temperature</label>
            <div className="flex items-center bg-gray-800 text-white p-3 rounded border border-gray-700">
              {newEntry.surfaceTemp}
            </div>
          </div>
          
          <div>
            <label className="block text-white text-sm mb-2">Weather Conditions</label>
            <div className="flex items-center bg-gray-800 text-white p-3 rounded border border-gray-700">
              {newEntry.weatherConditions}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-white text-sm mb-2">Drive Notes</label>
          <textarea
            placeholder="Surface feel, tire temps, brake fade? How was the drive?"
            value={newEntry.notes}
            onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
            className="w-full bg-gray-800 text-white p-3 rounded border border-gray-700 min-h-[120px]"
          />
        </div>

        <button 
          onClick={handleSaveEntry} 
          className="mt-6 bg-green-500 hover:bg-green-400 text-black font-medium px-8 py-3 rounded flex items-center"
        >
          <span className="mr-2">➕</span> Save Drive Log
        </button>
      </section>

      {/* Existing Drive Logs */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg border border-gray-700 p-6">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-6">Previous Drives</h2>
        
        {entries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-300 mb-4">No drive logs yet. Start building your driving history.</p>
            <p className="text-gray-500 italic">Your automotive journey, documented.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-black rounded-lg p-5 shadow-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-blue-400 font-orbitron text-xl">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                  <span className="text-green-400 font-medium">{getMoodEmoji(entry.driveMood)}</span>
                </div>
                
                <p className="text-white mb-2">📍 <span className="font-medium">{entry.destination}</span></p>
                <p className="text-white mb-2">📏 <span className="font-medium">{entry.startingMileage.toLocaleString()} miles</span></p>
                <p className="text-white mb-2">🌡️ <span className="font-medium">{entry.surfaceTemp}</span> | ☁️ <span className="font-medium">{entry.weatherConditions}</span></p>
                
                {entry.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-gray-300 text-sm italic">{entry.notes}</p>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this entry?')) {
                        setEntries(entries.filter(e => e.id !== entry.id));
                      }
                    }}
                    className="text-red-500 hover:text-red-400 text-xs flex items-center"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Helper function to get mood emoji
const getMoodEmoji = (mood: string) => {
  switch (mood) {
    case "exhilarated": return "🤩";
    case "focused": return "🧠";
    case "relaxed": return "😌";
    case "refreshed": return "😊";
    case "tired": return "😴";
    case "stressed": return "😰";
    case "frustrated": return "😤";
    default: return "";
  }
};

export default Journal;