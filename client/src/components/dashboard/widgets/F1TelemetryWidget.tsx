import React, { useState, useEffect } from 'react';
import { useVehicle } from '@/hooks/useVehicle';
import { Gauge, Fuel, Thermometer, Activity, Info } from 'lucide-react';

interface F1TelemetryWidgetProps {
  compact?: boolean;
}

const F1TelemetryWidget: React.FC<F1TelemetryWidgetProps> = ({ compact = false }) => {
  const { activeVehicle } = useVehicle();
  
  // State for simulated telemetry data
  const [telemetry, setTelemetry] = useState({
    rpm: 0,
    speed: 0,
    fuelLevel: 95,
    engineTemp: 180,
    tirePressures: {
      frontLeft: 32.1,
      frontRight: 31.9,
      rearLeft: 32.3,
      rearRight: 32.2
    },
    g_forces: {
      lateral: 0,
      longitudinal: 0
    },
    throttlePosition: 0,
    brakePosition: 0,
    gearPosition: 'N',
    lastLapTime: '01:24.567',
    deltaToOptimal: '+0.341',
  });
  
  // Animate telemetry data as if car is in motion
  useEffect(() => {
    // Only animate if we have an active vehicle
    if (!activeVehicle) return;
    
    // Simulation values
    let rpmValue = 800;
    let speedValue = 0;
    let throttleValue = 0;
    let brakeValue = 0;
    let gearValue = 'N';
    let lateralG = 0;
    let longitudinalG = 0;
    
    // Simulation interval - for a real app these would come from OBD or GPS data
    const interval = setInterval(() => {
      // Simple throttle-up and throttle-down simulation
      const time = Date.now() / 1000;
      const throttlePulse = (Math.sin(time / 3) + 1) / 2; // 0 to 1 value
      
      throttleValue = Math.max(0, Math.min(100, throttlePulse * 100));
      brakeValue = Math.max(0, Math.min(100, (1 - throttlePulse) * 80)); 
      
      // RPM calculation based on throttle
      const targetRpm = 800 + (throttleValue / 100) * 6500;
      rpmValue = rpmValue + (targetRpm - rpmValue) * 0.1;
      
      // Speed calculation based on RPM
      const targetSpeed = (rpmValue - 800) / 65;
      speedValue = speedValue + (targetSpeed - speedValue) * 0.05;
      
      // Determine gear based on speed
      if (speedValue < 5) {
        gearValue = 'N';
      } else if (speedValue < 20) {
        gearValue = '1';
      } else if (speedValue < 40) {
        gearValue = '2';
      } else if (speedValue < 60) {
        gearValue = '3';
      } else if (speedValue < 80) {
        gearValue = '4';
      } else if (speedValue < 100) {
        gearValue = '5';
      } else {
        gearValue = '6';
      }
      
      // G-force simulation
      lateralG = Math.sin(time / 2) * 0.8;
      longitudinalG = ((throttleValue - brakeValue) / 100) * 0.5;
      
      // Update telemetry state
      setTelemetry(prev => ({
        ...prev,
        rpm: Math.round(rpmValue),
        speed: Math.round(speedValue),
        throttlePosition: Math.round(throttleValue),
        brakePosition: Math.round(brakeValue),
        gearPosition: gearValue,
        g_forces: {
          lateral: parseFloat(lateralG.toFixed(2)),
          longitudinal: parseFloat(longitudinalG.toFixed(2))
        },
        // Slightly decrease fuel level over time
        fuelLevel: Math.max(0, prev.fuelLevel - 0.02),
        // Simulate engine temp based on RPM
        engineTemp: 180 + (rpmValue / 7300) * 30,
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [activeVehicle]);
  
  // Helper to get color for RPM gauge
  const getRpmColor = (rpm: number) => {
    if (rpm > 6500) return 'text-red-500';
    if (rpm > 5000) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // Helper to get color for temperature gauge
  const getTempColor = (temp: number) => {
    if (temp > 220) return 'text-red-500';
    if (temp > 200) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // Format tire pressure with consistent decimal places
  const formatTirePressure = (pressure: number) => {
    return pressure.toFixed(1);
  };
  
  // Format lateral G-forces (negative = left, positive = right)
  const formatLateralG = (g: number) => {
    return g < 0 ? `${Math.abs(g).toFixed(2)}L` : `${g.toFixed(2)}R`;
  };
  
  // Format longitudinal G-forces (negative = braking, positive = acceleration)
  const formatLongG = (g: number) => {
    return g < 0 ? `${Math.abs(g).toFixed(2)}B` : `${g.toFixed(2)}A`;
  };
  
  // Render a gauge visualization for RPM
  const renderRpmGauge = () => {
    const rpmPercent = Math.min(100, (telemetry.rpm / 7500) * 100);
    
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0</span>
          <span>RPM</span>
          <span>7.5k</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getRpmColor(telemetry.rpm)}`}
            style={{ width: `${rpmPercent}%`, transition: 'width 0.1s ease-out' }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Render F1-style tire pressure display
  const renderTirePressures = () => {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 p-2 bg-blue-950/30 rounded-md">
        <div className="text-xs text-gray-400">FL: <span className="text-blue-300">{formatTirePressure(telemetry.tirePressures.frontLeft)} psi</span></div>
        <div className="text-xs text-gray-400">FR: <span className="text-blue-300">{formatTirePressure(telemetry.tirePressures.frontRight)} psi</span></div>
        <div className="text-xs text-gray-400">RL: <span className="text-blue-300">{formatTirePressure(telemetry.tirePressures.rearLeft)} psi</span></div>
        <div className="text-xs text-gray-400">RR: <span className="text-blue-300">{formatTirePressure(telemetry.tirePressures.rearRight)} psi</span></div>
      </div>
    );
  };
  
  // Render compact version of the telemetry widget
  const renderCompactTelemetry = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Main telemetry display for compact view */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline">
            <div className="text-2xl font-bold text-blue-300 mr-1">{telemetry.speed}</div>
            <div className="text-xs text-gray-500">MPH</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-green-500 font-mono">{telemetry.gearPosition}</div>
            <div className="text-xs text-gray-500">GEAR</div>
          </div>
          
          <div className="flex items-baseline">
            <div className="text-sm font-semibold text-blue-300 mr-1">{Math.round(telemetry.rpm / 1000)}</div>
            <div className="text-xs text-gray-500">K RPM</div>
          </div>
        </div>
        
        {/* RPM Gauge for compact view */}
        {renderRpmGauge()}
        
        {/* Compact metrics grid */}
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="bg-blue-950/30 rounded-md p-1">
            <div className="flex items-center text-xxs text-gray-400">
              <Fuel className="h-2 w-2 mr-0.5" />
              <span>FUEL</span>
            </div>
            <div className="text-blue-300">{Math.round(telemetry.fuelLevel)}%</div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-1">
            <div className="flex items-center text-xxs text-gray-400">
              <Thermometer className="h-2 w-2 mr-0.5" />
              <span>ENG</span>
            </div>
            <div className={`${getTempColor(telemetry.engineTemp)}`}>{Math.round(telemetry.engineTemp)}°</div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-1">
            <div className="flex items-center text-xxs text-gray-400">
              <Activity className="h-2 w-2 mr-0.5 transform rotate-90" />
              <span>LAT</span>
            </div>
            <div className="text-blue-300">{formatLateralG(telemetry.g_forces.lateral)}</div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-1">
            <div className="flex items-center text-xxs text-gray-400">
              <Activity className="h-2 w-2 mr-0.5" />
              <span>LONG</span>
            </div>
            <div className="text-blue-300">{formatLongG(telemetry.g_forces.longitudinal)}</div>
          </div>
        </div>
        
        <div className="text-center mt-auto pt-1">
          <div className="text-xs text-gray-500">Simulated telemetry</div>
        </div>
      </div>
    );
  };
  
  // Render standard version of the telemetry widget
  const renderFullTelemetry = () => {
    return (
      <div className="flex flex-col">
        {/* Main telemetry display */}
        <div className="mb-4 flex items-end justify-between">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">SPEED</div>
            <div className="text-3xl font-bold text-blue-300">
              {telemetry.speed}
              <span className="text-sm ml-1">mph</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center mx-5">
            <div className="text-5xl font-bold text-green-500 font-mono">
              {telemetry.gearPosition}
            </div>
            <div className="text-xs text-gray-500">GEAR</div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-500 mb-1">RPM</div>
            <div className="text-xl font-semibold text-blue-300">
              {telemetry.rpm.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* RPM Gauge */}
        {renderRpmGauge()}
        
        {/* Throttle/Brake Position */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span>THROTTLE</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${telemetry.throttlePosition}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0%</span>
              <span>BRAKE</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: `${telemetry.brakePosition}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Secondary metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-blue-950/30 rounded-md p-2">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Fuel className="h-3 w-3 mr-1" />
              <span>FUEL</span>
            </div>
            <div className="text-blue-300 font-medium">
              {Math.round(telemetry.fuelLevel)}%
            </div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-2">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Thermometer className="h-3 w-3 mr-1" />
              <span>ENGINE</span>
            </div>
            <div className={`font-medium ${getTempColor(telemetry.engineTemp)}`}>
              {Math.round(telemetry.engineTemp)}°F
            </div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-2">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Activity className="h-3 w-3 mr-1 transform rotate-90" />
              <span>LAT-G</span>
            </div>
            <div className="text-blue-300 font-medium">
              {formatLateralG(telemetry.g_forces.lateral)}
            </div>
          </div>
          
          <div className="bg-blue-950/30 rounded-md p-2">
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <Activity className="h-3 w-3 mr-1" />
              <span>LONG-G</span>
            </div>
            <div className="text-blue-300 font-medium">
              {formatLongG(telemetry.g_forces.longitudinal)}
            </div>
          </div>
        </div>
        
        {/* Tire Pressures */}
        {renderTirePressures()}
        
        {/* Lap information */}
        <div className="mt-3 bg-green-950/20 rounded-md p-2 border-l-2 border-green-800">
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-gray-400">LAST LAP</div>
              <div className="text-green-500 font-mono font-medium">
                {telemetry.lastLapTime}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">DELTA</div>
              <div className="text-yellow-500 font-mono font-medium">
                {telemetry.deltaToOptimal}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-center">
          <Info className="h-3 w-3 text-gray-500 mr-1" />
          <span className="text-xs text-gray-500">Simulated telemetry data</span>
        </div>
      </div>
    );
  };

  // Render component with appropriate layout
  return (
    <div className="h-full">
      {activeVehicle ? (
        compact ? renderCompactTelemetry() : renderFullTelemetry()
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="bg-blue-900/30 rounded-full p-3 mb-3">
            <Gauge className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Select a vehicle to view F1-style telemetry data
          </p>
        </div>
      )}
    </div>
  );
};

export default F1TelemetryWidget;