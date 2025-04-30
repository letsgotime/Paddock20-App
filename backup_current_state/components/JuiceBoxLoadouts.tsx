import React, { useState, useEffect } from 'react';

interface Loadout {
  loadout: string;
  contents: string[];
  purpose: string;
}

function JuiceBoxLoadouts() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoadouts() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/Loadouts.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch Loadouts: ${response.status}`);
        }
        const data = await response.json();
        setLoadouts(data);
        setError(null);
      } catch (err) {
        console.error('Error loading Loadouts:', err);
        setError('Could not load the Loadout Kits. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLoadouts();
  }, []);

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Juice Box™ Loadout Kits</h2>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading Loadouts...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 mt-2">
            The Loadout Kits will be available soon. In the meantime, you can browse our other sections.
          </p>
        </div>
      )}

      {!isLoading && !error && loadouts.length > 0 && loadouts.map((kit, index) => (
        <div key={index} className="mb-10 bg-black p-6 rounded-lg shadow-md">
          <h3 className="text-blue-400 font-orbitron text-lg uppercase mb-4">{kit.loadout}</h3>
          <p className="text-gray-400 mb-4">{kit.purpose}</p>
          <ul className="grid grid-cols-1 gap-2">
            {kit.contents.map((item, idx) => (
              <li key={idx} className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                <p className="text-white">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default JuiceBoxLoadouts;