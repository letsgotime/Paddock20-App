import React from 'react';

interface DrivingConditionsProps {
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    visibility: number;
  };
  surface: {
    type: string;
    temperature: number;
    condition: string;
    grip: string;
  };
  location: {
    elevation: number;
    terrain: string;
    curviness: number;
    trafficDensity: string;
  };
  time: {
    isDaytime: boolean;
    timeOfDay: string;
  };
}

const DrivingConditionsAnalyzer: React.FC<DrivingConditionsProps> = ({
  weather,
  surface,
  location,
  time
}) => {
  // Calculate overall driving risk based on conditions
  const calculateRiskLevel = () => {
    let riskScore = 0;
    
    // Weather risks
    if (weather.condition.includes('Rain') || weather.condition.includes('Drizzle')) {
      riskScore += weather.precipitation * 2;
    }
    if (weather.condition.includes('Snow') || weather.condition.includes('Sleet')) {
      riskScore += weather.precipitation * 4;
    }
    if (weather.condition.includes('Fog') || weather.condition.includes('Mist')) {
      riskScore += (100 - weather.visibility) / 10;
    }
    if (weather.windSpeed > 20) {
      riskScore += (weather.windSpeed - 20) / 5;
    }
    if (weather.temperature < 32) {
      riskScore += (32 - weather.temperature) / 5;
    }
    
    // Surface risks
    if (surface.condition === 'Wet') riskScore += 10;
    if (surface.condition === 'Icy') riskScore += 30;
    if (surface.condition === 'Snow-covered') riskScore += 25;
    if (surface.grip === 'Poor') riskScore += 15;
    if (surface.grip === 'Very Poor') riskScore += 25;
    
    // Location risks
    if (location.terrain === 'Mountainous') riskScore += 10;
    if (location.curviness > 6) riskScore += location.curviness;
    if (location.trafficDensity === 'Heavy') riskScore += 10;
    
    // Time risks
    if (!time.isDaytime) riskScore += 10;
    if (time.timeOfDay === 'Dawn' || time.timeOfDay === 'Dusk') riskScore += 5;
    
    // Calculate final risk level
    if (riskScore < 10) return { level: 'Low', score: riskScore };
    if (riskScore < 30) return { level: 'Moderate', score: riskScore };
    if (riskScore < 50) return { level: 'High', score: riskScore };
    return { level: 'Extreme', score: riskScore };
  };
  
  // Generate driving recommendations based on conditions
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Weather recommendations
    if (weather.condition.includes('Rain') || surface.condition === 'Wet') {
      recommendations.push('Reduce speed and increase following distance on wet surfaces');
      recommendations.push('Use "Wet" driving mode if available for smoother throttle response');
    }
    
    if (weather.condition.includes('Snow') || surface.condition === 'Snow-covered' || surface.condition === 'Icy') {
      recommendations.push('Extreme caution - consider snow tires or chains if available');
      recommendations.push('Gentle throttle inputs and avoid sudden maneuvers');
    }
    
    if (weather.condition.includes('Fog') || weather.visibility < 50) {
      recommendations.push('Use fog lights and reduce speed according to visibility');
      recommendations.push('Increase following distance and focus on road markings');
    }
    
    if (weather.windSpeed > 25) {
      recommendations.push('Be aware of strong crosswinds, especially on bridges');
    }
    
    // Surface recommendations
    if (surface.temperature > 100) {
      recommendations.push('Hot surface conditions - monitor tire pressures');
    }
    
    if (surface.temperature < 40) {
      recommendations.push('Cold surface may reduce grip - allow extra braking distance');
    }
    
    // Location recommendations
    if (location.curviness > 6) {
      recommendations.push('Technical route with many curves - focus on smooth inputs');
    }
    
    if (location.elevation > 5000) {
      recommendations.push('High elevation - engine power may be reduced');
    }
    
    // Time recommendations
    if (!time.isDaytime) {
      recommendations.push('Night driving requires increased vigilance and reduced speed');
    }
    
    // If conditions are good, give positive recommendation
    if (recommendations.length === 0) {
      recommendations.push('Excellent driving conditions - enjoy your drive!');
    }
    
    return recommendations;
  };
  
  const risk = calculateRiskLevel();
  const recommendations = generateRecommendations();
  
  // Helper function to get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-600';
      case 'Moderate': return 'bg-yellow-600';
      case 'High': return 'bg-orange-600';
      case 'Extreme': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Helper function to get grip icon
  const getGripIcon = (grip: string) => {
    switch (grip) {
      case 'Excellent': return '●●●●●';
      case 'Good': return '●●●●○';
      case 'Fair': return '●●●○○';
      case 'Poor': return '●●○○○';
      case 'Very Poor': return '●○○○○';
      default: return '○○○○○';
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <h3 className="text-blue-400 font-medium text-lg mb-4">Driving Conditions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Weather</p>
          <p className="text-white text-lg">{weather.condition}</p>
          <p className="text-gray-300 text-sm">{weather.temperature}°F, {weather.humidity}% humidity</p>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Surface</p>
          <p className="text-white text-lg">{surface.type}</p>
          <p className="text-gray-300 text-sm">{surface.temperature}°F, {surface.condition}</p>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Grip Level</p>
          <p className="text-white text-lg">{surface.grip}</p>
          <div className="text-sm">
            <span className={`
              ${surface.grip === 'Excellent' ? 'text-green-500' : 
                surface.grip === 'Good' ? 'text-green-400' :
                surface.grip === 'Fair' ? 'text-yellow-400' :
                surface.grip === 'Poor' ? 'text-orange-500' :
                'text-red-500'
              }
            `}>
              {getGripIcon(surface.grip)}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-1">Time</p>
          <p className="text-white text-lg">{time.timeOfDay}</p>
          <p className="text-gray-300 text-sm">{time.isDaytime ? 'Daylight' : 'Night'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1 bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs">Risk Level</p>
            <div className={`px-3 py-1 rounded-full text-xs text-white ${getRiskColor(risk.level)}`}>
              {risk.level} ({Math.round(risk.score)}/100)
            </div>
          </div>
          
          <div className="h-2 bg-gray-700 rounded-full">
            <div 
              className={`h-full rounded-full ${getRiskColor(risk.level)}`} 
              style={{ width: `${Math.min(100, risk.score)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Extreme</span>
          </div>
        </div>
        
        <div className="col-span-2 bg-gray-800 p-3 rounded-lg">
          <p className="text-gray-400 text-xs mb-2">Location Details</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-400">Elevation</p>
              <p className="text-white">{location.elevation.toLocaleString()} ft</p>
            </div>
            
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-400">Terrain</p>
              <p className="text-white">{location.terrain}</p>
            </div>
            
            <div className="bg-gray-900 p-2 rounded text-center">
              <p className="text-xs text-gray-400">Curviness</p>
              <p className="text-white">{location.curviness.toFixed(1)}/10</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-3 rounded-lg">
        <p className="text-gray-400 text-xs mb-2">Driving Recommendations</p>
        <ul className="space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index} className="text-gray-300 text-sm flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DrivingConditionsAnalyzer;