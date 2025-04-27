import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Wrench, Archive, Layers, Clock } from 'lucide-react';

function GarageVaultPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        // Fetch vehicles from Supabase (mocked in our case)
        const { data, error } = await supabase
          .from('Vehicles')
          .select();
          
        if (error) {
          throw error;
        }
        
        setVehicles(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setLoading(false);
      }
    }
    
    fetchVehicles();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="apex-header-green mb-8 text-center">GARAGE VAULT | VEHICLES & BUILDS</h2>

        {loading ? (
          <p className="text-gray-400 text-center">Loading your garage...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vehicles.map((vehicle, index) => (
              <Card key={index} className="apex-card p-6 bg-gray-900 border-gray-800 hover:border-green-500 transition-all duration-300">
                <h3 className="text-green-500 font-orbitron text-lg mb-4">{vehicle.car_name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">VIN</p>
                    <p className="text-white font-mono">{vehicle.vin || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Mileage</p>
                    <p className="text-white">{vehicle.mileage} miles</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Tire PSI (F/R)</p>
                    <p className="text-white">{vehicle.tire_pressure_front} / {vehicle.tire_pressure_rear} psi</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-xs uppercase mb-1">Torque Spec</p>
                    <p className="text-white">{vehicle.torque_spec} lb-ft</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 text-blue-400 mt-1 mr-2" />
                    <p className="text-gray-300"><span className="text-gray-400">Service History:</span> {vehicle.service_history}</p>
                  </div>
                  <div className="flex items-start">
                    <Archive className="h-4 w-4 text-blue-400 mt-1 mr-2" />
                    <p className="text-gray-300"><span className="text-gray-400">Insurance Docs:</span> {vehicle.insurance_docs}</p>
                  </div>
                  <div className="flex items-start">
                    <Layers className="h-4 w-4 text-blue-400 mt-1 mr-2" />
                    <p className="text-gray-300"><span className="text-gray-400">Ownership:</span> {vehicle.ownership_docs}</p>
                  </div>
                </div>

                {/* Link to View/Add Mods */}
                <div className="mt-6">
                  <Link
                    to={`/vehicle-mods/${vehicle.id}`}
                    className="apex-button w-full flex items-center justify-center"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    View / Add Mods
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GarageVaultPage;