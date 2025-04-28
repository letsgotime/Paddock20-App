import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface RouteVisualizerProps {
  startLocation: string;
  endLocation: string;
  waypoints: string[];
  weatherData?: any;
  selectedVehicle?: string;
}

// Create mock coordinates for demonstration
const getMockCoordinatesForLocation = (location: string) => {
  // Generate deterministic but pseudo-random coordinates based on the location name
  const hash = [...location].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Normalized values between 0 and 1 with some variation
  const x = (hash % 100) / 100;
  const y = ((hash * 31) % 100) / 100;
  
  return { x, y };
};

const RouteVisualizer: React.FC<RouteVisualizerProps> = ({
  startLocation,
  endLocation,
  waypoints,
  weatherData,
  selectedVehicle
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [pathPointsNormalized, setPathPointsNormalized] = useState<{ x: number; y: number }[]>([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Function to calculate the path points based on start, waypoints, and end
  useEffect(() => {
    if (!startLocation || !endLocation) return;
    
    const points = [];
    
    // Add start point
    const startCoords = getMockCoordinatesForLocation(startLocation);
    points.push(startCoords);
    
    // Add waypoints if any
    waypoints.forEach(waypoint => {
      const wpCoords = getMockCoordinatesForLocation(waypoint);
      points.push(wpCoords);
    });
    
    // Add end point
    const endCoords = getMockCoordinatesForLocation(endLocation);
    points.push(endCoords);
    
    // Normalize points to fit the canvas size while maintaining aspect ratio
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const normalizedPoints = points.map(point => ({
        x: point.x * (canvasSize.width - 40) + 20, // Add padding 
        y: point.y * (canvasSize.height - 40) + 20 // Add padding
      }));
      
      setPathPointsNormalized(normalizedPoints);
    }
  }, [startLocation, endLocation, waypoints, canvasSize]);
  
  // Update canvas size when the component mounts or window resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const { offsetWidth, offsetHeight } = canvasRef.current;
        setCanvasSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    
    // Set initial size
    updateCanvasSize();
    
    // Add resize listener
    window.addEventListener('resize', updateCanvasSize);
    
    // Clean up
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Generate SVG path string from points
  const generatePathString = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return '';
    
    let pathString = `M ${points[0].x} ${points[0].y}`;
    
    // Create a smooth curve through all points
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      
      // Calculate control points for the curve
      const cp1x = prev.x + (current.x - prev.x) / 3;
      const cp1y = prev.y;
      const cp2x = prev.x + 2 * (current.x - prev.x) / 3;
      const cp2y = current.y;
      
      pathString += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
    }
    
    return pathString;
  };

  const pathString = generatePathString(pathPointsNormalized);

  // Start animation when path changes
  useEffect(() => {
    if (pathString && pathPointsNormalized.length > 1) {
      setAnimationProgress(0);
      setIsAnimating(true);
      
      // Animate the path drawing over time
      const duration = 1500 + (waypoints.length * 500); // Longer animation for more waypoints
      let startTime: number;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setAnimationProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [pathString, pathPointsNormalized, waypoints.length]);

  // Calculate the path length to animate the dashoffset
  const pathLength = pathPointsNormalized.length > 1 ? 
    Math.max(...pathPointsNormalized.map((point, index) => 
      index === 0 ? 0 : 
      Math.sqrt(
        Math.pow(point.x - pathPointsNormalized[index - 1].x, 2) + 
        Math.pow(point.y - pathPointsNormalized[index - 1].y, 2)
      )
    )) * pathPointsNormalized.length * 2 : 0;

  // Get the class names for the route based on weather and vehicle
  const getRouteClass = () => {
    if (!weatherData) return 'stroke-blue-500';
    
    const condition = weatherData.roadCondition?.toLowerCase() || '';
    
    if (condition.includes('wet') || condition.includes('rain')) {
      return 'route-wet';
    } else if (condition.includes('snow') || condition.includes('ice')) {
      return 'route-snow';
    } else if (condition.includes('hot')) {
      return 'route-hot';
    } else {
      return 'route-optimal';
    }
  };

  const getVehicleEmoji = () => {
    if (!selectedVehicle) return '🚗';
    
    if (selectedVehicle.toLowerCase().includes('ferrari')) {
      return '🏎️';
    } else if (selectedVehicle.toLowerCase().includes('porsche')) {
      return '🏎️';
    } else if (selectedVehicle.toLowerCase().includes('bmw')) {
      return '🚙';
    } else {
      return '🚗';
    }
  };

  // Get stop marker style based on type
  const getStopMarkerStyle = (index: number, total: number) => {
    if (index === 0) {
      return 'start-marker';
    } else if (index === total - 1) {
      return 'end-marker';
    } else {
      return 'waypoint-marker';
    }
  };

  return (
    <div 
      ref={canvasRef} 
      className="relative w-full h-64 md:h-80 lg:h-96 bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800 overflow-hidden"
    >
      {/* Terrain background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30" 
        style={{ 
          backgroundImage: `url('/attached_assets/Stock Photos/ferrari-mountain-road.png')` 
        }}
      ></div>
      
      {/* Grid lines */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ opacity: 0.2 }}>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Route SVG */}
      {pathPointsNormalized.length > 1 && (
        <svg className="absolute inset-0 w-full h-full" style={{ 
          filter: weatherData?.roadCondition?.toLowerCase().includes('fog') ? 'blur(2px)' : 'none' 
        }}>
          {/* Draw route path */}
          <motion.path
            d={pathString}
            strokeWidth={4}
            fill="none"
            className={getRouteClass()}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationProgress }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - animationProgress)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Draw route glow for visibility */}
          <motion.path
            d={pathString}
            strokeWidth={8}
            fill="none"
            className="stroke-white/10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: animationProgress }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - animationProgress)}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'blur(6px)' }}
          />
          
          {/* Markers for stops */}
          {pathPointsNormalized.map((point, index) => (
            <motion.g 
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: animationProgress > (index / (pathPointsNormalized.length - 1)) ? 1 : 0,
                opacity: animationProgress > (index / (pathPointsNormalized.length - 1)) ? 1 : 0
              }}
              transition={{ 
                delay: 0.5 + (index / pathPointsNormalized.length) * 1,
                duration: 0.3
              }}
              className="origin-center"
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={index === 0 || index === pathPointsNormalized.length - 1 ? 8 : 6}
                className={`${getStopMarkerStyle(index, pathPointsNormalized.length)}`}
              />
              <text
                x={point.x}
                y={point.y + (index === 0 ? -15 : 20)}
                className="fill-white text-xs font-medium text-center"
                textAnchor="middle"
              >
                {index === 0 
                  ? 'Start' 
                  : index === pathPointsNormalized.length - 1 
                    ? 'End' 
                    : `Stop ${index}`
                }
              </text>
            </motion.g>
          ))}
          
          {/* Animated vehicle */}
          {animationProgress > 0 && (
            <motion.text
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                offsetPath: `path('${pathString}')`,
                offsetDistance: `${animationProgress * 100}%`,
              }}
            >
              {getVehicleEmoji()}
            </motion.text>
          )}
        </svg>
      )}
      
      {/* Weather effect overlays */}
      {weatherData && weatherData.roadCondition?.toLowerCase().includes('rain') && (
        <div className="absolute inset-0 rain-effect"></div>
      )}
      
      {weatherData && weatherData.roadCondition?.toLowerCase().includes('snow') && (
        <div className="absolute inset-0 snow-effect"></div>
      )}
      
      {(!startLocation || !endLocation) && (
        <div className="absolute inset-0 flex items-center justify-center text-white/70">
          <p>Enter start and end locations to visualize your route</p>
        </div>
      )}
    </div>
  );
};

export default RouteVisualizer;