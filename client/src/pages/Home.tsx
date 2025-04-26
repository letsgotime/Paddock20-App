import React from 'react';
import WeatherStation from '../components/WeatherStation';

function Home() {
  return (
    <div className="p-10">
      <h1 className="text-blue-400 font-orbitron text-3xl mb-6">Home Dashboard</h1>
      <WeatherStation />
    </div>
  );
}

export default Home;
