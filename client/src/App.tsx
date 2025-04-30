import React from 'react';
import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VehicleProvider } from './context/VehicleContext';

// Import pages
import HomePage from './pages/HomePage';
import EnhancedGarageVaultV2 from './pages/EnhancedGarageVaultV2';
import WeatherPage from './pages/WeatherPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import DriveJournalPage from './pages/DriveJournalPage';
import MarketplacePage from './pages/MarketplacePage';
import EventsCalendarPage from './pages/EventsCalendarPage';
import BrokerPortalPage from './pages/BrokerPortalPage';
import SettingsPage from './pages/SettingsPage';
import ManifestationStationPage from './pages/ManifestationStationPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a new query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <VehicleProvider>
        <div className="min-h-screen bg-black text-white">
          {/* Main content */}
          <main className="flex flex-col min-h-screen">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/garage" component={EnhancedGarageVaultV2} />
              <Route path="/weather" component={WeatherPage} />
              <Route path="/route-planner" component={RoutePlannerPage} />
              <Route path="/drive-journal" component={DriveJournalPage} />
              <Route path="/marketplace" component={MarketplacePage} />
              <Route path="/events" component={EventsCalendarPage} />
              <Route path="/broker" component={BrokerPortalPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/manifestation-station" component={ManifestationStationPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </main>
        </div>
      </VehicleProvider>
    </QueryClientProvider>
  );
};

export default App;