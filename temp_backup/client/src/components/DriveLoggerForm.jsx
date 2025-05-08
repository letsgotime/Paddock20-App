import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import MoodEnergyTracker from './MoodEnergyTracker';
import { getTelemetryChartData, addMoodEnergyEntry } from '../services/moodEnergyService';

function DriveLoggerForm() {
  const [formData, setFormData] = useState({
    car: '',
    location: '',
    mileage: '',
    treadDepth: '',
    weather: '',
    mood: '',
    notes: '',
    photoUrl: '',
    date: '',
    moodValue: 5,
    energyValue: 5,
    moodEnergyNote: ''
  });
  
  const [moodEnergyEntries, setMoodEnergyEntries] = useState([]);
  const [activeMoodEnergy, setActiveMoodEnergy] = useState({
    mood: 5,
    energy: 5,
    note: ''
  });

  // Load mood and energy telemetry data
  useEffect(() => {
    const loadTelemetryData = async () => {
      const data = await getTelemetryChartData();
      setMoodEnergyEntries(data);
    };
    
    loadTelemetryData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle mood/energy tracker save
  const handleMoodEnergySave = async (entry) => {
    // Add the new entry
    const newEntry = await addMoodEnergyEntry({
      ...entry,
      vehicleId: 1 // Default to first vehicle
    });
    
    // Update local state with new entry
    const updatedEntries = [
      {
        date: new Date(newEntry.date).toLocaleDateString(),
        time: new Date(newEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: newEntry.mood,
        energy: newEntry.energy,
        note: newEntry.note || ""
      },
      ...moodEnergyEntries
    ];
    
    setMoodEnergyEntries(updatedEntries);
    
    // Update the form data with the new mood and energy values
    setFormData(prev => ({
      ...prev,
      moodValue: entry.mood,
      energyValue: entry.energy,
      moodEnergyNote: entry.note,
      mood: getMoodTerm(entry.mood) // Use the F1 terminology for the mood field
    }));
    
    // Show feedback
    alert('Telemetry data recorded for this drive!');
  };
  
  // Get F1-style terminology for mood levels
  const getMoodTerm = (value) => {
    if (value <= 2) return 'Pit Stop Needed';
    if (value <= 4) return 'Out of the Racing Line';
    if (value <= 6) return 'On the Grid';
    if (value <= 8) return 'Flying Lap';
    return 'Pole Position';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include the mood/energy data with the drive journal entry
      const journalEntry = {
        user_id: (await supabase.auth.getUser()).data.user.id,
        ...formData,
        telemetryMood: activeMoodEnergy.mood,
        telemetryEnergy: activeMoodEnergy.energy,
        telemetryNotes: activeMoodEnergy.note
      };
      
      await supabase.from('DriveJournal').insert([journalEntry]);
      alert('Drive Entry Saved!');
      
      // Reset form
      setFormData({
        car: '',
        location: '',
        mileage: '',
        treadDepth: '',
        weather: '',
        mood: '',
        notes: '',
        photoUrl: '',
        date: '',
        moodValue: 5,
        energyValue: 5,
        moodEnergyNote: ''
      });
      
      // Reset mood/energy state
      setActiveMoodEnergy({
        mood: 5,
        energy: 5,
        note: ''
      });
    } catch (error) {
      console.error('Error saving drive entry:', error.message);
    }
  };

  return (
    <div className="apex-card" aria-labelledby="driveLoggerHeading" role="form">
      <h2 id="driveLoggerHeading" className="apex-header-green mb-6 text-center">Log a Drive</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-describedby="driveLoggerDescription">
        <p id="driveLoggerDescription" className="text-gray-400 text-sm mb-4 text-center">
          All fields marked as required must be completed for logging a drive.
        </p>

        {/* Accessible Inputs */}
        <label htmlFor="car" className="text-white">Car (required)</label>
        <input type="text" name="car" id="car" value={formData.car} onChange={handleChange} required className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="location" className="text-white">Location (required)</label>
        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="mileage" className="text-white">Mileage (required)</label>
        <input type="number" name="mileage" id="mileage" value={formData.mileage} onChange={handleChange} required className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="treadDepth" className="text-white">Tread Depth (mm)</label>
        <input type="number" name="treadDepth" id="treadDepth" value={formData.treadDepth} onChange={handleChange} className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="weather" className="text-white">Weather Conditions</label>
        <input type="text" name="weather" id="weather" value={formData.weather} onChange={handleChange} className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="mood" className="text-white">Mood (optional)</label>
        <input type="text" name="mood" id="mood" value={formData.mood} onChange={handleChange} className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="photoUrl" className="text-white">Photo URL (optional)</label>
        <input type="url" name="photoUrl" id="photoUrl" value={formData.photoUrl} onChange={handleChange} className="p-3 rounded-lg bg-black border border-gray-700 text-white" />

        <label htmlFor="date" className="text-white">Date (required)</label>
        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="p-3 rounded-lg bg-black border border-gray-700 text-white" />
        
        {/* Driver Telemetry Tracking */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-orbitron text-blue-400 mb-4 flex items-center justify-center">
            Driver Telemetry
          </h3>
          <MoodEnergyTracker
            entries={moodEnergyEntries}
            onSave={handleMoodEnergySave}
            currentMood={activeMoodEnergy.mood}
            currentEnergy={activeMoodEnergy.energy}
            showHistory={true}
          />
        </div>

        <button type="submit" className="apex-button w-full mt-6" aria-label="Save Drive Entry">
          Save Drive Journal Entry
        </button>
      </form>
    </div>
  );
}

export default DriveLoggerForm;