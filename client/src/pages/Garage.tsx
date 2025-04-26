import React, { useState, useEffect } from 'react';
import GarageVaultCard from '../components/GarageVaultCard';
import PreDriveChecklist from '../components/PreDriveChecklist';
import WeeklyChecklist from '../components/WeeklyChecklist';
import MonthlyChecklist from '../components/MonthlyChecklist';
import QuarterlyChecklist from '../components/QuarterlyChecklist';
import SeasonalAdaptationChecklist from '../components/SeasonalAdaptationChecklist';
import GlossTracker from '../components/GlossTracker';
import TireTracker from '../components/TireTracker';
import { vehicleProfile } from '../data/vehicles';

function Garage() {
  const [activeTab, setActiveTab] = useState('general');
  const [vehicleData, setVehicleData] = useState(vehicleProfile);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch vehicle data from backend when integrated with database
  useEffect(() => {
    // This would normally make an API call to fetch the vehicle data
    // For now, we're using the static data from vehicles.js
    // Example:
    // async function fetchVehicleData() {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch('/api/vehicles/1');
    //     const data = await response.json();
    //     setVehicleData(data);
    //   } catch (error) {
    //     console.error('Error fetching vehicle data:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // fetchVehicleData();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-blue-400 font-orbitron text-3xl mb-6">Garage Vault</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-md ${activeTab === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-md ${activeTab === 'maintenance' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Maintenance
        </button>
        <button 
          onClick={() => setActiveTab('tires')}
          className={`px-4 py-2 rounded-md ${activeTab === 'tires' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Tires
        </button>
        <button 
          onClick={() => setActiveTab('gloss')}
          className={`px-4 py-2 rounded-md ${activeTab === 'gloss' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Gloss Tracking
        </button>
        <button 
          onClick={() => setActiveTab('seasonal')}
          className={`px-4 py-2 rounded-md ${activeTab === 'seasonal' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          Seasonal
        </button>
      </div>
      
      {/* Content based on active tab */}
      {isLoading ? (
        <div className="py-16 text-center">
          <p className="text-gray-400">Loading vehicle data...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'general' && (
            <GarageVaultCard />
          )}
          
          {activeTab === 'maintenance' && (
            <div>
              <PreDriveChecklist />
              <WeeklyChecklist />
              <MonthlyChecklist />
              <QuarterlyChecklist />
            </div>
          )}
          
          {activeTab === 'tires' && (
            <TireTracker tireInfo={vehicleData.tire} />
          )}
          
          {activeTab === 'gloss' && (
            <GlossTracker />
          )}
          
          {activeTab === 'seasonal' && (
            <SeasonalAdaptationChecklist />
          )}
        </div>
      )}
    </div>
  );
}

export default Garage;