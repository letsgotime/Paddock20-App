import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

// Create a simplified emergency demo page that will work even if other components fail
export default function EmergencyDemoPage() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to fetch real weather data for the demo
    const fetchWeatherData = async () => {
      try {
        // Default to Nashville coordinates if geolocation isn't available
        const lat = 36.1627;
        const lon = -86.7816;
        
        const response = await fetch(`/api/weather/consolidated?lat=${lat}&lon=${lon}&units=imperial`);
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        setCurrentWeather(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Unable to fetch weather data. Using emergency fallback data.');
        // Set fallback weather data
        setCurrentWeather({
          weatherData: {
            main: {
              temp: 68,
              feels_like: 70,
              humidity: 45
            },
            weather: [{ description: 'Partly Cloudy', icon: '02d' }],
            wind: { speed: 8, deg: 180 }
          }
        });
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // F1-inspired formatting
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}°F`;
  };

  // Create vehicle object for demo
  const demoVehicle = {
    make: "BMW",
    model: "M4 Competition",
    year: 2023,
    power: "503 hp @ 6,250 rpm",
    torque: "479 lb-ft @ 2,750 rpm",
    performance: "+2.5% (Favorable conditions)"
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="font-['Orbitron'] text-4xl font-bold text-[#1982FC] uppercase tracking-wider mb-2">
            PADDOCK20
          </h1>
          <div className="text-[#08c519] text-lg uppercase tracking-widest mb-6">
            Emergency Investor Demo
          </div>
          <p className="max-w-2xl mx-auto">
            This failsafe interface ensures you can experience our automotive lifestyle platform 
            features even if technical issues arise with the main application.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weather Card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#0a0a0a] border border-[#1982FC]/30 rounded-lg p-6 shadow-lg">
            <h2 className="font-['Orbitron'] text-xl font-bold uppercase text-[#1982FC] mb-4">
              Weather Paddock
            </h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-[#1982FC] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-amber-400 mb-4">{error}</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold">
                      {formatTemp(currentWeather.weatherData.main.temp)}
                    </div>
                    <div className="text-lg capitalize">
                      {currentWeather.weatherData.weather[0].description}
                    </div>
                  </div>
                  <div className="bg-[#1982FC]/10 p-3 rounded-full">
                    <img
                      src={`https://openweathermap.org/img/wn/${currentWeather.weatherData.weather[0].icon}@2x.png`}
                      alt="Weather icon"
                      width="64"
                      height="64"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1982FC]/20">
                  <div>
                    <div className="text-gray-400">Humidity</div>
                    <div>{currentWeather.weatherData.main.humidity}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Wind</div>
                    <div>{currentWeather.weatherData.wind.speed} mph</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Track Telemetry Card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#0a0a0a] border border-[#1982FC]/30 rounded-lg p-6 shadow-lg">
            <h2 className="font-['Orbitron'] text-xl font-bold uppercase text-[#1982FC] mb-4">
              Track Telemetry
            </h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-[#1982FC] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400">Asphalt Temperature</div>
                    <div className="text-xl font-semibold">
                      {formatTemp(currentWeather.weatherData.main.temp * 1.2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Air Density</div>
                    <div className="text-xl font-semibold">1.12 kg/m³</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1982FC]/20">
                  <div>
                    <div className="text-gray-400">Grip Level</div>
                    <div className="text-[#08c519]">Optimal</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Track Condition</div>
                    <div>{currentWeather.weatherData.main.humidity > 70 ? 'Wet' : 'Dry'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Specifications Card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#0a0a0a] border border-[#1982FC]/30 rounded-lg p-6 shadow-lg">
            <h2 className="font-['Orbitron'] text-xl font-bold uppercase text-[#1982FC] mb-4">
              Vehicle Specifications
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold">
                  {demoVehicle.year} {demoVehicle.make} {demoVehicle.model}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1982FC]/20">
                <div>
                  <div className="text-gray-400">Power</div>
                  <div>{demoVehicle.power}</div>
                </div>
                <div>
                  <div className="text-gray-400">Torque</div>
                  <div>{demoVehicle.torque}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-[#1982FC]/20">
                <div className="text-gray-400">Performance Adjustment</div>
                <div className="text-[#08c519]">{demoVehicle.performance}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#0a0a0a] border border-[#1982FC]/30 rounded-lg p-6 shadow-lg">
            <h2 className="font-['Orbitron'] text-xl font-bold uppercase text-[#1982FC] mb-4">
              Performance Metrics
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400">Cooling Systems</div>
                  <div className="text-[#08c519]">Excellent</div>
                </div>
                <div>
                  <div className="text-gray-400">Braking Efficiency</div>
                  <div className="text-[#08c519]">98%</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1982FC]/20">
                <div>
                  <div className="text-gray-400">Tires Optimal Window</div>
                  <div>180-220°F</div>
                </div>
                <div>
                  <div className="text-gray-400">Recommended Pressure</div>
                  <div>35 psi (cold)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mt-8">
          <Link href="/">
            <a className="inline-block bg-[#1982FC] hover:bg-[#08c519] transition-colors text-white font-['Orbitron'] px-6 py-3 rounded-md uppercase tracking-wider">
              Return to Main Application
            </a>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <div className="font-['Orbitron'] text-xl text-[#1982FC] uppercase mb-2">PADDOCK20</div>
          <div className="text-sm">
            Automotive Lifestyle Platform | Emergency Investor Demo Mode
          </div>
        </footer>
      </div>
    </div>
  );
}