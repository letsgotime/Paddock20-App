import React, { useEffect, useRef, useState } from 'react';

export interface HeatmapDataPoint {
  position: { lat: number; lng: number };
  value: number; // 0-100 intensity value
  metric: 'speed' | 'acceleration' | 'cornering' | 'elevation' | 'temperature' | 'performance';
  timestamp?: number;
  details?: {
    speed: number;
    acceleration: number;
    cornering: number;
    elevation: number;
    gradient: number;
    temperature: number;
    [key: string]: any;
  };
}

interface RoutePerformanceHeatmapProps {
  points: HeatmapDataPoint[];
  width?: number;
  height?: number;
  colorScale?: 'temperature' | 'performance' | 'danger';
  showLegend?: boolean;
  realTimeMode?: boolean;
  onHeatmapClick?: (point: HeatmapDataPoint) => void;
}

// Helper function to generate sample heatmap data for testing/demo
export const generateSampleHeatmapData = (
  centerLat: number, 
  centerLng: number, 
  pointCount: number = 20,
  radiusKm: number = 0.5
): HeatmapDataPoint[] => {
  const points: HeatmapDataPoint[] = [];
  const metrics: Array<'speed' | 'acceleration' | 'cornering' | 'elevation' | 'temperature' | 'performance'> = [
    'speed', 'acceleration', 'cornering', 'elevation', 'temperature', 'performance'
  ];
  
  // Earth's radius in kilometers
  const earthRadius = 6371;
  const currentTime = Date.now();
  
  // Generate points in a circular pattern around the center coordinates
  for (let i = 0; i < pointCount; i++) {
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Random distance (concentrated toward center with sqrt)
    const distance = Math.sqrt(Math.random()) * radiusKm;
    
    // Convert distance and angle to lat/lng offset
    // This is an approximation that works for small distances
    const latOffset = (distance / earthRadius) * (180 / Math.PI);
    const lngOffset = (distance / earthRadius) * (180 / Math.PI) / Math.cos(centerLat * Math.PI / 180);
    
    const lat = centerLat + latOffset * Math.cos(angle);
    const lng = centerLng + lngOffset * Math.sin(angle);
    
    // Value decreases with distance from center
    const normalizedDistance = distance / radiusKm;
    const value = Math.round(100 * (1 - normalizedDistance * 0.8 + Math.random() * 0.2));
    
    // Random performance metrics
    const speed = 30 + Math.sin(i / pointCount * Math.PI * 2) * 30 + Math.random() * 20; // 0-80 mph
    const acceleration = 0.2 + Math.cos(i / pointCount * Math.PI * 3) * 0.3 + Math.random() * 0.2; // G forces
    const cornering = 0.1 + Math.sin(i / pointCount * Math.PI * 5) * 0.4 + Math.random() * 0.3; // Lateral G
    const elevationVal = 400 + Math.sin(i / pointCount * Math.PI) * 500 + Math.random() * 100; // Feet
    const gradient = Math.sin(i / pointCount * Math.PI * 2) * 8; // -8% to 8%
    const temperatureVal = 75 + Math.sin(i / pointCount * Math.PI) * 10 + Math.random() * 5; // °F
    
    // Randomly select a metric
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    
    points.push({
      position: { lat, lng },
      value,
      metric,
      timestamp: currentTime - (pointCount - i) * 5000, // 5 seconds between points
      details: {
        speed,
        acceleration,
        cornering,
        elevation: elevationVal,
        gradient,
        temperature: temperatureVal
      }
    });
  }
  
  return points;
};

const RoutePerformanceHeatmap: React.FC<RoutePerformanceHeatmapProps> = ({ 
  points, 
  width = 800, 
  height = 400, 
  colorScale = 'performance',
  showLegend = true,
  realTimeMode = true,
  onHeatmapClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<HeatmapDataPoint | null>(null);
  
  // Convert GPS coordinates to canvas X,Y positions (simplified)
  const gpsToCanvasPosition = (points: HeatmapDataPoint[]) => {
    if (points.length === 0) return [];
    
    // Find min/max coordinates to scale properly
    const lats = points.map(p => p.position.lat);
    const lngs = points.map(p => p.position.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Add padding
    const latRange = (maxLat - minLat) || 0.01; // Avoid division by zero
    const lngRange = (maxLng - minLng) || 0.01;
    
    // Map each point to canvas coordinates
    return points.map(point => ({
      x: ((point.position.lng - minLng) / lngRange) * (width - 40) + 20, // 20px padding on each side
      y: height - ((point.position.lat - minLat) / latRange) * (height - 40) - 20,
      value: point.value,
      metric: point.metric,
      originalPoint: point
    }));
  };
  
  // Get color based on value and selected color scale
  const getColor = (value: number) => {
    if (colorScale === 'temperature') {
      // Blue (cold) to Red (hot)
      if (value < 25) return `rgba(0, 0, 255, ${value/100 + 0.2})`;
      if (value < 50) return `rgba(0, ${value*5.1}, 255, ${value/100 + 0.3})`;
      if (value < 75) return `rgba(${(value-50)*10.2}, 255, ${255 - (value-50)*10.2}, ${value/100 + 0.4})`;
      return `rgba(255, ${255 - (value-75)*10.2}, 0, ${value/100 + 0.5})`;
    } else if (colorScale === 'danger') {
      // Green (safe) to Red (dangerous)
      if (value < 50) {
        return `rgba(0, ${100 + value*3.1}, 0, ${value/100 + 0.3})`;
      } else {
        return `rgba(${(value-50)*5.1}, ${255 - (value-50)*3.1}, 0, ${value/100 + 0.4})`;
      }
    } else { // default 'performance'
      // Blue (low) to Green (medium) to Red (high performance)
      if (value < 33) return `rgba(0, ${value*7.7}, 255, ${value/100 + 0.3})`;
      if (value < 66) return `rgba(0, 255, ${255 - (value-33)*7.7}, ${value/100 + 0.4})`;
      return `rgba(${(value-66)*7.7}, ${255 - (value-66)*7.7}, 0, ${value/100 + 0.5})`;
    }
  };
  
  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background with grid
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
    ctx.lineWidth = 0.5;
    
    // Draw horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * (height / 10));
      ctx.lineTo(width, i * (height / 10));
      ctx.stroke();
    }
    
    // Draw vertical grid lines
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (width / 10), 0);
      ctx.lineTo(i * (width / 10), height);
      ctx.stroke();
    }
    
    // Convert GPS points to canvas coordinates
    const canvasPoints = gpsToCanvasPosition(points);
    
    // Draw heatmap points
    canvasPoints.forEach((point, index) => {
      const radius = 15 + (point.value / 10); // Size based on value
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      const color = getColor(point.value);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Connect points with a line
      if (index > 0) {
        const prevPoint = canvasPoints[index - 1];
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    });
    
    // Draw route start and end markers
    if (canvasPoints.length > 0) {
      // Start point (green)
      const startPoint = canvasPoints[0];
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // End point (red)
      const endPoint = canvasPoints[canvasPoints.length - 1];
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw legend
    if (showLegend) {
      const legendWidth = 240;
      const legendHeight = 60;
      const legendX = width - legendWidth - 10;
      const legendY = height - legendHeight - 10;
      
      // Legend background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
      
      // Legend gradient
      const legendGradientWidth = legendWidth - 40;
      const legendGradientX = legendX + 20;
      const legendGradientY = legendY + 20;
      const legendGradientHeight = 20;
      
      const gradient = ctx.createLinearGradient(
        legendGradientX, 
        legendGradientY, 
        legendGradientX + legendGradientWidth, 
        legendGradientY
      );
      
      // Add color stops based on the selected color scale
      if (colorScale === 'temperature') {
        gradient.addColorStop(0, 'rgba(0, 0, 255, 0.8)');
        gradient.addColorStop(0.33, 'rgba(0, 128, 255, 0.8)');
        gradient.addColorStop(0.66, 'rgba(128, 255, 128, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
      } else if (colorScale === 'danger') {
        gradient.addColorStop(0, 'rgba(0, 200, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
      } else { // default 'performance'
        gradient.addColorStop(0, 'rgba(0, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.8)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(legendGradientX, legendGradientY, legendGradientWidth, legendGradientHeight);
      
      // Legend labels
      ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      if (colorScale === 'temperature') {
        ctx.fillText('Cold', legendGradientX, legendGradientY - 5);
        ctx.fillText('Hot', legendGradientX + legendGradientWidth, legendGradientY - 5);
      } else if (colorScale === 'danger') {
        ctx.fillText('Safe', legendGradientX, legendGradientY - 5);
        ctx.fillText('Caution', legendGradientX + legendGradientWidth/2, legendGradientY - 5);
        ctx.fillText('Danger', legendGradientX + legendGradientWidth, legendGradientY - 5);
      } else { // default 'performance'
        ctx.fillText('Low', legendGradientX, legendGradientY - 5);
        ctx.fillText('Medium', legendGradientX + legendGradientWidth/2, legendGradientY - 5);
        ctx.fillText('High', legendGradientX + legendGradientWidth, legendGradientY - 5);
      }
      
      // Title of the legend based on color scale
      ctx.fillStyle = 'rgba(180, 230, 255, 0.9)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const legendTitle = colorScale === 'temperature' 
        ? 'Temperature Gradient' 
        : colorScale === 'danger'
          ? 'Risk Assessment'
          : 'Performance Profile';
      ctx.fillText(legendTitle, legendX + legendWidth/2, legendY + 12);
    }
    
    // Draw "Real-time" indicator if in real-time mode
    if (realTimeMode) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 100, 25);
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
      ctx.strokeRect(10, 10, 100, 25);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REAL-TIME', 60, 26);
    }
    
    // Draw hovered point details if any
    if (hoveredPoint) {
      const canvasPoint = gpsToCanvasPosition([hoveredPoint])[0];
      
      // Highlight point
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvasPoint.x, canvasPoint.y, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw info box
      const infoX = canvasPoint.x + 25;
      const infoY = canvasPoint.y - 60;
      const infoWidth = 150;
      const infoHeight = 80;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(infoX, infoY, infoWidth, infoHeight);
      ctx.strokeStyle = 'rgba(100, 100, 255, 0.6)';
      ctx.strokeRect(infoX, infoY, infoWidth, infoHeight);
      
      // Write data
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Metric: ${hoveredPoint.metric}`, infoX + 10, infoY + 20);
      ctx.fillText(`Value: ${hoveredPoint.value}`, infoX + 10, infoY + 40);
      ctx.fillText(`Lat: ${hoveredPoint.position?.lat.toFixed(6) || 'N/A'}`, infoX + 10, infoY + 60);
      ctx.fillText(`Lng: ${hoveredPoint.position?.lng.toFixed(6) || 'N/A'}`, infoX + 10, infoY + 75);
    }
    
  }, [points, width, height, colorScale, showLegend, hoveredPoint, realTimeMode]);
  
  // Handle canvas mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || points.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const canvasPoints = gpsToCanvasPosition(points);
    
    // Find if mouse is over any point
    const hovered = canvasPoints.find(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      return distance < 20; // 20px radius for hover detection
    });
    
    if (hovered) {
      setHoveredPoint(hovered.originalPoint);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredPoint(null);
      document.body.style.cursor = 'default';
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
    document.body.style.cursor = 'default';
  };
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onHeatmapClick || !hoveredPoint) return;
    onHeatmapClick(hoveredPoint);
  };
  
  return (
    <div className="route-performance-heatmap-container">
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-blue-800 rounded-lg shadow-inner bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          {realTimeMode ? 
            "Real-time heatmap will appear when GPS tracking starts" :
            "No heatmap data available for this route yet"}
        </div>
      )}
    </div>
  );
};

export default RoutePerformanceHeatmap;