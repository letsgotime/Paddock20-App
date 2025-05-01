import { useCallback, useState, useEffect } from 'react';
import dashboardConfig, { 
  getComponentsForSection, 
  getAllComponents,
  getComponent,
  DASHBOARD_SECTIONS 
} from '../utils/DashboardConfig';

/**
 * useDashboard - Custom hook for managing dashboard layout and components
 * Provides functions for controlling dashboard layout, visibility, and component positioning
 */
function useDashboard() {
  // Track component visibility and collapsed state
  const [componentStates, setComponentStates] = useState({});
  // Track custom component ordering
  const [componentOrder, setComponentOrder] = useState({});
  // Track dashboard view mode (normal, compact, expanded)
  const [viewMode, setViewMode] = useState('normal');
  // Track sidebar visibility on mobile
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  // Initialize component states from localStorage if available
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem('dashboardComponentStates');
      if (savedStates) {
        setComponentStates(JSON.parse(savedStates));
      }
      
      const savedOrder = localStorage.getItem('dashboardComponentOrder');
      if (savedOrder) {
        setComponentOrder(JSON.parse(savedOrder));
      }
      
      const savedViewMode = localStorage.getItem('dashboardViewMode');
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
    }
  }, []);
  
  // Save component states to localStorage when they change
  useEffect(() => {
    try {
      if (Object.keys(componentStates).length > 0) {
        localStorage.setItem('dashboardComponentStates', JSON.stringify(componentStates));
      }
    } catch (error) {
      console.error('Error saving component states:', error);
    }
  }, [componentStates]);
  
  // Save component order to localStorage when it changes
  useEffect(() => {
    try {
      if (Object.keys(componentOrder).length > 0) {
        localStorage.setItem('dashboardComponentOrder', JSON.stringify(componentOrder));
      }
    } catch (error) {
      console.error('Error saving component order:', error);
    }
  }, [componentOrder]);
  
  // Save view mode to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('dashboardViewMode', viewMode);
    } catch (error) {
      console.error('Error saving view mode:', error);
    }
  }, [viewMode]);
  
  /**
   * Toggle a component's visibility
   * @param {string} componentId - ID of the component
   */
  const toggleComponentVisibility = useCallback((componentId) => {
    setComponentStates(prevStates => ({
      ...prevStates,
      [componentId]: {
        ...prevStates[componentId],
        visible: !((prevStates[componentId] || {}).visible ?? true)
      }
    }));
  }, []);
  
  /**
   * Toggle a component's collapsed state
   * @param {string} componentId - ID of the component
   */
  const toggleComponentCollapsed = useCallback((componentId) => {
    setComponentStates(prevStates => ({
      ...prevStates,
      [componentId]: {
        ...prevStates[componentId],
        collapsed: !((prevStates[componentId] || {}).collapsed ?? false)
      }
    }));
  }, []);
  
  /**
   * Move a component within its section
   * @param {string} componentId - ID of the component to move
   * @param {string} direction - Direction to move ('up' or 'down')
   */
  const moveComponent = useCallback((componentId, direction) => {
    const component = getComponent(componentId);
    if (!component) return;
    
    const sectionComponents = getComponentsForSection(component.section);
    if (sectionComponents.length <= 1) return;
    
    const newOrder = { ...componentOrder };
    
    // Find current component positions
    const componentIds = sectionComponents.map(c => c.id);
    const currentIndex = componentIds.indexOf(componentId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Swap with previous component
      const targetId = componentIds[currentIndex - 1];
      newOrder[componentId] = (componentOrder[targetId] || sectionComponents[currentIndex - 1].order) - 1;
    } else if (direction === 'down' && currentIndex < componentIds.length - 1) {
      // Swap with next component
      const targetId = componentIds[currentIndex + 1];
      newOrder[componentId] = (componentOrder[targetId] || sectionComponents[currentIndex + 1].order) + 1;
    }
    
    setComponentOrder(newOrder);
  }, [componentOrder]);
  
  /**
   * Move a component to a different section
   * @param {string} componentId - ID of the component to move
   * @param {string} targetSection - Section to move the component to
   */
  const moveComponentToSection = useCallback((componentId, targetSection) => {
    if (!Object.values(DASHBOARD_SECTIONS).includes(targetSection)) return;
    
    const component = getComponent(componentId);
    if (!component) return;
    
    // Create a custom dashboard component override
    const customComponents = { ...getAllComponents() };
    customComponents[componentId] = {
      ...component,
      section: targetSection
    };
    
    // Update localStorage with custom component configuration
    try {
      localStorage.setItem('dashboardCustomComponents', JSON.stringify(customComponents));
    } catch (error) {
      console.error('Error saving custom components:', error);
    }
    
    // Force reload to apply changes (in a real implementation, we would update state)
    window.location.reload();
  }, []);
  
  /**
   * Check if a component is visible
   * @param {string} componentId - ID of the component
   * @returns {boolean} Whether the component is visible
   */
  const isComponentVisible = useCallback((componentId) => {
    return (componentStates[componentId]?.visible ?? true);
  }, [componentStates]);
  
  /**
   * Check if a component is collapsed
   * @param {string} componentId - ID of the component
   * @returns {boolean} Whether the component is collapsed
   */
  const isComponentCollapsed = useCallback((componentId) => {
    const component = getComponent(componentId);
    const defaultCollapsed = component?.config?.collapsed || false;
    return (componentStates[componentId]?.collapsed ?? defaultCollapsed);
  }, [componentStates]);
  
  /**
   * Get ordered components for a section
   * @param {string} section - Section ID
   * @returns {Array} Ordered array of components
   */
  const getOrderedComponentsForSection = useCallback((section) => {
    const components = getComponentsForSection(section);
    
    return components.sort((a, b) => {
      // Use custom order if available, otherwise use component's default order
      const orderA = componentOrder[a.id] !== undefined ? componentOrder[a.id] : a.order;
      const orderB = componentOrder[b.id] !== undefined ? componentOrder[b.id] : b.order;
      return orderA - orderB;
    });
  }, [componentOrder]);
  
  /**
   * Reset dashboard to default configuration
   */
  const resetDashboard = useCallback(() => {
    localStorage.removeItem('dashboardComponentStates');
    localStorage.removeItem('dashboardComponentOrder');
    localStorage.removeItem('dashboardViewMode');
    localStorage.removeItem('dashboardCustomComponents');
    
    setComponentStates({});
    setComponentOrder({});
    setViewMode('normal');
    setSidebarVisible(false);
    
    // Force reload to apply changes
    window.location.reload();
  }, []);
  
  /**
   * Toggle sidebar visibility on mobile
   */
  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);
  
  // Change dashboard view mode
  const setDashboardViewMode = useCallback((mode) => {
    if (['normal', 'compact', 'expanded'].includes(mode)) {
      setViewMode(mode);
    }
  }, []);
  
  return {
    // Dashboard sections and components
    sections: DASHBOARD_SECTIONS,
    components: getAllComponents(),
    
    // Component state management
    toggleComponentVisibility,
    toggleComponentCollapsed,
    isComponentVisible,
    isComponentCollapsed,
    
    // Component ordering
    moveComponent,
    moveComponentToSection,
    getOrderedComponentsForSection,
    
    // Dashboard view modes
    viewMode,
    setDashboardViewMode,
    
    // Mobile sidebar
    sidebarVisible,
    toggleSidebar,
    
    // Reset dashboard
    resetDashboard
  };
}

export default useDashboard;