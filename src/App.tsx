/**
 * @fileoverview Root App component.
 *
 * Composes:
 *  - RouterProvider (createBrowserRouter) for navigation
 *  - Sonner <Toaster> at top-right for all toast notifications
 *  - useSecureSession() for production browser hardening
 *  - useTheme() to theme-sync the Toaster
 */
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from '@/router/AppRouter';
import { useTheme } from '@/hooks/useTheme';
import { useSecureSession } from '@/hooks/useSecureSession';

import { useAppSelector } from '@/hooks/useAppSelector';

/**
 * Inner component — must live inside ThemeProvider + Redux Provider
 * (already wrapped in main.tsx) to access hooks.
 */
const AppInner: React.FC = () => {
  const { isDark } = useTheme();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  
  // Production-only: blocks right-click & devtools shortcuts
  useSecureSession();

  // Safety fallback: dismiss the loading screen if no route component does it
  // (e.g. authenticated user redirected to /dashboard, or Login/Signup pages).
  // LandingPage handles its own dismissal via CSS onload — this just ensures
  // the overlay never gets stuck for non-landing routes.
  useEffect(() => {
    const isLandingPage = window.location.pathname === '/';
    const delay = (isLandingPage && !isAuthenticated) ? 2000 : 0;
    
    const timerId = setTimeout(() => {
      const loadingScreen = document.getElementById('app-loading-screen');
      if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.25s ease';
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 280);
      }
    }, delay);
    return () => clearTimeout(timerId);
  }, [isAuthenticated]);

  return (
    <React.Suspense fallback={<div className="rwp-lazy-loader">Loading...</div>}>
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
    </React.Suspense>
  );
};

export default function App(): React.ReactElement {
  return <AppInner />;
}