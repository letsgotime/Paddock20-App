import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation } from 'wouter';

// Create context
const TileContext = createContext();

/**
 * TileProvider - Context provider for managing all expandable tiles
 * Handles state management for tile expansion, fullscreen mode, and navigation
 */
export function TileProvider({ children }) {
  const [expandedTile, setExpandedTile] = useState(null); // Id of the currently expanded tile
  const [fullscreenTile, setFullscreenTile] = useState(null); // Id of the currently fullscreen tile
  const [, navigate] = useLocation();
  
  // Registered tiles for navigation
  const [registeredTiles, setRegisteredTiles] = useState([]);
  
  // Register a new tile
  const registerTile = useCallback((tile) => {
    setRegisteredTiles(prev => {
      // Check if tile already exists
      const exists = prev.some(t => t.id === tile.id);
      if (exists) {
        return prev;
      }
      return [...prev, tile];
    });
    
    return () => {
      // Cleanup function to unregister tile
      setRegisteredTiles(prev => prev.filter(t => t.id !== tile.id));
    };
  }, []);
  
  // Expand a tile
  const expandTile = useCallback((tileId) => {
    // If another tile is already expanded, collapse it first
    if (expandedTile && expandedTile !== tileId) {
      setExpandedTile(null);
    }
    
    setExpandedTile(prev => prev === tileId ? null : tileId);
  }, [expandedTile]);
  
  // Enter fullscreen mode for a tile
  const enterFullscreen = useCallback((tileId) => {
    setFullscreenTile(tileId);
    navigate(`/detail/${tileId}`);
  }, [navigate]);
  
  // Exit fullscreen mode
  const exitFullscreen = useCallback(() => {
    setFullscreenTile(null);
    navigate('/');
  }, [navigate]);
  
  // Handle navigation requests
  const handleNavigation = useCallback((path) => {
    if (path === 'dashboard') {
      exitFullscreen();
    } else if (path.startsWith('detail/')) {
      const tileId = path.replace('detail/', '');
      setFullscreenTile(tileId);
      navigate(`/${path}`);
    } else {
      navigate(`/${path}`);
    }
  }, [exitFullscreen, navigate]);
  
  // Check if a specific tile is expanded
  const isTileExpanded = useCallback((tileId) => {
    return expandedTile === tileId;
  }, [expandedTile]);
  
  // Check if a specific tile is in fullscreen mode
  const isTileFullscreen = useCallback((tileId) => {
    return fullscreenTile === tileId;
  }, [fullscreenTile]);
  
  // Get information about adjacent tiles for navigation
  const getAdjacentTiles = useCallback((tileId) => {
    const currentIndex = registeredTiles.findIndex(t => t.id === tileId);
    
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }
    
    const prev = currentIndex > 0 ? registeredTiles[currentIndex - 1] : null;
    const next = currentIndex < registeredTiles.length - 1 ? registeredTiles[currentIndex + 1] : null;
    
    return { prev, next };
  }, [registeredTiles]);
  
  // Context value
  const value = {
    expandedTile,
    fullscreenTile,
    registeredTiles,
    registerTile,
    expandTile,
    enterFullscreen,
    exitFullscreen,
    handleNavigation,
    isTileExpanded,
    isTileFullscreen,
    getAdjacentTiles,
  };
  
  return <TileContext.Provider value={value}>{children}</TileContext.Provider>;
}

// Custom hook to use the tile context
export function useTileSystem() {
  const context = useContext(TileContext);
  
  if (!context) {
    throw new Error('useTileSystem must be used within a TileProvider');
  }
  
  return context;
}