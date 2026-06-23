import { useState, useMemo } from 'react';

/** Sort direction: ascending, descending, or cleared (null). */
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

/**
 * Generic table sort hook — ported directly from admin panel.
 *
 * Usage:
 *   const { items, requestSort, sortConfig } = useTableSort(rawData);
 *
 * Cycle: clicking a column goes asc → desc → null (unsorted).
 * Handles: strings, numbers, dates (ISO / common date strings).
 */
export function useTableSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig.key === null || sortConfig.direction === null) return sortableItems;

    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      // Null/undefined sorts to end
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      // Try date comparison first (e.g. "2024-01-15", "Jan 15 2024")
      const dateA = Date.parse(aStr);
      const dateB = Date.parse(bStr);
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Numeric comparison
      const numA = Number(aStr.replace(/[^0-9.-]/g, ''));
      const numB = Number(bStr.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numA) && !isNaN(numB) && aStr !== bStr) {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // Alphabetical fallback
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortableItems;
  }, [data, sortConfig]);

  /**
   * Toggle sort for a given key.
   * First click → asc, second → desc, third → null (back to original order).
   */
  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  return { items: sortedData, requestSort, sortConfig };
}
