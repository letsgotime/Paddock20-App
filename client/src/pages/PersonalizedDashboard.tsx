import React, { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { Gauge, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PersonalizedDashboard: React.FC = () => {
  const theme = useDashboardStore(state => state.theme);
  const hasCompletedOnboarding = useDashboardStore(state => state.hasCompletedOnboarding);
  
  // Get background classes based on theme
  const getBackgroundClasses = () => {
    switch (theme.backgroundStyle) {
      case 'carbon-fiber':
        return 'bg-black bg-opacity-95 bg-[url("/assets/textures/carbon-fiber.png")] bg-repeat';
      case 'race-track':
        return 'bg-black bg-opacity-90 bg-[url("/assets/textures/race-track.png")] bg-center bg-cover';
      case 'f1-telemetry':
        return 'bg-gray-950 bg-[url("/assets/textures/telemetry-grid.png")] bg-repeat';
      case 'minimal':
      default:
        return 'bg-gray-950';
    }
  };
  
  // Show onboarding dialog if user hasn't completed it
  useEffect(() => {
    // This would trigger the onboarding modal in a real implementation
  }, [hasCompletedOnboarding]);
  
  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      {/* Page header */}
      <div className="pt-6 pb-4 px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-blue-300">Personalized Dashboard</h1>
            <p className="text-gray-400">Your customized PADDOCK20 command center</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/settings/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 rounded-md"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            
            <div className="px-3 py-1.5 bg-green-900/30 rounded-md border border-green-700/50">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">BETA</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick navigation links */}
        <div className="flex items-center gap-x-6 gap-y-2 flex-wrap mt-4 text-sm">
          <Link to="/garage-vault" className="flex items-center text-blue-400 hover:text-blue-300">
            <span>Garage Vault</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
          
          <Link to="/weather-paddock" className="flex items-center text-blue-400 hover:text-blue-300">
            <span>Weather Paddock</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
          
          <Link to="/drive-journal" className="flex items-center text-blue-400 hover:text-blue-300">
            <span>Drive Journal</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
          
          <Link to="/juicebox" className="flex items-center text-blue-400 hover:text-blue-300">
            <span>Juice Box</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
          
          <Link to="/profile" className="flex items-center text-blue-400 hover:text-blue-300">
            <span>My Profile</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      {/* Main dashboard grid */}
      <DashboardGrid />
    </div>
  );
};

export default PersonalizedDashboard;