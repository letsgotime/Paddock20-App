import React, { useState } from "react";

interface DreamAsset {
  id: number;
  category: string;
  name: string;
  targetDate: string;
  why: string;
  description: string;
  estimatedValue: number;
  strategy: string;
  progress: number;
}

const ManifestationStationPage = () => {
  const [dreams, setDreams] = useState<DreamAsset[]>([]);
  const [newDream, setNewDream] = useState<DreamAsset>({
    id: Date.now(),
    category: "",
    name: "",
    targetDate: "",
    why: "",
    description: "",
    estimatedValue: 0,
    strategy: "",
    progress: 0,
  });

  const handleAddDream = () => {
    if (!newDream.name || !newDream.category) {
      alert("Please complete all required fields.");
      return;
    }
    setDreams([...dreams, { ...newDream, id: Date.now() }]);
    setNewDream({
      id: Date.now(),
      category: "",
      name: "",
      targetDate: "",
      why: "",
      description: "",
      estimatedValue: 0,
      strategy: "",
      progress: 0,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🧭 Manifestation Station</h1>

      {/* Add Dream Form */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Add New Dream</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Asset Category (Car, Watch, etc.)"
            value={newDream.category}
            onChange={(e) => setNewDream({ ...newDream, category: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="text"
            placeholder="Asset Name (Ferrari 812 GTS)"
            value={newDream.name}
            onChange={(e) => setNewDream({ ...newDream, name: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="date"
            value={newDream.targetDate}
            onChange={(e) => setNewDream({ ...newDream, targetDate: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Estimated Value ($)"
            value={newDream.estimatedValue}
            onChange={(e) => setNewDream({ ...newDream, estimatedValue: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="text"
            placeholder="Acquisition Strategy (Save, Flip, Syndicate)"
            value={newDream.strategy}
            onChange={(e) => setNewDream({ ...newDream, strategy: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <input
            type="number"
            placeholder="Progress (%)"
            value={newDream.progress}
            onChange={(e) => setNewDream({ ...newDream, progress: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded"
          />
          <textarea
            placeholder="Why do you want this asset?"
            value={newDream.why}
            onChange={(e) => setNewDream({ ...newDream, why: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded col-span-1 md:col-span-2"
          />
          <textarea
            placeholder="Additional Description / Details"
            value={newDream.description}
            onChange={(e) => setNewDream({ ...newDream, description: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded col-span-1 md:col-span-2"
          />
        </div>
        <button onClick={handleAddDream} className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Save Dream
        </button>
      </section>

      {/* List of Dreams */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-6">Your Dream Board</h2>
        {dreams.length === 0 ? (
          <p className="text-gray-300">No dreams added yet. Manifest your future.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dreams.map((dream) => (
              <div key={dream.id} className="bg-gray-800 rounded-lg p-5 shadow-lg">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{dream.category}: {dream.name}</h3>
                <p className="text-white text-sm mb-2">🎯 Target: {dream.targetDate}</p>
                <p className="text-white text-sm mb-2">💵 Est. Value: ${dream.estimatedValue.toLocaleString()}</p>
                <p className="text-white text-sm mb-2">🛤 Strategy: {dream.strategy}</p>
                <p className="text-white text-sm mb-2">🔥 Progress: {dream.progress}%</p>
                <p className="text-gray-300 text-sm mb-2">🧠 WHY: {dream.why}</p>
                <p className="text-gray-300 text-xs">{dream.description}</p>
                <div className="mt-4 bg-gray-700 h-3 w-full rounded-full">
                  <div
                    style={{ width: `${dream.progress}%` }}
                    className="bg-green-500 h-3 rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManifestationStationPage;