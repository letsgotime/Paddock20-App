import React from 'react';

interface AltitudeData {
  maxAltitude: number;
  minAltitude: number;
  totalAscent: number;
  totalDescent: number;
  altitudePoints?: number[][];
}

interface RouteCharacteristics {
  totalTurns: number;
  sharpTurns: number;
  straightSections: number;
  hillClimbs: number;
  descents: number;
  averageCornerRadius?: number;
  technicalSections?: number;
  maxCornerG?: number;
}

interface RouteAnalyticsProps {
  altitudeData?: AltitudeData;
  routeCharacteristics?: RouteCharacteristics;
  distance: number;
}

const RouteAnalytics: React.FC<RouteAnalyticsProps> = ({ 
  altitudeData, 
  routeCharacteristics,
  distance
}) => {
  const colors = {
    altitude: "#47C1FF", // Light blue
    gridLines: "#333333",
    background: "#121212",
    text: "#FFFFFF",
    ascent: "#4CAF50", // Green
    descent: "#E53935", // Red
    turns: "#FF5722", // Deep orange
    straightaways: "#2196F3", // Blue
  };
  
  const renderAltitudeGraph = () => {
    if (!altitudeData || !altitudeData.altitudePoints || altitudeData.altitudePoints.length === 0) {
      return (
        <div className="p-4 bg-gray-800 rounded text-center text-gray-400">
          No altitude data available
        </div>
      );
    }
    
    const graphHeight = 180;
    const graphWidth = 500;
    const points = altitudeData.altitudePoints;
    
    // Find the min and max values for scaling
    const minAlt = altitudeData.minAltitude;
    const maxAlt = altitudeData.maxAltitude;
    const range = maxAlt - minAlt;
    
    // Normalize positions to graph width
    const normalizeX = (x: number) => (x / distance) * graphWidth;
    // Normalize values to graph height (inverted, higher altitude at top)
    const normalizeY = (y: number) => graphHeight - ((y - minAlt) / (range === 0 ? 1 : range)) * graphHeight;
    
    // Create SVG path data string
    const createPathData = (points: number[][]) => {
      if (points.length === 0) return '';
      
      let pathData = `M ${normalizeX(points[0][0])},${normalizeY(points[0][1])}`;
      
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${normalizeX(points[i][0])},${normalizeY(points[i][1])}`;
      }
      
      // Add closing path to create a filled shape
      pathData += ` L ${normalizeX(points[points.length - 1][0])},${graphHeight}`;
      pathData += ` L ${normalizeX(points[0][0])},${graphHeight}`;
      pathData += ' Z';
      
      return pathData;
    };
    
    const altitudePathData = createPathData(points);
    
    // Calculate elevation steps for grid lines
    const elevationStep = Math.ceil(range / 4);
    const elevationLines = [];
    let currentElevation = Math.floor(minAlt / 500) * 500; // Round to nearest 500ft
    
    while (currentElevation <= maxAlt) {
      elevationLines.push(currentElevation);
      currentElevation += elevationStep;
    }
    
    return (
      <div className="bg-black p-2 rounded-lg border border-gray-800">
        <h4 className="text-blue-400 font-medium mb-2 text-center">Elevation Profile</h4>
        <svg 
          width={graphWidth} 
          height={graphHeight} 
          viewBox={`0 0 ${graphWidth} ${graphHeight}`} 
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pos => (
            <line 
              key={`vline-${pos}`}
              x1={normalizeX(pos * distance)} 
              y1="0" 
              x2={normalizeX(pos * distance)} 
              y2={graphHeight} 
              stroke={colors.gridLines}
              strokeDasharray="4 4"
            />
          ))}
          {elevationLines.map(altitude => (
            <line 
              key={`hline-${altitude}`}
              x1="0" 
              y1={normalizeY(altitude)} 
              x2={graphWidth} 
              y2={normalizeY(altitude)} 
              stroke={colors.gridLines}
              strokeDasharray="4 4"
            />
          ))}
          
          {/* Distance markers */}
          {[0, 0.25, 0.5, 0.75, 1].map(pos => (
            <text 
              key={`dist-${pos}`}
              x={normalizeX(pos * distance)} 
              y={graphHeight + 15} 
              textAnchor="middle" 
              fill={colors.text}
              fontSize="10"
            >
              {Math.round(pos * distance)}
            </text>
          ))}
          
          {/* Altitude markers */}
          {elevationLines.map(altitude => (
            <text 
              key={`alt-${altitude}`}
              x="-5" 
              y={normalizeY(altitude)} 
              textAnchor="end" 
              fill={colors.text}
              fontSize="10"
              dominantBaseline="middle"
            >
              {altitude}ft
            </text>
          ))}
          
          {/* Altitude area */}
          <path 
            d={altitudePathData} 
            fill="url(#altitudeGradient)" 
            stroke={colors.altitude} 
            strokeWidth="2"
          />
          
          {/* Gradient for altitude area */}
          <defs>
            <linearGradient id="altitudeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.altitude} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.altitude} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {points.map(([x, y], i) => (
            <circle 
              key={`alt-point-${i}`}
              cx={normalizeX(x)} 
              cy={normalizeY(y)} 
              r="3" 
              fill={colors.altitude} 
            />
          ))}
          
          {/* X and Y axis labels */}
          <text x={graphWidth / 2} y={graphHeight + 30} textAnchor="middle" fill={colors.text} fontSize="10">Distance (miles)</text>
          <text x="-40" y={graphHeight / 2} textAnchor="middle" fill={colors.text} fontSize="10" transform={`rotate(270, -40, ${graphHeight / 2})`}>Elevation (ft)</text>
        </svg>
        
        {/* Elevation stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 text-xs">Max Elevation</div>
            <div className="text-white font-medium">{altitudeData.maxAltitude.toLocaleString()}ft</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-gray-400 text-xs">Min Elevation</div>
            <div className="text-white font-medium">{altitudeData.minAltitude.toLocaleString()}ft</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-green-500 text-xs">Total Ascent</div>
            <div className="text-white font-medium">{altitudeData.totalAscent.toLocaleString()}ft</div>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <div className="text-red-500 text-xs">Total Descent</div>
            <div className="text-white font-medium">{altitudeData.totalDescent.toLocaleString()}ft</div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderRouteCharacteristics = () => {
    if (!routeCharacteristics) {
      return (
        <div className="p-4 bg-gray-800 rounded text-center text-gray-400">
          No route characteristics data available
        </div>
      );
    }
    
    return (
      <div className="bg-black p-4 rounded-lg border border-gray-800">
        <h4 className="text-blue-400 font-medium mb-4 text-center">Route Characteristics</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-orange-500 text-xl font-bold mb-1">{routeCharacteristics.totalTurns}</div>
            <div className="text-gray-400 text-sm">Total Turns</div>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-red-500 text-xl font-bold mb-1">{routeCharacteristics.sharpTurns}</div>
            <div className="text-gray-400 text-sm">Sharp Turns</div>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-blue-500 text-xl font-bold mb-1">{routeCharacteristics.straightSections}</div>
            <div className="text-gray-400 text-sm">Straight Sections</div>
          </div>
          
          <div className="bg-gray-900 p-3 rounded-lg text-center">
            <div className="text-green-500 text-xl font-bold mb-1">{routeCharacteristics.hillClimbs}</div>
            <div className="text-gray-400 text-sm">Hill Climbs</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {routeCharacteristics.averageCornerRadius !== undefined && (
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-yellow-500 text-lg font-bold mb-1">{routeCharacteristics.averageCornerRadius}ft</div>
              <div className="text-gray-400 text-sm">Avg. Corner Radius</div>
            </div>
          )}
          
          {routeCharacteristics.technicalSections !== undefined && (
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-purple-500 text-lg font-bold mb-1">{routeCharacteristics.technicalSections}</div>
              <div className="text-gray-400 text-sm">Technical Sections</div>
            </div>
          )}
          
          {routeCharacteristics.maxCornerG !== undefined && (
            <div className="bg-gray-900 p-3 rounded-lg text-center">
              <div className="text-pink-500 text-lg font-bold mb-1">{routeCharacteristics.maxCornerG.toFixed(1)}G</div>
              <div className="text-gray-400 text-sm">Max Corner G-Force</div>
            </div>
          )}
        </div>
        
        {/* Route Composition Visualization */}
        <div className="mt-6">
          <h5 className="text-gray-300 text-sm mb-2">Route Composition</h5>
          <div className="h-8 bg-gray-800 rounded-lg overflow-hidden flex">
            {/* Calculate percentages based on total turns, straights, and technical sections */}
            {(() => {
              const total = routeCharacteristics.totalTurns + 
                           routeCharacteristics.straightSections + 
                           (routeCharacteristics.technicalSections || 0);
              
              const turnPct = (routeCharacteristics.totalTurns / total) * 100;
              const sharpTurnPct = (routeCharacteristics.sharpTurns / total) * 100;
              const straightPct = (routeCharacteristics.straightSections / total) * 100;
              const technicalPct = ((routeCharacteristics.technicalSections || 0) / total) * 100;
              
              return (
                <>
                  <div className="h-full bg-orange-600" style={{ width: `${turnPct - sharpTurnPct}%` }}></div>
                  <div className="h-full bg-red-600" style={{ width: `${sharpTurnPct}%` }}></div>
                  <div className="h-full bg-blue-600" style={{ width: `${straightPct}%` }}></div>
                  <div className="h-full bg-purple-600" style={{ width: `${technicalPct}%` }}></div>
                </>
              );
            })()}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Regular Turns</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Sharp Turns</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Straights</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Technical</span>
            </div>
          </div>
        </div>
        
        {/* Elevation Change Visualization */}
        <div className="mt-6">
          <h5 className="text-gray-300 text-sm mb-2">Elevation Changes</h5>
          <div className="h-8 bg-gray-800 rounded-lg overflow-hidden flex">
            {(() => {
              if (!altitudeData) return null;
              
              const total = routeCharacteristics.hillClimbs + routeCharacteristics.descents;
              const ascentPct = (routeCharacteristics.hillClimbs / total) * 100;
              const descentPct = (routeCharacteristics.descents / total) * 100;
              
              return (
                <>
                  <div className="h-full bg-green-600" style={{ width: `${ascentPct}%` }}></div>
                  <div className="h-full bg-red-600" style={{ width: `${descentPct}%` }}></div>
                </>
              );
            })()}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Uphill ({routeCharacteristics.hillClimbs})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-sm mr-1"></div>
              <span className="text-gray-400">Downhill ({routeCharacteristics.descents})</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
        <h3 className="text-blue-400 font-semibold mb-3">Route Analytics & Telemetry</h3>
        
        <div className="flex flex-col items-center space-y-6">
          {renderAltitudeGraph()}
          {renderRouteCharacteristics()}
        </div>
      </div>
    </div>
  );
};

export default RouteAnalytics;