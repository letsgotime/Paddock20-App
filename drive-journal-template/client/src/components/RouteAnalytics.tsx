import React from 'react';

interface AltitudeData {
  maxAltitude: number; // Maximum altitude in meters or feet
  minAltitude: number; // Minimum altitude
  totalAscent: number; // Total uphill in meters or feet
  totalDescent: number; // Total downhill
  altitudePoints?: number[][]; // [distance, altitude] pairs for visualization
}

interface RouteCharacteristics {
  totalTurns: number; // Total number of turns on route
  sharpTurns: number; // Number of sharp turns
  straightSections: number; // Number of straight sections
  hillClimbs: number; // Number of uphill sections
  descents: number; // Number of downhill sections
  averageCornerRadius?: number; // Average radius of corners
  technicalSections?: number; // Number of technical driving sections
  maxCornerG?: number; // Maximum G-force in corners
}

interface RouteAnalyticsProps {
  altitudeData: AltitudeData;
  routeCharacteristics: RouteCharacteristics;
}

const RouteAnalytics: React.FC<RouteAnalyticsProps> = ({
  altitudeData,
  routeCharacteristics
}) => {
  // Ensure altitudePoints exists with at least a default value
  const altitudePoints = altitudeData.altitudePoints || [];
  
  // Calculate the horizontal scale for the altitude chart
  const totalDistance = altitudePoints.length > 0 
    ? altitudePoints[altitudePoints.length - 1][0] 
    : 0;
    
  // Find min/max altitude values if altitudePoints exist
  let minChartAltitude = altitudeData.minAltitude;
  let maxChartAltitude = altitudeData.maxAltitude;
  
  // For scaling the altitude graph
  const altitudeRange = maxChartAltitude - minChartAltitude;
  
  return (
    <div className="space-y-6">
      {/* Altitude Profile */}
      <div>
        <h4 className="text-gray-300 text-sm font-medium mb-3">ALTITUDE PROFILE</h4>
        
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-blue-400 text-lg font-medium">{altitudeData.maxAltitude.toLocaleString()} ft</p>
              <p className="text-gray-400 text-xs">Max Altitude</p>
            </div>
            <div>
              <p className="text-blue-400 text-lg font-medium">{altitudeData.minAltitude.toLocaleString()} ft</p>
              <p className="text-gray-400 text-xs">Min Altitude</p>
            </div>
            <div>
              <p className="text-green-500 text-lg font-medium">{altitudeData.totalAscent.toLocaleString()} ft</p>
              <p className="text-gray-400 text-xs">Total Ascent</p>
            </div>
            <div>
              <p className="text-red-500 text-lg font-medium">{altitudeData.totalDescent.toLocaleString()} ft</p>
              <p className="text-gray-400 text-xs">Total Descent</p>
            </div>
          </div>
          
          {/* Elevation Chart */}
          {altitudePoints.length > 0 && (
            <div className="relative h-40 mt-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pointer-events-none">
                <div>{maxChartAltitude.toLocaleString()} ft</div>
                <div>{Math.floor((maxChartAltitude + minChartAltitude) / 2).toLocaleString()} ft</div>
                <div>{minChartAltitude.toLocaleString()} ft</div>
              </div>
              
              {/* Chart area */}
              <div className="absolute left-12 right-0 top-0 bottom-0 bg-gray-900 rounded">
                {/* Horizontal grid lines */}
                <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-800"></div>
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800"></div>
                <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-800"></div>
                
                {/* Altitude line */}
                <svg className="absolute inset-0 h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="altitude-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
                      <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Altitude area */}
                  <path
                    d={`
                      M ${altitudePoints.map(point => {
                        const x = (point[0] / totalDistance) * 100;
                        const y = 100 - ((point[1] - minChartAltitude) / altitudeRange) * 100;
                        return `${x}% ${y}%`;
                      }).join(' L ')}
                      L 100% 100% L 0% 100% Z
                    `}
                    fill="url(#altitude-gradient)"
                  />
                  
                  {/* Altitude line */}
                  <path
                    d={`
                      M ${altitudePoints.map(point => {
                        const x = (point[0] / totalDistance) * 100;
                        const y = 100 - ((point[1] - minChartAltitude) / altitudeRange) * 100;
                        return `${x}% ${y}%`;
                      }).join(' L ')}
                    `}
                    stroke="#22c55e"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-gray-500 transform translate-y-5">
                  <div>0 mi</div>
                  <div>{(totalDistance / 2).toFixed(1)} mi</div>
                  <div>{totalDistance.toFixed(1)} mi</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Route Characteristics */}
      <div>
        <h4 className="text-gray-300 text-sm font-medium mb-3">ROUTE CHARACTERISTICS</h4>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-blue-400 text-lg font-medium">{routeCharacteristics.totalTurns}</p>
              <p className="text-gray-400 text-xs">Total Turns</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-500 text-lg font-medium">{routeCharacteristics.sharpTurns}</p>
              <p className="text-gray-400 text-xs">Sharp Turns</p>
            </div>
            <div className="text-center">
              <p className="text-blue-400 text-lg font-medium">{routeCharacteristics.straightSections}</p>
              <p className="text-gray-400 text-xs">Straight Sections</p>
            </div>
            <div className="text-center">
              <p className="text-purple-500 text-lg font-medium">{routeCharacteristics.technicalSections || 0}</p>
              <p className="text-gray-400 text-xs">Technical Sections</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded p-3">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center text-green-400 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 3 18 9"></polyline>
                    <path d="M12 3v18"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-green-400 font-medium">{routeCharacteristics.hillClimbs} Hill Climbs</p>
                  <p className="text-gray-400 text-xs">{altitudeData.totalAscent.toLocaleString()} ft total climb</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded p-3">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center text-red-400 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 15 12 21 18 15"></polyline>
                    <path d="M12 21v-18"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 font-medium">{routeCharacteristics.descents} Descents</p>
                  <p className="text-gray-400 text-xs">{altitudeData.totalDescent.toLocaleString()} ft total descent</p>
                </div>
              </div>
            </div>
            
            {routeCharacteristics.averageCornerRadius && (
              <div className="bg-gray-900 rounded p-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-blue-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a9 9 0 1 1-18 0"></path>
                      <path d="M5 3l0 11"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-400 font-medium">{routeCharacteristics.averageCornerRadius} ft Avg. Radius</p>
                    <p className="text-gray-400 text-xs">Average corner tightness</p>
                  </div>
                </div>
              </div>
            )}
            
            {routeCharacteristics.maxCornerG && (
              <div className="bg-gray-900 rounded p-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-900 flex items-center justify-center text-yellow-400 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a8 8 0 0 1-8-8"></path>
                      <path d="M20 12a8 8 0 0 0-8-8"></path>
                      <path d="M12 22v-4"></path>
                      <path d="M12 8V4"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-medium">{routeCharacteristics.maxCornerG} G Max Corner</p>
                    <p className="text-gray-400 text-xs">Maximum lateral G-force</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAnalytics;