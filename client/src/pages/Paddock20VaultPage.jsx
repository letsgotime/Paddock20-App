import React from "react";

const Paddock20VaultPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      <h1 className="text-blue-400 font-orbitron text-4xl mb-8">🏁 Paddock20 Member Vault</h1>

      {/* Introduction Section */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Your Garage Vaults</h2>
        <p className="text-white leading-relaxed mb-4">
          Secure your owned assets, track your margin moves, and manage your motorsport lifestyle with sovereign precision.
        </p>
        <button className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Add New Vehicle
        </button>
      </section>

      {/* Manifestation Station Shortcut */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Manifestation Goals</h2>
        <p className="text-white leading-relaxed mb-4">
          Set and track your future vehicle acquisitions, collectible watches, garage expansions, and lifestyle assets.
        </p>
        <button className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ➕ Add New Dream Asset
        </button>
      </section>

      {/* Concierge Access Shortcut */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Tires & Timepieces Concierge</h2>
        <p className="text-white leading-relaxed mb-4">
          Submit a private request for rare asset sourcing — exotic vehicles, timepieces, investment-grade collectibles.
        </p>
        <button className="bg-green-500 hover:bg-green-400 text-black font-montserrat px-6 py-3 rounded">
          ✉️ Submit Concierge Request
        </button>
      </section>

      {/* Flip Forecasts */}
      <section className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-blue-400 font-orbitron text-2xl mb-4">Flip Forecasts™</h2>
        <p className="text-white leading-relaxed mb-4">
          View predictive margin analysis on assets inside your garage — track high-probability flip candidates based on condition, mileage, market trends.
        </p>
      </section>

    </div>
  );
};

export default Paddock20VaultPage;