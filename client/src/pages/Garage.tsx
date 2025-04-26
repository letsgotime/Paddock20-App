import React from 'react';
import GarageVaultCard from '../components/GarageVaultCard';

function Garage() {
  return (
    <div className="p-10">
      <h1 className="text-blue-400 font-orbitron text-3xl mb-6">Garage Vault</h1>
      <p className="text-gray-300 mb-6">Manage your car profiles, tire pressures, and torque specs.</p>
      
      <GarageVaultCard />
    </div>
  );
}

export default Garage;