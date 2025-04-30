import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
// Direct import to avoid possible path issues
import F1WeatherCenterPage from "./pages/F1WeatherCenterPage";

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