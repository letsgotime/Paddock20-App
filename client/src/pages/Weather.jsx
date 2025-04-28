import React from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';

function Weather() {
  return (
    <div className="py-8">
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
        <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6">
          <div className="text-center p-4">
            <h3 className="text-blue-400 font-orbitron text-xl mb-4">Advanced Weather Integration</h3>
            <p className="text-gray-300 mb-6">
              Our advanced automotive weather station is currently being upgraded to provide more 
              accurate surface temperature readings and detailed driving condition analytics.
            </p>
            <div className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-600/40 rounded-md text-blue-400">
              Coming May 2025
            </div>
          </div>
        </div>
      </section>

      {/* Paddock20 Feature Information */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="feature-heading">
        <h2 id="feature-heading" className="apex-header text-xl mb-4">Paddock20™ Weather Intelligence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Surface Intelligence</h3>
            <p className="text-gray-300 text-sm">Track surface temperature monitoring with F1-level precision metrics for optimal tire selection and performance tuning</p>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Drive Recommendations</h3>
            <p className="text-gray-300 text-sm">Real-time driving adjustments based on surface conditions, tire warmup estimates, and advanced weather modeling</p>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-300 text-sm">Detailed torque management, traction control, and tire pressure recommendations for optimal driving experience</p>
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