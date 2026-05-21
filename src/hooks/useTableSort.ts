import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export function useTableSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null && sortConfig.direction !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === bValue) return 0;
        
        // Handle dates and numbers inherently, fallback to strings
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        // Check if value is a valid date string (simple heuristic: includes "-" or "/" and parses)
        const dateA = Date.parse(aStr);
        const dateB = Date.parse(bStr);

        if (!isNaN(dateA) && !isNaN(dateB)) {
           return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

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
