import React from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { 
  Droplets, Sun, Wind, CloudRain, 
  Calendar, Trash2, CheckCircle2, XCircle, 
  AlertTriangle, ThermometerSun, Info
} from 'lucide-react';

const CarCareWeatherPanel = () => {
  const { weatherData, oneCallData, unit, isLoading, error } = useWeather();

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Loading Car Care Data...</h2>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error || !weatherData || !oneCallData) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Car Care Weather Analysis</h2>
        <div className="p-4 bg-gray-950 rounded-lg text-center">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-300">Unable to load car care weather data</p>
          <p className="text-sm text-gray-500 mt-2">
            {error ? error.message : 'Weather data unavailable for this location'}
          </p>
        </div>
      </div>
    );
  }

  // Determine if it's good weather for washing your car
  const getWashRecommendation = () => {
    const temp = oneCallData.current.temp;
    const humidity = oneCallData.current.humidity;
    const uvi = oneCallData.current.uvi;
    const windSpeed = oneCallData.current.wind_speed;
    const weather = oneCallData.current.weather[0].main.toLowerCase();
    
    // Convert temperature thresholds based on unit
    const minTemp = unit === 'metric' ? 5 : 40;  // 5°C or 40°F
    const maxTemp = unit === 'metric' ? 30 : 86; // 30°C or 86°F
    
    // Convert wind speed for consistency
    const windSpeedMph = unit === 'metric' ? windSpeed * 2.237 : windSpeed;
    
    const issues = [];
    let isRecommended = true;
    
    // Check for precipitation
    if (
      weather.includes('rain') || 
      weather.includes('snow') || 
      weather.includes('drizzle') || 
      weather.includes('sleet')
    ) {
      issues.push('Current precipitation will interfere with washing');
      isRecommended = false;
    }
    
    // Check for precipitation in next 3 hours from hourly forecast
    if (oneCallData.hourly) {
      const next3Hours = oneCallData.hourly.slice(0, 3);
      const willRainSoon = next3Hours.some(hour => hour.pop > 0.3); // 30% chance or more
      
      if (willRainSoon) {
        issues.push('Precipitation expected in the next 3 hours');
        isRecommended = false;
      }
    }
    
    // Temperature checks
    if (temp < minTemp) {
      issues.push(`Temperature too low (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'})`);
      isRecommended = false;
    } else if (temp > maxTemp) {
      issues.push(`Temperature too high (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}), soap may dry too quickly`);
      isRecommended = false;
    }
    
    // Wind check
    if (windSpeedMph > 15) {
      issues.push('Wind speed too high, may cause uneven drying or debris');
      isRecommended = false;
    }
    
    // UV check
    if (uvi > 8) {
      issues.push('Very high UV may cause soap to dry too quickly');
      isRecommended = false;
    }
    
    return {
      isRecommended,
      issues,
      idealProperties: []
    };
  };

  // Determine if it's good weather for detailing your car
  const getDetailingRecommendation = () => {
    const temp = oneCallData.current.temp;
    const humidity = oneCallData.current.humidity;
    const weather = oneCallData.current.weather[0].main.toLowerCase();
    const windSpeed = oneCallData.current.wind_speed;
    const uvi = oneCallData.current.uvi;
    
    // Convert temperature thresholds based on unit
    const minTemp = unit === 'metric' ? 15 : 60;  // 15°C or 60°F
    const maxTemp = unit === 'metric' ? 25 : 77;  // 25°C or 77°F
    
    // Convert wind speed for consistency
    const windSpeedMph = unit === 'metric' ? windSpeed * 2.237 : windSpeed;
    
    const issues = [];
    const idealProperties = [];
    let isRecommended = true;
    
    // Check for precipitation
    if (
      weather.includes('rain') || 
      weather.includes('snow') || 
      weather.includes('drizzle') || 
      weather.includes('sleet')
    ) {
      issues.push('Current precipitation not suitable for detailing');
      isRecommended = false;
    } else {
      idealProperties.push('No precipitation');
    }
    
    // Check for precipitation in next 6 hours from hourly forecast
    if (oneCallData.hourly) {
      const next6Hours = oneCallData.hourly.slice(0, 6);
      const willRainSoon = next6Hours.some(hour => hour.pop > 0.3); // 30% chance or more
      
      if (willRainSoon) {
        issues.push('Precipitation expected in the next 6 hours');
        isRecommended = false;
      } else {
        idealProperties.push('Clear weather forecast');
      }
    }
    
    // Temperature checks
    if (temp < minTemp) {
      issues.push(`Temperature too low (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}) for proper product curing`);
      isRecommended = false;
    } else if (temp > maxTemp) {
      issues.push(`Temperature too high (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}) for optimal application`);
      isRecommended = false;
    } else {
      idealProperties.push(`Ideal temperature (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'})`);
    }
    
    // Wind check
    if (windSpeedMph > 10) {
      issues.push('Wind may introduce contaminants during detailing');
      isRecommended = false;
    } else {
      idealProperties.push('Low wind conditions');
    }
    
    // Humidity check
    if (humidity > 70) {
      issues.push('High humidity may affect product drying and curing');
      isRecommended = false;
    } else if (humidity < 30) {
      issues.push('Very low humidity may cause products to dry too quickly');
      isRecommended = false;
    } else {
      idealProperties.push(`Optimal humidity (${humidity}%)`);
    }
    
    // UV check
    if (uvi > 7) {
      issues.push('High UV exposure may affect certain products and cause premature drying');
      isRecommended = false;
    }
    
    // Check for cloud cover (good for detailing to avoid direct sunlight)
    if (oneCallData.current.clouds > 30 && oneCallData.current.clouds < 90) {
      idealProperties.push('Partially cloudy conditions reduce direct sunlight');
    }
    
    return {
      isRecommended,
      issues,
      idealProperties
    };
  };

  // Determine if it's good weather for applying ceramic coatings or sealants
  const getCoatingRecommendation = () => {
    const temp = oneCallData.current.temp;
    const humidity = oneCallData.current.humidity;
    const weather = oneCallData.current.weather[0].main.toLowerCase();
    
    // Convert temperature thresholds based on unit
    const minTemp = unit === 'metric' ? 15 : 60;  // 15°C or 60°F
    const maxTemp = unit === 'metric' ? 25 : 77;  // 25°C or 77°F
    
    const issues = [];
    let isRecommended = true;
    
    // Check for precipitation
    if (
      weather.includes('rain') || 
      weather.includes('snow') || 
      weather.includes('drizzle') || 
      weather.includes('sleet') ||
      weather.includes('fog') || 
      weather.includes('mist')
    ) {
      issues.push('Current weather conditions not suitable for coating application');
      isRecommended = false;
    }
    
    // Check for precipitation in next 24 hours from hourly forecast
    if (oneCallData.hourly) {
      const next24Hours = oneCallData.hourly.slice(0, 24);
      const willRainSoon = next24Hours.some(hour => hour.pop > 0.3); // 30% chance or more
      
      if (willRainSoon) {
        issues.push('Precipitation expected in the next 24 hours');
        isRecommended = false;
      }
    }
    
    // Temperature checks
    if (temp < minTemp) {
      issues.push(`Temperature too low (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}) for proper curing`);
      isRecommended = false;
    } else if (temp > maxTemp) {
      issues.push(`Temperature too high (${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}) for optimal application`);
      isRecommended = false;
    }
    
    // Humidity check
    if (humidity > 65) {
      issues.push(`Humidity too high (${humidity}%) for proper coating curing`);
      isRecommended = false;
    }
    
    return {
      isRecommended,
      issues
    };
  };

  // Get wash recommendation
  const washRecommendation = getWashRecommendation();
  
  // Get detailing recommendation
  const detailingRecommendation = getDetailingRecommendation();
  
  // Get coating recommendation
  const coatingRecommendation = getCoatingRecommendation();

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h2 className="font-orbitron text-blue-400 text-2xl flex items-center">
          <Droplets className="mr-2 h-6 w-6" />
          Car Care Weather Analysis
        </h2>
        <p className="text-gray-400 mt-1">Optimize your maintenance activities based on current weather conditions</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Car Washing Panel */}
        <div className={`rounded-lg border ${washRecommendation.isRecommended ? 'border-green-500 bg-green-900 bg-opacity-10' : 'border-red-500 bg-red-900 bg-opacity-10'} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CloudRain className="mr-2 h-5 w-5 text-blue-400" />
              <span>Car Wash</span>
            </h3>
            {washRecommendation.isRecommended ? (
              <span className="bg-green-500 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Recommended
              </span>
            ) : (
              <span className="bg-red-500 bg-opacity-20 text-red-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <XCircle className="mr-1 h-4 w-4" />
                Not Ideal
              </span>
            )}
          </div>
          
          {washRecommendation.issues.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Concerns:</p>
              <ul className="space-y-1">
                {washRecommendation.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span className="text-gray-300">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <ThermometerSun className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-gray-300">Temp: {Math.round(oneCallData.current.temp)}°{unit === 'metric' ? 'C' : 'F'}</span>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 text-blue-400 mr-1" />
              <span className="text-gray-300">Humidity: {oneCallData.current.humidity}%</span>
            </div>
            <div className="flex items-center">
              <Wind className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-gray-300">Wind: {Math.round(oneCallData.current.wind_speed)} {unit === 'metric' ? 'm/s' : 'mph'}</span>
            </div>
            <div className="flex items-center">
              <Sun className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-gray-300">UV: {Math.round(oneCallData.current.uvi)}</span>
            </div>
          </div>
        </div>
        
        {/* Detailing Panel */}
        <div className={`rounded-lg border ${detailingRecommendation.isRecommended ? 'border-green-500 bg-green-900 bg-opacity-10' : 'border-red-500 bg-red-900 bg-opacity-10'} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Trash2 className="mr-2 h-5 w-5 text-blue-400" />
              <span>Detailing</span>
            </h3>
            {detailingRecommendation.isRecommended ? (
              <span className="bg-green-500 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Recommended
              </span>
            ) : (
              <span className="bg-red-500 bg-opacity-20 text-red-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <XCircle className="mr-1 h-4 w-4" />
                Not Ideal
              </span>
            )}
          </div>
          
          {detailingRecommendation.issues.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Concerns:</p>
              <ul className="space-y-1">
                {detailingRecommendation.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span className="text-gray-300">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {detailingRecommendation.idealProperties.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Ideal Conditions:</p>
              <ul className="space-y-1">
                {detailingRecommendation.idealProperties.map((prop, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span className="text-gray-300">{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Ceramic Coating Panel */}
        <div className={`rounded-lg border ${coatingRecommendation.isRecommended ? 'border-green-500 bg-green-900 bg-opacity-10' : 'border-red-500 bg-red-900 bg-opacity-10'} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-400" />
              <span>Coating/Sealant</span>
            </h3>
            {coatingRecommendation.isRecommended ? (
              <span className="bg-green-500 bg-opacity-20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Recommended
              </span>
            ) : (
              <span className="bg-red-500 bg-opacity-20 text-red-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <XCircle className="mr-1 h-4 w-4" />
                Not Ideal
              </span>
            )}
          </div>
          
          {coatingRecommendation.issues.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-400 mb-2">Concerns:</p>
              <ul className="space-y-1">
                {coatingRecommendation.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span className="text-gray-300">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 text-sm bg-gray-800 rounded p-3">
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">
                {coatingRecommendation.isRecommended
                  ? 'Current conditions are suitable for coating applications. Ideal curing environment with proper temperature and humidity levels.'
                  : 'Professional ceramic coatings and sealants require specific environmental conditions for proper application and curing.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forecast for Car Care */}
      <div className="p-6 pt-0">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">3-Day Car Care Forecast</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Weather</th>
                <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Wash</th>
                <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Detail</th>
                <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {oneCallData.daily?.slice(0, 3).map((day, idx) => {
                const date = new Date(day.dt * 1000);
                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                // Simple algorithm to determine if day is good for car care
                const isGoodForWash = day.pop < 0.3 && day.weather[0].main !== 'Rain' && day.weather[0].main !== 'Snow';
                const isGoodForDetail = day.pop < 0.2 && day.humidity < 70 && day.temp.day > (unit === 'metric' ? 15 : 60) && day.temp.day < (unit === 'metric' ? 28 : 82);
                const isGoodForCoating = day.pop < 0.1 && day.humidity < 65 && day.temp.day > (unit === 'metric' ? 15 : 60) && day.temp.day < (unit === 'metric' ? 25 : 77);
                
                return (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-black bg-opacity-50' : 'bg-gray-900'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 flex items-center">
                      <img 
                        src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                        alt={day.weather[0].description}
                        className="w-8 h-8 mr-1"
                      />
                      <div>
                        <div className="font-medium capitalize">{day.weather[0].main}</div>
                        <div className="text-xs text-gray-400">{Math.round(day.temp.min)}° - {Math.round(day.temp.max)}°{unit === 'metric' ? 'C' : 'F'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {isGoodForWash ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-10 text-green-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Good
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-10 text-red-400">
                          <XCircle className="mr-1 h-3 w-3" /> Poor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {isGoodForDetail ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-10 text-green-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Good
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-10 text-red-400">
                          <XCircle className="mr-1 h-3 w-3" /> Poor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {isGoodForCoating ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500 bg-opacity-10 text-green-400">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Good
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 bg-opacity-10 text-red-400">
                          <XCircle className="mr-1 h-3 w-3" /> Poor
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="px-6 py-4 bg-gray-950 border-t border-gray-800">
        <h3 className="text-lg font-semibold text-blue-400 mb-3">Weather-Smart Car Care Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-gray-300">
            <p className="font-medium text-gray-200 mb-1">• Temperature Matters</p>
            <p>Most car care products work best between {unit === 'metric' ? '15-25°C' : '60-77°F'}. Avoid applying waxes, sealants, or coatings outside this range.</p>
          </div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-gray-200 mb-1">• UV Protection</p>
            <p>UV index of {Math.round(oneCallData.current.uvi)} today - {oneCallData.current.uvi > 5 ? 'consider UV protective products for your interior and paint.' : 'moderate UV levels today.'}</p>
          </div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-gray-200 mb-1">• Humidity Impact</p>
            <p>Current humidity ({oneCallData.current.humidity}%) {oneCallData.current.humidity > 70 ? 'may slow product drying times.' : 'is optimal for most detailing work.'}</p>
          </div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-gray-200 mb-1">• Rain Forecast</p>
            <p>
              {oneCallData.hourly && oneCallData.hourly[0].pop > 0.3 
                ? `${Math.round(oneCallData.hourly[0].pop * 100)}% chance of precipitation in the next hour - consider postponing outdoor car care.` 
                : 'No significant precipitation expected in the immediate forecast.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCareWeatherPanel;