import { Route, Switch } from "wouter";
import F1WeatherCenterPage from "./pages/F1WeatherCenterPage";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <main>
          <Switch>
            <Route path="/" component={F1WeatherCenterPage} />
          </Switch>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;