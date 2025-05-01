import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const HISTORY_KEY = 'paddock20_navigation_history';
const CURRENT_INDEX_KEY = 'paddock20_navigation_index';

const NavigationControls: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  // Flag to track router-triggered navigation vs button navigation
  const isNavigatingProgrammatically = useRef(false);
  
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    // Load history from sessionStorage on initial load
    try {
      const savedHistory = sessionStorage.getItem(HISTORY_KEY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error('Error loading navigation history:', e);
      return [];
    }
  });
  
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Load current index from sessionStorage on initial load
    try {
      const savedIndex = sessionStorage.getItem(CURRENT_INDEX_KEY);
      return savedIndex ? parseInt(savedIndex, 10) : -1;
    } catch (e) {
      console.error('Error loading navigation index:', e);
      return -1;
    }
  });

  // Debug function for development
  const logNavigationState = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation State:', {
        currentPath: location?.pathname,
        history: navigationHistory,
        currentIndex,
        canGoBack,
        canGoForward,
      });
    }
  };
  
  // Initialize history with current location if empty
  useEffect(() => {
    // If location is valid and history is empty, initialize it
    if (location && location.pathname && navigationHistory.length === 0) {
      setNavigationHistory([location.pathname]);
      setCurrentIndex(0);
    }
  }, [location, navigationHistory.length]);

  // Save navigation state to sessionStorage when it changes
  useEffect(() => {
    if (navigationHistory.length > 0) {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(navigationHistory));
      sessionStorage.setItem(CURRENT_INDEX_KEY, currentIndex.toString());
      
      // Update navigation control states
      setCanGoBack(currentIndex > 0);
      setCanGoForward(currentIndex < navigationHistory.length - 1);
      
      logNavigationState();
    }
  }, [navigationHistory, currentIndex]);

  // Track navigation history
  useEffect(() => {
    // Guard against undefined location
    if (!location || !location.pathname) return;
    
    // Skip history updates for programmatic back/forward clicks
    if (isNavigatingProgrammatically.current) {
      isNavigatingProgrammatically.current = false;
      return;
    }
    
    // Only update if we have a valid history and the path has changed
    if (navigationHistory.length > 0) {
      if (navigationHistory[currentIndex] !== location.pathname) {
        // If we manually clicked a link or otherwise navigated after using back/forward buttons
        // trim the "future" history
        const newHistory = currentIndex < navigationHistory.length - 1
          ? navigationHistory.slice(0, currentIndex + 1)
          : [...navigationHistory];
        
        // Prevent duplicate consecutive entries
        if (newHistory[newHistory.length - 1] !== location.pathname) {
          // Add the new path to history
          newHistory.push(location.pathname);
          setNavigationHistory(newHistory);
          setCurrentIndex(newHistory.length - 1);
        }
      }
    }
  }, [location?.pathname, navigationHistory, currentIndex]);

  // Handle browser forward/back buttons
  useEffect(() => {
    // Skip if location isn't available yet
    if (!location || !location.pathname) return;
    
    const handlePopState = () => {
      // Safely check if pathname exists and is in history
      if (location?.pathname) {
        const pathIndex = navigationHistory.indexOf(location.pathname);
        if (pathIndex >= 0) {
          setCurrentIndex(pathIndex);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationHistory, location?.pathname]);

  const goBack = () => {
    if (canGoBack && currentIndex > 0) {
      isNavigatingProgrammatically.current = true;
      const prevPath = navigationHistory[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      navigate(prevPath);
    }
  };

  const goForward = () => {
    if (canGoForward && currentIndex < navigationHistory.length - 1) {
      isNavigatingProgrammatically.current = true;
      const nextPath = navigationHistory[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      navigate(nextPath);
    }
  };

  const goHome = () => {
    // Add home to history only if we're not already there and location is valid
    if (location?.pathname && location.pathname !== '/') {
      // Do not set isNavigatingProgrammatically flag here
      // as we want to add a new history entry for the home path
      navigate('/');
    }
  };

  // Get a friendly name for the current path
  const getPathDisplayName = (path: string | undefined): string => {
    // Handle undefined or null path
    if (!path) return 'Home';
    
    // Handle root path
    if (path === '/') return 'Home';
    
    // Handle special cases - check these first
    if (path.startsWith('/new-weather-center')) return 'Weather Center';
    if (path.startsWith('/garage-vault')) return 'Garage Vault';
    if (path.startsWith('/manifestation-station')) return 'Manifestation Station';
    
    try {
      // Remove leading slash and convert hyphens to spaces
      const baseName = path.substring(1).replace(/-/g, ' ');
      
      // Capitalize each word
      return baseName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (error) {
      console.error('Error formatting path name:', error);
      return 'Unknown Page';
    }
  };

  // Safely get the current page name
  const currentPageName = location?.pathname ? getPathDisplayName(location.pathname) : 'Home';
  
  // Previous and next page names
  const prevPageName = canGoBack && navigationHistory[currentIndex - 1] 
    ? getPathDisplayName(navigationHistory[currentIndex - 1]) 
    : '';
    
  const nextPageName = canGoForward && navigationHistory[currentIndex + 1] 
    ? getPathDisplayName(navigationHistory[currentIndex + 1]) 
    : '';

  return (
    <div className="fixed top-0 left-0 z-40 w-full flex justify-center pb-1 pt-2 bg-gradient-to-b from-black to-transparent">
      <div className="flex items-center space-x-2 px-3 py-1 bg-black/90 backdrop-blur rounded-full border border-blue-900/30 shadow-lg">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            canGoBack 
              ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label={canGoBack ? `Go back to ${prevPageName}` : "Can't go back"}
          title={canGoBack ? `Back to ${prevPageName}` : ""}
        >
          <ArrowLeft size={19} />
        </button>
        
        <div className="mx-0.5 h-5 w-px bg-blue-900/40"></div>
        
        <button
          onClick={goHome}
          className="w-9 h-9 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50 transition-all"
          aria-label="Go to home page"
          title="Go to home page"
        >
          <Home size={19} />
        </button>
        
        <div className="mx-0.5 h-5 w-px bg-blue-900/40"></div>
        
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            canGoForward 
              ? 'text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label={canGoForward ? `Go forward to ${nextPageName}` : "Can't go forward"}
          title={canGoForward ? `Forward to ${nextPageName}` : ""}
        >
          <ArrowRight size={19} />
        </button>
        
        <div className="hidden md:block mx-2 text-xs text-blue-400 opacity-60 font-semibold">
          {currentPageName}
        </div>
      </div>
    </div>
  );
};

export default NavigationControls;