import React, { useState } from 'react';
import supabase from '../services/supabaseClient';
import MoodEnergyTracker from './MoodEnergyTracker';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('DriveJournal').insert([{
        user_id: (await supabase.auth.getUser()).data.user.id,
        ...formData
      }]);
      alert('Drive Entry Saved!');
      setFormData({
        car: '',
        location: '',
        mileage: '',
        treadDepth: '',
        weather: '',
        mood: '',
        notes: '',
        photoUrl: '',
        date: ''
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

        <button type="submit" className="apex-button w-full" aria-label="Save Drive Entry">
          Save Drive
        </button>
      </form>
    </div>
  );
}

export default DriveLoggerForm;