import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook to handle scroll position restoration when navigating
 * 
 * This hook automatically saves scroll positions for each page in session storage
 * and restores them when the user navigates back to the page.
 * 
 * @param {string} storageKey - Optional custom key for storing scroll positions in sessionStorage
 * @param {number} delay - Optional delay in ms before restoring scroll position (default: 0)
 */
const useScrollRestoration = (storageKey = 'scroll_positions', delay = 0) => {
  const [location] = useLocation();
  
  // Save scroll position when user navigates away
  useEffect(() => {
    // Function to save current scroll position
    const saveScrollPosition = () => {
      try {
        // Get existing scroll positions from session storage
        const scrollPositions = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
        
        // Update with current location's scroll position
        scrollPositions[location] = {
          x: window.scrollX,
          y: window.scrollY
        };
        
        // Save back to session storage
        sessionStorage.setItem(storageKey, JSON.stringify(scrollPositions));
      } catch (error) {
        console.error('Error saving scroll position:', error);
      }
    };
    
    // Add event listeners
    window.addEventListener('scroll', saveScrollPosition);
    
    // Cleanup
    return () => {
      // Save scroll position one last time before unmounting
      saveScrollPosition();
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [location, storageKey]);
  
  // Restore scroll position when page loads
  useEffect(() => {
    try {
      const scrollPositions = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      const savedPosition = scrollPositions[location];
      
      if (savedPosition) {
        // Restore position after a small delay to ensure page is fully loaded
        const timer = setTimeout(() => {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'auto' // Use 'auto' instead of 'smooth' for faster restoration
          });
        }, delay);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error restoring scroll position:', error);
    }
  }, [location, storageKey, delay]);
  
  // Expose method to manually save current scroll position
  const saveCurrentPosition = (customLocation) => {
    try {
      const path = customLocation || location;
      const scrollPositions = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      
      scrollPositions[path] = {
        x: window.scrollX,
        y: window.scrollY
      };
      
      sessionStorage.setItem(storageKey, JSON.stringify(scrollPositions));
    } catch (error) {
      console.error('Error manually saving scroll position:', error);
    }
  };
  
  // Expose method to manually restore a saved scroll position
  const restorePosition = (customLocation) => {
    try {
      const path = customLocation || location;
      const scrollPositions = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
      const savedPosition = scrollPositions[path];
      
      if (savedPosition) {
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'auto'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error manually restoring scroll position:', error);
      return false;
    }
  };
  
  return {
    saveCurrentPosition,
    restorePosition
  };
};

export default useScrollRestoration;