import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { Link } from 'react-router-dom';

function GarageVaultPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('Vehicles')
          .select('*');
        if (error) throw error;
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error.message);
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  return (
    <div className="p-10 bg-black min-h-screen" aria-labelledby="garageVaultHeading">
      <h2 id="garageVaultHeading" className="apex-header-green mb-8 text-center">
        Garage Vault | Vehicles & Builds
      </h2>

      {loading ? (
        <p className="text-gray-400 text-center" role="status" aria-live="polite">
          Loading your garage...
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="region" aria-label="List of vehicles in your garage">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="apex-card p-6" role="group" aria-labelledby={`vehicle-${index}-heading`}>
              <h3 id={`vehicle-${index}-heading`} className="text-blue-400 font-orbitron text-lg mb-2">
                {vehicle.car_name}
              </h3>
              <p className="text-white mb-1">VIN: {vehicle.vin || "N/A"}</p>
              <p className="text-white mb-1">Tire Pressure (F): {vehicle.tire_pressure_front} psi</p>
              <p className="text-white mb-1">Tire Pressure (R): {vehicle.tire_pressure_rear} psi</p>
              <p className="text-white mb-1">Torque Spec: {vehicle.torque_spec} lb-ft</p>
              <p className="text-white mb-1">Mileage: {vehicle.mileage} miles</p>
              <p className="text-gray-400 mt-4">Service History: {vehicle.service_history}</p>
              <p className="text-gray-400">Insurance Docs: {vehicle.insurance_docs}</p>
              <p className="text-gray-400">Ownership Docs: {vehicle.ownership_docs}</p>

              {/* View/Add Mods Link */}
              <div className="mt-6">
                <Link
                  to={`/vehicle-mods/${vehicle.id}`}
                  className="apex-button w-full"
                  aria-label={`View and Add Modifications for ${vehicle.car_name}`}
                >
                  View / Add Mods
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;