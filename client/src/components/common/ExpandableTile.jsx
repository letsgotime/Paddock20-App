import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

/**
 * ExpandableTile - A reusable component for creating expandable/collapsible content sections
 * with consistent styling and behavior across the application.
 * 
 * @param {Object} props Component props
 * @param {ReactNode} props.children Content to display inside the tile
 * @param {ReactNode} props.previewContent Content to show in collapsed state
 * @param {String} props.title Title of the tile
 * @param {String} props.accentColor Color of the indicator dot (default: "bg-blue-500")
 * @param {String} props.expandHint Text shown in collapsed state to prompt expansion
 * @param {Function} props.onExpand Callback when tile is expanded
 * @param {Function} props.onCollapse Callback when tile is collapsed
 * @param {Function} props.onFullscreen Callback when tile enters fullscreen
 * @param {Function} props.onExitFullscreen Callback when tile exits fullscreen
 * @param {boolean} props.defaultExpanded Whether the tile should be expanded by default
 * @param {Object} props.metadata Optional metadata to display in the expanded view
 * @param {Function} props.renderTabContent Function to render tab content if tabs are enabled
 * @param {Array} props.tabs Array of tab objects if the component has tabs
 * @param {boolean} props.hasBorder Whether to show border (default: true)
 * @param {String} props.className Additional classes for the container
 */
function ExpandableTile({ 
  children,
  previewContent,
  title,
  accentColor = "bg-blue-500",
  expandHint = "Click to expand for more details",
  onExpand,
  onCollapse,
  onFullscreen,
  onExitFullscreen,
  defaultExpanded = false,
  metadata,
  renderTabContent,
  tabs,
  hasBorder = true,
  className = "",
  linkTo,
  linkText
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].id : null);

  // Handle expansion toggle
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (newExpandedState && onExpand) {
      onExpand();
    } else if (!newExpandedState && onCollapse) {
      onCollapse();
    }
  };

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    if (newFullscreenState && onFullscreen) {
      onFullscreen();
    } else if (!newFullscreenState && onExitFullscreen) {
      onExitFullscreen();
    }
  };

  // Full-screen styles to be applied conditionally
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
    padding: '1.5rem'
  } : {};

  return (
    <div 
      className={`bg-gray-800/80 rounded-lg ${hasBorder ? 'border border-gray-700' : ''} p-4 mb-4 transition-all duration-300 ${
        isFullscreen ? 'bg-gray-900' : ''
      } ${className}`}
      style={fullscreenStyles}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center">
          <span className={`h-2 w-2 ${accentColor} rounded-full mr-2`}></span>
          {title}
        </h3>

        <div className="flex items-center space-x-2">
          {/* External Link Button (if provided) */}
          {linkTo && (
            <a
              href={linkTo}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              aria-label={linkText || "Open external link"}
              title={linkText || "Open external link"}
            >
              <ExternalLink size={16} />
            </a>
          )}
          
          {/* Expand/Collapse Button */}
          <button 
            onClick={handleToggleExpand}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {/* Fullscreen Button */}
          <button 
            onClick={handleToggleFullscreen}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      {/* Preview/collapsed view */}
      {!isExpanded && !isFullscreen && previewContent && (
        <div className="cursor-pointer" onClick={handleToggleExpand}>
          {previewContent}
          
          <div className="text-center text-xs text-blue-400 hover:text-blue-300 mt-3">
            {expandHint}
          </div>
        </div>
      )}
      
      {/* Expanded or fullscreen view */}
      {(isExpanded || isFullscreen) && (
        <div className="space-y-3">
          {/* Tabs navigation (if tabs provided) */}
          {tabs && tabs.length > 0 && (
            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium flex items-center whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-blue-400 border-b-2 border-blue-400' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Main content */}
          <div className="space-y-4">
            {/* If we have tabs and a render function, use it */}
            {tabs && tabs.length > 0 && renderTabContent 
              ? renderTabContent(activeTab, isFullscreen)
              : children}
            
            {/* Metadata section - shown only in fullscreen */}
            {isFullscreen && metadata && (
              <div className="mt-5 pt-3 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-2">Additional Information</div>
                <div className="bg-gray-900/60 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(metadata).map(([key, value], index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpandableTile;