/**
 * Accessibility utility functions to enhance UI components with proper ARIA attributes
 */

// Add proper ARIA attributes to interactive elements
export function makeAccessible(element, role, label) {
  const ariaAttributes = {
    role: role || element.role,
    'aria-label': label || element['aria-label'],
  };
  
  return { ...element, ...ariaAttributes };
}

// Ensure proper focus management for modal dialogs
export function trapFocus(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Store the element that had focus before opening the modal
  const previouslyFocused = document.activeElement;
  
  // Find all focusable elements within the modal
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Focus the first element
  firstElement.focus();
  
  // Handle tab key navigation to trap focus
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    
    // Allow escape key to close the modal
    if (e.key === 'Escape') {
      closeModal(elementId, previouslyFocused);
    }
  });
  
  return previouslyFocused;
}

// Close modal and restore focus
export function closeModal(elementId, elementToFocus) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.style.display = 'none';
  
  // Restore focus to the element that had focus before opening the modal
  if (elementToFocus && typeof elementToFocus.focus === 'function') {
    elementToFocus.focus();
  }
}

// Announce messages to screen readers
export function announceToScreenReader(message) {
  // Create or get the aria-live region
  let ariaLiveRegion = document.getElementById('aria-live-announcer');
  
  if (!ariaLiveRegion) {
    ariaLiveRegion = document.createElement('div');
    ariaLiveRegion.id = 'aria-live-announcer';
    ariaLiveRegion.className = 'sr-only';
    ariaLiveRegion.setAttribute('aria-live', 'polite');
    ariaLiveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(ariaLiveRegion);
  }
  
  // Set the message to be announced
  ariaLiveRegion.textContent = message;
}