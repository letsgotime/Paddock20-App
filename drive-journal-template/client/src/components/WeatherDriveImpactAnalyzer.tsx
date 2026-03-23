import React from 'react';

interface WeatherConditions {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface PerformanceSettings {
  tirePressureAdjustment: number;
  torqueAdjustment: number;
  drivingMode: string;
  [key: string]: any;
}

interface WeatherDriveImpactAnalyzerProps {
  weatherConditions: WeatherConditions;
  performanceSettings: PerformanceSettings;
}

const WeatherDriveImpactAnalyzer: React.FC<WeatherDriveImpactAnalyzerProps> = ({
  weatherConditions,
  performanceSettings
}) => {
  // Calculate impact scores based on weather conditions and performance settings
  
  // Tire grip impact: Affected by temperature, humidity, and tire pressure adjustment
  const calculateTireGripImpact = () => {
    let baseScore = 7; // Default score for optimal conditions
    
    // Temperature impact (optimal range is 60-80°F for most performance tires)
    if (weatherConditions.temperature < 45) {
      baseScore -= 2; // Cold tires have less grip
    } else if (weatherConditions.temperature < 60) {
      baseScore -= 1; // Slightly cold
    } else if (weatherConditions.temperature > 95) {
      baseScore -= 1.5; // Very hot reduces grip due to overheating
    } else if (weatherConditions.temperature > 80) {
      baseScore -= 0.5; // Somewhat hot
    }
    
    // Humidity impact
    if (weatherConditions.humidity > 85) {
      baseScore -= 1; // Very humid conditions can reduce grip
    }
    
    // Tire pressure adjustment impact
    if (performanceSettings.tirePressureAdjustment > 0) {
      // Positive adjustment may help in cold weather
      if (weatherConditions.temperature < 60) {
        baseScore += performanceSettings.tirePressureAdjustment * 0.1;
      } else {
        // But could reduce grip in hot weather
        baseScore -= performanceSettings.tirePressureAdjustment * 0.1;
      }
    } else if (performanceSettings.tirePressureAdjustment < 0) {
      // Negative adjustment may help in hot weather
      if (weatherConditions.temperature > 80) {
        baseScore += Math.abs(performanceSettings.tirePressureAdjustment) * 0.1;
      } else {
        // But could reduce grip in cold weather
        baseScore -= Math.abs(performanceSettings.tirePressureAdjustment) * 0.1;
      }
    }
    
    // Condition impact
    if (weatherConditions.condition.includes('Rain') || 
        weatherConditions.condition.includes('Drizzle') ||
        weatherConditions.condition.includes('Snow') ||
        weatherConditions.condition.includes('Sleet')) {
      baseScore -= 3; // Wet conditions significantly reduce grip
    } else if (weatherConditions.condition.includes('Mist') || 
               weatherConditions.condition.includes('Fog')) {
      baseScore -= 1; // Misty conditions slightly reduce grip
    }
    
    // Clamp between 1-10
    return Math.max(1, Math.min(10, baseScore));
  };
  
  // Engine performance impact: Affected by temperature, air density (pressure)
  const calculateEnginePerformanceImpact = () => {
    let baseScore = 7; // Default score
    
    // Temperature impact on air density and engine cooling
    if (weatherConditions.temperature < 40) {
      baseScore += 1; // Cold, dense air is good for naturally aspirated engines
    } else if (weatherConditions.temperature > 90) {
      baseScore -= 1.5; // Hot air reduces power and challenges cooling
    } else if (weatherConditions.temperature > 80) {
      baseScore -= 0.5; // Somewhat hot
    }
    
    // Torque adjustment compensation
    if (performanceSettings.torqueAdjustment > 0) {
      baseScore += performanceSettings.torqueAdjustment * 0.1;
    }
    
    // Driving mode impact
    if (performanceSettings.drivingMode === 'Sport' || 
        performanceSettings.drivingMode === 'Sport+') {
      baseScore += 1; // Sport modes typically optimize for performance
    } else if (performanceSettings.drivingMode === 'Comfort') {
      baseScore -= 0.5; // Comfort mode may reduce responsiveness
    }
    
    // Weather condition impact
    if (weatherConditions.condition.includes('Rain') || 
        weatherConditions.condition.includes('Snow')) {
      baseScore -= 0.5; // Wet conditions may affect air intake and require caution
    }
    
    // Clamp between 1-10
    return Math.max(1, Math.min(10, baseScore));
  };
  
  // Visibility impact: Affected by weather condition, time of day
  const calculateVisibilityImpact = () => {
    let baseScore = 8; // Default score for clear days
    
    // Weather condition impact
    if (weatherConditions.condition.includes('Fog') || 
        weatherConditions.condition.includes('Mist')) {
      baseScore -= 4; // Fog severely reduces visibility
    } else if (weatherConditions.condition.includes('Heavy Rain')) {
      baseScore -= 3; // Heavy rain reduces visibility
    } else if (weatherConditions.condition.includes('Rain') || 
               weatherConditions.condition.includes('Drizzle')) {
      baseScore -= 2; // Normal rain reduces visibility somewhat
    } else if (weatherConditions.condition.includes('Snow')) {
      baseScore -= 3.5; // Snow reduces visibility
    } else if (weatherConditions.condition.includes('Haze') || 
               weatherConditions.condition.includes('Dust') || 
               weatherConditions.condition.includes('Sand')) {
      baseScore -= 2.5; // Hazy conditions reduce visibility
    } else if (weatherConditions.condition.includes('Cloudy') || 
               weatherConditions.condition.includes('Overcast')) {
      baseScore -= 0.5; // Overcast can slightly affect visibility through reduced contrast
    }
    
    // Clamp between 1-10
    return Math.max(1, Math.min(10, baseScore));
  };
  
  // Wind impact: Affected by wind speed and vehicle type
  const calculateWindImpact = () => {
    let baseScore = 9; // Default score for calm conditions
    
    // Wind speed impact
    if (weatherConditions.windSpeed > 30) {
      baseScore -= 4; // Very strong winds significantly affect handling
    } else if (weatherConditions.windSpeed > 20) {
      baseScore -= 2.5; // Strong winds affect handling
    } else if (weatherConditions.windSpeed > 10) {
      baseScore -= 1; // Moderate winds slightly affect handling
    }
    
    // Clamp between 1-10
    return Math.max(1, Math.min(10, baseScore));
  };
  
  // Driving comfort impact: Overall assessment based on all weather factors
  const calculateDrivingComfortImpact = () => {
    const tireGripScore = calculateTireGripImpact();
    const engineScore = calculateEnginePerformanceImpact();
    const visibilityScore = calculateVisibilityImpact();
    const windScore = calculateWindImpact();
    
    // Weighted average
    const weightedScore = (
      (tireGripScore * 0.3) + 
      (engineScore * 0.2) + 
      (visibilityScore * 0.3) + 
      (windScore * 0.2)
    );
    
    // Adjust based on driving mode
    let comfortAdjustment = 0;
    if (performanceSettings.drivingMode === 'Comfort') {
      comfortAdjustment = 0.5; // Comfort mode improves comfort
    } else if (performanceSettings.drivingMode === 'Sport+' || 
               performanceSettings.drivingMode === 'Track') {
      comfortAdjustment = -0.5; // Track/Sport+ modes may reduce comfort
    }
    
    // Final score
    return Math.max(1, Math.min(10, weightedScore + comfortAdjustment));
  };
  
  // Calculate the scores
  const tireGripScore = calculateTireGripImpact();
  const enginePerformanceScore = calculateEnginePerformanceImpact();
  const visibilityScore = calculateVisibilityImpact();
  const windImpactScore = calculateWindImpact();
  const drivingComfortScore = calculateDrivingComfortImpact();
  
  // Overall driving score
  const overallDrivingScore = (
    (tireGripScore * 0.25) + 
    (enginePerformanceScore * 0.2) + 
    (visibilityScore * 0.2) + 
    (windImpactScore * 0.15) + 
    (drivingComfortScore * 0.2)
  ).toFixed(1);
  
  // Determine driving recommendation
  const getDrivingRecommendation = () => {
    const score = parseFloat(overallDrivingScore);
    
    if (score >= 8.5) {
      return {
        text: "Excellent driving conditions. Ideal time for spirited driving with minimal weather concerns.",
        color: "text-green-400"
      };
    } else if (score >= 7) {
      return {
        text: "Good driving conditions. Minor weather factors to be aware of, but generally favorable.",
        color: "text-blue-400"
      };
    } else if (score >= 5.5) {
      return {
        text: "Moderate driving conditions. Some weather factors may impact performance or comfort.",
        color: "text-yellow-400"
      };
    } else if (score >= 4) {
      return {
        text: "Challenging driving conditions. Significant weather impacts requiring careful attention.",
        color: "text-orange-400"
      };
    } else {
      return {
        text: "Difficult driving conditions. Consider postponing non-essential travel or extreme caution advised.",
        color: "text-red-400"
      };
    }
  };
  
  const recommendation = getDrivingRecommendation();
  
  return (
    <div className="space-y-6">
      {/* Overall Weather Impact Score */}
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="mb-4">
          <h3 className="text-gray-300 mb-1">OVERALL WEATHER IMPACT</h3>
          <div className="inline-block relative">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="12" 
              />
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke={
                  parseFloat(overallDrivingScore) >= 8 ? "#22c55e" : 
                  parseFloat(overallDrivingScore) >= 6 ? "#3b82f6" : 
                  parseFloat(overallDrivingScore) >= 4 ? "#f59e0b" : 
                  "#ef4444"
                } 
                strokeWidth="12" 
                strokeDasharray="339.292"
                strokeDashoffset={339.292 * (1 - parseFloat(overallDrivingScore) / 10)}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{overallDrivingScore}</span>
            </div>
          </div>
        </div>
        
        <p className={`${recommendation.color} font-medium mb-2`}>
          {recommendation.text}
        </p>
        
        <div className="text-xs text-gray-400">
          Based on current weather conditions and vehicle performance settings
        </div>
      </div>
      
      {/* Detailed Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">TIRE GRIP & TRACTION</h4>
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
              style={{
                background: `conic-gradient(${
                  tireGripScore >= 8 ? "#22c55e" : 
                  tireGripScore >= 6 ? "#3b82f6" : 
                  tireGripScore >= 4 ? "#f59e0b" : 
                  "#ef4444"
                } ${tireGripScore * 10}%, #1e293b 0)`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                {tireGripScore.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm">
                {tireGripScore >= 8 
                  ? "Excellent grip" 
                  : tireGripScore >= 6 
                    ? "Good grip" 
                    : tireGripScore >= 4 
                      ? "Reduced grip" 
                      : "Poor grip"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {weatherConditions.condition.includes('Rain') || weatherConditions.condition.includes('Snow')
                  ? "Wet conditions significantly reduce tire grip"
                  : weatherConditions.temperature < 45
                    ? "Cold temperatures may result in reduced tire performance"
                    : weatherConditions.temperature > 90
                      ? "Hot temperatures may cause tire overheating"
                      : "Current conditions provide normal tire performance"}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {performanceSettings.tirePressureAdjustment !== 0 &&
              <div className="mb-1">
                • Tire pressure adjustment ({performanceSettings.tirePressureAdjustment > 0 ? '+' : ''}{performanceSettings.tirePressureAdjustment} PSI) 
                {
                  (weatherConditions.temperature < 60 && performanceSettings.tirePressureAdjustment > 0) ||
                  (weatherConditions.temperature > 80 && performanceSettings.tirePressureAdjustment < 0)
                    ? " beneficial in these conditions"
                    : " may not be optimal for these conditions"
                }
              </div>
            }
            <div className="mb-1">
              • {weatherConditions.humidity > 80 
                ? "High humidity may affect road surface grip" 
                : "Humidity levels have minimal impact on grip"}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">ENGINE PERFORMANCE</h4>
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
              style={{
                background: `conic-gradient(${
                  enginePerformanceScore >= 8 ? "#22c55e" : 
                  enginePerformanceScore >= 6 ? "#3b82f6" : 
                  enginePerformanceScore >= 4 ? "#f59e0b" : 
                  "#ef4444"
                } ${enginePerformanceScore * 10}%, #1e293b 0)`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                {enginePerformanceScore.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm">
                {enginePerformanceScore >= 8 
                  ? "Optimal power delivery" 
                  : enginePerformanceScore >= 6 
                    ? "Good power delivery" 
                    : enginePerformanceScore >= 4 
                      ? "Slightly compromised power" 
                      : "Reduced engine performance"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {weatherConditions.temperature < 40
                  ? "Cold, dense air improves engine breathing"
                  : weatherConditions.temperature > 90
                    ? "Hot temperatures may reduce power output"
                    : "Current temperatures allow normal engine operation"}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {performanceSettings.torqueAdjustment !== 0 &&
              <div className="mb-1">
                • Torque adjustment ({performanceSettings.torqueAdjustment > 0 ? '+' : ''}{performanceSettings.torqueAdjustment}%) affects power delivery
              </div>
            }
            <div className="mb-1">
              • Driving mode: {performanceSettings.drivingMode} 
              {(performanceSettings.drivingMode === 'Sport' || performanceSettings.drivingMode === 'Sport+')
                ? " - enhances throttle response"
                : performanceSettings.drivingMode === 'Comfort'
                  ? " - may reduce responsiveness"
                  : ""
              }
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">VISIBILITY CONDITIONS</h4>
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
              style={{
                background: `conic-gradient(${
                  visibilityScore >= 8 ? "#22c55e" : 
                  visibilityScore >= 6 ? "#3b82f6" : 
                  visibilityScore >= 4 ? "#f59e0b" : 
                  "#ef4444"
                } ${visibilityScore * 10}%, #1e293b 0)`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                {visibilityScore.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm">
                {visibilityScore >= 8 
                  ? "Excellent visibility" 
                  : visibilityScore >= 6 
                    ? "Good visibility" 
                    : visibilityScore >= 4 
                      ? "Moderate visibility" 
                      : "Poor visibility"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {weatherConditions.condition.includes('Fog') || weatherConditions.condition.includes('Mist')
                  ? "Fog/mist severely reduces visibility"
                  : weatherConditions.condition.includes('Rain')
                    ? "Rain reduces visibility"
                    : weatherConditions.condition.includes('Snow')
                      ? "Snow reduces visibility"
                      : "Current conditions provide good visibility"}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <div className="mb-1">
              • Conditions: {weatherConditions.condition}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-gray-300 text-sm font-medium mb-3">WIND EFFECTS</h4>
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
              style={{
                background: `conic-gradient(${
                  windImpactScore >= 8 ? "#22c55e" : 
                  windImpactScore >= 6 ? "#3b82f6" : 
                  windImpactScore >= 4 ? "#f59e0b" : 
                  "#ef4444"
                } ${windImpactScore * 10}%, #1e293b 0)`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                {windImpactScore.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm">
                {windImpactScore >= 8 
                  ? "Minimal wind impact" 
                  : windImpactScore >= 6 
                    ? "Light wind effects" 
                    : windImpactScore >= 4 
                      ? "Moderate wind impact" 
                      : "Strong wind effects"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {weatherConditions.windSpeed > 30
                  ? "Very strong winds significantly affect handling"
                  : weatherConditions.windSpeed > 20
                    ? "Strong winds affect vehicle stability"
                    : weatherConditions.windSpeed > 10
                      ? "Moderate winds have slight impact"
                      : "Current wind conditions have minimal effect"}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <div className="mb-1">
              • Wind speed: {weatherConditions.windSpeed} mph
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary and Recommendations */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-gray-300 text-sm font-medium mb-3">DRIVING COMFORT ANALYSIS</h4>
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `conic-gradient(${
                drivingComfortScore >= 8 ? "#22c55e" : 
                drivingComfortScore >= 6 ? "#3b82f6" : 
                drivingComfortScore >= 4 ? "#f59e0b" : 
                "#ef4444"
              } ${drivingComfortScore * 10}%, #1e293b 0)`
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
              {drivingComfortScore.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm">
              {drivingComfortScore >= 8 
                ? "Highly comfortable drive" 
                : drivingComfortScore >= 6 
                  ? "Comfortable drive" 
                  : drivingComfortScore >= 4 
                    ? "Moderately comfortable" 
                    : "Uncomfortable conditions"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Based on current weather factors and vehicle settings
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <h5 className="text-blue-300 text-xs font-medium">RECOMMENDATIONS</h5>
          <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
            {tireGripScore < 6 && (
              <li>
                Consider {weatherConditions.temperature < 50 
                  ? "increasing tire pressure slightly to improve warm-up time" 
                  : weatherConditions.temperature > 85 
                    ? "reducing tire pressure slightly to prevent overheating" 
                    : "adjusting driving style for reduced grip conditions"}
              </li>
            )}
            
            {visibilityScore < 7 && (
              <li>
                Reduce speed and increase following distance due to visibility limitations
              </li>
            )}
            
            {windImpactScore < 7 && (
              <li>
                Be prepared for sudden gusts, especially on exposed sections of road
              </li>
            )}
            
            {/* General recommendations based on overall conditions */}
            {parseFloat(overallDrivingScore) < 5 && (
              <li>
                Consider postponing non-essential spirited driving for better conditions
              </li>
            )}
            
            {(weatherConditions.condition.includes('Rain') || weatherConditions.condition.includes('Snow')) && (
              <li>
                Use gentle inputs for throttle, braking, and steering to maintain traction
              </li>
            )}
            
            {/* Performance settings recommendations */}
            {(weatherConditions.condition.includes('Rain') || 
              weatherConditions.condition.includes('Snow') || 
              weatherConditions.condition.includes('Ice')) && 
              performanceSettings.drivingMode === 'Sport+' && (
              <li>
                Consider switching to a less aggressive driving mode for better stability
              </li>
            )}
            
            {/* Temperature-specific recommendations */}
            {weatherConditions.temperature > 90 && (
              <li>
                Allow engine and components additional warm-up/cool-down time
              </li>
            )}
            
            {weatherConditions.temperature < 40 && (
              <li>
                Allow extra time for tires to reach optimal temperature
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeatherDriveImpactAnalyzer;