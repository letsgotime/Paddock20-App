import React from 'react';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">Weather Telemetry Dashboard</h1>
      <p className="mb-6">Professional-grade weather analytics for driving enthusiasts</p>
      
      <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Charlotte, NC</h2>
            <p className="text-gray-400">Current conditions</p>
          </div>
          <div className="text-4xl font-bold">72°F</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-lg font-medium">Wind</div>
            <div className="text-2xl">8 mph</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-lg font-medium">Humidity</div>
            <div className="text-2xl">65%</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-lg font-medium">Visibility</div>
            <div className="text-2xl">10 mi</div>
          </div>
        </div>
        
        <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-800">
          <h3 className="font-medium mb-2">Driver Notes</h3>
          <p>Optimal driving conditions with good grip. Track temperature is ideal for performance tires.</p>
        </div>
      </div>
    </div>
  );
}

export default App;