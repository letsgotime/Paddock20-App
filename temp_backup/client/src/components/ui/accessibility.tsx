import React, { useEffect, useRef } from 'react';

// Create an accessible live region component for screen readers
export const AccessibilityAnnouncement: React.FC<{
  children: React.ReactNode;
  ariaLive?: 'polite' | 'assertive';
  role?: string;
}> = ({ 
  children, 
  ariaLive = 'polite', 
  role = 'status' 
}) => {
  return (
    <div
      className="sr-only"
      aria-live={ariaLive}
      role={role}
    >
      {children}
    </div>
  );
};

// Create a focus trap component
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}> = ({ children, isActive, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Focus the container
    containerRef.current.focus();

    // Handler for key events
    const handleKeyDown = (e: KeyboardEvent) => {
      // If Escape key is pressed
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }

      // Trap focus inside the container
      if (e.key === 'Tab') {
        const focusableElements = containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);

  return (
    <div ref={containerRef} tabIndex={-1} className="outline-none">
      {children}
    </div>
  );
};

// Create a skip link component for keyboard users to bypass navigation
export const SkipLink: React.FC<{
  targetId: string;
  text?: string;
}> = ({ 
  targetId, 
  text = 'Skip to main content' 
}) => {
  return (
    <a 
      href={`#${targetId}`} 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-black focus:text-blue-400 focus:font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
    >
      {text}
    </a>
  );
};