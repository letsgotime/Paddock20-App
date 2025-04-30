import React from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';

function TestPage() {
  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      <h1 className="apex-header text-3xl mb-6 text-center">F1 Weather Telemetry Test</h1>
      
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800 mb-6">
        <h2 className="text-green-500 text-xl mb-4">Simple Working Component</h2>
        <p className="text-white mb-4">
          This is a test page with a simple component that doesn't rely on any external data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-blue-900">
            <h3 className="text-blue-400 font-medium mb-2">Track Surface</h3>
            <p className="text-2xl font-bold text-white">74°F</p>
            <p className="text-gray-400 text-sm">Asphalt temperature</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-green-900">
            <h3 className="text-green-400 font-medium mb-2">Grip Level</h3>
            <p className="text-2xl font-bold text-white">85%</p>
            <p className="text-gray-400 text-sm">Current traction</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-purple-900">
            <h3 className="text-purple-400 font-medium mb-2">Air Pressure</h3>
            <p className="text-2xl font-bold text-white">1013 hPa</p>
            <p className="text-gray-400 text-sm">Barometric pressure</p>
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 p-6 rounded-lg border border-gray-800">
        <h2 className="text-yellow-500 text-xl mb-4">Recommended Strategy</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <p className="text-white font-medium">Standard stint lengths with moderate tire management</p>
        </div>
        <p className="text-gray-300">
          Current conditions are optimal for performance driving with good grip levels and moderate 
          temperatures. Expect standard thermal wear patterns with extended life on harder compounds.
        </p>
      </div>
    </div>
  );
}

export default TestPage;