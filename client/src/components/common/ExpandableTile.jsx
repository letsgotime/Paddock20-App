import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronUp, ExternalLink, X, ArrowLeft } from 'lucide-react';

/**
 * ExpandableTile - A reusable component for expandable dashboard tiles
 * All tiles can be expanded to show more details and can go into fullscreen mode
 * 
 * @param {string} id - Unique identifier for the tile
 * @param {string} title - Title of the tile
 * @param {string} icon - Icon component or emoji for the tile
 * @param {string} color - Color for the title marker (e.g., 'red-500', 'blue-400')
 * @param {React.ReactNode} children - Content to be displayed inside the tile
 * @param {React.ReactNode} expandedContent - Content to be displayed when tile is expanded
 * @param {React.ReactNode} fullscreenContent - Content to be displayed when tile is in fullscreen mode
 * @param {Function} onNavigate - Function to call when navigation occurs
 */
function ExpandableTile({ 
  id,
  title, 
  icon = null, 
  color = 'blue-500',
  children,
  expandedContent,
  fullscreenContent,
  tabs = [],
  onNavigate = null,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : null);
  const [, navigate] = useLocation();
  
  // Detect if we're in a route-based fullscreen view
  useEffect(() => {
    const checkFullscreenRoute = () => {
      const path = window.location.pathname;
      if (path === `/detail/${id}`) {
        setIsFullscreen(true);
      }
    };
    
    checkFullscreenRoute();
    window.addEventListener('popstate', checkFullscreenRoute);
    
    return () => {
      window.removeEventListener('popstate', checkFullscreenRoute);
    };
  }, [id]);
  
  // Handle fullscreen toggle
  const handleFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen
      setIsFullscreen(false);
      if (onNavigate) {
        onNavigate('dashboard');
      } else {
        navigate('/');
      }
    } else {
      // Enter fullscreen
      setIsFullscreen(true);
      if (onNavigate) {
        onNavigate(`detail/${id}`);
      } else {
        navigate(`/detail/${id}`);
      }
    }
  };
  
  // Fullscreen styles
  const fullscreenStyles = isFullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 50,
    overflowY: 'auto',
    borderRadius: 0,
    padding: '1.5rem',
  } : {};
  
  // Render active tab content
  const renderTabContent = () => {
    if (!tabs.length || !activeTab) return fullscreenContent;
    
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    return activeTabData ? activeTabData.content : null;
  };
  
  return (
    <div
      className={`bg-gray-800/80 rounded-lg border border-gray-700 p-4 mb-4 transition-all duration-300 ${
        isFullscreen ? 'bg-gray-900' : ''
      } ${className}`}
      style={fullscreenStyles}
    >
      {/* Header with title and action buttons */}
      <div className="flex justify-between items-center mb-3">
        {isFullscreen ? (
          <div className="flex items-center">
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 mr-2"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-md font-semibold text-gray-200 flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              {title.toUpperCase()}
            </h3>
          </div>
        ) : (
          <h3 className="text-sm font-semibold text-gray-300 flex items-center">
            <span className={`h-2 w-2 bg-${color} rounded-full mr-2`}></span>
            {icon && <span className="mr-2">{icon}</span>}
            {title.toUpperCase()}
          </h3>
        )}

        <div className="flex items-center space-x-2">
          {!isFullscreen && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={handleFullscreen}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <X size={16} /> : <ExternalLink size={16} />}
          </button>
        </div>
      </div>
      
      {/* Tab navigation for fullscreen mode */}
      {isFullscreen && tabs.length > 0 && (
        <div className="mb-4 border-b border-gray-700">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium rounded-t-md whitespace-nowrap ${
                  activeTab === tab.id
                    ? `bg-gray-800 text-white border-b-2 border-${color}`
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Tab content for fullscreen mode */}
      {isFullscreen && renderTabContent()}
      
      {/* Collapsed view */}
      {!isExpanded && !isFullscreen && children}
      
      {/* Expanded view that's not fullscreen */}
      {isExpanded && !isFullscreen && expandedContent}
    </div>
  );
}

export default ExpandableTile;