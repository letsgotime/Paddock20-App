import React from 'react';
import { useDashboard } from '../hooks/useDashboard';

/**
 * DashboardLayout - Flexible grid layout for dashboard components
 */
const DashboardLayout = ({ 
  config, 
  children, 
  className = '',
  gridClassName = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  sectionClassName = ''
}) => {
  const { dashboard } = useDashboard(config);

  return (
    <div className={`${className}`}>
      {dashboard.sections.map((section) => (
        <div key={section.id} className={`mb-8 ${sectionClassName}`}>
          {section.title && (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                {section.icon && <span className="mr-2">{section.icon}</span>}
                {section.title}
              </h2>
              {section.description && (
                <p className="text-gray-400 text-sm mt-1">{section.description}</p>
              )}
            </div>
          )}
          
          <div className={`grid gap-4 ${gridClassName}`}>
            {section.components.map((component) => (
              <div 
                key={component.id} 
                className={`${component.span === 'full' ? 'md:col-span-2 lg:col-span-3' : ''}`}
              >
                {React.Children.toArray(children).find(
                  (child) => React.isValidElement(child) && child.props.id === component.id
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardLayout;