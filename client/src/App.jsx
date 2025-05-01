import React from 'react';
import { Route, Switch } from 'wouter';
import { WeatherProvider } from './contexts/WeatherContext';
import LocationProvider from './contexts/LocationContext';
import { UnitsProvider } from './contexts/UnitsContext';
import WeatherRouteAnalysisPage from './pages/WeatherRouteAnalysisPage';
import F1PitWallDashboard from './components/F1PitWallDashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <UnitsProvider>
      <LocationProvider>
        <WeatherProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Switch>
              <Route path="/" component={F1PitWallDashboard} />
              <Route path="/route-analysis" component={WeatherRouteAnalysisPage} />
            </Switch>
            <Toaster />
          </div>
        </WeatherProvider>
      </LocationProvider>
    </UnitsProvider>
  );
}

export default App;