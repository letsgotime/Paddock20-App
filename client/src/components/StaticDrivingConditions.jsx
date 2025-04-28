import React from 'react';

// This is a completely static component with no API dependencies
export default function StaticDrivingConditions() {
  return (
    <div className="p-6 rounded-lg bg-gradient-to-br from-[#111111] to-[#1a1a1a] border border-gray-800">
      <h2 className="text-blue-400 font-orbitron text-2xl mb-6">☁️ Today's Drive Conditions</h2>
      
      <div className="text-white font-openSans text-base leading-relaxed space-y-3">
        <p>🌡️ Air Temperature: 76.2°F</p>
        <p>🔥 Surface Temp: 81.5°F (Feels Like)</p>
        <p>💨 Wind Speed: 8.3 mph</p>
        <p>💧 Humidity: 65%</p>
        <p>📈 Barometric Pressure: 1013 hPa</p>
        <p>🌅 Sunrise: 6:45 AM</p>
        <p>🌇 Sunset: 7:30 PM</p>
        <div className="flex items-center gap-2">
          <span>☁️ Condition:</span>
          <span className="capitalize">Partly cloudy</span>
          <img 
            src="https://openweathermap.org/img/wn/02d.png"
            alt="Partly cloudy"
            className="w-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}