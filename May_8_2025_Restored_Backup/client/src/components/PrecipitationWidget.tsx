import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Droplets, AlertTriangle, Clock, Umbrella, Wind } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const PrecipitationWidget: React.FC = () => {
  const { weatherData: currentWeather, forecastData: forecast, unit: units, isLoading } = useWeather();
  const [precipitationData, setPrecipitationData] = useState<any[]>([]);
  const [precipSummary, setPrecipSummary] = useState({
    imminent: false,
    next6Hours: false,
    next24Hours: false,
    intensity: 'none', // none, light, moderate, heavy
    maxIntensity: 0,
    totalAmount: 0,
    type: 'none', // none, rain, snow, mixed
  });

  useEffect(() => {
    if (forecast && forecast.list && forecast.list.length > 0) {
      // Process forecast data to extract precipitation information
      const next24HoursData = forecast.list.slice(0, 8); // Each forecast is 3 hours, so 8 entries = 24 hours
      
      // Format precipitation data
      const formattedData = next24HoursData.map(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const formattedHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
        
        // Calculate precipitation amount
        const rainAmount = item.rain && item.rain['3h'] ? item.rain['3h'] : 0;
        const snowAmount = item.snow && item.snow['3h'] ? item.snow['3h'] : 0;
        const totalPrecip = rainAmount + snowAmount;
        
        // Determine precipitation type
        let precipType = 'none';
        if (rainAmount > 0 && snowAmount > 0) {
          precipType = 'mixed';
        } else if (rainAmount > 0) {
          precipType = 'rain';
        } else if (snowAmount > 0) {
          precipType = 'snow';
        }
        
        // Determine precipitation intensity
        let intensity = 'none';
        if (totalPrecip > 0) {
          if (totalPrecip < 2.5) {
            intensity = 'light';
          } else if (totalPrecip < 7.6) {
            intensity = 'moderate';
          } else {
            intensity = 'heavy';
          }
        }
        
        return {
          hour: formattedHour,
          timestamp: date,
          temp: Math.round(item.main.temp),
          rain: rainAmount,
          snow: snowAmount,
          totalPrecip,
          precipType,
          intensity,
          weather: item.weather[0],
          pop: Math.round(item.pop * 100), // Probability of precipitation as percentage
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed)
        };
      });

      setPrecipitationData(formattedData);
      
      // Calculate precipitation summary
      const hasImminent = formattedData.slice(0, 1).some(item => item.totalPrecip > 0);
      const hasNext6Hours = formattedData.slice(0, 2).some(item => item.totalPrecip > 0);
      const hasNext24Hours = formattedData.some(item => item.totalPrecip > 0);
      const maxIntensity = Math.max(...formattedData.map(item => item.totalPrecip));
      const totalAmount = formattedData.reduce((sum, item) => sum + item.totalPrecip, 0);
      
      // Determine overall precipitation type
      let overallType = 'none';
      if (hasNext24Hours) {
        const hasRain = formattedData.some(item => item.rain > 0);
        const hasSnow = formattedData.some(item => item.snow > 0);
        
        if (hasRain && hasSnow) {
          overallType = 'mixed';
        } else if (hasRain) {
          overallType = 'rain';
        } else if (hasSnow) {
          overallType = 'snow';
        }
      }
      
      // Determine overall intensity
      let overallIntensity = 'none';
      if (maxIntensity > 0) {
        if (maxIntensity < 2.5) {
          overallIntensity = 'light';
        } else if (maxIntensity < 7.6) {
          overallIntensity = 'moderate';
        } else {
          overallIntensity = 'heavy';
        }
      }
      
      setPrecipSummary({
        imminent: hasImminent,
        next6Hours: hasNext6Hours,
        next24Hours: hasNext24Hours,
        intensity: overallIntensity,
        maxIntensity,
        totalAmount,
        type: overallType
      });
    }
  }, [forecast]);

  // Helper functions for UI
  const getPrecipitationIcon = (type: string, intensity: string) => {
    if (type === 'none') {
      return <Cloud className="h-6 w-6 text-blue-400" />;
    } else if (type === 'rain' || type === 'mixed') {
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    } else if (type === 'snow') {
      return <Cloud className="h-6 w-6 text-blue-300" />;
    }
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };

  const getPrecipitationColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'text-blue-400';
      case 'moderate': return 'text-blue-500';
      case 'heavy': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const getPrecipitationBarHeight = (amount: number) => {
    if (amount === 0) return '0%';
    // Scale the bar height based on the maximum amount in the data
    const maxAmount = Math.max(...precipitationData.map(item => item.totalPrecip));
    if (maxAmount === 0) return '0%';
    
    // Minimum height of 5% for any non-zero precipitation
    const percentage = Math.max(5, Math.min(100, (amount / maxAmount) * 100));
    return `${percentage}%`;
  };

  const getWeatherIcon = (id: number) => {
    // Simple weather icon mapping
    if (id >= 200 && id < 300) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else if (id >= 300 && id < 600) {
      return <CloudRain className="h-4 w-4 text-blue-400" />;
    } else if (id >= 600 && id < 700) {
      return <Cloud className="h-4 w-4 text-blue-300" />;
    } else if (id >= 700 && id < 800) {
      return <Wind className="h-4 w-4 text-gray-400" />;
    } else if (id === 800) {
      return <Cloud className="h-4 w-4 text-yellow-400" />;
    }
    return <Cloud className="h-4 w-4 text-gray-400" />;
  };

  if (isLoading || !precipitationData.length) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-40 bg-gray-800 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold flex items-center">
          <Droplets className="h-4 w-4 mr-2" />
          <span>Precipitation Forecast</span>
        </h3>
        <span className="text-xs text-gray-400">Next 24 hours</span>
      </div>
      
      <div className="p-4">
        {/* Precipitation Status Card */}
        <div className={`p-4 rounded-lg mb-4 border ${
          precipSummary.next24Hours 
            ? precipSummary.imminent
              ? 'bg-blue-900/30 border-blue-700'
              : 'bg-blue-900/20 border-blue-800/60'
            : 'bg-black/30 border-gray-800'
        }`}>
          <div className="flex items-center">
            {precipSummary.next24Hours ? (
              <>
                {getPrecipitationIcon(precipSummary.type, precipSummary.intensity)}
                <div className="ml-3">
                  <h4 className="text-white font-medium">
                    {precipSummary.imminent
                      ? 'Precipitation Imminent'
                      : precipSummary.next6Hours
                        ? 'Precipitation Expected Soon'
                        : 'Precipitation Expected'
                    }
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {precipSummary.type === 'rain' && `${precipSummary.intensity.charAt(0).toUpperCase() + precipSummary.intensity.slice(1)} rain forecast`}
                    {precipSummary.type === 'snow' && `${precipSummary.intensity.charAt(0).toUpperCase() + precipSummary.intensity.slice(1)} snow forecast`}
                    {precipSummary.type === 'mixed' && `${precipSummary.intensity.charAt(0).toUpperCase() + precipSummary.intensity.slice(1)} mixed precipitation forecast`}
                    {precipSummary.totalAmount > 0 && ` (${precipSummary.totalAmount.toFixed(1)} ${units === 'imperial' ? 'in' : 'mm'} total)`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Cloud className="h-6 w-6 text-gray-500" />
                <div className="ml-3">
                  <h4 className="text-white font-medium">No Precipitation Expected</h4>
                  <p className="text-gray-400 text-sm">Clear conditions for the next 24 hours</p>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Hourly Precipitation Chart */}
        <div className="mt-6">
          <h4 className="text-gray-300 text-sm mb-3">Precipitation Intensity Timeline</h4>
          <div className="flex items-end space-x-3 h-32">
            {precipitationData.map((item, index) => (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center group cursor-pointer"
              >
                <div className="relative w-full flex justify-center">
                  <div 
                    className={`w-full max-w-[20px] rounded-t ${
                      item.precipType === 'none' 
                        ? 'bg-transparent' 
                        : item.precipType === 'rain' 
                          ? 'bg-blue-500/60'
                          : item.precipType === 'snow'
                            ? 'bg-blue-200/60'
                            : 'bg-purple-400/60'
                    }`}
                    style={{ height: getPrecipitationBarHeight(item.totalPrecip) }}
                  ></div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 w-32 bg-black/80 text-white text-xs rounded py-1 px-2 hidden group-hover:block transition-opacity z-10">
                    <p className="font-semibold capitalize">{item.weather.description}</p>
                    <p>Chance: {item.pop}%</p>
                    {item.totalPrecip > 0 && (
                      <p>{item.totalPrecip.toFixed(1)} {units === 'imperial' ? 'in' : 'mm'}</p>
                    )}
                    <p>{item.temp}°{units === 'imperial' ? 'F' : 'C'}</p>
                  </div>
                </div>
                {/* Time label */}
                <div className="mt-1 text-xs text-gray-400">{item.hour}</div>
                {/* Precipitation chance */}
                <div className={`mt-1 text-xs ${item.pop > 50 ? 'text-blue-400' : 'text-gray-500'}`}>
                  {item.pop}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Detailed 6-Hour Forecast */}
        <div className="mt-6">
          <h4 className="text-gray-300 text-sm mb-3">Detailed Next 6 Hours</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {precipitationData.slice(0, 2).map((item, index) => (
              <div key={index} className="bg-black/30 rounded-lg border border-gray-800 p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {getWeatherIcon(item.weather.id)}
                    <span className="ml-2 text-white">{item.hour}</span>
                  </div>
                  <span className={`text-sm ${item.pop > 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                    <Umbrella className="h-3 w-3 inline mr-1" />
                    {item.pop}% chance
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <div>
                    <span className="text-gray-500">Temp</span>
                    <p className="text-white">{item.temp}°{units === 'imperial' ? 'F' : 'C'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Wind</span>
                    <p className="text-white">{item.windSpeed} {units === 'imperial' ? 'mph' : 'km/h'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Humidity</span>
                    <p className="text-white">{item.humidity}%</p>
                  </div>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-400 capitalize">{item.weather.description}</span>
                  {item.totalPrecip > 0 && (
                    <span className="ml-2 text-blue-400">
                      ({item.totalPrecip.toFixed(1)} {units === 'imperial' ? 'in' : 'mm'})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Precipitation Impact */}
        <div className="mt-6 p-3 rounded-lg bg-blue-900/10 border border-blue-900/30">
          <h4 className="text-blue-400 text-sm font-bold mb-2">Precipitation Impact on Driving</h4>
          <p className="text-gray-300 text-sm mb-2">
            {precipSummary.next24Hours ? (
              <>
                {precipSummary.type === 'rain' && precipSummary.intensity === 'light' && 
                  'Light rain expected. Minimal impact on driving conditions. Be cautious on turns.'}
                {precipSummary.type === 'rain' && precipSummary.intensity === 'moderate' && 
                  'Moderate rain expected. Reduced visibility and traction. Increase following distance.'}
                {precipSummary.type === 'rain' && precipSummary.intensity === 'heavy' && 
                  'Heavy rain expected. Significantly reduced visibility and hydroplaning risk. Consider delaying travel.'}
                  
                {precipSummary.type === 'snow' && precipSummary.intensity === 'light' && 
                  'Light snow expected. Exercise caution, especially on bridges and overpasses.'}
                {precipSummary.type === 'snow' && precipSummary.intensity === 'moderate' && 
                  'Moderate snow expected. Reduced traction and visibility. Slow down significantly.'}
                {precipSummary.type === 'snow' && precipSummary.intensity === 'heavy' && 
                  'Heavy snow expected. Hazardous conditions possible. Consider avoiding travel.'}
                  
                {precipSummary.type === 'mixed' && 
                  'Mixed precipitation expected. Unpredictable road conditions. Increase following distance and reduce speed.'}
              </>
            ) : (
              'No precipitation expected. Optimal driving conditions from a visibility and traction perspective.'
            )}
          </p>
          
          {precipSummary.next24Hours && (
            <div className="text-xs text-gray-400">
              <span className="inline-block px-2 py-1 bg-blue-900/20 rounded-full">
                <Clock className="h-3 w-3 inline mr-1" />
                {precipSummary.imminent 
                  ? 'Immediate action recommended' 
                  : precipSummary.next6Hours
                    ? 'Action recommended within next 6 hours'
                    : 'Monitor conditions over next 24 hours'
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrecipitationWidget;