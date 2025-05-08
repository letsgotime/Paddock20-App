import React, { useState } from 'react';
import { LoadoutKit } from '../data/detailingData';

interface DetailingKitsProps {
  kits: LoadoutKit[];
}

function DetailingKits({ kits }: DetailingKitsProps) {
  const [activeKit, setActiveKit] = useState<string>(kits[0].loadout);

  const handleKitChange = (kitName: string) => {
    setActiveKit(kitName);
  };

  const selectedKit = kits.find(kit => kit.loadout === activeKit);

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Detailing Loadout Kits</h2>
      
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {kits.map((kit) => (
          <button
            key={kit.loadout}
            onClick={() => handleKitChange(kit.loadout)}
            className={`px-4 py-2 rounded-lg font-orbitron text-sm
              ${activeKit === kit.loadout 
                ? 'bg-green-500 text-black' 
                : 'bg-gray-800 text-white hover:bg-gray-700'}`}
          >
            {kit.loadout}
          </button>
        ))}
      </div>
      
      {selectedKit && (
        <div className="bg-black p-5 rounded-lg">
          <h3 className="text-blue-400 font-orbitron text-xl mb-2">
            {selectedKit.loadout}
          </h3>
          
          <p className="text-white mb-4">{selectedKit.purpose}</p>
          
          <h4 className="text-green-400 font-orbitron text-md mb-3">Included Items:</h4>
          
          <ul className="space-y-2">
            {selectedKit.contents.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span className="text-white">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-right">
            <button className="apex-button inline-block">
              Build This Kit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailingKits;