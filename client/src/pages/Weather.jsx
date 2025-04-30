import React, { useState, useEffect } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';
import AutomotiveEnthusiastWeather from '../components/AutomotiveEnthusiastWeather';
import WorldClockPanel from '../components/WorldClockPanel';
import SimplifiedF1TelemetryPanel from '../components/SimplifiedF1TelemetryPanel';
import { 
  getWeatherData, 
  getOneCallData, 
  getAutomotiveWeatherData,
  getForecastData,
  formatTemperature,
  formatTime,
  getWeatherIconUrl,
  defaultLocation
} from '@/services/openWeatherService';
import { useWeather } from '../contexts/WeatherContext';
import { Loader2, AlertTriangle, Info, ThermometerSun, Wind, Droplets, Gauge } from 'lucide-react';

function Weather() {
  const { weatherData, errorMessage, isLoading } = useWeather();
  const [forecastData, setForecastData] = useState(null);
  const [automotiveData, setAutomotiveData] = useState(null);
  const [optimalDriveTimes, setOptimalDriveTimes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehiclePerformanceData, setVehiclePerformanceData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(true);

  useEffect(() => {
    async function fetchAdvancedWeatherData() {
      if (!weatherData || !weatherData.coordinates) return;
      
      try {
        setLoadingForecast(true);
        const { lat, lon } = weatherData.coordinates;
        
        // Get 5-day forecast and automotive performance data
        const [forecast, automotive] = await Promise.all([
          getForecastData({ lat, lon }),
          getAutomotiveWeatherData({ lat, lon })
        ]);
        
        setForecastData(forecast);
        setAutomotiveData(automotive);
        
        // Calculate optimal drive times based on actual forecast data
        if (forecast && forecast.list) {
          calculateOptimalDriveTimes(forecast, automotive);
        }
        
        setLoadingForecast(false);
      } catch (err) {
        console.error('Error fetching advanced weather data:', err);
        setLoadingForecast(false);
      }
    }
    
    fetchAdvancedWeatherData();
  }, [weatherData]);

  // Calculate optimal driving windows based on real forecast data
  const calculateOptimalDriveTimes = (forecast, automotive) => {
    if (!forecast || !forecast.list || !automotive) return;
    
    const optimalConditions = [];
    const forecastList = forecast.list;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Group forecast data by day
    const forecastByDay = forecastList.reduce((acc, item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toDateString();
      
      if (!acc[day]) {
        acc[day] = [];
      }
      
      acc[day].push({
        ...item,
        date
      });
      
      return acc;
    }, {});
    
    // Find optimal windows for each day
    Object.entries(forecastByDay).forEach(([day, forecasts], index) => {
      if (index > 1) return; // Only process today and tomorrow
      
      const dayForecasts = forecasts.filter(f => {
        const hour = f.date.getHours();
        return hour >= 7 && hour <= 20; // Only consider daytime hours
      });
      
      if (dayForecasts.length === 0) return;
      
      // Score each forecast period
      const scoredForecasts = dayForecasts.map(f => {
        let score = 0;
        const weather = f.weather[0];
        const main = f.main;
        const wind = f.wind;
        
        // Favorable temperature range (60-85°F or 15-30°C)
        if (main.temp >= 60 && main.temp <= 85) {
          score += 2;
        } else if (main.temp >= 40 && main.temp <= 95) {
          score += 1;
        }
        
        // Clear weather
        if (weather.main === 'Clear' || weather.main === 'Clouds' && weather.description.includes('few')) {
          score += 2;
        } else if (weather.main === 'Clouds') {
          score += 1;
        }
        
        // Low wind
        if (wind.speed < 10) {
          score += 1;
        }
        
        // Low humidity
        if (main.humidity < 70) {
          score += 1;
        }
        
        // Low precipitation chance
        if (!f.pop || f.pop < 0.3) {
          score += 1;
        }
        
        return {
          forecast: f,
          score,
          startTime: f.date
        };
      });
      
      // Sort by score
      scoredForecasts.sort((a, b) => b.score - a.score);
      
      // Find contiguous blocks of good time
      let bestWindow = null;
      if (scoredForecasts.length > 0) {
        const topScore = scoredForecasts[0].score;
        const goodForecasts = scoredForecasts.filter(f => f.score >= Math.max(3, topScore - 1));
        
        // Group by contiguous time blocks
        let currentBlock = [goodForecasts[0]];
        const blocks = [currentBlock];
        
        for (let i = 1; i < goodForecasts.length; i++) {
          const prevTime = currentBlock[currentBlock.length - 1].forecast.date;
          const currTime = goodForecasts[i].forecast.date;
          
          // If within 3 hours, add to current block
          if ((currTime.getTime() - prevTime.getTime()) <= 3 * 60 * 60 * 1000) {
            currentBlock.push(goodForecasts[i]);
          } else {
            currentBlock = [goodForecasts[i]];
            blocks.push(currentBlock);
          }
        }
        
        // Find the block with the highest average score
        let bestBlockScore = 0;
        blocks.forEach(block => {
          const avgScore = block.reduce((sum, f) => sum + f.score, 0) / block.length;
          if (avgScore > bestBlockScore && block.length > 0) {
            bestBlockScore = avgScore;
            bestWindow = block;
          }
        });
      }
      
      if (bestWindow) {
        const startTime = bestWindow[0].startTime;
        const endTime = bestWindow[bestWindow.length - 1].startTime;
        endTime.setHours(endTime.getHours() + 3); // Add 3 hours to the last period
        
        // Get conditions from the middle of the window
        const midForecast = bestWindow[Math.floor(bestWindow.length / 2)].forecast;
        const avgScore = bestWindow.reduce((sum, f) => sum + f.score, 0) / bestWindow.length;
        
        let ratingStars = '★☆☆☆☆';
        if (avgScore >= 5) ratingStars = '★★★★★';
        else if (avgScore >= 4) ratingStars = '★★★★☆';
        else if (avgScore >= 3) ratingStars = '★★★☆☆';
        else if (avgScore >= 2) ratingStars = '★★☆☆☆';
        else if (avgScore >= 1) ratingStars = '★☆☆☆☆';
        
        let ratingColor = 'text-green-400';
        if (avgScore >= 4) ratingColor = 'text-green-400';
        else if (avgScore >= 3) ratingColor = 'text-blue-400';
        else if (avgScore >= 2) ratingColor = 'text-yellow-400';
        else ratingColor = 'text-red-400';
        
        let bgGradient = 'from-green-900/30 to-green-800/20';
        let borderColor = 'border-green-800/30';
        
        if (avgScore >= 4) {
          bgGradient = 'from-green-900/30 to-green-800/20';
          borderColor = 'border-green-800/30';
        } else if (avgScore >= 3) {
          bgGradient = 'from-blue-900/30 to-blue-800/20';
          borderColor = 'border-blue-800/30';
        } else if (avgScore >= 2) {
          bgGradient = 'from-yellow-900/30 to-yellow-800/20';
          borderColor = 'border-yellow-800/30';
        } else {
          bgGradient = 'from-red-900/30 to-red-800/20';
          borderColor = 'border-red-800/30';
        }
        
        // Create description based on actual conditions
        let description = '';
        const weather = midForecast.weather[0];
        const temp = midForecast.main.temp;
        const wind = midForecast.wind.speed;
        const humidity = midForecast.main.humidity;
        
        // Build description based on actual conditions
        if (weather.main === 'Clear') {
          description += 'Clear skies with ';
        } else if (weather.main === 'Clouds' && weather.description.includes('few')) {
          description += 'Mostly clear with ';
        } else if (weather.main === 'Clouds') {
          description += 'Partly cloudy with ';
        } else {
          description += `${weather.description} with `;
        }
        
        if (temp >= 75) {
          description += 'warm temperatures';
        } else if (temp >= 60) {
          description += 'mild temperatures';
        } else if (temp >= 45) {
          description += 'cool temperatures';
        } else {
          description += 'cold temperatures';
        }
        
        if (wind > 15) {
          description += ' and strong winds';
        } else if (wind > 8) {
          description += ' and moderate winds';
        } else {
          description += ' and light winds';
        }
        
        // Get the day name
        const dayName = index === 0 ? 'Today' : 'Tomorrow';
        
        optimalConditions.push({
          day: dayName,
          startTime,
          endTime,
          score: avgScore,
          ratingStars,
          ratingColor,
          bgGradient,
          borderColor,
          description,
          conditions: midForecast
        });
      }
    });
    
    setOptimalDriveTimes(optimalConditions);
  };

  // Generate performance tips based on actual weather data
  const generatePerformanceTips = () => {
    if (!weatherData || !automotiveData) return [];
    
    const tips = [];
    const { current } = weatherData;
    const { surfaces, performance, drivingConditions } = automotiveData;
    
    // Brake cooling efficiency
    if (performance?.brakingEfficiency < 0.9 || current?.temp > 85) {
      const coolingAdjustment = Math.round((1 / performance.brakingEfficiency - 1) * 100);
      tips.push(`Reduced brake cooling efficiency expected. Allow ${coolingAdjustment}% more cooling time between hard braking zones.`);
    }
    
    // Surface grip timing
    if (surfaces?.gripLevel) {
      tips.push(`Surface grip will peak 2-3 hours after sunrise due to optimal asphalt temperature window (${Math.round(surfaces.surfaceTemp)}°F).`);
    }
    
    // Air density effects
    if (performance?.powerAdjustment) {
      const powerAdj = Math.abs(performance.powerAdjustment);
      tips.push(`Current air density suggests ${powerAdj}% power ${performance.powerAdjustment < 0 ? 'reduction' : 'gain'}. Adjust driving style accordingly.`);
    }
    
    // If we don't have enough data-driven tips, add some based on current weather
    if (tips.length < 3 && current) {
      if (current.humidity > 80) {
        tips.push(`High humidity (${current.humidity}%) may affect intercooler efficiency on turbocharged engines.`);
      }
      
      if (current.wind_speed > 15) {
        tips.push(`Strong crosswinds (${Math.round(current.wind_speed)} mph) may affect vehicle stability at high speeds.`);
      }
      
      if (current.temp < 45) {
        tips.push(`Cold temperatures (${Math.round(current.temp)}°F) require extended warm-up for optimal tire performance.`);
      }
    }
    
    return tips.slice(0, 3); // Limit to 3 tips
  };

  // Generate engine-specific recommendations based on weather data
  const generateEngineRecommendations = () => {
    if (!weatherData || !automotiveData) return [];
    
    const recommendations = [];
    const { current } = weatherData;
    const { performance } = automotiveData;
    
    // Naturally aspirated engine recommendations
    if (performance?.powerAdjustment) {
      const powerAdj = Math.abs(performance.powerAdjustment).toFixed(1);
      recommendations.push(`For naturally aspirated engines: Expect ${powerAdj}% torque ${performance.powerAdjustment < 0 ? 'reduction' : 'increase'} due to current air density factors.`);
    }
    
    // Turbocharged engine recommendations
    if (current?.pressure) {
      const pressureEffect = ((current.pressure - 1013.25) / 1013.25 * 100).toFixed(1);
      const direction = current.pressure < 1013.25 ? 'increase' : 'decrease';
      recommendations.push(`For turbocharged engines: ${Math.abs(pressureEffect) > 1 ? `Recalibrate boost by ${Math.abs(pressureEffect).toFixed(1)}% to compensate for ${direction}d atmospheric pressure.` : 'Standard boost calibration should be optimal under current atmospheric conditions.'}`);
    }
    
    // Braking recommendations
    if (performance?.brakingEfficiency) {
      const brakeBiasAdj = ((1 - performance.brakingEfficiency) * 100 / 4).toFixed(1);
      recommendations.push(`Brake bias: ${performance.brakingEfficiency < 0.9 ? `Consider ${brakeBiasAdj}% forward adjustment to account for current surface conditions.` : 'Standard brake bias should be optimal under current surface conditions.'}`);
    }
    
    return recommendations;
  };

  // Handle vehicle selection
  const handleVehicleSelect = (e) => {
    setSelectedVehicle(e.target.value);
  };
  
  // Load vehicle-specific performance data
  const loadVehicleData = () => {
    if (!selectedVehicle || !automotiveData) return;
    
    // In a real implementation, this would fetch vehicle-specific performance data
    // or calculate it based on the vehicle's characteristics and current weather
    
    // For now, we'll generate realistic data based on the vehicle and weather
    const vehicleData = {
      powerMod: 0,
      handlingMod: 0,
      brakingMod: 0,
      vehicleTips: []
    };
    
    // Adjust based on vehicle type
    switch (selectedVehicle) {
      case '911':
        vehicleData.powerMod = automotiveData.performance?.powerAdjustment || 0;
        vehicleData.handlingMod = automotiveData.surfaces?.gripLevel === 'Low' ? -5 : (automotiveData.surfaces?.gripLevel === 'High' ? 2 : 0);
        vehicleData.brakingMod = (automotiveData.performance?.brakingEfficiency - 1) * 100 || 0;
        vehicleData.vehicleTips = [
          'Rear engine layout requires extra caution in low grip conditions',
          'Check PSM calibration for current weather conditions',
          'Optimal tire pressure: Front 34.9 psi / Rear 39.2 psi (cold)'
        ];
        break;
      case 'm3':
        vehicleData.powerMod = (automotiveData.performance?.powerAdjustment || 0) * 1.1; // Turbocharged so more affected
        vehicleData.handlingMod = automotiveData.surfaces?.gripLevel === 'Low' ? -3 : (automotiveData.surfaces?.gripLevel === 'High' ? 3 : 0);
        vehicleData.brakingMod = (automotiveData.performance?.brakingEfficiency - 1) * 110 || 0;
        vehicleData.vehicleTips = [
          'M Dynamic Mode setting should be adjusted based on current grip',
          'Increased cooling demands in higher temperatures',
          'Optimal tire pressure: Front 35.5 psi / Rear 36.0 psi (cold)'
        ];
        break;
      case 'gt':
        vehicleData.powerMod = automotiveData.performance?.powerAdjustment || 0;
        vehicleData.handlingMod = automotiveData.surfaces?.gripLevel === 'Low' ? -7 : (automotiveData.surfaces?.gripLevel === 'High' ? 1 : 0);
        vehicleData.brakingMod = (automotiveData.performance?.brakingEfficiency - 1) * 90 || 0;
        vehicleData.vehicleTips = [
          'High torque requires progressive throttle application in low grip',
          'Consider adjusting stability control for current conditions',
          'Optimal tire pressure: Front 36.0 psi / Rear 36.0 psi (cold)'
        ];
        break;
      case 'miata':
        vehicleData.powerMod = (automotiveData.performance?.powerAdjustment || 0) * 0.7; // Less affected due to lower power
        vehicleData.handlingMod = automotiveData.surfaces?.gripLevel === 'Low' ? -2 : (automotiveData.surfaces?.gripLevel === 'High' ? 4 : 0);
        vehicleData.brakingMod = (automotiveData.performance?.brakingEfficiency - 1) * 80 || 0;
        vehicleData.vehicleTips = [
          'Lightweight chassis more susceptible to crosswind effects',
          'Optimal balance maintained across most weather conditions',
          'Optimal tire pressure: Front 29.0 psi / Rear 29.0 psi (cold)'
        ];
        break;
    }
    
    setVehiclePerformanceData(vehicleData);
  };

  if (isLoading || loadingForecast) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <Loader2 className="animate-spin text-blue-500 h-12 w-12 mb-4" />
        <p className="text-blue-400 text-xl font-orbitron">Loading Weather Hub Data...</p>
        <p className="text-gray-400 mt-2">Fetching real-time automotive weather metrics</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[60vh]" id={MAIN_CONTENT_ID}>
        <AlertTriangle className="text-amber-500 h-12 w-12 mb-4" />
        <h1 className="apex-header text-3xl mb-2">Weather Hub Error</h1>
        <p className="text-gray-400 mb-6">{errorMessage}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg">
          Refresh Weather Data
        </button>
      </div>
    );
  }

  return (
    <div className="py-8" id={MAIN_CONTENT_ID}>
      {/* Page header with proper heading hierarchy */}
      <header className="mb-10 text-center">
        <h1 className="apex-header text-3xl mb-2">Paddock20™ Weather Hub</h1>
        <p className="text-gray-400">
          F1-inspired automotive weather analytics and drive recommendations
        </p>
      </header>
      
      {/* Global Time & Conditions */}
      <section className="mb-6" aria-labelledby="global-circuit-heading">
        <h2 id="global-circuit-heading" className="apex-header-green text-xl mb-4">Global Time & Conditions</h2>
        <WorldClockPanel />
      </section>
      
      {/* F1-style motorsport weather station */}
      <section className="mb-10" aria-labelledby="paddock-weather-heading">
        <h2 id="paddock-weather-heading" className="apex-header-green text-xl mb-4">Automotive Weather Dashboard</h2>
        <AutomotiveEnthusiastWeather />
      </section>
      
      {/* F1 Pit Wall Telemetry Data */}
      <section className="mb-10" aria-labelledby="f1-telemetry-heading">
        <h2 id="f1-telemetry-heading" className="apex-header-green text-xl mb-4">F1 Pit Wall Weather Telemetry</h2>
        <SimplifiedF1TelemetryPanel />
      </section>

      {/* Dynamic Drive Planner Section powered by real forecast data */}
      <section className="mt-10 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="drive-planner-heading">
        <h2 id="drive-planner-heading" className="apex-header text-xl mb-4">Upcoming Drive Planner</h2>
        
        {optimalDriveTimes.length > 0 ? (
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-green-500 font-semibold">Optimal Drive Windows</h3>
              <span className="text-xs text-gray-400">Next 48 Hours</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimalDriveTimes.map((window, index) => (
                <div key={index} className={`bg-gradient-to-r ${window.bgGradient} p-3 rounded-lg border ${window.borderColor}`}>
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{window.day}</span>
                    <span className={window.ratingColor}>{window.ratingStars}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    {window.startTime.getHours() % 12 || 12}{window.startTime.getHours() >= 12 ? 'PM' : 'AM'} - {window.endTime.getHours() % 12 || 12}{window.endTime.getHours() >= 12 ? 'PM' : 'AM'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">{window.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-6 text-center py-6">
            <p className="text-gray-400">
              {loadingForecast ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Calculating optimal drive windows...
                </span>
              ) : (
                "Unable to calculate optimal drive windows. Please check your weather data."
              )}
            </p>
          </div>
        )}
      </section>

      {/* Dynamic Tips Section powered by real weather data */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="quick-tips-heading">
        <h2 id="quick-tips-heading" className="apex-header text-xl mb-4">Weather-Based Performance Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Today's Driving Tips</h3>
            {automotiveData ? (
              <ul className="text-gray-300 text-sm space-y-2">
                {generatePerformanceTips().map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-400 text-sm">
                  {loadingForecast ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Calculating driving recommendations...
                    </span>
                  ) : (
                    "No driving tips available. Please check weather data."
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-green-500 font-semibold mb-2">Performance Adjustments</h3>
            {automotiveData ? (
              <ul className="text-gray-300 text-sm space-y-2">
                {generateEngineRecommendations().map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center py-6">
                <p className="text-gray-400 text-sm">
                  {loadingForecast ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Calculating performance adjustments...
                    </span>
                  ) : (
                    "No performance data available. Please check weather data."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Vehicle-Specific Recommendations */}
      <section className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-6" aria-labelledby="vehicle-recommendations-heading">
        <h2 id="vehicle-recommendations-heading" className="apex-header text-xl mb-4">Vehicle-Specific Recommendations</h2>
        <div className="bg-black/40 p-4 rounded-lg border border-gray-800 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
            <h3 className="text-green-500 font-semibold">Select Your Vehicle</h3>
            <div className="mt-2 sm:mt-0 flex items-center">
              <select 
                value={selectedVehicle}
                onChange={handleVehicleSelect}
                className="bg-black border border-gray-700 text-white rounded px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Select vehicle --</option>
                <option value="911">Porsche 911 Carrera S</option>
                <option value="m3">BMW M3 Competition</option>
                <option value="gt">Ford Mustang GT</option>
                <option value="miata">Mazda MX-5 Miata</option>
              </select>
              <button 
                onClick={loadVehicleData}
                disabled={!selectedVehicle || !automotiveData}
                className={`ml-2 px-3 py-1 ${
                  !selectedVehicle || !automotiveData 
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-900/50 text-blue-400 hover:bg-blue-800/50'
                } rounded text-sm`}
              >
                Load
              </button>
            </div>
          </div>
          
          {vehiclePerformanceData ? (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-black/70 p-3 rounded-lg border border-blue-900/30">
                  <div className="flex items-center mb-2">
                    <ThermometerSun className="h-4 w-4 text-blue-400 mr-2" />
                    <h4 className="text-blue-400 text-sm font-semibold">Power Output</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {vehiclePerformanceData.powerMod > 0 ? '+' : ''}{vehiclePerformanceData.powerMod.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Based on current air density and temperature</p>
                </div>
                
                <div className="bg-black/70 p-3 rounded-lg border border-green-900/30">
                  <div className="flex items-center mb-2">
                    <Wind className="h-4 w-4 text-green-400 mr-2" />
                    <h4 className="text-green-400 text-sm font-semibold">Handling</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {vehiclePerformanceData.handlingMod > 0 ? '+' : ''}{vehiclePerformanceData.handlingMod.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Based on current surface conditions and grip</p>
                </div>
                
                <div className="bg-black/70 p-3 rounded-lg border border-red-900/30">
                  <div className="flex items-center mb-2">
                    <Gauge className="h-4 w-4 text-red-400 mr-2" />
                    <h4 className="text-red-400 text-sm font-semibold">Braking</h4>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {vehiclePerformanceData.brakingMod > 0 ? '+' : ''}{vehiclePerformanceData.brakingMod.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Based on current surface temperature and moisture</p>
                </div>
              </div>
              
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-blue-400 mr-2" />
                  <h4 className="text-blue-400 text-sm font-semibold">Vehicle-Specific Notes</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {vehiclePerformanceData.vehicleTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">Select a vehicle to view tailored performance recommendations based on current weather conditions</p>
            </div>
          )}
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