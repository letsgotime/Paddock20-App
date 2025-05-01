import React from 'react';
import { Route, Switch } from 'wouter';
import { WeatherProvider } from './contexts/WeatherContext';
import LocationProvider from './contexts/LocationContext';
import { UnitsProvider } from './contexts/UnitsContext';
import { TileProvider } from './contexts/TileContext';
import WeatherRouteAnalysisPage from './pages/WeatherRouteAnalysisPage';
import F1PitWallDashboard from './components/F1PitWallDashboard';
import ExpandedTileView from './pages/ExpandedTileView';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <UnitsProvider>
      <LocationProvider>
        <WeatherProvider>
          <TileProvider>
            <div className="min-h-screen bg-gray-900 text-white">
              <Switch>
                <Route path="/" component={F1PitWallDashboard} />
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