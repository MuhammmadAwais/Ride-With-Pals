import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes safely, resolving conflicts (e.g., px-2 + px-4 → px-4).
 * Mirrors admin panel utility — use everywhere instead of string concatenation.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
