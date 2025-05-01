import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTile } from '../contexts/TileContext';
import tileRegistry, { getTile, getRelatedTiles } from '../utils/TileRegistry';

/**
 * useTileSystem - Custom hook for accessing and managing the tile system
 * Provides functions for opening tiles, navigating between them, and tracking state
 */
function useTileSystem() {
  const [, navigate] = useLocation();
  const { 
    expandTile, 
    collapseTile, 
    setTileFullscreen, 
    exitFullscreen,
    isTileExpanded, 
    isTileFullscreen,
    setLastViewedPage,
    getLastViewedPage 
  } = useTile();

  /**
   * Open a specific tile
   * @param {string} tileId - ID of the tile to open
   * @param {Object} options - Options for opening the tile
   * @param {boolean} options.expanded - Whether to expand the tile
   * @param {boolean} options.fullscreen - Whether to open in fullscreen
   * @param {string} options.tab - Active tab to show (if applicable)
   */
  const openTile = useCallback((tileId, options = {}) => {
    const tile = getTile(tileId);
    if (!tile) return;

    // Apply options with defaults
    const { expanded = true, fullscreen = false, tab = null } = options;
    
    if (expanded) {
      expandTile(tileId);
    } else {
      collapseTile(tileId);
    }
    
    if (fullscreen) {
      setTileFullscreen(tileId);
      navigate(tile.route);
      
      // Set active tab if specified
      if (tab && tile.config.availableTabs?.includes(tab)) {
        setLastViewedPage(tileId, tab);
      }
    }
  }, [expandTile, collapseTile, setTileFullscreen, navigate, setLastViewedPage]);
  
  /**
   * Close a specific tile or exit fullscreen mode
   * @param {string} tileId - ID of the tile to close
   */
  const closeTile = useCallback((tileId) => {
    if (isTileFullscreen(tileId)) {
      exitFullscreen();
      navigate('/');
    } else {
      collapseTile(tileId);
    }
  }, [isTileFullscreen, exitFullscreen, navigate, collapseTile]);
  
  /**
   * Navigate to a related tile
   * @param {string} currentTileId - ID of the current tile
   * @param {string} direction - Direction to navigate ('next', 'prev', or a specific tileId)
   */
  const navigateToRelatedTile = useCallback((currentTileId, direction) => {
    const relatedTiles = getRelatedTiles(currentTileId);
    if (!relatedTiles.length) return;
    
    let targetTile;
    
    if (direction === 'next' || direction === 'prev') {
      const currentIndex = relatedTiles.findIndex(tile => tile.id === currentTileId);
      const nextIndex = direction === 'next' 
        ? (currentIndex + 1) % relatedTiles.length
        : (currentIndex - 1 + relatedTiles.length) % relatedTiles.length;
        
      targetTile = relatedTiles[nextIndex];
    } else {
      // Try to navigate to a specific tile ID
      targetTile = relatedTiles.find(tile => tile.id === direction);
    }
    
    if (targetTile) {
      setTileFullscreen(targetTile.id);
      navigate(targetTile.route);
    }
  }, [setTileFullscreen, navigate]);
  
  /**
   * Get metadata for a specific tile
   * @param {string} tileId - ID of the tile
   * @returns {Object} Tile metadata
   */
  const getTileMetadata = useCallback((tileId) => {
    return getTile(tileId);
  }, []);
  
  /**
   * Check if a specific tile is expanded
   * @param {string} tileId - ID of the tile
   * @returns {boolean} Whether the tile is expanded
   */
  const isTileOpen = useCallback((tileId) => {
    return isTileExpanded(tileId);
  }, [isTileExpanded]);
  
  /**
   * Get the last viewed tab for a specific tile
   * @param {string} tileId - ID of the tile
   * @returns {string|null} Last viewed tab ID
   */
  const getTileLastViewedTab = useCallback((tileId) => {
    const tile = getTile(tileId);
    if (!tile || !tile.config.availableTabs) return null;
    
    const lastTab = getLastViewedPage(tileId);
    return lastTab && tile.config.availableTabs.includes(lastTab)
      ? lastTab
      : tile.config.availableTabs[0];
  }, [getLastViewedPage]);
  
  return {
    // Public API
    openTile,
    closeTile,
    navigateToRelatedTile,
    getTileMetadata,
    isTileOpen,
    getTileLastViewedTab,
    
    // All tiles
    allTiles: Object.values(tileRegistry),
    
    // Helper getters
    getTileById: getTile,
    getRelatedTiles
  };
}

export default useTileSystem;