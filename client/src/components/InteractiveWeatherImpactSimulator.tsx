import React, { useState, useEffect } from 'react';
import { useWeather } from '../contexts/WeatherContext';
import { 
  Cloud, Sun, CloudRain, CloudSnow, 
  Wind, Thermometer, Gauge, Droplets,
  ChevronDown, ChevronUp, Sliders, Car,
  AlertTriangle, BarChart, ArrowRight
} from 'lucide-react';

// Define vehicle component interfaces
interface VehicleComponent {
  id: string;
  name: string;
  affected: boolean; // Is this component affected by current conditions?
  impactLevel: number; // 0-10 scale where 0 is no impact, 10 is severe impact
  description: string;
  recommendations: string[];
}

interface WeatherImpactSimulation {
  temperature: {
    value: number;
    unit: string;
    impact: string;
    affectedComponents: string[];
  };
  precipitation: {
    value: number;
    type: string;
    impact: string;
    affectedComponents: string[];
  };
  wind: {
    value: number;
    unit: string;
    impact: string;
    affectedComponents: string[];
  };
  visibility: {
    value: number;
    unit: string;
    impact: string;
    affectedComponents: string[];
  };
  road: {
    condition: string;
    tractionReduction: number;
    impact: string;
  };
  overall: {
    performanceImpact: number; // 0-100%
    handlingImpact: number; // 0-100%
    safetyRisk: number; // 0-100%
    recommendation: string;
  };
}

const InteractiveWeatherImpactSimulator: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const [selectedWeatherType, setSelectedWeatherType] = useState<string>('current');
  const [simulationResults, setSimulationResults] = useState<WeatherImpactSimulation | null>(null);
  const [showingDetails, setShowingDetails] = useState<boolean>(false);
  const [affectedComponents, setAffectedComponents] = useState<VehicleComponent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Custom weather parameters that the user can manipulate
  const [customWeather, setCustomWeather] = useState({
    temperature: 70, // °F
    precipitation: 0, // inches
    precipType: 'none', // none, rain, snow, sleet
    windSpeed: 5, // mph
    visibility: 10, // miles
  });
  
  // Slider ranges for custom settings
  const weatherRanges = {
    temperature: { min: -10, max: 120, step: 1 }, // °F
    precipitation: { min: 0, max: 4, step: 0.1 }, // inches
    windSpeed: { min: 0, max: 75, step: 1 }, // mph
    visibility: { min: 0, max: 10, step: 0.1 }, // miles
  };
  
  // Get vehicle components that can be affected by weather
  const vehicleComponents: VehicleComponent[] = [
    {
      id: 'tires',
      name: 'Tires & Traction',
      affected: false,
      impactLevel: 0,
      description: 'Weather impacts tire grip and traction on road surfaces',
      recommendations: [
        'Consider winter tires below 45°F',
        'Reduce speed by 30% in wet conditions',
        'Check pressure monthly (changes 1 PSI per 10°F change)'
      ]
    },
    {
      id: 'braking',
      name: 'Braking System',
      affected: false,
      impactLevel: 0,
      description: 'Weather affects braking distance and effectiveness',
      recommendations: [
        'Double following distance in wet conditions',
        'Triple following distance in snow/ice',
        'Test brakes gently after driving through deep water'
      ]
    },
    {
      id: 'visibility',
      name: 'Visibility Systems',
      affected: false,
      impactLevel: 0,
      description: 'Weather affects windshield, cameras, sensors and lights',
      recommendations: [
        'Replace wipers every 6 months',
        'Use rain-repellent windshield treatment',
        'Clean sensor areas regularly in winter conditions'
      ]
    },
    {
      id: 'handling',
      name: 'Handling & Stability',
      affected: false,
      impactLevel: 0,
      description: 'Weather affects vehicle stability and handling characteristics',
      recommendations: [
        'Reduce cornering speed by 50% in adverse weather',
        'Be cautious of crosswinds on bridges and open roads',
        'Adjust driving style for reduced grip conditions'
      ]
    },
    {
      id: 'powertrain',
      name: 'Powertrain Performance',
      affected: false,
      impactLevel: 0,
      description: 'Weather affects engine performance, efficiency and power delivery',
      recommendations: [
        'Allow longer warm-up time in cold weather',
        'Monitor temperature gauge in extreme heat',
        'Accelerate gradually on slippery surfaces'
      ]
    },
    {
      id: 'battery',
      name: 'Battery & Electrical',
      affected: false,
      impactLevel: 0,
      description: 'Weather affects battery performance and electrical systems',
      recommendations: [
        'Battery capacity can reduce by 50% at 0°F',
        'Test battery before winter season',
        'Limit accessory usage in extreme conditions'
      ]
    }
  ];
  
  // Function to calculate performance metrics based on weather
  const calculateWeatherImpact = (weatherParams: any): WeatherImpactSimulation => {
    // Get weather parameters
    let temp, precipType, precipAmount, windSpeed, visibility;
    let isImperial = unit === 'imperial';
    
    if (selectedWeatherType === 'current' && weatherData) {
      // Use actual weather data
      temp = weatherData.main.temp;
      precipAmount = weatherData.rain ? 
        (weatherData.rain['1h'] || weatherData.rain['3h'] || 0) : 0;
      precipType = weatherData.weather[0].main.toLowerCase();
      windSpeed = weatherData.wind.speed;
      visibility = weatherData.visibility ? weatherData.visibility / 1000 : 10; // Convert m to km
      
      // If imperial, convert km to miles for visibility
      if (isImperial) {
        visibility = visibility * 0.621371;
      }
      
      // Convert precipitation from mm to inches if imperial
      if (isImperial && precipAmount > 0) {
        precipAmount = precipAmount / 25.4;
      }
      
      if (precipType.includes('rain') || precipType.includes('drizzle')) {
        precipType = 'rain';
      } else if (precipType.includes('snow')) {
        precipType = 'snow';
      } else if (precipType.includes('sleet') || precipType.includes('hail')) {
        precipType = 'sleet';
      } else {
        precipType = 'none';
        precipAmount = 0;
      }
    } else {
      // Use custom settings
      temp = customWeather.temperature;
      precipAmount = customWeather.precipitation;
      precipType = customWeather.precipType;
      windSpeed = customWeather.windSpeed;
      visibility = customWeather.visibility;
    }

    // Calculate impact on various vehicle systems
    
    // 1. Temperature impact (extremes in either direction are bad)
    const tempOptimal = isImperial ? 70 : 21; // Optimal temp (F or C)
    const tempDeviation = Math.abs(temp - tempOptimal);
    const tempImpact = Math.min(100, (tempDeviation / (isImperial ? 50 : 28)) * 100);
    
    // Components affected by temperature
    const tempAffectedComponents = [];
    if (temp < (isImperial ? 32 : 0)) tempAffectedComponents.push('tires', 'battery', 'visibility');
    if (temp > (isImperial ? 90 : 32)) tempAffectedComponents.push('powertrain', 'battery');
    
    // 2. Precipitation impact
    let precipImpact = 0;
    const precipAffectedComponents = [];
    
    if (precipType === 'none') {
      precipImpact = 0;
    } else if (precipType === 'rain') {
      precipImpact = Math.min(100, (precipAmount / (isImperial ? 1 : 25)) * 100);
      precipAffectedComponents.push('tires', 'braking', 'visibility');
    } else if (precipType === 'snow') {
      precipImpact = Math.min(100, (precipAmount / (isImperial ? 0.5 : 12)) * 100 + 30);
      precipAffectedComponents.push('tires', 'braking', 'handling', 'visibility');
    } else if (precipType === 'sleet') {
      precipImpact = Math.min(100, (precipAmount / (isImperial ? 0.3 : 7)) * 100 + 50);
      precipAffectedComponents.push('tires', 'braking', 'handling', 'visibility');
    }
    
    // 3. Wind impact
    const windImpact = Math.min(100, (windSpeed / (isImperial ? 35 : 56)) * 100);
    const windAffectedComponents = [];
    if (windSpeed > (isImperial ? 15 : 24)) windAffectedComponents.push('handling');
    if (windSpeed > (isImperial ? 25 : 40)) windAffectedComponents.push('braking');
    
    // 4. Visibility impact
    const maxVisibility = isImperial ? 10 : 16; // miles or km
    const visibilityImpact = Math.min(100, ((maxVisibility - visibility) / maxVisibility) * 100);
    const visibilityAffectedComponents = [];
    if (visibility < (isImperial ? 5 : 8)) visibilityAffectedComponents.push('visibility');
    if (visibility < (isImperial ? 1 : 1.6)) visibilityAffectedComponents.push('handling', 'braking');
    
    // 5. Road condition impact based on all factors
    let roadCondition = 'dry';
    let tractionReduction = 0;
    
    if (precipType === 'snow' || (precipType === 'rain' && temp < (isImperial ? 32 : 0))) {
      roadCondition = 'snow/ice';
      tractionReduction = Math.min(85, 50 + precipImpact * 0.35);
    } else if (precipType === 'sleet') {
      roadCondition = 'sleet/freezing rain';
      tractionReduction = Math.min(90, 60 + precipImpact * 0.3);
    } else if (precipType === 'rain') {
      roadCondition = 'wet';
      tractionReduction = Math.min(70, 30 + precipImpact * 0.4);
    } else if (temp < (isImperial ? 32 : 0)) {
      roadCondition = 'potential black ice';
      tractionReduction = 60;
    }
    
    // 6. Calculate overall impacts
    const performanceImpact = Math.round((tempImpact * 0.3) + (precipImpact * 0.4) + (windImpact * 0.3));
    const handlingImpact = Math.round((tempImpact * 0.2) + (precipImpact * 0.3) + (windImpact * 0.3) + (visibilityImpact * 0.2));
    const safetyRisk = Math.round((tempImpact * 0.1) + (precipImpact * 0.4) + (windImpact * 0.2) + (visibilityImpact * 0.3));
    
    // 7. Generate overall recommendation
    let recommendation = '';
    if (safetyRisk < 20) {
      recommendation = 'Ideal driving conditions. Enjoy your drive.';
    } else if (safetyRisk < 40) {
      recommendation = 'Good conditions with minor adjustments needed. Proceed with normal caution.';
    } else if (safetyRisk < 60) {
      recommendation = 'Moderate impact on driving dynamics. Reduce speed by 20-30% and increase following distance.';
    } else if (safetyRisk < 80) {
      recommendation = 'Significant weather impact. Consider postponing non-essential travel or plan for extended travel time.';
    } else {
      recommendation = 'Severe conditions. Avoid driving if possible. Emergency vehicles only recommended.';
    }
    
    // Combine all unique affected components
    const allAffectedComponents = [...new Set([
      ...tempAffectedComponents,
      ...precipAffectedComponents,
      ...windAffectedComponents,
      ...visibilityAffectedComponents
    ])];
    
    // Return comprehensive simulation results
    return {
      temperature: {
        value: temp,
        unit: isImperial ? '°F' : '°C',
        impact: getImpactCategory(tempImpact),
        affectedComponents: tempAffectedComponents
      },
      precipitation: {
        value: precipAmount,
        type: precipType,
        impact: getImpactCategory(precipImpact),
        affectedComponents: precipAffectedComponents
      },
      wind: {
        value: windSpeed,
        unit: isImperial ? 'mph' : 'km/h',
        impact: getImpactCategory(windImpact),
        affectedComponents: windAffectedComponents
      },
      visibility: {
        value: visibility,
        unit: isImperial ? 'mi' : 'km',
        impact: getImpactCategory(visibilityImpact),
        affectedComponents: visibilityAffectedComponents
      },
      road: {
        condition: roadCondition,
        tractionReduction: Math.round(tractionReduction),
        impact: getImpactCategory(tractionReduction)
      },
      overall: {
        performanceImpact,
        handlingImpact,
        safetyRisk,
        recommendation
      }
    };
  };
  
  // Helper to get impact category from numerical value
  const getImpactCategory = (value: number): string => {
    if (value < 20) return 'minimal';
    if (value < 40) return 'minor';
    if (value < 60) return 'moderate';
    if (value < 80) return 'significant';
    return 'severe';
  };
  
  // Helper to get impact color from category
  const getImpactColor = (category: string): string => {
    switch (category) {
      case 'minimal': return 'text-green-400';
      case 'minor': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'significant': return 'text-orange-400';
      case 'severe': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  // Helper to get impact background from category
  const getImpactBgColor = (category: string): string => {
    switch (category) {
      case 'minimal': return 'bg-green-900/20';
      case 'minor': return 'bg-blue-900/20';
      case 'moderate': return 'bg-yellow-900/20';
      case 'significant': return 'bg-orange-900/20';
      case 'severe': return 'bg-red-900/20';
      default: return 'bg-gray-900/20';
    }
  };
  
  // Helper to get impact border from category
  const getImpactBorderColor = (category: string): string => {
    switch (category) {
      case 'minimal': return 'border-green-900/30';
      case 'minor': return 'border-blue-900/30';
      case 'moderate': return 'border-yellow-900/30';
      case 'significant': return 'border-orange-900/30';
      case 'severe': return 'border-red-900/30';
      default: return 'border-gray-900/30';
    }
  };
  
  // Helper to render the weather icon based on conditions
  const renderWeatherIcon = () => {
    if (!weatherData) return <Cloud className="w-8 h-8 text-gray-400" />;
    
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    
    if (weatherCondition.includes('thunder')) {
      return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
    } else if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    } else if (weatherCondition.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-blue-200" />;
    } else if (weatherCondition.includes('clear')) {
      return <Sun className="w-8 h-8 text-yellow-400" />;
    } else if (weatherCondition.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-gray-400" />;
    }
    
    return <Cloud className="w-8 h-8 text-gray-400" />;
  };
  
  // Run the simulation when weather data changes or custom settings change
  useEffect(() => {
    if (!weatherData && selectedWeatherType === 'current') {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Calculate the impact
      const impact = calculateWeatherImpact(
        selectedWeatherType === 'current' ? weatherData : customWeather
      );
      setSimulationResults(impact);
      
      // Update affected components with impact levels
      const updatedComponents = vehicleComponents.map(component => {
        const isAffected = impact.temperature.affectedComponents.includes(component.id) ||
                          impact.precipitation.affectedComponents.includes(component.id) ||
                          impact.wind.affectedComponents.includes(component.id) ||
                          impact.visibility.affectedComponents.includes(component.id);
        
        let impactLevel = 0;
        
        // Calculate impact level based on which weather factors affect this component
        if (impact.temperature.affectedComponents.includes(component.id)) {
          impactLevel += getImpactLevelFromCategory(impact.temperature.impact);
        }
        
        if (impact.precipitation.affectedComponents.includes(component.id)) {
          impactLevel += getImpactLevelFromCategory(impact.precipitation.impact);
        }
        
        if (impact.wind.affectedComponents.includes(component.id)) {
          impactLevel += getImpactLevelFromCategory(impact.wind.impact);
        }
        
        if (impact.visibility.affectedComponents.includes(component.id)) {
          impactLevel += getImpactLevelFromCategory(impact.visibility.impact);
        }
        
        // Average the impact if multiple factors affected this component
        const factorsCount = [
          impact.temperature.affectedComponents.includes(component.id),
          impact.precipitation.affectedComponents.includes(component.id),
          impact.wind.affectedComponents.includes(component.id),
          impact.visibility.affectedComponents.includes(component.id)
        ].filter(Boolean).length;
        
        if (factorsCount > 0) {
          impactLevel = Math.round(impactLevel / factorsCount);
        }
        
        return {
          ...component,
          affected: isAffected,
          impactLevel
        };
      });
      
      setAffectedComponents(updatedComponents);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [weatherData, selectedWeatherType, customWeather, unit]);
  
  // Helper to convert impact category to numerical level
  const getImpactLevelFromCategory = (category: string): number => {
    switch (category) {
      case 'minimal': return 2;
      case 'minor': return 4;
      case 'moderate': return 6;
      case 'significant': return 8;
      case 'severe': return 10;
      default: return 0;
    }
  };
  
  // Handle custom weather parameter change
  const handleCustomWeatherChange = (param: string, value: number | string) => {
    setCustomWeather(prev => ({
      ...prev,
      [param]: value
    }));
  };
  
  // If no weather data is available
  if (!weatherData && selectedWeatherType === 'current') {
    return (
      <div className="bg-black/20 rounded-lg p-4 border border-blue-900/30">
        <div className="flex items-center mb-3">
          <Gauge className="h-5 w-5 mr-2 text-blue-400" />
          <h3 className="text-blue-400 font-medium">Weather Impact Simulator</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">Weather data is unavailable. Please check your connection or switch to custom simulation mode.</p>
        <button
          onClick={() => setSelectedWeatherType('custom')}
          className="px-4 py-2 bg-blue-700/20 text-blue-400 rounded-md hover:bg-blue-700/40 transition-colors"
        >
          Switch to Custom Simulation
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-black/20 rounded-lg border border-blue-900/30 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900/20 to-blue-950/10 p-4">
        <div className="flex items-center">
          <Gauge className="h-5 w-5 mr-2 text-blue-400" />
          <h3 className="text-blue-400 font-medium">Interactive Weather Impact Simulator</h3>
        </div>
      </div>
      
      {/* Weather Selection Section */}
      <div className="p-4 border-b border-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <span className="text-gray-300 text-sm font-medium">Simulation Mode:</span>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedWeatherType('current')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedWeatherType === 'current' 
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/30 border border-gray-700/30'
              }`}
            >
              Current Weather
            </button>
            
            <button 
              onClick={() => setSelectedWeatherType('custom')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedWeatherType === 'custom' 
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/30 border border-gray-700/30'
              }`}
            >
              Custom Simulation
            </button>
          </div>
        </div>
        
        {/* Custom Weather Controls */}
        {selectedWeatherType === 'custom' && (
          <div className="mt-4 space-y-4 bg-black/20 p-3 rounded-lg border border-blue-900/20">
            <h4 className="text-blue-400 text-sm font-medium mb-3 flex items-center">
              <Sliders className="h-4 w-4 mr-2" />
              Adjust Weather Parameters
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Temperature ({unit === 'imperial' ? '°F' : '°C'})</label>
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 text-orange-400 mr-2" />
                  <input 
                    type="range"
                    min={weatherRanges.temperature.min}
                    max={weatherRanges.temperature.max}
                    step={weatherRanges.temperature.step}
                    value={customWeather.temperature}
                    onChange={(e) => handleCustomWeatherChange('temperature', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-gray-300 min-w-[40px] text-right">{customWeather.temperature}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Freezing</span>
                  <span>Ideal</span>
                  <span>Hot</span>
                </div>
              </div>
              
              {/* Precipitation Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Precipitation ({unit === 'imperial' ? 'in' : 'mm'})</label>
                <div className="flex items-center">
                  <CloudRain className="w-4 h-4 text-blue-400 mr-2" />
                  <input 
                    type="range"
                    min={weatherRanges.precipitation.min}
                    max={weatherRanges.precipitation.max}
                    step={weatherRanges.precipitation.step}
                    value={customWeather.precipitation}
                    onChange={(e) => handleCustomWeatherChange('precipitation', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    disabled={customWeather.precipType === 'none'}
                  />
                  <span className="ml-2 text-gray-300 min-w-[40px] text-right">
                    {customWeather.precipType === 'none' ? '-' : customWeather.precipitation.toFixed(1)}
                  </span>
                </div>
                
                {/* Precipitation Type Selector */}
                <div className="flex mt-2 space-x-2">
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      customWeather.precipType === 'none' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    onClick={() => handleCustomWeatherChange('precipType', 'none')}
                  >
                    None
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      customWeather.precipType === 'rain' 
                        ? 'bg-blue-900/50 text-blue-300' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    onClick={() => handleCustomWeatherChange('precipType', 'rain')}
                  >
                    Rain
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      customWeather.precipType === 'snow' 
                        ? 'bg-blue-900/50 text-blue-200' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    onClick={() => handleCustomWeatherChange('precipType', 'snow')}
                  >
                    Snow
                  </button>
                  <button
                    className={`px-2 py-1 text-xs rounded ${
                      customWeather.precipType === 'sleet' 
                        ? 'bg-blue-900/50 text-blue-400' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                    onClick={() => handleCustomWeatherChange('precipType', 'sleet')}
                  >
                    Sleet
                  </button>
                </div>
              </div>
              
              {/* Wind Speed Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Wind Speed ({unit === 'imperial' ? 'mph' : 'km/h'})</label>
                <div className="flex items-center">
                  <Wind className="w-4 h-4 text-blue-300 mr-2" />
                  <input 
                    type="range"
                    min={weatherRanges.windSpeed.min}
                    max={weatherRanges.windSpeed.max}
                    step={weatherRanges.windSpeed.step}
                    value={customWeather.windSpeed}
                    onChange={(e) => handleCustomWeatherChange('windSpeed', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-gray-300 min-w-[40px] text-right">{customWeather.windSpeed}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Calm</span>
                  <span>Breezy</span>
                  <span>Strong</span>
                </div>
              </div>
              
              {/* Visibility Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Visibility ({unit === 'imperial' ? 'mi' : 'km'})</label>
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 text-blue-200 mr-2" />
                  <input 
                    type="range"
                    min={weatherRanges.visibility.min}
                    max={weatherRanges.visibility.max}
                    step={weatherRanges.visibility.step}
                    value={customWeather.visibility}
                    onChange={(e) => handleCustomWeatherChange('visibility', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-2 text-gray-300 min-w-[40px] text-right">{customWeather.visibility.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Dense Fog</span>
                  <span>Limited</span>
                  <span>Clear</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Current Weather Display */}
        {selectedWeatherType === 'current' && weatherData && (
          <div className="mt-4 flex items-center bg-black/20 p-3 rounded-lg border border-blue-900/20">
            <div className="flex-shrink-0 mr-3">
              {renderWeatherIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-gray-200 font-medium">
                  {weatherData.weather[0].main}
                </h4>
                <span className="text-gray-400 text-sm">
                  {weatherData.weather[0].description}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-gray-300">
                <span className="flex items-center">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400 mr-1" />
                  {Math.round(weatherData.main.temp)}°{unit === 'imperial' ? 'F' : 'C'}
                </span>
                <span className="flex items-center">
                  <Wind className="w-3.5 h-3.5 text-blue-300 mr-1" />
                  {Math.round(weatherData.wind.speed)} {unit === 'imperial' ? 'mph' : 'km/h'}
                </span>
                <span className="flex items-center">
                  <Droplets className="w-3.5 h-3.5 text-blue-200 mr-1" />
                  {weatherData.main.humidity}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Simulation Results */}
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-400">Running simulation...</p>
        </div>
      ) : simulationResults ? (
        <div className="p-4">
          {/* Overall Impact */}
          <div className={`rounded-lg p-4 mb-6 ${
            getImpactBgColor(getImpactCategory(simulationResults.overall.safetyRisk))
          } ${
            getImpactBorderColor(getImpactCategory(simulationResults.overall.safetyRisk))
          }`}>
            <div className="flex items-center mb-2">
              <Car className="w-5 h-5 mr-2 text-blue-400" />
              <h4 className="text-gray-200 font-medium">Driving Condition Assessment</h4>
            </div>
            
            <div className="mb-3">
              <p className={`text-sm ${
                getImpactColor(getImpactCategory(simulationResults.overall.safetyRisk))
              }`}>
                {simulationResults.overall.recommendation}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Performance Impact */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Vehicle Performance</div>
                <div className="flex justify-between items-center">
                  <div className={`text-sm font-medium ${
                    getImpactColor(getImpactCategory(simulationResults.overall.performanceImpact))
                  }`}>
                    {getImpactCategory(simulationResults.overall.performanceImpact)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {simulationResults.overall.performanceImpact}% impact
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${
                      simulationResults.overall.performanceImpact < 20 ? 'bg-green-500' :
                      simulationResults.overall.performanceImpact < 40 ? 'bg-blue-500' :
                      simulationResults.overall.performanceImpact < 60 ? 'bg-yellow-500' :
                      simulationResults.overall.performanceImpact < 80 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${simulationResults.overall.performanceImpact}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Handling Impact */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Handling & Stability</div>
                <div className="flex justify-between items-center">
                  <div className={`text-sm font-medium ${
                    getImpactColor(getImpactCategory(simulationResults.overall.handlingImpact))
                  }`}>
                    {getImpactCategory(simulationResults.overall.handlingImpact)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {simulationResults.overall.handlingImpact}% impact
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${
                      simulationResults.overall.handlingImpact < 20 ? 'bg-green-500' :
                      simulationResults.overall.handlingImpact < 40 ? 'bg-blue-500' :
                      simulationResults.overall.handlingImpact < 60 ? 'bg-yellow-500' :
                      simulationResults.overall.handlingImpact < 80 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${simulationResults.overall.handlingImpact}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Safety Risk */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Safety Risk Level</div>
                <div className="flex justify-between items-center">
                  <div className={`text-sm font-medium ${
                    getImpactColor(getImpactCategory(simulationResults.overall.safetyRisk))
                  }`}>
                    {getImpactCategory(simulationResults.overall.safetyRisk)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {simulationResults.overall.safetyRisk}% risk
                  </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${
                      simulationResults.overall.safetyRisk < 20 ? 'bg-green-500' :
                      simulationResults.overall.safetyRisk < 40 ? 'bg-blue-500' :
                      simulationResults.overall.safetyRisk < 60 ? 'bg-yellow-500' :
                      simulationResults.overall.safetyRisk < 80 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${simulationResults.overall.safetyRisk}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weather Impact Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Temperature */}
            <div className="bg-black/20 rounded-lg border border-blue-900/30 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Thermometer className="w-4 h-4 mr-2 text-orange-400" />
                  <span className="text-gray-300 text-sm font-medium">Temperature</span>
                </div>
                <div className="text-gray-300">
                  {Math.round(simulationResults.temperature.value)}{simulationResults.temperature.unit}
                </div>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-500 text-xs">Impact:</div>
                <div className={`text-xs font-medium ${getImpactColor(simulationResults.temperature.impact)}`}>
                  {simulationResults.temperature.impact}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Affected systems: {simulationResults.temperature.affectedComponents.length > 0 ? 
                  simulationResults.temperature.affectedComponents.map(id => {
                    const component = vehicleComponents.find(c => c.id === id);
                    return component ? component.name : id;
                  }).join(', ') : 
                  'None'}
              </div>
            </div>
            
            {/* Precipitation */}
            <div className="bg-black/20 rounded-lg border border-blue-900/30 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <CloudRain className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-gray-300 text-sm font-medium">Precipitation</span>
                </div>
                <div className="text-gray-300 capitalize">
                  {simulationResults.precipitation.type !== 'none' ? 
                    `${simulationResults.precipitation.value.toFixed(1)} ${unit === 'imperial' ? 'in' : 'mm'} ${simulationResults.precipitation.type}` : 
                    'None'}
                </div>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-500 text-xs">Impact:</div>
                <div className={`text-xs font-medium ${getImpactColor(simulationResults.precipitation.impact)}`}>
                  {simulationResults.precipitation.impact}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Affected systems: {simulationResults.precipitation.affectedComponents.length > 0 ? 
                  simulationResults.precipitation.affectedComponents.map(id => {
                    const component = vehicleComponents.find(c => c.id === id);
                    return component ? component.name : id;
                  }).join(', ') : 
                  'None'}
              </div>
            </div>
            
            {/* Wind */}
            <div className="bg-black/20 rounded-lg border border-blue-900/30 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Wind className="w-4 h-4 mr-2 text-blue-300" />
                  <span className="text-gray-300 text-sm font-medium">Wind</span>
                </div>
                <div className="text-gray-300">
                  {Math.round(simulationResults.wind.value)} {simulationResults.wind.unit}
                </div>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-500 text-xs">Impact:</div>
                <div className={`text-xs font-medium ${getImpactColor(simulationResults.wind.impact)}`}>
                  {simulationResults.wind.impact}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Affected systems: {simulationResults.wind.affectedComponents.length > 0 ? 
                  simulationResults.wind.affectedComponents.map(id => {
                    const component = vehicleComponents.find(c => c.id === id);
                    return component ? component.name : id;
                  }).join(', ') : 
                  'None'}
              </div>
            </div>
            
            {/* Visibility */}
            <div className="bg-black/20 rounded-lg border border-blue-900/30 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Droplets className="w-4 h-4 mr-2 text-blue-200" />
                  <span className="text-gray-300 text-sm font-medium">Visibility</span>
                </div>
                <div className="text-gray-300">
                  {simulationResults.visibility.value.toFixed(1)} {simulationResults.visibility.unit}
                </div>
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-gray-500 text-xs">Impact:</div>
                <div className={`text-xs font-medium ${getImpactColor(simulationResults.visibility.impact)}`}>
                  {simulationResults.visibility.impact}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Affected systems: {simulationResults.visibility.affectedComponents.length > 0 ? 
                  simulationResults.visibility.affectedComponents.map(id => {
                    const component = vehicleComponents.find(c => c.id === id);
                    return component ? component.name : id;
                  }).join(', ') : 
                  'None'}
              </div>
            </div>
          </div>
          
          {/* Road Conditions */}
          <div className="bg-black/20 rounded-lg border border-blue-900/30 p-4 mb-6">
            <div className="flex items-center mb-3">
              <Car className="w-4 h-4 mr-2 text-blue-400" />
              <h4 className="text-gray-300 font-medium">Road Surface Conditions</h4>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="text-gray-200 mb-1 capitalize">{simulationResults.road.condition}</div>
                <div className={`text-sm ${
                  getImpactColor(simulationResults.road.impact)
                }`}>
                  {simulationResults.road.tractionReduction}% traction reduction
                </div>
              </div>
              
              <div className="mt-3 md:mt-0">
                <div className="w-full md:w-48 bg-gray-800 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      simulationResults.road.tractionReduction < 20 ? 'bg-green-500' :
                      simulationResults.road.tractionReduction < 40 ? 'bg-blue-500' :
                      simulationResults.road.tractionReduction < 60 ? 'bg-yellow-500' :
                      simulationResults.road.tractionReduction < 80 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${simulationResults.road.tractionReduction}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Optimal</span>
                  <span>Reduced</span>
                  <span>Poor</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Vehicle Components Impact */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-gray-300 font-medium flex items-center mb-3">
                <Car className="w-4 h-4 mr-2 text-blue-400" />
                Vehicle Systems Impact
              </h4>
              <button
                onClick={() => setShowingDetails(!showingDetails)}
                className="text-blue-400 text-sm flex items-center"
              >
                {showingDetails ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affectedComponents.map((component) => (
                <div 
                  key={component.id}
                  className={`rounded-lg border p-3 ${
                    component.affected ? 
                      component.impactLevel >= 8 ? 'bg-red-900/10 border-red-900/30' :
                      component.impactLevel >= 6 ? 'bg-orange-900/10 border-orange-900/30' :
                      component.impactLevel >= 4 ? 'bg-yellow-900/10 border-yellow-900/30' :
                      'bg-blue-900/10 border-blue-900/30' :
                      'bg-black/20 border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-gray-200 font-medium">{component.name}</h5>
                    {component.affected && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        component.impactLevel >= 8 ? 'bg-red-900/30 text-red-400' :
                        component.impactLevel >= 6 ? 'bg-orange-900/30 text-orange-400' :
                        component.impactLevel >= 4 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        {component.impactLevel >= 8 ? 'Severe' :
                         component.impactLevel >= 6 ? 'Significant' :
                         component.impactLevel >= 4 ? 'Moderate' :
                         'Minor'} Impact
                      </span>
                    )}
                  </div>
                  
                  {component.affected ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              component.impactLevel >= 8 ? 'bg-red-500' :
                              component.impactLevel >= 6 ? 'bg-orange-500' :
                              component.impactLevel >= 4 ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${component.impactLevel * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-xs ml-2 min-w-[24px]">
                          {component.impactLevel}/10
                        </span>
                      </div>
                      
                      {showingDetails && (
                        <div className="mt-2 pt-2 border-t border-gray-800">
                          <p className="text-xs text-gray-500 mb-2">{component.description}</p>
                          <ul className="space-y-1">
                            {component.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start text-xs text-gray-400">
                                <ArrowRight className="h-3 w-3 text-blue-500 mt-0.5 mr-1 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No significant impact from current weather
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-400">Select a simulation mode to get started</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveWeatherImpactSimulator;