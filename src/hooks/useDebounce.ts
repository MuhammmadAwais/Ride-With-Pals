import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay (ms).
 * Useful for search inputs — prevents firing an action on every keystroke.
 *
 * @example
 *   const debouncedSearch = useDebounce(searchQuery, 300);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
