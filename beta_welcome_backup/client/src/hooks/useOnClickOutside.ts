import { RefObject, useEffect } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

/**
 * Hook that handles click outside of the passed ref
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
  touchEvent: 'touchstart' | 'touchend' = 'touchstart'
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Attach event listeners
    document.addEventListener(mouseEvent, listener);
    document.addEventListener(touchEvent, listener);

    return () => {
      // Clean up event listeners
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener(touchEvent, listener);
    };
  }, [ref, handler, mouseEvent, touchEvent]);
}