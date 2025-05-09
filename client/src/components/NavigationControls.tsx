import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useLocation, Link } from 'wouter';

// Constants for localStorage keys
const HISTORY_KEY = 'paddock20_navigation_history';
const CURRENT_INDEX_KEY = 'paddock20_navigation_index';

/**
 * NavigationControls - A persistent navigation bar for Paddock Dashboard
 * 
 * This component provides consistent back/forward/home navigation
 * that stays anchored to the bottom of the screen at all times.
 */
const NavigationControls: React.FC = () => {
  const [location, setLocation] = useLocation();
  const location = useLocation();
  
  // Navigation state
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isNavigatingRef = useRef(false);
  
  // Load history from localStorage on initial load with a fallback
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      const parsedHistory = savedHistory ? JSON.parse(savedHistory) : ['/'];
      return Array.isArray(parsedHistory) && parsedHistory.length > 0 
        ? parsedHistory 
        : ['/'];
    } catch (e) {
      console.error('Error loading navigation history:', e);
      return ['/'];
    }
  });
  
  // Load current index with safety checks
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const savedIndex = localStorage.getItem(CURRENT_INDEX_KEY);
      const parsedIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
      return !isNaN(parsedIndex) && parsedIndex >= 0 ? parsedIndex : 0;
    } catch (e) {
      console.error('Error loading navigation index:', e);
      return 0;
    }
  });

  // Debug function for development
  const logNavigationState = useCallback(() => {
    console.log('Navigation State:', {
      currentPath: location?.pathname,
      history: navigationHistory,
      currentIndex,
      canGoBack,
      canGoForward,
    });
  }, [location?.pathname, navigationHistory, currentIndex, canGoBack, canGoForward]);
  
  // Initialize history with current location if empty
  useEffect(() => {
    if (!location?.pathname) return;
    
    if (navigationHistory.length === 0) {
      setNavigationHistory([location.pathname]);
      setCurrentIndex(0);
    }
  }, [location?.pathname, navigationHistory.length]);

  // Persist navigation state whenever it changes
  useEffect(() => {
    if (navigationHistory.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(navigationHistory));
      localStorage.setItem(CURRENT_INDEX_KEY, currentIndex.toString());
      
      // Update navigation button states
      setCanGoBack(currentIndex > 0);
      setCanGoForward(currentIndex < navigationHistory.length - 1);
      
      // Log for debugging
      logNavigationState();
    }
  }, [navigationHistory, currentIndex, logNavigationState]);

  // Track location changes to update history
  useEffect(() => {
    if (!location?.pathname) return;
    
    // Skip if this navigation was triggered by our back/forward buttons
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }

    // Handle normal navigation (links, direct URL entry)
    if (navigationHistory.length > 0) {
      // Only process if path actually changed
      if (navigationHistory[currentIndex] !== location.pathname) {
        // If we navigated after using back button, trim the "future" history
        const newHistory = currentIndex < navigationHistory.length - 1
          ? navigationHistory.slice(0, currentIndex + 1)
          : [...navigationHistory];
        
        // Prevent adding duplicate consecutive entries
        if (newHistory[newHistory.length - 1] !== location.pathname) {
          newHistory.push(location.pathname);
          setNavigationHistory(newHistory);
          setCurrentIndex(newHistory.length - 1);
        }
      }
    }
  }, [location?.pathname, navigationHistory, currentIndex]);

  // Handle browser's native back/forward buttons
  useEffect(() => {
    if (!location?.pathname) return;
    
    const handlePopState = () => {
      if (location?.pathname) {
        const pathIndex = navigationHistory.indexOf(location.pathname);
        if (pathIndex >= 0 && pathIndex !== currentIndex) {
          setCurrentIndex(pathIndex);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationHistory, location?.pathname, currentIndex]);

  // Navigation functions
  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      isNavigatingRef.current = true;
      const prevPath = navigationHistory[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setLocation(prevPath);
    }
  }, [navigate, navigationHistory, currentIndex]);

  const goForward = useCallback(() => {
    if (currentIndex < navigationHistory.length - 1) {
      isNavigatingRef.current = true;
      const nextPath = navigationHistory[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setLocation(nextPath);
    }
  }, [navigate, navigationHistory, currentIndex]);

  const goHome = useCallback(() => {
    if (location?.pathname !== '/') {
      setLocation('/');
    }
  }, [navigate, location?.pathname]);

  // Get a friendly display name for the path
  const getPathDisplayName = useCallback((path: string | undefined): string => {
    if (!path) return 'Home';
    if (path === '/') return 'Home';
    
    // Handle special cases first
    if (path.startsWith('/new-weather-center')) return 'Weather Center';
    if (path.startsWith('/garage-vault')) return 'Garage Vault';
    if (path.startsWith('/manifestation-station')) return 'Manifestation Station';
    if (path.startsWith('/paddock-dashboard')) return 'Paddock Dashboard';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/my-juice-box')) return 'Juice Box';
    
    try {
      // Format other paths
      const baseName = path.substring(1).replace(/-/g, ' ');
      return baseName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      return 'Unknown Page';
    }
  }, []);

  // Current page name for display
  const currentPageName = getPathDisplayName(location?.pathname);

  return (
    <div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] flex justify-center pointer-events-auto"
      style={{ 
        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
        willChange: 'transform'
      }}
    >
      <div className="flex items-center space-x-2 px-4 py-2 bg-black/95 backdrop-blur-lg rounded-full border border-blue-900/50 shadow-xl">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
            canGoBack 
              ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50 active:scale-95' 
              : 'text-gray-600 opacity-50 cursor-not-allowed'
          }`}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="mx-1 h-5 w-px bg-blue-900/50"></div>
        
        <button
          onClick={goHome}
          className="w-10 h-10 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50 active:scale-95 transition-all duration-200"
          aria-label="Go to home page"
          title="Home"
        >
          <Home size={20} />
        </button>
        
        <div className="mx-1 h-5 w-px bg-blue-900/50"></div>
        
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
            canGoForward
              ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50 active:scale-95' 
              : 'text-gray-600 opacity-50 cursor-not-allowed'
          }`}
          aria-label="Go forward"
          title="Forward"
        >
          <ArrowRight size={20} />
        </button>
        
        <div className="ml-1 text-xs text-blue-400 font-medium hidden sm:block">
          {currentPageName}
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;