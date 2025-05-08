import React, { useState } from 'react';
import { vehicleProfile } from '../data/vehicles'; // Make sure you import the tire profile

interface DriveEntry {
  date: string;
  car: string;
  location: string;
  mileage: string;
  treadDepth: string;
  weather: string;
  notes: string;
  photoUrl: string;
}

interface DriveLoggerFormProps {
  onAddDrive: (entry: DriveEntry) => void;
}

function DriveLoggerForm({ onAddDrive }: DriveLoggerFormProps) {
  const [newEntry, setNewEntry] = useState<DriveEntry>({
    date: '',
    car: vehicleProfile.make + ' ' + vehicleProfile.model,
    location: '',
    mileage: '',
    treadDepth: '',
    weather: '',
    notes: '',
    photoUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.mileage && newEntry.treadDepth) {
      // Update tire current mileage and last tread depth
      vehicleProfile.tire.currentMileage += parseInt(newEntry.mileage);
      vehicleProfile.tire.lastTreadDepthCheck = newEntry.treadDepth;
    }

    if (newEntry.car && newEntry.date && newEntry.location) {
      onAddDrive(newEntry);

      // Reset form
      setNewEntry({
        date: '',
        car: vehicleProfile.make + ' ' + vehicleProfile.model,
        location: '',
        mileage: '',
        treadDepth: '',
        weather: '',
        notes: '',
        photoUrl: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">
        Log a New Drive
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <input type="date" name="date" value={newEntry.date} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" required />

        <input type="text" name="location" placeholder="Drive Location" value={newEntry.location} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" required />

        <input type="number" name="mileage" placeholder="Mileage Driven" value={newEntry.mileage} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" required />

        <input type="number" step="0.1" name="treadDepth" placeholder="Tread Depth (mm)" value={newEntry.treadDepth} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" required />

        <input type="text" name="weather" placeholder="Surface/Weather Notes" value={newEntry.weather} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" />

        <input type="text" name="photoUrl" placeholder="Photo URL (optional)" value={newEntry.photoUrl} onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans" />
      </div>

      <textarea name="notes" placeholder="Drive Notes" value={newEntry.notes} onChange={handleChange}
        className="w-full p-4 rounded-lg bg-black border border-gray-700 text-white font-openSans mb-6" rows={4}>
      </textarea>

      <button type="submit" className="apex-button w-full">
        Save Drive Entry
      </button>
    </form>
  );
}

export default DriveLoggerForm;