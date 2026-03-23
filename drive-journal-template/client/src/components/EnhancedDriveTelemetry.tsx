import React from 'react';

interface DriveEntry {
  id: string;
  date: string;
  title: string;
  startLocation: string;
  endLocation: string;
  waypoints: string[];
  vehicle: string;
  distanceMiles: number;
  durationMinutes: number;
  weatherConditions: any;
  routeCustomizations: any;
  performanceSettings: {
    tirePressureAdjustment: number;
    torqueAdjustment: number;
    drivingMode: string;
    vehicleSpecs?: any;
    tireSetup?: any;
    drivingProfile?: any;
    curvatureMetrics?: {
      intensity: number;
      trnRange: string;
    };
  };
  pointsOfInterest?: {
    events: any[];
    culturalSpots: any[];
  };
  notes?: string;
  photos?: string[];
  rating?: number;
  isFromRoutePlanner: boolean;
}

interface EnhancedDriveTelemetryProps {
  driveEntry: DriveEntry;
}

const EnhancedDriveTelemetry: React.FC<EnhancedDriveTelemetryProps> = ({ driveEntry }) => {
  // Extract relevant data from the drive entry
  const { performanceSettings, vehicle, distanceMiles, durationMinutes } = driveEntry;
  
  // Calculate derived metrics
  const averageSpeed = distanceMiles > 0 && durationMinutes > 0
    ? (distanceMiles / (durationMinutes / 60)).toFixed(1)
    : 0;
    
  // Get vehicle specs if available
  const vehicleSpecs = performanceSettings.vehicleSpecs || {};
  const horsePower = vehicleSpecs.horsePower || '--';
  const torque = vehicleSpecs.torque || '--';
  const weight = vehicleSpecs.weight || '--';
  
  // Get tire setup if available
  const tireSetup = performanceSettings.tireSetup || {};
  const tireModel = tireSetup.model || 'Standard';
  const tireType = tireSetup.type || 'All Season';
  const tirePressure = tireSetup.pressure
    ? `${tireSetup.pressure + (performanceSettings.tirePressureAdjustment || 0)} PSI`
    : `Adjustment: ${performanceSettings.tirePressureAdjustment || 0} PSI`;
    
  // Get driving profile if available
  const drivingProfile = performanceSettings.drivingProfile || {};
  const throttleResponse = drivingProfile.throttleResponse || 5;
  const suspensionStiffness = drivingProfile.suspensionStiffness || 5;
  const steeringWeight = drivingProfile.steeringWeight || 5;
  const tractionControl = drivingProfile.tractionControl || 5;
  
  return (
    <div className="space-y-6">
      {/* Vehicle Performance Overview */}
      <div className="bg-gray-800/80 rounded-lg p-4">
        <h4 className="text-gray-300 text-sm font-medium mb-3">VEHICLE PERFORMANCE</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-900 rounded p-3 text-center">
            <p className="text-blue-400 text-lg font-medium">{vehicle}</p>
            <p className="text-gray-400 text-xs">Vehicle</p>
          </div>
          <div className="bg-gray-900 rounded p-3 text-center">
            <p className="text-blue-400 text-lg font-medium">{performanceSettings.drivingMode}</p>
            <p className="text-gray-400 text-xs">Driving Mode</p>
          </div>
          <div className="bg-gray-900 rounded p-3 text-center">
            <p className="text-green-400 text-lg font-medium">{averageSpeed}</p>
            <p className="text-gray-400 text-xs">Avg Speed (mph)</p>
          </div>
          <div className="bg-gray-900 rounded p-3 text-center">
            <p className="text-yellow-400 text-lg font-medium">{tirePressure}</p>
            <p className="text-gray-400 text-xs">Tire Pressure</p>
          </div>
        </div>
        
        {/* Vehicle specs if available */}
        {Object.keys(vehicleSpecs).length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-black/50 rounded p-2 text-center">
              <p className="text-blue-300 text-base font-medium">{horsePower}</p>
              <p className="text-gray-400 text-xs">Horsepower</p>
            </div>
            <div className="bg-black/50 rounded p-2 text-center">
              <p className="text-blue-300 text-base font-medium">{torque}</p>
              <p className="text-gray-400 text-xs">Torque (lb-ft)</p>
            </div>
            <div className="bg-black/50 rounded p-2 text-center">
              <p className="text-blue-300 text-base font-medium">{weight}</p>
              <p className="text-gray-400 text-xs">Weight (lbs)</p>
            </div>
          </div>
        )}
        
        {/* Tire information */}
        <div className="bg-black/40 rounded-lg p-3 mb-4">
          <h5 className="text-blue-300 text-xs font-medium mb-2">TIRE SETUP</h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Model:</span>
              <p className="text-white">{tireModel}</p>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <p className="text-white">{tireType}</p>
            </div>
            <div>
              <span className="text-gray-400">Pressure:</span>
              <p className="text-white">{tirePressure}</p>
            </div>
          </div>
        </div>
        
        {/* Performance adjustments */}
        <div className="space-y-3">
          <h5 className="text-blue-300 text-xs font-medium">PERFORMANCE PROFILE</h5>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Throttle Response</span>
              <span className="text-blue-300 text-xs">{throttleResponse}/10</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${throttleResponse * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Suspension Stiffness</span>
              <span className="text-blue-300 text-xs">{suspensionStiffness}/10</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500" 
                style={{ width: `${suspensionStiffness * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Steering Weight</span>
              <span className="text-blue-300 text-xs">{steeringWeight}/10</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500" 
                style={{ width: `${steeringWeight * 10}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">Traction Control</span>
              <span className="text-blue-300 text-xs">{tractionControl}/10</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500" 
                style={{ width: `${tractionControl * 10}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Driving Dynamics */}
      <div className="bg-gray-800/80 rounded-lg p-4">
        <h4 className="text-gray-300 text-sm font-medium mb-3">DRIVING DYNAMICS</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Torque Adjustment */}
          <div className="bg-gray-900 rounded p-3">
            <h5 className="text-blue-300 text-xs font-medium mb-2">TORQUE ADJUSTMENT</h5>
            <div className="flex items-center justify-center h-24">
              <div className="w-full max-w-xs relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-400">
                    {performanceSettings.torqueAdjustment > 0 && '+'}
                    {performanceSettings.torqueAdjustment}%
                  </span>
                </div>
                
                <svg viewBox="0 0 120 120" width="120" height="120" className="mx-auto">
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
                    stroke={performanceSettings.torqueAdjustment >= 0 ? "#22c55e" : "#ef4444"} 
                    strokeWidth="12" 
                    strokeDasharray="339.292"
                    strokeDashoffset={339.292 * (1 - Math.abs(performanceSettings.torqueAdjustment) / 10)}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              {performanceSettings.torqueAdjustment > 0 
                ? `Enhanced engine torque delivery by ${performanceSettings.torqueAdjustment}%`
                : performanceSettings.torqueAdjustment < 0
                  ? `Reduced engine torque delivery by ${Math.abs(performanceSettings.torqueAdjustment)}%`
                  : 'Stock torque delivery setting'}
            </p>
          </div>
          
          {/* Route Curvature */}
          {performanceSettings.curvatureMetrics && (
            <div className="bg-gray-900 rounded p-3">
              <h5 className="text-blue-300 text-xs font-medium mb-2">ROUTE CURVATURE INTENSITY</h5>
              <div className="h-24 flex items-center justify-center">
                <div className="w-full bg-gray-800 h-4 rounded-full relative">
                  <div 
                    className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                    style={{ width: `${performanceSettings.curvatureMetrics.intensity * 20}%` }}
                  ></div>
                  
                  {/* Markers */}
                  <div className="absolute top-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <div>Straight</div>
                    <div>Moderate</div>
                    <div>Twisty</div>
                  </div>
                  
                  {/* Current position indicator */}
                  <div 
                    className="absolute top-0 h-8 w-0.5 bg-white"
                    style={{ 
                      left: `calc(${performanceSettings.curvatureMetrics.intensity * 20}% - 1px)`,
                      transform: 'translateY(-2px)'
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                {performanceSettings.curvatureMetrics.trnRange}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDriveTelemetry;