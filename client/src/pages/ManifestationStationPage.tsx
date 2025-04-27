import React, { useState } from "react";

interface DreamAsset {
  id: number;
  assetType: string;
  name: string;
  targetDate: string;
  why: string;
  description: string;
  progress: number;
}

const ManifestationStationPage = () => {
  const [dreams, setDreams] = useState<DreamAsset[]>([]);
  const [newDream, setNewDream] = useState<DreamAsset>({
    id: Date.now(),
    assetType: "",
    name: "",
    targetDate: "",
    why: "",
    description: "",
    progress: 0,
  });

  const handleAddDream = () => {
    if (!newDream.name || !newDream.assetType) {
      alert("Please complete required fields.");
      return;
    }
    setDreams([...dreams, { ...newDream, id: Date.now() }]);
    setNewDream({
      id: Date.now(),
      assetType: "",
      name: "",
      targetDate: "",
      why: "",
      description: "",
      progress: 0,
    });
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">🧭 Manifestation Station</h1>

      {/* Intro */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <p className="font-openSans text-white text-lg mb-6">
          Dreams don't happen by accident. They happen because you built the strategy first.
        </p>
        <p className="font-openSans text-white text-lg">
          This is where you chart your dream cars, grail watches, garage upgrades, and margin milestones.
        </p>
      </section>

      {/* New Dream Form */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-4">➕ Add a New Dream</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Asset Type (Car, Watch, Garage)"
            value={newDream.assetType}
            onChange={(e) => setNewDream({ ...newDream, assetType: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="text"
            placeholder="Dream Name (e.g., Ferrari 812, RM 11-03)"
            value={newDream.name}
            onChange={(e) => setNewDream({ ...newDream, name: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="date"
            value={newDream.targetDate}
            onChange={(e) => setNewDream({ ...newDream, targetDate: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <input
            type="number"
            placeholder="Progress Toward Goal (%)"
            value={newDream.progress}
            onChange={(e) => setNewDream({ ...newDream, progress: parseInt(e.target.value) })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700"
          />
          <textarea
            placeholder="Your WHY behind this dream"
            value={newDream.why}
            onChange={(e) => setNewDream({ ...newDream, why: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700 col-span-1 md:col-span-2"
          />
          <textarea
            placeholder="Additional Description or Milestone Plan"
            value={newDream.description}
            onChange={(e) => setNewDream({ ...newDream, description: e.target.value })}
            className="bg-gray-800 text-white p-3 rounded border border-gray-700 col-span-1 md:col-span-2"
          />
        </div>

        <button
          onClick={handleAddDream}
          className="mt-6 bg-green-500 hover:bg-green-400 text-black font-montserrat px-8 py-4 rounded"
        >
          ➕ Save Dream
        </button>
      </section>

      {/* Dream Board Display */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700">
        <h2 className="font-orbitron text-blue-400 text-2xl mb-6">🌟 Your Dream Board</h2>
        {dreams.length === 0 ? (
          <p className="text-gray-300 font-openSans">No dreams saved yet. Start building your future.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dreams.map((dream) => (
              <div key={dream.id} className="bg-gray-800 rounded-lg p-5 shadow-lg border border-gray-700">
                <h3 className="text-blue-400 font-orbitron text-xl mb-2">{dream.assetType}: {dream.name}</h3>
                <p className="text-white text-sm mb-2">🎯 Target Date: {dream.targetDate}</p>
                <p className="text-white text-sm mb-2">🔥 Progress: {dream.progress}%</p>
                <p className="text-gray-300 text-xs mb-2">🧠 Why: {dream.why}</p>
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