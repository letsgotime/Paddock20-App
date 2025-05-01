import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dashboard layout configuration
 */
export function useDashboard(initialConfig) {
  const [dashboard, setDashboard] = useState({
    sections: [],
    componentsMap: {}
  });
  
  // Process dashboard configuration into usable format
  useEffect(() => {
    if (!initialConfig) return;
    
    // Sort sections by order
    const sortedSections = [...initialConfig.sections].sort((a, b) => a.order - b.order);
    
    // Process each section to include sorted components
    const processedSections = sortedSections.map(section => {
      // Find components for this section
      const sectionComponents = Object.values(initialConfig.components)
        .filter(component => component.sectionId === section.id)
        .sort((a, b) => a.order - b.order);
      
      return {
        ...section,
        components: sectionComponents
      };
    });
    
    // Create a map of component ID to component data
    const componentsMap = Object.fromEntries(
      Object.entries(initialConfig.components).map(([id, component]) => [id, component])
    );
    
    setDashboard({
      sections: processedSections,
      componentsMap
    });
  }, [initialConfig]);
  
  // Function to get a component's configuration by ID
  const getComponentConfig = (componentId) => {
    return dashboard.componentsMap[componentId] || null;
  };
  
  // Function to get section by ID
  const getSection = (sectionId) => {
    return dashboard.sections.find(section => section.id === sectionId) || null;
  };
  
  return {
    dashboard,
    getComponentConfig,
    getSection
  };
}