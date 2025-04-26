import React from 'react';
import SimpleWeatherStation from '../components/SimpleWeatherStation';
import TireTracker from '../components/TireTracker';
import PreDriveChecklist from '../components/PreDriveChecklist';
import GlossTracker from '../components/GlossTracker';
import { vehicleProfile } from '../data/vehicles';

function Home() {
  const lastDrive = {
    car: "Ferrari 458 Italia",
    location: "Mulholland Hwy",
    mileage: 34,
    surfaceTemp: "65°F",
    weather: "Clear",
    photoUrl: ""
  };

  const maintenanceAlerts = [
    "Oil change due in 21 days",
    "Tire inspection due next month"
  ];

  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-10 text-center">
        ApexVault™ Garage Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Weather Widget */}
        <div className="apex-card">
          <SimpleWeatherStation />
        </div>

        {/* Last Drive Snapshot */}
        <div className="apex-card">
          <h2 className="apex-header-green mb-4">Last Drive</h2>
          <p className="text-white">Car: {lastDrive.car}</p>
          <p className="text-white">Location: {lastDrive.location}</p>
          <p className="text-white">Mileage: {lastDrive.mileage} miles</p>
          <p className="text-white">Surface Temp: {lastDrive.surfaceTemp}</p>
          <p className="text-white">Conditions: {lastDrive.weather}</p>
        </div>

        {/* Torque + Tire Snapshot */}
        <div className="apex-card">
          <h2 className="apex-header-green mb-4">Torque & Tire</h2>
          <p className="text-white">Tire: {vehicleProfile.tire.brand} {vehicleProfile.tire.model}</p>
          <p className="text-white">Current Mileage: {vehicleProfile.tire.currentMileage} miles</p>
          <p className="text-white">Tire Pressure Targets: 29psi Front / 34psi Rear</p>
          <p className="text-white">Torque Spec: 96 lb-ft</p>
        </div>

        {/* Quick Pre-Drive Launch */}
        <div className="apex-card">
          <h2 className="apex-header-green mb-4">Pre-Drive Checklist</h2>
          <p className="text-white mb-4">Launch a quick Pre-Drive Readiness Check.</p>
          <a 
            href="/garage" 
            className="apex-button inline-block"
          >
            Go to Pre-Drive
          </a>
        </div>

        {/* Maintenance Alerts */}
        <div className="apex-card">
          <h2 className="apex-header-green mb-4">Maintenance Monitor</h2>
          {maintenanceAlerts.map((alert, index) => (
            <p key={index} className="text-white mb-2">{alert}</p>
          ))}
        </div>

        {/* Gloss Tracker Snapshot */}
        <div className="apex-card">
          <h2 className="apex-header-green mb-4">Gloss Status</h2>
          <p className="text-white">Last Gloss Boost: {vehicleProfile.glossTracking.lastGlossBoost}</p>
          <p className="text-white">Next Maintenance Suggestion: Within 30 days</p>
        </div>

      </div>
    </div>
  );
}

export default Home;
