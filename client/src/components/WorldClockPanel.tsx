import React, { useEffect, useState } from "react";

const cities = [
  { name: "Monaco 🇲🇨", timezone: "Europe/Monaco" },
  { name: "Suzuka 🇯🇵", timezone: "Asia/Tokyo" },
  { name: "Austin 🇺🇸", timezone: "America/Chicago" },
  { name: "Silverstone 🇬🇧", timezone: "Europe/London" },
  { name: "Singapore 🇸🇬", timezone: "Asia/Singapore" },
];

const WorldClockPanel = () => {
  const [timeData, setTimeData] = useState<Record<string, string>>({});
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchTimes = async () => {
      const updatedTimes: Record<string, string> = {};

      for (const city of cities) {
        try {
          const res = await fetch(`https://worldtimeapi.org/api/timezone/${city.timezone}`);
          const data = await res.json();
          updatedTimes[city.name] = new Date(data.datetime).toLocaleTimeString();
        } catch (err) {
          updatedTimes[city.name] = "--:--:--";
        }
      }

      setTimeData(updatedTimes);
    };

    fetchTimes();
    const interval = setInterval(fetchTimes, 60000);

    return () => clearInterval(interval);
  }, []);

  // Map of city names to their approximate coordinates for weather data
  const cityCoordinates: Record<string, { lat: number, lon: number }> = {
    "Monaco 🇲🇨": { lat: 43.7384, lon: 7.4246 },
    "Suzuka 🇯🇵": { lat: 34.8431, lon: 136.5415 },
    "Austin 🇺🇸": { lat: 30.2672, lon: -97.7431 },
    "Silverstone 🇬🇧": { lat: 52.0786, lon: -1.0169 },
    "Singapore 🇸🇬": { lat: 1.2905, lon: 103.8520 },
  };

  // Fetch weather data for all cities
  useEffect(() => {
    const fetchWeather = async () => {
      const weatherResults: Record<string, any> = {};

      for (const city of cities) {
        if (cityCoordinates[city.name]) {
          const { lat, lon } = cityCoordinates[city.name];
          try {
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (response.ok) {
              const data = await response.json();
              weatherResults[city.name] = data;
            }
          } catch (error) {
            console.error(`Error fetching weather for ${city.name}:`, error);
          }
        }
      }

      setWeatherData(weatherResults);
    };

    fetchWeather();
    // Refresh weather data every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Function to get weather icon
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
      <h2 className="text-blue-400 font-orbitron text-xl mb-4">
        🏁 Global Circuit Times & Conditions
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cities.map((city) => (
          <div key={city.name} className="bg-black/70 p-3 rounded-lg border border-gray-700 text-center">
            <h3 className="text-blue-400 font-orbitron text-lg mb-1">{city.name}</h3>
            <p className="text-white text-xl font-bold tracking-wide">
              {timeData[city.name] || "--:--:--"}
            </p>
            
            {weatherData[city.name] ? (
              <div className="mt-2 flex flex-col items-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={getWeatherIcon(weatherData[city.name].weather[0].icon)} 
                    alt={weatherData[city.name].weather[0].description}
                    className="w-10 h-10" 
                  />
                  <span className="text-xl font-bold ml-1">
                    {Math.round(weatherData[city.name].main.temp)}°F
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  {weatherData[city.name].weather[0].description}
                </p>
                <div className="text-xs text-gray-400 flex items-center justify-between w-full mt-2">
                  <span>💧 {weatherData[city.name].main.humidity}%</span>
                  <span>💨 {Math.round(weatherData[city.name].wind.speed)} mph</span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse mt-2 h-16 bg-gray-700/30 rounded-lg"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldClockPanel;