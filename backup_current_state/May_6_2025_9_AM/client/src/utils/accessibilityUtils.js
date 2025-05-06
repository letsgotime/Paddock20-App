/**
 * Accessibility utility functions to help with ARIA attributes
 * and keyboard navigation compliance
 */

/**
 * Creates a visually hidden element that is still 
 * accessible to screen readers
 * @param {string} text - Text to be hidden visually but read by screen readers
 * @returns {Object} - CSS properties for the element
 */
export const visuallyHidden = (text) => ({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  width: '1px',
  whiteSpace: 'nowrap',
});

/**
 * Handles keyboard navigation for interactive elements
 * @param {Event} event - The keyboard event
 * @param {Function} callback - Function to call when Enter or Space is pressed
 */
export const handleKeyboardActivation = (event, callback) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback(event);
  }
};

/**
 * Creates an accessible announcement for screen readers
 * @param {string} message - The message to be announced
 * @param {string} politeness - The ARIA live politeness setting (polite or assertive)
 */
export const announceToScreenReader = (message, politeness = 'polite') => {
  // Find or create an aria-live region
  let announcer = document.getElementById('screen-reader-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', politeness);
    announcer.setAttribute('aria-atomic', 'true');
    Object.assign(announcer.style, visuallyHidden());
    document.body.appendChild(announcer);
  }
  
  // Set the message
  announcer.textContent = message;
  
  // Clear it after a delay to avoid multiple readings
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
};

/**
 * Helper function for creating an accessible modal
 * @param {string} modalId - The ID of the modal
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Function to close the modal
 * @returns {Object} - ARIA attributes for the modal
 */
export const modalAttributes = (modalId, isOpen, onClose) => ({
  'aria-modal': true,
  role: 'dialog',
  'aria-labelledby': `${modalId}-title`,
  'aria-describedby': `${modalId}-description`,
  tabIndex: -1,
  onKeyDown: (e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }
});

export default {
  visuallyHidden,
  handleKeyboardActivation,
  announceToScreenReader,
  modalAttributes
};