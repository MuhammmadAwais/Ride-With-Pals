/**
 * @fileoverview Security hook — hardens the browser in production builds.
 *
 * Protections (PROD only, dev is unaffected):
 *  - Disables right-click context menu.
 *  - Blocks common DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U).
 *
 * Call once in the App root (or a layout component).
 * All listeners are cleaned up on unmount.
 */
import { useEffect } from 'react';

export function useSecureSession(): void {
  useEffect(() => {
    // Only activate in production builds
    if (!import.meta.env.PROD) return;

    const handleContextMenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      const isF12        = e.key === 'F12';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && e.key === 'I';
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && e.key === 'J';
      const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key === 'C';
      const isCtrlU      = e.ctrlKey && e.key === 'u';

      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
