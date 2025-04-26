import React from 'react';

function GlossTracker({ glossHistory }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-blue-400 font-orbitron text-xl uppercase mb-6 text-center">
        Gloss Evolution Tracker
      </h2>
      <ul className="space-y-4">
        {glossHistory.map((entry, index) => (
          <li key={index} className="p-4 bg-black rounded-lg">
            <h3 className="text-green-400 font-orbitron text-md">{entry.date}</h3>
            <p className="text-white mt-2">{entry.action}</p>
            <p className="text-gray-400 text-sm">{entry.notes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GlossTracker;