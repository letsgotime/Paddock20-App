import React from 'react';
import { ChevronLeft, ChevronRight, Grid2X2 } from 'lucide-react';

/**
 * TileNavigation - A navigation component for expanded/fullscreen tiles
 * 
 * Provides navigation controls to move between tiles, go back to dashboard
 * or navigate to previous/next tiles.
 */
function TileNavigation({
  currentTileId,
  tiles = [],
  onNavigate,
  showHomeButton = true,
  className = ''
}) {
  // Find current tile index in the tiles array
  const currentIndex = tiles.findIndex(tile => tile.id === currentTileId);
  const prevTile = currentIndex > 0 ? tiles[currentIndex - 1] : null;
  const nextTile = currentIndex < tiles.length - 1 ? tiles[currentIndex + 1] : null;
  
  return (
    <div className={`p-2 bg-gray-900/70 backdrop-blur rounded-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        {showHomeButton && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white flex items-center"
            aria-label="Back to Dashboard"
          >
            <Grid2X2 size={16} className="mr-2" />
            <span className="text-sm">Dashboard</span>
          </button>
        )}
      </div>
      
      <div className="flex space-x-1">
        {prevTile && (
          <button
            onClick={() => onNavigate(`detail/${prevTile.id}`)}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white flex items-center"
            aria-label={`Previous: ${prevTile.title}`}
          >
            <ChevronLeft size={16} className="mr-1" />
            <span className="text-sm hidden md:inline">{prevTile.title}</span>
          </button>
        )}
        
        {nextTile && (
          <button
            onClick={() => onNavigate(`detail/${nextTile.id}`)}
            className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white flex items-center"
            aria-label={`Next: ${nextTile.title}`}
          >
            <span className="text-sm hidden md:inline">{nextTile.title}</span>
            <ChevronRight size={16} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
}

export default TileNavigation;