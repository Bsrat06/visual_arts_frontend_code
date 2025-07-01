// src/hooks/use-debounce.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 *
 * @param value The value to debounce.
 * @param delay The delay in milliseconds for debouncing. Defaults to 500ms.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay?: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500); // Use provided delay or default to 500ms

    // Cleanup function: This runs if 'value' or 'delay' changes,
    // or if the component unmounts. It clears the previous timer
    // to prevent updating with an outdated value.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Re-run effect only if 'value' or 'delay' changes

  return debouncedValue;
}

// Export the hook for use in other components
export { useDebounce };