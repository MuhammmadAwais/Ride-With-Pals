/**
 * @fileoverview Root App component.
 *
 * Composes:
 *  - RouterProvider (createBrowserRouter) for navigation
 *  - Sonner <Toaster> at top-right for all toast notifications
 *  - useSecureSession() for production browser hardening
 *  - useTheme() to theme-sync the Toaster
 */
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router/AppRouter';
import { useTheme } from '@/hooks/useTheme';
import { useSecureSession } from '@/hooks/useSecureSession';

/**
 * Inner component — must live inside ThemeProvider + Redux Provider
 * (already wrapped in main.tsx) to access hooks.
 */
const AppInner: React.FC = () => {
  const { isDark } = useTheme();
  // Production-only: blocks right-click & devtools shortcuts
  useSecureSession();

  return (
    <>
      <RouterProvider router={router} />
      {/* Top-right toast notifications for all success/error feedback */}
      <Toaster
        position="top-right"
        richColors
        theme={isDark ? 'dark' : 'light'}
        toastOptions={{
          style: { fontFamily: 'Roboto, sans-serif' },
        }}
      />
    </>
  );
};

export default function App(): React.ReactElement {
  return <AppInner />;
}