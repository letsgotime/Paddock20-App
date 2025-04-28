import React from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import AutomotiveEnthusiastWeather from '../components/AutomotiveEnthusiastWeather';

function Weather() {
  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      {/* Page header with proper heading hierarchy */}
      <header className="mb-10 text-center">
        <h1 className="apex-header text-3xl mb-2">Paddock20™ Weather Hub</h1>
        <p className="text-gray-400">
          F1-level automotive weather analytics and drive recommendations
        </p>
      </header>
      
      {/* F1-style motorsport weather station */}
      <section className="mb-10" aria-labelledby="paddock-weather-heading">
        <h2 id="paddock-weather-heading" className="apex-header-green text-xl mb-4">Automotive Weather Dashboard</h2>
        <AutomotiveEnthusiastWeather />
      </section>

      {/* Upcoming Drive Planner Section */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="drive-planner-heading">
        <h2 id="drive-planner-heading" className="apex-header text-xl mb-4">Upcoming Drive Planner</h2>
        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-green-500 font-semibold">Optimal Drive Windows</h3>
            <span className="text-xs text-gray-400">Next 48 Hours</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-900/30 to-green-800/20 p-3 rounded-lg border border-green-800/30">
              <div className="flex justify-between">
                <span className="text-white font-medium">Today</span>
                <span className="text-green-400">★★★★☆</span>
              </div>
              <p className="text-gray-300 text-sm mt-1">2PM - 5PM</p>
              <p className="text-gray-400 text-xs mt-2">Optimal grip conditions with dry surface and mild temperatures</p>
            </div>
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 p-3 rounded-lg border border-blue-800/30">
              <div className="flex justify-between">
                <span className="text-white font-medium">Tomorrow</span>
                <span className="text-blue-400">★★★☆☆</span>
              </div>
              <p className="text-gray-300 text-sm mt-1">10AM - 1PM</p>
              <p className="text-gray-400 text-xs mt-2">Good conditions with light winds and medium grip potential</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 p-3 rounded-lg border border-yellow-800/30">
              <div className="flex justify-between">
                <span className="text-white font-medium">Tomorrow</span>
                <span className="text-yellow-400">★★☆☆☆</span>
              </div>
              <p className="text-gray-300 text-sm mt-1">4PM - 6PM</p>
              <p className="text-gray-400 text-xs mt-2">Moderate conditions with potential for reduced visibility</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips Section */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="quick-tips-heading">
        <h2 id="quick-tips-heading" className="apex-header text-xl mb-4">Quick Tips Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Today's Driving Tips</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Reduced brake cooling efficiency expected. Allow 15-20% more cooling time between hard braking zones.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Surface grip will peak 2-3 hours after sunrise due to optimal asphalt temperature window.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Current air density suggests 2-3% power reduction. Adjust driving style accordingly.</span>
              </li>
            </ul>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Performance Adjustments</h3>
            <ul className="text-gray-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>For naturally aspirated engines: Expect 2.1% torque reduction due to current air density factors.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>For turbocharged engines: Recalibrate boost by 1-2% to compensate for decreased atmospheric pressure.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Brake bias: Consider 1-2% forward adjustment to account for current surface conditions.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Vehicle-Specific Recommendations */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="vehicle-recommendations-heading">
        <h2 id="vehicle-recommendations-heading" className="apex-header text-xl mb-4">Vehicle-Specific Recommendations</h2>
        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-green-500 font-semibold">Select Your Vehicle</h3>
            <div className="mt-2 sm:mt-0 flex items-center">
              <select className="bg-black border border-gray-700 text-white rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none">
                <option value="">-- Select vehicle --</option>
                <option value="911">Porsche 911 Carrera S</option>
                <option value="m3">BMW M3 Competition</option>
                <option value="gt">Ford Mustang GT</option>
                <option value="miata">Mazda MX-5 Miata</option>
              </select>
              <button className="ml-2 px-3 py-1 bg-blue-900/50 text-blue-400 rounded text-sm hover:bg-blue-800/50">Load</button>
            </div>
          </div>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">Select a vehicle to view tailored performance recommendations based on current weather conditions</p>
          </div>
        </div>
      </section>

      {/* Weather accessibility information */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading" className="apex-header-green text-xl mb-4">Accessibility Features</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Weather data is fully accessible to screen readers</li>
          <li>Use the "Listen to Weather Report" button to hear detailed weather information</li>
          <li>All weather conditions include text alternatives to emoji representations</li>
          <li>Weather alerts and driving recommendations are optimized for assistive technologies</li>
          <li>Keyboard navigation is fully supported throughout the weather interface</li>
        </ul>
      </section>
    </div>
  );
}

export default Weather;