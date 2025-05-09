import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { MAIN_CONTENT_ID } from '../lib/accessibility';

/**
 * Enhanced custom hook that intelligently manages scroll position during navigation:
 * - Scrolls to top for new page navigations
 * - Preserves scroll position when using browser back/forward buttons
 * - Focuses main content area for accessibility
 */
export function useScrollToTop() {
  const { pathname } = useLocation();
  const lastNavAction = useRef<'push' | 'pop' | null>(null);
  const lastPathname = useRef<string | null>(null);
  
  // When component mounts, add navigation listener
  useEffect(() => {
    // Detect push vs pop state navigation
    const handlePushState = () => {
      lastNavAction.current = 'push';
    };
    
    const handlePopState = () => {
      lastNavAction.current = 'pop';
    };
    
    // Capture browser back/forward vs regular navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      lastNavAction.current = 'push';
      return originalPushState.apply(this, arguments as any);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Handle scroll behavior when pathname changes
  useEffect(() => {
    // Skip initial render
    if (lastPathname.current === null) {
      lastPathname.current = pathname;
      return;
    }
    
    // For new forward navigation (not back/forward buttons), scroll to top
    if (lastNavAction.current !== 'pop') {
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
      
      console.log(`Scrolled to top for new route: ${pathname}`);
    } else {
      // For back/forward navigation, browser will automatically restore scroll position
      console.log(`Preserving scroll position for browser navigation to: ${pathname}`);
    }
    
    // Update the last pathname for next comparison
    lastPathname.current = pathname;
    
    // Reset the navigation action type
    lastNavAction.current = null;
  }, [pathname]);
}