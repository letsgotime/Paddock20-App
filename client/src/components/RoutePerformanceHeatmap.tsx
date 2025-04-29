import React, { useState, useEffect, useRef } from 'react';

export interface HeatmapDataPoint {
  position: { lat: number; lng: number };
  value: number; // Performance value (0-100)
  metric: string; // What this measures (speed, acceleration, etc.)
  timestamp: number;
  details?: {
    speed?: number;
    acceleration?: number;
    cornering?: number;
    elevation?: number;
    gradient?: number;
    temperature?: number;
  }
}

interface RoutePerformanceHeatmapProps {
  routeData: HeatmapDataPoint[];
  width?: number;
  height?: number;
  selectedMetric?: string;
  onPointClick?: (point: HeatmapDataPoint) => void;
}

const RoutePerformanceHeatmap: React.FC<RoutePerformanceHeatmapProps> = ({
  routeData,
  width = 800,
  height = 300,
  selectedMetric = 'speed',
  onPointClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapDataPoint | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Compute data ranges for visualization
  const minValue = Math.min(...routeData.map(d => d.value));
  const maxValue = Math.max(...routeData.map(d => d.value));
  
  // Helper function to get color based on value
  const getColorForValue = (value: number): string => {
    // Normalize value to 0-1 range
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    
    if (normalizedValue < 0.25) {
      // Blue (cold) for low values
      return `rgb(0, 0, ${Math.round(255 * (normalizedValue * 4))})`;
    } else if (normalizedValue < 0.5) {
      // Green for medium-low values
      return `rgb(0, ${Math.round(255 * ((normalizedValue - 0.25) * 4))}, 255)`;
    } else if (normalizedValue < 0.75) {
      // Yellow for medium-high values
      return `rgb(${Math.round(255 * ((normalizedValue - 0.5) * 4))}, 255, 0)`;
    } else {
      // Red (hot) for high values
      return `rgb(255, ${Math.round(255 * (1 - (normalizedValue - 0.75) * 4))}, 0)`;
    }
  };
  
  useEffect(() => {
    if (!canvasRef.current || routeData.length === 0) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find min/max lat/lng to normalize positions
    const lats = routeData.map(point => point.position.lat);
    const lngs = routeData.map(point => point.position.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Draw route points
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // First draw the connecting lines
    ctx.beginPath();
    routeData.forEach((point, i) => {
      // Normalize position to canvas dimensions
      const x = ((point.position.lng - minLng) / (maxLng - minLng)) * (width - 20) + 10;
      const y = height - (((point.position.lat - minLat) / (maxLat - minLat)) * (height - 20) + 10);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Use gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    routeData.forEach((point, i) => {
      const position = i / (routeData.length - 1);
      gradient.addColorStop(position, getColorForValue(point.value));
    });
    
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Then draw data points
    routeData.forEach((point, i) => {
      // Normalize position to canvas dimensions
      const x = ((point.position.lng - minLng) / (maxLng - minLng)) * (width - 20) + 10;
      const y = height - (((point.position.lat - minLat) / (maxLat - minLat)) * (height - 20) + 10);
      
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = getColorForValue(point.value);
      ctx.fill();
      
      // Label significant points (e.g., top 10% and bottom 10%)
      if (point.value >= maxValue * 0.9 || point.value <= minValue * 1.1) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(Math.round(point.value).toString(), x + 8, y);
      }
    });
    
    // Add legend
    const legendHeight = 20;
    const legendY = height - legendHeight - 10;
    const legendWidth = width * 0.8;
    const legendX = (width - legendWidth) / 2;
    
    const legendGradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    legendGradient.addColorStop(0, 'blue');
    legendGradient.addColorStop(0.33, 'green');
    legendGradient.addColorStop(0.66, 'yellow');
    legendGradient.addColorStop(1, 'red');
    
    ctx.fillStyle = legendGradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Add legend labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(Math.round(minValue).toString(), legendX, legendY - 5);
    ctx.fillText(Math.round(maxValue).toString(), legendX + legendWidth - 20, legendY - 5);
    ctx.fillText(selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1), width / 2 - 20, legendY - 5);
    
    setIsDrawing(false);
  }, [routeData, width, height, selectedMetric, minValue, maxValue]);
  
  // Handle canvas interactions
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || routeData.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find min/max lat/lng to normalize positions
    const lats = routeData.map(point => point.position.lat);
    const lngs = routeData.map(point => point.position.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Find the closest point
    let closestPoint: HeatmapDataPoint | null = null;
    let closestDistance = Infinity;
    
    routeData.forEach(point => {
      // Normalize position to canvas dimensions
      const pointX = ((point.position.lng - minLng) / (maxLng - minLng)) * (width - 20) + 10;
      const pointY = height - (((point.position.lat - minLat) / (maxLat - minLat)) * (height - 20) + 10);
      
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      
      if (distance < closestDistance && distance < 15) {
        closestDistance = distance;
        closestPoint = point;
      }
    });
    
    setHoveredPoint(closestPoint);
  };
  
  const handleCanvasClick = () => {
    if (hoveredPoint && onPointClick) {
      onPointClick(hoveredPoint);
    }
  };
  
  return (
    <div className="route-performance-heatmap relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-gray-900 border border-gray-700 rounded-lg"
        onMouseMove={handleCanvasMouseMove}
        onClick={handleCanvasClick}
      />
      
      {isDrawing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400">
          Loading...
        </div>
      )}
      
      {hoveredPoint && (
        <div 
          className="absolute bg-black bg-opacity-80 text-white p-2 rounded-md z-10 pointer-events-none border border-blue-500"
          style={{
            left: ((hoveredPoint.position.lng - Math.min(...routeData.map(d => d.position.lng))) / 
                  (Math.max(...routeData.map(d => d.position.lng)) - Math.min(...routeData.map(d => d.position.lng)))) * 
                  (width - 20) + 25,
            top: height - (((hoveredPoint.position.lat - Math.min(...routeData.map(d => d.position.lat))) / 
                 (Math.max(...routeData.map(d => d.position.lat)) - Math.min(...routeData.map(d => d.position.lat)))) * 
                 (height - 20) + 10) - 60
          }}
        >
          <div className="font-bold">{hoveredPoint.metric}: {Math.round(hoveredPoint.value)}</div>
          {hoveredPoint.details && (
            <div className="text-xs">
              {hoveredPoint.details.speed !== undefined && (
                <div>Speed: {hoveredPoint.details.speed} mph</div>
              )}
              {hoveredPoint.details.acceleration !== undefined && (
                <div>Accel: {hoveredPoint.details.acceleration.toFixed(2)} G</div>
              )}
              {hoveredPoint.details.cornering !== undefined && (
                <div>Cornering: {hoveredPoint.details.cornering.toFixed(2)} G</div>
              )}
              {hoveredPoint.details.elevation !== undefined && (
                <div>Elevation: {hoveredPoint.details.elevation.toFixed(0)} ft</div>
              )}
              {hoveredPoint.details.temperature !== undefined && (
                <div>Temp: {hoveredPoint.details.temperature.toFixed(1)}°F</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example data generator for previewing component
export const generateSampleHeatmapData = (
  pointCount: number = 50, 
  centerLat: number = 37.7749, 
  centerLng: number = -122.4194,
  radius: number = 0.05
): HeatmapDataPoint[] => {
  const points: HeatmapDataPoint[] = [];
  const currentTime = Date.now();
  
  for (let i = 0; i < pointCount; i++) {
    // Generate random position around center point
    const angle = 2 * Math.PI * (i / pointCount);
    const distance = radius * Math.sqrt(Math.random());
    const lat = centerLat + distance * Math.cos(angle);
    const lng = centerLng + distance * Math.sin(angle);
    
    // Generate some random values for this point
    const speed = 25 + Math.random() * 75; // 25-100 mph
    const acceleration = Math.random() * 0.8; // 0-0.8 G
    const cornering = Math.random() * 0.9; // 0-0.9 G
    const elevation = 100 + Math.random() * 1000; // 100-1100 ft
    const gradient = Math.random() * 10 - 5; // -5% to +5% grade
    const temperature = 65 + Math.random() * 30; // 65-95°F
    
    // Calculate a composite performance score for this point
    // Here we're favoring high speed, high cornering G, moderate acceleration
    const value = (speed / 100 * 40) + (cornering / 0.9 * 40) + (1 - Math.abs(acceleration - 0.4) / 0.4 * 20);
    
    points.push({
      position: { lat, lng },
      value,
      metric: 'Performance',
      timestamp: currentTime - (pointCount - i) * 10000, // 10 seconds between points
      details: {
        speed,
        acceleration, 
        cornering,
        elevation,
        gradient,
        temperature
      }
    });
  }
  
  return points;
};

export default RoutePerformanceHeatmap;