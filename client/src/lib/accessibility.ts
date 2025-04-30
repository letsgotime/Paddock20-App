// Centralized accessibility constants

// Main content ID for skip navigation
export const MAIN_CONTENT_ID = 'main-content';

// ARIA live region IDs
export const ANNOUNCEMENTS_ID = 'announcements';
export const ALERTS_ID = 'alerts';

// Screen reader only class (placed in CSS)
export const SR_ONLY_CLASS = 'sr-only';

// Focus management utility
export function focusElement(selector: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
    return true;
  }
  return false;
}

// Announcement utility for screen readers
export function announce(message: string, polite: boolean = true) {
  const announcer = document.getElementById(polite ? ANNOUNCEMENTS_ID : ALERTS_ID);
  if (announcer) {
    announcer.textContent = message;
    return true;
  }
  return false;
}