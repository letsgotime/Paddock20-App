import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MAIN_CONTENT_ID } from '../lib/accessibility';

/**
 * Enhanced custom hook that forcefully scrolls to the top of the page when the route changes
 * This ensures users always start at the top of a new page, even with complex layouts
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // First try immediate scrolling with auto behavior - most reliable
    window.scrollTo(0, 0);
    
    // Then as a backup, also try the smooth scrolling method
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
    
    // As a final fallback for stubborn cases or nested scrollable elements
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    
    // If there are any specific scrollable containers, reset those too
    const mainContent = document.getElementById(MAIN_CONTENT_ID);
    if (mainContent) {
      mainContent.scrollTop = 0;
      
      // Force focus to the main content area for better accessibility
      // This also helps ensure the visual focus is at the top of the page
      mainContent.focus();
    }
    
    // Log for monitoring
    console.log(`Scrolled to top for route: ${pathname}`);
  }, [pathname]);
}