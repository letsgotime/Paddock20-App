import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context
const TileContext = createContext(null);

/**
 * TileProvider - Context provider for managing tile expansion states and navigation
 * This allows components to communicate with each other about their expanded states
 * and helps coordinate fullscreen views so only one component is fullscreen at a time
 */
export function TileProvider({ children }) {
  // Track expanded and fullscreen states for all tiles
  const [expandedTiles, setExpandedTiles] = useState({});
  const [fullscreenTile, setFullscreenTile] = useState(null);
  
  // Track navigation history for returning to previous views
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  // Function to expand a tile
  const expandTile = useCallback((tileId) => {
    setExpandedTiles(prev => ({
      ...prev,
      [tileId]: true
    }));
  }, []);
  
  // Function to collapse a tile
  const collapseTile = useCallback((tileId) => {
    setExpandedTiles(prev => ({
      ...prev,
      [tileId]: false
    }));
  }, []);
  
  // Function to toggle a tile's expanded state
  const toggleTileExpanded = useCallback((tileId) => {
    setExpandedTiles(prev => ({
      ...prev,
      [tileId]: !prev[tileId]
    }));
  }, []);
  
  // Function to make a tile fullscreen (and ensure other tiles are not)
  const setTileFullscreen = useCallback((tileId) => {
    // Store current state for returning later
    if (fullscreenTile !== tileId) {
      setNavigationHistory(prev => [...prev, fullscreenTile]);
    }
    
    setFullscreenTile(tileId);
  }, [fullscreenTile]);
  
  // Function to exit fullscreen
  const exitFullscreen = useCallback(() => {
    // Return to previous fullscreen tile if there was one
    const prevTile = navigationHistory.length > 0 
      ? navigationHistory[navigationHistory.length - 1] 
      : null;
    
    setFullscreenTile(prevTile);
    
    if (navigationHistory.length > 0) {
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  }, [navigationHistory]);
  
  // Function to check if a tile is expanded
  const isTileExpanded = useCallback((tileId) => {
    return !!expandedTiles[tileId];
  }, [expandedTiles]);
  
  // Function to check if a tile is fullscreen
  const isTileFullscreen = useCallback((tileId) => {
    return fullscreenTile === tileId;
  }, [fullscreenTile]);
  
  // Function to collapse all tiles
  const collapseAllTiles = useCallback(() => {
    setExpandedTiles({});
  }, []);
  
  // Track the last viewed detail pages for each section
  const [lastViewedPages, setLastViewedPages] = useState({});
  
  // Function to set the last viewed page for a section
  const setLastViewedPage = useCallback((section, pageId) => {
    setLastViewedPages(prev => ({
      ...prev,
      [section]: pageId
    }));
  }, []);
  
  // Function to get the last viewed page for a section
  const getLastViewedPage = useCallback((section) => {
    return lastViewedPages[section];
  }, [lastViewedPages]);
  
  // Context value
  const contextValue = {
    expandedTiles,
    fullscreenTile,
    navigationHistory,
    expandTile,
    collapseTile,
    toggleTileExpanded,
    setTileFullscreen,
    exitFullscreen,
    isTileExpanded,
    isTileFullscreen,
    collapseAllTiles,
    setLastViewedPage,
    getLastViewedPage
  };
  
  return (
    <TileContext.Provider value={contextValue}>
      {children}
    </TileContext.Provider>
  );
}

// Hook for using the tile context
export function useTile() {
  const context = useContext(TileContext);
  
  if (!context) {
    throw new Error('useTile must be used within a TileProvider');
  }
  
  return context;
}

export default TileContext;