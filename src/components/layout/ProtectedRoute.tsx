import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { bypassOtpSuccess } from '@/features/auth/slices/authSlice';
import { ROUTES } from '@/Constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isOtpVerified = useAppSelector((s) => s.auth.isOtpVerified);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isOtpVerified) {
      dispatch(bypassOtpSuccess());
    }
  }, [isAuthenticated, isOtpVerified, dispatch]);

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isOtpVerified) {
    return null;
  }

  const isAthleteProfile = !!user?.isAthleteProfile;
  const isAthlete = user?.role === 'athlete';

  if (isOtpVerified && !isAthleteProfile && isAthlete) {
    if (location.pathname !== '/athlete-profile') {
      return <Navigate to="/athlete-profile" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
