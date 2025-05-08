import React, { useEffect, useRef, useState } from 'react';
import { 
  Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, 
  ChevronDown, Maximize, Minimize, RotateCw
} from 'lucide-react';

const TimepieceModelViewer = ({ timepiece, className = '' }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [viewControls, setViewControls] = useState({
    showDial: true,
    showMovement: false,
    showCaseBack: false,
    showBracelet: true
  });
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Handle mouse down for rotation
  const handleMouseDown = (e) => {
    if (!rotationEnabled) return;
    
    setIsDragging(true);
    setLastPos({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Handle mouse move for rotation
  const handleMouseMove = (e) => {
    if (!isDragging || !rotationEnabled) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setRotation({
      x: rotation.x + deltaY * 0.5,
      y: rotation.y + deltaX * 0.5
    });
    
    setLastPos({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Handle mouse up to stop rotation
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add/remove event listeners
  useEffect(() => {
    if (rotationEnabled) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [rotationEnabled, isDragging, lastPos]);
  
  // Auto-rotation effect
  useEffect(() => {
    let rotationInterval;
    
    if (rotationEnabled && !isDragging) {
      rotationInterval = setInterval(() => {
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.2
        }));
      }, 30);
    }
    
    return () => {
      if (rotationInterval) clearInterval(rotationInterval);
    };
  }, [rotationEnabled, isDragging]);
  
  // Simulate loading the 3D model
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [timepiece]);
  
  // Get the model URL based on the timepiece
  const getModelImageUrl = () => {
    // Placeholder logic to determine which image to show based on view controls
    if (viewControls.showMovement) {
      return 'https://images.unsplash.com/photo-1639383758358-8aee2732a5fc?auto=format&fit=crop&q=80&w=600';
    }
    
    if (viewControls.showCaseBack) {
      return 'https://images.unsplash.com/photo-1613190419964-1e827dfc4bf3?auto=format&fit=crop&q=80&w=600';
    }
    
    return 'https://images.unsplash.com/photo-1585123334984-bfac8ce32575?auto=format&fit=crop&q=80&w=600';
  };

  return (
    <div className={`bg-black/40 rounded-xl overflow-hidden border border-gray-800 ${className}`}>
      <div className="bg-black/70 p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-medium text-white">3D Model Viewer <span className="text-blue-400 text-xs">(Beta)</span></h3>
        <div className="flex space-x-3">
          <button 
            onClick={() => setRotationEnabled(!rotationEnabled)}
            className={`p-1.5 rounded ${rotationEnabled ? 'text-blue-400 bg-blue-900/30' : 'text-gray-500 bg-gray-900'}`}
            title={rotationEnabled ? "Disable auto-rotation" : "Enable auto-rotation"}
          >
            <RotateCw className="h-4 w-4" />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative h-[300px] md:h-[400px] overflow-hidden" 
        onMouseDown={handleMouseDown}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div 
            className="w-full h-full bg-center bg-no-repeat bg-contain p-8 transition-transform duration-75"
            style={{
              backgroundImage: `url('${getModelImageUrl()}')`,
              transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            }}
          >
          </div>
        )}
        
        {/* Model Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg">
            <div className="p-2 flex space-x-1">
              <button 
                onClick={() => setViewControls({...viewControls, showDial: true, showMovement: false, showCaseBack: false})}
                className={`px-2.5 py-1.5 rounded text-xs ${viewControls.showDial 
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-800' 
                  : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Front
              </button>
              
              <button 
                onClick={() => setViewControls({...viewControls, showDial: false, showMovement: false, showCaseBack: true})}
                className={`px-2.5 py-1.5 rounded text-xs ${viewControls.showCaseBack 
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-800' 
                  : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Back
              </button>
              
              <button 
                onClick={() => setViewControls({...viewControls, showDial: false, showMovement: true, showCaseBack: false})}
                className={`px-2.5 py-1.5 rounded text-xs ${viewControls.showMovement 
                  ? 'bg-blue-900/50 text-blue-300 border border-blue-800' 
                  : 'text-gray-400 hover:bg-gray-800'}`}
              >
                Movement
              </button>
            </div>
          </div>
        </div>
        
        {/* Zoom Controls */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg flex flex-col">
            <button 
              onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
              className="p-2 text-gray-400 hover:text-white border-b border-gray-700"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
              className="p-2 text-gray-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Coming Soon Label */}
        <div className="absolute top-3 right-3">
          <div className="px-2 py-1 bg-amber-900/60 border border-amber-800 rounded text-amber-300 text-xs">
            Enhancement Preview
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800 bg-black/40">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            {timepiece.brand} {timepiece.model}
          </div>
          <div>
            Ref. {timepiece.reference}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimepieceModelViewer;