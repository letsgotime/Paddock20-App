import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updatePageTitleFromPath } from '../utils/pageTitle';

/**
 * Component that manages document title based on current location.
 * 
 * This component doesn't render anything visible, but updates the document
 * title whenever the route changes.
 */
const PageTitleManager: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Update the page title when the route changes
    updatePageTitleFromPath(location.pathname);
    
    // Debug log
    console.log(`Page title updated for route: ${location.pathname}`);
  }, [location.pathname]);
  
  // This component doesn't render anything
  return null;
};

export default PageTitleManager;