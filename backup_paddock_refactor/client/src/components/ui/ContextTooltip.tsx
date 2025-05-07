import React, { useState, useRef, ReactNode } from 'react';
import { Info, XCircle } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface ContextTooltipProps {
  title?: string;
  content: string | ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  isDismissable?: boolean;
  isPersistent?: boolean;
  variant?: 'default' | 'info' | 'warning' | 'success' | 'f1' | 'motorsport';
  className?: string;
  triggerClassName?: string;
  children?: ReactNode;
  maxWidth?: string;
  showOnMount?: boolean;
}

const ContextTooltip: React.FC<ContextTooltipProps> = ({
  title,
  content,
  position = 'top',
  isDismissable = false,
  isPersistent = false,
  variant = 'default',
  className = '',
  triggerClassName = '',
  children,
  maxWidth = '300px',
  showOnMount = false,
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isDismissed, setIsDismissed] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside of the tooltip to close it if not persistent
  useOnClickOutside(tooltipRef, () => {
    if (!isPersistent) {
      setIsVisible(false);
    }
  });
  
  // Determine variant styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-900/90 border-blue-600';
      case 'warning':
        return 'bg-amber-900/90 border-amber-600';
      case 'success':
        return 'bg-green-900/90 border-green-600';
      case 'f1':
        return 'bg-[#15151e]/95 border-[#e10600]';
      case 'motorsport':
        return 'bg-black/95 border-[#08c519]';
      default:
        return 'bg-gray-900/90 border-gray-600';
    }
  };
  
  // Determine position styling
  const getPositionStyles = () => {
    switch (position) {
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };
  
  // If dismissed, don't show the tooltip at all
  if (isDismissed) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative inline-block">
      {/* Tooltip trigger */}
      <div 
        className={`cursor-help inline-flex items-center ${triggerClassName}`}
        onMouseEnter={() => !isPersistent && setIsVisible(true)}
        onMouseLeave={() => !isPersistent && setIsVisible(false)}
        onClick={() => isPersistent && setIsVisible(!isVisible)}
      >
        {children || (
          <Info 
            className={`h-5 w-5 ${variant === 'f1' ? 'text-[#e10600]' : variant === 'motorsport' ? 'text-[#08c519]' : 'text-blue-500'}`}
          />
        )}
      </div>
      
      {/* Tooltip content */}
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-[1000] ${getPositionStyles()} ${getVariantStyles()} p-2 rounded-md shadow-lg border text-white text-sm min-w-[200px] max-w-[${maxWidth}] ${className}`}
          role="tooltip"
        >
          {/* Title bar with dismiss button */}
          {(title || isDismissable) && (
            <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/20">
              {title && <div className="font-semibold">{title}</div>}
              {isDismissable && (
                <button 
                  onClick={() => setIsDismissed(true)}
                  className="text-white/80 hover:text-white"
                  aria-label="Dismiss tooltip"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="text-sm">{content}</div>
          
          {/* Arrow pointing to the trigger */}
          <div 
            className={`absolute w-2 h-2 ${getVariantStyles()} transform rotate-45
              ${position === 'top' ? 'top-full -translate-x-1/2 -mt-1 left-1/2' : 
                position === 'right' ? 'right-full -translate-y-1/2 -mr-1 top-1/2' : 
                position === 'bottom' ? 'bottom-full -translate-x-1/2 -mb-1 left-1/2' : 
                'left-full -translate-y-1/2 -ml-1 top-1/2'}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ContextTooltip;