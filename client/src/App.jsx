import React from 'react';
import { Route, Switch } from 'wouter';
import { SimpleWeatherProvider } from './contexts/SimpleWeatherContext';
import LocationProvider from './contexts/LocationContext';
import { UnitsProvider } from './contexts/UnitsContext';
import WeatherRouteAnalysisPage from './pages/WeatherRouteAnalysisPage';
import F1PitWallDashboard from './components/F1PitWallDashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <UnitsProvider>
      <LocationProvider>
        <SimpleWeatherProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Switch>
              <Route path="/" component={F1PitWallDashboard} />
              <Route path="/route-analysis" component={WeatherRouteAnalysisPage} />
            </Switch>
            <Toaster />
          </div>
        </SimpleWeatherProvider>
      </LocationProvider>
    </UnitsProvider>
  );
}

export default App;