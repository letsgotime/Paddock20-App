import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface WeatherCondition {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation?: number;
  visibility?: number;
  pressure?: number;
  uvIndex?: number;
  roadTemp?: number;
}

interface WeatherDriveImpact {
  // Performance impacts
  accelerationImpact: number; // -10 to +10 scale
  brakingImpact: number; // -10 to +10 scale
  corneringImpact: number; // -10 to +10 scale
  visibilityImpact: number; // -10 to +10 scale
  tireDegradationRate: number; // 1 to 10 scale
  fuelEfficiencyImpact: number; // -10 to +10 scale
  temperatureManagement: number; // -10 to +10 scale
  overallPerformanceImpact: number; // -10 to +10 scale
  
  // Safety ratings
  roadGripRating: number; // 1 to 10 scale
  safetyRisk: number; // 1 to 10 scale
  drivingDifficultyRating: number; // 1 to 10 scale
  
  // Detailed analysis
  analysis: string;
  recommendations: string[];
}

interface WeatherDriveImpactAnalyzerProps {
  weatherData: WeatherCondition;
  vehicleType?: string;
  tireType?: string;
  drivingMode?: string;
  className?: string;
}

const WeatherDriveImpactAnalyzer: React.FC<WeatherDriveImpactAnalyzerProps> = ({
  weatherData,
  vehicleType = 'sports',
  tireType = 'performance',
  drivingMode = 'sport',
  className = ''
}) => {
  // Calculate impact of weather on various driving factors
  const calculateWeatherImpact = (): WeatherDriveImpact => {
    const { temperature, condition, humidity, windSpeed, precipitation = 0, visibility = 10 } = weatherData;
    
    // Base values, will be modified based on conditions
    let accelerationImpact = 0;
    let brakingImpact = 0;
    let corneringImpact = 0;
    let visibilityImpact = 0;
    let tireDegradationRate = 5;
    let fuelEfficiencyImpact = 0;
    let temperatureManagement = 0;
    let roadGripRating = 8;
    let safetyRisk = 3;
    let drivingDifficultyRating = 3;
    
    // Temperature impacts
    if (temperature < 40) {
      // Cold conditions
      accelerationImpact -= 2;
      brakingImpact -= 3;
      corneringImpact -= 3;
      tireDegradationRate -= 1;
      roadGripRating -= 2;
      safetyRisk += 2;
      drivingDifficultyRating += 2;
      temperatureManagement -= 2;
    } else if (temperature > 90) {
      // Hot conditions
      accelerationImpact -= 1;
      temperatureManagement -= 3;
      tireDegradationRate += 3;
      fuelEfficiencyImpact -= 2;
    } else if (temperature >= 55 && temperature <= 75) {
      // Ideal temperature range
      accelerationImpact += 1;
      brakingImpact += 1;
      corneringImpact += 1;
      temperatureManagement += 2;
    }
    
    // Weather condition impacts
    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower')) {
      const isHeavy = condition.toLowerCase().includes('heavy');
      accelerationImpact -= isHeavy ? 4 : 2;
      brakingImpact -= isHeavy ? 5 : 3;
      corneringImpact -= isHeavy ? 6 : 3;
      visibilityImpact -= isHeavy ? 5 : 2;
      roadGripRating -= isHeavy ? 5 : 3;
      safetyRisk += isHeavy ? 5 : 3;
      drivingDifficultyRating += isHeavy ? 4 : 2;
    } else if (condition.toLowerCase().includes('snow') || condition.toLowerCase().includes('ice')) {
      accelerationImpact -= 7;
      brakingImpact -= 8;
      corneringImpact -= 8;
      visibilityImpact -= 6;
      roadGripRating -= 7;
      safetyRisk += 7;
      drivingDifficultyRating += 8;
    } else if (condition.toLowerCase().includes('fog') || condition.toLowerCase().includes('mist')) {
      visibilityImpact -= 7;
      safetyRisk += 5;
      drivingDifficultyRating += 4;
    } else if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sun')) {
      visibilityImpact += 2;
      // Check if it's very hot and sunny
      if (temperature > 85) {
        temperatureManagement -= 3;
        tireDegradationRate += 2;
      }
    }
    
    // Humidity impacts
    if (humidity > 80) {
      visibilityImpact -= 1;
      roadGripRating -= 1;
    }
    
    // Wind impacts
    if (windSpeed > 15) {
      accelerationImpact -= 1;
      corneringImpact -= 2;
      drivingDifficultyRating += 2;
      safetyRisk += 1;
    } else if (windSpeed > 25) {
      accelerationImpact -= 2;
      corneringImpact -= 3;
      drivingDifficultyRating += 3;
      safetyRisk += 3;
    }
    
    // Precipitation impacts (if explicitly provided)
    if (precipitation > 0.1) {
      roadGripRating -= Math.min(5, Math.floor(precipitation * 10));
      safetyRisk += Math.min(5, Math.floor(precipitation * 10));
    }
    
    // Visibility impacts (if explicitly provided)
    if (visibility < 5) {
      visibilityImpact -= Math.min(8, (5 - visibility) * 2);
      safetyRisk += Math.min(7, (5 - visibility) * 1.5);
      drivingDifficultyRating += Math.min(6, (5 - visibility) * 1.5);
    }
    
    // Adjust for vehicle type
    if (vehicleType === 'sports' || vehicleType === 'supercar') {
      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('snow')) {
        corneringImpact -= 2;
        safetyRisk += 2;
      } else {
        corneringImpact += 2;
        accelerationImpact += 1;
      }
    } else if (vehicleType === 'suv' || vehicleType === 'truck') {
      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('snow')) {
        corneringImpact += 1;
        safetyRisk -= 1;
      } else {
        accelerationImpact -= 1;
      }
    }
    
    // Adjust for tire type
    if (tireType === 'performance') {
      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('snow')) {
        brakingImpact -= 2;
        corneringImpact -= 2;
        safetyRisk += 2;
      } else {
        brakingImpact += 2;
        corneringImpact += 2;
      }
    } else if (tireType === 'all_weather' || tireType === 'all_season') {
      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('snow')) {
        brakingImpact += 1;
        corneringImpact += 1;
        safetyRisk -= 1;
      } else {
        brakingImpact -= 1;
        corneringImpact -= 1;
      }
    } else if (tireType === 'winter') {
      if (temperature < 45) {
        brakingImpact += 3;
        corneringImpact += 2;
        safetyRisk -= 2;
      } else {
        brakingImpact -= 1;
        tireDegradationRate += 3;
      }
    }
    
    // Adjust for driving mode
    if (drivingMode === 'sport' || drivingMode === 'race') {
      accelerationImpact += 1;
      tireDegradationRate += 2;
      fuelEfficiencyImpact -= 2;
      
      if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('snow')) {
        safetyRisk += 2;
      }
    } else if (drivingMode === 'eco') {
      accelerationImpact -= 1;
      fuelEfficiencyImpact += 3;
      tireDegradationRate -= 1;
    } else if (drivingMode === 'comfort') {
      drivingDifficultyRating -= 1;
    }
    
    // Ensure values are within bounds
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    
    accelerationImpact = clamp(accelerationImpact, -10, 10);
    brakingImpact = clamp(brakingImpact, -10, 10);
    corneringImpact = clamp(corneringImpact, -10, 10);
    visibilityImpact = clamp(visibilityImpact, -10, 10);
    tireDegradationRate = clamp(tireDegradationRate, 1, 10);
    fuelEfficiencyImpact = clamp(fuelEfficiencyImpact, -10, 10);
    temperatureManagement = clamp(temperatureManagement, -10, 10);
    
    roadGripRating = clamp(roadGripRating, 1, 10);
    safetyRisk = clamp(safetyRisk, 1, 10);
    drivingDifficultyRating = clamp(drivingDifficultyRating, 1, 10);
    
    // Calculate overall performance impact
    const overallPerformanceImpact = (
      accelerationImpact + 
      brakingImpact + 
      corneringImpact + 
      visibilityImpact - 
      (tireDegradationRate - 5) + 
      fuelEfficiencyImpact + 
      temperatureManagement
    ) / 7;
    
    // Generate analysis text based on conditions
    let analysis = '';
    if (overallPerformanceImpact > 5) {
      analysis = `Excellent driving conditions with ${condition.toLowerCase()} weather at ${temperature}°F. Optimal for ${vehicleType} performance.`;
    } else if (overallPerformanceImpact > 0) {
      analysis = `Good driving conditions with ${condition.toLowerCase()} weather at ${temperature}°F. Some minor adjustments recommended for ${vehicleType} handling.`;
    } else if (overallPerformanceImpact > -5) {
      analysis = `Challenging driving conditions with ${condition.toLowerCase()} weather at ${temperature}°F. Caution advised for ${vehicleType} operation.`;
    } else {
      analysis = `Severe driving conditions with ${condition.toLowerCase()} weather at ${temperature}°F. Extreme caution required for ${vehicleType} operation.`;
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (accelerationImpact < -3) {
      recommendations.push("Apply throttle gradually to avoid wheelspin.");
    }
    
    if (brakingImpact < -3) {
      recommendations.push("Increase following distance and brake earlier than usual.");
    }
    
    if (corneringImpact < -3) {
      recommendations.push("Reduce cornering speeds and take turns with greater care.");
    }
    
    if (visibilityImpact < -3) {
      recommendations.push("Use appropriate lighting and reduce speed to match visibility.");
    }
    
    if (tireDegradationRate > 7) {
      recommendations.push("Monitor tire temperatures and pressures more frequently.");
    }
    
    if (temperatureManagement < -3) {
      recommendations.push("Be aware of potential engine temperature issues.");
    }
    
    if (safetyRisk > 7) {
      recommendations.push("Consider postponing or altering your drive plan due to high safety risks.");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Standard driving protocols are sufficient for these conditions.");
    }
    
    return {
      accelerationImpact,
      brakingImpact,
      corneringImpact,
      visibilityImpact,
      tireDegradationRate,
      fuelEfficiencyImpact,
      temperatureManagement,
      overallPerformanceImpact,
      roadGripRating,
      safetyRisk,
      drivingDifficultyRating,
      analysis,
      recommendations
    };
  };
  
  const impact = calculateWeatherImpact();
  
  // Performance impact chart data
  const performanceData = [
    { name: 'Acceleration', value: impact.accelerationImpact },
    { name: 'Braking', value: impact.brakingImpact },
    { name: 'Cornering', value: impact.corneringImpact },
    { name: 'Visibility', value: impact.visibilityImpact },
    { name: 'Fuel Eff.', value: impact.fuelEfficiencyImpact },
    { name: 'Temp Mgmt', value: impact.temperatureManagement }
  ];
  
  // Safety rating chart data
  const safetyData = [
    { name: 'Road Grip', value: impact.roadGripRating },
    { name: 'Safety Risk', value: 10 - impact.safetyRisk }, // Invert scale for visualization
    { name: 'Difficulty', value: 10 - impact.drivingDifficultyRating } // Invert scale for visualization
  ];
  
  // Generate colors based on impact values
  const getBarColor = (value: number) => {
    if (value >= 5) return '#4CAF50'; // Green
    if (value >= 0) return '#8BC34A'; // Light Green
    if (value >= -5) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };
  
  const getRatingColor = (value: number) => {
    if (value >= 8) return '#4CAF50'; // Green
    if (value >= 6) return '#8BC34A'; // Light Green
    if (value >= 4) return '#FFC107'; // Amber
    if (value >= 2) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  // Overall impact data with radar chart format
  const radarData = [
    {
      subject: 'Acceleration',
      A: (impact.accelerationImpact + 10) / 2, // Scale from -10,10 to 0,10
      fullMark: 10,
    },
    {
      subject: 'Braking',
      A: (impact.brakingImpact + 10) / 2,
      fullMark: 10,
    },
    {
      subject: 'Cornering',
      A: (impact.corneringImpact + 10) / 2,
      fullMark: 10,
    },
    {
      subject: 'Visibility',
      A: (impact.visibilityImpact + 10) / 2,
      fullMark: 10,
    },
    {
      subject: 'Efficiency',
      A: (impact.fuelEfficiencyImpact + 10) / 2,
      fullMark: 10,
    },
    {
      subject: 'Safety',
      A: 10 - impact.safetyRisk, // Invert safety risk
      fullMark: 10,
    },
  ];
  
  return (
    <div className={`bg-gray-900 p-4 rounded-lg ${className}`}>
      <h3 className="text-blue-400 font-orbitron text-lg mb-4">WEATHER IMPACT ANALYSIS</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <h4 className="text-blue-400 text-sm mb-2">Weather Conditions</h4>
          <div className="flex justify-between text-white">
            <span>{weatherData.condition}</span>
            <span>{weatherData.temperature}°F</span>
          </div>
          <div className="flex justify-between text-gray-300 text-sm mt-1">
            <span>Humidity: {weatherData.humidity}%</span>
            <span>Wind: {weatherData.windSpeed} mph</span>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <h4 className="text-blue-400 text-sm mb-2">Vehicle Setup</h4>
          <div className="flex justify-between text-white">
            <span>Vehicle: {vehicleType}</span>
            <span>Tires: {tireType}</span>
          </div>
          <div className="flex justify-between text-gray-300 text-sm mt-1">
            <span>Driving Mode: {drivingMode}</span>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg flex flex-col justify-center">
          <h4 className="text-blue-400 text-sm mb-1">Overall Performance Impact</h4>
          <div className="flex items-center justify-center">
            <div 
              className={`text-3xl font-bold ${
                impact.overallPerformanceImpact >= 5 ? 'text-green-500' :
                impact.overallPerformanceImpact >= 0 ? 'text-green-400' :
                impact.overallPerformanceImpact >= -5 ? 'text-yellow-400' :
                'text-red-500'
              }`}
            >
              {impact.overallPerformanceImpact.toFixed(1)}
            </div>
            <div className="text-gray-400 ml-2">/ 10</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div>
          <h4 className="text-blue-400 text-sm mb-3">Performance Impacts</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis type="number" domain={[-10, 10]} tick={{ fill: '#aaa' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#aaa' }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(1)} / 10`, 'Impact']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div>
          <h4 className="text-blue-400 text-sm mb-3">Safety Ratings</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#666" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa' }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#aaa' }} />
              <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip
                contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(1)} / 10`, 'Rating']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h4 className="text-blue-400 text-sm mb-2">Analysis</h4>
        <p className="text-white text-sm mb-3">{impact.analysis}</p>
        
        <h4 className="text-blue-400 text-sm mb-2">Recommendations</h4>
        <ul className="text-white text-sm list-disc pl-5">
          {impact.recommendations.map((rec, idx) => (
            <li key={idx} className="mb-1">{rec}</li>
          ))}
        </ul>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Based on real-time weather data and vehicle characteristics. Ratings are intended as guidance only.
      </div>
    </div>
  );
};

export default WeatherDriveImpactAnalyzer;