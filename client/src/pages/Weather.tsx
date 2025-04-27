import React from 'react';
import WeatherStation from '../components/WeatherStation';
import WeatherMoodGenerator from '../components/WeatherMoodGenerator';
import GarageWeatherStation from '../components/GarageWeatherStation';

function Weather() {
  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-10 text-center">
        ApexVault™ Weather Center
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <GarageWeatherStation />
        <WeatherMoodGenerator />
      </div>

      <div className="mt-12">
        <h2 className="apex-header-green text-2xl mb-6 text-center">
          Comprehensive Weather Data
        </h2>
        <WeatherStation />
      </div>
    </div>
  );
}

export default Weather;