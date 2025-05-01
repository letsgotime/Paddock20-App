import React, { useState, useEffect } from 'react';

function WeatherImpactIndicator({ origin, destination, weatherData }) {
  const [impactAssessment, setImpactAssessment] = useState({
    overall: {
      score: 0,
      level: 'Calculating...',
      description: 'Analyzing weather conditions...',
      color: 'gray'
    },
    factors: []
  });
  
  useEffect(() => {
    if (weatherData && origin && destination) {
      // In a real implementation, we would make API calls to get weather along the route
      // For now, we'll create a simulated assessment based on the available weather data at the destination
      
      const calculateImpactAssessment = () => {
        // Start with a perfect score
        let overallScore = 100;
        const factors = [];
        
        // Check for precipitation
        if (weatherData.currentConditions.weather[0].main.toLowerCase().includes('rain')) {
          const rainIntensity = weatherData.currentConditions.rain ? 
            Math.min(10, weatherData.currentConditions.rain['1h'] || 1) : 1;
          
          const rainImpact = Math.round(rainIntensity * 10);
          overallScore -= rainImpact;
          
          factors.push({
            name: 'Rain',
            impact: -rainImpact,
            description: `${rainIntensity < 2 ? 'Light' : rainIntensity < 5 ? 'Moderate' : 'Heavy'} rainfall reducing visibility and grip`,
            color: 'blue'
          });
        }
        
        // Check for snow
        if (weatherData.currentConditions.weather[0].main.toLowerCase().includes('snow')) {
          const snowImpact = 35;
          overallScore -= snowImpact;
          
          factors.push({
            name: 'Snow',
            impact: -snowImpact,
            description: 'Snow conditions creating hazardous driving surface',
            color: 'blue'
          });
        }
        
        // Check for fog/mist
        if (weatherData.currentConditions.weather[0].main.toLowerCase().includes('fog') || 
            weatherData.currentConditions.weather[0].main.toLowerCase().includes('mist')) {
          const visibilityImpact = 25;
          overallScore -= visibilityImpact;
          
          factors.push({
            name: 'Low Visibility',
            impact: -visibilityImpact,
            description: 'Fog/mist reducing visibility significantly',
            color: 'gray'
          });
        }
        
        // Wind impact
        const windSpeed = weatherData.currentConditions.wind_speed;
        if (windSpeed > 20) {
          const windImpact = Math.min(20, Math.round((windSpeed - 15) / 5) * 5);
          overallScore -= windImpact;
          
          factors.push({
            name: 'High Winds',
            impact: -windImpact,
            description: `${windSpeed} mph winds affecting vehicle stability`,
            color: 'yellow'
          });
        }
        
        // Temperature impacts (extreme temps)
        const temp = weatherData.currentConditions.temp;
        if (temp < 32) {
          const coldImpact = Math.min(30, Math.round((32 - temp) / 2));
          overallScore -= coldImpact;
          
          factors.push({
            name: 'Freezing Conditions',
            impact: -coldImpact,
            description: 'Potential for ice on roadway',
            color: 'cyan'
          });
        } else if (temp > 95) {
          const heatImpact = Math.min(15, Math.round((temp - 95) / 3));
          overallScore -= heatImpact;
          
          factors.push({
            name: 'Extreme Heat',
            impact: -heatImpact,
            description: 'Heat affecting vehicle performance',
            color: 'orange'
          });
        }
        
        // Grip impact based on data 
        if (weatherData.drivingConditions && weatherData.drivingConditions.grip_index < 70) {
          const gripImpact = Math.round((70 - weatherData.drivingConditions.grip_index) / 2);
          overallScore -= gripImpact;
          
          factors.push({
            name: 'Reduced Grip',
            impact: -gripImpact,
            description: 'Road conditions affecting grip levels',
            color: 'orange'
          });
        }
        
        // Set level based on overall score
        let level, color, description;
        if (overallScore >= 90) {
          level = 'Optimal';
          color = 'green';
          description = 'Ideal driving conditions for your route';
        } else if (overallScore >= 75) {
          level = 'Good';
          color = 'green';
          description = 'Generally favorable driving conditions with minor impacts';
        } else if (overallScore >= 60) {
          level = 'Moderate';
          color = 'yellow';
          description = 'Some challenging weather conditions, drive with care';
        } else if (overallScore >= 40) {
          level = 'Challenging';
          color = 'orange';
          description = 'Difficult driving conditions, consider adjusting departure time';
        } else {
          level = 'Severe';
          color = 'red';
          description = 'Hazardous conditions, avoid travel if possible';
        }
        
        // Make sure score doesn't go below 0
        overallScore = Math.max(0, overallScore);
        
        setImpactAssessment({
          overall: {
            score: overallScore,
            level,
            color,
            description
          },
          factors
        });
      };
      
      calculateImpactAssessment();
    }
  }, [weatherData, origin, destination]);
  
  if (!origin || !destination) {
    return (
      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-2">
          <span className="h-2 w-2 bg-cyan-500 rounded-full mr-2"></span>
          WEATHER IMPACT ANALYSIS
        </h3>
        <div className="text-center py-4 text-gray-400">
          <p>Select origin and destination locations to see weather impact analysis.</p>
        </div>
      </div>
    );
  }
  
  const { overall, factors } = impactAssessment;
  
  // Get color class based on impact level
  const getColorClass = (color) => {
    switch (color) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      case 'blue': return 'text-blue-500';
      case 'cyan': return 'text-cyan-500';
      case 'gray': return 'text-gray-400';
      default: return 'text-white';
    }
  };
  
  // Get background color class based on impact level
  const getBgColorClass = (color) => {
    switch (color) {
      case 'green': return 'bg-green-500/20 border-green-500/30';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'orange': return 'bg-orange-500/20 border-orange-500/30';
      case 'red': return 'bg-red-500/20 border-red-500/30';
      case 'blue': return 'bg-blue-500/20 border-blue-500/30';
      case 'cyan': return 'bg-cyan-500/20 border-cyan-500/30';
      case 'gray': return 'bg-gray-500/20 border-gray-500/30';
      default: return 'bg-gray-700/40 border-gray-600';
    }
  };
  
  return (
    <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center mb-3">
        <span className="h-2 w-2 bg-cyan-500 rounded-full mr-2"></span>
        WEATHER IMPACT ANALYSIS
      </h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-400">Route</div>
          <div className="text-sm font-medium">
            {origin.name} → {destination.name}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${getBgColorClass(overall.color)} mb-3`}>
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-lg font-bold ${getColorClass(overall.color)}`}>
                {overall.level}
              </div>
              <div className="text-sm text-gray-300">
                {overall.description}
              </div>
            </div>
            <div className="text-3xl font-bold">
              {overall.score}<span className="text-sm text-gray-400">/100</span>
            </div>
          </div>
        </div>
      </div>
      
      {factors.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">Weather Impact Factors</div>
          <div className="space-y-2">
            {factors.map((factor, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getColorClass(factor.color)} mr-2`}></div>
                  <div>
                    <div className="font-medium">{factor.name}</div>
                    <div className="text-xs text-gray-400">{factor.description}</div>
                  </div>
                </div>
                <div className={`font-bold ${factor.impact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {factor.impact > 0 ? `+${factor.impact}` : factor.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 border-t border-gray-700 pt-3">
        <div className="text-sm flex justify-between">
          <span className="text-gray-400">Recommended time buffer:</span>
          <span className="font-medium">
            {overall.score >= 90 ? '+0 min' : 
             overall.score >= 75 ? '+5 min' : 
             overall.score >= 60 ? '+10 min' : 
             overall.score >= 40 ? '+15 min' : 
             '+30 min'}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {overall.score < 60 ? 'Consider adjusting departure time if possible' : 
           'Weather conditions are favorable for travel'}
        </div>
      </div>
    </div>
  );
}

export default WeatherImpactIndicator;