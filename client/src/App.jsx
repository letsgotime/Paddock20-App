import React from 'react';
import { Route, Switch } from 'wouter';
import { SimpleWeatherProvider } from './contexts/SimpleWeatherContext';
import LocationProvider from './contexts/LocationContext';
import WeatherRouteAnalysisPage from './pages/WeatherRouteAnalysisPage';
import F1PitWallDashboard from './components/F1PitWallDashboard';

function App() {
  return (
    <SimpleWeatherProvider>
      <LocationProvider>
        <div className="min-h-screen bg-gray-900 text-white">
          <Switch>
            <Route path="/" component={F1PitWallDashboard} />
            <Route path="/route-analysis" component={WeatherRouteAnalysisPage} />
          </Switch>
        </div>
      </LocationProvider>
    </SimpleWeatherProvider>
  );
}

export default App;