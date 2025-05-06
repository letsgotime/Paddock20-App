import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  fallbackPath?: string; // Path to navigate to if there's no history
  label?: string; // Optional text label
  showLabel?: boolean; // Whether to show the label on mobile
  color?: 'default' | 'light' | 'dark' | 'primary'; // Different color variations
}

const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  fallbackPath = '/',
  label = 'Back',
  showLabel = true,
  color = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getColorClasses = () => {
    switch (color) {
      case 'light':
        return 'text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/70';
      case 'dark':
        return 'text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800';
      case 'primary':
        return 'text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-800/30';
      default:
        return 'text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/90';
    }
  };

  const handleGoBack = () => {
    // Check if we have history to go back to
    if (window.history.length > 1) {
      navigate(-1); // Go back one step in history
    } else {
      // Fallback to a specified path if no history
      navigate(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center justify-center rounded-lg transition-colors ${getColorClasses()} ${className}`}
    >
      <ChevronLeft className="h-5 w-5" />
      {showLabel && <span className="ml-1">{label}</span>}
    </button>
  );
};

export default BackButton;