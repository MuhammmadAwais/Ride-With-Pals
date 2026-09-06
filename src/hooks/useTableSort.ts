import { useState, useMemo } from 'react';

/** Sort direction: ascending, descending, or cleared (null). */
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

/**
 * Generic table sort hook — handles strings, numbers, dates, and empty fallbacks.
 *
 * Usage:
 *   const { items, requestSort, sortConfig } = useTableSort(rawData);
 *
 * Cycle: clicking a column goes asc → desc → null (unsorted).
 */
export function useTableSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig.key === null || sortConfig.direction === null) return sortableItems;

    const isAsc = sortConfig.direction === 'asc';

    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      // Null, undefined, or placeholder values ("—", "-", "N/A", "null", "") always sort to the bottom
      const isNullOrEmpty = (v: unknown) => 
        v == null || v === '' || v === '—' || v === '-' || v === 'N/A' || v === 'null' || v === 'undefined';
      const aEmpty = isNullOrEmpty(aValue);
      const bEmpty = isNullOrEmpty(bValue);

      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      // Pure numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }

      // Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        return isAsc ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }

      const aStr = String(aValue).trim();
      const bStr = String(bValue).trim();

      // Check if both strings are date-like
      const isDateLike = (s: string) => 
        /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(s) || 
        /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(s) || 
        /^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}/.test(s);

      if (isDateLike(aStr) && isDateLike(bStr)) {
        const dateA = Date.parse(aStr);
        const dateB = Date.parse(bStr);
        if (!isNaN(dateA) && !isNaN(dateB)) {
          return isAsc ? dateA - dateB : dateB - dateA;
        }
      }

      // Check if both strings are numeric (e.g. numbers or formatted currency)
      const cleanA = aStr.replace(/[^0-9.-]/g, '');
      const cleanB = bStr.replace(/[^0-9.-]/g, '');
      const isPureNumericA = cleanA !== '' && /^\+?[\d\s().-]+$/.test(aStr);
      const isPureNumericB = cleanB !== '' && /^\+?[\d\s().-]+$/.test(bStr);

      if (isPureNumericA && isPureNumericB) {
        const numA = Number(cleanA);
        const numB = Number(cleanB);
        if (!isNaN(numA) && !isNaN(numB) && cleanA !== cleanB) {
          return isAsc ? numA - numB : numB - numA;
        }
      }

      // Natural Alphabetical string comparison
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
      return isAsc ? cmp : -cmp;
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
