import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { updatePageTitleFromPath } from '../utils/pageTitle';

/**
 * Component that manages document title based on current location.
 * 
 * This component doesn't render anything visible, but updates the document
 * title whenever the route changes.
 */
const PageTitleManager: React.FC = () => {
  // In wouter, useLocation returns [pathname, navigate]
  const [pathname] = useLocation();
  
  useEffect(() => {
    // Update the page title when the route changes
    updatePageTitleFromPath(pathname);
    
    // Debug log
    console.log(`Page title updated for route: ${pathname}`);
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
};

export default PageTitleManager;