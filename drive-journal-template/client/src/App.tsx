import React from 'react';
import { Route, Router, Switch } from 'wouter';
import DriveJournalPage from './pages/drive-journal-page';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black bg-carbon-fiber text-white">
        <Switch>
          <Route path="/" component={DriveJournalPage} />
          <Route path="/drive-journal/new">
            {() => <DriveJournalPage />}
          </Route>
          <Route>
            {() => (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-400 mb-4">404 - Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                    Return to Drive Journal
                  </a>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;