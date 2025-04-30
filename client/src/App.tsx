import React from 'react';
import { Route, Switch } from 'wouter';
import F1WeatherCenterPage from './pages/F1WeatherCenterPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white">
        <Switch>
          <Route path="/" component={F1WeatherCenterPage} />
        </Switch>
      </div>
    </QueryClientProvider>
  );
}

export default App;