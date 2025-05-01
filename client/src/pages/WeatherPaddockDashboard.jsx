import React from 'react';
import { TileProvider } from '../contexts/TileContext';
import DashboardLayout from '../components/DashboardLayout';

/**
 * WeatherPaddockDashboard - Main dashboard page using the new scalable layout system
 * This page replaces the older F1PitWallDashboard component with a more modular, configurable version
 */
function WeatherPaddockDashboard() {
  return (
    <TileProvider>
      <DashboardLayout />
    </TileProvider>
  );
}

export default WeatherPaddockDashboard;