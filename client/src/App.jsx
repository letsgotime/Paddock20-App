import React from 'react';
import { Switch, Route } from "wouter";
import WeatherPaddockDashboard from './pages/WeatherPaddockDashboard';
import WeatherProvider from './contexts/WeatherContext';
import LocationProvider from './contexts/LocationContext';
import { UnitsProvider } from './contexts/UnitsContext';

function App() {
  return (
    <LocationProvider>
      <UnitsProvider>
        <WeatherProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <Switch>
              <Route path="/" component={WeatherPaddockDashboard} />
              <Route>
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                    <p className="text-gray-400">The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              </Route>
            </Switch>
          </div>
        </WeatherProvider>
      </UnitsProvider>
    </LocationProvider>
  );
}

export default App;