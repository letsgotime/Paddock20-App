import React from 'react';
import { AlertTriangle, Check, X, Thermometer, Wind, CloudRain, Droplets, Sun } from 'lucide-react';

interface DrivingConditionsWidgetProps {
  weatherData: any;
}

/**
 * Driving Conditions Widget
 * 
 * A specialized widget that analyzes current weather conditions and provides 
 * driving-focused recommendations and safety alerts
 */
const DrivingConditionsWidget: React.FC<DrivingConditionsWidgetProps> = ({ weatherData }) => {
  if (!weatherData || !weatherData.weather || weatherData.weather.length === 0) {
    return null;
  }

  // Extract relevant weather data
  const temp = weatherData.main?.temp || 0;
  const windSpeed = weatherData.wind?.speed || 0;
  const weatherId = weatherData.weather[0].id;
  const humidity = weatherData.main?.humidity || 0;
  const visibility = weatherData.visibility || 10000; // Default to maximum visibility in meters
  
  // Determine driving condition status
  const getDrivingStatus = () => {
    const conditions = [];
    
    // Temperature conditions
    if (temp > 95) {
      conditions.push({
        type: 'warning',
        factor: 'temperature',
        message: 'Extreme heat can affect vehicle performance',
        icon: <Thermometer className="text-red-500" />
      });
    } else if (temp < 32) {
      conditions.push({
        type: 'warning',
        factor: 'temperature',
        message: 'Freezing conditions - black ice risk',
        icon: <Thermometer className="text-blue-500" />
      });
    } else {
      conditions.push({
        type: 'optimal',
        factor: 'temperature',
        message: 'Temperature optimal for driving',
        icon: <Thermometer className="text-green-500" />
      });
    }
    
    // Wind conditions
    if (windSpeed > 20) {
      conditions.push({
        type: 'warning',
        factor: 'wind',
        message: 'High winds may affect vehicle stability',
        icon: <Wind className="text-yellow-500" />
      });
    } else if (windSpeed > 15) {
      conditions.push({
        type: 'caution',
        factor: 'wind',
        message: 'Moderate winds - be cautious on open roads',
        icon: <Wind className="text-yellow-300" />
      });
    } else {
      conditions.push({
        type: 'optimal',
        factor: 'wind',
        message: 'Wind conditions favorable',
        icon: <Wind className="text-green-500" />
      });
    }
    
    // Precipitation/weather conditions
    if (weatherId >= 200 && weatherId < 300) {
      // Thunderstorm
      conditions.push({
        type: 'danger',
        factor: 'precipitation',
        message: 'Thunderstorms - driving not recommended',
        icon: <AlertTriangle className="text-red-500" />
      });
    } else if (weatherId >= 500 && weatherId < 600) {
      // Rain
      conditions.push({
        type: 'warning',
        factor: 'precipitation',
        message: 'Rain - reduced traction on roads',
        icon: <CloudRain className="text-yellow-500" />
      });
    } else if (weatherId >= 600 && weatherId < 700) {
      // Snow
      conditions.push({
        type: 'danger',
        factor: 'precipitation',
        message: 'Snow - winter driving techniques required',
        icon: <AlertTriangle className="text-red-500" />
      });
    } else if (weatherId >= 700 && weatherId < 800) {
      // Atmosphere (fog, mist, etc.)
      conditions.push({
        type: 'caution',
        factor: 'visibility',
        message: 'Reduced visibility - use fog lights',
        icon: <Droplets className="text-yellow-300" />
      });
    } else if (weatherId === 800) {
      // Clear
      conditions.push({
        type: 'optimal',
        factor: 'precipitation',
        message: 'Clear conditions - ideal for driving',
        icon: <Sun className="text-green-500" />
      });
    } else {
      // Clouds
      conditions.push({
        type: 'optimal',
        factor: 'precipitation',
        message: 'Partly cloudy - good driving conditions',
        icon: <Check className="text-green-500" />
      });
    }
    
    // Visibility (outside of weather codes)
    if (visibility < 1000) {
      conditions.push({
        type: 'danger',
        factor: 'visibility',
        message: 'Severely limited visibility - driving not recommended',
        icon: <AlertTriangle className="text-red-500" />
      });
    } else if (visibility < 5000) {
      conditions.push({
        type: 'warning',
        factor: 'visibility',
        message: 'Limited visibility - reduce speed',
        icon: <AlertTriangle className="text-yellow-500" />
      });
    }
    
    // Road conditions (estimated based on weather)
    if (weatherId >= 500 && weatherId < 700) {
      // Rain or snow
      conditions.push({
        type: 'warning',
        factor: 'roads',
        message: 'Roads may be slick - reduce speed',
        icon: <AlertTriangle className="text-yellow-500" />
      });
    } else if (temp < 35 && humidity > 80) {
      // Cold and humid - potential for ice
      conditions.push({
        type: 'warning',
        factor: 'roads',
        message: 'Potential for black ice in shaded areas',
        icon: <AlertTriangle className="text-yellow-500" />
      });
    } else {
      conditions.push({
        type: 'optimal',
        factor: 'roads',
        message: 'Road conditions likely favorable',
        icon: <Check className="text-green-500" />
      });
    }
    
    return conditions;
  };
  
  // Calculate overall driving status for the hero section
  const calculateOverallStatus = (conditions) => {
    if (conditions.some(c => c.type === 'danger')) {
      return {
        status: 'Not Recommended',
        class: 'bg-red-900/30 border-red-700',
        textClass: 'text-red-400',
        icon: <X className="h-7 w-7 text-red-500" />
      };
    } else if (conditions.some(c => c.type === 'warning')) {
      return {
        status: 'Proceed with Caution',
        class: 'bg-yellow-900/30 border-yellow-700',
        textClass: 'text-yellow-400',
        icon: <AlertTriangle className="h-7 w-7 text-yellow-500" />
      };
    } else if (conditions.some(c => c.type === 'caution')) {
      return {
        status: 'Good, with Minor Concerns',
        class: 'bg-blue-900/30 border-blue-700',
        textClass: 'text-blue-400',
        icon: <AlertTriangle className="h-7 w-7 text-blue-400" />
      };
    } else {
      return {
        status: 'Optimal',
        class: 'bg-green-900/30 border-green-700',
        textClass: 'text-green-400',
        icon: <Check className="h-7 w-7 text-green-500" />
      };
    }
  };
  
  // Get conditions and overall status
  const conditions = getDrivingStatus();
  const overallStatus = calculateOverallStatus(conditions);
  
  // Get specific condition items by type
  const getConditionsByType = (type) => {
    return conditions.filter(condition => condition.type === type);
  };
  
  const dangerConditions = getConditionsByType('danger');
  const warningConditions = getConditionsByType('warning');
  const cautionConditions = getConditionsByType('caution');
  const optimalConditions = getConditionsByType('optimal');
  
  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-blue-400 font-orbitron text-xl mb-4">Paddock20™ Driving Conditions</h3>
      
      {/* Overall status */}
      <div className={`flex items-center p-4 rounded-lg mb-6 ${overallStatus.class}`}>
        <div className="mr-4">
          {overallStatus.icon}
        </div>
        <div>
          <h4 className={`text-lg font-bold ${overallStatus.textClass}`}>
            Current Driving Conditions: {overallStatus.status}
          </h4>
          <p className="text-gray-300 text-sm">
            {overallStatus.status === 'Optimal' 
              ? 'Weather conditions are favorable for all types of driving activities.'
              : 'See details below for specific weather factors affecting driving conditions.'}
          </p>
        </div>
      </div>
      
      {/* Condition details */}
      <div className="space-y-4">
        {dangerConditions.length > 0 && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">High Risk Factors</h4>
            <ul className="space-y-2">
              {dangerConditions.map((condition, index) => (
                <li key={`danger-${index}`} className="flex items-center">
                  <span className="mr-2">{condition.icon}</span>
                  <span className="text-white">{condition.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {warningConditions.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Warning Factors</h4>
            <ul className="space-y-2">
              {warningConditions.map((condition, index) => (
                <li key={`warning-${index}`} className="flex items-center">
                  <span className="mr-2">{condition.icon}</span>
                  <span className="text-white">{condition.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {cautionConditions.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Caution Factors</h4>
            <ul className="space-y-2">
              {cautionConditions.map((condition, index) => (
                <li key={`caution-${index}`} className="flex items-center">
                  <span className="mr-2">{condition.icon}</span>
                  <span className="text-white">{condition.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {optimalConditions.length > 0 && (
          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">Optimal Factors</h4>
            <ul className="space-y-2">
              {optimalConditions.map((condition, index) => (
                <li key={`optimal-${index}`} className="flex items-center">
                  <span className="mr-2">{condition.icon}</span>
                  <span className="text-white">{condition.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Driver recommendations */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h4 className="text-green-500 font-semibold mb-2">Pro Driver Recommendations</h4>
        <ul className="space-y-2 text-gray-300">
          {weatherId >= 200 && weatherId < 300 && (
            <li>• Avoid driving in thunderstorms due to reduced visibility and potential for hydroplaning.</li>
          )}
          {weatherId >= 500 && weatherId < 600 && (
            <>
              <li>• Reduce speed and increase following distance on wet roads.</li>
              <li>• Avoid sudden braking or rapid acceleration.</li>
              <li>• Check that your tires have adequate tread depth for water displacement.</li>
            </>
          )}
          {weatherId >= 600 && weatherId < 700 && (
            <>
              <li>• Use winter tires if available and required.</li>
              <li>• Accelerate and decelerate slowly to maintain traction.</li>
              <li>• Increase following distance to 8-10 seconds.</li>
            </>
          )}
          {windSpeed > 15 && (
            <li>• Be alert for crosswinds, especially when passing large vehicles or on exposed bridges.</li>
          )}
          {temp > 90 && (
            <>
              <li>• Monitor engine temperature and tire pressure in extreme heat.</li>
              <li>• Consider early morning or evening drives to avoid peak heat.</li>
            </>
          )}
          {temp < 32 && (
            <>
              <li>• Allow your vehicle to warm up properly before driving.</li>
              <li>• Be especially cautious on bridges and overpasses, which freeze first.</li>
            </>
          )}
          {visibility < 5000 && (
            <>
              <li>• Use appropriate lights (low beams or fog lights) in reduced visibility.</li>
              <li>• Reduce speed and use road markings to guide you.</li>
            </>
          )}
          <li>• Always check local road conditions before setting out on any drive.</li>
        </ul>
      </div>
    </div>
  );
};

export default DrivingConditionsWidget;