import React, { ReactNode, useState } from 'react';
import { WidgetSize, DashboardWidget as WidgetType, useDashboardStore } from '@/store/dashboardStore';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Settings, 
  Workflow, 
  PanelRight, 
  PanelTop, 
  PanelBottom,
  Info
} from 'lucide-react';
import ContextTooltip from '../ui/ContextTooltip';

interface DashboardWidgetProps {
  widget: WidgetType;
  children: ReactNode;
  onConfigureWidget?: () => void;
  explanationContent?: string | ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, 
  children,
  onConfigureWidget,
  explanationContent
}) => {
  const [expanded, setExpanded] = useState(false);
  const removeWidget = useDashboardStore(state => state.removeWidget);
  const updateWidget = useDashboardStore(state => state.updateWidget);
  
  // Widget size classes
  const getSizeClasses = () => {
    if (expanded) {
      return 'col-span-12 md:col-span-12 row-span-2';
    }
    
    switch (widget.size) {
      case 'small':
        return 'col-span-12 md:col-span-4 row-span-1';
      case 'medium':
        return 'col-span-12 md:col-span-6 row-span-1';
      case 'large':
        return 'col-span-12 md:col-span-8 row-span-1';
      default:
        return 'col-span-12 md:col-span-6 row-span-1';
    }
  };
  
  const toggleSize = (size: WidgetSize) => {
    updateWidget(widget.id, { size });
  };
  
  return (
    <div 
      className={`${getSizeClasses()} p-0 rounded-lg overflow-hidden transition-all duration-300`}
      data-widget-id={widget.id}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm border border-blue-900/50 shadow-lg h-full flex flex-col rounded-lg relative">
        {/* Widget Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-blue-900/30 border-b border-blue-900/50 group">
          <div className="flex items-center">
            <h3 className="text-blue-300 font-semibold">{widget.title}</h3>
            
            {/* Explanation tooltip for widget */}
            {explanationContent && (
              <div className="ml-2">
                <ContextTooltip
                  content={explanationContent}
                  position="top"
                  variant="f1"
                >
                  <Info className="h-4 w-4 text-blue-400 cursor-help" />
                </ContextTooltip>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {/* Size Controls */}
            {!expanded && (
              <>
                <button 
                  onClick={() => toggleSize('small')}
                  className={`p-1 rounded-md hover:bg-blue-800/50 ${widget.size === 'small' ? 'bg-blue-800/50 text-blue-300' : 'text-gray-400'}`}
                  aria-label="Small size"
                >
                  <PanelRight className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => toggleSize('medium')}
                  className={`p-1 rounded-md hover:bg-blue-800/50 ${widget.size === 'medium' ? 'bg-blue-800/50 text-blue-300' : 'text-gray-400'}`}
                  aria-label="Medium size"
                >
                  <PanelTop className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => toggleSize('large')}
                  className={`p-1 rounded-md hover:bg-blue-800/50 ${widget.size === 'large' ? 'bg-blue-800/50 text-blue-300' : 'text-gray-400'}`}
                  aria-label="Large size"
                >
                  <PanelBottom className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            
            {/* Configure button */}
            {onConfigureWidget && (
              <button 
                onClick={onConfigureWidget}
                className="p-1 rounded-md hover:bg-blue-800/50 text-gray-400 hover:text-white"
                aria-label="Configure widget"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            )}
            
            {/* Expand/Contract button */}
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded-md hover:bg-blue-800/50 text-gray-400 hover:text-white"
              aria-label={expanded ? "Contract widget" : "Expand widget"}
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            
            {/* Close button */}
            <button 
              onClick={() => removeWidget(widget.id)}
              className="p-1 rounded-md hover:bg-red-900/50 text-gray-400 hover:text-red-400"
              aria-label="Remove widget"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        {/* Widget Content */}
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget;