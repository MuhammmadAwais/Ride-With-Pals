/**
 * @fileoverview ProtectedRoute guard.
 *
 * Reads Redux auth.isAuthenticated.
 * If false → redirects to /login and saves the intended destination in
 * router state (state.from) so Login can redirect back after auth.
 *
 * Usage: wrap any route element that requires authentication.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/Constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
