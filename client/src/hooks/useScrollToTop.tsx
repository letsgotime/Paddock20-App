import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that scrolls to the top of the page when the route changes
 * This ensures users always start at the top of a new page
 */
const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Using 'auto' for immediate scrolling
    });
  }, [pathname]);
};

export default useScrollToTop;