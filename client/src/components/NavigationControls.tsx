import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const HISTORY_KEY = 'paddock20_navigation_history';
const CURRENT_INDEX_KEY = 'paddock20_navigation_index';

const NavigationControls: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
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

  // Initialize history with current location if empty
  useEffect(() => {
    if (navigationHistory.length === 0) {
      setNavigationHistory([location.pathname]);
      setCurrentIndex(0);
    }
  }, []);

  // Save navigation state to sessionStorage when it changes
  useEffect(() => {
    if (navigationHistory.length > 0) {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(navigationHistory));
      sessionStorage.setItem(CURRENT_INDEX_KEY, currentIndex.toString());
    }
  }, [navigationHistory, currentIndex]);

  // Track navigation history
  useEffect(() => {
    // Only update if we have a valid history and the path has changed
    if (navigationHistory.length > 0 && navigationHistory[currentIndex] !== location.pathname) {
      // If we navigated forward/back and then clicked a link, trim the "future" history
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
  }, [location.pathname]);

  // Update back/forward button states
  useEffect(() => {
    setCanGoBack(currentIndex > 0);
    setCanGoForward(currentIndex < navigationHistory.length - 1);
  }, [currentIndex, navigationHistory]);

  // Handle browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathIndex = navigationHistory.indexOf(location.pathname);
      if (pathIndex >= 0) {
        setCurrentIndex(pathIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigationHistory, location.pathname]);

  const goBack = () => {
    if (canGoBack) {
      const prevPath = navigationHistory[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      navigate(prevPath);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const nextPath = navigationHistory[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      navigate(nextPath);
    }
  };

  const goHome = () => {
    // Add home to history only if we're not already there
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Get a friendly name for the current path
  const getPathDisplayName = (path: string): string => {
    if (path === '/') return 'Home';
    
    // Remove leading slash and convert hyphens to spaces
    const baseName = path.substring(1).replace(/-/g, ' ');
    
    // Handle special cases
    if (path.startsWith('/new-weather-center')) return 'Weather Center';
    if (path.startsWith('/garage-vault')) return 'Garage Vault';
    if (path.startsWith('/manifestation-station')) return 'Manifestation Station';
    
    // Capitalize each word
    return baseName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const currentPageName = getPathDisplayName(location.pathname);
  
  // Previous and next page names
  const prevPageName = canGoBack ? getPathDisplayName(navigationHistory[currentIndex - 1]) : '';
  const nextPageName = canGoForward ? getPathDisplayName(navigationHistory[currentIndex + 1]) : '';

  return (
    <div className="fixed top-16 left-0 z-40 w-full flex justify-center pb-1 pt-2 bg-gradient-to-b from-black to-transparent">
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