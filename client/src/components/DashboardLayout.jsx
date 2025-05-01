import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

/**
 * DashboardLayout - Renders the dashboard based on configuration
 */
const DashboardLayout = ({ config, children }) => {
  const { dashboard } = useDashboard(config);
  
  // Create a map of child components by their ID
  const childrenMap = React.Children.toArray(children).reduce((acc, child) => {
    if (child.props && child.props.id) {
      acc[child.props.id] = child;
    }
    return acc;
  }, {});
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Render each section */}
      {dashboard.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center space-x-2">
            {section.icon && <div>{section.icon}</div>}
            <div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              {section.description && (
                <p className="text-sm text-gray-400">{section.description}</p>
              )}
            </div>
          </div>
          
          {/* Section Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.components && section.components.map((component) => {
              const child = childrenMap[component.id];
              
              if (!child) return null;
              
              return (
                <div 
                  key={component.id} 
                  className={component.span === 'full' ? 'col-span-1 md:col-span-2' : 'col-span-1'}
                >
                  {child}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardLayout;