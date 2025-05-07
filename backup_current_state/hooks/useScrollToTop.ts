import { useEffect, useRef } from 'react';
import { MAIN_CONTENT_ID } from '../lib/accessibility';

/**
 * Simple hook that scrolls to the top of the page when called
 */
export function useScrollToTop() {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Basic scroll to top functionality
    window.scrollTo(0, 0);
    
    // Additional scrolling for specific elements
    const mainContent = document.getElementById(MAIN_CONTENT_ID);
    if (mainContent) {
      mainContent.scrollTop = 0;
      // Focus the main content area for accessibility
      mainContent.focus();
    }
  }, [window.location.pathname]);
}