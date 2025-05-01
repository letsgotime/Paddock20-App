import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, X } from 'lucide-react';
import { useTileSystem } from '../contexts/TileContext';
import TileNavigation from '../components/common/TileNavigation';

/**
 * ExpandedTileView - A fullscreen view for displaying detailed tile content
 * This component handles the routing for expanded tile views and navigation
 */
function ExpandedTileView() {
  const { id } = useParams();
  const { registeredTiles, handleNavigation, enterFullscreen } = useTileSystem();
  const [, navigate] = useLocation();
  
  // Get current tile details
  const currentTile = registeredTiles.find(tile => tile.id === id);
  
  // Effect to handle when no matching tile is found
  useEffect(() => {
    if (id && registeredTiles.length > 0 && !currentTile) {
      // No matching tile found, redirect to dashboard
      navigate('/');
    } else if (id && currentTile) {
      // Found matching tile, enter fullscreen mode
      enterFullscreen(id);
    }
  }, [id, currentTile, registeredTiles, navigate, enterFullscreen]);
  
  // If no matching tile is found, display loading or error state
  if (!currentTile) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-lg">Loading tile data...</p>
        
        <button
          onClick={() => navigate('/')}
          className="mt-8 flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
        >
          <ArrowLeft size={20} className="mr-2" />
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  // Render the dynamic content for the expanded tile
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col text-white">
      {/* Header with title and close button */}
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => handleNavigation('dashboard')}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white mr-2"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">
            {currentTile.title}
          </h1>
        </div>
        
        <button
          onClick={() => handleNavigation('dashboard')}
          className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-center text-gray-400">
          <p>Content for tile "{currentTile.title}" will be displayed here</p>
          <p className="text-sm mt-2">
            Each tile provides its own expanded view content through the TileContext
          </p>
        </div>
      </div>
      
      {/* Footer with navigation controls */}
      <div className="p-4">
        <TileNavigation
          currentTileId={id}
          tiles={registeredTiles}
          onNavigate={handleNavigation}
        />
      </div>
    </div>
  );
}

export default ExpandedTileView;