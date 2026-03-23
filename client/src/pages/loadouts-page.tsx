import React from 'react';
import JuiceBoxLoadouts from '../components/JuiceBoxLoadouts';

function LoadoutsPage() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-6 text-center">
        ApexVault™ Loadout Kits
      </h1>
      
      <p className="text-white text-center mb-8">
        Curated product collections for every budget and detailing scenario.
      </p>
      
      <JuiceBoxLoadouts />
    </div>
  );
}

export default LoadoutsPage;