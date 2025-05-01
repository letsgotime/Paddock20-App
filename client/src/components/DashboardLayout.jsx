import React from 'react';
import { Menu, X, ChevronUp, ChevronDown, ExternalLink, Settings } from 'lucide-react';
import useDashboard from '../hooks/useDashboard';

// Import all possible dashboard components 
import CitySearch from './CitySearch';
import LocationManager from './LocationManager';
import CommuteTimeEstimator from './CommuteTimeEstimator';
import WeatherAlertsDashboard from './WeatherAlertsDashboard';
import DriveModeRecommendations from './DriveModeRecommendations';
import TimedSurfacePredictions from './TimedSurfacePredictions';
import MultiLocationComparison from './MultiLocationComparison';
import WeatherImpactIndicator from './WeatherImpactIndicator';
import UnitToggle from './UnitToggle';
import LocationPermissionPrompt from './LocationPermissionPrompt';

/**
 * DashboardLayout - Component for rendering the dashboard layout based on configuration
 * This is the main layout component that uses the dashboard configuration system
 */
function DashboardLayout() {
  // Get dashboard configuration and state management
  const dashboard = useDashboard();
  
  // Map of component ID to actual component
  const componentMap = {
    'location-search': CitySearch,
    'location-manager': LocationManager,
    'commute-time': CommuteTimeEstimator,
    'weather-alerts': WeatherAlertsDashboard,
    'drive-mode': DriveModeRecommendations,
    'surface-forecast': TimedSurfacePredictions,
    'location-comparison': MultiLocationComparison
  };
  
  // Render a dashboard component by ID
  const renderComponent = (component) => {
    if (!dashboard.isComponentVisible(component.id)) return null;
    
    const Component = componentMap[component.id];
    if (!Component) return null;
    
    const isCollapsed = dashboard.isComponentCollapsed(component.id);
    
    return (
      <div 
        key={component.id} 
        className="mb-6 relative"
        data-component-id={component.id}
      >
        {component.config?.showHeader !== false && (
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              {component.config?.showIcon && component.icon && (
                <span className="mr-2 text-gray-400">{component.icon}</span>
              )}
              <h3 className="text-sm font-semibold text-gray-300">{component.title}</h3>
            </div>
            
            <div className="flex items-center space-x-1">
              {component.config?.movable !== false && (
                <>
                  <button 
                    onClick={() => dashboard.moveComponent(component.id, 'up')}
                    className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    title="Move up"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button 
                    onClick={() => dashboard.moveComponent(component.id, 'down')}
                    className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    title="Move down"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </>
              )}
              
              {component.config?.expandable && (
                <a 
                  href={component.config?.linkedTile?.route}
                  className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  title="Open in fullscreen"
                  aria-label="Open in fullscreen"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              
              {component.config?.collapsible !== false && (
                <button 
                  onClick={() => dashboard.toggleComponentCollapsed(component.id)}
                  className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  title={isCollapsed ? "Expand" : "Collapse"}
                  aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
              )}
            </div>
          </div>
        )}
        
        {!isCollapsed && <Component />}
      </div>
    );
  };
  
  // Render all components in a section
  const renderSection = (sectionId) => {
    const components = dashboard.getOrderedComponentsForSection(sectionId);
    return components.map(component => renderComponent(component));
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Navigation Header */}
      <div className="lg:hidden bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-xl font-bold">Weather Paddock</h1>
        <button 
          className="p-2 rounded-md bg-gray-700 hover:bg-gray-600"
          onClick={dashboard.toggleSidebar}
          aria-label={dashboard.sidebarVisible ? "Close sidebar" : "Open sidebar"}
        >
          {dashboard.sidebarVisible ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside 
          className={`lg:w-80 bg-gray-800/90 backdrop-blur-sm lg:min-h-screen lg:block p-4 lg:p-6 
            ${dashboard.sidebarVisible ? 'fixed inset-0 z-20' : 'hidden'}`}
        >
          {/* Sidebar Top Section */}
          <div className="mb-6">
            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl font-bold mb-1">Weather Paddock</h1>
              <p className="text-sm text-gray-400">Motorsport-Grade Weather Intelligence</p>
            </div>
            
            {renderSection(dashboard.sections.SIDEBAR_TOP)}
          </div>
          
          {/* Main Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {renderSection(dashboard.sections.SIDEBAR_MIDDLE)}
          </div>
          
          {/* Sidebar Bottom */}
          <div className="mt-6">
            {renderSection(dashboard.sections.SIDEBAR_BOTTOM)}
            
            {/* Settings button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <button 
                  className="flex items-center hover:text-gray-200"
                  onClick={() => {/* Open settings dialog */}}
                >
                  <Settings size={14} className="mr-1" />
                  Settings
                </button>
                
                <div className="flex space-x-2">
                  <UnitToggle />
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Dashboard Header */}
          <div className="hidden lg:flex mb-8 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">F1 Weather Intelligence Center</h2>
              <p className="text-sm text-gray-400">Real-time weather data and drive mode recommendations</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View mode selector */}
              <div className="flex bg-gray-800 rounded-md p-1">
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${dashboard.viewMode === 'compact' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                  onClick={() => dashboard.setDashboardViewMode('compact')}
                >
                  Compact
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${dashboard.viewMode === 'normal' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                  onClick={() => dashboard.setDashboardViewMode('normal')}
                >
                  Normal
                </button>
                <button 
                  className={`px-3 py-1 text-xs rounded-md ${dashboard.viewMode === 'expanded' ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                  onClick={() => dashboard.setDashboardViewMode('expanded')}
                >
                  Expanded
                </button>
              </div>
            </div>
          </div>
          
          {/* Alert Notifications */}
          <LocationPermissionPrompt />
          
          {/* Dashboard Content Grid */}
          <div className={`grid gap-6 ${
            dashboard.viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
            dashboard.viewMode === 'expanded' ? 'grid-cols-1 lg:grid-cols-2' : 
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
          }`}>
            {/* Alerts Section */}
            <div className={`${
              dashboard.viewMode === 'compact' ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4' :
              dashboard.viewMode === 'expanded' ? 'col-span-1 lg:col-span-2' :
              'col-span-1 lg:col-span-2 xl:col-span-3'
            }`}>
              {renderSection(dashboard.sections.ALERTS)}
            </div>
            
            {/* Vehicle Section */}
            <div className={`${
              dashboard.viewMode === 'compact' ? 'col-span-1' :
              dashboard.viewMode === 'expanded' ? 'col-span-1 lg:col-span-2' :
              'col-span-1 lg:col-span-1'
            }`}>
              {renderSection(dashboard.sections.VEHICLE)}
            </div>
            
            {/* Forecasts Section */}
            <div className={`${
              dashboard.viewMode === 'compact' ? 'col-span-1 md:col-span-2' :
              dashboard.viewMode === 'expanded' ? 'col-span-1 lg:col-span-2' :
              'col-span-1 lg:col-span-2'
            }`}>
              {renderSection(dashboard.sections.FORECASTS)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;