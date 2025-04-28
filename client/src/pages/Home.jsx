import React from "react";

function Home() {
  return (
    <div>
      <h2 className="text-blue-400 font-orbitron text-3xl mb-4">Welcome to Paddock20™</h2>
      <p className="text-white text-lg mb-6">Drive Life. Document Legacy. Built for the serious. Designed for the seamless.</p>
      
      <div className="space-y-8">
        {/* Weather module temporarily removed for maintenance */}
        <div className="p-6 rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800">
          <h2 className="text-blue-400 font-orbitron text-xl">Weather Center</h2>
          <p className="mt-2 text-gray-400">Visit our <a href="/weather" className="text-green-500 hover:text-green-400">Weather Center</a> for detailed driving conditions and automotive weather analytics</p>
        </div>
        
        {/* Other homepage modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <h3 className="text-blue-400 font-orbitron text-xl mb-3">Garage Vault</h3>
            <p className="text-gray-300 mb-4">Manage your vehicle collection and maintenance records</p>
            <a href="/garage-vault" className="text-green-500 hover:text-green-400 font-medium">View Your Garage →</a>
          </div>
          
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <h3 className="text-blue-400 font-orbitron text-xl mb-3">Paddock20 Vault</h3>
            <p className="text-gray-300 mb-4">Access exclusive content and automotive resources</p>
            <a href="/paddock20-vault" className="text-green-500 hover:text-green-400 font-medium">Enter The Vault →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;