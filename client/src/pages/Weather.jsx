import React from 'react';
import WeatherStation from '../components/WeatherStation';
import ZipWeatherStation from '../components/ZipWeatherStation';
import Paddock20WeatherStation from '../components/Paddock20WeatherStation';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import { WeatherProvider } from '../contexts/WeatherContext';

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
      
      <WeatherProvider>
        {/* F1-style motorsport weather station */}
        <section className="mb-10" aria-labelledby="paddock-weather-heading">
          <h2 id="paddock-weather-heading" className="apex-header-green text-xl mb-4">Live Weather Station</h2>
          <Paddock20WeatherStation />
        </section>
        
        {/* Original weather stations for comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Zip code search section */}
          <section aria-labelledby="zip-weather-heading">
            <h2 id="zip-weather-heading" className="sr-only">Search Weather by ZIP Code</h2>
            <ZipWeatherStation />
          </section>
  
          {/* Fixed location weather section */}
          <section aria-labelledby="garage-weather-heading">
            <h2 id="garage-weather-heading" className="sr-only">Garage Weather Station</h2>
            <WeatherStation />
          </section>
        </div>
      </WeatherProvider>

      {/* Weather accessibility information */}
      <section className="mt-10 bg-gray-900 p-6 rounded-lg" aria-labelledby="accessibility-heading">
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