/**
 * Accessibility Utilities for GoTime Motorsports
 * 
 * This module provides helper functions and constants to support
 * ADA compliance throughout the application.
 */

// Skip link destination - used for keyboard navigation to skip to main content
export const MAIN_CONTENT_ID = 'main-content';

// Ensures consistent ARIA labeling across components
export const ARIA_LABELS = {
  // Navigation
  MAIN_NAV: 'Main navigation',
  MOBILE_NAV: 'Mobile navigation',
  SKIP_LINK: 'Skip to main content',
  DROPDOWN_TRIGGER: 'Expand dropdown menu',
  CLOSE_MENU: 'Close menu',
  
  // Weather components
  WEATHER_REPORT: 'Current weather report',
  FORECAST_REPORT: 'Weather forecast',
  DRIVING_CONDITIONS: 'Driving conditions assessment',
  ZIP_SEARCH: 'Search weather by ZIP code',
  
  // Vehicle related
  VEHICLE_SELECTOR: 'Select vehicle',
  SERVICE_HISTORY: 'Vehicle service history',
  ADD_VEHICLE: 'Add a new vehicle',
  
  // Checklists 
  TOGGLE_ITEM: (itemName: string) => `Toggle completion status of ${itemName}`,
  
  // Forms
  FORM_ERROR: 'Error in form submission',
  FORM_SUCCESS: 'Form submitted successfully',
  REQUIRED_FIELD: 'Required field',
  
  // Juice Box components
  PRODUCT_SELECTOR: 'Product selection',
  VIDEO_PLAYER: 'Tutorial video player',
};

// Role definitions for custom components
export const ROLES = {
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  BUTTON: 'button',
  DIALOG: 'dialog',
  NAVIGATION: 'navigation',
  SEARCH: 'search',
  STATUS: 'status',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
};

// Focus state management - use for components that need to trap focus
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.focusableElements = this.getFocusableElements();
    this.updateBoundaryElements();
  }
  
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const elements = this.element.querySelectorAll(focusableSelectors);
    return Array.from(elements) as HTMLElement[];
  }
  
  private updateBoundaryElements(): void {
    if (this.focusableElements.length) {
      this.firstFocusableElement = this.focusableElements[0];
      this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
    }
  }
  
  enable(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }
  
  disable(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    
    if (!this.firstFocusableElement || !this.lastFocusableElement) return;
    
    // Handle TAB and SHIFT+TAB to trap focus
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusableElement) {
        this.lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusableElement) {
        this.firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  };
}

// Screen reader announcements
export class LiveRegion {
  private element: HTMLElement;
  
  constructor(ariaLive: 'polite' | 'assertive' = 'polite') {
    this.element = document.createElement('div');
    this.element.setAttribute('aria-live', ariaLive);
    this.element.setAttribute('aria-atomic', 'true');
    this.element.classList.add('sr-only'); // Screen reader only
    document.body.appendChild(this.element);
  }
  
  announce(message: string): void {
    this.element.textContent = '';
    // Small delay to ensure screen readers catch the change
    setTimeout(() => {
      this.element.textContent = message;
    }, 50);
  }
  
  clear(): void {
    this.element.textContent = '';
  }
  
  remove(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Keyboard helpers
export const KEYS = {
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  END: 'End',
  HOME: 'Home',
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
};

// Helper for handling keyboard navigation in custom components
export function handleKeyboardEvent(
  event: React.KeyboardEvent,
  actions: {
    [key: string]: (event: React.KeyboardEvent) => void;
  }
): void {
  const handler = actions[event.key];
  if (handler) {
    handler(event);
  }
}

// Get a descriptive text for screen readers based on weather data
export function getWeatherDescription(weatherData: any): string {
  if (!weatherData) return 'Weather data not available';
  
  let description = `Weather in ${weatherData.name}. `;
  
  if (weatherData.weather && weatherData.weather.length > 0) {
    description += `Conditions: ${weatherData.weather[0].description}. `;
  }
  
  if (weatherData.main) {
    description += `Temperature: ${Math.round(weatherData.main.temp)}°F, `;
    description += `feels like ${Math.round(weatherData.main.feels_like)}°F. `;
    description += `Humidity: ${weatherData.main.humidity}%. `;
  }
  
  if (weatherData.wind) {
    description += `Wind: ${Math.round(weatherData.wind.speed)} miles per hour. `;
  }
  
  return description;
}

// CSS class to visually hide content but keep it accessible to screen readers
export const SR_ONLY_CLASS = 'sr-only';

// Generate a unique ID for accessibility attributes
export function generateAccessibleId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}