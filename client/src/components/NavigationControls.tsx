import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationControls: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Track navigation history
  useEffect(() => {
    // Check if the path is already the last item in our history
    if (navigationHistory[currentIndex] !== location.pathname) {
      // If we navigated forward/back and clicked a link, trim the "future" history
      const newHistory = currentIndex < navigationHistory.length - 1
        ? navigationHistory.slice(0, currentIndex + 1)
        : [...navigationHistory];
      
      // Add the new path to history
      newHistory.push(location.pathname);
      setNavigationHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
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
    navigate('/');
  };

  return (
    <div className="fixed top-16 left-0 z-40 w-full flex justify-center pb-1 pt-2 bg-gradient-to-b from-black to-transparent">
      <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-900/90 backdrop-blur rounded-full border border-zinc-800 shadow-lg">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            canGoBack 
              ? 'text-blue-400 hover:bg-blue-900/30 active:bg-blue-900/50' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        
        <button
          onClick={goHome}
          className="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-900/30 active:bg-blue-900/50"
          aria-label="Go to home page"
        >
          <Home size={18} />
        </button>
        
        <button
          onClick={goForward}
          disabled={!canGoForward}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            canGoForward 
              ? 'text-blue-400 hover:bg-blue-900/30 active:bg-blue-900/50' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Go forward"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;