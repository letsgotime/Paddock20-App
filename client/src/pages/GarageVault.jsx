import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../services/supabaseClient';

function GarageVault() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        // Fetch vehicles from Supabase
        const { data, error } = await supabase
          .from('vehicles')
          .select('*');
        
        if (error) {
          throw new Error(error.message);
        }
        
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVehicles();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className='text-green-400 font-orbitron text-2xl mb-4'>Garage Vault</h2>
        <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
          Add Vehicle
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h3 className="text-xl text-white mb-4">No Vehicles Found</h3>
          <p className="text-gray-400 mb-6">Your garage is empty. Add your first vehicle to get started.</p>
          <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded transition-colors">
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-green-400 transition-colors">
              <div className="h-48 bg-gray-800 relative">
                {vehicle.image ? (
                  <img 
                    src={vehicle.image} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-black bg-opacity-50 text-gray-400">
                    No Image Available
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                  <h3 className="text-white font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-gray-400 text-sm">Color</div>
                  <div className="text-white text-sm">{vehicle.color}</div>
                  
                  <div className="text-gray-400 text-sm">VIN</div>
                  <div className="text-white text-sm">{vehicle.vin ? vehicle.vin.slice(-6) : 'N/A'}</div>
                  
                  <div className="text-gray-400 text-sm">Purchase Date</div>
                  <div className="text-white text-sm">{vehicle.purchaseDate || 'N/A'}</div>
                </div>
                
                <div className="border-t border-gray-800 pt-4 flex justify-between">
                  <button className="text-green-400 hover:text-white transition-colors text-sm">Maintenance</button>
                  <button className="text-green-400 hover:text-white transition-colors text-sm">Mods</button>
                  <button className="text-green-400 hover:text-white transition-colors text-sm">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-green-400 font-orbitron text-xl mb-4">Vehicle Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black bg-opacity-50 p-4 rounded-md">
            <div className="text-3xl text-white mb-2">{vehicles.length}</div>
            <div className="text-gray-400">Total Vehicles</div>
          </div>
          
          <div className="bg-black bg-opacity-50 p-4 rounded-md">
            <div className="text-3xl text-white mb-2">
              ${vehicles.reduce((sum, vehicle) => sum + (vehicle.estimatedValue || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Value</div>
          </div>
          
          <div className="bg-black bg-opacity-50 p-4 rounded-md">
            <div className="text-3xl text-white mb-2">
              {vehicles.reduce((sum, vehicle) => sum + (vehicle.modifications?.length || 0), 0)}
            </div>
            <div className="text-gray-400">Total Modifications</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarageVault;