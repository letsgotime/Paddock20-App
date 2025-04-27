import React, { useState } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { ChevronDown, ChevronUp, Gauge, Droplet, Wind, Sun, Clock, Thermometer, Tally5, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WeatherConditionProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  severity?: 'low' | 'moderate' | 'high' | 'extreme';
  description?: string;
}

const MotorsportWeatherPanel = () => {
  const { weatherData, forecastData, oneCallData, unit, isLoading, error } = useWeather();
  const [expandedSection, setExpandedSection] = useState<string | null>('trackConditions');

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
        return 'text-orange-400';
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  const WeatherCondition: React.FC<WeatherConditionProps> = ({ 
    label, value, unit = '', icon, severity = 'low', description 
  }) => (
    <div className="bg-black bg-opacity-50 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <div className="mr-3 text-blue-400">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className={`text-xl font-semibold ${getSeverityClass(severity)}`}>
            {value}{unit}
          </div>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-400 mt-1 italic">{description}</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 animate-pulse">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Loading Motorsport Weather Data...</h2>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded mb-4"></div>
        <div className="h-8 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error || !weatherData || !oneCallData) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="font-orbitron text-blue-400 text-xl mb-4">Motorsport Weather Analysis</h2>
        <div className="p-4 bg-gray-950 rounded-lg text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-300">Unable to load motorsport weather data</p>
          <p className="text-sm text-gray-500 mt-2">
            {error ? error.message : 'Weather data unavailable for this location'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate surface temperature based on ambient temperature and sunlight
  const estimateSurfaceTemperature = () => {
    const baseTemp = oneCallData.current.temp;
    const uvi = oneCallData.current.uvi;
    const cloudCover = oneCallData.current.clouds;
    
    // Surface temperature is generally higher than air temperature
    // especially on sunny days with high UV and low cloud cover
    const uviFactor = Math.min(uvi * 0.7, 10); // UVI influence capped at 10
    const cloudFactor = (100 - cloudCover) * 0.05; // Less clouds = more heating
    
    // Temperature difference between air and asphalt (typically 10-20°F/5-11°C more on clear days)
    const surfaceDiff = uviFactor + cloudFactor;
    
    return Math.round(baseTemp + surfaceDiff);
  };

  // Evaluate track conditions
  const getTrackCondition = () => {
    const weather = oneCallData.current.weather[0].main.toLowerCase();
    const precipitation = oneCallData.current.rain?.['1h'] || oneCallData.current.snow?.['1h'] || 0;
    
    if (precipitation > 2.5) return { condition: 'Wet', severity: 'extreme' };
    if (precipitation > 0.5) return { condition: 'Damp', severity: 'high' };
    if (weather.includes('rain') || weather.includes('drizzle')) return { condition: 'Damp', severity: 'moderate' };
    if (weather.includes('snow') || weather.includes('sleet')) return { condition: 'Snow-covered', severity: 'extreme' };
    return { condition: 'Dry', severity: 'low' };
  };

  // Calculate wind impact on driving
  const getWindImpact = () => {
    const windSpeed = oneCallData.current.wind_speed;
    const unitModifier = unit === 'imperial' ? 1 : 0.44704; // Convert to mph if metric
    const windSpeedMph = windSpeed * unitModifier;
    
    if (windSpeedMph > 25) return { impact: 'Significant', severity: 'high', description: 'Strong crosswinds may affect handling' };
    if (windSpeedMph > 15) return { impact: 'Moderate', severity: 'moderate', description: 'Noticeable effect on high-speed sections' };
    return { impact: 'Low', severity: 'low', description: 'Minimal impact on vehicle handling' };
  };

  // Evaluate visibility conditions
  const getVisibilityCondition = () => {
    const visibility = oneCallData.current.visibility / 1000; // Convert to km
    const weather = oneCallData.current.weather[0].main.toLowerCase();
    const fogConditions = ['fog', 'mist', 'haze'];
    
    if (visibility < 0.5 || fogConditions.some(cond => weather.includes(cond))) {
      return { condition: 'Poor', severity: 'extreme', description: 'Hazardous driving conditions' };
    }
    if (visibility < 2) {
      return { condition: 'Reduced', severity: 'high', description: 'Proceed with caution' };
    }
    if (visibility < 5 || weather.includes('rain') || weather.includes('snow')) {
      return { condition: 'Moderate', severity: 'moderate', description: 'Some visual impairment possible' };
    }
    return { condition: 'Excellent', severity: 'low', description: 'Clear visibility in all directions' };
  };

  // Calculate grip level based on temperature and conditions
  const getGripLevel = () => {
    const trackTemp = estimateSurfaceTemperature();
    const { condition } = getTrackCondition();
    const humidity = oneCallData.current.humidity;
    
    if (condition !== 'Dry') {
      return { level: 'Low', severity: 'high', description: 'Reduced traction, cautious driving recommended' };
    }
    
    // Temperature-based grip (lower in extremes)
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const tempThresholdLow = unit === 'metric' ? 15 : 60;
    const tempThresholdHigh = unit === 'metric' ? 50 : 122;
    
    if (trackTemp < tempThresholdLow) {
      return { level: 'Reduced', severity: 'moderate', description: `Cold surface (${trackTemp}${tempUnit}) may limit tire performance` };
    }
    if (trackTemp > tempThresholdHigh) {
      return { level: 'Variable', severity: 'high', description: `Excessive heat (${trackTemp}${tempUnit}) causing surface overheating` };
    }
    if (humidity > 85) {
      return { level: 'Moderate', severity: 'moderate', description: 'High humidity affecting grip consistency' };
    }
    
    return { level: 'Optimal', severity: 'low', description: 'Ideal conditions for maximum traction' };
  };

  // Predict braking performance
  const getBrakingPerformance = () => {
    const { condition } = getTrackCondition();
    const trackTemp = estimateSurfaceTemperature();
    
    if (condition !== 'Dry') {
      return { performance: 'Compromised', severity: 'high', description: 'Extended braking distances, reduced effectiveness' };
    }
    
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const tempThresholdLow = unit === 'metric' ? 10 : 50;
    const tempThresholdHigh = unit === 'metric' ? 60 : 140;
    
    if (trackTemp < tempThresholdLow) {
      return { performance: 'Reduced', severity: 'moderate', description: 'Brakes will take longer to reach operating temperature' };
    }
    if (trackTemp > tempThresholdHigh) {
      return { performance: 'Risk of overheating', severity: 'high', description: 'Monitor brake temperatures closely' };
    }
    
    return { performance: 'Optimal', severity: 'low', description: 'Ideal conditions for consistent braking performance' };
  };

  // Surface temperature
  const surfaceTemp = estimateSurfaceTemperature();
  const trackCondition = getTrackCondition();
  const windImpact = getWindImpact();
  const visibilityCondition = getVisibilityCondition();
  const gripLevel = getGripLevel();
  const brakingPerformance = getBrakingPerformance();
  
  // Format weather update time
  const updateTime = new Date(oneCallData.current.dt * 1000);
  const timeAgo = formatDistanceToNow(updateTime, { addSuffix: true });

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="font-orbitron text-blue-400 text-2xl flex items-center">
          <Gauge className="mr-2 h-6 w-6" />
          Paddock20 Motorsport Weather Analysis
        </h2>
        <p className="text-gray-400 mt-1">
          {weatherData.name}, {weatherData.sys.country} • Updated {timeAgo}
        </p>
      </div>

      {/* Main Summary Panel */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black bg-opacity-70 rounded-lg p-4 flex flex-col items-center justify-center">
            <div className="mb-1">
              <img 
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                alt={weatherData.weather[0].description}
                className="w-16 h-16"
              />
            </div>
            <p className="text-gray-400 text-sm">Current Conditions</p>
            <p className="text-2xl font-bold">{Math.round(weatherData.main.temp)}°{unit === 'metric' ? 'C' : 'F'}</p>
            <p className="text-lg text-gray-300 capitalize">{weatherData.weather[0].description}</p>
          </div>
          
          <div className="bg-black bg-opacity-70 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Track Surface</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">
                  {surfaceTemp}°{unit === 'metric' ? 'C' : 'F'}
                </p>
                <p className={`text-lg font-medium ${getSeverityClass(trackCondition.severity)}`}>
                  {trackCondition.condition}
                </p>
              </div>
              <Thermometer className="h-10 w-10 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-black bg-opacity-70 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Grip Assessment</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-2xl font-bold ${getSeverityClass(gripLevel.severity)}`}>
                  {gripLevel.level}
                </p>
                <p className="text-sm text-gray-400 mt-1">{gripLevel.description}</p>
              </div>
              <Tally5 className="h-10 w-10 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Weather Data Sections - Collapsible */}
        <div className="space-y-4">
          {/* Track Conditions Section */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 flex justify-between items-center bg-gray-900 hover:bg-gray-800 transition-colors"
              onClick={() => toggleSection('trackConditions')}
              aria-expanded={expandedSection === 'trackConditions'}
            >
              <span className="text-lg font-orbitron text-blue-400">Track Conditions</span>
              {expandedSection === 'trackConditions' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'trackConditions' && (
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherCondition
                  label="Surface Temperature"
                  value={surfaceTemp}
                  unit={unit === 'metric' ? '°C' : '°F'}
                  icon={<Thermometer className="h-5 w-5" />}
                  severity={trackCondition.severity}
                  description="Estimated track surface temperature"
                />
                
                <WeatherCondition
                  label="Air Temperature"
                  value={Math.round(weatherData.main.temp)}
                  unit={unit === 'metric' ? '°C' : 'F'}
                  icon={<Thermometer className="h-5 w-5" />}
                  severity="low"
                  description="Ambient air temperature"
                />
                
                <WeatherCondition
                  label="Humidity"
                  value={weatherData.main.humidity}
                  unit="%"
                  icon={<Droplet className="h-5 w-5" />}
                  severity={weatherData.main.humidity > 80 ? 'moderate' : 'low'}
                  description={weatherData.main.humidity > 80 ? 'High humidity may affect cooling and grip' : 'Normal humidity levels'}
                />
                
                <WeatherCondition
                  label="Wind"
                  value={Math.round(oneCallData.current.wind_speed)}
                  unit={unit === 'metric' ? ' m/s' : ' mph'}
                  icon={<Wind className="h-5 w-5" />}
                  severity={windImpact.severity}
                  description={windImpact.description}
                />
              </div>
            )}
          </div>
          
          {/* Performance Impact Section */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 flex justify-between items-center bg-gray-900 hover:bg-gray-800 transition-colors"
              onClick={() => toggleSection('performanceImpact')}
              aria-expanded={expandedSection === 'performanceImpact'}
            >
              <span className="text-lg font-orbitron text-blue-400">Performance Impact</span>
              {expandedSection === 'performanceImpact' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'performanceImpact' && (
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <WeatherCondition
                  label="Grip Level"
                  value={gripLevel.level}
                  icon={<Tally5 className="h-5 w-5" />}
                  severity={gripLevel.severity}
                  description={gripLevel.description}
                />
                
                <WeatherCondition
                  label="Braking Performance"
                  value={brakingPerformance.performance}
                  icon={<Gauge className="h-5 w-5" />}
                  severity={brakingPerformance.severity}
                  description={brakingPerformance.description}
                />
                
                <WeatherCondition
                  label="Visibility"
                  value={visibilityCondition.condition}
                  icon={<Sun className="h-5 w-5" />}
                  severity={visibilityCondition.severity}
                  description={visibilityCondition.description}
                />
                
                <WeatherCondition
                  label="UV Index"
                  value={oneCallData.current.uvi}
                  icon={<Sun className="h-5 w-5" />}
                  severity={oneCallData.current.uvi > 6 ? 'high' : oneCallData.current.uvi > 3 ? 'moderate' : 'low'}
                  description={oneCallData.current.uvi > 6 ? 'High UV - track surface may be hot' : 'Moderate UV levels'}
                />
              </div>
            )}
          </div>
          
          {/* Weather Trend Section */}
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 flex justify-between items-center bg-gray-900 hover:bg-gray-800 transition-colors"
              onClick={() => toggleSection('weatherTrend')}
              aria-expanded={expandedSection === 'weatherTrend'}
            >
              <span className="text-lg font-orbitron text-blue-400">Weather Trend</span>
              {expandedSection === 'weatherTrend' ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {expandedSection === 'weatherTrend' && oneCallData.hourly && (
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Temp</th>
                          <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Condition</th>
                          <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Wind</th>
                          <th className="px-4 py-3 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Precip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {oneCallData.hourly.slice(0, 6).map((hour, index) => {
                          const hourTime = new Date(hour.dt * 1000);
                          const precipChance = Math.round(hour.pop * 100);
                          return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-black bg-opacity-50' : 'bg-gray-900'}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {hourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">
                                {Math.round(hour.temp)}°{unit === 'metric' ? 'C' : 'F'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 flex items-center">
                                <img 
                                  src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} 
                                  alt={hour.weather[0].description}
                                  className="w-8 h-8 mr-1"
                                />
                                <span className="capitalize">{hour.weather[0].description}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {Math.round(hour.wind_speed)} {unit === 'metric' ? 'm/s' : 'mph'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                <span className={precipChance > 30 ? 'text-blue-400' : 'text-gray-400'}>
                                  {precipChance}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Driver Recommendations */}
      <div className="px-6 py-4 border-t border-gray-800 mt-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">Driver Recommendations</h3>
        <ul className="space-y-2 text-gray-300">
          {trackCondition.condition !== 'Dry' && (
            <li className="flex items-start">
              <span className="flex-shrink-0 text-yellow-400 mr-2">•</span>
              <span>Reduce speed in corners by 20-30% due to {trackCondition.condition.toLowerCase()} conditions</span>
            </li>
          )}
          {gripLevel.severity !== 'low' && (
            <li className="flex items-start">
              <span className="flex-shrink-0 text-yellow-400 mr-2">•</span>
              <span>Expect {gripLevel.level.toLowerCase()} grip levels; gentle inputs recommended</span>
            </li>
          )}
          {windImpact.severity !== 'low' && (
            <li className="flex items-start">
              <span className="flex-shrink-0 text-yellow-400 mr-2">•</span>
              <span>Prepare for {windImpact.impact.toLowerCase()} crosswinds, especially on high-speed sections</span>
            </li>
          )}
          {oneCallData.current.uvi > 6 && (
            <li className="flex items-start">
              <span className="flex-shrink-0 text-yellow-400 mr-2">•</span>
              <span>High UV index ({Math.round(oneCallData.current.uvi)}); track surface may vary as temperature changes</span>
            </li>
          )}
          {oneCallData.hourly && oneCallData.hourly[0].pop > 0.3 && (
            <li className="flex items-start">
              <span className="flex-shrink-0 text-blue-400 mr-2">•</span>
              <span>Precipitation probability increasing to {Math.round(oneCallData.hourly[0].pop * 100)}% in the next hour</span>
            </li>
          )}
          <li className="flex items-start">
            <span className="flex-shrink-0 text-green-400 mr-2">•</span>
            <span>Current optimal tire pressure adjustment: {trackCondition.condition === 'Dry' ? '+0.5 PSI' : '-1.5 PSI'} from baseline</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MotorsportWeatherPanel;