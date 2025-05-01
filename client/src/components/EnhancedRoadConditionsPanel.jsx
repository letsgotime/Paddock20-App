import React, { useState, useEffect } from 'react';
import { getAirQualityData, calculateRoadRiskIndex, calculateThermalComfort } from '../services/openWeatherService';
import { useUnits } from '../contexts/UnitsContext';

function EnhancedRoadConditionsPanel({ weatherData, selectedLocation }) {
  const [airQuality, setAirQuality] = useState(null);
  const [roadRisk, setRoadRisk] = useState(null);
  const [thermalComfort, setThermalComfort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('risk');
  const { units } = useUnits();
  
  useEffect(() => {
    async function fetchAirQuality() {
      if (weatherData?.location) {
        try {
          setLoading(true);
          
          // Get Air Quality Data
          const airQualityData = await getAirQualityData({
            lat: weatherData.location.lat,
            lon: weatherData.location.lon
          });
          setAirQuality(airQualityData);
          
          // Calculate Road Risk
          const roadRiskData = calculateRoadRiskIndex(weatherData, units);
          setRoadRisk(roadRiskData);
          
          // Calculate Thermal Comfort
          const thermalComfortData = calculateThermalComfort(weatherData, units);
          setThermalComfort(thermalComfortData);
        } catch (error) {
          console.error("Error fetching road conditions data:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchAirQuality();
  }, [weatherData, units]);
  
  // Air Quality Index interpretation
  const getAQILevel = (aqi) => {
    switch(aqi) {
      case 1: return { label: 'Good', color: 'text-green-500', bg: 'bg-green-900/20' };
      case 2: return { label: 'Fair', color: 'text-blue-400', bg: 'bg-blue-900/20' };
      case 3: return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-900/20' };
      case 4: return { label: 'Poor', color: 'text-orange-500', bg: 'bg-orange-900/20' };
      case 5: return { label: 'Very Poor', color: 'text-red-500', bg: 'bg-red-900/20' };
      default: return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-900/20' };
    }
  };
  
  // Get color for pollutant level
  const getPollutantColor = (name, value) => {
    // Thresholds based on WHO guidelines
    const thresholds = {
      pm2_5: [10, 25, 50, 75],   // μg/m3
      pm10: [20, 50, 100, 150],  // μg/m3
      no2: [40, 90, 120, 230],   // μg/m3
      o3: [100, 140, 180, 240],  // μg/m3
      co: [4400, 9000, 15000, 30000], // μg/m3
      so2: [40, 80, 380, 800]    // μg/m3
    };
    
    const getColorBasedOnThreshold = (val, thresholdArray) => {
      if (val <= thresholdArray[0]) return 'text-green-500';
      if (val <= thresholdArray[1]) return 'text-blue-400';
      if (val <= thresholdArray[2]) return 'text-yellow-500';
      if (val <= thresholdArray[3]) return 'text-orange-500';
      return 'text-red-500';
    };
    
    const key = name.toLowerCase();
    if (thresholds[key]) {
      return getColorBasedOnThreshold(value, thresholds[key]);
    }
    
    return 'text-gray-400';
  };
  
  // Get color for risk level
  const getRiskColor = (riskIndex) => {
    if (riskIndex < 20) return 'text-green-500';
    if (riskIndex < 40) return 'text-blue-400';
    if (riskIndex < 60) return 'text-yellow-500';
    if (riskIndex < 80) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Get background color for risk level
  const getRiskBg = (riskIndex) => {
    if (riskIndex < 20) return 'bg-green-900/20';
    if (riskIndex < 40) return 'bg-blue-900/20';
    if (riskIndex < 60) return 'bg-yellow-900/20';
    if (riskIndex < 80) return 'bg-orange-900/20';
    return 'bg-red-900/20';
  };
  
  // Risk meter visualization
  const RiskMeter = ({ value, max = 100, label, subtitle }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const color = getRiskColor(percentage);
    
    return (
      <div className="text-center">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="relative h-2 bg-gray-700 rounded-full mb-1">
          <div 
            className={`absolute top-0 left-0 h-full rounded-full ${color.replace('text-', 'bg-')}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className={`text-sm font-medium ${color}`}>{value}{subtitle}</div>
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          ROAD CONDITIONS TELEMETRY
        </h3>
        <div className="flex justify-center py-5">
          <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!airQuality || !roadRisk || !thermalComfort) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
          <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
          ROAD CONDITIONS TELEMETRY
        </h3>
        <div className="text-gray-400 text-sm text-center py-4">
          Road conditions data unavailable
        </div>
      </div>
    );
  }
  
  // Get AQI styling
  const aqiStyle = getAQILevel(airQuality.aqi);
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
        <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
        ROAD CONDITIONS TELEMETRY {selectedLocation && `• ${selectedLocation.name}`}
      </h3>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        <button 
          className={`px-3 py-2 text-xs font-medium ${activeTab === 'risk' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('risk')}
        >
          Road Risk
        </button>
        <button 
          className={`px-3 py-2 text-xs font-medium ${activeTab === 'air' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('air')}
        >
          Air Quality
        </button>
        <button 
          className={`px-3 py-2 text-xs font-medium ${activeTab === 'thermal' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('thermal')}
        >
          Thermal Comfort
        </button>
      </div>
      
      {/* Road Risk Panel */}
      {activeTab === 'risk' && (
        <div>
          <div className="bg-gray-900/60 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-gray-400">Overall Risk Assessment</div>
              <div className={`text-xs font-medium ${getRiskColor(roadRisk.risk_index)}`}>
                {Math.round(roadRisk.risk_index)}/100
              </div>
            </div>
            
            <div className={`p-3 rounded-md ${getRiskBg(roadRisk.risk_index)} border border-${getRiskColor(roadRisk.risk_index).replace('text-', '')}-500/20 mb-3`}>
              <div className="flex justify-between">
                <div className="text-sm font-medium">{roadRisk.assessment}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <RiskMeter 
                value={roadRisk.precipitation_intensity.toFixed(1)} 
                max={10} 
                label="Precipitation" 
                subtitle=" mm/h"
              />
              <RiskMeter 
                value={Math.round(roadRisk.road_temperature)} 
                max={units === 'imperial' ? 120 : 50} 
                label="Road Temp" 
                subtitle={units === 'imperial' ? "°F" : "°C"}
              />
              <RiskMeter 
                value={(roadRisk.visibility_meters / 1000).toFixed(1)} 
                max={10} 
                label="Visibility" 
                subtitle=" km"
              />
              <RiskMeter 
                value={Math.round(roadRisk.crosswind_speed)} 
                max={units === 'imperial' ? 30 : 50} 
                label="Crosswind" 
                subtitle={units === 'imperial' ? " mph" : " km/h"}
              />
            </div>
            
            {roadRisk.alerts.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-2 text-xs">
                <div className="text-amber-400 font-semibold mb-1">DRIVER ALERTS:</div>
                <ul className="space-y-1 text-gray-300">
                  {roadRisk.alerts.map((alert, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/60 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-2">F1 Pit Wall Strategy</div>
            <div className="text-sm">
              {roadRisk.risk_index > 70 
                ? "Critical driving conditions. Extreme caution required. Adjust speed, increase following distance, and anticipate reduced grip."
                : roadRisk.risk_index > 40 
                ? "Challenging conditions detected. Reduce cornering speeds, focus on smooth inputs, and expect grip variations across the racing line."
                : "Normal driving conditions. Optimal grip and visibility. Maintain situational awareness for changing conditions."}
            </div>
          </div>
        </div>
      )}
      
      {/* Air Quality Panel */}
      {activeTab === 'air' && (
        <div>
          <div className="bg-gray-900/60 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">Air Quality Index (AQI)</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${aqiStyle.bg} ${aqiStyle.color}`}>
                {aqiStyle.label}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-800/80 p-2 rounded text-center">
                <div className="text-xs text-gray-400 mb-1">PM2.5</div>
                <div className={`text-sm font-medium ${getPollutantColor('pm2_5', airQuality.components.pm2_5)}`}>
                  {Math.round(airQuality.components.pm2_5)}
                </div>
                <div className="text-xs text-gray-500">μg/m³</div>
              </div>
              <div className="bg-gray-800/80 p-2 rounded text-center">
                <div className="text-xs text-gray-400 mb-1">PM10</div>
                <div className={`text-sm font-medium ${getPollutantColor('pm10', airQuality.components.pm10)}`}>
                  {Math.round(airQuality.components.pm10)}
                </div>
                <div className="text-xs text-gray-500">μg/m³</div>
              </div>
              <div className="bg-gray-800/80 p-2 rounded text-center">
                <div className="text-xs text-gray-400 mb-1">O₃</div>
                <div className={`text-sm font-medium ${getPollutantColor('o3', airQuality.components.o3)}`}>
                  {Math.round(airQuality.components.o3)}
                </div>
                <div className="text-xs text-gray-500">μg/m³</div>
              </div>
            </div>
            
            <div className="flex overflow-x-auto space-x-2 py-1">
              <div className="flex-shrink-0 bg-gray-800/80 p-2 rounded text-center min-w-[60px]">
                <div className="text-xs text-gray-400">NO₂</div>
                <div className={`text-sm font-medium ${getPollutantColor('no2', airQuality.components.no2)}`}>
                  {Math.round(airQuality.components.no2)}
                </div>
              </div>
              <div className="flex-shrink-0 bg-gray-800/80 p-2 rounded text-center min-w-[60px]">
                <div className="text-xs text-gray-400">SO₂</div>
                <div className={`text-sm font-medium ${getPollutantColor('so2', airQuality.components.so2)}`}>
                  {Math.round(airQuality.components.so2)}
                </div>
              </div>
              <div className="flex-shrink-0 bg-gray-800/80 p-2 rounded text-center min-w-[60px]">
                <div className="text-xs text-gray-400">CO</div>
                <div className={`text-sm font-medium ${getPollutantColor('co', airQuality.components.co)}`}>
                  {(airQuality.components.co / 1000).toFixed(1)}
                </div>
              </div>
              <div className="flex-shrink-0 bg-gray-800/80 p-2 rounded text-center min-w-[60px]">
                <div className="text-xs text-gray-400">NH₃</div>
                <div className={`text-sm font-medium`}>
                  {Math.round(airQuality.components.nh3)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900/60 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-2">Vehicle Impact Assessment</div>
            <div className="text-sm">
              {airQuality.aqi >= 4 
                ? "Poor air quality may affect engine air intake. Consider checking/replacing air filters more frequently if these conditions persist."
                : airQuality.aqi >= 3 
                ? "Moderate air quality. No immediate action required, but note that sustained exposure may increase maintenance intervals."
                : "Good air quality. Optimal conditions for engine performance and air intake systems."}
            </div>
            
            {airQuality.aqi >= 3 && (
              <div className="mt-2 text-xs bg-gray-800/80 p-2 rounded">
                <span className="text-purple-400 font-medium">F1 Telemetry Note:</span> {airQuality.aqi >= 4 
                  ? "High particulate matter may impact cooling systems over time. Monitor engine temps during extended operation."
                  : "Slight reduction in optimal performance due to air quality. Within normal operating parameters."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Thermal Comfort Panel */}
      {activeTab === 'thermal' && (
        <div>
          <div className="bg-gray-900/60 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm">Thermal Perception</div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                thermalComfort.health_risk_level === 'Extreme' ? 'bg-red-900/20 text-red-500' :
                thermalComfort.health_risk_level === 'High' ? 'bg-orange-900/20 text-orange-500' :
                thermalComfort.health_risk_level === 'Moderate' ? 'bg-yellow-900/20 text-yellow-500' :
                thermalComfort.health_risk_level === 'Low' ? 'bg-blue-900/20 text-blue-400' :
                'bg-green-900/20 text-green-500'
              }`}>
                {thermalComfort.comfort_level}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-800/80 p-2 rounded text-center">
                <div className="text-xs text-gray-400 mb-1">Heat Index</div>
                <div className="text-sm font-medium">
                  {Math.round(thermalComfort.heat_index)}°{units === 'imperial' ? 'F' : 'C'}
                </div>
                <div className="text-xs text-gray-500">Perceived in heat</div>
              </div>
              <div className="bg-gray-800/80 p-2 rounded text-center">
                <div className="text-xs text-gray-400 mb-1">Wind Chill</div>
                <div className="text-sm font-medium">
                  {Math.round(thermalComfort.wind_chill)}°{units === 'imperial' ? 'F' : 'C'}
                </div>
                <div className="text-xs text-gray-500">Perceived in cold</div>
              </div>
            </div>
            
            <div className="bg-gray-800/80 p-3 rounded text-center mb-3">
              <div className="text-xs text-gray-400 mb-1">Effective Temperature</div>
              <div className="text-2xl font-bold">
                {Math.round(thermalComfort.effective_temperature)}°{units === 'imperial' ? 'F' : 'C'}
              </div>
              <div className="text-xs text-gray-500">What it actually feels like</div>
            </div>
            
            {thermalComfort.warning && (
              <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-2 text-xs">
                <div className="text-amber-400 font-semibold mb-1">HEALTH WARNING:</div>
                <div className="text-gray-300">
                  {thermalComfort.warning}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/60 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-2">Vehicle Performance Impact</div>
            <div className="text-sm">
              {thermalComfort.comfort_level.includes('Hot') 
                ? "High ambient temperatures. Monitor engine cooling systems. Consider shorter runs for air-cooled engines."
                : thermalComfort.comfort_level.includes('Cold')
                ? "Cold conditions detected. Allow longer warm-up periods for optimal oil circulation. Monitor tire pressures which may drop in cold temperatures."
                : "Ideal thermal conditions for vehicle operation. Standard warm-up procedures sufficient."}
            </div>
            
            <div className="mt-2 text-xs bg-gray-800/80 p-2 rounded">
              <span className="text-purple-400 font-medium">Driver Advisory:</span> {
                thermalComfort.health_risk_level === 'Extreme' || thermalComfort.health_risk_level === 'High'
                  ? "Extreme thermal conditions. Keep hydrated and take frequent breaks during extended driving sessions."
                  : "Normal thermal environment. Maintain regular hydration during driving."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedRoadConditionsPanel;