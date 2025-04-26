import React from 'react';

function Marketplace() {
  return (
    <div className="p-10">
      <h1 className="text-blue-400 font-orbitron text-3xl mb-6">Marketplace</h1>
      <p className="text-gray-300">Find parts, accessories, and services for your vehicle.</p>
      
      <div className="bg-gray-900 p-6 rounded-xl mt-8">
        <h2 className="text-green-400 font-orbitron text-xl mb-4">Coming Soon</h2>
        <p className="text-gray-300">The Marketplace feature is currently under development.</p>
      </div>
    </div>
  );
}

export default Marketplace;