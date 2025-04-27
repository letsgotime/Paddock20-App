import React, { useState } from "react";

interface TireSet {
  id: number;
  brand: string;
  model: string;
  installDate: string;
  installMileage: number;
  currentMileage: number;
  retired: boolean;
}

const TireLifecycleManager = () => {
  const [tireSets, setTireSets] = useState<TireSet[]>([]);
  const [newTire, setNewTire] = useState({
    brand: "",
    model: "",
    installDate: "",
    installMileage: 0,
  });

  const handleAddTireSet = () => {
    if (!newTire.brand || !newTire.model || !newTire.installDate || newTire.installMileage <= 0) {
      alert("Please complete all fields correctly.");
      return;
    }
    const newSet: TireSet = {
      id: Date.now(),
      brand: newTire.brand,
      model: newTire.model,
      installDate: newTire.installDate,
      installMileage: newTire.installMileage,
      currentMileage: newTire.installMileage,
      retired: false,
    };
    setTireSets([...tireSets, newSet]);
    setNewTire({ brand: "", model: "", installDate: "", installMileage: 0 });
  };

  const handleRetireTireSet = (id: number) => {
    setTireSets(tireSets.map(tire => tire.id === id ? { ...tire, retired: true } : tire));
  };

  const handleMileageUpdate = (id: number, newMileage: number) => {
    setTireSets(tireSets.map(tire => tire.id === id ? { ...tire, currentMileage: newMileage } : tire));
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md">
      <h3 className="text-green-400 font-orbitron text-2xl mb-4">🛞 Tire Lifecycle Manager</h3>

      {/* Add New Tire Form */}
      <div className="mb-8">
        <h4 className="text-blue-400 font-orbitron text-xl mb-2">Add New Tire Set</h4>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Brand (e.g., Michelin)"
            value={newTire.brand}
            onChange={e => setNewTire({ ...newTire, brand: e.target.value })}
            className="bg-black border border-gray-600 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Model (e.g., Pilot Sport 4S)"
            value={newTire.model}
            onChange={e => setNewTire({ ...newTire, model: e.target.value })}
            className="bg-black border border-gray-600 p-2 rounded"
          />
          <input
            type="date"
            value={newTire.installDate}
            onChange={e => setNewTire({ ...newTire, installDate: e.target.value })}
            className="bg-black border border-gray-600 p-2 rounded"
          />
          <input
            type="number"
            placeholder="Install Mileage"
            value={newTire.installMileage}
            onChange={e => setNewTire({ ...newTire, installMileage: parseInt(e.target.value) })}
            className="bg-black border border-gray-600 p-2 rounded"
          />
          <button onClick={handleAddTireSet} className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2 rounded">
            ➕ Add Tire Set
          </button>
        </div>
      </div>

      {/* Current Active Tires */}
      <div>
        <h4 className="text-blue-400 font-orbitron text-xl mb-2">Current Tire Sets</h4>
        {tireSets.filter(t => !t.retired).length === 0 && <p className="text-gray-400 mb-4">No active tires yet.</p>}
        {tireSets.filter(t => !t.retired).map(tire => (
          <div key={tire.id} className="bg-black p-4 mb-4 rounded border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{tire.brand} {tire.model}</p>
                <p className="text-gray-400 text-sm">Installed: {tire.installDate}</p>
                <p className="text-gray-400 text-sm">Mileage Driven: {tire.currentMileage - tire.installMileage} miles</p>
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Update Mileage"
                  onChange={(e) => handleMileageUpdate(tire.id, parseInt(e.target.value))}
                  className="bg-black border border-gray-600 p-2 rounded w-24"
                />
                <button onClick={() => handleRetireTireSet(tire.id)} className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded">
                  ♻️ Retire
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Retired Tires */}
      <div className="mt-8">
        <h4 className="text-blue-400 font-orbitron text-xl mb-2">Archived Tire Sets</h4>
        {tireSets.filter(t => t.retired).length === 0 && <p className="text-gray-400">No retired tires yet.</p>}
        {tireSets.filter(t => t.retired).map(tire => (
          <div key={tire.id} className="bg-black p-4 mb-4 rounded border border-gray-700">
            <p className="text-white font-semibold">{tire.brand} {tire.model}</p>
            <p className="text-gray-400 text-sm">Installed: {tire.installDate}</p>
            <p className="text-gray-400 text-sm">Mileage Driven Before Retirement: {tire.currentMileage - tire.installMileage} miles</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TireLifecycleManager;