import React from 'react';
import { 
  Gauge, Thermometer, Droplets, Battery, 
  Wind, Timer, RotateCw, Wrench, PaintBucket, Car, 
  Calendar, Fuel, Ruler, Activity, Map, Zap, SunMoon 
} from 'lucide-react';

/**
 * VehicleTelemetry Component
 * Displays F1-inspired technical data for a vehicle
 */
const VehicleTelemetry = ({ vehicle }) => {
  // Placeholder data for telemetry
  const telemetryData = {
    performance: {
      acceleration: { value: '4.1', unit: 'sec', label: '0-60 mph' },
      topSpeed: { value: '155', unit: 'mph', label: 'Top Speed' },
      brakingDistance: { value: '108', unit: 'ft', label: '60-0 mph' },
      quarterMile: { value: '12.2', unit: 'sec', label: '1/4 Mile' },
      lateralG: { value: '0.98', unit: 'g', label: 'Lateral G' }
    },
    engine: {
      rpm: { value: '0', unit: 'RPM', label: 'Tachometer', max: 7000 },
      temperature: { value: '194', unit: '°F', label: 'Engine Temp', warning: 220, critical: 240 },
      oilPressure: { value: '42', unit: 'psi', label: 'Oil Pressure', warning: 20, critical: 10 },
      coolantLevel: { value: '92', unit: '%', label: 'Coolant', warning: 30, critical: 15 },
      airIntake: { value: '68', unit: '°F', label: 'Intake Temp' }
    },
    fuel: {
      level: { value: '78', unit: '%', label: 'Fuel Level', warning: 20, critical: 10 },
      economy: { value: '24.3', unit: 'mpg', label: 'Fuel Economy' },
      range: { value: '348', unit: 'mi', label: 'Range' },
      consumption: { value: '4.1', unit: 'gal/hr', label: 'Consumption' }
    },
    tires: {
      pressureFR: { value: '36.1', unit: 'psi', label: 'Front Right', warning: [34, 38], critical: [32, 40] },
      pressureFL: { value: '35.9', unit: 'psi', label: 'Front Left', warning: [34, 38], critical: [32, 40] },
      pressureRR: { value: '38.2', unit: 'psi', label: 'Rear Right', warning: [34, 38], critical: [32, 40] },
      pressureRL: { value: '38.4', unit: 'psi', label: 'Rear Left', warning: [34, 38], critical: [32, 40] },
      tempFR: { value: '89', unit: '°F', label: 'FR Temp', warning: 130, critical: 150 },
      tempFL: { value: '90', unit: '°F', label: 'FL Temp', warning: 130, critical: 150 },
      tempRR: { value: '93', unit: '°F', label: 'RR Temp', warning: 130, critical: 150 },
      tempRL: { value: '92', unit: '°F', label: 'RL Temp', warning: 130, critical: 150 }
    },
    electrical: {
      batteryVoltage: { value: '12.8', unit: 'V', label: 'Battery', warning: 12.2, critical: 11.8 },
      alternatorOutput: { value: '13.9', unit: 'V', label: 'Alternator', warning: 13.0, critical: 12.5 },
      batteryCurrent: { value: '2.1', unit: 'A', label: 'Current' },
      batteryHealth: { value: '92', unit: '%', label: 'Battery Health', warning: 50, critical: 30 }
    },
    environment: {
      outsideTemp: { value: '72', unit: '°F', label: 'Outside Temp' },
      cabinTemp: { value: '68', unit: '°F', label: 'Cabin Temp' },
      humidity: { value: '45', unit: '%', label: 'Humidity' },
      altitude: { value: '412', unit: 'ft', label: 'Altitude' },
      barometer: { value: '29.92', unit: 'inHg', label: 'Pressure' }
    }
  };

  // Helper function to determine color based on warning thresholds
  const getStatusColor = (item) => {
    if (!item.warning && !item.critical) return "text-blue-400";
    
    const value = parseFloat(item.value);
    
    if (item.critical) {
      if (Array.isArray(item.critical)) {
        if (value < item.critical[0] || value > item.critical[1]) return "text-red-500";
      } else if (item.critical > item.warning) {
        if (value >= item.critical) return "text-red-500";
      } else {
        if (value <= item.critical) return "text-red-500";
      }
    }
    
    if (item.warning) {
      if (Array.isArray(item.warning)) {
        if (value < item.warning[0] || value > item.warning[1]) return "text-yellow-500";
      } else if (item.warning > item.critical) {
        if (value >= item.warning) return "text-yellow-500";
      } else {
        if (value <= item.warning) return "text-yellow-500";
      }
    }
    
    return "text-green-400";
  };

  // Helper function to render gauge
  const renderGauge = (item, icon) => {
    const colorClass = getStatusColor(item);
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
        <div className="flex justify-between w-full mb-2">
          <span className="text-gray-400 text-xs">{item.label}</span>
          {icon && React.cloneElement(icon, { className: "h-4 w-4 text-gray-400" })}
        </div>
        <div className={`text-2xl font-bold ${colorClass}`}>
          {item.value}
        </div>
        <div className="text-xs text-gray-500">{item.unit}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
          <Gauge className="h-5 w-5 mr-2" />
          Vehicle Telemetry
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          F1-inspired real-time performance monitoring and diagnostics for your {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        
        {/* Performance Section */}
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {renderGauge(telemetryData.performance.acceleration, <Timer />)}
            {renderGauge(telemetryData.performance.topSpeed, <Gauge />)}
            {renderGauge(telemetryData.performance.brakingDistance, <Ruler />)}
            {renderGauge(telemetryData.performance.quarterMile, <Activity />)}
            {renderGauge(telemetryData.performance.lateralG, <RotateCw />)}
          </div>
        </div>
        
        {/* Engine Section */}
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Engine</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {renderGauge(telemetryData.engine.rpm, <RotateCw />)}
            {renderGauge(telemetryData.engine.temperature, <Thermometer />)}
            {renderGauge(telemetryData.engine.oilPressure, <Droplets />)}
            {renderGauge(telemetryData.engine.coolantLevel, <Droplets />)}
            {renderGauge(telemetryData.engine.airIntake, <Wind />)}
          </div>
        </div>
        
        {/* Fuel Section */}
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Fuel</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {renderGauge(telemetryData.fuel.level, <Fuel />)}
            {renderGauge(telemetryData.fuel.economy, <Fuel />)}
            {renderGauge(telemetryData.fuel.range, <Map />)}
            {renderGauge(telemetryData.fuel.consumption, <Fuel />)}
          </div>
        </div>
        
        {/* Tires Section */}
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Tires</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {renderGauge(telemetryData.tires.pressureFR, <Car />)}
            {renderGauge(telemetryData.tires.pressureFL, <Car />)}
            {renderGauge(telemetryData.tires.pressureRR, <Car />)}
            {renderGauge(telemetryData.tires.pressureRL, <Car />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {renderGauge(telemetryData.tires.tempFR, <Thermometer />)}
            {renderGauge(telemetryData.tires.tempFL, <Thermometer />)}
            {renderGauge(telemetryData.tires.tempRR, <Thermometer />)}
            {renderGauge(telemetryData.tires.tempRL, <Thermometer />)}
          </div>
        </div>
        
        {/* Electrical Section */}
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Electrical</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {renderGauge(telemetryData.electrical.batteryVoltage, <Battery />)}
            {renderGauge(telemetryData.electrical.alternatorOutput, <Zap />)}
            {renderGauge(telemetryData.electrical.batteryCurrent, <Zap />)}
            {renderGauge(telemetryData.electrical.batteryHealth, <Battery />)}
          </div>
        </div>
        
        {/* Environment Section */}
        <div>
          <h3 className="text-gray-300 font-medium mb-3 border-b border-gray-800 pb-2">Environment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {renderGauge(telemetryData.environment.outsideTemp, <SunMoon />)}
            {renderGauge(telemetryData.environment.cabinTemp, <Thermometer />)}
            {renderGauge(telemetryData.environment.humidity, <Droplets />)}
            {renderGauge(telemetryData.environment.altitude, <Map />)}
            {renderGauge(telemetryData.environment.barometer, <Wind />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTelemetry;