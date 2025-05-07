import React, { useState } from "react";

interface Mod {
  id: number;
  title: string;
  description: string;
  dateInstalled: string;
  cost: number;
}

const ModPlannerPage = () => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [newMod, setNewMod] = useState<Mod>({
    id: Date.now(),
    title: "",
    description: "",
    dateInstalled: "",
    cost: 0,
  });

  const handleAddMod = () => {
    if (!newMod.title) {
      alert("Please enter the modification title.");
      return;
    }
    setMods([...mods, { ...newMod, id: Date.now() }]);
    setNewMod({
      id: Date.now(),
      title: "",
      description: "",
      dateInstalled: "",
      cost: 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🔧 Shine Haus™ Mod Planner</h1>

      {/* Add New Mod Form */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Add New Mod</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Modification Title"
            value={newMod.title}
            onChange={(e) => setNewMod({ ...newMod, title: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="date"
            value={newMod.dateInstalled}
            onChange={(e) => setNewMod({ ...newMod, dateInstalled: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Cost ($)"
            value={newMod.cost}
            onChange={(e) => setNewMod({ ...newMod, cost: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <textarea
            placeholder="Modification Description"
            value={newMod.description}
            onChange={(e) => setNewMod({ ...newMod, description: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded col-span-1 md:col-span-2"
          />
        </div>
        <button onClick={handleAddMod} className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Save Mod
        </button>
      </section>

      {/* List of Mods */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Installed Mods</h2>
        {mods.length === 0 ? (
          <p className="text-gray-300">No mods documented yet. Start tracking your build.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mods.map((mod) => (
              <div key={mod.id} className="bg-gray-800 rounded-lg p-5 shadow-lg">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{mod.title}</h3>
                <p className="text-white text-sm mb-2">🛠 Installed On: {mod.dateInstalled}</p>
                <p className="text-white text-sm mb-2">💵 Cost: ${mod.cost.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">{mod.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ModPlannerPage;