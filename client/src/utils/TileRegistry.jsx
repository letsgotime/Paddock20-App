import React, { useEffect } from 'react';
import { useTileSystem } from '../contexts/TileContext';

/**
 * RegisterTile - Component to register a tile with the TileSystem
 * This is used to automatically register/unregister tiles for navigation
 */
export function RegisterTile({ 
  id, 
  title, 
  icon = null,
  order = 0 
}) {
  const { registerTile } = useTileSystem();
  
  useEffect(() => {
    // Register this tile with the system
    const unregister = registerTile({
      id,
      title,
      icon,
      order
    });
    
    // Return cleanup function that will be called when component unmounts
    return unregister;
  }, [id, title, icon, order, registerTile]);
  
  // This component doesn't render anything
  return null;
}

/**
 * withTileRegistration - Higher Order Component to register a component as a tile
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} tileProps - Properties for the tile registration
 * @returns {React.ComponentType} - The wrapped component
 */
export function withTileRegistration(Component, tileProps) {
  function WithTileRegistration(props) {
    return (
      <>
        <RegisterTile {...tileProps} />
        <Component {...props} />
      </>
    );
  }
  
  WithTileRegistration.displayName = `WithTileRegistration(${
    Component.displayName || Component.name || 'Component'
  })`;
  
  return WithTileRegistration;
}