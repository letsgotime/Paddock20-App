import React from 'react';
import { Route, Switch } from 'wouter';
import { WeatherProvider } from './contexts/WeatherContext';
import LocationProvider from './contexts/LocationContext';
import { UnitsProvider } from './contexts/UnitsContext';
import { TileProvider } from './contexts/TileContext';
import WeatherRouteAnalysisPage from './pages/WeatherRouteAnalysisPage';
import WeatherPaddockDashboard from './pages/WeatherPaddockDashboard'; 
import F1PitWallDashboard from './components/F1PitWallDashboard';  // Keep for backward compatibility
import ExpandedTileView from './pages/ExpandedTileView';
import { Toaster } from '@/components/ui/toaster';

function App() {
  // Check if we should use the new dashboard (you can change this based on a URL parameter or localStorage setting)
  const useNewDashboard = false; // Set to true to use the new dashboard

  return (
    <UnitsProvider>
      <LocationProvider>
        <WeatherProvider>
          <TileProvider>
            <div className="min-h-screen bg-gray-900 text-white">
              <Switch>
                <Route path="/" component={useNewDashboard ? WeatherPaddockDashboard : F1PitWallDashboard} />
                <Route path="/new-dashboard" component={WeatherPaddockDashboard} />
                <Route path="/route-analysis" component={WeatherRouteAnalysisPage} />
                <Route path="/tile/:id" component={ExpandedTileView} />
              </Switch>
              <Toaster />
            </div>
          </TileProvider>
        </WeatherProvider>
      </LocationProvider>
    </UnitsProvider>
  );
}

export default App;