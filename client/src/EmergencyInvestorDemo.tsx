import React, { useEffect, useState } from 'react';

/**
 * Emergency Investor Demo component - displays a failsafe UI even if main app fails
 * This component self-injects into the DOM if needed to ensure we have visible content
 */
export default function EmergencyInvestorDemo() {
  const [showDemo, setShowDemo] = useState(true);

  // Setup pre-populated weather stats for demo
  const weatherStats = {
    currentTemp: '68°F',
    condition: 'Partly Cloudy',
    windSpeed: '8 mph',
    humidity: '45%',
    asphaltTemp: '84°F',
    airDensity: '1.12 kg/m³',
    visibility: '10 miles',
    gripLevel: 'Optimal'
  };

  // Setup pre-populated vehicle stats for demo
  const vehicleStats = {
    model: '2023 BMW M4 Competition',
    power: '503 hp @ 6,250 rpm',
    torque: '479 lb-ft @ 2,750 rpm',
    performanceAdjustment: '+2.5% (Favorable conditions)',
    coolingSystems: 'Excellent',
    brakingEfficiency: '98%',
    tiresOptimalWindow: '180-220°F',
    recommendedPressure: '35 psi (cold)'
  };

  const handleStartDemo = () => {
    setShowDemo(false);
    // Attempt to direct user to desired page
    window.location.href = '/weather-paddock';
  };

  return (
    <>
      {showDemo && (
        <div id="emergency-demo-overlay">
          <h1>PADDOCK20 - Investor Demo Mode</h1>
          <p>
            Welcome to the Paddock20 investor demonstration experience. This high-performance automotive lifestyle platform
            delivers real-time, context-aware insights for automotive enthusiasts.
          </p>
          
          <div className="buttons">
            <button className="button" onClick={handleStartDemo}>
              START DEMO
            </button>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>WEATHER CONDITIONS</h3>
              <p>Current Temperature: {weatherStats.currentTemp}</p>
              <p>Weather Condition: {weatherStats.condition}</p>
              <p>Wind Speed: {weatherStats.windSpeed}</p>
              <p>Humidity: {weatherStats.humidity}</p>
            </div>
            
            <div className="stat-card">
              <h3>TRACK TELEMETRY</h3>
              <p>Asphalt Temperature: {weatherStats.asphaltTemp}</p>
              <p>Air Density: {weatherStats.airDensity}</p>
              <p>Visibility: {weatherStats.visibility}</p>
              <p>Grip Level: {weatherStats.gripLevel}</p>
            </div>
            
            <div className="stat-card">
              <h3>VEHICLE SPECIFICATIONS</h3>
              <p>Model: {vehicleStats.model}</p>
              <p>Power: {vehicleStats.power}</p>
              <p>Torque: {vehicleStats.torque}</p>
              <p>Performance Adjustment: {vehicleStats.performanceAdjustment}</p>
            </div>
            
            <div className="stat-card">
              <h3>PERFORMANCE METRICS</h3>
              <p>Cooling Systems: {vehicleStats.coolingSystems}</p>
              <p>Braking Efficiency: {vehicleStats.brakingEfficiency}</p>
              <p>Tires Optimal Window: {vehicleStats.tiresOptimalWindow}</p>
              <p>Recommended Pressure: {vehicleStats.recommendedPressure}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}