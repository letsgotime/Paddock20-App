import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { Leaf, Gauge, BarChart3, Droplets, Wind, Thermometer, Car, Fuel, ArrowUpRight, ArrowDownRight, CloudRain } from 'lucide-react';

const EcoDrivingPerformanceTracker: React.FC = () => {
  const { weatherData, unit, forecastData } = useWeather();
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>('vehicle1');
  const [fuelEfficiencyScore, setFuelEfficiencyScore] = useState<number>(0);
  const [ecoFactors, setEcoFactors] = useState<{
    temperature: number;
    wind: number;
    precipitation: number;
    traffic: number;
    overall: number;
  }>({
    temperature: 0,
    wind: 0,
    precipitation: 0,
    traffic: 0,
    overall: 0
  });
  const [ecoTips, setEcoTips] = useState<string[]>([]);
  const [fuelSavings, setFuelSavings] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
    co2Reduction: number;
  }>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    co2Reduction: 0
  });
  const [performanceTrend, setPerformanceTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  
  // Mock vehicle data - in a real app this would come from a database or API
  const vehicles = [
    { id: 'vehicle1', name: 'Primary Vehicle', make: 'Toyota', model: 'Camry', year: 2018, mpg: 32, fuel: 'Gasoline' },
    { id: 'vehicle2', name: 'Weekend Car', make: 'Mazda', model: 'MX-5', year: 2020, mpg: 29, fuel: 'Gasoline' }
  ];
  
  // Calculate eco-driving scores based on weather conditions
  useEffect(() => {
    if (weatherData) {
      calculateEcoDrivingMetrics();
    }
  }, [weatherData, selectedVehicle]);
  
  // Calculate eco-driving metrics based on current conditions
  const calculateEcoDrivingMetrics = () => {
    if (!weatherData) return;
    
    // Vehicle selection
    const vehicle = vehicles.find(v => v.id === selectedVehicle) || vehicles[0];
    
    // Weather factors affect fuel efficiency
    const temp = weatherData.main.temp;
    const windSpeed = weatherData.wind.speed;
    const precipitation = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;
    const weatherId = weatherData.weather[0].id;
    
    // Calculate temperature impact (optimal range 50-80°F)
    let tempScore = 0;
    const tempF = unit === 'imperial' ? temp : (temp * 9/5) + 32;
    
    if (tempF >= 50 && tempF <= 80) {
      tempScore = 95; // Optimal range
    } else if (tempF < 50) {
      tempScore = 95 - ((50 - tempF) * 2); // Colder weather reduces efficiency
    } else {
      tempScore = 95 - ((tempF - 80) * 1.5); // Higher temps reduce efficiency but less severe
    }
    
    // Ensure score bounds
    tempScore = Math.max(30, Math.min(100, tempScore));
    
    // Calculate wind impact
    const windSpeedValue = unit === 'imperial' ? windSpeed : windSpeed * 2.237; // Convert m/s to mph if metric
    let windScore = 100 - (windSpeedValue * 3);
    windScore = Math.max(30, Math.min(100, windScore));
    
    // Calculate precipitation impact
    let precipScore = 100;
    if (weatherId >= 200 && weatherId < 300) {
      // Thunderstorms
      precipScore = 60;
    } else if (weatherId >= 300 && weatherId < 400) {
      // Drizzle
      precipScore = 80;
    } else if (weatherId >= 500 && weatherId < 600) {
      // Rain
      precipScore = 70;
    } else if (weatherId >= 600 && weatherId < 700) {
      // Snow
      precipScore = 50;
    } else if (weatherId >= 700 && weatherId < 800) {
      // Mist, fog, etc.
      precipScore = 75;
    }
    
    // Traffic impact (simulated - in a real app would use real traffic API)
    const hour = new Date().getHours();
    let trafficScore = 100;
    
    // Simulate rush hour impact
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      trafficScore = 65; // Rush hour
    } else if ((hour >= 6 && hour < 7) || (hour > 9 && hour <= 11) || (hour > 18 && hour <= 20)) {
      trafficScore = 80; // Busy but not peak
    }
    
    // Calculate overall eco-efficiency score
    const overallScore = Math.round((tempScore * 0.3) + (windScore * 0.2) + (precipScore * 0.3) + (trafficScore * 0.2));
    
    // Update state with new scores
    setEcoFactors({
      temperature: Math.round(tempScore),
      wind: Math.round(windScore),
      precipitation: Math.round(precipScore),
      traffic: Math.round(trafficScore),
      overall: overallScore
    });
    
    // Calculate fuel efficiency impact
    const baseMpg = vehicle.mpg;
    const adjustedMpg = Math.round(baseMpg * (overallScore / 100));
    setFuelEfficiencyScore(adjustedMpg);
    
    // Calculate potential savings
    // Assumptions: 40 miles per day average, fuel price $3.50 per gallon
    const dailyMiles = 40;
    const fuelPrice = 3.50;
    
    const normalGallons = dailyMiles / baseMpg;
    const ecoGallons = dailyMiles / adjustedMpg;
    const dailySavings = (normalGallons - ecoGallons) * fuelPrice;
    
    // Simulate using eco-driving along with weather insights
    const weeklySavings = dailySavings * 7;
    const monthlySavings = dailySavings * 30;
    
    // CO2 reduction (19.59 lbs per gallon of gasoline)
    const co2ReductionLbs = (normalGallons - ecoGallons) * 19.59 * 30; // Monthly CO2 reduction
    
    setFuelSavings({
      daily: parseFloat(dailySavings.toFixed(2)),
      weekly: parseFloat(weeklySavings.toFixed(2)),
      monthly: parseFloat(monthlySavings.toFixed(2)),
      co2Reduction: Math.round(co2ReductionLbs)
    });
    
    // Generate eco-driving tips based on conditions
    generateEcoDrivingTips(tempF, windSpeedValue, precipScore);
    
    // Simulate performance trend
    const trends = ['improving', 'declining', 'stable'];
    const randomIndex = Math.floor(Math.random() * 3);
    setPerformanceTrend(trends[randomIndex] as 'improving' | 'declining' | 'stable');
  };
  
  // Generate tips based on current conditions
  const generateEcoDrivingTips = (tempF: number, windSpeedMph: number, precipScore: number) => {
    const tips: string[] = [];
    
    // Basic Eco-Driving tips
    tips.push('Accelerate gently and maintain steady speeds to improve efficiency.');
    
    // Temperature-specific tips
    if (tempF < 40) {
      tips.push('In cold weather, limit idling to 30 seconds and drive gently until engine reaches optimal temperature.');
    } else if (tempF > 85) {
      tips.push('Use A/C sparingly on hot days and rely on cabin air when comfortable.');
    }
    
    // Wind-specific tips
    if (windSpeedMph > 15) {
      tips.push('In high winds, reduce speed to minimize air resistance and improve stability.');
    }
    
    // Precipitation-specific tips
    if (precipScore < 80) {
      tips.push('In wet conditions, avoid sudden acceleration or braking to maintain efficiency and safety.');
    }
    if (precipScore < 60) {
      tips.push('Remove excess weight from your vehicle to maximize fuel efficiency in challenging weather.');
    }
    
    // Get 3 random tips to display
    const shuffledTips = [...tips].sort(() => 0.5 - Math.random());
    setEcoTips(shuffledTips.slice(0, 3));
  };
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  // Get progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-blue-900/20 px-4 py-2 flex justify-between items-center">
        <h3 className="text-blue-400 font-semibold flex items-center">
          <Leaf className="h-4 w-4 mr-2" />
          <span>Eco-Driving Performance Tracker</span>
        </h3>
        <span className="text-xs text-gray-400">Weather-informed efficiency</span>
      </div>
      
      <div className="p-4">
        {/* Vehicle Selector */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1">Vehicle</label>
          <div className="relative">
            <select 
              className="w-full bg-black/40 border border-gray-800 rounded-md px-3 py-2 text-white appearance-none"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Car className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
        
        {/* Efficiency Score */}
        <div className="flex flex-col md:flex-row items-center bg-blue-900/10 rounded-lg p-4 border border-blue-900/30 mb-5">
          <div className="w-24 h-24 relative flex items-center justify-center mb-3 md:mb-0 md:mr-5">
            <div className="w-full h-full rounded-full border-8 border-gray-800"></div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <Gauge className="h-6 w-6 text-blue-400 mb-1" />
              <div className="text-center">
                <span className="text-white text-2xl font-bold">{fuelEfficiencyScore}</span>
                <span className="text-xs text-gray-400 block">MPG</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-blue-400 text-lg font-semibold mb-2">Weather-Adjusted Efficiency</h4>
            <p className="text-sm text-gray-300 mb-2">
              Current conditions are affecting your vehicle's efficiency. Your eco-score is{' '}
              <span className={getScoreColor(ecoFactors.overall)}>{ecoFactors.overall}%</span> of optimal.
            </p>
            <div className="flex items-center text-xs">
              <span className={`${
                performanceTrend === 'improving' ? 'text-green-400' : 
                performanceTrend === 'declining' ? 'text-red-400' : 
                'text-blue-400'
              }`}>
                {performanceTrend === 'improving' && <ArrowUpRight className="h-3 w-3 inline mr-1" />}
                {performanceTrend === 'declining' && <ArrowDownRight className="h-3 w-3 inline mr-1" />}
                {performanceTrend.charAt(0).toUpperCase() + performanceTrend.slice(1)} trend
              </span>
            </div>
          </div>
        </div>
        
        {/* Factor Breakdown */}
        <div className="mb-5">
          <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-blue-400" />
            Eco-Factors Breakdown
          </h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center">
                  <Thermometer className="h-3 w-3 mr-1" /> Temperature Impact
                </span>
                <span className={`text-xs ${getScoreColor(ecoFactors.temperature)}`}>{ecoFactors.temperature}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(ecoFactors.temperature)}`} 
                  style={{ width: `${ecoFactors.temperature}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center">
                  <Wind className="h-3 w-3 mr-1" /> Wind Resistance
                </span>
                <span className={`text-xs ${getScoreColor(ecoFactors.wind)}`}>{ecoFactors.wind}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(ecoFactors.wind)}`} 
                  style={{ width: `${ecoFactors.wind}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center">
                  <CloudRain className="h-3 w-3 mr-1" /> Weather Conditions
                </span>
                <span className={`text-xs ${getScoreColor(ecoFactors.precipitation)}`}>{ecoFactors.precipitation}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(ecoFactors.precipitation)}`} 
                  style={{ width: `${ecoFactors.precipitation}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 flex items-center">
                  <Car className="h-3 w-3 mr-1" /> Traffic Conditions
                </span>
                <span className={`text-xs ${getScoreColor(ecoFactors.traffic)}`}>{ecoFactors.traffic}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(ecoFactors.traffic)}`} 
                  style={{ width: `${ecoFactors.traffic}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Potential Savings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
            <h4 className="text-blue-400 text-sm font-semibold mb-2 flex items-center">
              <Fuel className="h-4 w-4 mr-2" /> Potential Savings
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-gray-400 text-xs">Daily</p>
                <p className="text-green-400 font-semibold">${fuelSavings.daily}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Weekly</p>
                <p className="text-green-400 font-semibold">${fuelSavings.weekly}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Monthly</p>
                <p className="text-green-400 font-semibold">${fuelSavings.monthly}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">CO2 Reduced</p>
                <p className="text-green-400 font-semibold">{fuelSavings.co2Reduction} lbs</p>
              </div>
            </div>
          </div>
          
          {/* Eco-Driving Tips */}
          <div className="bg-black/30 p-3 rounded-lg border border-gray-800">
            <h4 className="text-blue-400 text-sm font-semibold mb-2 flex items-center">
              <Leaf className="h-4 w-4 mr-2" /> Eco-Driving Tips
            </h4>
            
            <ul className="space-y-2 text-xs text-gray-300">
              {ecoTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Efficiency Note */}
        <p className="text-xs text-gray-400 mt-2">
          Weather conditions significantly impact your vehicle's fuel efficiency. Using weather-informed driving techniques can improve your MPG by up to 20% in challenging conditions.
        </p>
      </div>
    </div>
  );
};

export default EcoDrivingPerformanceTracker;